import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/db.js";
import { asyncHandler, errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import type { HealthResponse } from "./types/auth.js";

const app = express();

app.disable("x-powered-by");

app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin/non-browser callers (curl, server-to-server) which send no Origin.
      // Unknown origins get no CORS headers back, so the browser blocks the response.
      if (!origin || env.allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get(
  "/api/health",
  (_req, res) => {
    res.json({
      success: true,
      message: "TripPilot API is running",
    } satisfies HealthResponse);
  },
);

// On Vercel this file is the entrypoint and server.ts never runs, so the
// database connection is opened by the first request and then reused.
app.use(
  asyncHandler(async (_req, _res, next) => {
    await connectDatabase();
    next();
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;