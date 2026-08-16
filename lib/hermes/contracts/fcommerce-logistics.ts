import { z } from "zod";

/**
 * Supported South Asian courier services
 */
export const CourierProviderSchema = z.enum(["steadfast", "pathao", "redx", "paperfly"]);
export type CourierProvider = z.infer<typeof CourierProviderSchema>;

/**
 * F-Commerce social media parsed order schema
 */
export const SocialOrderIntakeSchema = z.object({
  source: z.enum(["facebook_dm", "facebook_comment", "whatsapp_dm", "instagram_dm", "manual"]),
  customerName: z.string().min(2),
  customerPhone: z.string().regex(/^(\+88)?01[3-9]\d{8}$/, "Valid Bangladesh phone number required"),
  deliveryAddress: z.string().min(5),
  city: z.string().default("Dhaka"),
  zone: z.string().optional(),
  items: z.array(
    z.object({
      sku: z.string(),
      title: z.string(),
      quantity: z.number().int().positive(),
      unitPriceBdt: z.number().positive(),
    })
  ).min(1),
  codAmountBdt: z.number().nonnegative(),
  specialNotes: z.string().optional(),
});
export type SocialOrderIntake = z.infer<typeof SocialOrderIntakeSchema>;

/**
 * Steadfast & Pathao parcel booking request
 */
export const ParcelBookingRequestSchema = z.object({
  provider: CourierProviderSchema.default("steadfast"),
  order: SocialOrderIntakeSchema,
  merchantStoreId: z.string().optional(),
  autoSendWhatsAppConfirmation: z.boolean().default(true),
});
export type ParcelBookingRequest = z.infer<typeof ParcelBookingRequestSchema>;

/**
 * Parcel booking response with tracking ID and delivery link
 */
export const ParcelBookingResponseSchema = z.object({
  success: z.boolean(),
  provider: CourierProviderSchema,
  consignmentId: z.string(),
  trackingCode: z.string(),
  trackingUrl: z.string().url(),
  estimatedDeliveryDays: z.number(),
  deliveryFeeBdt: z.number(),
  codFeeBdt: z.number(),
  whatsappNotificationStatus: z.enum(["sent", "queued", "disabled", "failed"]),
  createdAt: z.string(),
});
export type ParcelBookingResponse = z.infer<typeof ParcelBookingResponseSchema>;
