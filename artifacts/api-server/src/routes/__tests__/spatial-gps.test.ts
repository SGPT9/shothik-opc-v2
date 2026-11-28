import { describe, it, expect } from "vitest";
import {
  createSpatialGpsRouter,
  auditJourneyPhysics,
  KNOWN_LOCATIONS,
  TRANSIT_MODES
} from "../spatial-gps.js";

describe("Capability #34: Interactive Map & Spatial Timeline GPS", () => {
  it("provides comprehensive Bengali geographical waypoints and transit modalities", () => {
    expect(KNOWN_LOCATIONS.length).toBeGreaterThanOrEqual(5);
    const sadarghat = KNOWN_LOCATIONS.find((l) => l.id === "loc_sadarghat");
    expect(sadarghat).toBeDefined();
    expect(sadarghat?.nameBn).toBe("সদরঘাট নদী বন্দর");

    expect(TRANSIT_MODES.length).toBeGreaterThanOrEqual(5);
    const riverLaunch = TRANSIT_MODES.find((m) => m.id === "river_launch");
    expect(riverLaunch).toBeDefined();
    expect(riverLaunch?.speedKmh).toBe(22);
  });

  it("calculates realistic physical transit duration and detects impossible teleportation anomalies", () => {
    // Normal overnight launch journey (Sadarghat to Barisal)
    const normal = auditJourneyPhysics(
      "Sadarghat River Terminal",
      "Barisal Rocket Steamer Ghat",
      "river_launch",
      "21:00",
      8.7
    );
    expect(normal.distanceKm).toBeGreaterThan(150);
    expect(normal.realisticDurationHours).toBeGreaterThan(6);
    expect(normal.anomalyDetected).toBe(false);
    expect(normal.anomalySeverity).toBe("none");
    expect(normal.generatedProse).toContain("কিলোমিটার");

    // Chronological paradox (claiming 240km in 30 minutes by train)
    const impossible = auditJourneyPhysics(
      "Sadarghat River Terminal",
      "Keane Bridge, Surma River",
      "intercity_train",
      "08:00",
      0.5
    );
    expect(impossible.anomalyDetected).toBe(true);
    expect(impossible.anomalySeverity).toBe("chronological_paradox");
    expect(impossible.anomalyMessage).toContain("teleports");
  });

  it("detects terrain incompatibility anomalies", () => {
    // Rickshaw in Sundarbans mangrove forest
    const terrainAnomaly = auditJourneyPhysics(
      "Kotka Wildlife Sanctuary, Sundarbans",
      "Sadarghat River Terminal",
      "rickshaw",
      "12:00"
    );
    expect(terrainAnomaly.anomalyDetected).toBe(true);
    expect(terrainAnomaly.anomalySeverity).toBe("physically_impossible");
  });

  it("exports an Express router function with appropriate route endpoints", () => {
    const router = createSpatialGpsRouter();
    expect(router).toBeDefined();
    expect(typeof router).toBe("function");
  });
});
