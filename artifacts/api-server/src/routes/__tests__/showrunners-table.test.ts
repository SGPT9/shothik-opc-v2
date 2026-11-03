import { describe, it, expect } from "vitest";
import {
  SHOWRUNNER_PERSONAS,
  simulateShowrunnerDebate,
} from "../showrunners-table";

describe("Virtual Showrunner's Table Multi-Agent Brainstorm Crucible (Capability #21)", () => {
  it("provides comprehensive metadata for all 4 showrunner AI personas", () => {
    const roles = Object.keys(SHOWRUNNER_PERSONAS);
    expect(roles.length).toBe(4);
    expect(roles).toContain("architect");
    expect(roles).toContain("psychologist");
    expect(roles).toContain("geometer");
    expect(roles).toContain("contrarian");

    for (const role of roles) {
      const persona = SHOWRUNNER_PERSONAS[role as keyof typeof SHOWRUNNER_PERSONAS];
      expect(persona.nameBangla).toBeTruthy();
      expect(persona.nameEnglish).toBeTruthy();
      expect(persona.avatarIcon).toBeTruthy();
      expect(persona.tagline).toBeTruthy();
      expect(persona.corePhilosophy).toBeTruthy();
      expect(persona.specialty).toBeTruthy();
    }
  });

  it("simulates sequential 4-agent round-table debate with cross-referential responses", () => {
    const dilemma = "হিমুকে কীভাবে ওসি সাহেবের জিজ্ঞাসাবাদ থেকে নাটकीयভাবে মুক্ত করা যায়?";
    const session = simulateShowrunnerDebate("proj_sr_test", dilemma);

    expect(session.sessionId).toBeTruthy();
    expect(session.projectId).toBe("proj_sr_test");
    expect(session.topic).toBe(dilemma);
    expect(session.turns.length).toBe(4);

    const speakers = session.turns.map((t) => t.role);
    expect(speakers).toEqual(["architect", "psychologist", "geometer", "contrarian"]);

    // Verify cross-dialogue references
    const turn2 = session.turns[1];
    expect(turn2.inResponseToRole).toBe("architect");

    const turn3 = session.turns[2];
    expect(turn3.inResponseToRole).toBe("psychologist");

    const turn4 = session.turns[3];
    expect(turn4.inResponseToRole).toBe("architect");
  });

  it("generates synthesized consensus pitch with why-it-works and actionable scene beats", () => {
    const session = simulateShowrunnerDebate("proj_sr_test", "পলাতক আসামীর সন্ধান");
    const consensus = session.consensusPitch;

    expect(consensus.headline).toBeTruthy();
    expect(consensus.synopsisBangla).toBeTruthy();
    expect(consensus.whyItWorks).toBeTruthy();
    expect(consensus.suggestedSceneBeats.length).toBeGreaterThanOrEqual(4);
  });

  it("generates bold wildcard alternative pitch from Contrarian with dramatic risk profile", () => {
    const session = simulateShowrunnerDebate("proj_sr_test", "গোপন দলিলের রহস্য");
    const wildcard = session.wildcardPitch;

    expect(wildcard.personaName).toContain("Contrarian");
    expect(wildcard.wildcardSynopsis).toBeTruthy();
    expect(wildcard.dramaticRisk).toBeTruthy();
  });
});
