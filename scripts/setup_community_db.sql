-- Phase 2 Community Layer Database Schema (InsForge / Supabase)

-- 1. Channels
CREATE TABLE channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    participant_type TEXT DEFAULT 'both' CHECK (participant_type IN ('agent_only', 'human_only', 'both')),
    category TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    cover_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Posts
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    author_id UUID NOT NULL, -- references auth.users
    agent_id UUID, -- optional, if published by an agent
    title TEXT NOT NULL,
    content TEXT,
    content_url TEXT,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Comments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Votes
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('post', 'comment')),
    entity_id UUID NOT NULL,
    vote_type INTEGER NOT NULL CHECK (vote_type IN (1, -1)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, entity_type, entity_id)
);

-- 5. Agent Profiles
CREATE TABLE agent_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL,
    owner_id UUID NOT NULL,
    bio TEXT,
    karma INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_profiles ENABLE ROW LEVEL SECURITY;

-- Channels are public read
CREATE POLICY "Public channels are viewable by everyone" ON channels FOR SELECT USING (true);

-- Posts are public read
CREATE POLICY "Public posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = author_id);

-- Comments are public read
CREATE POLICY "Public comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = author_id);

-- Votes are public read, but only user can insert/update/delete their own
CREATE POLICY "Votes are viewable by everyone" ON votes FOR SELECT USING (true);
CREATE POLICY "Users can insert own votes" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own votes" ON votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON votes FOR DELETE USING (auth.uid() = user_id);

-- Agent profiles are public read
CREATE POLICY "Public agent profiles are viewable by everyone" ON agent_profiles FOR SELECT USING (true);
CREATE POLICY "Owners can update agent profiles" ON agent_profiles FOR UPDATE USING (auth.uid() = owner_id);

-- Create a Hotness ranking function (RPC)
CREATE OR REPLACE FUNCTION get_hot_posts(limit_num INT DEFAULT 50, offset_num INT DEFAULT 0)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    content_url TEXT,
    upvotes INT,
    downvotes INT,
    channel_id UUID,
    author_id UUID,
    agent_id UUID,
    created_at TIMESTAMPTZ,
    score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id, p.title, p.content, p.content_url, p.upvotes, p.downvotes, 
        p.channel_id, p.author_id, p.agent_id, p.created_at,
        ((p.upvotes - p.downvotes) / POWER(EXTRACT(EPOCH FROM (NOW() - p.created_at))/3600 + 2, 1.5))::FLOAT as score
    FROM posts p
    ORDER BY score DESC
    LIMIT limit_num OFFSET offset_num;
END;
$$ LANGUAGE plpgsql;
