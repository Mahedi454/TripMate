import type { NextFunction, Request, Response } from "express";
import type { DecodedIdToken } from "firebase-admin/auth";
import { User } from "../models/User.js";
import { assertEmailVerified, verifyIdToken } from "../services/auth.service.js";
import type { AuthContext, UserRole } from "../types/auth.js";
import { ApiError } from "./error.middleware.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Set by requireAuth when a valid session and profile are present. */
      auth?: AuthContext;
      /** Raw Firebase ID token. */
      accessToken?: string;
      /** Verified token claims, set by requireToken and requireAuth. */
      firebaseUser?: DecodedIdToken;
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
 * Verifies the Firebase ID token only. Used by /register and /sync, which are
 * what create the MongoDB profile, so the profile may not exist yet.
 */
export async function requireToken(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = readBearerToken(req);
  if (!token) {
    throw ApiError.unauthorized("Missing Authorization: Bearer <ID token> header");
  }

  req.accessToken = token;
  req.firebaseUser = await verifyIdToken(token);
  next();
}

/**
 * Verifies the Firebase ID token, requires a verified email and loads the
 * matching MongoDB profile. Attach to any route that needs a signed-in user.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = readBearerToken(req);
  if (!token) {
    throw ApiError.unauthorized("Missing Authorization: Bearer <ID token> header");
  }

  const firebaseUser = await verifyIdToken(token);
  assertEmailVerified(firebaseUser);

  const profile = await User.findOne({ firebaseUid: firebaseUser.uid });

  if (!profile) {
    throw ApiError.forbidden("TripPilot profile has not been created for this account");
  }

  if (profile.status === "suspended") {
    throw ApiError.forbidden("This account has been suspended");
  }

  req.accessToken = token;
  req.firebaseUser = firebaseUser;
  req.auth = {
    firebaseUid: profile.firebaseUid,
    email: profile.email,
    role: profile.role,
    status: profile.status,
    profileId: profile._id.toString(),
  };

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