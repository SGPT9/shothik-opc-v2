import { Router, Request, Response } from "express";

export interface InventoryItem {
  id: string;
  name: string;
  nameBn: string;
  category: "weapon" | "ammunition" | "survival" | "clue" | "currency" | "relic";
  owner: string;
  quantity: number;
  maxCapacity?: number; // e.g. 6 rounds for revolver chamber
  currentCharges?: number;
  weightKg: number;
  condition: "pristine" | "worn" | "depleted" | "damaged" | "lost";
  originChapter: number;
  lastUsedChapter: number;
  isEquipped: boolean;
  notes: string;
}

export interface InventoryAuditAnomaly {
  id: string;
  item: string;
  character: string;
  severity: "critical_depletion" | "over_capacity" | "phantom_item" | "encumbrance_overload";
  severityLabelBn: string;
  chapter: number;
  message: string;
  resolutionSuggestion: string;
}

export const DEFAULT_ITEMS: InventoryItem[] = [
  {
    id: "item_webley_revolver",
    name: "Webley .38 Service Revolver",
    nameBn: "ওয়েবলি .৩৮ সার্ভিস রিভলভার",
    category: "weapon",
    owner: "ওসি রফিক (OC Rafiq)",
    quantity: 1,
    maxCapacity: 6,
    currentCharges: 2, // 4 rounds fired
    weightKg: 1.1,
    condition: "worn",
    originChapter: 1,
    lastUsedChapter: 4,
    isEquipped: true,
    notes: "Holstered under raincoat. 4 rounds fired during dock shootout; only 2 hollow-point cartridges remain in cylinder."
  },
  {
    id: "item_38_ammo_box",
    name: ".38 S&W Ammunition Pouch",
    nameBn: ".৩৮ কার্তুজের চামড়ার থলি",
    category: "ammunition",
    owner: "ওসি রফিক (OC Rafiq)",
    quantity: 12,
    maxCapacity: 24,
    currentCharges: 12,
    weightKg: 0.4,
    condition: "pristine",
    originChapter: 1,
    lastUsedChapter: 3,
    isEquipped: true,
    notes: "Brass casing cartridges tucked in waterproof waxed cloth."
  },
  {
    id: "item_brass_lantern",
    name: "Kerosene Brass Hurricane Lamp",
    nameBn: "পিতলের হারিকেন ও কেরোসিন",
    category: "survival",
    owner: "হিমু (Himu)",
    quantity: 1,
    maxCapacity: 100, // percentage fuel
    currentCharges: 35,
    weightKg: 1.8,
    condition: "worn",
    originChapter: 2,
    lastUsedChapter: 4,
    isEquipped: true,
    notes: "Smells of pungent burnt fuel; glass globe smeared with soot."
  },
  {
    id: "item_cipher_letter",
    name: "Wax-Sealed Zamindar Parchment",
    nameBn: "লাক্ষা-সিলমোহরকৃত জমিদারি দলিল",
    category: "clue",
    owner: "আরাফাত (Arafat)",
    quantity: 1,
    weightKg: 0.1,
    condition: "pristine",
    originChapter: 2,
    lastUsedChapter: 2,
    isEquipped: false,
    notes: "Stamped with 1924 Bengal Revenue seal; edge slightly charred."
  },
  {
    id: "item_copper_taka",
    name: "British India Silver Rupee Coins",
    nameBn: "রৌপ্যমুদ্রার টাকার থলি",
    category: "currency",
    owner: "হিমু (Himu)",
    quantity: 15,
    weightKg: 0.35,
    condition: "worn",
    originChapter: 1,
    lastUsedChapter: 4,
    isEquipped: true,
    notes: "Clinking softly inside yellow panjabi pocket."
  }
];

export function auditManuscriptInventory(
  manuscriptText: string,
  items: InventoryItem[] = DEFAULT_ITEMS
): {
  totalItems: number;
  totalEncumbranceKg: number;
  anomalies: InventoryAuditAnomaly[];
  generatedInventoryScene: string;
} {
  const anomalies: InventoryAuditAnomaly[] = [];

  // 1. Revolver ammo check
  const revolver = items.find((i) => i.id === "item_webley_revolver");
  if (revolver) {
    // Check if manuscript describes firing more rounds than available
    const fireMatches = (manuscriptText.match(/(গুলি|ফায়ার|fire|shot|trig)/gi) || []).length;
    if (fireMatches > (revolver.currentCharges || 0)) {
      anomalies.push({
        id: "anom_ammo_overflow",
        item: revolver.name,
        character: revolver.owner,
        severity: "critical_depletion",
        severityLabelBn: "অতিরিক্ত গুলি ফায়ার (Ammo Depletion Violation)",
        chapter: 4,
        message: `রিভলভারে মাত্র ${revolver.currentCharges}টি গুলি অবশিষ্ট ছিল, কিন্তু দৃশ্যে ${fireMatches} বার গুলি করার বিবরণ রয়েছে! কোনো রিলোড বর্ণনা ব্যতিরেকে এই ফায়ারিং ভৌতিক।`,
        resolutionSuggestion: "দৃশ্যের মাঝখানে ওসি রফিককে সিলিন্ডার খুলে দ্রুত ২ রাউন্ড কার্তুজ লোড করার একটি বাস্তবসম্মত মুহূর্ত যোগ করুন।"
      });
    }
  }

  // 2. Encumbrance overload check per character
  const weightByOwner: Record<string, number> = {};
  items.forEach((item) => {
    weightByOwner[item.owner] = (weightByOwner[item.owner] || 0) + item.weightKg;
  });

  Object.entries(weightByOwner).forEach(([owner, weight]) => {
    if (weight > 25) {
      anomalies.push({
        id: `anom_encumbrance_${owner}`,
        item: "Total Gear Load",
        character: owner,
        severity: "encumbrance_overload",
        severityLabelBn: "মাত্রাতিরিক্ত ওজন বোঝা (Overburdened)",
        chapter: 4,
        message: `${owner}-এর বর্তমান বহনকৃত সরঞ্জামের ওজন ${weight.toFixed(1)} কেজি ছাড়িয়ে গেছে, যা কাদামাটি বা নদীপথে হাঁটার গতিতে তীব্র ক্লান্তি সৃষ্টি করবে।`,
        resolutionSuggestion: "চরিত্রের ব্যাকপ্যাক থেকে অপ্রয়োজনীয় ভারী বস্তু কোনো ঘাটে ফেলে রাখার দৃশ্য যোগ করুন।"
      });
    }
  });

  // Calculate total encumbrance
  const totalEncumbranceKg = Math.round(items.reduce((acc, i) => acc + i.weightKg, 0) * 10) / 10;

  // Generate sensory inventory inspection scene
  const generatedInventoryScene = `ওসি রফিক বৃষ্টির ছাঁট থেকে বাঁচাতে রিভলভারটি চামড়ার কোমরবন্ধনীতে শক্ত করে আঁটকে ধরলেন। সিলিন্ডারটি এক ঝটকায় বাঁয়ে ঘুরিয়ে আলোতে ধরতেই চোখে পড়ল—ভেতরে আর মাত্র দুটি ব্রাস কার্তুজ অবশিষ্ট। বাকি চারটি চেম্বার কালো পোড়া বারুদের গন্ধে ফাঁকা। আঙুলের কাঁপুনি চেপে তিনি ভেজা পকেট থেকে অতিরিক্ত কার্তুজের থলিটি অনুভব করলেন। হিমুর কাঁধের কাপড়ের থলেতে পিতলের হারিকেনটি ধাতব শব্দ তুলে দুলছিল; তার কেরোসিনের গন্ধ বাতাসে তীব্র হয়ে ছড়িয়ে পড়ছিল।`;

  return {
    totalItems: items.length,
    totalEncumbranceKg,
    anomalies,
    generatedInventoryScene
  };
}

export function createItemLedgerRouter(): Router {
  const router = Router();
  let currentInventory = [...DEFAULT_ITEMS];

  const statePaths = ["/v1/projects/:projectId/item-ledger", "/api/v1/projects/:projectId/item-ledger"];
  router.get(statePaths, (req: Request, res: Response) => {
    const audit = auditManuscriptInventory("", currentInventory);
    res.json({
      success: true,
      projectId: req.params.projectId,
      items: currentInventory,
      audit
    });
  });

  const auditPaths = [
    "/v1/projects/:projectId/item-ledger/audit",
    "/api/v1/projects/:projectId/item-ledger/audit"
  ];
  router.post(auditPaths, (req: Request, res: Response) => {
    const { manuscriptText } = req.body || {};
    const audit = auditManuscriptInventory(manuscriptText || "", currentInventory);
    res.json({
      success: true,
      projectId: req.params.projectId,
      audit
    });
  });

  const consumePaths = [
    "/v1/projects/:projectId/item-ledger/consume",
    "/api/v1/projects/:projectId/item-ledger/consume"
  ];
  router.post(consumePaths, (req: Request, res: Response) => {
    const { itemId, amount = 1 } = req.body || {};
    const item = currentInventory.find((i) => i.id === itemId);
    if (!item) {
      res.status(404).json({ success: false, error: "Item not found in ledger" });
      return;
    }

    if (item.currentCharges !== undefined) {
      item.currentCharges = Math.max(0, item.currentCharges - amount);
      if (item.currentCharges === 0) item.condition = "depleted";
    } else {
      item.quantity = Math.max(0, item.quantity - amount);
      if (item.quantity === 0) item.condition = "depleted";
    }

    res.json({
      success: true,
      item,
      message: `Consumed ${amount} unit(s) of ${item.name}`
    });
  });

  return router;
}
export const itemLedgerRouter = createItemLedgerRouter();
