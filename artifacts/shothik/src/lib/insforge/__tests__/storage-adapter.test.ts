import { describe, expect, it, vi } from "vitest";

const mockUpload = vi.fn().mockResolvedValue({
  data: { key: "uploads/test.png" },
  error: null,
});

const mockRemove = vi.fn().mockResolvedValue({
  data: {},
  error: null,
});

const mockGetPublicUrl = vi.fn().mockReturnValue({
  data: { publicUrl: "https://shothik.insforge.app/storage/v1/object/public/artifacts/uploads/test.png" },
});

vi.mock("@/lib/insforge/client", () => ({
  getInsforgeBrowserClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({
        upload: mockUpload,
        remove: mockRemove,
        getPublicUrl: mockGetPublicUrl,
      })),
    },
  })),
}));

import { InsForgeStorageAdapter } from "../storage-adapter";

describe("InsForgeStorageAdapter Module", () => {
  it("uploads file to storage bucket and returns key and public URL", async () => {
    const result = await InsForgeStorageAdapter.uploadFile({
      bucket: "artifacts",
      path: "uploads/test.png",
      file: "base64_data_string",
      contentType: "image/png",
    });

    expect(result.bucket).toBe("artifacts");
    expect(result.key).toBe("uploads/test.png");
    expect(result.url).toContain("https://shothik.insforge.app");
    expect(mockUpload).toHaveBeenCalledWith("uploads/test.png", "base64_data_string");
  });

  it("deletes file from storage bucket", async () => {
    const success = await InsForgeStorageAdapter.deleteFile("artifacts", "uploads/test.png");
    expect(success).toBe(true);
    expect(mockRemove).toHaveBeenCalledWith(["uploads/test.png"]);
  });

  it("generates public URL for a file key", () => {
    const url = InsForgeStorageAdapter.getPublicUrl("artifacts", "uploads/test.png");
    expect(url).toContain("https://shothik.insforge.app");
  });
});
