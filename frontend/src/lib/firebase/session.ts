"use client";

import { signOut, type User } from "firebase/auth";
import { syncLogin } from "@/lib/api";
import { getFirebaseAuth } from "@/lib/firebase/client";

/**
 * Records a successful sign-in in MongoDB. If that fails (backend down,
 * account suspended) the Firebase session is dropped so the two never
 * disagree, and the error is rethrown for the form to show.
 */
export async function completeSignIn(user: User): Promise<void> {
  try {
    await syncLogin(await user.getIdToken());
  } catch (error) {
    await signOut(getFirebaseAuth());
    throw error;
  }
}

/** Only same-origin paths, so `?next=` can never send people to another site. */
export function safeNextPath(next: string | null, fallback = "/dashboard") {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

const GOOGLE_REDIRECT_KEY = "trippilot:google-redirect-next";

/** Remembers where to go after a full-page Google sign-in returns. */
export function rememberGoogleRedirect(next: string) {
  try {
    sessionStorage.setItem(GOOGLE_REDIRECT_KEY, next);
  } catch {
    // Storage can be unavailable (private mode); the dashboard is the fallback.
  }
}

/** Reads and clears the path saved by rememberGoogleRedirect. */
export function takeGoogleRedirect(): string | null {
  try {
    const next = sessionStorage.getItem(GOOGLE_REDIRECT_KEY);
    sessionStorage.removeItem(GOOGLE_REDIRECT_KEY);
    return next;
  } catch {
    return null;
  }
}
