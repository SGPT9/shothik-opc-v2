/**
 * Nilkhet Print-on-Demand (POD) Imposition Engine
 * Calculates exact spine geometry, CMYK FOGRA39 bleed dimensions, press signature layouts,
 * and standard JDF job ticket manifests for Nilkhet & Katabon commercial printing hubs.
 */

import { logger } from "./logger.js";

export type PaperType = "70gsm_offset" | "80gsm_cream" | "100gsm_art" | "120gsm_matte";
export type BindingType = "paperback_glue" | "hardcover_jacket" | "saddle_stitch" | "spiral";
export type TrimSize = "6x9" | "A5" | "Royal_Demy";

export interface PrintHub {
  id: string;
  name: string;
  location: string;
  marketCluster: string;
  machines: string[];
  supportedBindings: BindingType[];
  status: "active" | "high_queue" | "maintenance";
  standardTurnaroundDays: number;
  minCopies: number;
  contactPhone: string;
}

export interface SpineGeometry {
  pageCount: number;
  sheetCount: number;
  paperType: PaperType;
  sheetThicknessMm: number;
  spineWidthMm: number;
  trimSize: TrimSize;
  trimWidthMm: number;
  trimHeightMm: number;
  bleedMm: number;
  fullCoverWidthMm: number;
  fullCoverHeightMm: number;
  dpi: number;
  pixelDimensions: {
    widthPx: number;
    heightPx: number;
  };
  colorSpace: string;
}

export interface SignatureSheet {
  signatureNumber: number;
  sheetIndex: number;
  frontPages: [number, number]; // [Left page, Right page]
  backPages: [number, number];  // [Left page, Right page]
}

export interface ImpositionPlan {
  originalPageCount: number;
  paddedPageCount: number;
  signatureSize: 4 | 8 | 16;
  totalSignatures: number;
  totalSheets: number;
  platesRequired: number; // 4 plates (CMYK) per sheet side
  paperReamsRequired: number; // 500 sheets per ream
  sheets: SignatureSheet[];
}

export interface JobTicket {
  ticketId: string;
  orderId: string;
  bookTitle: string;
  authorName: string;
  hub: PrintHub;
  copyCount: number;
  spineGeometry: SpineGeometry;
  imposition: ImpositionPlan;
  bindingType: BindingType;
  paperType: PaperType;
  createdAt: string;
  status: "dispatched_to_press" | "plates_ready" | "press_running" | "bound" | "ready_for_courier";
  courierConsignment?: {
    partner: string;
    trackingCode: string;
    recipientName: string;
    recipientPhone: string;
    deliveryAddress: string;
    codAmountBdt: number;
  };
}

export const VERIFIED_NILKHET_HUBS: PrintHub[] = [
  {
    id: "hub_bakushah_press_01",
    name: "Bakushah Market Digital & Offset Press Complex",
    location: "Bakushah Market, Nilkhet, Dhaka-1205",
    marketCluster: "Nilkhet Main",
    machines: ["Heidelberg Speedmaster 4-Color Offset", "Horizon BQ-470 Perfect Binder", "Polar 92 Guillotine Cutter"],
    supportedBindings: ["paperback_glue", "hardcover_jacket", "saddle_stitch"],
    status: "active",
    standardTurnaroundDays: 2,
    minCopies: 1,
    contactPhone: "+8801711998877",
  },
  {
    id: "hub_katabon_offset_02",
    name: "Katabon Commercial Imposition Hub",
    location: "14/A Katabon Mosque Market, Dhaka-1205",
    marketCluster: "Katabon Digital Strip",
    machines: ["Konica Minolta AccurioPress C6100", "Duplo Booklet Maker", "Thermal Laminator"],
    supportedBindings: ["paperback_glue", "spiral", "saddle_stitch"],
    status: "active",
    standardTurnaroundDays: 1,
    minCopies: 1,
    contactPhone: "+8801822334455",
  },
  {
    id: "hub_nilkhet_central_03",
    name: "Nilkhet Central Book Binding Syndicate",
    location: "Islamia Market, Nilkhet Babupura, Dhaka-1205",
    marketCluster: "Babupura Press Alley",
    machines: ["Komori Lithrone G40 Offset Press", "Kolbus Hardcover Casemaker"],
    supportedBindings: ["paperback_glue", "hardcover_jacket"],
    status: "active",
    standardTurnaroundDays: 3,
    minCopies: 10,
    contactPhone: "+8801933445566",
  },
];

export class NilkhetImpositionEngine {
  private static activeTickets: Map<string, JobTicket> = new Map();

  /**
   * Paper caliper constants (thickness in mm per single physical sheet = 2 pages)
   */
  static getSheetThicknessMm(paperType: PaperType): number {
    switch (paperType) {
      case "80gsm_cream":
        return 0.11; // Munken / Swedish Book Print cream
      case "100gsm_art":
        return 0.13; // Gloss / Matte coated art paper
      case "120gsm_matte":
        return 0.16; // Heavy coated presentation stock
      case "70gsm_offset":
      default:
        return 0.09; // Standard Nilkhet offset paper
    }
  }

  /**
   * Standard trim dimensions in mm
   */
  static getTrimDimensionsMm(trimSize: TrimSize): { widthMm: number; heightMm: number } {
    switch (trimSize) {
      case "Royal_Demy":
        return { widthMm: 156.0, heightMm: 234.0 };
      case "A5":
        return { widthMm: 148.0, heightMm: 210.0 };
      case "6x9":
      default:
        return { widthMm: 152.4, heightMm: 228.6 }; // 6" x 9" Ekushey Boi Mela Standard
    }
  }

  /**
   * Calculates exact spine thickness and 300 DPI full-wrap cover geometry (Back + Spine + Front + Bleed)
   */
  static calculateSpineGeometry(
    pageCount: number,
    paperType: PaperType = "70gsm_offset",
    trimSize: TrimSize = "6x9",
    bleedMm: number = 3.0
  ): SpineGeometry {
    const pages = Math.max(4, Math.ceil(pageCount));
    const sheetCount = Math.ceil(pages / 2);
    const sheetThicknessMm = this.getSheetThicknessMm(paperType);

    // Spine = (sheets * sheetThickness) + 1.2mm board hinge allowance for adhesive creeping
    const rawSpine = sheetCount * sheetThicknessMm + 1.2;
    const spineWidthMm = Math.round(rawSpine * 10) / 10;

    const { widthMm: trimWidthMm, heightMm: trimHeightMm } = this.getTrimDimensionsMm(trimSize);

    // Full cover wrap = Back Cover Width + Spine + Front Cover Width + (2 * 3mm Bleed)
    const fullCoverWidthMm = Math.round((trimWidthMm * 2 + spineWidthMm + bleedMm * 2) * 10) / 10;
    // Full cover height = Trim Height + (2 * 3mm Bleed)
    const fullCoverHeightMm = Math.round((trimHeightMm + bleedMm * 2) * 10) / 10;

    // 1 mm = 0.0393701 inches -> pixels at 300 DPI = (mm * 300) / 25.4
    const widthPx = Math.round((fullCoverWidthMm * 300) / 25.4);
    const heightPx = Math.round((fullCoverHeightMm * 300) / 25.4);

    return {
      pageCount: pages,
      sheetCount,
      paperType,
      sheetThicknessMm,
      spineWidthMm,
      trimSize,
      trimWidthMm,
      trimHeightMm,
      bleedMm,
      fullCoverWidthMm,
      fullCoverHeightMm,
      dpi: 300,
      pixelDimensions: {
        widthPx,
        heightPx,
      },
      colorSpace: "CMYK (FOGRA39 / Japan Color 2001 Coated)",
    };
  }

  /**
   * Generates press signature imposition mapping (4, 8, or 16 pages per signature)
   */
  static generateSignatureImposition(
    pageCount: number,
    signatureSize: 4 | 8 | 16 = 16
  ): ImpositionPlan {
    const pages = Math.max(4, Math.ceil(pageCount));
    // Pad to multiple of signatureSize
    const remainder = pages % signatureSize;
    const paddedPageCount = remainder === 0 ? pages : pages + (signatureSize - remainder);
    const totalSignatures = Math.ceil(paddedPageCount / signatureSize);
    const sheetsPerSig = signatureSize / 4; // Each sheet holds 4 pages (2 front, 2 back)
    const totalSheets = totalSignatures * sheetsPerSig;

    const sheets: SignatureSheet[] = [];

    for (let sig = 0; sig < totalSignatures; sig++) {
      const sigStart = sig * signatureSize + 1;
      const sigEnd = (sig + 1) * signatureSize;

      for (let s = 0; s < sheetsPerSig; s++) {
        // Standard saddle-stitch / perfect-binding nested 2-up sheet pagination
        const p1 = sigStart + s * 2;
        const p4 = sigEnd - s * 2;
        const p2 = p1 + 1;
        const p3 = p4 - 1;

        sheets.push({
          signatureNumber: sig + 1,
          sheetIndex: sheets.length + 1,
          frontPages: [p4, p1], // Outermost left, outermost right on front
          backPages: [p2, p3],  // Inner left, inner right on back
        });
      }
    }

    // Offset press plates: 4 plates (Cyan, Magenta, Yellow, Black) per side = 8 plates per sheet
    const platesRequired = totalSheets * 8;
    // Ream calculation: total sheets for 1 copy * copies / 500
    const paperReamsRequired = Math.round((totalSheets / 500) * 100) / 100;

    return {
      originalPageCount: pageCount,
      paddedPageCount,
      signatureSize,
      totalSignatures,
      totalSheets,
      platesRequired,
      paperReamsRequired,
      sheets,
    };
  }

  /**
   * Dispatches a print order to a designated Nilkhet hub, generating a JDF job ticket
   */
  static dispatchOrderToHub(payload: {
    orderId: string;
    bookTitle: string;
    authorName: string;
    pageCount: number;
    copyCount: number;
    paperType?: PaperType;
    bindingType?: BindingType;
    trimSize?: TrimSize;
    hubId?: string;
    courierConsignment?: {
      partner: string;
      trackingCode: string;
      recipientName: string;
      recipientPhone: string;
      deliveryAddress: string;
      codAmountBdt: number;
    };
  }): JobTicket {
    const hubId = payload.hubId || "hub_bakushah_press_01";
    const hub = VERIFIED_NILKHET_HUBS.find((h) => h.id === hubId) || VERIFIED_NILKHET_HUBS[0];

    const paperType = payload.paperType || "70gsm_offset";
    const bindingType = payload.bindingType || "paperback_glue";
    const trimSize = payload.trimSize || "6x9";
    const copyCount = Math.max(1, payload.copyCount || 1);

    const spineGeometry = this.calculateSpineGeometry(payload.pageCount, paperType, trimSize);
    const imposition = this.generateSignatureImposition(payload.pageCount, 16);

    const ticketId = `JDF_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;

    const ticket: JobTicket = {
      ticketId,
      orderId: payload.orderId,
      bookTitle: payload.bookTitle,
      authorName: payload.authorName,
      hub,
      copyCount,
      spineGeometry,
      imposition,
      bindingType,
      paperType,
      createdAt: new Date().toISOString(),
      status: "dispatched_to_press",
      courierConsignment: payload.courierConsignment,
    };

    this.activeTickets.set(payload.orderId, ticket);
    this.activeTickets.set(ticketId, ticket);

    logger.info({ ticketId, orderId: payload.orderId, hub: hub.name }, "[NilkhetPOD] Job ticket dispatched to print hub");
    return ticket;
  }

  /**
   * Retrieves a job ticket by Order ID or Ticket ID
   */
  static getJobTicket(id: string): JobTicket | null {
    return this.activeTickets.get(id) || null;
  }

  /**
   * Lists all verified Nilkhet printing hubs
   */
  static getHubs(): PrintHub[] {
    return [...VERIFIED_NILKHET_HUBS];
  }
}
