import { describe, it, expect } from "vitest";
import {
  generateStreamerSession,
  type StreamPollOption,
  type StreamerChatIdea
} from "../streamer-mode";

describe("Live Audience Streamer Mode & Interactive Co-Writing (Capability #28)", () => {
  it("initializes live streamer session with active audience poll, vote percentages and branch options", () => {
    const text = "বাইরে তখন মুষলধারে বৃষ্টি। সদর দরজায় হঠাৎ তিনবার ভারী করাঘাত পড়ল।";
    const session = generateStreamerSession(text, "proj_stream_test");

    expect(session.projectId).toBe("proj_stream_test");
    expect(session.isLive).toBe(true);
    expect(session.viewerCount).toBeGreaterThan(500);
    expect(session.chatVelocityMpm).toBeGreaterThan(10);
    expect(session.activePoll).toBeDefined();
    expect(session.activePoll.status).toBe("ACTIVE");
    expect(session.activePoll.options.length).toBe(3);

    for (const opt of session.activePoll.options) {
      expect(opt.id).toBeTruthy();
      expect(opt.label).toBeTruthy();
      expect(opt.labelBn).toBeTruthy();
      expect(opt.votes).toBeGreaterThan(0);
      expect(opt.percentage).toBeGreaterThan(0);
      expect(opt.narrativeTrajectory).toBeTruthy();
    }
  });

  it("extracts community chat highlights and actionable writing prompts", () => {
    const session = generateStreamerSession("Some manuscript text", "proj_stream_test");

    expect(session.chatHighlights.length).toBeGreaterThanOrEqual(3);
    for (const chat of session.chatHighlights) {
      expect(chat.username).toBeTruthy();
      expect(["VIP", "MOD", "FOUNDER", "SUBSCRIBER"]).toContain(chat.badge);
      expect(chat.message).toBeTruthy();
      expect(chat.suggestedAction).toBeTruthy();
      expect(chat.upvotes).toBeGreaterThan(0);
    }
  });

  it("generates ready-to-inject branch prose for each poll choice", () => {
    const text = "রাত নেমেছে শহরের বুকে।";
    const session = generateStreamerSession(text, "proj_bengali_stream");

    expect(session.suggestedBranchProse).toBeDefined();
    expect(session.suggestedBranchProse["opt_stealth"]).toBeTruthy();
    expect(session.suggestedBranchProse["opt_confront"]).toBeTruthy();
    expect(session.suggestedBranchProse["opt_misdirect"]).toBeTruthy();

    // Verify Bengali output matches Bengali input context
    expect(session.suggestedBranchProse["opt_stealth"]).toMatch(/[\u0980-\u09FF]/);
  });
});
