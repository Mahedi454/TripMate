import { NextResponse, type NextRequest } from "next/server";
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
  const next = searchParams.get("next") ?? "/";

  // Only ever redirect to a path on this origin, never to an absolute URL.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(`${origin}/login?error=callback_failed`);
    }
  } catch {
    return NextResponse.redirect(`${origin}/login?error=not_configured`);
  }

  return NextResponse.redirect(`${origin}${safeNext}`);
}
