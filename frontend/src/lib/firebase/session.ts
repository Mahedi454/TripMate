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
