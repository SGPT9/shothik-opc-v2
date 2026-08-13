import logger from "@/lib/logger";

export interface VTuberSlideNarration {
  slideIndex: number;
  slideTitle: string;
  narrativeText: string;
  visemeSequence: string[];
  durationMs: number;
}

export class VTuberSlidePresenterService {
  /**
   * Generates automated VTuber 3D Avatar lip sync and narration sequences for pitch deck slides.
   */
  static generateDeckPresentation(slides: { title: string; bulletPoints: string[] }[]): VTuberSlideNarration[] {
    logger.info("[vtuber-presenter] Generating deck presentation lip sync narration", { slideCount: slides.length });

    return slides.map((slide, idx) => ({
      slideIndex: idx + 1,
      slideTitle: slide.title,
      narrativeText: `Welcome to slide ${idx + 1}: ${slide.title}. ${slide.bulletPoints.join(". ")}.`,
      visemeSequence: ["viseme_aa", "viseme_ee", "viseme_ih", "viseme_oh", "viseme_ou"],
      durationMs: 4500,
    }));
  }
}
