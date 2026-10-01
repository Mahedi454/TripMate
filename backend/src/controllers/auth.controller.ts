import type { Request, Response } from "express";
import { createProfileSchema } from "../schemas/auth.schema.js";
import { createOrGetUserProfile } from "../services/auth.service.js";
import { ApiError } from "../middleware/error.middleware.js";
import type { CreateProfileResponse } from "../types/auth.js";

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