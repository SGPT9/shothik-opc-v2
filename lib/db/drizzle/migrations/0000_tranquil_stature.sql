CREATE TABLE "commodity_inland_lcs" (
	"id" serial PRIMARY KEY NOT NULL,
	"lc_number" text NOT NULL,
	"commodity_name" text NOT NULL,
	"buyer_name" text NOT NULL,
	"seller_name" text NOT NULL,
	"quantity_tons" numeric(10, 2) NOT NULL,
	"unit_price_per_ton_bdt" numeric(12, 2) NOT NULL,
	"total_value_bdt" numeric(14, 2) NOT NULL,
	"escrow_status" text DEFAULT 'opened' NOT NULL,
	"lc_contract_seal_sha256" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "commodity_inland_lcs_lc_number_unique" UNIQUE("lc_number")
);
--> statement-breakpoint
CREATE TABLE "courier_consignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"consignment_id" text NOT NULL,
	"order_id" text NOT NULL,
	"courier_provider" text NOT NULL,
	"tracking_code" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"delivery_address" text NOT NULL,
	"zone" text NOT NULL,
	"cod_amount_bdt" numeric(12, 2) NOT NULL,
	"delivery_charge_bdt" numeric(12, 2) NOT NULL,
	"status" text DEFAULT 'booked_ready_for_pickup' NOT NULL,
	"verification_hash_sha256" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "courier_consignments_consignment_id_unique" UNIQUE("consignment_id")
);
--> statement-breakpoint
CREATE TABLE "creator_guilds" (
	"id" serial PRIMARY KEY NOT NULL,
	"guild_id" text NOT NULL,
	"guild_name" text NOT NULL,
	"vertical" text NOT NULL,
	"regional_hub" text NOT NULL,
	"member_count" integer DEFAULT 1 NOT NULL,
	"collective_pool_value_bdt" numeric(14, 2) DEFAULT '0.00' NOT NULL,
	"escrow_badge" text DEFAULT 'VERIFIED_ESCROW_TIER_1' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_guilds_guild_id_unique" UNIQUE("guild_id")
);
--> statement-breakpoint
CREATE TABLE "factoring_offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"offer_id" text NOT NULL,
	"invoice_id" text NOT NULL,
	"buyer_id" text NOT NULL,
	"buyer_name" text NOT NULL,
	"invoice_face_value_bdt" numeric(12, 2) NOT NULL,
	"advance_rate_percent" integer NOT NULL,
	"gross_advance_bdt" numeric(12, 2) NOT NULL,
	"discount_fee_bdt" numeric(12, 2) NOT NULL,
	"net_payout_bdt" numeric(12, 2) NOT NULL,
	"annualized_apr" numeric(5, 2) NOT NULL,
	"disbursement_channel" text NOT NULL,
	"status" text DEFAULT 'offered' NOT NULL,
	"verification_seal_sha256" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "factoring_offers_offer_id_unique" UNIQUE("offer_id")
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"sku" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"total_stock" integer DEFAULT 0 NOT NULL,
	"daraz_stock" integer DEFAULT 0 NOT NULL,
	"shopify_stock" integer DEFAULT 0 NOT NULL,
	"woocommerce_stock" integer DEFAULT 0 NOT NULL,
	"whatsapp_stock" integer DEFAULT 0 NOT NULL,
	"dark_hub_reserve" integer DEFAULT 0 NOT NULL,
	"unit_cost_bdt" numeric(12, 2) NOT NULL,
	"unit_price_bdt" numeric(12, 2) NOT NULL,
	"supplier_name" text NOT NULL,
	"lead_time_days" integer DEFAULT 7 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_items_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "ivr_call_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"call_id" text NOT NULL,
	"order_id" text NOT NULL,
	"customer_phone" text NOT NULL,
	"customer_name" text NOT NULL,
	"cod_amount_bdt" numeric(12, 2) NOT NULL,
	"rto_risk_score" integer DEFAULT 0 NOT NULL,
	"risk_tier" text DEFAULT 'LOW' NOT NULL,
	"call_status" text DEFAULT 'scheduled' NOT NULL,
	"dtmf_response" text,
	"recording_duration_sec" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ivr_call_records_call_id_unique" UNIQUE("call_id")
);
--> statement-breakpoint
CREATE TABLE "mushak_63_challans" (
	"id" serial PRIMARY KEY NOT NULL,
	"challan_number" text NOT NULL,
	"seller_bin" text NOT NULL,
	"buyer_bin" text,
	"buyer_name" text NOT NULL,
	"total_taxable_amount_bdt" numeric(14, 2) NOT NULL,
	"total_vat_bdt" numeric(14, 2) NOT NULL,
	"total_payable_bdt" numeric(14, 2) NOT NULL,
	"verification_seal_sha256" text NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mushak_63_challans_challan_number_unique" UNIQUE("challan_number")
);
--> statement-breakpoint
CREATE TABLE "plagiarism_scans" (
	"id" serial PRIMARY KEY NOT NULL,
	"scan_id" text NOT NULL,
	"document_title" text NOT NULL,
	"author_name" text NOT NULL,
	"total_words" integer NOT NULL,
	"similarity_score_percent" numeric(5, 2) NOT NULL,
	"ugc_compliant" text DEFAULT 'true' NOT NULL,
	"audit_seal_sha256" text NOT NULL,
	"scanned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plagiarism_scans_scan_id_unique" UNIQUE("scan_id")
);
--> statement-breakpoint
CREATE TABLE "protected_action_audit" (
	"id" serial PRIMARY KEY NOT NULL,
	"action_id" text NOT NULL,
	"action_type" text NOT NULL,
	"actor_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"otp_verified" text DEFAULT 'false' NOT NULL,
	"approver_mfs_phone" text,
	"state_seal_sha256" text NOT NULL,
	"executed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "protected_action_audit_action_id_unique" UNIQUE("action_id")
);
--> statement-breakpoint
CREATE TABLE "twin_seeds" (
	"id" serial PRIMARY KEY NOT NULL,
	"identity" text NOT NULL,
	"conversation_id" text NOT NULL,
	"company_name" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"business_plan" text DEFAULT '' NOT NULL,
	"tasks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"revision" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"type" text DEFAULT 'book' NOT NULL,
	"template" text,
	"description" text DEFAULT '' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"sections" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"word_count" integer DEFAULT 0 NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"starred" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "writing_autosave" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"local_project_id" text NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"word_count" integer DEFAULT 0 NOT NULL,
	"saved_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "llm_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"tool" text NOT NULL,
	"provider" text NOT NULL,
	"tokens" integer DEFAULT 0 NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"cost_usd" numeric(10, 6) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tool_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"tool" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"period_start" timestamp DEFAULT now() NOT NULL,
	"period_end" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"tier" text DEFAULT 'free' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"interval" text DEFAULT 'month' NOT NULL,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"stripe_subscription_id" text,
	"stripe_customer_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_subscriptions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "second_me_key_custody" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"purpose" text NOT NULL,
	"provider" text,
	"sealed_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "second_me_writing_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"letta_agent_id" text NOT NULL,
	"block_label" text DEFAULT 'WRITING.md' NOT NULL,
	"model_handle" text,
	"last_content_length" integer DEFAULT 0 NOT NULL,
	"last_synced_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "second_me_writing_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text DEFAULT 'usr_default' NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"industry" text DEFAULT 'Technology' NOT NULL,
	"business_model" text DEFAULT 'SaaS' NOT NULL,
	"business_type" text DEFAULT 'Digital Venture',
	"problem_statement" text DEFAULT '',
	"domain" text NOT NULL,
	"email" text NOT NULL,
	"revenue_bdt" integer DEFAULT 0 NOT NULL,
	"visitor_count" integer DEFAULT 1 NOT NULL,
	"is_paused" boolean DEFAULT false NOT NULL,
	"tasks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"docs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"feed" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "twin_activity_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"twin_id" text NOT NULL,
	"master_id" text,
	"action" text NOT NULL,
	"target_resource" text DEFAULT '' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "twin_pending_approvals" (
	"id" serial PRIMARY KEY NOT NULL,
	"twin_id" text NOT NULL,
	"master_id" text NOT NULL,
	"action" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "twin_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"twin_id" text NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"task_type" text DEFAULT 'general' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"result" text DEFAULT '' NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "twins" (
	"id" serial PRIMARY KEY NOT NULL,
	"master_id" text,
	"name" text NOT NULL,
	"specialization" text DEFAULT 'General' NOT NULL,
	"persona" text DEFAULT '' NOT NULL,
	"expertise_areas" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"communication_style" text DEFAULT 'professional' NOT NULL,
	"goals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"languages" jsonb DEFAULT '["bn","en"]'::jsonb NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"source_platform" text DEFAULT 'shothik' NOT NULL,
	"training_status" text DEFAULT 'ready' NOT NULL,
	"knowledge_score" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"task_count" integer DEFAULT 0 NOT NULL,
	"lifecycle_state" text DEFAULT 'active' NOT NULL,
	"verification_badge" boolean DEFAULT false NOT NULL,
	"trust_score" integer DEFAULT 100 NOT NULL,
	"published_count" integer DEFAULT 0 NOT NULL,
	"followers_count" integer DEFAULT 0 NOT NULL,
	"allowed_skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"blocked_skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"approval_required_actions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"api_key_hash" text,
	"api_key_prefix" text,
	"registration_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nilkhet_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"invoice_number" text NOT NULL,
	"book_title" text NOT NULL,
	"page_count" integer NOT NULL,
	"copy_count" integer NOT NULL,
	"paper_type" text NOT NULL,
	"binding_type" text NOT NULL,
	"total_price_bdt" text NOT NULL,
	"status" text DEFAULT 'PROCESSING_PRINT' NOT NULL,
	"courier_provider" text DEFAULT 'steadfast',
	"tracking_code" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "background_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_type" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"last_error" text,
	"idempotency_key" text,
	"locked_at" timestamp,
	"locked_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "background_jobs_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "idempotency_keys" (
	"key" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"request_hash" text NOT NULL,
	"response_status" integer,
	"response_body" jsonb,
	"state" text DEFAULT 'processing' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parcels" (
	"id" serial PRIMARY KEY NOT NULL,
	"consignment_id" text NOT NULL,
	"tracking_code" text NOT NULL,
	"provider" text DEFAULT 'steadfast' NOT NULL,
	"user_id" text DEFAULT 'usr_default' NOT NULL,
	"recipient_name" text NOT NULL,
	"recipient_phone" text NOT NULL,
	"city" text NOT NULL,
	"address" text NOT NULL,
	"cod_amount_bdt" integer DEFAULT 0 NOT NULL,
	"delivery_fee_bdt" integer DEFAULT 60 NOT NULL,
	"status" text DEFAULT 'BOOKED' NOT NULL,
	"status_bangla" text DEFAULT 'বুকিং সম্পন্ন হয়েছে' NOT NULL,
	"timeline" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"whatsapp_notification_sent" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "parcels_consignment_id_unique" UNIQUE("consignment_id"),
	CONSTRAINT "parcels_tracking_code_unique" UNIQUE("tracking_code")
);
--> statement-breakpoint
CREATE TABLE "audit_journal_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_id" text NOT NULL,
	"transaction_ref" text NOT NULL,
	"transaction_type" text NOT NULL,
	"memo" text NOT NULL,
	"lines" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"total_debit_bdt" numeric(14, 2) NOT NULL,
	"total_credit_bdt" numeric(14, 2) NOT NULL,
	"is_balanced" boolean DEFAULT true NOT NULL,
	"audit_hash" text NOT NULL,
	"initiator_kind" text,
	"initiator_id" text,
	"posted_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "audit_journal_entries_entry_id_unique" UNIQUE("entry_id")
);
--> statement-breakpoint
CREATE TABLE "mfs_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"trx_id" text NOT NULL,
	"user_id" text DEFAULT 'usr_default' NOT NULL,
	"provider" text NOT NULL,
	"amount_bdt" numeric(12, 2) NOT NULL,
	"tier" text,
	"status" text DEFAULT 'RECONCILED' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"reconciled_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mfs_transactions_trx_id_unique" UNIQUE("trx_id")
);
--> statement-breakpoint
CREATE TABLE "saga_executions" (
	"id" serial PRIMARY KEY NOT NULL,
	"saga_id" text NOT NULL,
	"saga_name" text NOT NULL,
	"correlation_id" text NOT NULL,
	"idempotency_key" text,
	"status" text NOT NULL,
	"context" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"current_step_index" integer DEFAULT 0 NOT NULL,
	"steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"error" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "saga_executions_saga_id_unique" UNIQUE("saga_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "twin_seeds_identity_conversation_idx" ON "twin_seeds" USING btree ("identity","conversation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "writing_autosave_user_project_idx" ON "writing_autosave" USING btree ("user_id","local_project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tool_usage_user_tool_idx" ON "tool_usage" USING btree ("user_id","tool");--> statement-breakpoint
CREATE UNIQUE INDEX "key_custody_user_purpose_idx" ON "second_me_key_custody" USING btree ("user_id","purpose");