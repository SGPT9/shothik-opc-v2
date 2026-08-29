/**
 * Shothik Presentation & Writing Studio WordArt Presets
 * Inspired by GenOffice (Apache-2.0)
 * 12 Rich typographic themes for slide titles, pitch cards, and section banners.
 */

export interface WordArtPreset {
  id: string;
  name: string;
  fill: string;
  outline?: { color: string; widthEmu: number };
  bold?: boolean;
  italic?: boolean;
  shadow?: string;
}

export const WORDART_PRESETS: WordArtPreset[] = [
  // Solid bold series
  { id: 'emerald-frontier', name: 'Emerald Frontier', fill: '#059669', bold: true, shadow: '0 4px 12px rgba(5,150,105,0.25)' },
  { id: 'shothik-gold', name: 'Dhaka Gold', fill: '#F59E0B', bold: true, shadow: '0 4px 12px rgba(245,158,11,0.25)' },
  { id: 'crimson-impact', name: 'Bengali Crimson', fill: '#DC2626', bold: true, shadow: '0 4px 12px rgba(220,38,38,0.25)' },
  { id: 'cyber-violet', name: 'Cyber Violet', fill: '#8B5CF6', bold: true, shadow: '0 4px 12px rgba(139,92,246,0.25)' },
  { id: 'cyan-matrix', name: 'Electric Cyan', fill: '#06B6D4', bold: true, italic: true, shadow: '0 4px 12px rgba(6,182,212,0.25)' },
  // Outline & Glow Series
  {
    id: 'white-orange',
    name: 'Sunset Glow',
    fill: '#FFFFFF',
    outline: { color: '#EA580C', widthEmu: 19050 },
    bold: true,
  },
  {
    id: 'white-emerald',
    name: 'Padma Green Outline',
    fill: '#FFFFFF',
    outline: { color: '#059669', widthEmu: 19050 },
    bold: true,
  },
  {
    id: 'gold-obsidian',
    name: 'Executive Black Gold',
    fill: '#0F172A',
    outline: { color: '#F59E0B', widthEmu: 19050 },
    bold: true,
  },
  {
    id: 'silver-titanium',
    name: 'Titanium Platinum',
    fill: '#E2E8F0',
    outline: { color: '#475569', widthEmu: 12700 },
    bold: true,
  },
  {
    id: 'deep-navy-neon',
    name: 'Silicon Blue',
    fill: '#1E1B4B',
    outline: { color: '#38BDF8', widthEmu: 14000 },
    bold: true,
  },
];

/** Convert EMU stroke width to CSS px */
export function wordArtStrokePx(widthEmu: number): number {
  return Math.round((widthEmu / 12700) * (4 / 3) * 100) / 100;
}
