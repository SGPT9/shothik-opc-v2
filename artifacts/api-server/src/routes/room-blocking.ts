import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";
import { persistSuiteManifest, loadSuiteManifest } from "../lib/novel-engine/suite-manifest-store";

export const roomBlockingRouter = Router();

export interface Point2D {
  x: number;
  y: number;
}

export interface Obstacle {
  id: string;
  name: string;
  type: "wall" | "door" | "window" | "furniture_opaque" | "screen_translucent";
  p1: Point2D;
  p2: Point2D;
  heightMeters: number;
  blocksLineOfSight: boolean;
  acousticAttenuationDb: number;
}

export interface CharacterToken {
  id: string;
  name: string;
  position: Point2D;
  facingAngleDeg: number; // 0 = North (up), 90 = East, 180 = South, 270 = West
  fovConeDeg: number; // default 120°
  elevation: "standing" | "seated" | "crouched";
  color: string;
}

export interface LineOfSightCalculation {
  sourceCharId: string;
  sourceCharName: string;
  targetCharId: string;
  targetCharName: string;
  distanceMeters: number;
  inFieldOfView: boolean;
  hasClearLineOfSight: boolean;
  blockingObstacleId?: string;
  blockingObstacleName?: string;
  acousticAudibilityScore: number; // 0.0 to 1.0
}

export interface RoomLayout {
  projectId: string;
  roomName: string;
  widthMeters: number;
  lengthMeters: number;
  obstacles: Obstacle[];
  characters: CharacterToken[];
  updatedAt: string;
}

// Ray-segment intersection algorithm
export function checkRaySegmentIntersection(
  rayStart: Point2D,
  rayEnd: Point2D,
  segStart: Point2D,
  segEnd: Point2D
): boolean {
  const x1 = rayStart.x;
  const y1 = rayStart.y;
  const x2 = rayEnd.x;
  const y2 = rayEnd.y;
  const x3 = segStart.x;
  const y3 = segStart.y;
  const x4 = segEnd.x;
  const y4 = segEnd.y;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-6) return false; // Parallel

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  // t between 0.001 and 0.999 (avoid self-collision at endpoints), u between 0 and 1
  return t > 0.005 && t < 0.995 && u >= 0 && u <= 1;
}

// Compute Line-of-Sight and Acoustic Audibility between characters
export function computeCharacterSightlines(layout: RoomLayout): LineOfSightCalculation[] {
  const results: LineOfSightCalculation[] = [];
  const { characters, obstacles } = layout;

  for (let i = 0; i < characters.length; i++) {
    for (let j = 0; j < characters.length; j++) {
      if (i === j) continue;

      const src = characters[i];
      const dst = characters[j];

      const dx = dst.position.x - src.position.x;
      const dy = dst.position.y - src.position.y;
      const distance = Number(Math.sqrt(dx * dx + dy * dy).toFixed(2));

      // Calculate angle from src to dst in degrees (0 = North, 90 = East)
      let targetAngleDeg = (Math.atan2(dx, -dy) * 180) / Math.PI;
      if (targetAngleDeg < 0) targetAngleDeg += 360;

      // Difference from character's facing angle
      let angleDiff = Math.abs(targetAngleDeg - src.facingAngleDeg);
      if (angleDiff > 180) angleDiff = 360 - angleDiff;

      const inFov = angleDiff <= src.fovConeDeg / 2;

      // Check Obstacle Collisions
      let isBlocked = false;
      let blockingObstacle: Obstacle | undefined;
      let totalAttenuation = 0;

      for (const obs of obstacles) {
        const intersects = checkRaySegmentIntersection(src.position, dst.position, obs.p1, obs.p2);
        if (intersects) {
          totalAttenuation += obs.acousticAttenuationDb;
          if (obs.blocksLineOfSight && !isBlocked) {
            isBlocked = true;
            blockingObstacle = obs;
          }
        }
      }

      // Distance acoustic decay: 6dB loss per doubling of distance + barrier attenuation
      const distanceLossDb = 20 * Math.log10(Math.max(1, distance));
      const totalLossDb = distanceLossDb + totalAttenuation;
      // Normal speech ~60dB, hearing threshold ~20dB
      const audibility = Math.max(0, Math.min(1, Number(((75 - totalLossDb) / 55).toFixed(2))));

      results.push({
        sourceCharId: src.id,
        sourceCharName: src.name,
        targetCharId: dst.id,
        targetCharName: dst.name,
        distanceMeters: distance,
        inFieldOfView: inFov,
        hasClearLineOfSight: inFov && !isBlocked,
        blockingObstacleId: blockingObstacle?.id,
        blockingObstacleName: blockingObstacle?.name,
        acousticAudibilityScore: audibility
      });
    }
  }

  return results;
}

export function generateDefaultRoomLayout(projectId: string): RoomLayout {
  const obstacles: Obstacle[] = [
    {
      id: "obs_outer_north",
      name: "North Solid Wall (উত্তর দেয়াল)",
      type: "wall",
      p1: { x: 0, y: 0 },
      p2: { x: 10, y: 0 },
      heightMeters: 3.2,
      blocksLineOfSight: true,
      acousticAttenuationDb: 35
    },
    {
      id: "obs_partition",
      name: "Mahogany Bookshelf Partition (মেহগনি কাঠের বুকশেলফ)",
      type: "furniture_opaque",
      p1: { x: 5, y: 1 },
      p2: { x: 5, y: 6 },
      heightMeters: 2.2,
      blocksLineOfSight: true,
      acousticAttenuationDb: 18
    },
    {
      id: "obs_veranda_door",
      name: "Veranda French Door (বারান্দার কাচের দরজা)",
      type: "door",
      p1: { x: 2, y: 8 },
      p2: { x: 5, y: 8 },
      heightMeters: 2.4,
      blocksLineOfSight: false,
      acousticAttenuationDb: 8
    }
  ];

  const characters: CharacterToken[] = [
    {
      id: "char_himu",
      name: "হিমু (Himu)",
      position: { x: 2.5, y: 3.5 },
      facingAngleDeg: 90, // Facing East toward partition
      fovConeDeg: 120,
      elevation: "standing",
      color: "#eab308" // Yellow
    },
    {
      id: "char_badal",
      name: "বাদল (Badal)",
      position: { x: 7.5, y: 3.5 },
      facingAngleDeg: 270, // Facing West toward partition
      fovConeDeg: 120,
      elevation: "seated",
      color: "#3b82f6" // Blue
    },
    {
      id: "char_intruder",
      name: "রহস্যময় আগন্তুক (Intruder)",
      position: { x: 3.5, y: 7.5 },
      facingAngleDeg: 0, // Facing North toward door
      fovConeDeg: 100,
      elevation: "crouched",
      color: "#ef4444" // Red
    }
  ];

  const layout: RoomLayout = {
    projectId,
    roomName: "Dhanmondi Residence Drawing Room (ধানমন্ডি ড্রয়িংরুম)",
    widthMeters: 10,
    lengthMeters: 8,
    obstacles,
    characters,
    updatedAt: new Date().toISOString()
  };

  roomStores.set(projectId, layout);
  return layout;
}

const roomStores = new Map<string, RoomLayout>();

// ======================== ROUTES ========================

// 1. GET /v1/projects/:id/room-blocking
roomBlockingRouter.get(
  ["/v1/projects/:id/room-blocking", "/api/v1/projects/:id/room-blocking"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      let layout = roomStores.get(projectId);
      if (!layout) {
        const persisted = await loadSuiteManifest<RoomLayout>(projectId, "room_blocking");
        if (persisted && Array.isArray(persisted.characters)) {
          layout = persisted;
          roomStores.set(projectId, layout);
        } else {
          layout = generateDefaultRoomLayout(projectId);
        }
      }
      const sightlines = computeCharacterSightlines(layout);
      return res.json({
        success: true,
        data: {
          layout,
          sightlines
        }
      });
    } catch (err: any) {
      logger.error({ err, projectId }, "[RoomBlocking] Failed to load layout");
      return res.status(500).json({ success: false, error: err.message });
    }
  }
);

// 2. POST /v1/projects/:id/room-blocking/update-layout
const updateLayoutSchema = z.object({
  roomName: z.string().optional(),
  widthMeters: z.number().min(3).max(50).optional(),
  lengthMeters: z.number().min(3).max(50).optional(),
  obstacles: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(["wall", "door", "window", "furniture_opaque", "screen_translucent"]),
    p1: z.object({ x: z.number(), y: z.number() }),
    p2: z.object({ x: z.number(), y: z.number() }),
    heightMeters: z.number().default(2.5),
    blocksLineOfSight: z.boolean().default(true),
    acousticAttenuationDb: z.number().default(15)
  })).optional(),
  characters: z.array(z.object({
    id: z.string(),
    name: z.string(),
    position: z.object({ x: z.number(), y: z.number() }),
    facingAngleDeg: z.number().min(0).max(360).default(0),
    fovConeDeg: z.number().min(30).max(180).default(120),
    elevation: z.enum(["standing", "seated", "crouched"]).default("standing"),
    color: z.string().default("#3b82f6")
  })).optional()
});

roomBlockingRouter.post(
  ["/v1/projects/:id/room-blocking/update-layout", "/api/v1/projects/:id/room-blocking/update-layout"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      const body = updateLayoutSchema.parse(req.body);
      let layout = roomStores.get(projectId) || generateDefaultRoomLayout(projectId);

      if (body.roomName) layout.roomName = body.roomName;
      if (body.widthMeters) layout.widthMeters = body.widthMeters;
      if (body.lengthMeters) layout.lengthMeters = body.lengthMeters;
      if (body.obstacles) layout.obstacles = body.obstacles;
      if (body.characters) layout.characters = body.characters;

      layout.updatedAt = new Date().toISOString();
      roomStores.set(projectId, layout);
      void persistSuiteManifest(projectId, "room_blocking", layout);
      void persistSuiteManifest(projectId, "room_blocking", layout);

      const sightlines = computeCharacterSightlines(layout);

      return res.json({
        success: true,
        data: {
          layout,
          sightlines
        }
      });
    } catch (err: any) {
      logger.error({ err, projectId }, "[RoomBlocking] Update failed");
      return res.status(400).json({ success: false, error: err.message });
    }
  }
);

// 3. POST /v1/projects/:id/room-blocking/audit-scene
const auditSceneSchema = z.object({
  sceneProse: z.string().min(1)
});

roomBlockingRouter.post(
  ["/v1/projects/:id/room-blocking/audit-scene", "/api/v1/projects/:id/room-blocking/audit-scene"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      const body = auditSceneSchema.parse(req.body);
      const layout = roomStores.get(projectId) || generateDefaultRoomLayout(projectId);
      const sightlines = computeCharacterSightlines(layout);

      const inconsistencies = [];
      const lowerProse = body.sceneProse.toLowerCase();

      // Check if prose claims Himu sees Badal
      const himuSeesBadal = lowerProse.includes("হিমু বাদলকে দেখ") || lowerProse.includes("হিমুর চোখে পড়ল বাদল");
      const badalSeesHimu = lowerProse.includes("বাদল দেখল হিমু") || lowerProse.includes("বাদলের চোখে পড়ল হিমু");

      const himuToBadal = sightlines.find(s => s.sourceCharId === "char_himu" && s.targetCharId === "char_badal");
      const badalToHimu = sightlines.find(s => s.sourceCharId === "char_badal" && s.targetCharId === "char_himu");

      if (himuSeesBadal && himuToBadal && !himuToBadal.hasClearLineOfSight) {
        inconsistencies.push({
          claim: "Himu observes Badal's facial reaction",
          sourceChar: "হিমু (Himu)",
          targetChar: "বাদল (Badal)",
          issueType: "occluded_by_obstacle",
          explanation: `Line of sight between Himu and Badal is obstructed by ${himuToBadal.blockingObstacleName || "an opaque obstacle"}.`,
          severity: "high"
        });
      }

      if (badalSeesHimu && badalToHimu && !badalToHimu.hasClearLineOfSight) {
        inconsistencies.push({
          claim: "Badal notices Himu's yellow panjabi",
          sourceChar: "বাদল (Badal)",
          targetChar: "হিমু (Himu)",
          issueType: "occluded_by_obstacle",
          explanation: `Badal is sitting behind ${badalToHimu.blockingObstacleName || "the Mahogany Bookshelf"} with zero direct sightline.`,
          severity: "high"
        });
      }

      // Check acoustic whisper claim
      const whisperClaim = lowerProse.includes("ফিসফিস") || lowerProse.includes("whisper");
      if (whisperClaim && himuToBadal && himuToBadal.distanceMeters > 4.5) {
        inconsistencies.push({
          claim: "Badal clearly hears Himu's quiet whisper",
          sourceChar: "হিমু (Himu)",
          targetChar: "বাদল (Badal)",
          issueType: "inaudible_distance",
          explanation: `Characters are separated by ${himuToBadal.distanceMeters} meters across a solid wooden barrier; whispers are physically inaudible.`,
          severity: "warning"
        });
      }

      const stagingHealthScore = Math.max(40, 100 - inconsistencies.length * 25);

      return res.json({
        success: true,
        data: {
          projectId,
          totalChecksRun: sightlines.length,
          inconsistencies,
          stagingHealthScore,
          activeRoom: layout.roomName
        }
      });
    } catch (err: any) {
      logger.error({ err, projectId }, "[RoomBlocking] Audit failed");
      return res.status(400).json({ success: false, error: err.message });
    }
  }
);
