import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

/** Pages a signed-in user has no reason to see again. */
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

/** Page to send users to after signing in. */
const POST_SIGN_IN_PATH = "/";

/**
 * Routes that require a session. Add prefixes here as the app grows, e.g.
 * `"/dashboard"`, `"/trips"`.
 */
const PROTECTED_PREFIXES: string[] = [];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Keeps the auth cookies fresh and enforces the route guard.
 *
 * `getUser()` is deliberate: `getSession()` only decodes the cookie without
 * verifying it, so it cannot refresh an expired access token and would report a
 * signed-in user as signed out on protected pages.
 */
export async function updateSession(request: NextRequest) {
  // Keep the site browsable before the credentials are filled in.
  if (!isSupabaseConfigured) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (user && AUTH_ROUTES.includes(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = POST_SIGN_IN_PATH;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (!user && isProtected(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
