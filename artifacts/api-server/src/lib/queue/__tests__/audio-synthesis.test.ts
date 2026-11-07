import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import express from "express";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import aiToolsExtendedRouter from "../../../routes/ai-tools-extended";
import { executeJobByType, handleAudioSynthesis } from "../task-processors";

describe("Wave A: Audio Synthesis Queue Processor & Voice AI Proxy", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    const app = express();
    app.use(express.json());
    app.use("/api", aiToolsExtendedRouter);
    app.use(aiToolsExtendedRouter);

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe("BullMQ audio-synthesis queue processor", () => {
    it("processes audio-synthesis job successfully with voice and audio data URI", async () => {
      const mockJob: any = {
        id: "job-audio-1",
        data: {
          jobType: "audio-synthesis",
          payload: { text: "স্বাগতম সঠিক এআই প্ল্যাটফর্মে। এটি কৃত্রিম বুদ্ধিমত্তা চালিত কণ্ঠস্বর।", persona: "ayesha_sales" },
        },
        updateProgress: vi.fn().mockResolvedValue(true),
      };

      const result = await executeJobByType(
        "audio-synthesis",
        mockJob,
        { text: "স্বাগতম সঠিক এআই প্ল্যাটফর্মে। এটি কৃত্রিম বুদ্ধিমত্তা চালিত কণ্ঠস্বর।", persona: "ayesha_sales" },
        "usr-test"
      );

      expect(result.success).toBe(true);
      expect(result.jobType).toBe("audio-synthesis");
      expect(result.data).toBeDefined();
      expect(result.data.persona).toBe("ayesha_sales");
      expect(result.data.voice).toBe("ayesha_sales");
      expect(result.data.format).toBe("wav");
      expect(result.data.sampleRate).toBe(24000);
      expect(result.data.audioBase64).toBeDefined();
      expect(typeof result.data.audioBase64).toBe("string");
      expect(result.data.audioUrl).toMatch(/^data:audio\/wav;base64,/);
      expect(mockJob.updateProgress).toHaveBeenCalled();
    });

    it("accepts 'voice' parameter as persona fallback and handles sentence chunking", async () => {
      const mockJob: any = {
        id: "job-audio-2",
        data: {
          jobType: "audio-synthesis",
          payload: {
            text: "প্রথম বাক্য। দ্বিতীয় বাক্য! তৃতীয় বাক্য? চতুর্থ বাক্য।",
            voice: "nusrat_banking",
          },
        },
        updateProgress: vi.fn().mockResolvedValue(true),
      };

      const result = await handleAudioSynthesis(mockJob, mockJob.data.payload);

      expect(result.success).toBe(true);
      expect(result.data.persona).toBe("nusrat_banking");
      expect(result.data.audioUrl).toMatch(/^data:audio\/wav;base64,/);
      expect(mockJob.updateProgress).toHaveBeenCalledWith(100);
    });

    it("falls back to valid WAV buffer if daemon is completely offline", async () => {
      const oldUrl = process.env.BANGLA_AUDIO_AI_URL;
      process.env.BANGLA_AUDIO_AI_URL = "http://127.0.0.1:59998";

      try {
        const mockJob: any = {
          id: "job-audio-offline",
          data: {
            jobType: "audio-synthesis",
            payload: { text: "অফলাইন টেস্ট বাক্য।", persona: "zara_corporate" },
          },
          updateProgress: vi.fn().mockResolvedValue(true),
        };

        const result = await handleAudioSynthesis(mockJob, mockJob.data.payload);

        expect(result.success).toBe(true);
        expect(result.data.audioBase64).toBeDefined();
        const header = Buffer.from(result.data.audioBase64, "base64").subarray(0, 4).toString("ascii");
        expect(header).toBe("RIFF");
        expect(result.data.audioUrl).toContain("data:audio/wav;base64,");
      } finally {
        if (oldUrl) process.env.BANGLA_AUDIO_AI_URL = oldUrl;
        else delete process.env.BANGLA_AUDIO_AI_URL;
      }
    });
  });

  describe("Voice AI API Endpoints in ai-tools-extended", () => {
    it("GET /api/v1/voice/personas returns available personas dictionary", async () => {
      const res = await fetch(`${baseUrl}/api/v1/voice/personas`);

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.personas).toBeDefined();
      expect(json.personas.ayesha_sales).toBeDefined();
      expect(json.personas.nusrat_banking).toBeDefined();
      expect(json.personas.zara_corporate).toBeDefined();
      expect(json.personas.tania_casual).toBeDefined();
      expect(json.personas.ayesha_sales.dialect).toContain("Dhaka");
    });

    it("GET /api/voice/personas alias works identically", async () => {
      const res = await fetch(`${baseUrl}/api/voice/personas`);

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.personas.ayesha_sales).toBeDefined();
    });

    it("POST /api/v1/voice/synthesize rejects empty text with 400", async () => {
      const res = await fetch(`${baseUrl}/api/v1/voice/synthesize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "" }),
      });

      expect(res.status).toBe(400);
      const json = (await res.json()) as any;
      expect(json.success).toBe(false);
      expect(json.error).toBeDefined();
    });

    it("POST /api/v1/voice/synthesize returns synthesized WAV data URI and telemetry", async () => {
      const res = await fetch(`${baseUrl}/api/v1/voice/synthesize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "আসসালামু আলাইকুম, এটি সঠিক প্ল্যাটফর্মের ভয়েস টেস্ট।",
          persona: "ayesha_sales",
        }),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.audioBase64).toBeDefined();
      expect(json.audioUrl).toMatch(/^data:audio\/wav;base64,/);
      expect(json.sampleRate).toBe(24000);
      expect(json.persona).toBe("ayesha_sales");
    });

    it("POST /api/voice/synthesize alias works identically", async () => {
      const res = await fetch(`${baseUrl}/api/voice/synthesize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "পরীক্ষামূলক অডিও সিন্থেসিস。",
          persona: "nusrat_banking",
        }),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.audioUrl).toMatch(/^data:audio\/wav;base64,/);
      expect(json.persona).toBe("nusrat_banking");
    });
  });
});
