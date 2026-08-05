/**
 * Stub for convex/browser — used by Vite alias when no Convex URL is configured.
 */
export class ConvexHttpClient {
  constructor(_url: string) {}
  async query(_ref: unknown, _args?: unknown) { return null; }
  async mutation(_ref: unknown, _args?: unknown) { return null; }
  async action(_ref: unknown, _args?: unknown) { return null; }
}

export class ConvexClient {
  constructor(_url: string) {}
  query(_ref: unknown, _args?: unknown) { return Promise.resolve(null); }
  mutation(_ref: unknown, _args?: unknown) { return Promise.resolve(null); }
}
