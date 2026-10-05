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
  // .env files and the Vercel dashboard often store the key with literal "\n",
  // and Vercel keeps quotes pasted around the value, which .env files would strip.
  FIREBASE_PRIVATE_KEY: z
    .string()
    .min(1, "FIREBASE_PRIVATE_KEY is required")
    .transform((key) => key.trim().replace(/^"|"$/g, "").replace(/\\n/g, "\n")),

  FRONTEND_URL: z.string().default("http://localhost:3000"),

  // Comma separated emails that are promoted to the admin role when they sign in.
  ADMIN_EMAILS: z.string().default(""),
});

type EnvValues = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

/**
 * What is wrong with the environment, one line per variable. Never contains
 * values, so it is safe to return from the API.
 */
export const envIssues: string[] = parsed.success
  ? []
  : parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);

if (!parsed.success) {
  console.error(`[env] Invalid environment variables:\n  - ${envIssues.join("\n  - ")}`);
}

// Throwing here would crash the whole Vercel function with a bare 500, so
// boot anyway with every invalid value unset; app.ts then answers each
// request with envIssues instead. server.ts still exits early in development.
const lenientEnvSchema = z.object(
  Object.fromEntries(
    Object.entries(envSchema.shape).map(([key, schema]) => [
      key,
      (schema as z.ZodTypeAny).catch(undefined),
    ]),
  ),
);

const values = (parsed.success ? parsed.data : lenientEnvSchema.parse(process.env)) as EnvValues;

const allowedOrigins = (values.FRONTEND_URL ?? "").split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const adminEmails = (values.ADMIN_EMAILS ?? "").split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const env = {
  ...values,
  isProduction: values.NODE_ENV === "production",
  allowedOrigins,
  adminEmails,
};

export type Env = typeof env;