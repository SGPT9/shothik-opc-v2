import { describe, expect, it } from "vitest";
import { extractBearerToken, getAuthToken } from "@/lib/server-auth";

describe("Server Auth Utilities", () => {
  it("extracts Bearer token from Authorization header", () => {
    const req = new Request("http://localhost:3000/api/test", {
      headers: {
        authorization: "Bearer my_access_token_xyz",
      },
    });

    const token = extractBearerToken(req);
    expect(token).toBe("my_access_token_xyz");
  });

  it("extracts token from x-access-token header as fallback", () => {
    const req = new Request("http://localhost:3000/api/test", {
      headers: {
        "x-access-token": "custom_header_token_123",
      },
    });

    const token = extractBearerToken(req);
    expect(token).toBe("custom_header_token_123");
  });

  it("returns null when no authorization header is present", () => {
    const req = new Request("http://localhost:3000/api/test");

    const token = extractBearerToken(req);
    expect(token).toBeNull();
  });

  it("extracts token via getAuthToken(req) from Authorization header", async () => {
    const req = new Request("http://localhost:3000/api/test", {
      headers: {
        authorization: "Bearer bearer_token_abc_123",
      },
    });

    const token = await getAuthToken(req);
    expect(token).toBe("bearer_token_abc_123");
  });
});
