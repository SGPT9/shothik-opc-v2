import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  getInsforgePublicConfig,
  hasInsforgePublicConfig,
  resolveInsforgePublicEnv,
} from "./config";

describe("insforge public config", () => {
  it("resolves config from Vite-native VITE_INSFORGE_* variables", () => {
    expect(
      resolveInsforgePublicEnv({
        VITE_INSFORGE_URL: "https://vite.insforge.app",
        VITE_INSFORGE_ANON_KEY: "ik_vite_anon_key",
      }),
    ).toEqual({
      baseUrl: "https://vite.insforge.app",
      anonKey: "ik_vite_anon_key",
    });
  });

  it("falls back to inlined NEXT_PUBLIC_INSFORGE_* values", () => {
    expect(
      resolveInsforgePublicEnv({
        NEXT_PUBLIC_INSFORGE_URL: "https://example.insforge.app",
        NEXT_PUBLIC_INSFORGE_ANON_KEY: "ik_public_anon_key",
      }),
    ).toEqual({
      baseUrl: "https://example.insforge.app",
      anonKey: "ik_public_anon_key",
    });
  });

  it("returns empty values when nothing browser-safe is configured", () => {
    // A server-side API key is never consulted — there is no way to pass it.
    expect(resolveInsforgePublicEnv({})).toEqual({ baseUrl: "", anonKey: "" });
  });

  it("prefers VITE_* over legacy NEXT_PUBLIC_* when both exist", () => {
    expect(
      resolveInsforgePublicEnv({
        VITE_INSFORGE_URL: "https://vite.insforge.app",
        VITE_INSFORGE_ANON_KEY: "ik_vite",
        NEXT_PUBLIC_INSFORGE_URL: "https://legacy.insforge.app",
        NEXT_PUBLIC_INSFORGE_ANON_KEY: "ik_legacy",
      }),
    ).toEqual({ baseUrl: "https://vite.insforge.app", anonKey: "ik_vite" });
  });

  it("build artifact: vite inlines the Insforge URL and anon key at build time", () => {
    // This verifies the production bundle actually received the Insforge public config
    // via vite's `define` block — catching a misconfigured deployment before it ships.
    const distDir = path.resolve("dist/public/assets");
    if (!fs.existsSync(distDir)) {
      console.warn("dist/ not built — run `vite build` to generate the bundle for this check");
      return; // skip in environments without a build artifact
    }
    const bundleFiles = fs.readdirSync(distDir).filter((f) => f.endsWith(".js"));
    const allContent = bundleFiles
      .map((f) => fs.readFileSync(path.join(distDir, f), "utf8"))
      .join("\n");
    // The URL must be inlined; the anon key starts with "ik_"
    expect(allContent).toMatch(/insforge\.app/);
    expect(allContent).toMatch(/ik_/);
  });
});
