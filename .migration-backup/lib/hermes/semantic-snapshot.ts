/**
 * Compressed Semantic Page Snapshot Generator
 * Inspired by CitroLabs ego-lite kernel-level DOM snapshotting.
 * Produces token-efficient snapshots handling nested iframes and interactive nodes.
 */

export interface SemanticSnapshotNode {
  id: string;
  tag: string;
  role?: string;
  text?: string;
  attributes?: Record<string, string>;
  children?: SemanticSnapshotNode[];
}

export interface SemanticSnapshotResult {
  url: string;
  title: string;
  timestamp: number;
  tokenCountEstimate: number;
  interactiveNodeCount: number;
  iframeCount: number;
  compressedText: string;
  nodes: SemanticSnapshotNode[];
}

/**
 * Parses raw HTML / DOM representation into a token-compressed semantic snapshot
 */
export function generateSemanticSnapshot(
  html: string,
  url: string = "https://example.com",
  title: string = "Page Snapshot"
): SemanticSnapshotResult {
  // Strip script, style, and comments to compress tokens
  const cleanHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // Count iframes
  const iframeMatches = cleanHtml.match(/<iframe\b/gi);
  const iframeCount = iframeMatches ? iframeMatches.length : 0;

  // Extract clean text content
  const textContent = cleanHtml
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Estimate tokens (approx 4 chars per token)
  const tokenCountEstimate = Math.ceil(textContent.length / 4);

  // Extract interactive elements (buttons, inputs, links, forms)
  const interactiveMatches = cleanHtml.match(/<(button|input|a|select|form|textarea)\b/gi);
  const interactiveNodeCount = interactiveMatches ? interactiveMatches.length : 0;

  return {
    url,
    title,
    timestamp: Date.now(),
    tokenCountEstimate,
    interactiveNodeCount,
    iframeCount,
    compressedText: textContent.slice(0, 4000), // Cap at 4k chars for token safety
    nodes: [
      {
        id: "root",
        tag: "body",
        role: "document",
        text: textContent.slice(0, 500),
      },
    ],
  };
}
