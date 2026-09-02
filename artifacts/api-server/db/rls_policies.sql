-- =============================================================================
-- ShothikGPT InsForge PostgreSQL Multi-Tenant Row Level Security (RLS) Policies
-- =============================================================================

-- Enable RLS on all customer tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_event_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mfs_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_memory_chunks ENABLE ROW LEVEL SECURITY;

-- 1. Users table: Users can only read/write their own profile
CREATE POLICY user_isolation_policy ON users
    FOR ALL
    USING (id = current_setting('app.current_user_id', true));

-- 2. Workspaces table: Users can access workspaces they own or belong to
CREATE POLICY workspace_tenant_isolation_policy ON workspaces
    FOR ALL
    USING (owner_id = current_setting('app.current_user_id', true) OR tenant_id = current_setting('app.current_tenant_id', true));

-- 3. Session Event Logs: Tenant isolation
CREATE POLICY session_log_tenant_policy ON session_event_logs
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true));

-- 4. MFS Transactions: Merchant ledger isolation
CREATE POLICY mfs_transaction_ledger_policy ON mfs_transactions
    FOR ALL
    USING (merchant_id = current_setting('app.current_user_id', true));

-- 5. RAG Memory Chunks: Twin memory vault isolation
CREATE POLICY rag_memory_isolation_policy ON rag_memory_chunks
    FOR ALL
    USING (twin_id = current_setting('app.current_twin_id', true) OR tenant_id = current_setting('app.current_tenant_id', true));
