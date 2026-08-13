import { describe, it, expect } from "vitest";
import { StudentAssignmentSlideService } from "../student-assignment-slide-service";

describe("StudentAssignmentSlideService", () => {
  it("should generate 5-slide structured deck from raw assignment notes", () => {
    const deck = StudentAssignmentSlideService.generateStudentAssignmentDeck(
      "Quantum Computing in Cryptography",
      "Research notes on Shor's algorithm, RSA encryption vulnerability, and post-quantum lattice cryptography."
    );

    expect(deck.deckId).toContain("deck_assignment_");
    expect(deck.topic).toBe("Quantum Computing in Cryptography");
    expect(deck.slideCount).toBe(5);
    expect(deck.slides[0].title).toBe("Quantum Computing in Cryptography");
    expect(deck.papermarkShareUrl).toContain("papermark.shothik.app/view/");
  });

  it("should render 3D VTuber audio narration script payloads for all slides", () => {
    const deck = StudentAssignmentSlideService.generateStudentAssignmentDeck(
      "Quantum Computing in Cryptography",
      "Research notes"
    );
    const narration = StudentAssignmentSlideService.render3dVtuberNarration(deck.slides);

    expect(narration).toHaveLength(5);
    expect(narration[0].narrationScript).toContain("Welcome everyone");
    expect(narration[0].voiceDurationSec).toBeGreaterThan(0);
  });
});
