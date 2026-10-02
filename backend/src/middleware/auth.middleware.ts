import type { NextFunction, Request, Response } from "express";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import { User } from "../models/User.js";
import { verifyAccessToken } from "../services/auth.service.js";
import type { AuthContext, UserRole } from "../types/auth.js";
import { ApiError } from "./error.middleware.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Set by requireAuth / optionalAuth when a valid session is present. */
      auth?: AuthContext;
      /** Raw access token, useful for downstream calls (e.g. Supabase storage). */
      accessToken?: string;
      /** Set by requireToken: the verified Supabase user, profile not required. */
      supabaseUser?: SupabaseAuthUser;
    }
  }
}

function readBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) {
    return null;
  }
  return token.trim();
}

/**
 * Verifies the Supabase access token only. Used by /sync, which is what
 * creates the MongoDB profile, so the profile may not exist yet.
 */
export async function requireToken(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = readBearerToken(req);
  if (!token) {
    throw ApiError.unauthorized("Missing Authorization: Bearer <access token> header");
  }

  req.accessToken = token;
  req.supabaseUser = await verifyAccessToken(token);
  next();
}

/**
 * Verifies the Supabase access token and loads the matching MongoDB profile.
 * Attach to any route that needs an authenticated user.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = readBearerToken(req);
  if (!token) {
    throw ApiError.unauthorized("Missing Authorization: Bearer <access token> header");
  }

  const supabaseUser = await verifyAccessToken(token);
  const profile = await User.findOne({ supabaseId: supabaseUser.id });

  if (!profile) {
    throw ApiError.forbidden("TripMate profile has not been created for this account");
  }

  if (profile.status === "suspended") {
    throw ApiError.forbidden("This account has been suspended");
  }

  req.accessToken = token;
  req.auth = {
    supabaseId: profile.supabaseId,
    email: profile.email,
    role: profile.role,
    status: profile.status,
    profileId: profile._id.toString(),
  };

  next();
}

/**
 * Same verification as requireAuth but never rejects the request.
 * Used during registration, where the session may not exist yet
 * (email confirmation enabled) but we still want to validate the token.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = readBearerToken(req);
  if (!token) {
    next();
    return;
  }

  try {
    const supabaseUser = await verifyAccessToken(token);
    const profile = await User.findOne({ supabaseId: supabaseUser.id });
    if (profile) {
      req.accessToken = token;
      req.auth = {
        supabaseId: profile.supabaseId,
        email: profile.email,
        role: profile.role,
        status: profile.status,
        profileId: profile._id.toString(),
      };
    }
  } catch {
    // Ignore: an unusable token is treated as "no session" here.
  }

  next();
}

/** Role gate for future admin-only routes. Always used after requireAuth. */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      throw ApiError.unauthorized();
    }
    if (!roles.includes(req.auth.role)) {
      throw ApiError.forbidden(`Requires one of the following roles: ${roles.join(", ")}`);
    }
    next();
  };
}