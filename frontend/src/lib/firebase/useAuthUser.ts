"use client";

import { getRedirectResult, onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { authErrorMessage } from "@/lib/firebase/errors";
import { completeSignIn, safeNextPath, takeGoogleRedirect } from "@/lib/firebase/session";

/**
 * The signed-in Firebase user. `loading` stays true until Firebase has
 * restored the session from the browser, so pages never flash "signed out".
 * Unverified email accounts count as signed out.
 */
export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return;
    }
    return onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
      setUser(nextUser && nextUser.emailVerified ? nextUser : null);
      setLoading(false);
    });
  }, []);

  return { user, loading };
}

/**
 * Runs on the login and register pages:
 * - finishes a Google sign-in that went through a full-page redirect (the
 *   fallback when the popup is blocked), recording it before moving on;
 * - otherwise sends a visitor who is already signed in to `destination`.
 * Asking for the redirect result also loads Firebase's sign-in helper early,
 * so the Google popup opens straight away on click instead of being blocked.
 */
export function useRedirectIfSignedIn(
  destination = "/dashboard",
  onError?: (message: string) => void,
) {
  const router = useRouter();
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return;
    }
    let cancelled = false;
    const auth = getFirebaseAuth();

    void (async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          await completeSignIn(result.user);
          if (!cancelled) {
            router.replace(safeNextPath(takeGoogleRedirect(), destination));
          }
          return;
        }
      } catch (error) {
        if (!cancelled) {
          onErrorRef.current?.(authErrorMessage(error, "Google sign-in failed. Please try again."));
        }
        return;
      }

      // Only the restored session counts: sign-ins made on the page itself
      // redirect on their own once the login has been recorded.
      await auth.authStateReady();
      if (!cancelled && auth.currentUser?.emailVerified) {
        router.replace(destination);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [destination, router]);
}
