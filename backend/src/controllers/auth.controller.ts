import type { Request, Response } from "express";
import { createProfileSchema } from "../schemas/auth.schema.js";
import {
  createOrGetUserProfile,
  findUserBySupabaseId,
  listUsers,
  syncUserOnLogin,
} from "../services/auth.service.js";
import { ApiError } from "../middleware/error.middleware.js";
import type { CreateProfileResponse, UserListResponse, UserResponse } from "../types/auth.js";

/**
 * POST /api/auth/profile
 * Body: { supabaseId, name, email }
 *
 * Runs right after Supabase signUp. Idempotent, so a retry is safe.
 * When the request also carries a valid access token, the token's user id
 * must match the body, otherwise the profile is created for somebody else.
 */
export async function createProfile(req: Request, res: Response): Promise<void> {
  const parsed = createProfileSchema.safeParse(req.body);

  if (!parsed.success) {
    throw ApiError.badRequest("Profile validation failed", parsed.error.flatten());
  }

  const { supabaseId } = parsed.data;

  if (req.auth && req.auth.supabaseId !== supabaseId) {
    throw ApiError.forbidden("Session does not match the supplied supabaseId");
  }

  const user = await createOrGetUserProfile(parsed.data);

  res.status(201).json({
    success: true,
    user,
  } satisfies CreateProfileResponse);
}

/**
 * POST /api/auth/sync
 * Header: Authorization: Bearer <supabase access token>
 *
 * Called after every successful sign-in. Creates the profile when missing and
 * records lastLoginAt / loginCount.
 */
export async function syncLogin(req: Request, res: Response): Promise<void> {
  if (!req.supabaseUser) {
    throw ApiError.unauthorized();
  }

  const user = await syncUserOnLogin(req.supabaseUser);

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

  const user = await findUserBySupabaseId(req.auth.supabaseId);
  if (!user) {
    throw ApiError.notFound("TripMate profile not found");
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
