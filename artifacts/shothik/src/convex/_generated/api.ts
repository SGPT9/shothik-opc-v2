// Convex generated-API shim for the Vite port.
// Uses convex's `anyApi` so function references resolve to real deployed
// functions (e.g. api.projects.list -> "projects:list") without needing
// the full codegen output in this repo.
import { anyApi } from "convex/server";

export const api = anyApi;
export const internal = anyApi;
