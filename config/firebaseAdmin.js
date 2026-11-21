const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Local: lê o arquivo. No Render: lê a variável de ambiente FIREBASE_SERVICE_ACCOUNT.
const credencial = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : require('./serviceAccountKey.json');

const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(credencial) });

module.exports = { auth: getAuth(app), db: getFirestore(app) };