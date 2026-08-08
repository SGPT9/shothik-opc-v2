export interface AuthenticatedUser {
  _id: string; name: string; email: string; avatar?: string; role?: string;
  [key: string]: unknown;
}
export function normalizeInsforgeUser(user: unknown): AuthenticatedUser | null {
  if (!user) return null; return user as AuthenticatedUser;
}
export function normalizeLegacyUser(user: unknown): AuthenticatedUser | null {
  if (!user) return null; return user as AuthenticatedUser;
}
