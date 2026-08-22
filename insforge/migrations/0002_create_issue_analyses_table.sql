-- Create issue_analyses table
CREATE TABLE public.issue_analyses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    repo_owner text NOT NULL,
    repo_name text NOT NULL,
    analysis_content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.issue_analyses ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can insert their own issue analyses"
    ON public.issue_analyses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all issue analyses"
    ON public.issue_analyses
    FOR SELECT
    USING (true);
