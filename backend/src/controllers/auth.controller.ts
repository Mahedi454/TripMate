import type { Request, Response } from "express";
import { registerProfileSchema } from "../schemas/auth.schema.js";
import {
  findUserByFirebaseUid,
  listUsers,
  registerProfile,
  syncUserOnLogin,
} from "../services/auth.service.js";
import { ApiError } from "../middleware/error.middleware.js";
import type { CreateProfileResponse, UserListResponse, UserResponse } from "../types/auth.js";

/**
 * POST /api/auth/register
 * Header: Authorization: Bearer <Firebase ID token>
 * Body: { name }
 *
 * Runs right after createUserWithEmailAndPassword, before the email is
 * verified. Uid and email come from the token, never from the body.
 */
export async function registerUser(req: Request, res: Response): Promise<void> {
  if (!req.firebaseUser) {
    throw ApiError.unauthorized();
  }

  const parsed = registerProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest("Profile validation failed", parsed.error.flatten());
  }

  const user = await registerProfile(req.firebaseUser, parsed.data.name);

  res.status(201).json({
    success: true,
    user,
  } satisfies CreateProfileResponse);
}

/**
 * POST /api/auth/sync
 * Header: Authorization: Bearer <Firebase ID token>
 *
 * Called after every successful sign-in. Creates the profile when missing and
 * records lastLoginAt / loginCount.
 */
export async function syncLogin(req: Request, res: Response): Promise<void> {
  if (!req.firebaseUser) {
    throw ApiError.unauthorized();
  }

  const user = await syncUserOnLogin(req.firebaseUser);

  res.json({
    success: true,
    user,
  } satisfies UserResponse);
}

/** GET /api/auth/me - the signed-in user's profile. */
export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.auth) {
    throw ApiError.unauthorized();
  }

  const user = await findUserByFirebaseUid(req.auth.firebaseUid);
  if (!user) {
    throw ApiError.notFound("TripPilot profile not found");
  }

  res.json({
    success: true,
    user,
  } satisfies UserResponse);
}

/** GET /api/admin/users - every registered user with their login stats. */
export async function getAllUsers(_req: Request, res: Response): Promise<void> {
  const users = await listUsers();

  res.json({
    success: true,
    total: users.length,
    users,
  } satisfies UserListResponse);
}
