// Server-only file - stubbed for Vite (no next/server in client build)
export async function verifyAuthToken(req: any): Promise<any> {
  return { authenticated: true };
}
