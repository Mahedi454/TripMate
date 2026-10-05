import type { DecodedIdToken } from "firebase-admin/auth";
import { env } from "../config/env.js";
import { getFirebaseAuth } from "../config/firebase.js";
import { User, type UserDoc } from "../models/User.js";
import { ApiError } from "../middleware/error.middleware.js";
import type { PublicUser } from "../types/auth.js";

const EMAIL_NOT_VERIFIED = "Please verify your email address before signing in.";

/**
 * Verifies a Firebase ID token and returns its claims.
 * `checkRevoked` also rejects tokens of disabled accounts and of users whose
 * sessions were revoked, at the cost of one extra lookup.
 */
export async function verifyIdToken(idToken: string): Promise<DecodedIdToken> {
  try {
    return await getFirebaseAuth().verifyIdToken(idToken, true);
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "auth/user-disabled") {
      throw ApiError.forbidden("This account has been disabled");
    }
    throw ApiError.unauthorized("Invalid or expired session");
  }
}

/** Password accounts must click the verification link; Google accounts arrive verified. */
export function assertEmailVerified(token: DecodedIdToken): void {
  if (token.email_verified !== true) {
    throw ApiError.forbidden(EMAIL_NOT_VERIFIED);
  }
}

function toPublicUser(doc: UserDoc): PublicUser {
  return {
    id: doc._id.toString(),
    firebaseUid: doc.firebaseUid,
    name: doc.name,
    email: doc.email,
    avatar: doc.avatar,
    role: doc.role,
    status: doc.status,
    lastLoginAt: doc.lastLoginAt ? doc.lastLoginAt.toISOString() : null,
    loginCount: doc.loginCount ?? 0,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/** Display name from the token (Google, or set at registration), else the email. */
function displayNameFor(token: DecodedIdToken): string {
  const fromToken = typeof token.name === "string" ? token.name.trim() : "";
  const candidate = (fromToken || (token.email ?? "").split("@")[0] || "").slice(0, 50);
  return candidate.length >= 2 ? candidate : "TripPilot user";
}

/**
 * Profiles created before the move to Firebase have no firebaseUid. Once the
 * owner proves the address (verified token), attach the record to their uid.
 */
async function claimLegacyProfile(token: DecodedIdToken, email: string) {
  if (token.email_verified !== true) {
    return null;
  }
  return User.findOneAndUpdate(
    { email, firebaseUid: { $exists: false } },
    { $set: { firebaseUid: token.uid }, $unset: { supabaseId: "" } },
    { new: true, strict: false },
  );
}

/**
 * Creates the TripPilot profile right after registration, before the email
 * is verified, so new sign-ups show up in MongoDB immediately. Idempotent.
 * The sign-in itself is only counted by syncUserOnLogin.
 */
export async function registerProfile(token: DecodedIdToken, name: string): Promise<PublicUser> {
  const email = token.email?.toLowerCase();
  if (!email) {
    throw ApiError.badRequest("This account has no email address");
  }

  const existing = await User.findOne({ firebaseUid: token.uid });
  if (existing) {
    return toPublicUser(existing.toObject());
  }

  try {
    const created = await User.create({
      firebaseUid: token.uid,
      name,
      email,
      avatar: "",
      role: env.adminEmails.includes(email) && token.email_verified === true ? "admin" : "user",
      status: "active",
    });
    return toPublicUser(created.toObject());
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      // A parallel request won the race, or the email belongs to an older profile.
      const raced = await User.findOne({ firebaseUid: token.uid });
      if (raced) {
        return toPublicUser(raced.toObject());
      }
      throw ApiError.conflict("Another TripPilot profile already uses this email");
    }
    throw error;
  }
}

/**
 * Called after every successful sign-in (password or Google).
 * Creates the MongoDB profile if it is missing and records the login.
 * Emails listed in ADMIN_EMAILS are promoted to admin here.
 */
export async function syncUserOnLogin(token: DecodedIdToken): Promise<PublicUser> {
  const email = token.email?.toLowerCase();
  if (!email) {
    throw ApiError.badRequest("This account has no email address");
  }
  assertEmailVerified(token);

  const existing =
    (await User.findOne({ firebaseUid: token.uid })) ?? (await claimLegacyProfile(token, email));
  if (existing?.status === "suspended") {
    throw ApiError.forbidden("This account has been suspended");
  }

  const set: Record<string, unknown> = { email, lastLoginAt: new Date() };
  if (env.adminEmails.includes(email)) {
    set.role = "admin";
  }

  try {
    const updated = await User.findOneAndUpdate(
      { firebaseUid: token.uid },
      {
        $set: set,
        $inc: { loginCount: 1 },
        // Only applied when the profile is created by this call.
        $setOnInsert: {
          name: displayNameFor(token),
          avatar: typeof token.picture === "string" ? token.picture : "",
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    return toPublicUser(updated.toObject());
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw ApiError.conflict("Another TripPilot profile already uses this email");
    }
    throw error;
  }
}

/** Every profile, newest first. Admin only. */
export async function listUsers(): Promise<PublicUser[]> {
  const users = await User.find().sort({ createdAt: -1 }).limit(500);
  return users.map((user) => toPublicUser(user.toObject()));
}

export async function findUserByFirebaseUid(firebaseUid: string): Promise<PublicUser | null> {
  const user = await User.findOne({ firebaseUid });
  return user ? toPublicUser(user.toObject()) : null;
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}
