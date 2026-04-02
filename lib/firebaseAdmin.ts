import admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

function createFirebaseAdmin() {
  if (!projectId || !clientEmail || !privateKey) {
    console.warn("Firebase Admin env eksik. Firestore işlemleri skip edilecek.");
    return null;
  }

  if (admin.apps.length > 0) {
    return admin.app();
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const app = createFirebaseAdmin();

export const db = app ? admin.firestore() : null;
export { admin };