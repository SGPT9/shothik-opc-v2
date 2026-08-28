import { z } from 'zod';

/**
 * Validates environment variables at build/startup time
 * Throws error if required vars are missing
 */

const serverEnvSchema = z.object({
  // Database — PostgreSQL + SQLite
  DATABASE_URL: z.string().optional(),
  CONVEX_DEPLOYMENT: z.string().optional(),
  
  // Auth — Clerk removed, Better Auth in use
  // (no server-side auth key required in schema)
  
  // LLM APIs (at least one required — validated below)
  KIMI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  
  // Payments (optional — not all environments use Stripe)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_STREAMING_ENABLED: z.string().optional().default("true"),
});

/**
 * Feature flag check for token-level streaming responses
 */
export function isStreamingEnabled(): boolean {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_STREAMING_ENABLED === "false") {
    return false;
  }
  return true;
}

/**
 * Server-side environment validation
 */
export function validateServerEnv() {
  const result = serverEnvSchema.safeParse(process.env);
  
  if (!result.success) {
    const errors = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Server environment validation failed:\n${errors}`);
  }
  
  // Ensure at least one LLM provider
  if (!process.env.KIMI_API_KEY && !process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY && !process.env.OPENROUTER_API_KEY && !process.env.GEMINI_API_KEY) {
    throw new Error('At least one LLM provider must be configured (KIMI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, OPENROUTER_API_KEY, or GEMINI_API_KEY)');
  }
  
  return result.data;
}

/**
 * Client-side environment validation
 */
export function validateClientEnv() {
  const result = clientEnvSchema.safeParse(process.env);
  
  if (!result.success) {
    const errors = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Client environment validation failed:\n${errors}`);
  }
  
  return result.data;
}
