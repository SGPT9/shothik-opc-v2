/**
 * Centralized Convex URL resolver.
 * Always trims leading/trailing whitespace and strips trailing slashes to prevent invalid URL errors.
 */
export function getSanitizedConvexUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_CONVEX_URL ||
    process.env.CONVEX_URL ||
    "https://dashing-mandrill-233.convex.cloud";

  return raw.trim().replace(/\/+$/, "");
}
