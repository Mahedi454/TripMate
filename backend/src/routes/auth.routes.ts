import { Router } from "express";
import { createProfile, getMe, syncLogin } from "../controllers/auth.controller.js";
import { optionalAuth, requireAuth, requireToken } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";

const authRouter = Router();

// Async middleware is wrapped too: Express 4 does not catch rejected promises,
// so a thrown ApiError would otherwise leave the request hanging.

// Called by the frontend immediately after Supabase signUp succeeds.
authRouter.post("/profile", asyncHandler(optionalAuth), asyncHandler(createProfile));

// Called after every successful sign-in. Creates the profile if needed and records the login.
authRouter.post("/sync", asyncHandler(requireToken), asyncHandler(syncLogin));

authRouter.get("/me", asyncHandler(requireAuth), asyncHandler(getMe));

export default authRouter;
