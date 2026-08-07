import pg from "pg";

const DATABASE_URL = "postgresql://postgres:13ff0168da9026128eaf9c8df528eeed@ers8j28a.ap-southeast.database.insforge.app:5432/insforge?sslmode=require";

async function checkInsForgeFunctions() {
  console.log("=================================================");
  console.log("INSFORGE POSTGRES FUNCTIONS & SECURITY AUDIT");
  console.log("=================================================\n");

  const client = new pg.Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();

    const query = `
      SELECT 
        p.proname AS function_name,
        pg_get_function_identity_arguments(p.oid) AS argument_types,
        CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END AS security_type,
        proconfig AS config_settings
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
      ORDER BY p.proname;
    `;

    const res = await client.query(query);

    console.log(`FOUND ${res.rows.length} PUBLIC FUNCTION(S):`);
    const functionList = res.rows.map(f => ({
      FunctionName: f.function_name,
      Arguments: f.argument_types,
      SecurityType: f.security_type,
      SearchPathHardened: f.config_settings?.some(c => c.startsWith("search_path=")) ? "🟢 YES (SECURE)" : "⚠️ NOT SET"
    }));

    console.table(functionList);

  } catch (err) {
    console.error("InsForge Postgres query error:", err.message);
  } finally {
    await client.end();
  }
}

checkInsForgeFunctions();
