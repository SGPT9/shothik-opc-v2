import pg from "pg";
import { createClient } from "@insforge/sdk";

const DATABASE_URL = "postgresql://postgres:13ff0168da9026128eaf9c8df528eeed@ers8j28a.ap-southeast.database.insforge.app:5432/insforge?sslmode=require";
const BASE_URL = "https://ers8j28a.ap-southeast.insforge.app";
const ANON_KEY = "anon_09a9f554a6d1ef3abb1eb3691c0224e22c30b4bfe25809c6222a8301bfa80f7b";

async function verifyOwnershipAndRLS() {
  console.log("=================================================");
  console.log("INSFORGE POSTGRES TABLE OWNERSHIP & RLS VERIFICATION");
  console.log("=================================================\n");

  const pgClient = new pg.Client({ connectionString: DATABASE_URL });

  try {
    await pgClient.connect();

    const query = `
      SELECT 
        c.relname AS table_name,
        pg_get_userbyid(c.relowner) AS table_owner,
        c.relrowsecurity AS rls_enabled,
        pg_stat_get_live_tuples(c.oid) AS row_count
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r'
      ORDER BY c.relname;
    `;

    const res = await pgClient.query(query);

    console.log("POSTGRES PUBLIC TABLES OWNERSHIP & RLS STATUS:");
    const tableAudit = res.rows.map((r) => ({
      TableName: r.table_name,
      TableOwner: r.table_owner,
      RLSProtection: r.rls_enabled ? "🟢 ENABLED (SECURE)" : "⚠️ DISABLED",
      RowCount: r.row_count,
    }));

    console.table(tableAudit);

  } catch (err) {
    console.error("Postgres query error:", err.message);
  } finally {
    await pgClient.end();
  }
}

verifyOwnershipAndRLS();
