import { createClient, type SupabaseClient, type User as SupabaseAuthUser } from "@supabase/supabase-js";
import { env } from "../config/env.js";
import { User, type UserDoc } from "../models/User.js";
import { ApiError } from "../middleware/error.middleware.js";
import type { CreateProfileInput } from "../schemas/auth.schema.js";
import type { PublicUser } from "../types/auth.js";

let supabaseAdmin: SupabaseClient | null = null;

/**
 * Service-role client. Server side only - never import this into frontend code.
 * Used to confirm that a Supabase auth account really exists.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdmin;
}

/**
 * Verifies a Supabase access token and returns the underlying auth user.
 * Throws 401 when the token is missing, malformed or expired.
 */
export async function verifyAccessToken(accessToken: string): Promise<SupabaseAuthUser> {
  const { data, error } = await getSupabaseAdmin().auth.getUser(accessToken);

  if (error || !data.user) {
    throw ApiError.unauthorized("Invalid or expired session");
  }

  return data.user;
}

/**
 * Confirms the Supabase auth account exists before a profile is created,
 * so the API cannot be used to register arbitrary identities.
 */
export async function assertSupabaseUserExists(supabaseId: string): Promise<void> {
  const { data, error } = await getSupabaseAdmin().auth.admin.getUserById(supabaseId);

  if (error || !data.user) {
    throw ApiError.unauthorized("Supabase authentication account not found");
  }
}

function toPublicUser(doc: UserDoc): PublicUser {
  return {
    id: doc._id.toString(),
    supabaseId: doc.supabaseId,
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

/**
 * Creates the TripMate profile for a freshly registered Supabase user.
 * Idempotent: calling it again returns the existing document.
 * `role` and `status` are set by the server only.
 */
export async function createOrGetUserProfile(input: CreateProfileInput): Promise<PublicUser> {
  await assertSupabaseUserExists(input.supabaseId);

  const existing = await User.findOne({ supabaseId: input.supabaseId });
  if (existing) {
    return toPublicUser(existing.toObject());
  }

  try {
    const created = await User.create({
      supabaseId: input.supabaseId,
      name: input.name,
      email: input.email,
      avatar: "",
      role: "user",
      status: "active",
    });
    return toPublicUser(created.toObject());
  } catch (error) {
    // 11000 = duplicate key: a parallel request won the race.
    if (isDuplicateKeyError(error)) {
      const raced = await User.findOne({ supabaseId: input.supabaseId });
      if (raced) {
        return toPublicUser(raced.toObject());
      }
    }
    throw error;
  }
}

function readMetadataString(metadata: Record<string, unknown> | undefined, key: string): string {
  const value = metadata?.[key];
  return typeof value === "string" ? value.trim() : "";
}

/** Display name from signUp metadata (`full_name`) or Google (`name`), else the email. */
function displayNameFor(supabaseUser: SupabaseAuthUser): string {
  const metadata = supabaseUser.user_metadata as Record<string, unknown> | undefined;
  const candidate =
    readMetadataString(metadata, "full_name") ||
    readMetadataString(metadata, "name") ||
    (supabaseUser.email ?? "").split("@")[0] ||
    "";
  const name = candidate.slice(0, 50);
  return name.length >= 2 ? name : "TripMate user";
}

/**
 * Called after every successful sign-in (password, Google, email link).
 * Creates the MongoDB profile if it is missing and records the login.
 * Emails listed in ADMIN_EMAILS are promoted to admin here.
 */
export async function syncUserOnLogin(supabaseUser: SupabaseAuthUser): Promise<PublicUser> {
  const email = supabaseUser.email?.toLowerCase();
  if (!email) {
    throw ApiError.badRequest("This account has no email address");
  }

  const existing = await User.findOne({ supabaseId: supabaseUser.id });
  if (existing?.status === "suspended") {
    throw ApiError.forbidden("This account has been suspended");
  }

  const metadata = supabaseUser.user_metadata as Record<string, unknown> | undefined;
  const set: Record<string, unknown> = { email, lastLoginAt: new Date() };
  if (env.adminEmails.includes(email)) {
    set.role = "admin";
  }

  try {
    const updated = await User.findOneAndUpdate(
      { supabaseId: supabaseUser.id },
      {
        $set: set,
        $inc: { loginCount: 1 },
        // Only applied when the profile is created by this call.
        $setOnInsert: {
          name: displayNameFor(supabaseUser),
          avatar: readMetadataString(metadata, "avatar_url"),
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    return toPublicUser(updated.toObject());
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw ApiError.conflict("Another TripMate profile already uses this email");
    }
    throw error;
  }
}

/** Every profile, newest first. Admin only. */
export async function listUsers(): Promise<PublicUser[]> {
  const users = await User.find().sort({ createdAt: -1 }).limit(500);
  return users.map((user) => toPublicUser(user.toObject()));
}

export async function findUserBySupabaseId(supabaseId: string): Promise<PublicUser | null> {
  const user = await User.findOne({ supabaseId });
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