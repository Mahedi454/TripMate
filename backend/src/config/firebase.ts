import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { env } from "./env.js";

let firebaseApp: App | undefined;

/**
 * Firebase Admin, authenticated with the service account. Server side only:
 * it can read and change every account in the project.
 */
export function getFirebaseAuth(): Auth {
  if (!firebaseApp) {
    // Reuse the app across tsx watch reloads and warm serverless invocations.
    firebaseApp =
      getApps()[0] ??
      initializeApp({
        credential: cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY,
        }),
      });
  }
  return getAuth(firebaseApp);
}
