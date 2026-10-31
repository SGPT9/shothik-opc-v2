export interface PhonemeTimestamp {
  word: string;
  startMs: number;
  endMs: number;
}

export interface AudioStreamPacket {
  type: "AUDIO_CHUNK";
  sessionId: string;
  chunkIndex: number;
  audioBase64: string;
  payloadSize: number;
  durationMs: number;
  waveformPeaks: number[];
  phonemes: PhonemeTimestamp[];
  timestamp: number;
}

export class AudioStreamBroadcaster {
  /**
   * Packages a raw audio PCM/MP3 buffer into a low-latency streaming broadcast packet
   * complete with real-time waveform visualizer peaks and phoneme sync markers.
   */
  static packageFrame(params: {
    sessionId: string;
    audioBuffer: Buffer;
    chunkIndex: number;
    phonemes?: PhonemeTimestamp[];
    sampleRate?: number;
  }): AudioStreamPacket {
    const { sessionId, audioBuffer, chunkIndex, phonemes = [], sampleRate = 24000 } = params;

    const waveformPeaks = AudioStreamBroadcaster.extractWaveformPeaks(audioBuffer, 16);
    // Approximate 16-bit mono duration
    const durationMs = Math.round((audioBuffer.length / 2 / sampleRate) * 1000);

    return {
      type: "AUDIO_CHUNK",
      sessionId,
      chunkIndex,
      audioBase64: audioBuffer.toString("base64"),
      payloadSize: audioBuffer.length,
      durationMs,
      waveformPeaks,
      phonemes,
      timestamp: Date.now(),
    };
  }

  /**
   * Extracts normalized peak amplitude values (0.0 to 1.0) across buckets for UI waveforms.
   */
  static extractWaveformPeaks(buffer: Buffer, numPeaks: number = 16): number[] {
    if (!buffer || buffer.length < 2) {
      return Array(numPeaks).fill(0);
    }

    const totalSamples = Math.floor(buffer.length / 2);
    const bucketSize = Math.max(1, Math.floor(totalSamples / numPeaks));
    const peaks: number[] = [];

    for (let b = 0; b < numPeaks; b++) {
      let maxAmp = 0;
      const startSample = b * bucketSize;
      const endSample = Math.min(startSample + bucketSize, totalSamples);

      for (let s = startSample; s < endSample; s++) {
        const offset = s * 2;
        if (offset + 1 < buffer.length) {
          const val = Math.abs(buffer.readInt16LE(offset));
          if (val > maxAmp) {
            maxAmp = val;
          }
        }
      }

      const normalized = Math.min(1.0, maxAmp / 32768);
      peaks.push(parseFloat(normalized.toFixed(4)));
    }

    return peaks;
  }
}
