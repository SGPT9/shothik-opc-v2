import { z } from "zod";

/**
 * Standard publishing book sizes
 */
export const BookFormatSchema = z.enum([
  "boi_mela_6x9_trade",  // Ekushey Boi Mela 6"x9" standard trade paperback
  "academic_a4",          // University thesis / statutory law report
  "digest_5_5x8_5",       // Regional pocket digest
]);
export type BookFormat = z.infer<typeof BookFormatSchema>;

/**
 * Bengali typography and font embedding presets
 */
export const BengaliFontSchema = z.enum(["kalpurush", "solaiman_lipi", "siyam_rupali", "noto_sans_bengali"]);
export type BengaliFont = z.infer<typeof BengaliFontSchema>;

/**
 * Boi Mela 6x9 trade book PDF export request
 */
export const BoiMelaExportRequestSchema = z.object({
  bookId: z.string(),
  title: z.string().min(1),
  authorName: z.string().min(1),
  format: BookFormatSchema.default("boi_mela_6x9_trade"),
  font: BengaliFontSchema.default("kalpurush"),
  includeBijoyToUnicodeFix: z.boolean().default(true),
  chapters: z.array(
    z.object({
      id: z.string(),
      chapterNumber: z.number().int().positive(),
      title: z.string(),
      contentMarkdown: z.string(),
      wordCount: z.number().int().nonnegative(),
    })
  ).min(1),
  generatePrintReadyPdf: z.boolean().default(true),
  targetCoverSpineMm: z.number().positive().default(12.5),
});
export type BoiMelaExportRequest = z.infer<typeof BoiMelaExportRequestSchema>;

/**
 * Book Export Result
 */
export const BoiMelaExportResponseSchema = z.object({
  success: z.boolean(),
  downloadUrl: z.string().url(),
  pdfSizeBytes: z.number().positive(),
  totalPageCount: z.number().int().positive(),
  fontEmbedded: BengaliFontSchema,
  readyForBoiMelaPrint: z.boolean(),
  exportedAt: z.string(),
});
export type BoiMelaExportResponse = z.infer<typeof BoiMelaExportResponseSchema>;
