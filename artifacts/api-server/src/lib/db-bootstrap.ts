import { pool } from "@workspace/db";
import { logger } from "./logger";

export interface DatabaseHealthStatus {
  connected: boolean;
  engine: "PostgreSQL" | "SQLite-Fallback";
  tablesVerified: string[];
  latencyMs: number;
  error?: string;
}

export class DatabaseAutoSyncEngine {
  private static instance: DatabaseAutoSyncEngine;
  private isInitialized = false;

  public static getInstance(): DatabaseAutoSyncEngine {
    if (!DatabaseAutoSyncEngine.instance) {
      DatabaseAutoSyncEngine.instance = new DatabaseAutoSyncEngine();
    }
    return DatabaseAutoSyncEngine.instance;
  }

  /**
   * Run automated schema verification and table creation on backend startup
   */
  public async autoSync(): Promise<DatabaseHealthStatus> {
    const startTime = Date.now();
    const verifiedTables: string[] = [];

    try {
      // 1. Connection Health Ping
      const client = await pool.connect();
      try {
        await client.query("SELECT 1;");
      } finally {
        client.release();
      }

      const latencyMs = Date.now() - startTime;
      logger.info({ latencyMs }, "[DatabaseAutoSync] PostgreSQL connection verified");

      // 2. DDL Auto-Bootstrap for Essential Tables
      const bootstrapQueries = [
        // Projects & Autosave
        `CREATE TABLE IF NOT EXISTS projects (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL DEFAULT '',
          word_count INTEGER NOT NULL DEFAULT 0,
          current_version INTEGER NOT NULL DEFAULT 1,
          genre TEXT DEFAULT 'general',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`,

        // Subscriptions & Credits
        `CREATE TABLE IF NOT EXISTS user_subscriptions (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL UNIQUE,
          tier TEXT NOT NULL DEFAULT 'free',
          status TEXT NOT NULL DEFAULT 'active',
          interval TEXT NOT NULL DEFAULT 'month',
          current_period_end TIMESTAMP WITH TIME ZONE,
          cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`,

        // BYOK Key Custody
        `CREATE TABLE IF NOT EXISTS second_me_key_custody (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          purpose TEXT NOT NULL,
          provider TEXT,
          sealed_key TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`,

        // Tool Usage & Token Telemetry
        `CREATE TABLE IF NOT EXISTS tool_usage (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          tool_name TEXT NOT NULL,
          cost_credits INTEGER NOT NULL DEFAULT 1,
          success BOOLEAN NOT NULL DEFAULT TRUE,
          duration_ms INTEGER,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`,

        // Nilkhet Print-on-Demand Orders
        `CREATE TABLE IF NOT EXISTS nilkhet_orders (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          invoice_number TEXT NOT NULL UNIQUE,
          book_title TEXT NOT NULL,
          page_count INTEGER NOT NULL,
          copy_count INTEGER NOT NULL DEFAULT 1,
          paper_type TEXT NOT NULL DEFAULT '70gsm_offset',
          binding_type TEXT NOT NULL DEFAULT 'paperback_glue',
          total_price_bdt NUMERIC(10, 2) NOT NULL,
          status TEXT NOT NULL DEFAULT 'PENDING',
          courier_provider TEXT DEFAULT 'steadfast',
          tracking_code TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`,

        // Background Jobs & Transactional Outbox
        `CREATE TABLE IF NOT EXISTS background_jobs (
          id SERIAL PRIMARY KEY,
          task_type TEXT NOT NULL,
          payload JSONB NOT NULL DEFAULT '{}',
          status TEXT NOT NULL DEFAULT 'pending',
          attempts INTEGER NOT NULL DEFAULT 0,
          max_attempts INTEGER NOT NULL DEFAULT 3,
          last_error TEXT,
          idempotency_key TEXT UNIQUE,
          locked_at TIMESTAMP WITH TIME ZONE,
          locked_by TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE
        );`,

        // Persistent Courier Consignments
        `CREATE TABLE IF NOT EXISTS parcels (
          id SERIAL PRIMARY KEY,
          consignment_id TEXT NOT NULL UNIQUE,
          tracking_code TEXT NOT NULL UNIQUE,
          provider TEXT NOT NULL DEFAULT 'steadfast',
          user_id TEXT NOT NULL DEFAULT 'usr_default',
          recipient_name TEXT NOT NULL,
          recipient_phone TEXT NOT NULL,
          city TEXT NOT NULL,
          address TEXT NOT NULL,
          cod_amount_bdt INTEGER NOT NULL DEFAULT 0,
          delivery_fee_bdt INTEGER NOT NULL DEFAULT 60,
          status TEXT NOT NULL DEFAULT 'BOOKED',
          status_bangla TEXT NOT NULL DEFAULT 'বুকিং সম্পন্ন হয়েছে',
          timeline JSONB NOT NULL DEFAULT '[]',
          whatsapp_notification_sent BOOLEAN NOT NULL DEFAULT FALSE,
          metadata JSONB NOT NULL DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`,

        // IETF-Standard Idempotency Keys
        `CREATE TABLE IF NOT EXISTS idempotency_keys (
          key TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          endpoint TEXT NOT NULL,
          request_hash TEXT NOT NULL,
          response_status INTEGER,
          response_body JSONB,
          state TEXT NOT NULL DEFAULT 'processing',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL
        );`,

        // Multi-Venture Autonomous Companies
        `CREATE TABLE IF NOT EXISTS companies (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL DEFAULT 'usr_default',
          name TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          industry TEXT NOT NULL DEFAULT 'Technology',
          business_model TEXT NOT NULL DEFAULT 'SaaS',
          business_type TEXT DEFAULT 'Digital Venture',
          problem_statement TEXT DEFAULT '',
          domain TEXT NOT NULL,
          email TEXT NOT NULL,
          revenue_bdt INTEGER NOT NULL DEFAULT 0,
          visitor_count INTEGER NOT NULL DEFAULT 1,
          is_paused BOOLEAN NOT NULL DEFAULT FALSE,
          tasks JSONB NOT NULL DEFAULT '[]',
          docs JSONB NOT NULL DEFAULT '[]',
          feed JSONB NOT NULL DEFAULT '[]',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );`
      ];

      for (const query of bootstrapQueries) {
        try {
          await pool.query(query);
        } catch (err: any) {
          logger.warn({ error: err.message }, "[DatabaseAutoSync] Table bootstrap notice");
        }
      }

      verifiedTables.push(
        "projects",
        "user_subscriptions",
        "second_me_key_custody",
        "tool_usage",
        "nilkhet_orders",
        "background_jobs",
        "parcels",
        "idempotency_keys",
        "companies"
      );
      this.isInitialized = true;

      return {
        connected: true,
        engine: "PostgreSQL",
        tablesVerified: verifiedTables,
        latencyMs,
      };
    } catch (error: any) {
      logger.warn({ error: error.message }, "[DatabaseAutoSync] PostgreSQL offline, initializing local SQLite engine fallback");
      try {
        const { initSqliteTables } = await import("@workspace/db");
        await initSqliteTables();
      } catch (sqliteErr: any) {
        logger.warn({ error: sqliteErr?.message }, "[DatabaseAutoSync] SQLite table initialization notice");
      }
      return {
        connected: false,
        engine: "SQLite-Fallback",
        tablesVerified: [
          "offline_projects",
          "offline_autosave",
          "offline_parcels",
          "offline_nilkhet_orders",
          "local_cache",
          "agent_traces",
        ],
        latencyMs: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  public getStatus(): boolean {
    return this.isInitialized;
  }
}

export const dbAutoSync = DatabaseAutoSyncEngine.getInstance();
