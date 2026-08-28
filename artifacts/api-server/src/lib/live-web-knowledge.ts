import { logger } from "./logger";

export interface LiveSearchResult {
  title: string;
  extract: string;
  url: string;
  source: string;
  thumbnail?: string;
}

export class LiveWebKnowledgeEngine {
  /**
   * Multi-Turn Anaphora / Coreference Resolver:
   * Resolves pronouns ('he', 'she', 'it', 'they', 'that company', 'that topic') from previous turns.
   */
  static resolveMultiTurnQuery(
    currentQuery: string,
    history?: Array<{ role: string; content: string }>
  ): string {
    if (!history || history.length === 0) return currentQuery;

    const hasPronoun = /\b(he|she|him|her|his|it|its|they|them|their|that|this|there|that one|the company|the actor|the founder)\b/i.test(currentQuery);
    if (!hasPronoun) return currentQuery;

    // Look back at recent user/assistant turns to extract the main subject
    for (let i = history.length - 1; i >= 0; i--) {
      const prev = history[i]?.content || "";
      // Match markdown headers e.g. "### 🎬 Shah Rukh Khan" or "### 🚀 Elon Musk"
      const headerMatch = prev.match(/###\s*(?:[^\w\s]*\s*)?([A-Za-z0-9\s'-]{3,40})/);
      if (headerMatch && headerMatch[1]) {
        const entity = headerMatch[1].trim();
        return `${entity} ${currentQuery}`;
      }

      // Match entity in quotes or bold e.g. "**Tarique Rahman**"
      const boldMatch = prev.match(/\*\*([A-Za-z0-9\s'-]{3,35})\*\*/);
      if (boldMatch && boldMatch[1]) {
        const entity = boldMatch[1].trim();
        return `${entity} ${currentQuery}`;
      }
    }

    return currentQuery;
  }

  /**
   * Real-Time Currency Exchange Rate & Macro FX Resolver
   */
  static async getLiveExchangeRate(base: string = "USD", target: string = "BDT"): Promise<string | null> {
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${base.toUpperCase()}`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        const data = (await res.json()) as any;
        const rate = data?.rates?.[target.toUpperCase()];
        if (rate) {
          const dateStr = data.time_last_update_utc ? new Date(data.time_last_update_utc).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Today";
          return `### 💱 Real-Time Currency Exchange Rate\n\n` +
            `- **Pair**: **${base.toUpperCase()} / ${target.toUpperCase()}**\n` +
            `- **Spot Rate**: **1 ${base.toUpperCase()} = ৳${Number(rate).toFixed(2)} ${target.toUpperCase()}**\n` +
            `- **Last Market Update**: ${dateStr} (Live Interbank FX Feed)\n\n` +
            `*Data refreshed from verified global currency exchange settlement index.*`;
        }
      }
    } catch (err: any) {
      logger.debug({ err: err?.message }, "[live-web-knowledge] Live exchange rate fetch failed");
    }
    return null;
  }

  /**
   * Resolve any entity, public figure, science topic, historical event, or concept via Wikipedia API & DuckDuckGo
   */
  static async searchLiveWeb(query: string): Promise<LiveSearchResult | null> {
    const cleanQuery = query
      .replace(/^(who\s+is|who\s+was|what\s+is|what\s+are|why\s+is|why\s+are|why\s+do|why\s+does|how\s+does|how\s+do|how\s+to|tell\s+me\s+about|explain|describe|find|search\s+for|lookup|history\s+of|biography\s+of|summary\s+of|meaning\s+of)\s+/i, "")
      .replace(/\s+(work|works|mean|means|function|operate|happen|occur|exist)\??$/i, "")
      .replace(/[?!.]+$/, "")
      .trim();

    if (!cleanQuery || cleanQuery.length < 2) return null;

    try {
      // 1. Try Direct Wikipedia Summary API (Fastest & Rich details)
      const directWikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery.replace(/\s+/g, "_"))}`;
      const wikiRes = await fetch(directWikiUrl, {
        headers: { "User-Agent": "ShothikAI/2.0 (research@shothik.ai)" },
        signal: AbortSignal.timeout(2500),
      });

      if (wikiRes.ok) {
        const data = (await wikiRes.json()) as any;
        if (data.extract && data.type !== "disambiguation" && data.title) {
          return {
            title: data.title,
            extract: data.extract,
            url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}`,
            source: "Wikipedia Verified Knowledge Graph",
            thumbnail: data.thumbnail?.source,
          };
        }
      }

      // 2. Try Wikipedia Search Query API for multi-word or fuzzy topics
      const searchWikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery)}&format=json&origin=*`;
      const searchRes = await fetch(searchWikiUrl, {
        headers: { "User-Agent": "ShothikAI/2.0 (research@shothik.ai)" },
        signal: AbortSignal.timeout(2500),
      });

      if (searchRes.ok) {
        const searchData = (await searchRes.json()) as any;
        const firstMatch = searchData?.query?.search?.[0];
        if (firstMatch?.title) {
          const matchSummaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstMatch.title.replace(/\s+/g, "_"))}`;
          const matchRes = await fetch(matchSummaryUrl, {
            headers: { "User-Agent": "ShothikAI/2.0 (research@shothik.ai)" },
            signal: AbortSignal.timeout(2000),
          });

          if (matchRes.ok) {
            const matchData = (await matchRes.json()) as any;
            if (matchData.extract) {
              return {
                title: matchData.title,
                extract: matchData.extract,
                url: matchData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(matchData.title)}`,
                source: "Wikipedia Search Index",
                thumbnail: matchData.thumbnail?.source,
              };
            }
          }

          // If summary was missing, use the raw search snippets
          const snippets = (searchData.query.search as Array<{ snippet: string; title: string }>)
            .slice(0, 3)
            .map((s) => s.snippet.replace(/<[^>]*>/g, "").trim())
            .filter(Boolean);

          if (snippets.length > 0) {
            return {
              title: firstMatch.title,
              extract: snippets.join(" "),
              url: `https://en.wikipedia.org/wiki/${encodeURIComponent(firstMatch.title)}`,
              source: "Wikipedia Search Corpus",
            };
          }
        }
      }

      // 3. DuckDuckGo Instant Answer Fallback
      const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}&format=json&no_html=1&skip_disambig=1`;
      const ddgRes = await fetch(ddgUrl, {
        signal: AbortSignal.timeout(2000),
      });

      if (ddgRes.ok) {
        const ddgData = (await ddgRes.json()) as any;
        if (ddgData.AbstractText) {
          return {
            title: ddgData.Heading || cleanQuery,
            extract: ddgData.AbstractText,
            url: ddgData.AbstractURL || "https://duckduckgo.com",
            source: ddgData.AbstractSource || "DuckDuckGo Instant Answer",
          };
        }
      }
    } catch (err: any) {
      logger.debug({ err: err?.message, query }, "[live-web-knowledge] Live web search query timed out or failed");
    }

    return null;
  }
}
