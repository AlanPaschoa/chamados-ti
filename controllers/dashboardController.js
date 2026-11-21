const { Op } = require('sequelize');
const { Ticket, Technician, Category } = require('../models');
const { STATUS, PRIORIDADES, STATUS_ATIVOS } = require('../config/constants');

exports.index = async (req, res) => {
  // Usuário comum só enxerga números dos próprios chamados
  const restrito = req.user.perfil === 'user' ? { autorUid: req.user.uid } : {};
  const w = (extra = {}) => ({ ...extra, ...restrito });
  const whereNosTickets = req.user.perfil === 'user' ? { where: restrito } : {};

  // Contagem por status
  const porStatus = {};
  for (const s of Object.keys(STATUS)) {
    porStatus[s] = await Ticket.count({ where: w({ status: s }) });
  }
  const total = Object.values(porStatus).reduce((a, b) => a + b, 0);
  const ativos = STATUS_ATIVOS.reduce((acc, s) => acc + porStatus[s], 0);

  // Chamados ativos por prioridade
  const porPrioridade = {};
  for (const p of Object.keys(PRIORIDADES)) {
    porPrioridade[p] = await Ticket.count({
      where: w({ prioridade: p, status: { [Op.in]: STATUS_ATIVOS } }),
    });
  }

  const include = [
    { model: Category, as: 'categoria' },
    { model: Technician, as: 'tecnico' },
  ];

  // Fila prioritária: crítica/alta ainda em aberto, mais antigos primeiro
  const prioritarios = await Ticket.findAll({
    where: w({ prioridade: { [Op.in]: ['critica', 'alta'] }, status: { [Op.in]: STATUS_ATIVOS } }),
    include,
    order: [['createdAt', 'ASC']],
    limit: 5,
  });

  const recentes = await Ticket.findAll({ where: w(), include, order: [['createdAt', 'DESC']], limit: 6 });

  const semTecnico = await Ticket.count({
    where: w({ technicianId: null, status: { [Op.in]: STATUS_ATIVOS } }),
  });

  // Carga de trabalho por técnico
  const tecnicosRaw = await Technician.findAll({
    where: { ativo: true },
    include: [{ model: Ticket, as: 'tickets', attributes: ['id', 'status'], required: false, ...whereNosTickets }],
    order: [['nome', 'ASC']],
  });
  const tecnicos = tecnicosRaw
    .map((t) => ({
      nome: t.nome,
      iniciais: t.iniciais,
      ativos: t.tickets.filter((x) => STATUS_ATIVOS.includes(x.status)).length,
      resolvidos: t.tickets.filter((x) => !STATUS_ATIVOS.includes(x.status)).length,
    }))
    .sort((a, b) => b.ativos - a.ativos);

  // Distribuição por categoria
  const categoriasRaw = await Category.findAll({
    include: [{ model: Ticket, as: 'tickets', attributes: ['id'], required: false, ...whereNosTickets }],
  });
  const categorias = categoriasRaw
    .map((c) => ({ nome: c.nome, cor: c.cor, total: c.tickets.length }))
    .sort((a, b) => b.total - a.total);

  // Tempo médio de resolução (horas)
  const resolvidos = await Ticket.findAll({
    where: w({ resolvidoEm: { [Op.ne]: null } }),
    attributes: ['createdAt', 'resolvidoEm'],
  });
  const tempoMedio = resolvidos.length
    ? resolvidos.reduce((acc, t) => acc + (t.resolvidoEm - t.createdAt), 0) / resolvidos.length / 36e5
    : null;

  res.render('dashboard', {
    title: 'Dashboard',
    total,
    ativos,
    porStatus,
    porPrioridade,
    prioritarios,
    recentes,
    semTecnico,
    tecnicos,
    categorias,
    tempoMedio,
  });
};