"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useAuthUser } from "@/lib/firebase/useAuthUser";

/**
 * GETs a protected API route with the signed-in user's ID token. Visitors who
 * are not signed in are sent to /login, and come back to `returnTo` afterwards.
 */
export function useAuthedRequest<T>(path: string, returnTo: string) {
  const router = useRouter();
  const { user, loading } = useAuthUser();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(returnTo)}`);
      return;
    }

    let cancelled = false;
    user
      .getIdToken()
      .then((token) => apiRequest<T>(path, { token }))
      .then(
        (result) => {
          if (!cancelled) {
            setData(result);
            setError(null);
          }
        },
        (caught: unknown) => {
          if (!cancelled) {
            setError(caught instanceof Error ? caught : new Error("Something went wrong."));
          }
        },
      );

    return () => {
      cancelled = true;
    };
  }, [loading, path, returnTo, router, user]);

  return { data, error, isLoading: data === null && error === null };
}
