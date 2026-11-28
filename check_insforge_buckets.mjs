import pg from "pg";

const DATABASE_URL = process.env.INSFORGE_DATABASE_URL;
if (!DATABASE_URL) {
  console.error("INSFORGE_DATABASE_URL is not set. Export it before running this script.");
  process.exit(1);
}

async function checkInsForgeBuckets() {
  console.log("=================================================");
  console.log("INSFORGE STORAGE BUCKETS & OBJECTS AUDIT");
  console.log("=================================================\n");

  const client = new pg.Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();

    // Query storage schema buckets if present, or information schema
    const bucketQuery = `
      SELECT 
        name AS bucket_name,
        public AS is_public,
        created_at
      FROM storage.buckets
      ORDER BY created_at DESC;
    `;

    try {
      const res = await client.query(bucketQuery);
      console.log(`FOUND ${res.rows.length} STORAGE BUCKET(S):`);
      console.table(res.rows);
    } catch (e) {
      console.log("Notice on storage.buckets query:", e.message);

      // Fallback: check tables in storage schema
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'storage';
      `;
      const tablesRes = await client.query(tablesQuery);
      console.log("Storage Schema Tables:", tablesRes.rows.map(r => r.table_name));
    }

  } catch (err) {
    console.error("InsForge Postgres query error:", err.message);
  } finally {
    await client.end();
  }
}

checkInsForgeBuckets();
