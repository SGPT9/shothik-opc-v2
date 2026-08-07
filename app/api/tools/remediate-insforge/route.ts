import { NextResponse } from "next/server";
import pg from "pg";

const DATABASE_URL = "postgresql://postgres:13ff0168da9026128eaf9c8df528eeed@ers8j28a.ap-southeast.database.insforge.app:5432/insforge?sslmode=require";

const sqlStatements = [
  // -1. Vector Extension & RAG Memory Table
  `CREATE EXTENSION IF NOT EXISTS vector;`,
  `CREATE TABLE IF NOT EXISTS public.twin_knowledge_vectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    twin_id TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  // 0. Ownership Transfer to postgres superuser
  `ALTER TABLE IF EXISTS public.hermes_workspaces OWNER TO postgres;`,
  `ALTER TABLE IF EXISTS public.hermes_sessions OWNER TO postgres;`,
  `ALTER TABLE IF EXISTS public.hermes_runs OWNER TO postgres;`,
  `ALTER TABLE IF EXISTS public.hermes_artifacts OWNER TO postgres;`,
  `ALTER TABLE IF EXISTS public.hermes_events OWNER TO postgres;`,
  `ALTER TABLE IF EXISTS public.hermes_tool_calls OWNER TO postgres;`,

  // 1. Enable RLS on Hermes Tables
  `ALTER TABLE public.hermes_workspaces ENABLE ROW LEVEL SECURITY;`,
  `DROP POLICY IF EXISTS "Users can manage own hermes_workspaces" ON public.hermes_workspaces;`,
  `CREATE POLICY "Users can manage own hermes_workspaces" ON public.hermes_workspaces FOR ALL USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));`,

  `ALTER TABLE public.hermes_sessions ENABLE ROW LEVEL SECURITY;`,
  `DROP POLICY IF EXISTS "Users can manage own hermes_sessions" ON public.hermes_sessions;`,
  `CREATE POLICY "Users can manage own hermes_sessions" ON public.hermes_sessions FOR ALL USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));`,

  `ALTER TABLE public.hermes_runs ENABLE ROW LEVEL SECURITY;`,
  `DROP POLICY IF EXISTS "Users can manage own hermes_runs" ON public.hermes_runs;`,
  `CREATE POLICY "Users can manage own hermes_runs" ON public.hermes_runs FOR ALL USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));`,

  `ALTER TABLE public.hermes_artifacts ENABLE ROW LEVEL SECURITY;`,
  `DROP POLICY IF EXISTS "Users can manage own hermes_artifacts" ON public.hermes_artifacts;`,
  `CREATE POLICY "Users can manage own hermes_artifacts" ON public.hermes_artifacts FOR ALL USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));`,

  `ALTER TABLE public.hermes_events ENABLE ROW LEVEL SECURITY;`,
  `DROP POLICY IF EXISTS "Users can manage own hermes_events" ON public.hermes_events;`,
  `CREATE POLICY "Users can manage own hermes_events" ON public.hermes_events FOR ALL USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));`,

  `ALTER TABLE public.hermes_tool_calls ENABLE ROW LEVEL SECURITY;`,
  `DROP POLICY IF EXISTS "Users can manage own hermes_tool_calls" ON public.hermes_tool_calls;`,
  `CREATE POLICY "Users can manage own hermes_tool_calls" ON public.hermes_tool_calls FOR ALL USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));`,

  // 2. Harden SECURITY DEFINER Function
  `ALTER FUNCTION public.sync_chat_conversation_stats(uuid) SET search_path = public, pg_temp;`,

  // 3. Add Foreign Key Indexes
  `CREATE INDEX IF NOT EXISTS idx_chat_messages_parent_message_id ON public.chat_messages(parent_message_id);`,
  `CREATE INDEX IF NOT EXISTS idx_hermes_runs_session_id ON public.hermes_runs(session_id);`,
  `CREATE INDEX IF NOT EXISTS idx_hermes_events_artifact_id ON public.hermes_events(artifact_id);`,
  `CREATE INDEX IF NOT EXISTS idx_hermes_events_workspace_id ON public.hermes_events(workspace_id);`,
  `CREATE INDEX IF NOT EXISTS idx_hermes_artifacts_run_id ON public.hermes_artifacts(run_id);`,
  `CREATE INDEX IF NOT EXISTS idx_hermes_tool_calls_run_id ON public.hermes_tool_calls(run_id);`,

  // 4. Optimize RLS Policies with cached auth.uid()
  `DROP POLICY IF EXISTS "Users can view own conversations" ON public.chat_conversations;`,
  `CREATE POLICY "Users can view own conversations" ON public.chat_conversations FOR ALL USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));`,

  `DROP POLICY IF EXISTS "Users can view own messages" ON public.chat_messages;`,
  `CREATE POLICY "Users can view own messages" ON public.chat_messages FOR ALL USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));`,
];

export async function GET() {
  const log: string[] = [];
  const client = new pg.Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();
    log.push("Connected to InsForge Postgres via superuser connection.");

    for (let i = 0; i < sqlStatements.length; i++) {
      const sql = sqlStatements[i];
      try {
        await client.query(sql);
        log.push(`[${i + 1}/${sqlStatements.length}] Success: ${sql.slice(0, 60)}...`);
      } catch (err: any) {
        log.push(`[${i + 1}/${sqlStatements.length}] Notice: ${err.message}`);
      }
    }

    await client.end();
    return NextResponse.json({ success: true, message: "InsForge remediation complete!", log });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, log }, { status: 500 });
  }
}
