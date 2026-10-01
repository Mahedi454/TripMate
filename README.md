# TripMate

**A MERN-based collaborative trip planning and decision-making platform.**

This repository currently contains **Stage 1 — the authentication foundation only**:
registration, login, logout, Supabase Auth, the MongoDB user profile, roles/status,
and a protected dashboard placeholder.

Trips, itineraries, expenses, polls, chat, notifications, reviews and maps are
intentionally **not** implemented yet.

---

## Architecture

```
Browser (Next.js App Router)
  │
  │  1. Zod validation (schemas/auth.schema.ts)
  │  2. Supabase auth.signUp / signInWithPassword / signOut
  │     → Supabase owns the credentials and the session (frontend only)
  │  3. Axios POST /api/auth/profile  (Authorization: Bearer <access token>)
  │
  ▼
Express API (port 5000)
  routes → middleware → controllers → services → models
  │
  │  4. supabase.auth.getUser(token)        (server-side token verification)
  │  5. MongoDB (Mongoose) stores the application profile
  │
  ▼
MongoDB  →  users collection
  { supabaseId, name, email, avatar, role, status, createdAt, updatedAt }
```

Key rules:

- **Supabase owns authentication.** No custom JWTs, no password hashing, no password in MongoDB.
- **MongoDB owns application data.** It stores the Supabase user id plus profile fields.
- **`role` and `status` are set by the server only.** The registration form has no role field,
  and the API ignores any client-supplied value.

---

## Folder structure

```
tripmate/
├── frontend/                     Next.js 15 App Router + TypeScript + Tailwind
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/login/page.tsx
│   │   │   ├── (auth)/register/page.tsx
│   │   │   ├── dashboard/page.tsx      protected placeholder
│   │   │   ├── globals.css             Tailwind entry (required by Tailwind v4)
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx                landing page
│   │   ├── components/
│   │   │   ├── auth/AuthInput.tsx      input preset + show/hide password
│   │   │   ├── auth/AuthShell.tsx      shared auth card layout (avoids duplication)
│   │   │   ├── auth/LoginForm.tsx
│   │   │   ├── auth/RegisterForm.tsx
│   │   │   └── ui/Button.tsx, ui/Input.tsx
│   │   ├── lib/supabase.ts             lazy Supabase browser client
│   │   ├── lib/api.ts                  Axios instance + bearer-token interceptor
│   │   ├── schemas/auth.schema.ts      Zod (register, login)
│   │   ├── services/auth.service.ts    Supabase calls + profile API calls
│   │   └── types/auth.ts
│   ├── next.config.ts, postcss.config.mjs, tsconfig.json
│   ├── public/
│   └── .env.local
│
├── backend/                      Express 4 + TypeScript + Mongoose
│   ├── src/
│   │   ├── config/db.ts               MongoDB connection helpers
│   │   ├── config/env.ts              Zod-validated environment variables
│   │   ├── controllers/auth.controller.ts
│   │   ├── middleware/auth.middleware.ts   requireAuth / optionalAuth / requireRole
│   │   ├── middleware/error.middleware.ts   ApiError + error handler
│   │   ├── models/User.ts                  Mongoose schema
│   │   ├── routes/auth.routes.ts
│   │   ├── services/auth.service.ts    Supabase verification + profile creation
│   │   ├── schemas/auth.schema.ts
│   │   ├── types/auth.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json, tsconfig.json
│   └── .env
│
├── .gitignore
└── README.md
```

Files added beyond the original sketch (all required, none are extra features):
`globals.css`, `next.config.ts`, `postcss.config.mjs` (Next/Tailwind requirements) and
`components/auth/AuthShell.tsx` (shared card layout, so the two auth pages do not duplicate markup).

---

## Requirements

| Tool | Version |
| --- | --- |
| Node.js | 20.11+ (uses native ESM) |
| npm | 10+ |
| MongoDB | local `mongod` or Atlas |
| Supabase | free project is enough |

---

## Installation

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

Or from the repository root:

```bash
cd backend  && npm install
cd frontend && npm install
```

---

## Supabase setup

1. Create a project at <https://supabase.com> (free tier).
2. **Authentication → Sign In / Up → Email**: enable the email provider.
3. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Additional redirect URLs: `http://localhost:3000/**`
4. Decide on email confirmation (**Authentication → Sign In / Up → Email → Confirm email**):
   - **Enabled** (recommended): register shows "verify your email" and `/login?registered=1`.
   - **Disabled**: register returns a session immediately.
5. Copy the keys from **Project Settings → API**:
   - `Project URL` → both `.env` files
   - `anon` / `publishable` key → `frontend/.env.local`
   - `service_role` key → `backend/.env` **only**

> The `service_role` key bypasses all Supabase auth rules. It must exist only in
> `backend/.env` (git-ignored), must never be prefixed with `NEXT_PUBLIC_`, and must
> never be imported by frontend code.

---

## MongoDB setup

Local:

```bash
mongod --dbpath "C:\data\db"      # Windows
mongod --dbpath /var/lib/mongodb  # macOS / Linux
```

The default URI in `backend/.env` is `mongodb://127.0.0.1:27017/tripmate`.
No manual collection creation is needed — Mongoose creates the `users` collection
with its indexes on first write.

MongoDB Atlas: replace `MONGODB_URI` with the SRV string from the Atlas dashboard.

---

## Environment variables

`frontend/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

`backend/.env`

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/tripmate
SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

`backend/src/config/env.ts` validates all of these with Zod at startup and exits with a
readable list of the missing values. Placeholders are committed on purpose; `.env` and
`.env.local` are git-ignored, so real keys are never pushed.

---

## Running the project

Two terminals:

```bash
# Terminal 1 - API on http://localhost:5000
cd backend
npm run dev
```

```bash
# Terminal 2 - web app on http://localhost:3000
cd frontend
npm run dev
```

Production build:

```bash
cd backend  && npm run build && npm start
cd frontend && npm run build && npm start
```

### Scripts

| Location | Script | Command |
| --- | --- | --- |
| backend | `dev` | `tsx watch src/server.ts` |
| backend | `build` | `tsc` |
| backend | `start` | `node dist/server.js` |
| backend | `typecheck` | `tsc --noEmit` |
| frontend | `dev` | `next dev` |
| frontend | `build` | `next build` |
| frontend | `start` | `next start` |
| frontend | `typecheck` | `tsc --noEmit` |

---

## API

### `GET /api/health`

```json
{ "success": true, "message": "TripMate API is running" }
```

### `POST /api/auth/profile`

Called by the frontend right after `signUp`. Idempotent — returns the existing user
when the profile already exists.

Headers: `Content-Type: application/json`, optional `Authorization: Bearer <access token>`

Body:

```json
{ "supabaseId": "supabase-user-id", "name": "User Name", "email": "user@example.com" }
```

Response `201`:

```json
{
  "success": true,
  "user": {
    "id": "665f...",
    "supabaseId": "8a1...",
    "name": "User Name",
    "email": "user@example.com",
    "avatar": "",
    "role": "user",
    "status": "active",
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-01T10:00:00.000Z"
  }
}
```

Errors use one shape everywhere:

```json
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "...", "details": {} } }
```

---

## How each flow works

**Registration** — `RegisterForm` validates with Zod → `auth.service.register()` calls
`supabase.auth.signUp({ email, password, options: { data: { full_name } } })`. Supabase
stores the password and returns the user id. The frontend then POSTs
`{ supabaseId, name, email }` to `/api/auth/profile`; the Axios interceptor attaches the
Supabase access token. Express re-validates with Zod, verifies that the Supabase account
really exists (`supabase.auth.admin.getUserById`), and upserts the MongoDB document with
`role: "user"`, `status: "active"`. The user is redirected to `/login`.

**Login** — `LoginForm` validates → `supabase.auth.signInWithPassword()`. Supabase checks
the password and stores a session in the browser; the service then (best effort) replays
the idempotent profile call so a profile missed during registration is self-healed. On
success the user is redirected to `/dashboard`.

**Session** — the Supabase client keeps the access and refresh tokens in `localStorage`
and refreshes them automatically. `lib/api.ts` reads the current access token on every
request and sends it as `Authorization: Bearer <token>`.

**Logout** — `dashboard/page.tsx` calls `supabase.auth.signOut()`, Supabase clears the
session, and the router sends the user to `/login`.

**Protected routes** — the dashboard reads the session on mount and redirects to `/login`
when there is none. `/api/auth/profile` additionally applies `optionalAuth`. For fully
server-rendered protection later, add `requireAuth` from
`backend/src/middleware/auth.middleware.ts` to each protected route:

```ts
authRouter.get("/me", requireAuth, asyncHandler(getMe));
authRouter.delete("/me", requireAuth, requireRole("admin"), asyncHandler(deleteUser));
```

`requireAuth` verifies the token with Supabase, loads the MongoDB user, and rejects
suspended accounts. `requireRole` is the role gate for the future admin module.

---

## Testing

1. `cd backend && npm run dev`, `cd frontend && npm run dev`.
2. Open <http://localhost:3000> → **Create your account**.
3. Submit an invalid form (e.g. short name, mismatched passwords) to see Zod errors.
4. Register with a real email.
   - Email confirmation on → you land on `/login` with a "check your inbox" notice.
   - Off → you land on `/login` ready to sign in.
5. Verify the profile exists:
   ```bash
   mongosh mongodb://127.0.0.1:27017/tripmate --eval "db.users.find({}, {name:1,email:1,role:1,status:1})"
   ```
   Confirm there is **no password field** in the document.
6. Sign in at `/login` → you should reach `/dashboard` with your name and email.
7. Visit `/dashboard` in a private window → you are redirected to `/login`.
8. Click **Logout** → the session is cleared and you return to `/login`.
9. Check the API directly:
   ```bash
   curl http://localhost:5000/api/health
   curl -X POST http://localhost:5000/api/auth/profile \
     -H "Content-Type: application/json" \
     -d '{"supabaseId":"not-a-uuid","name":"A","email":"bad"}'
   ```

---

## Common errors

| Symptom | Cause | Fix |
| --- | --- | --- |
| `Invalid environment variables: - SUPABASE_URL must be a valid URL` | Placeholder values still in `backend/.env` | Paste the real Project URL and service role key |
| `[db] cannot reach MongoDB` | MongoDB is not running, or the URI is wrong | Start `mongod`, verify `MONGODB_URI`, allow port 27017 in the firewall |
| `Cannot reach the TripMate API...` in the browser | Backend not running or wrong port | Start `npm run dev` in `backend/`, keep `NEXT_PUBLIC_API_URL=http://localhost:5000/api` |
| `Supabase is not configured` | `NEXT_PUBLIC_*` missing or still placeholders | Restart `next dev` after editing `.env.local` |
| `Email not confirmed` | Supabase email confirmation is enabled | Confirm the email, or disable the setting for local testing |
| `An account with this email already exists` | Same email registered before | Sign in instead, or reset the password in Supabase |
| `Invalid or expired session` / 401 on a protected route | Stale token or wrong `SUPABASE_URL` | Sign out and in again; confirm both env files point at the same project |
| CORS error in the browser console | `FRONTEND_URL` does not match the browser origin | Set `FRONTEND_URL=http://localhost:3000` (comma-separate extra origins) |
| `OverwriteModelError: Cannot overwrite model` | Old `tsx watch` process still running | Stop all Node processes, restart `npm run dev` |
| Changes to `.env.local` have no effect | Next.js caches env at boot | Restart the dev server |

---

## Security notes

- Passwords are only ever seen by Supabase; they never reach Express or MongoDB.
- The service role key is server-only and never prefixed with `NEXT_PUBLIC_`.
- Frontend and backend inputs are both validated with Zod.
- `role` cannot be set by the client: the Zod schema for `createProfileSchema` only
  accepts `supabaseId`, `name` and `email`, and Mongoose applies the defaults.
- `POST /api/auth/profile` confirms the Supabase account exists and rejects a request
  whose token belongs to a different user, so identities cannot be faked.
- Responses are DTO-mapped, so Mongo internals are not leaked.
- `FRONTEND_URL` is an explicit CORS allowlist; unknown origins get no CORS headers.

---

## Stage 2 candidates

Admin dashboard and role management · trip creation and invitations · collaborative
itinerary · destination discovery · voting/polls · shared expenses · discussion/chat ·
notifications · reviews.