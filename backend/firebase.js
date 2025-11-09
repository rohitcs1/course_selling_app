// Firebase helper: initializes Firebase Admin SDK from FIREBASE_SERVICE_ACCOUNT env
const admin = require('firebase-admin')

function initFirebase() {
  if (admin.apps && admin.apps.length) {
    return admin.firestore()
  }

  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.warn('FIREBASE_SERVICE_ACCOUNT not provided - Firestore disabled')
    return null
  }

  try {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT.replace(/\\n/g, '\n'))
    admin.initializeApp({
      credential: admin.credential.cert(sa)
    })
    console.log('✅ Firebase initialized (firebase.js)')
    return admin.firestore()
  } catch (err) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', err)
    return null
  }
}

module.exports = { initFirebase, admin }
