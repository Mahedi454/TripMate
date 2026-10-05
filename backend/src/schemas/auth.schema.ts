import { z } from "zod";

/** Body of POST /api/auth/register. Identity and email come from the ID token. */
export const registerProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
});

export type RegisterProfileInput = z.infer<typeof registerProfileSchema>;
