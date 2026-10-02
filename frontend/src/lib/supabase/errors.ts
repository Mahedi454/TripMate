/**
 * Turns a Supabase auth error into something safe to show a visitor.
 *
 * `signInWithPassword` deliberately returns the same "Invalid login
 * credentials" whether or not the email exists, and the flows below must not
 * undo that: never reveal which emails are registered.
 */

const MESSAGES: Record<string, string> = {
  "Invalid login credentials": "Incorrect email or password",
  "User already registered": "An account with that email already exists.",
  "Email not confirmed": "Please confirm your email address before signing in.",
  "Password should be at least 6 characters.": "Please choose a longer password.",
  "Email rate limit exceeded": "Too many attempts. Please wait a minute and try again.",
  "Failed to fetch": "Could not reach the authentication service. Check your connection.",
  "Signup is disabled": "Registration is currently unavailable.",
};

export function authErrorMessage(error: { message: string } | null, fallback: string) {
  if (!error) {
    return fallback;
  }
  return MESSAGES[error.message] ?? fallback;
}

/** Absolute URL for OAuth and email callbacks, safe to call during a click handler. */
export function callbackUrl(path: string) {
  return `${window.location.origin}${path}`;
}
