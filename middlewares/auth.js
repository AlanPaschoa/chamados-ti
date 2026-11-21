const { auth, db } = require('../config/firebaseAdmin');

const COOKIE = 'session';
const PERFIS = ['user', 'tecnico', 'admin'];

// Descobre quem está logado (cookie -> uid -> perfil no Firestore).
async function carregarUsuario(req, res, next) {
  req.user = null;
  const cookie = req.cookies && req.cookies[COOKIE];

  if (cookie) {
    try {
      const decoded = await auth.verifySessionCookie(cookie, true);
      const ref = db.collection('usuarios').doc(decoded.uid);
      let snap = await ref.get();

      // Regra de primeiro acesso (reserva): cria com perfil "user" se não existir.
      if (!snap.exists) {
        await ref.set({
          uid: decoded.uid,
          nome: decoded.name || (decoded.email || '').split('@')[0],
          email: decoded.email || '',
          perfil: 'user',
        });
        snap = await ref.get();
      }

      const d = snap.data();
      req.user = {
        uid: decoded.uid,
        nome: d.nome || decoded.name || d.email,
        email: d.email || decoded.email,
        perfil: PERFIS.includes(d.perfil) ? d.perfil : 'user',
      };
    } catch (err) {
      res.clearCookie(COOKIE); // cookie expirado ou inválido
    }
  }

  res.locals.user = req.user; // disponível em todas as views EJS
  next();
}

// Exige estar logado.
function requireAuth(req, res, next) {
  if (!req.user) return res.redirect('/login');
  next();
}

// Exige um dos perfis informados. Ex.: requireRole('tecnico', 'admin')
function requireRole(...perfis) {
  return (req, res, next) => {
    if (!req.user) return res.redirect('/login');
    if (!perfis.includes(req.user.perfil)) {
      return res.status(403).render('error', {
        title: 'Acesso negado',
        error: new Error('Você não tem permissão para acessar este recurso.'),
      });
    }
    next();
  };
}

module.exports = { carregarUsuario, requireAuth, requireRole, COOKIE, PERFIS };