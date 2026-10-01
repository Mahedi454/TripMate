import { z } from "zod";

/** Supabase user IDs are UUIDs. Rejecting anything else blocks fake identities. */
export const supabaseIdSchema = z
  .string()
  .trim()
  .uuid("supabaseId must be a valid UUID");

export const createProfileSchema = z.object({
  supabaseId: supabaseIdSchema,
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .toLowerCase(),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;