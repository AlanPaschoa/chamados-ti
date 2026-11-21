const express = require('express');
const { auth } = require('../config/firebaseAdmin');
const { COOKIE } = require('../middlewares/auth');

const router = express.Router();
const CINCO_DIAS = 5 * 24 * 60 * 60 * 1000;

// Tela de login (se já estiver logado, vai para a página principal)
router.get('/login', (req, res) => {
  if (req.user) return res.redirect('/');
  res.render('login');
});

// O navegador envia o idToken do Firebase; o servidor valida e cria o cookie de sessão.
router.post('/auth/session', async (req, res) => {
  try {
    const { idToken } = req.body;
    await auth.verifyIdToken(idToken);
    const cookie = await auth.createSessionCookie(idToken, { expiresIn: CINCO_DIAS });
    res.cookie(COOKIE, cookie, {
      maxAge: CINCO_DIAS,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(401).json({ ok: false });
  }
});

router.post('/auth/logout', (req, res) => {
  res.clearCookie(COOKIE);
  res.json({ ok: true });
});

module.exports = router;