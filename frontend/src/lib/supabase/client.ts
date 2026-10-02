"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, requireConfig } from "@/lib/supabase/config";

let browserClient: SupabaseClient | undefined;

/**
 * Supabase client for client components (forms, OAuth button, reset password).
 *
 * The session lives in cookies rather than localStorage: `@supabase/ssr` writes
 * it through `document.cookie` so the server sees the same session and can
 * enforce row level security.
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (!isSupabaseConfigured) {
    requireConfig();
  }

  if (!browserClient) {
    const { url, anonKey } = requireConfig();
    browserClient = createBrowserClient(url, anonKey);
  }

  return browserClient;
}
