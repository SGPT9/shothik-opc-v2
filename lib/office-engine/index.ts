/**
 * Shothik Office Engine
 * Powered by GenOffice (Apache-2.0)
 * Native byte-preserving .docx and .pptx generation & parsing for Shothik AI Agents.
 */

export * as DocxEngine from "./docx/index.js";
export * as PptxEngine from "./pptx/index.js";
export * as OfficeParser from "./parse/index.js";
export * as AgentSkillEngine from "./agent/skillComposer.js";
export { parseFileToText } from "./parse/index.js";
export { composeSkills, createClaimActionGuard } from "./agent/skillComposer.js";

/**
 * Creates a blank formatted .docx manuscript container for research papers or Ekushey books
 */
export async function createBlankManuscriptDocx(title: string, author: string = "Shothik Author"): Promise<Uint8Array> {
  const { generateBlankDocx } = await import("./docx/blank.js");
  return generateBlankDocx({ title, author });
}

/**
 * Creates a clean multi-slide presentation container from markdown outline
 */
export async function createPresentationPptx(title: string, slides: Array<{ title: string; bullets: string[]; notes?: string }>): Promise<Uint8Array> {
  const { generatePptxDeck } = await import("./pptx/generate.js");
  return generatePptxDeck({ title, slides });
}
