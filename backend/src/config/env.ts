import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20, "SUPABASE_SERVICE_ROLE_KEY is required"),

  FRONTEND_URL: z.string().default("http://localhost:3000"),
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

export const env = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === "production",
  allowedOrigins,
};

export type Env = typeof env;