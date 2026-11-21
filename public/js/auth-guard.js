import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

async function sairDoServidor() {
  try { await fetch('/auth/logout', { method: 'POST' }); } catch (e) { /* ignora */ }
  window.location.href = '/login';
}

// Se o Firebase não tem ninguém logado, encerra também a sessão do servidor e volta ao login.
onAuthStateChanged(auth, (user) => {
  if (!user) sairDoServidor();
});

const btn = document.getElementById('btn-logout');
if (btn) {
  btn.addEventListener('click', async () => {
    await signOut(auth);
    await sairDoServidor();
  });
}