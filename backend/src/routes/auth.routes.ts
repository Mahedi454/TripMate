import { Router } from "express";
import { createProfile } from "../controllers/auth.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";

const authRouter = Router();

// Called by the frontend immediately after Supabase signUp succeeds.
authRouter.post("/profile", optionalAuth, asyncHandler(createProfile));

// Foundation for the protected API. Intended future usage:
//   authRouter.get("/me", requireAuth, asyncHandler(getMe));
// with `requireAuth` from ../middleware/auth.middleware.js

export default authRouter;