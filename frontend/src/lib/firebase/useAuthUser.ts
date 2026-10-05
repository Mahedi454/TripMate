"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";

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
 * Sends a visitor who is already signed in away from the login and register
 * pages. Only the first auth state counts: sign-ins made on the page itself
 * redirect on their own once the login has been recorded.
 */
export function useRedirectIfSignedIn(destination = "/dashboard") {
  const router = useRouter();

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return;
    }
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (current) => {
      unsubscribe();
      if (current?.emailVerified) {
        router.replace(destination);
      }
    });
    return unsubscribe;
  }, [destination, router]);
}
