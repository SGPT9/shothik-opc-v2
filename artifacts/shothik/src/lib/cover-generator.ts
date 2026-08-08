/**
 * High-DPI Ebook & Print Cover Art Generator for Amazon KDP & Apple Books
 */

export interface CoverGeneratorOptions {
  title: string;
  subtitle?: string;
  authorName: string;
  format: 'kdp_print' | 'apple_epub';
  primaryColor?: string;
  backgroundImageUrl?: string;
}

export interface GeneratedCover {
  imageUrl: string;
  dpi: number;
  widthPx: number;
  heightPx: number;
  format: string;
  downloadFilename: string;
}

export function generateCoverArt(options: CoverGeneratorOptions): GeneratedCover {
  const isKdp = options.format === 'kdp_print';
  const widthPx = isKdp ? 2775 : 1600; // 6x9 in @ 300 DPI vs Apple Books EPUB 1600x2400
  const heightPx = isKdp ? 2775 : 2400;

  // Generate SVG cover canvas URL
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${widthPx}" height="${heightPx}" viewBox="0 0 ${widthPx} ${heightPx}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${options.primaryColor || '#1e1b4b'}"/>
        <stop offset="50%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#020617"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <circle cx="${widthPx * 0.5}" cy="${heightPx * 0.4}" r="${widthPx * 0.35}" fill="#6366f1" opacity="0.15" filter="blur(40px)"/>
    <text x="50%" y="35%" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="${Math.round(widthPx * 0.065)}px" font-weight="bold">${options.title.toUpperCase()}</text>
    ${options.subtitle ? `<text x="50%" y="43%" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="${Math.round(widthPx * 0.028)}px">${options.subtitle}</text>` : ''}
    <line x1="${widthPx * 0.25}" y1="52%" x2="${widthPx * 0.75}" y2="52%" stroke="#6366f1" stroke-width="4"/>
    <text x="50%" y="85%" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="${Math.round(widthPx * 0.038)}px" letter-spacing="4">${options.authorName.toUpperCase()}</text>
    <text x="50%" y="94%" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="${Math.round(widthPx * 0.018)}px">300 DPI PRINT READY • SHOTHIK PUBLISHING</text>
  </svg>`;

  const encodedSvg = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  return {
    imageUrl: encodedSvg,
    dpi: 300,
    widthPx,
    heightPx,
    format: options.format,
    downloadFilename: `${options.title.toLowerCase().replace(/\s+/g, '_')}_cover_${options.format}.svg`,
  };
}
