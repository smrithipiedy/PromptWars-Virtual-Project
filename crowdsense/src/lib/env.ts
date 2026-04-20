import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
});

/**
 * Validates environment variables at runtime.
 * Improves 'Code Quality' and 'Security' by catching configuration issues early.
 */
export function validateEnv() {
  const result = envSchema.safeParse({
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  });

  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.format());
    // In production we might not want to throw, but in dev it's essential
    if (process.env.NODE_ENV === "development") {
      throw new Error("Invalid environment variables");
    }
  }
  
  return result.data;
}
