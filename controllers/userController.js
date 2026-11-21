const { db } = require('../config/firebaseAdmin');
const { PERFIS } = require('../middlewares/auth');

// GET /users
exports.index = async (req, res) => {
  const snap = await db.collection('usuarios').get();
  const usuarios = snap.docs
    .map((d) => d.data())
    .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
  res.render('users/index', { title: 'Gestão de Usuários', usuarios, PERFIS });
};

// PATCH /users/:uid/perfil
exports.updatePerfil = async (req, res) => {
  const { uid } = req.params;
  const { perfil } = req.body;

  if (!PERFIS.includes(perfil)) {
    return res.redirect(`/users?erro=${encodeURIComponent('Perfil inválido.')}`);
  }
  if (uid === req.user.uid) {
    return res.redirect(`/users?erro=${encodeURIComponent('Você não pode alterar o seu próprio perfil.')}`);
  }

  await db.collection('usuarios').doc(uid).update({ perfil });
  res.redirect(`/users?msg=${encodeURIComponent('Perfil atualizado.')}`);
};