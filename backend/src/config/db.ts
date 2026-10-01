import mongoose from "mongoose";
import { env } from "./env.js";

const LOG_PREFIX = "[db]";

/** Opens the Mongoose connection. Throws if MongoDB is unreachable. */
export async function connectDatabase(): Promise<typeof mongoose> {
  mongoose.set("strictQuery", true);

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000,
  });

  console.log(`${LOG_PREFIX} connected to MongoDB (${mongoose.connection.name})`);
  return mongoose;
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