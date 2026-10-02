import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabaseConfigured, requireConfig } from "@/lib/supabase/config";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * Never import this from a "use client" file. To read the service role key,
 * create a separate client with `createClient` from `@supabase/supabase-js` in a
 * server-only module and add `import "server-only"` to it.
 */
export async function getSupabaseServerClient() {
  const { url, anonKey } = requireConfig();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component, where cookies are read-only. The
          // middleware refreshes the session, so this is safe to ignore.
        }
      },
    },
  });
}

/** Current user, verified against the Supabase auth server. Null when signed out. */
export async function getCurrentUser() {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/**
 * Access token of the verified user, for calling the Express API from server
 * code. `getUser()` runs first so a forged cookie is never forwarded.
 */
export async function getAccessToken() {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
}
