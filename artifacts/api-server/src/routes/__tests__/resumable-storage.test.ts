import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import filesRouter from "../files.js";
import { supabaseStorageService } from "../../lib/storage/supabase-storage.js";

const app = express();
app.use(express.json());
app.use("/api", filesRouter);

describe("Supabase Resumable Storage Service", () => {
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const port = (server.address() as any).port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  it("creates a signed TUS upload ticket with user isolation", async () => {
    const session = await supabaseStorageService.createUploadSession({
      bucket: "manuscripts",
      filename: "thesis_final.pdf",
      userId: "usr_student_01",
      contentType: "application/pdf",
    });

    expect(session.uploadUrl).toBeDefined();
    expect(session.bucket).toBe("manuscripts");
    expect(session.path).toContain("usr_student_01/thesis_final.pdf");
    expect(session.tusEndpoint).toContain("/upload/resumable");
    expect(session.headers["Tus-Resumable"]).toBe("1.0.0");
    expect(session.headers["Upload-Metadata"]).toBeDefined();
  });

  it("provisions 24-hour TTL metadata for temp-sandboxes bucket", async () => {
    const session = await supabaseStorageService.createUploadSession({
      bucket: "temp-sandboxes",
      filename: "temp_code_run.py",
      userId: "usr_dev_42",
      contentType: "text/x-python",
    });

    expect(session.bucket).toBe("temp-sandboxes");
    expect(session.path).toMatch(/temp\/usr_dev_42\/.*temp_code_run\.py/);
    expect(session.expiresAt).toBeDefined();
    const expiry = new Date(session.expiresAt).getTime();
    const now = Date.now();
    // Expiry should be roughly 24 hours (86400s) from now
    expect(expiry - now).toBeGreaterThan(23 * 3600 * 1000);
  });

  it("exposes POST /v1/storage/resumable-session endpoint via files route", async () => {
    const res = await fetch(`${baseUrl}/api/v1/storage/resumable-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bucket: "audio-assets",
        filename: "bengali_story_part1.mp3",
        userId: "usr_voice_author",
        contentType: "audio/mpeg",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.session.bucket).toBe("audio-assets");
    expect(body.session.path).toContain("usr_voice_author/bengali_story_part1.mp3");
    expect(body.session.uploadUrl).toBeDefined();
  });
});
