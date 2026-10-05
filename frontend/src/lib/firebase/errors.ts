/**
 * Turns a Firebase Auth error into something safe to show a visitor.
 *
 * Sign-in deliberately reports wrong email and wrong password the same way,
 * and the flows below must not undo that: never reveal which emails exist.
 */

const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Incorrect email or password",
  "auth/wrong-password": "Incorrect email or password",
  "auth/user-not-found": "Incorrect email or password",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/email-already-in-use": "An account with that email already exists.",
  "auth/weak-password": "Please choose a stronger password.",
  "auth/password-does-not-meet-requirements": "Please choose a stronger password.",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/network-request-failed": "Could not reach the authentication service. Check your connection.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/operation-not-allowed": "This sign-in method is not enabled yet.",
  "auth/popup-blocked": "Your browser blocked the Google window. Allow pop-ups for this site and try again.",
  "auth/unauthorized-domain":
    "This website address is not allowed to sign in yet. Add it under Firebase -> Authentication -> Settings -> Authorized domains.",
  "auth/account-exists-with-different-credential":
    "An account already exists with this email. Sign in with your email and password instead.",
};

/** Errors that mean the visitor simply closed or cancelled the Google window. */
export const CANCELLED_POPUP_CODES = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
]);

export function firebaseErrorCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code: unknown }).code)
    : undefined;
}

export function authErrorMessage(error: unknown, fallback: string) {
  const code = firebaseErrorCode(error);
  if (code && MESSAGES[code]) {
    return MESSAGES[code];
  }
  // Not a Firebase error (missing config, backend unreachable): its message is ours.
  if (!code && error instanceof Error) {
    return error.message;
  }
  return fallback;
}

/** Absolute URL for links inside Firebase emails, safe to call during a click handler. */
export function continueUrl(path: string) {
  return `${window.location.origin}${path}`;
}
