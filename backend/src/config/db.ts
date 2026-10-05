import mongoose from "mongoose";
import { env } from "./env.js";

const LOG_PREFIX = "[db]";

let connecting: Promise<typeof mongoose> | null = null;

/**
 * Opens the Mongoose connection, reusing it when already open. Throws if
 * MongoDB is unreachable. Safe to call on every request: on Vercel there is no
 * server.ts startup, so app.ts connects lazily through this.
 */
export async function connectDatabase(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!connecting) {
    mongoose.set("strictQuery", true);
    connecting = mongoose
      .connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10_000,
      })
      .then((connection) => {
        console.log(`${LOG_PREFIX} connected to MongoDB (${connection.connection.name})`);
        return connection;
      })
      .catch((error: unknown) => {
        // Let the next request try again instead of caching the failure.
        connecting = null;
        throw error;
      });
  }

  return connecting;
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    return;
  }
  await mongoose.disconnect();
  console.log(`${LOG_PREFIX} MongoDB connection closed`);
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/** Maps mongoose driver errors to log-friendly output. */
export function logDatabaseError(error: unknown): void {
  if (error instanceof mongoose.Error.MongooseServerSelectionError) {
    console.error(`${LOG_PREFIX} cannot reach MongoDB - check MONGODB_URI`);
    return;
  }
  if (error instanceof mongoose.Error.ValidationError) {
    console.error(`${LOG_PREFIX} schema validation failed`, error.message);
    return;
  }
  console.error(`${LOG_PREFIX} unexpected error`, error);
}