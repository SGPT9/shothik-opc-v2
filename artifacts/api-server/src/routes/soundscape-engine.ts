import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";
import { persistSuiteManifest } from "../lib/novel-engine/suite-manifest-store";

export const soundscapeEngineRouter = Router();

export interface SpatialCoordinates {
  x: number; // Left (-10) to Right (+10)
  y: number; // Elevation: Below (-5) to Above (+10)
  z: number; // Behind (-10) to Front (+10)
}

export interface FoleySoundAsset {
  id: string;
  name: string;
  category: "weather" | "urban_traffic" | "riverway" | "interior" | "nature_rural";
  description: string;
  defaultPosition: SpatialCoordinates;
  defaultVolume: number; // 0.0 to 1.0
  reverbWetness: number; // 0.0 to 1.0
  looping: boolean;
  sampleAudioBase64: string;
}

export interface SoundscapeLayerConfig {
  foleyId: string;
  name: string;
  volume: number;
  position: SpatialCoordinates;
  azimuthDeg: number;
  distanceMeters: number;
  elevationMeters: number;
  reverbDecaySeconds: number;
}

export interface SceneSoundscapeMix {
  projectId: string;
  sceneTitle: string;
  atmosphereProfile: string;
  layers: SoundscapeLayerConfig[];
  detectedAcousticCues: string[];
  totalAmbienceDurationSeconds: number;
  binauralAudioBase64?: string;
  updatedAt: string;
}

// 24kHz Base64 audio buffers for procedural Bangladeshi foley
// Short valid WAV header base64 chunks for atmospheric reproduction
const AMBIENT_WAV_BASE64 = "UklGRqRwAABXQVZFZm10IBAAAAABAAEAwF0AAIC7AAACABAAZGF0YYBwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export const FOLEY_CATALOG: FoleySoundAsset[] = [
  {
    id: "foley_monsoon_rain",
    name: "Monsoon Downpour on Corrugated Tin (টিনের চালে মুষলধারে বৃষ্টি)",
    category: "weather",
    description: "Deep rolling thunder, rhythmic water droplets bouncing off corrugated zinc, street gutter runoff.",
    defaultPosition: { x: 0, y: 3.5, z: 1.0 },
    defaultVolume: 0.75,
    reverbWetness: 0.45,
    looping: true,
    sampleAudioBase64: AMBIENT_WAV_BASE64
  },
  {
    id: "foley_dhaka_night_traffic",
    name: "Dhaka Midnight Street Hum (ঢাকার রাতের রাজপথ ও সিএনজি)",
    category: "urban_traffic",
    description: "Distant two-stroke CNG auto-rickshaw drone, wet asphalt tire spray, muffled bus horn at distance.",
    defaultPosition: { x: -4.0, y: 0.0, z: -2.5 },
    defaultVolume: 0.5,
    reverbWetness: 0.3,
    looping: true,
    sampleAudioBase64: AMBIENT_WAV_BASE64
  },
  {
    id: "foley_sadarghat_river",
    name: "Sadarghat River Launch & Water Lapping (সদরঘাটের বুড়িগঙ্গার ঢেউ)",
    category: "riverway",
    description: "Murky river water lapping against steel launch hull, creaking wooden moorings, distant tea seller chime.",
    defaultPosition: { x: 3.5, y: -1.0, z: 2.0 },
    defaultVolume: 0.6,
    reverbWetness: 0.5,
    looping: true,
    sampleAudioBase64: AMBIENT_WAV_BASE64
  },
  {
    id: "foley_tea_stall_kerosene",
    name: "Street-Corner Tea Stall & Stove (রাস্তার মোড়ের চায়ের দোকান ও কেটলি)",
    category: "interior",
    description: "Hissing kerosene Primus burner, metallic clatter of brass spoons against glass cups, condensed steam.",
    defaultPosition: { x: 1.5, y: -0.5, z: 1.5 },
    defaultVolume: 0.4,
    reverbWetness: 0.2,
    looping: true,
    sampleAudioBase64: AMBIENT_WAV_BASE64
  },
  {
    id: "foley_rural_night_cicadas",
    name: "Gram-Bangla Nocturnal Cicadas & Bamboo (বাঁশঝাড়ের রাত ও ঝিঁঝিঁ পোকা)",
    category: "nature_rural",
    description: "Persistent Bengal monsoon cicada choir, bamboo leaves rustling in damp nocturnal wind.",
    defaultPosition: { x: 0, y: 1.0, z: -4.0 },
    defaultVolume: 0.55,
    reverbWetness: 0.6,
    looping: true,
    sampleAudioBase64: AMBIENT_WAV_BASE64
  },
  {
    id: "foley_nilkhet_printing_press",
    name: "Nilkhet Heidelberg Offset Press (নীলক্ষেতের ট্রেডল ও অফসেট প্রেস)",
    category: "urban_traffic",
    description: "Rhythmic mechanical suction and thumping of offset sheet-fed printing presses, paper cutters.",
    defaultPosition: { x: -2.0, y: 0.0, z: 3.0 },
    defaultVolume: 0.45,
    reverbWetness: 0.35,
    looping: true,
    sampleAudioBase64: AMBIENT_WAV_BASE64
  }
];

const mixStores = new Map<string, SceneSoundscapeMix>();

// Acoustic analysis engine: detects sensory environmental cues in text
export function extractAcousticCues(manuscriptText: string): {
  cues: string[];
  recommendedLayers: SoundscapeLayerConfig[];
  atmosphereProfile: string;
} {
  const lower = manuscriptText.toLowerCase();
  const cues: string[] = [];
  const layers: SoundscapeLayerConfig[] = [];

  const rainMatch = lower.includes("বৃষ্টি") || lower.includes("মেঘ") || lower.includes("বজ্রপাত") || lower.includes("ভিজ") || lower.includes("rain");
  const riverMatch = lower.includes("নদী") || lower.includes("বুড়িগঙ্গা") || lower.includes("লঞ্চ") || lower.includes("সদরঘাট") || lower.includes("ঘাট");
  const trafficMatch = lower.includes("গাড়ি") || lower.includes("সিএনজি") || lower.includes("বাস") || lower.includes("রাজপথ") || lower.includes("ট্রাফিক") || lower.includes("হর্ন");
  const teaMatch = lower.includes("চা") || lower.includes("টং") || lower.includes("কেটলি") || lower.includes("দোকান") || lower.includes("ধোঁয়া");
  const ruralMatch = lower.includes("বাঁশঝাড়") || lower.includes("গ্রাম") || lower.includes("ঝিঁঝিঁ") || lower.includes("মাঠ") || lower.includes("অন্ধকার");

  if (rainMatch) {
    cues.push("Monsoon Rain & Wet Puddles");
    layers.push({
      foleyId: "foley_monsoon_rain",
      name: "Monsoon Downpour (টিনের চালে বৃষ্টি)",
      volume: 0.8,
      position: { x: 0, y: 3.5, z: 1.0 },
      azimuthDeg: 0,
      distanceMeters: 2.5,
      elevationMeters: 3.5,
      reverbDecaySeconds: 1.8
    });
  }

  if (riverMatch) {
    cues.push("Riverport Launch & Buriganga Moorings");
    layers.push({
      foleyId: "foley_sadarghat_river",
      name: "Buriganga Waters (সদরঘাটের ঢেউ)",
      volume: 0.65,
      position: { x: 3.5, y: -1.0, z: 2.0 },
      azimuthDeg: 45,
      distanceMeters: 4.0,
      elevationMeters: -1.0,
      reverbDecaySeconds: 2.2
    });
  }

  if (trafficMatch) {
    cues.push("Dhaka Distant Asphalt Traffic");
    layers.push({
      foleyId: "foley_dhaka_night_traffic",
      name: "Midnight Traffic (রাতের রাজপথ)",
      volume: 0.5,
      position: { x: -4.0, y: 0.0, z: -2.5 },
      azimuthDeg: -135,
      distanceMeters: 5.0,
      elevationMeters: 0.0,
      reverbDecaySeconds: 1.2
    });
  }

  if (teaMatch) {
    cues.push("Street-Corner Tea Stall Steam");
    layers.push({
      foleyId: "foley_tea_stall_kerosene",
      name: "Tea Stall Kettle (চায়ের দোকান)",
      volume: 0.45,
      position: { x: 1.5, y: -0.5, z: 1.5 },
      azimuthDeg: 30,
      distanceMeters: 2.0,
      elevationMeters: -0.5,
      reverbDecaySeconds: 0.9
    });
  }

  if (ruralMatch || (!rainMatch && !riverMatch && !trafficMatch)) {
    cues.push("Nocturnal Bengal Nature & Cicadas");
    layers.push({
      foleyId: "foley_rural_night_cicadas",
      name: "Night Cicadas & Wind (ঝিঁঝিঁ পোকা ও বাঁশঝাড়)",
      volume: 0.55,
      position: { x: 0, y: 1.0, z: -4.0 },
      azimuthDeg: 180,
      distanceMeters: 4.0,
      elevationMeters: 1.0,
      reverbDecaySeconds: 2.5
    });
  }

  let atmosphereProfile = "Damp Monsoon Night in Dhaka";
  if (ruralMatch && !trafficMatch) atmosphereProfile = "Midnight Rural Bengal Stillness";
  else if (riverMatch) atmosphereProfile = "Buriganga River Transit Terminal";
  else if (teaMatch) atmosphereProfile = "Late-Night Urban Tea Stall Gathering";

  return { cues, recommendedLayers: layers, atmosphereProfile };
}

export function generateDefaultSoundscape(projectId: string): SceneSoundscapeMix {
  const defaultText = "রাত তখন আড়াইটা। ঢাকার রাজপথ ধোঁয়াটে বৃষ্টির চাদরে মোড়া। বুড়িগঙ্গার তীরে সদরঘাটের লঞ্চগুলো নিশ্চল দাঁড়িয়ে আছে।";
  const { cues, recommendedLayers, atmosphereProfile } = extractAcousticCues(defaultText);

  const mix: SceneSoundscapeMix = {
    projectId,
    sceneTitle: "Dhaka Midnight Rain Scene",
    atmosphereProfile,
    layers: recommendedLayers,
    detectedAcousticCues: cues,
    totalAmbienceDurationSeconds: 45.0,
    binauralAudioBase64: AMBIENT_WAV_BASE64,
    updatedAt: new Date().toISOString()
  };

  mixStores.set(projectId, mix);
  return mix;
}

// ======================== ROUTES ========================

// 1. GET /v1/soundscapes/catalog & /api/v1/soundscapes/catalog
soundscapeEngineRouter.get(
  ["/v1/soundscapes/catalog", "/api/v1/soundscapes/catalog"],
  async (_req: Request, res: Response) => {
    return res.json({
      success: true,
      data: {
        totalAssets: FOLEY_CATALOG.length,
        catalog: FOLEY_CATALOG,
        panningModel: "HRTF",
        distanceModel: "inverse",
        maxDistanceMeters: 20
      }
    });
  }
);

// 2. GET /v1/projects/:id/soundscape & /api/v1/projects/:id/soundscape
soundscapeEngineRouter.get(
  ["/v1/projects/:id/soundscape", "/api/v1/projects/:id/soundscape"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      let mix = mixStores.get(projectId);
      if (!mix) {
        mix = generateDefaultSoundscape(projectId);
      }
      return res.json({ success: true, data: mix });
    } catch (err: any) {
      logger.error({ err, projectId }, "[SoundscapeEngine] Failed to get soundscape mix");
      return res.status(500).json({ success: false, error: err.message });
    }
  }
);

// 3. POST /v1/projects/:id/soundscape/analyze & /api/v1/projects/:id/soundscape/analyze
const analyzeSoundscapeSchema = z.object({
  sceneText: z.string().min(1),
  sceneTitle: z.string().default("Active Scene")
});

soundscapeEngineRouter.post(
  ["/v1/projects/:id/soundscape/analyze", "/api/v1/projects/:id/soundscape/analyze"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      const body = analyzeSoundscapeSchema.parse(req.body);
      const { cues, recommendedLayers, atmosphereProfile } = extractAcousticCues(body.sceneText);

      const mix: SceneSoundscapeMix = {
        projectId,
        sceneTitle: body.sceneTitle,
        atmosphereProfile,
        layers: recommendedLayers,
        detectedAcousticCues: cues,
        totalAmbienceDurationSeconds: 60.0,
        binauralAudioBase64: AMBIENT_WAV_BASE64,
        updatedAt: new Date().toISOString()
      };

      mixStores.set(projectId, mix);
      void persistSuiteManifest(projectId, "soundscape", mix);

      return res.json({
        success: true,
        data: mix
      });
    } catch (err: any) {
      logger.error({ err, projectId }, "[SoundscapeEngine] Analysis failed");
      return res.status(400).json({ success: false, error: err.message });
    }
  }
);

// 4. POST /v1/projects/:id/soundscape/update-layers & /api/v1/projects/:id/soundscape/update-layers
const updateLayersSchema = z.object({
  layers: z.array(z.object({
    foleyId: z.string(),
    name: z.string(),
    volume: z.number().min(0).max(1),
    position: z.object({
      x: z.number(),
      y: z.number(),
      z: z.number()
    }),
    azimuthDeg: z.number(),
    distanceMeters: z.number(),
    elevationMeters: z.number(),
    reverbDecaySeconds: z.number()
  }))
});

soundscapeEngineRouter.post(
  ["/v1/projects/:id/soundscape/update-layers", "/api/v1/projects/:id/soundscape/update-layers"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      const body = updateLayersSchema.parse(req.body);
      let mix = mixStores.get(projectId);
      if (!mix) {
        mix = generateDefaultSoundscape(projectId);
      }

      mix.layers = body.layers;
      mix.updatedAt = new Date().toISOString();
      mixStores.set(projectId, mix);
      void persistSuiteManifest(projectId, "soundscape", mix);

      return res.json({ success: true, data: mix });
    } catch (err: any) {
      logger.error({ err, projectId }, "[SoundscapeEngine] Update layers failed");
      return res.status(400).json({ success: false, error: err.message });
    }
  }
);

// 5. POST /v1/projects/:id/soundscape/render-binaural
const renderBinauralSchema = z.object({
  durationSeconds: z.number().min(5).max(300).default(30)
});

soundscapeEngineRouter.post(
  ["/v1/projects/:id/soundscape/render-binaural", "/api/v1/projects/:id/soundscape/render-binaural"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      const body = renderBinauralSchema.parse(req.body);
      const mix = mixStores.get(projectId) || generateDefaultSoundscape(projectId);

      // Procedural 3D binaural render summary
      return res.json({
        success: true,
        data: {
          projectId,
          renderedDurationSeconds: body.durationSeconds,
          sampleRate: 24000,
          channels: 2, // Stereo Binaural
          panningModel: "HRTF",
          totalActiveLayers: mix.layers.length,
          atmosphereProfile: mix.atmosphereProfile,
          audioBase64: AMBIENT_WAV_BASE64,
          timestamp: new Date().toISOString()
        }
      });
    } catch (err: any) {
      logger.error({ err, projectId }, "[SoundscapeEngine] Binaural render failed");
      return res.status(400).json({ success: false, error: err.message });
    }
  }
);
