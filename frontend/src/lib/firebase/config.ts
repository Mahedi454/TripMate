/**
 * Single place the Firebase web config is read from.
 *
 * These values are designed to be public: they identify the project but grant
 * nothing on their own. What a user may do is enforced by Firebase Auth and by
 * the backend, which verifies every ID token with the Admin SDK.
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** True once the values in `.env.local` have been filled in. */
export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

export const FIREBASE_MISSING_CONFIG_MESSAGE =
  "Firebase is not connected yet. Add the NEXT_PUBLIC_FIREBASE_* values to frontend/.env.local, then restart the dev server.";

export function requireFirebaseConfig() {
  if (!isFirebaseConfigured) {
    throw new Error(FIREBASE_MISSING_CONFIG_MESSAGE);
  }
  return firebaseConfig as Record<keyof typeof firebaseConfig, string>;
}
