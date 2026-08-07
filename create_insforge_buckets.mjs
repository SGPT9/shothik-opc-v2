import pg from "pg";

const DATABASE_URL = "postgresql://postgres:13ff0168da9026128eaf9c8df528eeed@ers8j28a.ap-southeast.database.insforge.app:5432/insforge?sslmode=require";

async function provisionInsForgeBuckets() {
  console.log("=================================================");
  console.log("INSFORGE COMPLETE 5-BUCKET STORAGE PROVISIONING");
  console.log("=================================================\n");

  const client = new pg.Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();
    console.log("⚡ Connected to InsForge Postgres as Superuser.");

    // Ensure storage schema and buckets table exist
    await client.query(`CREATE SCHEMA IF NOT EXISTS storage;`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS storage.buckets (
        name TEXT PRIMARY KEY,
        public BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Complete 5 Buckets Matrix
    const bucketsToCreate = [
      { name: "book-covers", public: true },
      { name: "book-manuscripts", public: false },
      { name: "avatars", public: true },
      { name: "documents", public: false },
      { name: "artifacts", public: true },
    ];

    for (const b of bucketsToCreate) {
      await client.query(
        `INSERT INTO storage.buckets (name, public) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET public = EXCLUDED.public;`,
        [b.name, b.public]
      );
      console.log(`   ✓ Bucket '${b.name}' (Public: ${b.public}) provisioned.`);
    }

    console.log("\nALL 5 INSFORGE STORAGE BUCKETS:");
    const res = await client.query(`SELECT name, public, created_at FROM storage.buckets;`);
    console.table(res.rows);

  } catch (err) {
    console.error("Storage provisioning notice:", err.message);
  } finally {
    await client.end();
  }
}

provisionInsForgeBuckets();
