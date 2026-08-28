import { db, pool, projectsTable, writingAutosaveTable, userSubscriptionsTable, toolUsageTable, llmUsageTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function testDatabaseAndSchemas() {
  console.log("🔍 Testing PostgreSQL Database Connection & Tables...");

  try {
    // 1. Test basic connectivity
    const client = await pool.connect();
    console.log("✅ Successfully connected to PostgreSQL database pool.");
    client.release();

    // 2. Test Projects Table Insertion & Query
    console.log("\n🧪 1. Testing Projects table...");
    const testUserId = `test_user_${Date.now()}`;
    const [project] = await db
      .insert(projectsTable)
      .values({
        userId: testUserId,
        title: "Amar Ekushey Research Project",
        type: "research",
        description: "Test research paper on Bangla NLP",
        content: "Initial draft text content...",
        sections: [
          { id: "intro", title: "Introduction", wordCount: 150 },
          { id: "methodology", title: "Methodology", wordCount: 300 },
        ],
        settings: { fontSize: "16px", theme: "dark" },
        wordCount: 450,
        progress: 25,
      })
      .returning();

    console.log(`✅ Created project: ${project.title} (ID: ${project.id})`);

    const queriedProjects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.userId, testUserId));
    console.log(`✅ Queried ${queriedProjects.length} project(s) for user.`);

    // 3. Test Writing Autosave Upsert
    console.log("\n🧪 2. Testing Writing Autosave table (Upsert)...");
    const [saved1] = await db
      .insert(writingAutosaveTable)
      .values({
        userId: testUserId,
        localProjectId: project.id,
        content: "Chapter 1: The beginning of neural language models...",
        wordCount: 8,
      })
      .returning();
    console.log(`✅ Autosave snapshot inserted (ID: ${saved1.id}, words: ${saved1.wordCount})`);

    const [saved2] = await db
      .insert(writingAutosaveTable)
      .values({
        userId: testUserId,
        localProjectId: project.id,
        content: "Chapter 1: The beginning of neural language models for Bengali text.",
        wordCount: 11,
      })
      .onConflictDoUpdate({
        target: [writingAutosaveTable.userId, writingAutosaveTable.localProjectId],
        set: {
          content: "Chapter 1: The beginning of neural language models for Bengali text.",
          wordCount: 11,
          savedAt: new Date(),
        },
      })
      .returning();
    console.log(`✅ Autosave snapshot upserted on conflict (ID: ${saved2.id}, words: ${saved2.wordCount})`);

    // 4. Test Subscriptions & Quotas
    console.log("\n🧪 3. Testing Subscriptions & Tool Usage Limits...");
    const [subscription] = await db
      .insert(userSubscriptionsTable)
      .values({
        userId: testUserId,
        tier: "pro",
        status: "active",
        interval: "month",
      })
      .returning();
    console.log(`✅ User subscription created: Tier ${subscription.tier}`);

    const [usage1] = await db
      .insert(toolUsageTable)
      .values({
        userId: testUserId,
        tool: "paraphrase",
        count: 1,
      })
      .returning();
    console.log(`✅ Tool usage recorded for 'paraphrase' (count: ${usage1.count})`);

    // 5. Test LLM Token Tracking
    console.log("\n🧪 4. Testing LLM Usage Token & Cost tracking...");
    const [llmRecord] = await db
      .insert(llmUsageTable)
      .values({
        userId: testUserId,
        tool: "ai-detector",
        provider: "kimi",
        tokens: 1540,
        inputTokens: 1200,
        outputTokens: 340,
        costUsd: "0.003080",
      })
      .returning();
    console.log(`✅ LLM usage tracked (tokens: ${llmRecord.tokens}, cost: $${llmRecord.costUsd})`);

    // 6. Cleanup test records
    console.log("\n🧹 Cleaning up test records...");
    await db.delete(writingAutosaveTable).where(eq(writingAutosaveTable.userId, testUserId));
    await db.delete(projectsTable).where(eq(projectsTable.userId, testUserId));
    await db.delete(userSubscriptionsTable).where(eq(userSubscriptionsTable.userId, testUserId));
    await db.delete(toolUsageTable).where(eq(toolUsageTable.userId, testUserId));
    await db.delete(llmUsageTable).where(eq(llmUsageTable.userId, testUserId));
    console.log("✅ Test records cleaned up successfully.");

    console.log("\n🎉 ALL DATABASE AND SCHEMA INTEGRATION TESTS PASSED!");
  } catch (err: any) {
    console.error("❌ Database test failed:", err);
  } finally {
    await pool.end();
  }
}

testDatabaseAndSchemas();
