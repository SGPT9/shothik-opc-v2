import { describe, expect, it, vi } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

vi.mock("@/lib/server-auth", () => ({
  getChatAuthenticatedUser: vi.fn().mockResolvedValue({ _id: "usr_storage_test_123" }),
}));

vi.mock("@/lib/insforge/storage-adapter", () => ({
  InsForgeStorageAdapter: {
    uploadFile: vi.fn().mockResolvedValue({
      url: "https://shothik.insforge.app/storage/v1/object/public/artifacts/test.png",
      key: "user_usr_storage_test_123/test.png",
      bucket: "artifacts",
    }),
  },
}));

describe("POST /api/hermes/storage/upload", () => {
  it("uploads a file to InsForge storage bucket for authenticated users", async () => {
    const req = new NextRequest("http://localhost:3000/api/hermes/storage/upload", {
      method: "POST",
      body: JSON.stringify({
        bucket: "artifacts",
        filename: "chart.png",
        fileData: "base64_data_image_mock",
        contentType: "image/png",
      }),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.data.url).toContain("https://shothik.insforge.app");
    expect(data.data.key).toBe("user_usr_storage_test_123/test.png");
    expect(data.data.bucket).toBe("artifacts");
  });
});
