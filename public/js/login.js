import { auth, db } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const $ = (id) => document.getElementById(id);

const ERROS = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/email-already-in-use': 'Este e-mail já está em uso.',
  'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
  'auth/popup-closed-by-user': 'A janela de login do Google foi fechada.',
  'auth/cancelled-popup-request': 'A janela de login do Google foi fechada.',
  'auth/popup-blocked': 'O navegador bloqueou o pop-up. Libere e tente de novo.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente novamente.',
  'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
};

function mostrarMensagem(texto) {
  const el = $('msg');
  el.textContent = texto;
  el.style.display = 'block';
}

function mostrarErro(err) {
  console.error(err);
  mostrarMensagem(ERROS[err.code] || 'Não foi possível concluir. Tente novamente.');
}

// Regra de primeiro acesso: grava em "usuarios" com perfil "user" se ainda não existir.
async function garantirUsuario(user, nomeDigitado) {
  const ref = doc(db, 'usuarios', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      nome: user.displayName || nomeDigitado || user.email.split('@')[0],
      email: user.email,
      perfil: 'user',
      criadoEm: serverTimestamp(),
    });
  }
}

// Entrega o token ao servidor, que cria o cookie de sessão.
async function abrirSessao(user) {
  const idToken = await user.getIdToken();
  const resp = await fetch('/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!resp.ok) throw new Error('Falha ao abrir sessão no servidor');
  window.location.href = '/';
}

$('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const { user } = await signInWithEmailAndPassword(auth, $('email').value.trim(), $('senha').value);
    await garantirUsuario(user);
    await abrirSessao(user);
  } catch (err) { mostrarErro(err); }
});

$('btn-criar').addEventListener('click', async () => {
  const nome = $('nome').value.trim();
  if (!nome) {
    mostrarMensagem('Informe seu nome para criar a conta.');
    return;
  }
  try {
    const { user } = await createUserWithEmailAndPassword(auth, $('email').value.trim(), $('senha').value);
    await updateProfile(user, { displayName: nome });
    await garantirUsuario(user, nome);
    await abrirSessao(user);
  } catch (err) { mostrarErro(err); }
});

$('btn-google').addEventListener('click', async () => {
  try {
    const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
    await garantirUsuario(user);
    await abrirSessao(user);
  } catch (err) { mostrarErro(err); }
});