import pg from "pg";
import { createClient } from "@insforge/sdk";

const DATABASE_URL = process.env.INSFORGE_DATABASE_URL;
if (!DATABASE_URL) {
  console.error("INSFORGE_DATABASE_URL is not set. Export it before running this script.");
  process.exit(1);
}
const BASE_URL = process.env.INSFORGE_BASE_URL || "";
const ANON_KEY = process.env.INSFORGE_ANON_KEY || "";

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
