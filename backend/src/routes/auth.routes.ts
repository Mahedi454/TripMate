import { Router } from "express";
import { getMe, registerUser, syncLogin } from "../controllers/auth.controller.js";
import { requireAuth, requireToken } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";

const authRouter = Router();

// Async middleware is wrapped too: Express 4 does not catch rejected promises,
// so a thrown ApiError would otherwise leave the request hanging.

// Called by the frontend right after Firebase creates the account.
authRouter.post("/register", asyncHandler(requireToken), asyncHandler(registerUser));

// Called after every successful sign-in. Creates the profile if needed and records the login.
authRouter.post("/sync", asyncHandler(requireToken), asyncHandler(syncLogin));

authRouter.get("/me", asyncHandler(requireAuth), asyncHandler(getMe));

export default authRouter;
