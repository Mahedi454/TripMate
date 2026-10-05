import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  // Firebase console -> Project settings -> Service accounts -> Generate new private key.
  // Server side only, never commit real values.
  FIREBASE_PROJECT_ID: z.string().min(1, "FIREBASE_PROJECT_ID is required"),
  FIREBASE_CLIENT_EMAIL: z.string().email("FIREBASE_CLIENT_EMAIL must be the service account email"),
  // .env files and the Vercel dashboard often store the key with literal "\n".
  FIREBASE_PRIVATE_KEY: z
    .string()
    .min(1, "FIREBASE_PRIVATE_KEY is required")
    .transform((key) => key.replace(/\\n/g, "\n")),

  FRONTEND_URL: z.string().default("http://localhost:3000"),

  // Comma separated emails that are promoted to the admin role when they sign in.
  ADMIN_EMAILS: z.string().default(""),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid environment variables:\n${details}`);
}

const allowedOrigins = parsed.data.FRONTEND_URL.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const adminEmails = parsed.data.ADMIN_EMAILS.split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const env = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === "production",
  allowedOrigins,
  adminEmails,
};

export type Env = typeof env;