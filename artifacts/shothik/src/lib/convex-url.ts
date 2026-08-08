export function getSanitizedConvexUrl(): string {
  const url = (import.meta.env as Record<string, string>)['VITE_CONVEX_URL'] ||
              (import.meta.env as Record<string, string>)['NEXT_PUBLIC_CONVEX_URL'] ||
              (import.meta.env as Record<string, string>)['CONVEX_URL'] || '';
  if (!url) return 'https://dashing-mandrill-233.convex.cloud';
  return url.replace(/\/+$/, '');
}

