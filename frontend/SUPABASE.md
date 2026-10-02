# Supabase

Sign-in and registration run on Supabase Auth. The UI lives in
`src/components/auth/`, the client helpers in `src/lib/supabase/`, and the
`profiles` table in `supabase/migrations/`.

## 1. Where to insert the values

Create the file `frontend/.env.local` and fill in three lines. The values come
from the Supabase dashboard under **Project Settings → Data API**:

```bash
# 1. Project URL        -> "Project URL"  (looks like https://abcdefgh.supabase.co)
NEXT_PUBLIC_SUPABASE_URL=

# 2. anon public key    -> API Keys -> "anon public"
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# 3. service_role key   -> API Keys -> "service_role"   [secret]
SUPABASE_SERVICE_ROLE_KEY=
```

`frontend/.env.example` is the tracked template with the same three keys. It is
already covered by the root `.gitignore`, which ignores `.env.local` and
whitelists `.env.example`.

Restart the dev server afterwards, because `NEXT_PUBLIC_*` values are inlined
at build time:

```bash
cd frontend
npm run dev
```

Until the first two values are set, the pages still render and the forms show a
short "Supabase is not connected yet" message rather than failing.

**The service_role key bypasses row level security.** Never give it a
`NEXT_PUBLIC_` prefix and never import it from a `"use client"` file. It is not
used by the auth forms at all; it is only there for server-side work such as
admin queries. The auth pages need just the URL and the anon key.

## 2. Dashboard settings

- **Authentication → Providers → Email**: enable.
  Decide whether **Confirm email** is on. Off means registration signs the user
  in immediately; on means the form shows a "check your inbox" state and the
  user must click the emailed link first. Both paths are implemented.
- **Authentication → URL Configuration**: set the Site URL to
  `http://localhost:3000` and add `http://localhost:3000/**` to the redirect
  allow list, plus the production domain when you deploy.
- **Authentication → Providers → Google** (optional, makes the Google button
  real): create a Google Cloud OAuth client, paste the client ID and secret,
  and add `https://<project-ref>.supabase.co/auth/v1/callback` as an authorised
  redirect URI.

## 3. Database

Run `supabase/migrations/0001_auth_profiles.sql` once, in Supabase Studio →
SQL Editor. It creates `public.profiles`, enables row level security with
per-user policies, and adds a trigger that copies `full_name` out of
`user_metadata` on sign-up.

## 4. How it fits together

| File | Role |
| --- | --- |
| `src/lib/supabase/config.ts` | Reads the env values, reports whether they are set |
| `src/lib/supabase/client.ts` | Browser client for forms and the OAuth button |
| `src/lib/supabase/server.ts` | Server client for Server Components and Route Handlers |
| `src/lib/supabase/middleware.ts` | Refreshes the session and applies the route guard |
| `src/middleware.ts` | Runs `updateSession` on every request |
| `src/app/auth/callback/route.ts` | Exchanges the OAuth or email-confirmation code for a session |
| `src/app/reset-password/page.tsx` | Target of the password reset email |

`src/middleware.ts` calls `getUser()` rather than `getSession()` on purpose:
`getSession()` only decodes the cookie without verifying it, so it cannot
refresh an expired access token and would treat signed-in users as signed out on
protected pages.

## 5. Route guard

Signed-in users are redirected away from `/login`, `/register` and
`/forgot-password`. To protect pages that need a session, add their prefixes to
`PROTECTED_PREFIXES` in `src/lib/supabase/middleware.ts`; unauthenticated
visitors are then sent to `/login?next=<path>` and returned there after signing
in.

## 6. Test checklist

1. Register with email confirmation off → lands signed in.
2. Register with confirmation on → "check your inbox" state, then the emailed
   link signs you in.
3. Sign in with a wrong password → "Incorrect email or password", with no hint
   about whether the address exists.
4. Refresh the page while signed in → the session survives.
5. Sign out, then request a reset → the email arrives and the new password
   works.
6. Continue with Google → returns through `/auth/callback` signed in.

Signups are rate limited per IP address by Supabase, so repeated tests from a
shared network can return "Too many attempts". Raise the limit under
**Authentication → Rate Limits** while testing.
