export function getSanitizedConvexUrl(): string {
  const url = (import.meta.env as Record<string, string>)['VITE_CONVEX_URL'] || '';
  if (!url) return 'https://placeholder.convex.cloud';
  return url.replace(/\/+$/, '');
}
