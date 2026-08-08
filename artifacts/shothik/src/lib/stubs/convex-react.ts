/**
 * Stub for convex/react — used by Vite alias when no Convex URL is configured.
 * All hooks return undefined/null (pages show loading/empty states).
 * Replace this alias with the real convex/react once a VITE_CONVEX_URL is set.
 */

export function useQuery(_ref: unknown, _args?: unknown): undefined {
  return undefined;
}

export function useMutation(_ref: unknown) {
  return async (..._args: unknown[]) => {
    console.warn("[convex-stub] useMutation called — backend not connected");
  };
}

export function useAction(_ref: unknown) {
  return async (..._args: unknown[]) => {
    console.warn("[convex-stub] useAction called — backend not connected");
  };
}

export function useConvex() {
  return null;
}

export function usePaginatedQuery(_ref: unknown, _args?: unknown, _opts?: unknown) {
  return { results: [], status: "LoadingFirstPage" as const, loadMore: () => {} };
}

export function ConvexProviderWithAuth({ children }: { children: React.ReactNode }) {
  return children;
}

export function ConvexReactClient(_url: string) {
  return {};
}

import React from "react";
