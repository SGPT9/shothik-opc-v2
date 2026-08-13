// Server-only file - stubbed for Vite (no next/server in client build)
export interface TwinAuthResult {
  authenticated: boolean;
  error?: string;
  authType?: string;
  userId?: string;
  twinKey?: string;
  twinId?: string;
  ability?: any;
  keyHash?: string;
  token?: string;
}
