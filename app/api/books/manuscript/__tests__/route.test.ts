import { describe, expect, it, vi } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";

vi.mock("convex/browser", () => ({
  ConvexHttpClient: vi.fn(() => ({
    setAuth: vi.fn(),
    query: vi.fn().mockResolvedValue({ downloadUrl: "https://storage.convex.cloud/manuscript.pdf" }),
  })),
}));

describe("GET /api/books/manuscript", () => {
  it("rejects request if Bearer auth token is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/books/manuscript?bookId=book_123");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Authentication required");
  });

  it("returns manuscript download URL for authenticated request with bookId", async () => {
    const req = new NextRequest("http://localhost:3000/api/books/manuscript?bookId=book_123", {
      headers: {
        authorization: "Bearer valid_jwt_token_123456789",
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.downloadUrl).toBe("https://storage.convex.cloud/manuscript.pdf");
  });
});
