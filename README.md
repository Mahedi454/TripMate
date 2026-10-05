# TripPilot

**Plan together. Decide together. Travel together.**

A MERN-based collaborative trip planning and decision-making platform.

This stage contains the **authentication UI only**: `/login`, `/register` and
`/forgot-password`, built as a premium split-screen experience. Everything is static —
there is no Supabase, no backend call, no validation library and no real authentication.

---

## Current stage

| Item | Status |
| --- | --- |
| `/login` | UI only, mock loading + error states |
| `/register` | UI only, mock loading + success state, live password strength meter |
| `/forgot-password` | UI only, mock loading + "Check your inbox" success state |
| Google sign in | Outlined button only, no OAuth request |
| Password reset | Frontend confirmation screen only, no email is sent |
| `/` | Landing page with entry points to the three screens |
| `backend/` | Left over from the previous stage, not wired to the UI |

---

## Stack

- Next.js 15 (App Router, TypeScript)
- React 19
- Tailwind CSS v4 (design tokens live in `src/app/globals.css`)
- lucide-react icons

---

## Run it

```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
```

| Script | Command |
| --- | --- |
| `npm run dev` | `next dev` |
| `npm run build` | `next build` |
| `npm run start` | `next start` |
| `npm run typecheck` | `tsc --noEmit` |

No `.env` file is required for this stage.

---

## Structure

```
frontend/src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── globals.css          brand tokens, keyframes, reduced-motion rules
│   ├── layout.tsx
│   └── page.tsx             landing page
├── components/
│   ├── auth/
│   │   ├── AuthLayout.tsx         split-screen shell (photo panel + form column)
│   │   ├── AuthBrandPanel.tsx     travel photography and wordmark
│   │   ├── AuthHeader.tsx         title, subtitle, optional icon slot
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── ForgotPasswordForm.tsx form + success state
│   │   ├── PasswordInput.tsx      show/hide toggle
│   │   ├── PasswordStrength.tsx   4 segment strength meter + length check
│   │   ├── SocialButton.tsx       Google button with inline brand mark
│   │   ├── AuthDivider.tsx        OR rule
│   │   └── AuthAlert.tsx          error / success / info banner
│   └── ui/
│       ├── Button.tsx             primary, secondary, ghost, loading spinner
│       ├── Input.tsx              label, icon slot, hint, field error
│       ├── Logo.tsx               compass wordmark
│       └── button-styles.ts       shared class recipe (server components can use it)
└── public/images/auth-travel.jpg
```

Three files exist beyond the original component sketch, all deliberate:
`ui/Logo.tsx` (shared wordmark), `ui/button-styles.ts` (lets server components style links),
and `app/globals.css` (Tailwind v4 entry point).

---

## Design tokens

Defined once in `src/app/globals.css` under `@theme`, then used as
`bg-brand-600`, `text-ink`, `ring-line`, `text-success`, `text-danger`.

| Token | Value | Use |
| --- | --- | --- |
| `--color-brand-600` | `#2563EB` | primary actions, focus, icons |
| `--color-night` | `#0F172A` | headings, brand panel scrim |
| `--color-ink` | `#111827` | body text |
| `--color-ink-soft` | `#64748B` | secondary text |
| `--color-canvas` | `#F8FAFC` | page background |
| `--color-line` | `#E2E8F0` | borders |
| `--color-success` | `#16A34A` | success |
| `--color-danger` | `#DC2626` | errors |

Layout: inputs and buttons are `52px` tall with `12px` radius. The right column is
capped at `420px`. The brand panel is `53%` on desktop, hidden below `lg`.

---

## Demo behaviour

Static React state only, so every state is reachable while designing:

| Screen | Trigger | Result |
| --- | --- | --- |
| Login | Submit with a bad email or empty password | Field errors + `AuthAlert` error |
| Login | Submit a valid form | 1.4s spinner → "Incorrect email or password" |
| Register | Mismatched or short password | Field errors + error banner |
| Register | Submit a valid form | 1.6s spinner → success banner |
| Register | Type a password | Strength meter moves Weak → Fair → Good → Strong |
| Forgot password | Submit a bad email | Field error |
| Forgot password | Submit a valid email | 1.6s spinner → "Check your inbox" with that address |

---

## Accessibility

- Every field has a visible `<label>`, placeholder, correct `type` and `autocomplete`.
- Field errors use `aria-invalid` + `aria-describedby`, and `role="alert"`.
- The password toggle is a real button with `aria-label="Show password"` /
  `"Hide password"` and `aria-pressed`.
- Banners use `role="alert"` for errors and `role="status"` for success.
- Loading buttons expose `aria-busy` and swap their label to the loading text.
- Decorative icons and the brand photo are `aria-hidden`; the photo carries empty `alt`.
- All motion is disabled under `prefers-reduced-motion: reduce`.
- Keyboard focus is always visible; the brand panel is hidden on small screens only.

---

## Swapping the brand photo

`frontend/public/images/auth-travel.jpg` is a licensed-free Unsplash landscape
(1400×1900, ~318 KB). Replace the file with your own portrait travel shot and keep the
name, or point `<Image src>` in `AuthBrandPanel.tsx` at another asset. A dark gradient
and a brand-coloured background sit underneath, so the layout still reads well if the
image is missing.

---

## Next stage

Wire the forms to a real auth provider: replace the mock handlers in
`LoginForm`, `RegisterForm` and `ForgotPasswordForm`, keep the component markup, then
connect the existing `backend/` service and role model.