/**
 * Autonomous Hyperlocal Dark Store & Micro-Fulfillment Dark Hub Orchestrator
 * Slice 37: Multi-hub inventory routing, S-curve bin pick-path optimization,
 * FEFO lot/expiry management, and inter-hub replenishment planning.
 */

import { createHash } from 'crypto';

export interface DarkHub {
  hubId: string;
  name: string;
  city: 'Dhaka' | 'Chittagong' | 'Sylhet' | 'Rajshahi';
  zone: string;
  coveredThanas: string[];
  capacityUnits: number;
  utilizedUnits: number;
  status: 'active' | 'maintenance' | 'overloaded';
  averageDispatchMinutes: number;
  contactNumber: string;
  address: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'Groceries' | 'Cosmetics' | 'Electronics' | 'Apparel' | 'Pharma';
  hubId: string;
  quantity: number;
  binLocation: string; // e.g. "A02-R03-S01-B05" (Aisle-Rack-Shelf-Bin)
  batchNumber: string;
  mfgDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  unitCostBDT: number;
  sellingPriceBDT: number;
  dailyVelocity: number; // units sold per day
}

export interface OrderItemRequest {
  sku: string;
  quantity: number;
}

export interface RouteOrderResult {
  orderId: string;
  customerThana: string;
  assignedHub: DarkHub;
  fulfilmentType: 'hyperlocal_fast_dispatch' | 'central_transfer' | 'multi_hub_split';
  estimatedDeliveryMinutes: number;
  itemsAvailable: boolean;
  allocatedItems: Array<{
    sku: string;
    requestedQty: number;
    allocatedQty: number;
    batchNumber: string;
    binLocation: string;
    expiryDate: string;
  }>;
  unfulfilledItems: Array<{
    sku: string;
    shortageQty: number;
  }>;
  routingScore: number;
  routedAt: string;
}

export interface PickTask {
  pickSequence: number;
  sku: string;
  itemName: string;
  batchNumber: string;
  binLocation: string;
  aisle: number;
  rack: number;
  shelf: number;
  bin: number;
  quantityToPick: number;
  expiryDate: string;
  barcode: string;
}

export interface PickListResult {
  pickListId: string;
  hubId: string;
  hubName: string;
  totalItems: number;
  totalQuantity: number;
  estimatedPickTimeSeconds: number;
  estimatedWalkingMeters: number;
  tasks: PickTask[];
  pathOptimization: 's_curve_serpentine';
  generatedAt: string;
}

export interface ExpiryAlert {
  itemId: string;
  sku: string;
  name: string;
  hubId: string;
  hubName: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  daysRemaining: number;
  urgency: 'critical' | 'high' | 'medium' | 'safe';
  recommendedDiscountPercent: number;
  suggestedMarkdownPriceBDT: number;
  originalPriceBDT: number;
}

export interface RebalanceTransfer {
  sourceHubId: string;
  sourceHubName: string;
  destinationHubId: string;
  destinationHubName: string;
  sku: string;
  itemName: string;
  transferQuantity: number;
  reason: string;
  priority: 'urgent' | 'standard' | 'routine';
  estimatedCostBDT: number;
}

export interface RebalancePlanResult {
  planId: string;
  generatedAt: string;
  totalTransfers: number;
  totalUnitsToMove: number;
  transfers: RebalanceTransfer[];
  hubHealthScores: Record<string, { stockoutRisk: 'low' | 'medium' | 'high'; daysOfCover: number }>;
}

// Initial Dark Hub Network
export const INITIAL_DARK_HUBS: DarkHub[] = [
  {
    hubId: 'HUB-DHK-00',
    name: 'Tejgaon Central Mega-Hub',
    city: 'Dhaka',
    zone: 'Central Dhaka',
    coveredThanas: ['Tejgaon', 'Tejgaon I/A', 'Mohakhali', 'Niketan'],
    capacityUnits: 50000,
    utilizedUnits: 34200,
    status: 'active',
    averageDispatchMinutes: 45,
    contactNumber: '+8801700000100',
    address: 'Plot 42, Tejgaon I/A, Dhaka 1208'
  },
  {
    hubId: 'HUB-DHK-01',
    name: 'Dhanmondi Express Dark Store',
    city: 'Dhaka',
    zone: 'South-West Dhaka',
    coveredThanas: ['Dhanmondi', 'Kalabagan', 'Mohammadpur', 'Hazaribagh', 'New Market', 'Lalmatia'],
    capacityUnits: 12000,
    utilizedUnits: 9450,
    status: 'active',
    averageDispatchMinutes: 22,
    contactNumber: '+8801700000101',
    address: 'House 27, Road 27, Dhanmondi, Dhaka 1209'
  },
  {
    hubId: 'HUB-DHK-02',
    name: 'Uttara Fast-Hub',
    city: 'Dhaka',
    zone: 'North Dhaka',
    coveredThanas: ['Uttara', 'Uttarkhan', 'Dakshinkhan', 'Airport', 'Khilkhet', 'Tongi'],
    capacityUnits: 15000,
    utilizedUnits: 11200,
    status: 'active',
    averageDispatchMinutes: 25,
    contactNumber: '+8801700000102',
    address: 'Sector 11, Sonargaon Janapath, Uttara, Dhaka 1230'
  },
  {
    hubId: 'HUB-DHK-03',
    name: 'Mirpur Micro-Fulfillment Center',
    city: 'Dhaka',
    zone: 'North-West Dhaka',
    coveredThanas: ['Mirpur', 'Pallabi', 'Kafrul', 'Cantonment', 'Darus Salam', 'Rupnagar'],
    capacityUnits: 14000,
    utilizedUnits: 8900,
    status: 'active',
    averageDispatchMinutes: 28,
    contactNumber: '+8801700000103',
    address: 'Section 10, Mirpur Circle, Dhaka 1216'
  },
  {
    hubId: 'HUB-DHK-04',
    name: 'Gulshan-Badda Hub',
    city: 'Dhaka',
    zone: 'East Dhaka',
    coveredThanas: ['Gulshan', 'Banani', 'Badda', 'Bhatara', 'Baridhara', 'Bashundhara'],
    capacityUnits: 18000,
    utilizedUnits: 14600,
    status: 'active',
    averageDispatchMinutes: 20,
    contactNumber: '+8801700000104',
    address: 'Pragoti Sarani, Badda, Dhaka 1212'
  },
  {
    hubId: 'HUB-DHK-05',
    name: 'Old Dhaka Heritage Hub',
    city: 'Dhaka',
    zone: 'Old Dhaka',
    coveredThanas: ['Kotwali', 'Sutrapur', 'Wari', 'Lalbagh', 'Chawkbazar', 'Gendaria', 'Sadarghat'],
    capacityUnits: 10000,
    utilizedUnits: 7200,
    status: 'active',
    averageDispatchMinutes: 30,
    contactNumber: '+8801700000105',
    address: 'Johnson Road, Sadarghat, Dhaka 1100'
  },
  {
    hubId: 'HUB-CTG-01',
    name: 'Chittagong GEC Port-Hub',
    city: 'Chittagong',
    zone: 'Central Chittagong',
    coveredThanas: ['Khulshi', 'Panchlaish', 'Kotwali', 'Chawkbazar', 'GEC Circle'],
    capacityUnits: 16000,
    utilizedUnits: 10500,
    status: 'active',
    averageDispatchMinutes: 24,
    contactNumber: '+8801700000201',
    address: 'GEC Circle, Nasirabad, Chittagong 4000'
  },
  {
    hubId: 'HUB-SYL-01',
    name: 'Sylhet Zindabazar Hub',
    city: 'Sylhet',
    zone: 'Sylhet Sadar',
    coveredThanas: ['Kotwali', 'Zindabazar', 'Amberkhana', 'Shibganj', 'Shahjalal'],
    capacityUnits: 8000,
    utilizedUnits: 4900,
    status: 'active',
    averageDispatchMinutes: 26,
    contactNumber: '+8801700000301',
    address: 'Zindabazar Point, Sylhet 3100'
  },
  {
    hubId: 'HUB-RAJ-01',
    name: 'Rajshahi Silk Hub',
    city: 'Rajshahi',
    zone: 'Rajshahi Sadar',
    coveredThanas: ['Boalia', 'Rajpara', 'Motihar', 'Chandrima', 'Shaheb Bazar'],
    capacityUnits: 6000,
    utilizedUnits: 3100,
    status: 'active',
    averageDispatchMinutes: 30,
    contactNumber: '+8801700000401',
    address: 'Shaheb Bazar Zero Point, Rajshahi 6000'
  }
];

// Initial Seed Inventory
export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'INV_001',
    sku: 'SKU_SHAMPOO_ONION_250ML',
    name: 'Herbal Organic Red Onion Hair Growth Shampoo (250ml)',
    category: 'Cosmetics',
    hubId: 'HUB-DHK-01',
    quantity: 140,
    binLocation: 'A01-R02-S03-B04',
    batchNumber: 'LOT_ONION_2026A',
    mfgDate: '2026-01-10',
    expiryDate: '2027-01-10',
    unitCostBDT: 280,
    sellingPriceBDT: 650,
    dailyVelocity: 18
  },
  {
    id: 'INV_002',
    sku: 'SKU_SHAMPOO_ONION_250ML',
    name: 'Herbal Organic Red Onion Hair Growth Shampoo (250ml)',
    category: 'Cosmetics',
    hubId: 'HUB-DHK-01',
    quantity: 25,
    binLocation: 'A01-R02-S03-B05',
    batchNumber: 'LOT_ONION_2025Z',
    mfgDate: '2025-10-01',
    expiryDate: '2026-10-15', // Near expiry
    unitCostBDT: 280,
    sellingPriceBDT: 650,
    dailyVelocity: 18
  },
  {
    id: 'INV_003',
    sku: 'SKU_SERUM_VITC_30ML',
    name: 'Pure Glow 15% Vitamin C Brightening Face Serum (30ml)',
    category: 'Cosmetics',
    hubId: 'HUB-DHK-01',
    quantity: 85,
    binLocation: 'A02-R01-S02-B08',
    batchNumber: 'LOT_VITC_202603',
    mfgDate: '2026-03-01',
    expiryDate: '2027-09-01',
    unitCostBDT: 320,
    sellingPriceBDT: 790,
    dailyVelocity: 12
  },
  {
    id: 'INV_004',
    sku: 'SKU_MUSTARD_OIL_1L',
    name: 'Cold Pressed Pure Ghani Mustard Oil (1 Litre)',
    category: 'Groceries',
    hubId: 'HUB-DHK-01',
    quantity: 60,
    binLocation: 'A03-R04-S01-B02',
    batchNumber: 'LOT_OIL_2026B',
    mfgDate: '2026-02-15',
    expiryDate: '2027-02-15',
    unitCostBDT: 240,
    sellingPriceBDT: 390,
    dailyVelocity: 15
  },
  {
    id: 'INV_005',
    sku: 'SKU_SHAMPOO_ONION_250ML',
    name: 'Herbal Organic Red Onion Hair Growth Shampoo (250ml)',
    category: 'Cosmetics',
    hubId: 'HUB-DHK-02',
    quantity: 210,
    binLocation: 'A01-R01-S02-B01',
    batchNumber: 'LOT_ONION_2026A',
    mfgDate: '2026-01-10',
    expiryDate: '2027-01-10',
    unitCostBDT: 280,
    sellingPriceBDT: 650,
    dailyVelocity: 22
  },
  {
    id: 'INV_006',
    sku: 'SKU_TEA_SYLHET_500G',
    name: 'Premium Sreemangal BOP Black Tea (500g)',
    category: 'Groceries',
    hubId: 'HUB-DHK-04',
    quantity: 180,
    binLocation: 'A02-R03-S04-B10',
    batchNumber: 'LOT_TEA_2026K',
    mfgDate: '2026-04-01',
    expiryDate: '2028-04-01',
    unitCostBDT: 190,
    sellingPriceBDT: 420,
    dailyVelocity: 20
  },
  {
    id: 'INV_007',
    sku: 'SKU_HONEY_SUNDARBAN_500G',
    name: 'Raw Wild Sundarbans Mangrove Honey (500g)',
    category: 'Groceries',
    hubId: 'HUB-DHK-00', // Central Hub
    quantity: 2400,
    binLocation: 'A05-R08-S02-B12',
    batchNumber: 'LOT_HNY_2026A',
    mfgDate: '2026-03-10',
    expiryDate: '2028-03-10',
    unitCostBDT: 380,
    sellingPriceBDT: 850,
    dailyVelocity: 50
  },
  {
    id: 'INV_008',
    sku: 'SKU_VITAMIN_E_CAPS_60S',
    name: 'Natural Vitamin E 400IU Softgels (60 Count)',
    category: 'Pharma',
    hubId: 'HUB-DHK-03',
    quantity: 18,
    binLocation: 'A01-R03-S02-B03',
    batchNumber: 'LOT_VITE_2025Q',
    mfgDate: '2025-05-01',
    expiryDate: '2026-10-05', // Critical expiry (<30 days)
    unitCostBDT: 210,
    sellingPriceBDT: 550,
    dailyVelocity: 6
  }
];

export class DarkHubEngine {
  private hubs: DarkHub[] = [...INITIAL_DARK_HUBS];
  private inventory: InventoryItem[] = [...INITIAL_INVENTORY];

  public getAllHubs(): DarkHub[] {
    return this.hubs;
  }

  public getHubById(hubId: string): DarkHub | undefined {
    return this.hubs.find(h => h.hubId === hubId);
  }

  public getInventory(hubId?: string): InventoryItem[] {
    if (hubId) {
      return this.inventory.filter(i => i.hubId === hubId);
    }
    return this.inventory;
  }

  /**
   * Route an order to the nearest dark store covering the customer's thana
   * with available stock and FEFO lot allocation.
   */
  public routeOrder(
    customerThana: string,
    requestedItems: OrderItemRequest[],
    orderId?: string
  ): RouteOrderResult {
    const id = orderId || `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const normalizedThana = customerThana.trim().toLowerCase();

    // 1. Find hub that covers this thana
    let matchedHub = this.hubs.find(hub =>
      hub.status === 'active' &&
      hub.coveredThanas.some(t => t.toLowerCase() === normalizedThana)
    );

    // If no direct thana match, fallback to Central Hub (HUB-DHK-00) or first active Dhaka hub
    if (!matchedHub) {
      matchedHub = this.hubs.find(h => h.hubId === 'HUB-DHK-00') || this.hubs[0];
    }

    const allocatedItems: RouteOrderResult['allocatedItems'] = [];
    const unfulfilledItems: RouteOrderResult['unfulfilledItems'] = [];
    let allAvailable = true;

    for (const req of requestedItems) {
      // Find matching SKU inventory in the matched hub, sorted by FEFO (earliest expiry first)
      const hubStock = this.inventory
        .filter(i => i.hubId === matchedHub!.hubId && i.sku === req.sku && i.quantity > 0)
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

      const totalHubQty = hubStock.reduce((acc, curr) => acc + curr.quantity, 0);

      if (totalHubQty >= req.quantity) {
        let remainingToAlloc = req.quantity;
        for (const lot of hubStock) {
          if (remainingToAlloc <= 0) break;
          const allocFromThisLot = Math.min(lot.quantity, remainingToAlloc);
          allocatedItems.push({
            sku: req.sku,
            requestedQty: req.quantity,
            allocatedQty: allocFromThisLot,
            batchNumber: lot.batchNumber,
            binLocation: lot.binLocation,
            expiryDate: lot.expiryDate
          });
          remainingToAlloc -= allocFromThisLot;
        }
      } else {
        allAvailable = false;
        // Allocate what's available
        let allocSum = 0;
        for (const lot of hubStock) {
          allocatedItems.push({
            sku: req.sku,
            requestedQty: req.quantity,
            allocatedQty: lot.quantity,
            batchNumber: lot.batchNumber,
            binLocation: lot.binLocation,
            expiryDate: lot.expiryDate
          });
          allocSum += lot.quantity;
        }
        unfulfilledItems.push({
          sku: req.sku,
          shortageQty: req.quantity - allocSum
        });
      }
    }

    const isDirectFastDispatch = matchedHub.hubId !== 'HUB-DHK-00' && allAvailable;
    const estimatedMinutes = isDirectFastDispatch
      ? matchedHub.averageDispatchMinutes
      : (matchedHub.averageDispatchMinutes + 35);

    const routingScore = allAvailable ? 98.5 : 65.0;

    return {
      orderId: id,
      customerThana,
      assignedHub: matchedHub,
      fulfilmentType: isDirectFastDispatch ? 'hyperlocal_fast_dispatch' : (allAvailable ? 'central_transfer' : 'multi_hub_split'),
      estimatedDeliveryMinutes: estimatedMinutes,
      itemsAvailable: allAvailable,
      allocatedItems,
      unfulfilledItems,
      routingScore,
      routedAt: new Date().toISOString()
    };
  }

  /**
   * Parse 3D Bin Location `A01-R02-S03-B04` and generate an S-curve serpentine pick path.
   * Serpentine logic:
   * Odd aisles: pick from lowest rack/shelf to highest (0 -> N)
   * Even aisles: pick from highest rack/shelf to lowest (N -> 0)
   */
  public generatePickList(hubId: string, itemsToPick: Array<{ sku: string; quantity: number }>): PickListResult {
    const hub = this.getHubById(hubId) || this.hubs[0];
    const pickTasks: PickTask[] = [];

    for (const req of itemsToPick) {
      const stockLots = this.inventory
        .filter(i => i.hubId === hub.hubId && i.sku === req.sku && i.quantity > 0)
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

      let remaining = req.quantity;
      for (const lot of stockLots) {
        if (remaining <= 0) break;
        const qty = Math.min(lot.quantity, remaining);
        
        // Parse bin: e.g. "A02-R03-S01-B05"
        const binCoords = this.parseBinLocation(lot.binLocation);

        pickTasks.push({
          pickSequence: 0,
          sku: lot.sku,
          itemName: lot.name,
          batchNumber: lot.batchNumber,
          binLocation: lot.binLocation,
          aisle: binCoords.aisle,
          rack: binCoords.rack,
          shelf: binCoords.shelf,
          bin: binCoords.bin,
          quantityToPick: qty,
          expiryDate: lot.expiryDate,
          barcode: `PICK-${lot.sku}-${lot.batchNumber}`
        });

        remaining -= qty;
      }
    }

    // Sort using Serpentine (S-Curve) logic
    pickTasks.sort((a, b) => {
      if (a.aisle !== b.aisle) {
        return a.aisle - b.aisle;
      }
      // Same aisle: if odd aisle, ascending rack/shelf; if even aisle, descending rack/shelf
      const isOddAisle = a.aisle % 2 !== 0;
      if (a.rack !== b.rack) {
        return isOddAisle ? a.rack - b.rack : b.rack - a.rack;
      }
      if (a.shelf !== b.shelf) {
        return isOddAisle ? a.shelf - b.shelf : b.shelf - a.shelf;
      }
      return a.bin - b.bin;
    });

    // Assign final pick sequences
    pickTasks.forEach((task, idx) => {
      task.pickSequence = idx + 1;
    });

    const totalQty = pickTasks.reduce((acc, t) => acc + t.quantityToPick, 0);
    // Estimated 12 seconds per distinct pick location + 5s per additional unit + walking meters * 0.8s
    const walkingMeters = Math.max(15, pickTasks.length * 8.5);
    const estimatedSeconds = Math.round(pickTasks.length * 14 + totalQty * 2.5 + walkingMeters * 0.75);

    return {
      pickListId: `PKL_${Date.now()}_${createHash('md5').update(JSON.stringify(itemsToPick)).digest('hex').substring(0, 6)}`,
      hubId: hub.hubId,
      hubName: hub.name,
      totalItems: pickTasks.length,
      totalQuantity: totalQty,
      estimatedPickTimeSeconds: estimatedSeconds,
      estimatedWalkingMeters: Math.round(walkingMeters),
      tasks: pickTasks,
      pathOptimization: 's_curve_serpentine',
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Helper to parse string bin format e.g. "A02-R03-S01-B05"
   */
  public parseBinLocation(binStr: string): { aisle: number; rack: number; shelf: number; bin: number } {
    const defaultCoords = { aisle: 1, rack: 1, shelf: 1, bin: 1 };
    if (!binStr) return defaultCoords;

    const parts = binStr.split('-');
    if (parts.length < 4) return defaultCoords;

    const aisle = parseInt(parts[0].replace(/\D/g, ''), 10) || 1;
    const rack = parseInt(parts[1].replace(/\D/g, ''), 10) || 1;
    const shelf = parseInt(parts[2].replace(/\D/g, ''), 10) || 1;
    const bin = parseInt(parts[3].replace(/\D/g, ''), 10) || 1;

    return { aisle, rack, shelf, bin };
  }

  /**
   * Scan all inventory for approaching FEFO expiries and calculate liquidation markdowns.
   */
  public getExpiryAlerts(referenceDateStr?: string): ExpiryAlert[] {
    const today = referenceDateStr ? new Date(referenceDateStr) : new Date();
    const alerts: ExpiryAlert[] = [];

    for (const item of this.inventory) {
      const exp = new Date(item.expiryDate);
      const diffTime = exp.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const hub = this.getHubById(item.hubId);

      if (diffDays <= 90) {
        let urgency: ExpiryAlert['urgency'] = 'safe';
        let discount = 0;

        if (diffDays <= 15) {
          urgency = 'critical';
          discount = 60; // 60% liquidation
        } else if (diffDays <= 30) {
          urgency = 'high';
          discount = 35; // 35% flash sale
        } else if (diffDays <= 60) {
          urgency = 'medium';
          discount = 15; // 15% early markdown
        } else {
          urgency = 'safe';
          discount = 5;
        }

        const discountedPrice = Math.round(item.sellingPriceBDT * (1 - discount / 100));

        alerts.push({
          itemId: item.id,
          sku: item.sku,
          name: item.name,
          hubId: item.hubId,
          hubName: hub ? hub.name : item.hubId,
          batchNumber: item.batchNumber,
          quantity: item.quantity,
          expiryDate: item.expiryDate,
          daysRemaining: diffDays,
          urgency,
          recommendedDiscountPercent: discount,
          suggestedMarkdownPriceBDT: discountedPrice,
          originalPriceBDT: item.sellingPriceBDT
        });
      }
    }

    return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  /**
   * Calculate velocity-driven replenishment transfers from Central Hub to regional dark stores.
   */
  public generateRebalancePlan(): RebalancePlanResult {
    const transfers: RebalanceTransfer[] = [];
    const hubHealthScores: RebalancePlanResult['hubHealthScores'] = {};
    const centralHub = this.hubs.find(h => h.hubId === 'HUB-DHK-00') || this.hubs[0];

    // Evaluate each regional hub (excluding central)
    const regionalHubs = this.hubs.filter(h => h.hubId !== 'HUB-DHK-00' && h.status === 'active');

    for (const hub of regionalHubs) {
      const hubItems = this.inventory.filter(i => i.hubId === hub.hubId);
      let totalDaysCover = 0;
      let skuCount = 0;

      for (const item of hubItems) {
        const daysOfCover = item.dailyVelocity > 0 ? item.quantity / item.dailyVelocity : 30;
        totalDaysCover += daysOfCover;
        skuCount++;

        // If cover is less than 4 days, trigger replenishment from Central Hub
        if (daysOfCover < 4.0) {
          const desiredCoverDays = 10;
          const deficitUnits = Math.round((desiredCoverDays - daysOfCover) * item.dailyVelocity);
          
          if (deficitUnits > 0) {
            transfers.push({
              sourceHubId: centralHub.hubId,
              sourceHubName: centralHub.name,
              destinationHubId: hub.hubId,
              destinationHubName: hub.name,
              sku: item.sku,
              itemName: item.name,
              transferQuantity: deficitUnits,
              reason: `Stock cover at ${daysOfCover.toFixed(1)} days (< 4.0d safety buffer). High demand velocity of ${item.dailyVelocity}/day.`,
              priority: daysOfCover < 2.0 ? 'urgent' : 'standard',
              estimatedCostBDT: Math.round(deficitUnits * 12.5) // Intra-city truck replenishment cost
            });
          }
        }
      }

      const avgCover = skuCount > 0 ? totalDaysCover / skuCount : 15;
      hubHealthScores[hub.hubId] = {
        stockoutRisk: avgCover < 3.0 ? 'high' : (avgCover < 6.0 ? 'medium' : 'low'),
        daysOfCover: parseFloat(avgCover.toFixed(1))
      };
    }

    const totalUnits = transfers.reduce((acc, t) => acc + t.transferQuantity, 0);

    return {
      planId: `RBP_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      generatedAt: new Date().toISOString(),
      totalTransfers: transfers.length,
      totalUnitsToMove: totalUnits,
      transfers,
      hubHealthScores
    };
  }

  /**
   * Register a new inventory batch/lot
   */
  public registerBatch(item: Omit<InventoryItem, 'id'>): InventoryItem {
    const newItem: InventoryItem = {
      ...item,
      id: `INV_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };
    this.inventory.push(newItem);
    return newItem;
  }
}

export const darkHubEngine = new DarkHubEngine();
