export interface PodcastEpisode {
  title: string;
  description?: string;
  audioUrl: string;
  durationSeconds: number;
  pubDate?: string;
  enclosureType?: string;
  fileSizeBytes?: number;
}

export interface PodcastChannelParams {
  title: string;
  description: string;
  author: string;
  link?: string;
  language?: string;
  imageUrl?: string;
  episodes: PodcastEpisode[];
}

export class PodcastFeedGenerator {
  /**
   * Generates Apple Podcasts and Spotify-compliant RSS 2.0 XML with enclosure tags.
   */
  static generateRssFeed(params: PodcastChannelParams): string {
    const {
      title,
      description,
      author,
      link = "https://shothik.ai",
      language = "bn",
      imageUrl = "https://shothik.ai/static/podcast-cover.jpg",
      episodes = [],
    } = params;

    const escapeXml = (unsafe: string): string => {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    const episodesXml = episodes
      .map((ep, idx) => {
        const epDate = ep.pubDate || new Date().toUTCString();
        const epType = ep.enclosureType || "audio/mpeg";
        const epLength = ep.fileSizeBytes || Math.round(ep.durationSeconds * 16000);

        return `    <item>
      <title>${escapeXml(ep.title)}</title>
      <description>${escapeXml(ep.description || ep.title)}</description>
      <pubDate>${epDate}</pubDate>
      <enclosure url="${escapeXml(ep.audioUrl)}" length="${epLength}" type="${epType}" />
      <itunes:duration>${ep.durationSeconds}</itunes:duration>
      <itunes:author>${escapeXml(author)}</itunes:author>
      <guid isPermaLink="false">shothik_ep_${idx}_${ep.durationSeconds}</guid>
    </item>`;
      })
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(link)}</link>
    <description>${escapeXml(description)}</description>
    <language>${escapeXml(language)}</language>
    <itunes:author>${escapeXml(author)}</itunes:author>
    <itunes:summary>${escapeXml(description)}</itunes:summary>
    <itunes:image href="${escapeXml(imageUrl)}" />
    <itunes:category text="Arts">
      <itunes:category text="Books" />
    </itunes:category>
${episodesXml}
  </channel>
</rss>`;
  }
}
