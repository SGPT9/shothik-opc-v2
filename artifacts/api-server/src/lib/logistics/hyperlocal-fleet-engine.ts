import { randomUUID } from "node:crypto";

export type VehicleType = "cargo_bike" | "drone";
export type VehicleStatus = "available" | "in_transit" | "charging" | "maintenance" | "rtb";
export type WeatherCondition = "clear" | "overcast" | "rainy" | "high_winds";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface FleetVehicle {
  id: string;
  name: string;
  type: VehicleType;
  hubId: string;
  status: VehicleStatus;
  batteryPercent: number; // 0 - 100
  maxPayloadGrams: number;
  maxRangeKm: number;
  currentLocation: Coordinates & { corridor: string };
  assignedParcelId?: string;
  odometerKm: number;
}

export interface FleetHub {
  id: string;
  name: string;
  corridor: string;
  location: Coordinates;
  chargingSlotsAvailable: number;
  dronePadsAvailable: number;
}

export interface DeliveryCorridor {
  id: string;
  name: string;
  division: "Dhaka" | "Chittagong";
  baseDistanceKmFromHub: number;
  currentTrafficMultiplier: number; // 1.0 (light) to 2.8 (gridlock)
  droneFlightAllowed: boolean;
  weather: WeatherCondition;
}

export interface DispatchParcelInput {
  originHubId: string;
  destinationCorridor: string;
  destinationAddress: string;
  recipientName: string;
  recipientPhone: string;
  weightGrams: number;
  isUrgent?: boolean;
  codAmountBdt?: number;
}

export interface DispatchResult {
  dispatchId: string;
  parcelId: string;
  dispatchType: "internal_fleet" | "overflow_fallback";
  vehicle?: {
    id: string;
    name: string;
    type: VehicleType;
    remainingBatteryPercent: number;
  };
  fallbackCarrier?: "steadfast" | "pathao";
  estimatedMinutes: number;
  costBdt: number;
  distanceKm: number;
  trafficMultiplier: number;
  consignmentTrackingCode: string;
  timestamp: string;
  notes: string;
}

export class HyperlocalFleetEngine {
  private vehicles = new Map<string, FleetVehicle>();
  private hubs = new Map<string, FleetHub>();
  private corridors = new Map<string, DeliveryCorridor>();

  constructor() {
    this.seedDefaultInfrastructure();
  }

  private seedDefaultInfrastructure(): void {
    // 1. Hubs
    const hubs: FleetHub[] = [
      {
        id: "hub_gulshan_01",
        name: "Gulshan-2 Central Express Hub",
        corridor: "corridor_gulshan_banani",
        location: { lat: 23.7925, lng: 90.4078 },
        chargingSlotsAvailable: 8,
        dronePadsAvailable: 3,
      },
      {
        id: "hub_dhanmondi_01",
        name: "Dhanmondi 27 Micro-Hub",
        corridor: "corridor_dhanmondi",
        location: { lat: 23.7542, lng: 90.3764 },
        chargingSlotsAvailable: 6,
        dronePadsAvailable: 2,
      },
      {
        id: "hub_uttara_01",
        name: "Uttara Sector 11 Air & Bike Node",
        corridor: "corridor_uttara",
        location: { lat: 23.8759, lng: 90.3795 },
        chargingSlotsAvailable: 10,
        dronePadsAvailable: 4,
      },
    ];
    for (const h of hubs) this.hubs.set(h.id, h);

    // 2. Corridors
    const corridors: DeliveryCorridor[] = [
      {
        id: "corridor_gulshan_banani",
        name: "Gulshan - Banani - Baridhara Corridor",
        division: "Dhaka",
        baseDistanceKmFromHub: 3.5,
        currentTrafficMultiplier: 1.4,
        droneFlightAllowed: true,
        weather: "clear",
      },
      {
        id: "corridor_dhanmondi",
        name: "Dhanmondi - Mohammadpur Corridor",
        division: "Dhaka",
        baseDistanceKmFromHub: 4.8,
        currentTrafficMultiplier: 1.8,
        droneFlightAllowed: true,
        weather: "clear",
      },
      {
        id: "corridor_mirpur",
        name: "Mirpur 1 - 10 Corridor",
        division: "Dhaka",
        baseDistanceKmFromHub: 8.2,
        currentTrafficMultiplier: 2.2,
        droneFlightAllowed: false, // High urban density restriction
        weather: "clear",
      },
      {
        id: "corridor_uttara",
        name: "Uttara Sectors 1 - 14 Corridor",
        division: "Dhaka",
        baseDistanceKmFromHub: 5.0,
        currentTrafficMultiplier: 1.2,
        droneFlightAllowed: true,
        weather: "clear",
      },
      {
        id: "corridor_old_dhaka",
        name: "Old Dhaka Sadarghat - Chawkbazar",
        division: "Dhaka",
        baseDistanceKmFromHub: 11.5,
        currentTrafficMultiplier: 2.6, // Heavy traffic
        droneFlightAllowed: false,
        weather: "clear",
      },
      {
        id: "corridor_ctg_gec",
        name: "Chittagong Agrabad - GEC Circle",
        division: "Chittagong",
        baseDistanceKmFromHub: 6.0,
        currentTrafficMultiplier: 1.3,
        droneFlightAllowed: true,
        weather: "clear",
      },
    ];
    for (const c of corridors) this.corridors.set(c.id, c);

    // 3. Vehicles
    const initialVehicles: FleetVehicle[] = [
      {
        id: "BIKE-DHK-01",
        name: "VoltCargo Bike 01 (Gulshan)",
        type: "cargo_bike",
        hubId: "hub_gulshan_01",
        status: "available",
        batteryPercent: 92,
        maxPayloadGrams: 25000,
        maxRangeKm: 35,
        currentLocation: { lat: 23.7925, lng: 90.4078, corridor: "corridor_gulshan_banani" },
        odometerKm: 342,
      },
      {
        id: "BIKE-DHK-02",
        name: "VoltCargo Bike 02 (Dhanmondi)",
        type: "cargo_bike",
        hubId: "hub_dhanmondi_01",
        status: "available",
        batteryPercent: 84,
        maxPayloadGrams: 25000,
        maxRangeKm: 35,
        currentLocation: { lat: 23.7542, lng: 90.3764, corridor: "corridor_dhanmondi" },
        odometerKm: 512,
      },
      {
        id: "DRONE-DHK-01",
        name: "AeroExpress Falcon-2 (Gulshan SkyPad)",
        type: "drone",
        hubId: "hub_gulshan_01",
        status: "available",
        batteryPercent: 95,
        maxPayloadGrams: 1800, // 1.8 kg
        maxRangeKm: 8,
        currentLocation: { lat: 23.7925, lng: 90.4078, corridor: "corridor_gulshan_banani" },
        odometerKm: 128,
      },
      {
        id: "DRONE-DHK-02",
        name: "AeroExpress Falcon-3 (Uttara SkyPad)",
        type: "drone",
        hubId: "hub_uttara_01",
        status: "available",
        batteryPercent: 88,
        maxPayloadGrams: 2000, // 2.0 kg
        maxRangeKm: 10,
        currentLocation: { lat: 23.8759, lng: 90.3795, corridor: "corridor_uttara" },
        odometerKm: 96,
      },
    ];
    for (const v of initialVehicles) this.vehicles.set(v.id, v);
  }

  listVehicles(type?: VehicleType, status?: VehicleStatus): FleetVehicle[] {
    const list = Array.from(this.vehicles.values());
    return list.filter((v) => {
      if (type && v.type !== type) return false;
      if (status && v.status !== status) return false;
      return true;
    });
  }

  listCorridors(): DeliveryCorridor[] {
    return Array.from(this.corridors.values());
  }

  listHubs(): FleetHub[] {
    return Array.from(this.hubs.values());
  }

  updateCorridorConditions(
    corridorId: string,
    patch: { currentTrafficMultiplier?: number; weather?: WeatherCondition; droneFlightAllowed?: boolean },
  ): DeliveryCorridor {
    const corridor = this.corridors.get(corridorId);
    if (!corridor) throw new Error(`Corridor ${corridorId} not found`);

    if (patch.currentTrafficMultiplier !== undefined) {
      corridor.currentTrafficMultiplier = Math.max(1.0, Math.min(3.5, patch.currentTrafficMultiplier));
    }
    if (patch.weather !== undefined) {
      corridor.weather = patch.weather;
    }
    if (patch.droneFlightAllowed !== undefined) {
      corridor.droneFlightAllowed = patch.droneFlightAllowed;
    }

    this.corridors.set(corridorId, corridor);
    return corridor;
  }

  updateVehicleTelemetry(
    vehicleId: string,
    telemetry: {
      batteryPercent?: number;
      lat?: number;
      lng?: number;
      corridor?: string;
      status?: VehicleStatus;
    },
  ): FleetVehicle {
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) throw new Error(`Vehicle ${vehicleId} not found`);

    if (telemetry.status) {
      vehicle.status = telemetry.status;
    }
    if (telemetry.batteryPercent !== undefined) {
      vehicle.batteryPercent = Math.max(0, Math.min(100, telemetry.batteryPercent));
      if (vehicle.batteryPercent < 20 && vehicle.status === "in_transit") {
        vehicle.status = "rtb"; // Automated Return-to-Base safety trigger
      }
    }
    if (telemetry.lat !== undefined && telemetry.lng !== undefined) {
      vehicle.currentLocation.lat = telemetry.lat;
      vehicle.currentLocation.lng = telemetry.lng;
    }
    if (telemetry.corridor) {
      vehicle.currentLocation.corridor = telemetry.corridor;
    }

    this.vehicles.set(vehicleId, vehicle);
    return vehicle;
  }

  triggerEmergencyRtb(vehicleId: string): { vehicle: FleetVehicle; message: string } {
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) throw new Error(`Vehicle ${vehicleId} not found`);

    vehicle.status = "rtb";
    this.vehicles.set(vehicleId, vehicle);
    return {
      vehicle,
      message: `Emergency RTB triggered for ${vehicle.name}. Heading to hub ${vehicle.hubId}.`,
    };
  }

  dispatchParcel(input: DispatchParcelInput): DispatchResult {
    const corridor = this.corridors.get(input.destinationCorridor);
    if (!corridor) {
      throw new Error(`Invalid destination corridor: ${input.destinationCorridor}`);
    }

    const parcelId = `PCL-${randomUUID().slice(0, 8).toUpperCase()}`;
    const dispatchId = `DSP-${randomUUID().slice(0, 8).toUpperCase()}`;
    const now = new Date().toISOString();

    // 1. Evaluate fleet suitability
    const availableVehicles = Array.from(this.vehicles.values()).filter(
      (v) => v.status === "available" && v.batteryPercent >= 20,
    );

    let selectedVehicle: FleetVehicle | null = null;
    let bestScore = -Infinity;

    for (const vehicle of availableVehicles) {
      // Hard Constraints
      if (input.weightGrams > vehicle.maxPayloadGrams) continue;

      const remainingRangeKm = (vehicle.batteryPercent / 100) * vehicle.maxRangeKm;
      // Round trip requirement (2x distance)
      if (corridor.baseDistanceKmFromHub * 2 > remainingRangeKm) continue;

      if (vehicle.type === "drone") {
        if (!corridor.droneFlightAllowed) continue;
        if (corridor.weather === "rainy" || corridor.weather === "high_winds") continue;
      }

      // Compute optimization score
      // S = 0.50 * ETA_score + 0.30 * Cost_score + 0.20 * Battery_score
      const estMinutes = vehicle.type === "drone"
        ? Math.round(corridor.baseDistanceKmFromHub * 2.5) // Drone flies ~30-40km/h direct path
        : Math.round(corridor.baseDistanceKmFromHub * 3.5 * corridor.currentTrafficMultiplier);

      const etaScore = Math.max(0, 1 - estMinutes / 60);
      const costScore = vehicle.type === "drone" ? 0.7 : 0.9;
      const batteryScore = vehicle.batteryPercent / 100;

      const score = (input.isUrgent ? 0.7 : 0.5) * etaScore + 0.3 * costScore + 0.2 * batteryScore;
      if (score > bestScore) {
        bestScore = score;
        selectedVehicle = vehicle;
      }
    }

    // 2. If fleet is available, dispatch internally
    if (selectedVehicle) {
      const isDrone = selectedVehicle.type === "drone";
      const travelMinutes = isDrone
        ? Math.round(corridor.baseDistanceKmFromHub * 2.5)
        : Math.round(corridor.baseDistanceKmFromHub * 3.5 * corridor.currentTrafficMultiplier);

      // Deplete battery proportionally
      const batteryDepleted = Math.min(
        selectedVehicle.batteryPercent - 5,
        Math.round((corridor.baseDistanceKmFromHub * 2 / selectedVehicle.maxRangeKm) * 50),
      );

      selectedVehicle.status = "in_transit";
      selectedVehicle.batteryPercent = Math.max(5, selectedVehicle.batteryPercent - batteryDepleted);
      selectedVehicle.assignedParcelId = parcelId;
      selectedVehicle.odometerKm += Math.round(corridor.baseDistanceKmFromHub * 2);
      this.vehicles.set(selectedVehicle.id, selectedVehicle);

      const baseCost = isDrone ? 120 : 60;
      const weightCost = Math.ceil(input.weightGrams / 1000) * 15;
      const totalCostBdt = baseCost + weightCost;

      return {
        dispatchId,
        parcelId,
        dispatchType: "internal_fleet",
        vehicle: {
          id: selectedVehicle.id,
          name: selectedVehicle.name,
          type: selectedVehicle.type,
          remainingBatteryPercent: selectedVehicle.batteryPercent,
        },
        estimatedMinutes: travelMinutes,
        costBdt: totalCostBdt,
        distanceKm: corridor.baseDistanceKmFromHub,
        trafficMultiplier: corridor.currentTrafficMultiplier,
        consignmentTrackingCode: `HYP-${selectedVehicle.type.toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`,
        timestamp: now,
        notes: isDrone
          ? `Dispatched via Autonomous Line-of-Sight Micro-Drone to ${corridor.name}.`
          : `Dispatched via VoltCargo Electric Bike with traffic index ${corridor.currentTrafficMultiplier}x.`,
      };
    }

    // 3. Overflow Fallback: Pathao / Steadfast
    const fallbackCarrier = input.isUrgent ? "pathao" : "steadfast";
    const fallbackMinutes = fallbackCarrier === "pathao" ? 45 : 120;
    const fallbackCost = fallbackCarrier === "pathao" ? 110 : 70;

    return {
      dispatchId,
      parcelId,
      dispatchType: "overflow_fallback",
      fallbackCarrier,
      estimatedMinutes: fallbackMinutes,
      costBdt: fallbackCost,
      distanceKm: corridor.baseDistanceKmFromHub,
      trafficMultiplier: corridor.currentTrafficMultiplier,
      consignmentTrackingCode: `${fallbackCarrier.toUpperCase()}-FALLBACK-${randomUUID().slice(0, 8).toUpperCase()}`,
      timestamp: now,
      notes: `All local micro-fleet units busy or out of range. Automated 3rd-party overflow dispatch assigned to ${fallbackCarrier.toUpperCase()}.`,
    };
  }
}

export const globalHyperlocalFleetEngine = new HyperlocalFleetEngine();
