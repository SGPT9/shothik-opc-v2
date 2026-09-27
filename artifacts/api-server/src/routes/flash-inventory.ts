import { Router, Request, Response } from "express";
import { z } from "zod";
import {
  FlashReservationEngine,
  SalesChannel,
} from "../lib/inventory/flash-reservation-engine.js";

export const flashInventoryRouter = Router();

const reserveSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  channel: z.enum(["daraz", "woocommerce", "shopify", "facebook_live", "whatsapp"]),
  orderRef: z.string().min(1, "Order reference is required"),
  customerPhone: z.string().optional(),
  ttlSeconds: z.number().int().positive().optional(),
});

const commitSchema = z.object({
  reservationId: z.string().min(1, "reservationId is required"),
});

const releaseSchema = z.object({
  reservationId: z.string().min(1, "reservationId is required"),
  reason: z.string().optional(),
});

const panicFreezeSchema = z.object({
  isFrozen: z.boolean(),
  sku: z.string().optional(),
});

const syncChannelsSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
});

/**
 * POST /api/v1/inventory/reserve
 * Atomically reserve inventory units with 15-minute lease lock
 */
flashInventoryRouter.post(
  ["/api/v1/inventory/reserve", "/v1/inventory/reserve"],
  (req: Request, res: Response) => {
    try {
      const parse = reserveSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({
          success: false,
          error: parse.error.errors.map((e) => e.message).join(", "),
        });
      }

      const result = FlashReservationEngine.reserveStock({
        sku: parse.data.sku,
        quantity: parse.data.quantity,
        channel: parse.data.channel as SalesChannel,
        orderRef: parse.data.orderRef,
        customerPhone: parse.data.customerPhone,
        ttlSeconds: parse.data.ttlSeconds,
      });

      return res.status(201).json(result);
    } catch (error: any) {
      const isOos = error?.message?.includes("OUT_OF_STOCK");
      const isFrozen = error?.message?.includes("RESERVATION_BLOCKED");
      return res.status(isOos ? 409 : isFrozen ? 423 : 400).json({
        success: false,
        error: error?.message || "Failed to reserve stock",
      });
    }
  }
);

/**
 * POST /api/v1/inventory/commit
 * Permanently commit reserved stock on order payment/COD confirmation
 */
flashInventoryRouter.post(
  ["/api/v1/inventory/commit", "/v1/inventory/commit"],
  (req: Request, res: Response) => {
    try {
      const parse = commitSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({
          success: false,
          error: parse.error.errors.map((e) => e.message).join(", "),
        });
      }

      const result = FlashReservationEngine.commitReservation(parse.data.reservationId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error?.message || "Failed to commit reservation",
      });
    }
  }
);

/**
 * POST /api/v1/inventory/release
 * Release reserved stock on customer cancellation or cart timeout
 */
flashInventoryRouter.post(
  ["/api/v1/inventory/release", "/v1/inventory/release"],
  (req: Request, res: Response) => {
    try {
      const parse = releaseSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({
          success: false,
          error: parse.error.errors.map((e) => e.message).join(", "),
        });
      }

      const result = FlashReservationEngine.releaseReservation(
        parse.data.reservationId,
        parse.data.reason
      );
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error?.message || "Failed to release reservation",
      });
    }
  }
);

/**
 * GET /api/v1/inventory/reservations
 * List active leased stock reservations
 */
flashInventoryRouter.get(
  ["/api/v1/inventory/reservations", "/v1/inventory/reservations"],
  (req: Request, res: Response) => {
    try {
      const sku = typeof req.query.sku === "string" ? req.query.sku : undefined;
      const status = typeof req.query.status === "string" ? (req.query.status as any) : undefined;
      const reservations = FlashReservationEngine.listReservations({ sku, status });

      return res.status(200).json({
        success: true,
        count: reservations.length,
        reservations,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error?.message || "Failed to list reservations",
      });
    }
  }
);

/**
 * GET /api/v1/inventory/snapshot/:sku
 * Real-time stock snapshot with reservation and channel breakdown
 */
flashInventoryRouter.get(
  ["/api/v1/inventory/snapshot/:sku", "/v1/inventory/snapshot/:sku"],
  (req: Request, res: Response) => {
    try {
      const sku = Array.isArray(req.params.sku) ? req.params.sku[0] : String(req.params.sku || "");
      if (!sku) {
        return res.status(400).json({ success: false, error: "SKU parameter is required" });
      }

      const snapshot = FlashReservationEngine.getStockSnapshot(sku);
      return res.status(200).json({
        success: true,
        snapshot,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        error: error?.message || "Failed to fetch stock snapshot",
      });
    }
  }
);

/**
 * POST /api/v1/inventory/sync-channels
 * Broadcast real-time stock balances across all sales channels
 */
flashInventoryRouter.post(
  ["/api/v1/inventory/sync-channels", "/v1/inventory/sync-channels"],
  (req: Request, res: Response) => {
    try {
      const parse = syncChannelsSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({
          success: false,
          error: parse.error.errors.map((e) => e.message).join(", "),
        });
      }

      const syncResult = FlashReservationEngine.syncChannels(parse.data.sku);
      return res.status(200).json({
        success: true,
        ...syncResult,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error?.message || "Failed to sync channels",
      });
    }
  }
);

/**
 * POST /api/v1/inventory/panic-freeze
 * Emergency panic lock switch to stop overselling immediately
 */
flashInventoryRouter.post(
  ["/api/v1/inventory/panic-freeze", "/v1/inventory/panic-freeze"],
  (req: Request, res: Response) => {
    try {
      const parse = panicFreezeSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({
          success: false,
          error: parse.error.errors.map((e) => e.message).join(", "),
        });
      }

      const status = FlashReservationEngine.setPanicFreeze(parse.data);
      return res.status(200).json({
        success: true,
        message: parse.data.isFrozen
          ? "🚨 Emergency Panic Freeze ACTIVE. All new reservations blocked."
          : "Panic Freeze DEACTIVATED. Normal reservation flow restored.",
        ...status,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error?.message || "Failed to update panic freeze state",
      });
    }
  }
);

/**
 * GET /api/v1/inventory/items
 * List all items in the flash inventory catalog
 */
flashInventoryRouter.get(
  ["/api/v1/inventory/items", "/v1/inventory/items"],
  (_req: Request, res: Response) => {
    try {
      const items = FlashReservationEngine.listItems();
      return res.status(200).json({
        success: true,
        count: items.length,
        items,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error?.message || "Failed to list inventory items",
      });
    }
  }
);
