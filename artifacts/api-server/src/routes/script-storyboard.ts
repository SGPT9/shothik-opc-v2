import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";

export const scriptStoryboardRouter = Router();

export interface FountainElement {
  type: 'scene_heading' | 'action' | 'character' | 'parenthetical' | 'dialogue' | 'transition';
  text: string;
}

export interface ComicPanel {
  panelNumber: number;
  cameraShot: 'ESTABLISHING WIDE' | 'MEDIUM SHOT' | 'CLOSE UP' | 'EXTREME CLOSE UP' | 'DUTCH ANGLE' | 'OVER THE SHOULDER';
  visualDescription: string;
  charactersPresent: string[];
  dialogueBalloons: Array<{ character: string; text: string; isWhisper?: boolean; isShout?: boolean }>;
  captionBox?: string;
  sfxSoundEffect?: string;
}

export interface ScriptStoryboardData {
  projectId: string;
  title: string;
  author: string;
  fountainScript: string;
  fountainElements: FountainElement[];
  estimatedRuntimeMinutes: number;
  comicPanels: ComicPanel[];
  comicArtStyle: string;
  statistics: {
    sceneCount: number;
    dialogueCount: number;
    panelCount: number;
    wordCount: number;
  };
}

/**
 * Heuristic parser converting raw narrative prose into Fountain-formatted screenplay elements
 */
export function convertProseToFountain(prose: string, projectTitle = 'MANUSCRIPT TRANSMUTATION'): { script: string; elements: FountainElement[]; runtimeMin: number } {
  const lines = prose.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const elements: FountainElement[] = [];

  // Default slugline if none detected
  elements.push({
    type: 'scene_heading',
    text: 'INT. DHANMONDI DRAWING ROOM - NIGHT',
  });

  for (const line of lines) {
    // Check for explicit scene sluglines or time-space cues
    if (/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/i.test(line)) {
      elements.push({ type: 'scene_heading', text: line.toUpperCase() });
      continue;
    }

    // Check for transitions
    if (/^(CUT TO:|FADE IN:|FADE OUT:|DISSOLVE TO:|SMASH CUT TO:)$/i.test(line)) {
      elements.push({ type: 'transition', text: line.toUpperCase() });
      continue;
    }

    // Check for character dialogue format: "Character Name: Dialogue" or "Character: Dialogue"
    const dialogueMatch = line.match(/^([A-Za-z\u0980-\u09FF\s]+)[:：]\s*(.*)$/);
    if (dialogueMatch) {
      const charName = dialogueMatch[1].trim();
      let speech = dialogueMatch[2].trim();

      // Check for parenthetical emotion/action inside dialogue
      let parenthetical = '';
      const parenMatch = speech.match(/^\(([^)]+)\)\s*(.*)$/);
      if (parenMatch) {
        parenthetical = parenMatch[1].trim();
        speech = parenMatch[2].trim();
      }

      elements.push({ type: 'character', text: charName });
      if (parenthetical) {
        elements.push({ type: 'parenthetical', text: `(${parenthetical})` });
      }
      elements.push({ type: 'dialogue', text: speech || '(silence)' });
      continue;
    }

    // Check for quoted dialogue: 'Himu said, "..."' or '"..."'
    const quoteMatch = line.match(/^["“](.+)["”]$/);
    if (quoteMatch) {
      elements.push({ type: 'character', text: 'SPEAKER' });
      elements.push({ type: 'dialogue', text: quoteMatch[1] });
      continue;
    }

    // Otherwise treat as narrative action
    elements.push({ type: 'action', text: line });
  }

  // Compile to raw Fountain string
  let script = `Title: ${projectTitle}\nCredit: Written for Screen & Graphic Novel by\nAuthor: Shothik InkOS Transmuter\nDraft date: ${new Date().toISOString().split('T')[0]}\n\n`;

  for (const el of elements) {
    if (el.type === 'scene_heading') {
      script += `\n${el.text}\n\n`;
    } else if (el.type === 'character') {
      script += `\n${el.text}\n`;
    } else if (el.type === 'parenthetical') {
      script += `${el.text}\n`;
    } else if (el.type === 'dialogue') {
      script += `${el.text}\n`;
    } else if (el.type === 'transition') {
      script += `\n> ${el.text}\n\n`;
    } else {
      script += `${el.text}\n\n`;
    }
  }

  const wordCount = prose.split(/\s+/).filter(Boolean).length;
  // Standard rule: ~130 words per minute of film screen time
  const runtimeMin = Math.max(1, Math.round((wordCount / 130) * 10) / 10);

  return { script: script.trim(), elements, runtimeMin };
}

/**
 * Converts narrative elements into comic book storyboard panel specifications
 */
export function convertProseToComicPanels(prose: string): ComicPanel[] {
  const lines = prose.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const panels: ComicPanel[] = [];
  let panelIdx = 1;

  const cameraAngles: ComicPanel['cameraShot'][] = [
    'ESTABLISHING WIDE',
    'MEDIUM SHOT',
    'CLOSE UP',
    'OVER THE SHOULDER',
    'DUTCH ANGLE',
    'EXTREME CLOSE UP'
  ];

  if (lines.length === 0) {
    return [{
      panelNumber: 1,
      cameraShot: 'ESTABLISHING WIDE',
      visualDescription: 'A dim room in Dhaka, rain drumming against the window glass.',
      charactersPresent: ['হিমু (Himu)'],
      dialogueBalloons: [{ character: 'হিমু (Himu)', text: 'বৃষ্টি শুরু হয়ে গেছে, বাদল।' }],
      captionBox: 'Dhanmondi, 11:45 PM.',
      sfxSoundEffect: 'ঝমঝম!'
    }];
  }

  for (let i = 0; i < lines.length; i += 2) {
    const chunk = lines.slice(i, i + 2);
    const cameraShot = cameraAngles[(panelIdx - 1) % cameraAngles.length];
    const desc = chunk[0] || 'Dramatic pause in the room as characters exchange tense glances.';
    
    // Look for dialogue inside chunk
    const dialogueBalloons: Array<{ character: string; text: string; isWhisper?: boolean; isShout?: boolean }> = [];
    const charactersPresent: string[] = [];

    for (const subLine of chunk) {
      const match = subLine.match(/^([A-Za-z\u0980-\u09FF\s]+)[:：]\s*(.*)$/);
      if (match) {
        const speaker = match[1].trim();
        const text = match[2].trim();
        if (!charactersPresent.includes(speaker)) charactersPresent.push(speaker);
        dialogueBalloons.push({
          character: speaker,
          text,
          isShout: text.includes('!') || text.includes('?!'),
          isWhisper: text.includes('...') || text.includes('ফিসফিস')
        });
      }
    }

    if (charactersPresent.length === 0) {
      charactersPresent.push('হিমু (Himu)');
    }

    // Heuristic sound effects
    let sfx: string | undefined;
    if (desc.includes('শব্দ') || desc.includes('বৃষ্টি') || desc.includes('rain')) sfx = 'ঝমঝম!';
    else if (desc.includes('দরজা') || desc.includes('door') || desc.includes('ধাক্কা')) sfx = 'দড়াম!';
    else if (desc.includes('কাঁচ') || desc.includes('glass')) sfx = 'ঝনঝন!';
    else if (panelIdx === 2) sfx = 'খটখট!';

    panels.push({
      panelNumber: panelIdx,
      cameraShot,
      visualDescription: desc,
      charactersPresent,
      dialogueBalloons: dialogueBalloons.length > 0 ? dialogueBalloons : [
        { character: charactersPresent[0], text: chunk[1] || '...' }
      ],
      captionBox: panelIdx === 1 ? 'ধানমন্ডি, গভীর রাত।' : undefined,
      sfxSoundEffect: sfx
    });

    panelIdx++;
    if (panelIdx > 6) break; // Keep initial storyboard to standard 6-panel comic page
  }

  return panels;
}

// 1. GET /v1/projects/:id/script-storyboard
scriptStoryboardRouter.get(
  ["/v1/projects/:id/script-storyboard", "/api/v1/projects/:id/script-storyboard"],
  async (req: Request, res: Response) => {
    try {
      const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const projectId = paramId || "default";

      const sampleProse = `INT. DHANMONDI RESIDENCE - NIGHT

বাইরে অবিশ্রান্ত শ্রাবণের বৃষ্টি। পুরনো ড্রয়িংরুমের কাচের জানালায় বৃষ্টির ফোঁটা আছড়ে পড়ছে। হলুদ পাঞ্জাবি পরা হিমু জানালার ধারে দাঁড়িয়ে সোডিয়াম বাতির হলুদ আলোর দিকে তাকিয়ে আছে।

বাদল: হিমু ভাই, আপনি কি সত্যিই ওই লোকটার সাথে দেখা করতে যাচ্ছেন? লোকটা কিন্তু ভয়ঙ্কর।

হিমু: (ধীর মৃদু হাসি) যে মানুষ রাতের অন্ধকারে হলুদ আলো ভালোবাসে, সে কখনো ভয়ঙ্কর হতে পারে না, বাদল।

বাদল: কিন্তু ওসি সাহেব তো বললেন, উনি নাকি কাল রাতের খুনটা স্বচক্ষে দেখেছেন!

হিমু জানালার ফ্রেম থেকে সরে এসে ঘরের মাঝখানের মেহগনি বুকশেলফের কাছে দাঁড়াল। তার চোখে এক ধরনের অতীন্দ্রিয় কৌতুক।

হিমু: পুলিশ যা দেখে, সত্য তার উল্টো দিকে মুখ লুকিয়ে বসে থাকে। তুমি চা খাবে বাদল?

দরজায় আকস্মিক তীব্র তিনটে করাঘাত পড়ল।

FADE OUT.`;

      const fountainData = convertProseToFountain(sampleProse, 'THE SILENT WITNESS: SCREENPLAY');
      const comicPanels = convertProseToComicPanels(sampleProse);

      const responseData: ScriptStoryboardData = {
        projectId,
        title: 'The Silent Witness: Screenplay & Comic Storyboard',
        author: 'Ahsan Habib & InkOS Transmuter',
        fountainScript: fountainData.script,
        fountainElements: fountainData.elements,
        estimatedRuntimeMinutes: fountainData.runtimeMin,
        comicPanels,
        comicArtStyle: 'Dhaka Noir Chiaroscuro (মহাখালী ও ধানমন্ডি ড্রামাটিক শ্যাডো)',
        statistics: {
          sceneCount: fountainData.elements.filter(e => e.type === 'scene_heading').length,
          dialogueCount: fountainData.elements.filter(e => e.type === 'dialogue').length,
          panelCount: comicPanels.length,
          wordCount: sampleProse.split(/\s+/).filter(Boolean).length
        }
      };

      res.json({
        success: true,
        data: responseData
      });
    } catch (err: any) {
      logger.error({ err }, "Error in GET /script-storyboard");
      res.status(500).json({ success: false, error: err.message || "Failed to retrieve script storyboard" });
    }
  }
);

// 2. POST /v1/projects/:id/script-storyboard/transmute
scriptStoryboardRouter.post(
  ["/v1/projects/:id/script-storyboard/transmute", "/api/v1/projects/:id/script-storyboard/transmute"],
  async (req: Request, res: Response) => {
    try {
      const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const projectId = paramId || "default";
      const { rawText, targetFormat = 'both', title = 'PROJECT TRANSMUTATION' } = req.body || {};

      if (!rawText || String(rawText).trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'rawText is required for screenplay/comic transmutation.'
        });
        return;
      }

      const fountainData = convertProseToFountain(String(rawText), String(title));
      const comicPanels = convertProseToComicPanels(String(rawText));

      res.json({
        success: true,
        data: {
          projectId,
          title,
          fountainScript: fountainData.script,
          fountainElements: fountainData.elements,
          estimatedRuntimeMinutes: fountainData.runtimeMin,
          comicPanels,
          statistics: {
            sceneCount: fountainData.elements.filter(e => e.type === 'scene_heading').length,
            dialogueCount: fountainData.elements.filter(e => e.type === 'dialogue').length,
            panelCount: comicPanels.length,
            wordCount: String(rawText).split(/\s+/).filter(Boolean).length
          }
        }
      });
    } catch (err: any) {
      logger.error({ err }, "Error in POST /script-storyboard/transmute");
      res.status(500).json({ success: false, error: err.message || "Failed to transmute text" });
    }
  }
);
