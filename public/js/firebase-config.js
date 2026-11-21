import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBklmysoCe8z2i7NEPRZiwIYIaVKTpUgx0",
  authDomain: "chamados-ti-rbac-24ffb.firebaseapp.com",
  projectId: "chamados-ti-rbac-24ffb",
  storageBucket: "chamados-ti-rbac-24ffb.firebasestorage.app",
  messagingSenderId: "786320803035",
  appId: "1:786320803035:web:1501f6ca36d98af34e78fe",
  measurementId: "G-BC1LN8E2NK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);