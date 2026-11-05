import { describe, it, expect } from "vitest";
import {
  createLivingEpilogueRouter,
  generateLivingEpilogueProse,
  MOCK_RADIO_BROADCASTS,
  MOCK_NEWSPAPER_CLIPPINGS,
  MOCK_SEASONAL_LETTERS
} from "../living-epilogue.js";

describe("Capability #36: Interactive Living Epilogue Reader App", () => {
  it("provides rich transmedia epilogues including radio broadcasts and vintage newspapers", () => {
    expect(MOCK_RADIO_BROADCASTS.length).toBeGreaterThanOrEqual(2);
    const radio = MOCK_RADIO_BROADCASTS[0];
    expect(radio.station).toContain("বাংলাদেশ বেতার");
    expect(radio.frequencyMhz).toBe(100.8);
    expect(radio.headline).toContain("বুড়িগঙ্গা");
    expect(radio.transcriptBn).toContain("সদরঘাট");

    expect(MOCK_NEWSPAPER_CLIPPINGS.length).toBeGreaterThanOrEqual(2);
    const clipping = MOCK_NEWSPAPER_CLIPPINGS[0];
    expect(clipping.newspaperName).toBe("The Daily Ittefaq");
    expect(clipping.clippingStyle).toBe("yellowed_vintage");

    expect(MOCK_SEASONAL_LETTERS.length).toBeGreaterThanOrEqual(2);
    const monsoonLetter = MOCK_SEASONAL_LETTERS.find((l) => l.seasonOrFestival === "monsoon");
    expect(monsoonLetter).toBeDefined();
    expect(monsoonLetter?.isUnlocked).toBe(true);
  });

  it("generates atmospheric epilogue prose for diverse media archetypes", () => {
    const radioSnippet = generateLivingEpilogueProse("radio_broadcast", "হিমু", "সদরঘাট রহস্য");
    expect(radioSnippet).toContain("বাংলাদেশ বেতার");
    expect(radioSnippet).toContain("হিমু");

    const newsSnippet = generateLivingEpilogueProse("newspaper_clipping", "ওসি রফিক", "নৌকাডুবি");
    expect(newsSnippet).toContain("দৈনিক ইত্তেফাক");
    expect(newsSnippet).toContain("ওসি রফিক");

    const letterSnippet = generateLivingEpilogueProse("seasonal_letter", "রূপা");
    expect(letterSnippet).toContain("রূপা");
    expect(letterSnippet).toContain("গল্প কখনো থামে না");
  });

  it("exports an Express router function with valid living-epilogue endpoints", () => {
    const router = createLivingEpilogueRouter();
    expect(router).toBeDefined();
    expect(typeof router).toBe("function");
  });
});
