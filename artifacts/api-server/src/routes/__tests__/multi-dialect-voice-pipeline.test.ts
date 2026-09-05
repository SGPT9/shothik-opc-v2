import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import { multiDialectVoiceEngine, CANONICAL_VOICE_PROFILES } from "../../lib/multi-dialect-voice-engine.js";

describe("Autonomous Multi-Dialect Conversational Voice Twin Pipeline (/api/v1/voice/twin)", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
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

  it("1. GET /api/v1/voice/twin/profiles retrieves canonical voice profiles with Kokoro & Bangla VITS models", async () => {
    const res = await fetch(`${baseUrl}/api/v1/voice/twin/profiles`);
    expect(res.status).toBe(200);

    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.count).toBe(4);
    expect(json.profiles).toHaveLength(4);

    const dhakaiya = json.profiles.find((p: any) => p.id === "dhakaiya_panna");
    expect(dhakaiya).toBeDefined();
    expect(dhakaiya.dialect).toBe("dhakaiya");
    expect(dhakaiya.tempo).toBe(1.15);
    expect(dhakaiya.vernacularGreeting).toContain("১-ট্যাপে বিকাশ");

    const chatgaya = json.profiles.find((p: any) => p.id === "chatgaya_nawab");
    expect(chatgaya).toBeDefined();
    expect(chatgaya.dialect).toBe("chatgaya");
    expect(chatgaya.model).toBe("neural-vernacular-v3");

    const sylheti = json.profiles.find((p: any) => p.id === "sylheti_surma");
    expect(sylheti).toBeDefined();
    expect(sylheti.dialect).toBe("sylheti");
    expect(sylheti.model).toBe("kokoro-82m-quant");
  });

  it("2. POST /api/v1/voice/twin/synthesize-dialect synthesizes speech with regional dialect adaptation", async () => {
    const res = await fetch(`${baseUrl}/api/v1/voice/twin/synthesize-dialect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "এক ট্যাপে বিকাশ পেমেন্ট করুন এবং পণ্য পাঠিয়ে দিন",
        profileId: "dhakaiya_panna",
        tempoOverride: 1.2,
      }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.dialect).toBe("dhakaiya");
    expect(json.dialectAdaptedText).toContain("১-ট্যাপে বিকাশ মারেন");
    expect(json.audioUrl).toMatch(/^https:\/\/cdn\.shothik\.internal\/audio\/synth\/vits_dhakaiya_panna_/);
    expect(json.durationSeconds).toBeGreaterThanOrEqual(1);
    expect(json.tempo).toBe(1.2);
    expect(json.metrics.totalTtfbMs).toBeGreaterThan(0);
  });

  it("3. POST /api/v1/voice/twin/stream-bidirectional handles turn-taking and commercial intent execution", async () => {
    const sessionId = `test_sess_${Date.now()}`;
    const res = await fetch(`${baseUrl}/api/v1/voice/twin/stream-bidirectional`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        text: "ajker bkash sales ar profit koto holo?",
        profileId: "dhakaiya_panna",
      }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.sessionId).toBe(sessionId);
    expect(json.userTurn.text).toBe("ajker bkash sales ar profit koto holo?");
    expect(json.twinTurn.text).toContain("৩৮,৫০০ টাকা");
    expect(json.synthesis.audioUrl).toBeDefined();
    expect(json.sessionStatus).toBe("speaking");
  });

  it("4. POST /api/v1/voice/twin/vad-frame calculates speech energy and detects speech transitions", async () => {
    const sessionId = `vad_sess_${Date.now()}`;

    // Frame 1: Low energy (silence)
    const res1 = await fetch(`${baseUrl}/api/v1/voice/twin/vad-frame`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, amplitude: 0.05 }),
    });
    const json1 = (await res1.json()) as any;
    expect(json1.success).toBe(true);
    expect(json1.vad.isSpeaking).toBe(false);
    expect(json1.vad.energyLevel).toBe(0.05);

    // Frame 2 & 3: High energy (speech onset)
    await fetch(`${baseUrl}/api/v1/voice/twin/vad-frame`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, amplitude: 0.65 }),
    });
    const res3 = await fetch(`${baseUrl}/api/v1/voice/twin/vad-frame`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, amplitude: 0.72 }),
    });
    const json3 = (await res3.json()) as any;
    expect(json3.success).toBe(true);
    expect(json3.vad.isSpeaking).toBe(true);
    expect(json3.vad.transitionType).toBe("speech_start");
  });

  it("5. POST /api/v1/voice/twin/barge-in immediately handles user interruption and aborts playback", async () => {
    const sessionId = `barge_sess_${Date.now()}`;

    // Initialize session with a stream turn so twin is 'speaking'
    await fetch(`${baseUrl}/api/v1/voice/twin/stream-bidirectional`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, text: "parcel booking status update" }),
    });

    // Trigger barge-in interrupt
    const res = await fetch(`${baseUrl}/api/v1/voice/twin/barge-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.status).toBe("interrupted");
    expect(json.bargeInCount).toBeGreaterThanOrEqual(1);
  });

  it("6. MultiDialectVoiceEngine direct engine unit test suite", () => {
    const profiles = multiDialectVoiceEngine.getProfiles();
    expect(profiles.length).toBe(4);

    const chatgayaSynthesis = multiDialectVoiceEngine.synthesizeDialectSpeech(
      "ভালো আছেন কি, জাহাজের পণ্য খালাস হয়েছে?",
      "chatgaya_nawab"
    );
    expect(chatgayaSynthesis.dialectAdaptedText).toContain("গম আছেন নি");
    expect(chatgayaSynthesis.dialectAdaptedText).toContain("জাহাজের মাল খালাস");

    const sylhetiSynthesis = multiDialectVoiceEngine.synthesizeDialectSpeech(
      "ভালো আছেন কি, লন্ডন থেকে টাকা এসেছে?",
      "sylheti_surma"
    );
    expect(sylhetiSynthesis.dialectAdaptedText).toContain("ভালা আছেন নি");
    expect(sylhetiSynthesis.dialectAdaptedText).toContain("লন্ডন থাকি টেকা আইছে");
  });

  it("7. Validates input errors gracefully with HTTP 400", async () => {
    const res1 = await fetch(`${baseUrl}/api/v1/voice/twin/synthesize-dialect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res1.status).toBe(400);

    const res2 = await fetch(`${baseUrl}/api/v1/voice/twin/vad-frame`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res2.status).toBe(400);
  });
});
