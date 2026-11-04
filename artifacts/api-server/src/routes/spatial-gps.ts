import { Router, Request, Response } from "express";

export interface GeoLocation {
  id: string;
  name: string;
  nameBn: string;
  category: "urban" | "riverine" | "forest" | "highland" | "coastal";
  lat: number;
  lng: number;
  description: string;
}

export interface TransitMode {
  id: string;
  label: string;
  labelBn: string;
  speedKmh: number;
  allowedTerrains: string[];
  maxRangeKm: number;
  sensoryFootprint: string;
}

export interface ActiveJourney {
  id: string;
  character: string;
  origin: string;
  destination: string;
  transitMode: string;
  departureTime: string;
  estimatedArrival: string;
  distanceKm: number;
  claimedDurationHours: number;
  realisticDurationHours: number;
  anomalyDetected: boolean;
  anomalySeverity: "none" | "minor_delay" | "physically_impossible" | "chronological_paradox";
  anomalyMessage: string;
  generatedProse: string;
}

export const KNOWN_LOCATIONS: GeoLocation[] = [
  {
    id: "loc_sadarghat",
    name: "Sadarghat River Terminal",
    nameBn: "সদরঘাট নদী বন্দর",
    category: "riverine",
    lat: 23.7045,
    lng: 90.4132,
    description: "The bustling river gate of Old Dhaka, echoing with launch sirens, oily diesel smoke, and porters shouting in Barisali accents."
  },
  {
    id: "loc_chawkbazar",
    name: "Chawkbazar Shahi Mosque",
    nameBn: "চকবাজার শাহী মসজিদ",
    category: "urban",
    lat: 23.7176,
    lng: 90.3957,
    description: "Labyrinthine alleys smelling of attar, roasting kebabs, and centuries of Mughal brickwork."
  },
  {
    id: "loc_keane_bridge",
    name: "Keane Bridge, Surma River",
    nameBn: "কিন ব্রিজ, সুরমা নদী",
    category: "riverine",
    lat: 24.8904,
    lng: 91.8687,
    description: "The iron arch spanning the Surma in Sylhet, shrouded in tea valley fog and mountain drizzle."
  },
  {
    id: "loc_kotka",
    name: "Kotka Wildlife Sanctuary, Sundarbans",
    nameBn: "কটকা অভয়ারণ্য, সুন্দরবন",
    category: "forest",
    lat: 21.8542,
    lng: 89.7745,
    description: "Tangled mangrove pneumatophores, deep tidal mudflats, and nocturnal roar of the Royal Bengal tiger."
  },
  {
    id: "loc_barisal_steamer",
    name: "Barisal Rocket Steamer Ghat",
    nameBn: "বরিশাল রকেট স্টিমার ঘাট",
    category: "riverine",
    lat: 22.7010,
    lng: 90.3535,
    description: "Kirtankhola riverfront where century-old paddle steamers churn nocturnal foam toward the southern delta."
  },
  {
    id: "loc_coxsbazar",
    name: "Laboni Beach, Cox's Bazar",
    nameBn: "লাবণী বিচ, কক্সবাজার",
    category: "coastal",
    lat: 21.4328,
    lng: 91.9701,
    description: "World's longest unbroken sand beach with crashing Bay of Bengal breakers and pungent salted fish drying racks."
  }
];

export const TRANSIT_MODES: TransitMode[] = [
  {
    id: "rickshaw",
    label: "Cycle Rickshaw",
    labelBn: "রিকশা",
    speedKmh: 12,
    allowedTerrains: ["urban"],
    maxRangeKm: 18,
    sensoryFootprint: "Tinkling brass bells, rhythmic squeak of pedals, and sudden swerves past stagnant puddles."
  },
  {
    id: "walking",
    label: "Walking / On Foot",
    labelBn: "পায়ে হেঁটে",
    speedKmh: 4.5,
    allowedTerrains: ["urban", "riverine", "forest", "highland", "coastal"],
    maxRangeKm: 40,
    sensoryFootprint: "Sore calves, mud caking leather sandals, and slow unfolding of roadside banyan trees."
  },
  {
    id: "river_launch",
    label: "Overnight Triple-Deck Launch",
    labelBn: "ডাবল ডেকার নদী লঞ্চ",
    speedKmh: 22,
    allowedTerrains: ["riverine", "coastal"],
    maxRangeKm: 350,
    sensoryFootprint: "Vibrating steel deck, hypnotic thrum of diesel engines, and searchlight slicing river mist."
  },
  {
    id: "intercity_train",
    label: "Intercity Express Train",
    labelBn: "আন্তঃনগর ট্রেন",
    speedKmh: 65,
    allowedTerrains: ["urban", "highland", "riverine"],
    maxRangeKm: 600,
    sensoryFootprint: "Click-clack rhythm over rusted iron sleepers, hawkers shouting 'Garam Cha!', and telegraph wires bobbing."
  },
  {
    id: "country_boat",
    label: "Country Rowing Boat (Kosh Nouka)",
    labelBn: "কাঠের কোষা নৌকা",
    speedKmh: 7,
    allowedTerrains: ["riverine", "forest"],
    maxRangeKm: 45,
    sensoryFootprint: "Lapping brackish water, wet wooden gunwales, and the lone creak of bamboo oars in tidal silence."
  },
  {
    id: "cng_auto",
    label: "CNG Auto-Rickshaw",
    labelBn: "সিএনজি অটোরিকশা",
    speedKmh: 32,
    allowedTerrains: ["urban", "highland", "coastal"],
    maxRangeKm: 120,
    sensoryFootprint: "High-pitched two-stroke metallic whine, rattling green wire mesh, and exhaust fumes."
  }
];

// Helper: Haversine distance in km
function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function auditJourneyPhysics(
  originName: string,
  destName: string,
  modeId: string,
  departureTimeStr = "21:00",
  claimedDurationHours?: number,
  weather = "calm"
) {
  const origin = KNOWN_LOCATIONS.find(l => l.name.toLowerCase().includes(originName.toLowerCase()) || l.id === originName) || KNOWN_LOCATIONS[0];
  const dest = KNOWN_LOCATIONS.find(l => l.name.toLowerCase().includes(destName.toLowerCase()) || l.id === destName) || KNOWN_LOCATIONS[4];
  const mode = TRANSIT_MODES.find(m => m.id === modeId) || TRANSIT_MODES[2]; // Default river launch

  const rawDistKm = calculateHaversineKm(origin.lat, origin.lng, dest.lat, dest.lng);
  // Real routes curve around rivers and hills: apply 1.35x detour factor
  const roadRiverDistKm = Math.round(rawDistKm * 1.35 * 10) / 10;

  // Weather penalty
  let weatherMultiplier = 1.0;
  if (weather === "monsoon_flood") weatherMultiplier = 1.45;
  if (weather === "heavy_fog") weatherMultiplier = 1.3;

  const realisticDurationHours = Math.round(((roadRiverDistKm / mode.speedKmh) * weatherMultiplier) * 10) / 10;

  // Anomaly checks
  let anomalyDetected = false;
  let anomalySeverity: "none" | "minor_delay" | "physically_impossible" | "chronological_paradox" = "none";
  let anomalyMessage = "Physical transit parameters comply with relativistic world mechanics.";

  // 1. Terrain impossibility check
  if (!mode.allowedTerrains.includes(dest.category) && !mode.allowedTerrains.includes(origin.category)) {
    anomalyDetected = true;
    anomalySeverity = "physically_impossible";
    anomalyMessage = `Transit mode '${mode.label}' cannot navigate '${dest.category}' or '${origin.category}' terrain physically.`;
  }
  // 2. Max range check
  else if (roadRiverDistKm > mode.maxRangeKm) {
    anomalyDetected = true;
    anomalySeverity = "physically_impossible";
    anomalyMessage = `Distance of ${roadRiverDistKm} km exceeds maximum physical operating range of ${mode.label} (${mode.maxRangeKm} km).`;
  }
  // 3. Claimed duration check
  else if (claimedDurationHours !== undefined && claimedDurationHours > 0) {
    const ratio = claimedDurationHours / realisticDurationHours;
    if (ratio < 0.4) {
      anomalyDetected = true;
      anomalySeverity = "chronological_paradox";
      anomalyMessage = `Manuscript claims character reached ${dest.name} in ${claimedDurationHours}h, but physical travel requires at least ${realisticDurationHours}h at ${mode.speedKmh} km/h. Narrative teleports character impossibly fast!`;
    } else if (ratio > 2.5) {
      anomalyDetected = true;
      anomalySeverity = "minor_delay";
      anomalyMessage = `Manuscript claims travel took ${claimedDurationHours}h, exceeding realistic time of ${realisticDurationHours}h. Unexplained ${Math.round((claimedDurationHours - realisticDurationHours)*10)/10}h delay detected.`;
    }
  }

  // Calculate arrival time
  const [depHours, depMins] = departureTimeStr.split(":").map(Number);
  const totalMins = Math.round((depHours * 60 + depMins) + (realisticDurationHours * 60));
  const arrDayOffset = Math.floor(totalMins / 1440);
  const arrH = Math.floor((totalMins % 1440) / 60);
  const arrM = Math.floor(totalMins % 60);
  const arrTimeStr = `${String(arrH).padStart(2, "0")}:${String(arrM).padStart(2, "0")}${arrDayOffset > 0 ? ` (+${arrDayOffset}d)` : ""}`;

  // Atmospheric prose generation
  const generatedProse = `যাত্রার প্রারম্ভে ${origin.nameBn}-এর বাতাসে ভর করছিল অস্থিরতা। ${mode.labelBn}-এর পাটাতনে দাঁড়িয়ে চারপাশের ঘোরলাগা আঁধার আর মেঘের গুরুগুরু ডাক স্পষ্ট শোনা যাচ্ছিল। প্রায় ${roadRiverDistKm} কিলোমিটার পথ পাড়ি দিতে সময় লেগেছে প্রায় ${realisticDurationHours} ঘণ্টা। অবশেষে ${arrTimeStr} নাগাদ দূর দিগন্তে ভেসে উঠল ${dest.nameBn}-এর পরিচিত অবয়ব। ${mode.sensoryFootprint}`;

  return {
    origin,
    dest,
    mode,
    distanceKm: roadRiverDistKm,
    realisticDurationHours,
    departureTime: departureTimeStr,
    estimatedArrival: arrTimeStr,
    anomalyDetected,
    anomalySeverity,
    anomalyMessage,
    generatedProse
  };
}

export function createSpatialGpsRouter(): Router {
  const router = Router();

  const mockJourneys: ActiveJourney[] = [
    {
      id: "jrn_padma_night",
      character: "হিমু (Himu)",
      origin: "Sadarghat River Terminal",
      destination: "Barisal Rocket Steamer Ghat",
      transitMode: "river_launch",
      departureTime: "21:30",
      estimatedArrival: "06:15 (+1d)",
      distanceKm: 185.4,
      claimedDurationHours: 8.75,
      realisticDurationHours: 8.7,
      anomalyDetected: false,
      anomalySeverity: "none",
      anomalyMessage: "Night journey across Meghna confluence matches historical river launch timetables.",
      generatedProse: "সদরঘাটের ব্যস্ত নোঙর ছেড়ে ডাবল ডেকার লঞ্চটি যখন মেঘনার কালচে জলে বুক চিড়ে এগিয়ে চলল, তখন চারপাশ নিস্তব্ধ। কেবিনের মৃদু আলো নিভিয়ে হিমু রেলিংয়ে এসে দাঁড়াল। ভোরের কুয়াশা ফুঁড়ে বরিশাল স্টিমার ঘাটের রূপোলি আলো দেখা দিতে প্রায় পৌনে নয় ঘণ্টা সময় কেটে গেল।"
    },
    {
      id: "jrn_sylhet_express",
      character: "ওসি রফিক (OC Rafiq)",
      origin: "Chawkbazar Shahi Mosque",
      destination: "Keane Bridge, Surma River",
      transitMode: "intercity_train",
      departureTime: "06:40",
      estimatedArrival: "12:15",
      distanceKm: 242.0,
      claimedDurationHours: 5.6,
      realisticDurationHours: 5.5,
      anomalyDetected: false,
      anomalySeverity: "none",
      anomalyMessage: "Parabat Express timetable aligns with railway clearance protocols.",
      generatedProse: "কমলাপুর ছেড়ে পারাবত এক্সপ্রেস শ্রীমঙ্গলের সবুজ চা বাগানের বুক চিরে যখন সুরমা ভ্যালিতে ঢুকল, ঘড়ির কাঁটা তখন বারোটা ছুঁইছুঁই। কিন ব্রিজের লোহার ধনুকের নিচে কুয়াশা এখনও পুরোপুরি গলেনি।"
    },
    {
      id: "jrn_sundarbans_paradox",
      character: "রহস্যময় শিকারী (Tariq)",
      origin: "Kotka Wildlife Sanctuary, Sundarbans",
      destination: "Sadarghat River Terminal",
      transitMode: "rickshaw",
      departureTime: "14:00",
      estimatedArrival: "15:00",
      distanceKm: 295.0,
      claimedDurationHours: 1.0,
      realisticDurationHours: 24.6,
      anomalyDetected: true,
      anomalySeverity: "chronological_paradox",
      anomalyMessage: "CRITICAL PARADOX: Rickshaw cannot cross mangrove tidal mudflats, and traveling 295 km in 1 hour requires supersonic jet speeds!",
      generatedProse: "কটকার শ্বাসমূলের বাদাবন থেকে কোনো মানুষ এক ঘণ্টায় সদরঘাটে পৌঁছাতে পারে না—এ এক ভৌগোলিক ও কালিক চরম অসঙ্গতি।"
    }
  ];

  const statePaths = ["/v1/projects/:projectId/spatial-gps", "/api/v1/projects/:projectId/spatial-gps"];
  router.get(statePaths, (req: Request, res: Response) => {
    res.json({
      success: true,
      projectId: req.params.projectId,
      locations: KNOWN_LOCATIONS,
      transitModes: TRANSIT_MODES,
      activeJourneys: mockJourneys,
      temporalCycle: {
        diegeticTime: "23:45 (Midnight / গভীর রাত)",
        solarAngle: -42,
        moonPhase: "Waxing Gibbous (শুক্লপক্ষ অষ্টমী)",
        visibility: "Dense River Mist (কুয়াশাচ্ছন্ন)"
      }
    });
  });

  const calcPaths = [
    "/v1/projects/:projectId/spatial-gps/calculate",
    "/api/v1/projects/:projectId/spatial-gps/calculate"
  ];
  router.post(calcPaths, (req: Request, res: Response) => {
    const { origin, destination, transitMode, departureTime, claimedDurationHours, weather } = req.body || {};
    const audit = auditJourneyPhysics(
      origin || "Sadarghat River Terminal",
      destination || "Barisal Rocket Steamer Ghat",
      transitMode || "river_launch",
      departureTime || "22:00",
      claimedDurationHours !== undefined ? Number(claimedDurationHours) : undefined,
      weather || "calm"
    );

    res.json({
      success: true,
      projectId: req.params.projectId,
      audit
    });
  });

  return router;
}
