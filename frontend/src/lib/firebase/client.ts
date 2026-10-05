"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { requireFirebaseConfig } from "@/lib/firebase/config";

let auth: Auth | undefined;

/**
 * Firebase Auth for client components. The session persists in the browser
 * (IndexedDB), so pages that need the user read it on the client and send the
 * ID token to the backend.
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    const app = getApps().length > 0 ? getApp() : initializeApp(requireFirebaseConfig());
    auth = getAuth(app);
  }
  return auth;
}
