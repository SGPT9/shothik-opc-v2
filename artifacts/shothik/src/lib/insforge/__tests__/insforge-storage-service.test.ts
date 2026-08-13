import { describe, it, expect } from "vitest";
import { InsForgeStorageService } from "../insforge-storage-service";

describe("InsForgeStorageService Bucket Operations", () => {
  it("should upload a slide deck PDF buffer and return public URL and key", async () => {
    const dummyBuffer = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    const res = await InsForgeStorageService.uploadFile("artifacts", "pitch_deck.pdf", dummyBuffer, "application/pdf");

    expect(res.url).toContain("https://ers8j28a.ap-southeast.insforge.app/storage/v1/object/public/artifacts/");
    expect(res.key).toContain("pitch_deck.pdf");
    expect(res.bucket).toBe("artifacts");
    expect(res.sizeBytes).toBe(4);
  });

  it("should generate a signed download URL for private book manuscripts", async () => {
    const signedUrl = await InsForgeStorageService.getSignedUrl("book-manuscripts", "manuscript_99.epub", 3600);
    expect(signedUrl).toContain("storage/v1/object/sign/book-manuscripts/");
    expect(signedUrl).toContain("expires=3600");
  });

  it("should delete a file from InsForge storage bucket", async () => {
    const deleted = await InsForgeStorageService.deleteFile("avatars", "avatar_vrm_1.vrm");
    expect(deleted).toBe(true);
  });
});
