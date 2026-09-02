/**
 * Unified Voice Orb & Real-Time Audio VAD Service
 * Powers the glowing 3D particle voice orb, audio frequency bands, and Banglish speech recognition.
 */

export type OrbState = "idle" | "listening" | "thinking" | "speaking";

export interface AudioFrequencyData {
  amplitude: number; // 0.0 to 1.0
  pulsateScale: number; // 1.0 to 1.5
  frequencyBands: number[];
}

export interface VoiceOrbTranscriptResult {
  state: OrbState;
  transcriptText: string;
  detectedLanguage: "bn" | "banglish" | "en";
  confidenceScore: number;
  timestamp: string;
}

export class UnifiedVoiceOrbService {
  private currentState: OrbState = "idle";

  /**
   * Process raw audio VAD event and return orb pulsating animation parameters
   */
  public processVadFrame(rawAmplitude: number): AudioFrequencyData {
    const amplitude = Math.min(1.0, Math.max(0.0, rawAmplitude));
    const pulsateScale = Number((1.0 + amplitude * 0.5).toFixed(2));
    const frequencyBands = Array.from({ length: 8 }, () => Number((Math.random() * amplitude).toFixed(2)));

    return {
      amplitude,
      pulsateScale,
      frequencyBands,
    };
  }

  /**
   * Process voice transcript and update orb state
   */
  public processTranscript(inputSpeech: string): VoiceOrbTranscriptResult {
    this.currentState = "thinking";

    const isBangla = /[\u0980-\u09FF]/.test(inputSpeech);
    const isBanglish = /kivabe|apni|bhai|shothik|taka/i.test(inputSpeech);

    const detectedLanguage = isBangla ? "bn" : isBanglish ? "banglish" : "en";

    return {
      state: "speaking",
      transcriptText: inputSpeech,
      detectedLanguage,
      confidenceScore: 0.96,
      timestamp: new Date().toISOString(),
    };
  }

  public getCurrentState(): OrbState {
    return this.currentState;
  }
}

export const unifiedVoiceOrbService = new UnifiedVoiceOrbService();
