import { describe, it, expect } from "vitest";
import { VTuberPitchDeckNarrator } from "../vtuber-pitch-deck-narrator";

describe("VTuberPitchDeckNarrator 3D Avatar Pitch Presentation Engine", () => {
  it("should generate a 3-slide VTuber interactive pitch presentation deck with papermark analytics link", async () => {
    const deck = await VTuberPitchDeckNarrator.generatePitchPresentation("Polsia OPC Master");

    expect(deck.deckTitle).toContain("Polsia OPC Master");
    expect(deck.papermarkAnalyticsUrl).toContain("docs.shothik.app");
    expect(deck.slides).toHaveLength(3);
    expect(deck.totalDurationSeconds).toBe(48);
    expect(deck.avatarModel).toBe("polsia_vrm_v2.vrm");
  });
});
