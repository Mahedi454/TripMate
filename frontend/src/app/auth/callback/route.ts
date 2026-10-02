import { NextResponse, type NextRequest } from "next/server";
import { syncLogin } from "@/lib/api";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Target of the Google OAuth redirect and of the email confirmation link.
 *
 * Supabase sends the user back with `?code=...` (PKCE). Exchanging that code for
 * a session is what signs them in, so without this route the round trip lands
 * on a page that is still anonymous.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Only ever redirect to a path on this origin, never to an absolute URL.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(`${origin}/login?error=callback_failed`);
    }

    // Google sign-ins and email confirmations land here, so this is where
    // their MongoDB profile is created and the login recorded.
    try {
      await syncLogin(data.session.access_token);
    } catch {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/login?error=sync_failed`);
    }
  } catch {
    return NextResponse.redirect(`${origin}/login?error=not_configured`);
  }

  return NextResponse.redirect(`${origin}${safeNext}`);
}
