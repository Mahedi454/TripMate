/**
 * Single place the Supabase credentials are read from.
 *
 * The anon key is designed to be public: it ships to the browser and every
 * request it makes is subject to row level security. The service role key
 * bypasses RLS entirely, so it is only ever read here for server-only use and
 * must never be imported from a "use client" module.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const SUPABASE_URL = url;
export const SUPABASE_ANON_KEY = anonKey;

/** True once the three values in `.env.local` have been filled in. */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const SUPABASE_MISSING_CONFIG_MESSAGE =
  "Supabase is not connected yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to frontend/.env.local, then restart the dev server.";

export function requireConfig(): { url: string; anonKey: string } {
  if (!isSupabaseConfigured) {
    throw new Error(SUPABASE_MISSING_CONFIG_MESSAGE);
  }
  return { url: url as string, anonKey: anonKey as string };
}
