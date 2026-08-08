/**
 * Navigation compatibility shim — replaces next/navigation for Vite+wouter.
 */
import { useLocation, useSearch, useParams as useWouterParams } from 'wouter';

export function usePathname(): string {
  const [location] = useLocation();
  return location;
}

export function useRouter() {
  const [, navigate] = useLocation();
  return {
    push: (path: string) => navigate(path),
    replace: (path: string) => navigate(path, { replace: true }),
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    refresh: () => window.location.reload(),
    prefetch: () => {},
  };
}

export function useSearchParams(): URLSearchParams {
  // Next.js useSearchParams returns a ReadonlyURLSearchParams (has .get/.has/etc.)
  // wouter's useSearch is reactive to navigation, unlike reading window.location directly.
  const search = useSearch();
  return new URLSearchParams(search);
}

export function useParams<T extends Record<string, string>>(): T {
  return useWouterParams() as T;
}

export function redirect(path: string) {
  if (typeof window !== 'undefined') {
    window.location.href = path;
  }
}

export function notFound() {}

export type ReadonlyURLSearchParams = URLSearchParams;
