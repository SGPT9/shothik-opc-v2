import { afterEach, describe, expect, it, vi } from "vitest";
import { CloudflareR2Adapter } from "../r2-adapter";
import { InsForgeStorageAdapter } from "@/lib/insforge/storage-adapter";

vi.mock("@/lib/insforge/storage-adapter", () => ({
  InsForgeStorageAdapter: {
    uploadFile: vi.fn(),
  },
}));

describe("CloudflareR2Adapter", () => {
  const ORIGINAL_ENV = process.env;

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.restoreAllMocks();
  });

  it("uploads object to Cloudflare R2 when credentials are available", async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = "cf_acc_123";
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID = "cf_key_123";
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY = "cf_secret_123";
    process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN = "cdn.shothik.ai";

    const res = await CloudflareR2Adapter.uploadObject({
      key: "avatars/vrm_model_001.vrm",
      fileBuffer: Buffer.from("dummy_vrm_bytes"),
      contentType: "model/gltf-binary",
      workspaceId: "ws_r2_test",
    });

    expect(res.provider).toBe("cloudflare_r2");
    expect(res.url).toBe("https://cdn.shothik.ai/avatars/vrm_model_001.vrm");
    expect(res.key).toBe("avatars/vrm_model_001.vrm");
  });

  it("falls back to InsForge storage bucket when Cloudflare credentials are missing", async () => {
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
    delete process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;

    vi.mocked(InsForgeStorageAdapter.uploadFile).mockResolvedValueOnce({
      url: "https://ers8j28a.ap-southeast.insforge.app/storage/v1/object/public/shothik-r2-assets/avatars/vrm_fallback.vrm",
      key: "avatars/vrm_fallback.vrm",
      bucket: "shothik-r2-assets",
    });

    const res = await CloudflareR2Adapter.uploadObject({
      key: "avatars/vrm_fallback.vrm",
      fileBuffer: Buffer.from("dummy_fallback_bytes"),
      contentType: "model/gltf-binary",
      workspaceId: "ws_r2_test",
    });

    expect(res.provider).toBe("insforge_storage_fallback");
    expect(res.url).toContain("insforge.app");
  });

  it("resolves public CDN URLs correctly", () => {
    process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN = "cdn.shothik.ai";
    const url = CloudflareR2Adapter.getPublicCdnUrl("slides/deck_999.pdf");
    expect(url).toBe("https://cdn.shothik.ai/slides/deck_999.pdf");
  });
});
