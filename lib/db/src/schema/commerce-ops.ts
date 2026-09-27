import { pgTable, text, serial, integer, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";

export const inventoryItemsTable = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  totalStock: integer("total_stock").notNull().default(0),
  darazStock: integer("daraz_stock").notNull().default(0),
  shopifyStock: integer("shopify_stock").notNull().default(0),
  woocommerceStock: integer("woocommerce_stock").notNull().default(0),
  whatsappStock: integer("whatsapp_stock").notNull().default(0),
  darkHubReserve: integer("dark_hub_reserve").notNull().default(0),
  unitCostBDT: numeric("unit_cost_bdt", { precision: 12, scale: 2 }).notNull(),
  unitPriceBDT: numeric("unit_price_bdt", { precision: 12, scale: 2 }).notNull(),
  supplierName: text("supplier_name").notNull(),
  leadTimeDays: integer("lead_time_days").notNull().default(7),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const factoringOffersTable = pgTable("factoring_offers", {
  id: serial("id").primaryKey(),
  offerId: text("offer_id").notNull().unique(),
  invoiceId: text("invoice_id").notNull(),
  buyerId: text("buyer_id").notNull(),
  buyerName: text("buyer_name").notNull(),
  invoiceFaceValueBDT: numeric("invoice_face_value_bdt", { precision: 12, scale: 2 }).notNull(),
  advanceRatePercent: integer("advance_rate_percent").notNull(),
  grossAdvanceBDT: numeric("gross_advance_bdt", { precision: 12, scale: 2 }).notNull(),
  discountFeeBDT: numeric("discount_fee_bdt", { precision: 12, scale: 2 }).notNull(),
  netPayoutBDT: numeric("net_payout_bdt", { precision: 12, scale: 2 }).notNull(),
  annualizedApr: numeric("annualized_apr", { precision: 5, scale: 2 }).notNull(),
  disbursementChannel: text("disbursement_channel").notNull(),
  status: text("status").notNull().default("offered"), // offered, disbursed, settled
  verificationSealSha256: text("verification_seal_sha256").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ivrCallRecordsTable = pgTable("ivr_call_records", {
  id: serial("id").primaryKey(),
  callId: text("call_id").notNull().unique(),
  orderId: text("order_id").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerName: text("customer_name").notNull(),
  codAmountBDT: numeric("cod_amount_bdt", { precision: 12, scale: 2 }).notNull(),
  rtoRiskScore: integer("rto_risk_score").notNull().default(0),
  riskTier: text("risk_tier").notNull().default("LOW"),
  callStatus: text("call_status").notNull().default("scheduled"), // scheduled, completed, failed, cancelled
  dtmfResponse: text("dtmf_response"),
  recordingDurationSec: integer("recording_duration_sec").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const courierConsignmentsTable = pgTable("courier_consignments", {
  id: serial("id").primaryKey(),
  consignmentId: text("consignment_id").notNull().unique(),
  orderId: text("order_id").notNull(),
  courierProvider: text("courier_provider").notNull(), // steadfast, pathao, redx, paperfly
  trackingCode: text("tracking_code").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  zone: text("zone").notNull(),
  codAmountBDT: numeric("cod_amount_bdt", { precision: 12, scale: 2 }).notNull(),
  deliveryChargeBDT: numeric("delivery_charge_bdt", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("booked_ready_for_pickup"),
  verificationHashSha256: text("verification_hash_sha256").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const protectedActionAuditTable = pgTable("protected_action_audit", {
  id: serial("id").primaryKey(),
  actionId: text("action_id").notNull().unique(),
  actionType: text("action_type").notNull(), // bkash_payout, courier_dispatch, po_wholesale, bulk_price_update
  actorId: text("actor_id").notNull(),
  payload: jsonb("payload").notNull(),
  otpVerified: text("otp_verified").notNull().default("false"),
  approverMfsPhone: text("approver_mfs_phone"),
  stateSealSha256: text("state_seal_sha256").notNull(),
  executedAt: timestamp("executed_at").defaultNow().notNull(),
});

export const mushak63ChallansTable = pgTable("mushak_63_challans", {
  id: serial("id").primaryKey(),
  challanNumber: text("challan_number").notNull().unique(),
  sellerBin: text("seller_bin").notNull(),
  buyerBin: text("buyer_bin"),
  buyerName: text("buyer_name").notNull(),
  totalTaxableAmountBDT: numeric("total_taxable_amount_bdt", { precision: 14, scale: 2 }).notNull(),
  totalVatBDT: numeric("total_vat_bdt", { precision: 14, scale: 2 }).notNull(),
  totalPayableBDT: numeric("total_payable_bdt", { precision: 14, scale: 2 }).notNull(),
  verificationSealSha256: text("verification_seal_sha256").notNull(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
});

export const commodityLCTable = pgTable("commodity_inland_lcs", {
  id: serial("id").primaryKey(),
  lcNumber: text("lc_number").notNull().unique(),
  commodityName: text("commodity_name").notNull(),
  buyerName: text("buyer_name").notNull(),
  sellerName: text("seller_name").notNull(),
  quantityTons: numeric("quantity_tons", { precision: 10, scale: 2 }).notNull(),
  unitPricePerTonBDT: numeric("unit_price_per_ton_bdt", { precision: 12, scale: 2 }).notNull(),
  totalValueBDT: numeric("total_value_bdt", { precision: 14, scale: 2 }).notNull(),
  escrowStatus: text("escrow_status").notNull().default("opened"), // opened, inspection_cleared, released, disputed
  lcContractSealSha256: text("lc_contract_seal_sha256").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const creatorGuildsTable = pgTable("creator_guilds", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id").notNull().unique(),
  guildName: text("guild_name").notNull(),
  vertical: text("vertical").notNull(),
  regionalHub: text("regional_hub").notNull(),
  memberCount: integer("member_count").notNull().default(1),
  collectivePoolValueBDT: numeric("collective_pool_value_bdt", { precision: 14, scale: 2 }).notNull().default("0.00"),
  escrowBadge: text("escrow_badge").notNull().default("VERIFIED_ESCROW_TIER_1"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const plagiarismScansTable = pgTable("plagiarism_scans", {
  id: serial("id").primaryKey(),
  scanId: text("scan_id").notNull().unique(),
  documentTitle: text("document_title").notNull(),
  authorName: text("author_name").notNull(),
  totalWords: integer("total_words").notNull(),
  similarityScorePercent: numeric("similarity_score_percent", { precision: 5, scale: 2 }).notNull(),
  ugcCompliant: text("ugc_compliant").notNull().default("true"),
  auditSealSha256: text("audit_seal_sha256").notNull(),
  scannedAt: timestamp("scanned_at").defaultNow().notNull(),
});
