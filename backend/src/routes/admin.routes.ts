import { Router } from "express";
import { getAllUsers } from "../controllers/auth.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";

const adminRouter = Router();

adminRouter.use(asyncHandler(requireAuth), requireRole("admin"));

adminRouter.get("/users", asyncHandler(getAllUsers));

export default adminRouter;
