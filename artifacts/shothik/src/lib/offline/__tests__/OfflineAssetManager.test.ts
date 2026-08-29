import { describe, it, expect } from "vitest";
import { OfflineAssetManager } from "../OfflineAssetManager";

describe("OfflineAssetManager: In-Browser Asset Caching", () => {
  it("handles non-browser environments gracefully without crashing", async () => {
    const asset = await OfflineAssetManager.getAsset("test_key");
    expect(asset).toBeNull();
  });

  it("handles put operations safely in fallback runtime", async () => {
    const success = await OfflineAssetManager.putAsset("test_key", "sample_content", "dictionary");
    expect(typeof success).toBe("boolean");
  });

  it("preloads core assets without throwing exceptions", async () => {
    await expect(OfflineAssetManager.preloadCoreAssets()).resolves.not.toThrow();
  });
});
