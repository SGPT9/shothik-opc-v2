/**
 * Stub for convex/server — used by Vite alias when no Convex URL is configured.
 */
export type FunctionReference<_T extends string, _V extends string = "public", _A = unknown, _R = unknown> = string;
export type OptionalRestArgs<_T> = [];
export type PaginationOptions = { numItems: number; cursor: string | null };
export type PaginationResult<T> = { page: T[]; isDone: boolean; continueCursor: string };
