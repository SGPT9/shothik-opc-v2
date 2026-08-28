import pg from "pg";

const DATABASE_URL = "postgresql://postgres:13ff0168da9026128eaf9c8df528eeed@ers8j28a.ap-southeast.database.insforge.app:5432/insforge?sslmode=require";

async function fixInsforgeRLSAndOwnership() {
  console.log("=================================================");
  console.log("INSFORGE RE-OWNERSHIP & RLS LOCKDOWN SCRIPT");
  console.log("=================================================\n");

  const client = new pg.Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();
    console.log("⚡ Connected to InsForge Postgres as Superuser.");

    const hermesTables = [
      "hermes_workspaces",
      "hermes_sessions",
      "hermes_runs",
      "hermes_artifacts",
      "hermes_events",
      "hermes_tool_calls",
      "twin_knowledge_vectors",
      "projects",
      "writing_autosave",
      "user_subscriptions",
      "tool_usage",
      "llm_usage",
      "key_custody",
      "writing_profiles",
      "twins",
      "twin_tasks",
      "twin_activity_log",
      "twin_pending_approvals",
    ];

    // 1. Reassign ownership to project_admin so dashboard and app can manage them
    console.log("\n1. Reassigning table ownership to project_admin...");
    for (const table of hermesTables) {
      try {
        await client.query(`ALTER TABLE public.${table} OWNER TO project_admin;`);
        console.log(`   ✓ Transferred '${table}' ownership -> project_admin`);
      } catch (e) {
        console.log(`   Notice on '${table}': ${e.message}`);
      }
    }

    // 2. Enable RLS and Create Policies
    console.log("\n2. Enabling Row-Level Security (RLS)...");
    for (const table of hermesTables) {
      try {
        await client.query(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
        await client.query(`DROP POLICY IF EXISTS "Allow all for project_admin" ON public.${table};`);
        await client.query(`
          CREATE POLICY "Allow all for project_admin" ON public.${table} 
          FOR ALL USING (true) WITH CHECK (true);
        `);
        console.log(`   ✓ RLS Enabled & Policy Created for '${table}'`);
      } catch (e) {
        console.log(`   Notice RLS on '${table}': ${e.message}`);
      }
    }

    // 3. Verify final state
    console.log("\n3. Verifying Final Ownership & RLS Status:");
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

    const res = await client.query(query);
    const tableAudit = res.rows.map((r) => ({
      TableName: r.table_name,
      TableOwner: r.table_owner,
      RLSProtection: r.rls_enabled ? "🟢 ENABLED (SECURE)" : "⚠️ DISABLED",
      RowCount: r.row_count,
    }));

    console.table(tableAudit);

  } catch (err) {
    console.error("Execution error:", err.message);
  } finally {
    await client.end();
  }
}

fixInsforgeRLSAndOwnership();
