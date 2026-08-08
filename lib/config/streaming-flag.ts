/**
 * streaming-flag.ts
 *
 * Single source of truth for the streaming_enabled feature flag.
 *
 * Set NEXT_PUBLIC_STREAMING_ENABLED=false in .env.local to switch every
 * chat surface back to wait-then-render-full-block mode without a code deploy.
 *
 * Default: true (streaming on)
 */

export const STREAMING_ENABLED: boolean =
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_STREAMING_ENABLED !== 'false';
