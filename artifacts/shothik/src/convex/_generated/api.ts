// Stub for Convex generated API - not active in this Replit deployment
export const api: Record<string, Record<string, unknown>> = new Proxy({}, {
  get: (_, ns) => new Proxy({}, { get: (_, fn) => `${String(ns)}.${String(fn)}` })
});
export const internal = api;
