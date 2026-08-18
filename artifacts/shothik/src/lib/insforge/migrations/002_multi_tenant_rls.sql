-- ============================================================================
-- SHOTHIK HERMES: MULTI-TENANT INSFORGE BAAS RLS MIGRATION (002)
-- Project: oss-project (https://ers8j28a.ap-southeast.insforge.app)
-- ============================================================================

-- 1. Organizations (Tenants)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier TEXT NOT NULL DEFAULT 'FREE' CHECK (tier IN ('FREE', 'STUDENT', 'PRO', 'TEAM', 'ENTERPRISE')),
    credits_pool INTEGER NOT NULL DEFAULT 550,
    mfs_phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Organization Members
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 3. Workspaces (Canvas & Projects)
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Shared Canvas Artifacts
CREATE TABLE IF NOT EXISTS public.canvas_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('slides', 'sheet', 'doc', 'diagram', 'research', 'code', 'commerce', 'boimela', 'community')),
    title TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    version INTEGER NOT NULL DEFAULT 1,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS across all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canvas_artifacts ENABLE ROW LEVEL SECURITY;

-- Organizations RLS
CREATE POLICY "Users can view organizations they belong to"
ON public.organizations
FOR SELECT
USING (
    auth.uid() = owner_id OR
    EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_members.organization_id = organizations.id
        AND organization_members.user_id = auth.uid()
    )
);

CREATE POLICY "Owners and Admins can update their organization"
ON public.organizations
FOR UPDATE
USING (
    auth.uid() = owner_id OR
    EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_members.organization_id = organizations.id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('OWNER', 'ADMIN')
    )
);

-- Organization Members RLS
CREATE POLICY "Members can view roster of their organization"
ON public.organization_members
FOR SELECT
USING (
    organization_id IN (
        SELECT org_m.organization_id FROM public.organization_members org_m
        WHERE org_m.user_id = auth.uid()
    )
);

-- Workspaces RLS
CREATE POLICY "Members can view workspaces in their organization"
ON public.workspaces
FOR SELECT
USING (
    organization_id IN (
        SELECT org_m.organization_id FROM public.organization_members org_m
        WHERE org_m.user_id = auth.uid()
    )
);

CREATE POLICY "Members can create workspaces in their organization"
ON public.workspaces
FOR INSERT
WITH CHECK (
    auth.uid() = created_by AND
    organization_id IN (
        SELECT org_m.organization_id FROM public.organization_members org_m
        WHERE org_m.user_id = auth.uid()
    )
);

-- Canvas Artifacts RLS
CREATE POLICY "Users can view artifacts in their organization or public community artifacts"
ON public.canvas_artifacts
FOR SELECT
USING (
    is_public = TRUE OR
    organization_id IN (
        SELECT org_m.organization_id FROM public.organization_members org_m
        WHERE org_m.user_id = auth.uid()
    )
);

CREATE POLICY "Members can create or update artifacts in their organization"
ON public.canvas_artifacts
FOR ALL
USING (
    organization_id IN (
        SELECT org_m.organization_id FROM public.organization_members org_m
        WHERE org_m.user_id = auth.uid()
    )
);
