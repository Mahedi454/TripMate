import type { Server } from "node:http";
import app from "./app.js";
import { connectDatabase, disconnectDatabase, logDatabaseError } from "./config/db.js";
import { env } from "./config/env.js";

async function bootstrap(): Promise<void> {
  try {
    await connectDatabase();
  } catch (error) {
    logDatabaseError(error);
    process.exit(1);
  }

  const server: Server = app.listen(env.PORT, () => {
    console.log(`[server] TripPilot API listening on http://localhost:${env.PORT}`);
    console.log(`[server] environment: ${env.NODE_ENV}`);
    console.log(`[server] allowed frontend origins: ${env.allowedOrigins.join(", ")}`);
  });

  const shutdown = (signal: string): void => {
    console.log(`[server] ${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

void bootstrap();