import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
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
      message: "TripMate API is running",
    } satisfies HealthResponse);
  },
);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;