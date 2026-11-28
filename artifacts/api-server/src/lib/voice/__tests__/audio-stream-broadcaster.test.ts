import { describe, it, expect } from "vitest";
import { AudioStreamBroadcaster } from "../audio-stream-broadcaster.js";
import { PodcastFeedGenerator } from "../podcast-feed-generator.js";

describe("Audio Stream Broadcaster & Podcast Syndicator", () => {
  it("packages audio buffer chunks and renders valid RSS 2.0 podcast XML", () => {
    const fakeBuffer = Buffer.alloc(4096);
    const packet = AudioStreamBroadcaster.packageFrame({
      sessionId: "sess_voice_1",
      audioBuffer: fakeBuffer,
      chunkIndex: 0,
      phonemes: [{ word: "বাংলা", startMs: 0, endMs: 200 }],
    });

    expect(packet.payloadSize).toBeLessThan(10240);
    expect(packet.waveformPeaks).toHaveLength(16);
    expect(packet.phonemes[0].word).toBe("বাংলা");

    const rss = PodcastFeedGenerator.generateRssFeed({
      title: "Amar Boi Podcast",
      description: "Audiobook episodes",
      author: "Shothik Author",
      episodes: [
        { title: "Chapter 1", audioUrl: "https://example.com/ch1.mp3", durationSeconds: 320 },
      ],
    });

    expect(rss).toContain("<rss version=\"2.0\"");
    expect(rss).toContain("<itunes:author>Shothik Author</itunes:author>");
    expect(rss).toContain("<enclosure url=\"https://example.com/ch1.mp3\"");
  });

  it("extracts normalized waveform peak amplitudes for audio visualizers", () => {
    const buffer = Buffer.alloc(1024);
    for (let i = 0; i < buffer.length; i += 2) {
      buffer.writeInt16LE(Math.round(Math.sin(i / 10) * 16000), i);
    }
    const peaks = AudioStreamBroadcaster.extractWaveformPeaks(buffer, 16);
    expect(peaks).toHaveLength(16);
    peaks.forEach((p) => {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1.0);
    });
  });

  it("handles empty episodes array in podcast generator", () => {
    const rss = PodcastFeedGenerator.generateRssFeed({
      title: "Empty Feed",
      description: "No episodes yet",
      author: "New Author",
      episodes: [],
    });
    expect(rss).toContain("<channel>");
    expect(rss).toContain("<title>Empty Feed</title>");
  });
});
