import { describe, expect, it, vi } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { CloudflareR2Adapter } from "@/lib/cloudflare/r2-adapter";

vi.mock("@/lib/server-auth", () => ({
  getChatAuthenticatedUser: vi.fn(),
}));

vi.mock("@/lib/cloudflare/r2-adapter", () => ({
  CloudflareR2Adapter: {
    uploadObject: vi.fn(),
  },
}));

describe("POST /api/hermes/storage/r2/upload", () => {
  it("rejects unauthenticated requests with status 401", async () => {
    vi.mocked(getChatAuthenticatedUser).mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost:3000/api/hermes/storage/r2/upload", {
      method: "POST",
      body: JSON.stringify({
        key: "test/asset.png",
        contentBase64: "aGVsbG8=",
      }),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(401);
  });

  it("uploads object to Cloudflare R2 for authenticated user with status 201", async () => {
    vi.mocked(getChatAuthenticatedUser).mockResolvedValueOnce({
      _id: "user_r2_123",
      id: "user_r2_123",
      email: "r2@shothik.ai",
      name: "R2 User",
      role: "user",
      authProvider: "insforge",
    });

    vi.mocked(CloudflareR2Adapter.uploadObject).mockResolvedValueOnce({
      key: "test/asset.png",
      url: "https://cdn.shothik.ai/test/asset.png",
      bucket: "shothik-r2-assets",
      sizeBytes: 5,
      uploadedAt: 1700000000,
      provider: "cloudflare_r2",
    });

    const req = new NextRequest("http://localhost:3000/api/hermes/storage/r2/upload", {
      method: "POST",
      body: JSON.stringify({
        key: "test/asset.png",
        contentBase64: "aGVsbG8=",
        contentType: "image/png",
        workspaceId: "ws_r2_test",
      }),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.data.url).toBe("https://cdn.shothik.ai/test/asset.png");
    expect(data.data.provider).toBe("cloudflare_r2");
  });

  it("handles upload errors with status 500", async () => {
    vi.mocked(getChatAuthenticatedUser).mockResolvedValueOnce({
      _id: "user_r2_123",
      id: "user_r2_123",
      email: "r2@shothik.ai",
      name: "R2 User",
      role: "user",
      authProvider: "insforge",
    });

    vi.mocked(CloudflareR2Adapter.uploadObject).mockRejectedValueOnce(
      new Error("R2 storage bucket quota exceeded")
    );

    const req = new NextRequest("http://localhost:3000/api/hermes/storage/r2/upload", {
      method: "POST",
      body: JSON.stringify({
        key: "test/asset.png",
        contentBase64: "aGVsbG8=",
      }),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.code).toBe("R2_UPLOAD_ERROR");
  });
});
