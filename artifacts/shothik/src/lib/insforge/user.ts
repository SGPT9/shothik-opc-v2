export interface AuthenticatedUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  accountType?: string;
  authProvider: "insforge" | "legacy" | "guest" | string;
  credits?: number;
  tier?: string;
  country?: string;
  [key: string]: unknown;
}

export function normalizeInsforgeUser(user: any): AuthenticatedUser | null {
  if (!user || !user.id || !user.email) return null;

  const metadata = user.userMetadata || user.user_metadata || {};
  const name =
    metadata.full_name ||
    metadata.name ||
    user.name ||
    user.email.split("@")[0];

  return {
    _id: user.id,
    id: user.id,
    email: user.email,
    name,
    role: metadata.role || user.role,
    accountType: metadata.account_type || metadata.accountType || user.accountType,
    authProvider: "insforge",
    avatar: metadata.avatar || metadata.avatar_url || user.avatar,
    credits: user.credits ?? metadata.credits,
    tier: user.tier || metadata.tier,
    country: user.country || metadata.country,
  };
}

export function normalizeLegacyUser(user: any): AuthenticatedUser | null {
  if (!user || (!user._id && !user.id) || !user.email) return null;

  const id = user._id || user.id;
  return {
    _id: id,
    id,
    email: user.email,
    name: user.name || user.email.split("@")[0],
    role: user.role,
    accountType: user.accountType || user.account_type,
    authProvider: "legacy",
    avatar: user.avatar,
    credits: user.credits,
    tier: user.tier,
    country: user.country,
  };
}
