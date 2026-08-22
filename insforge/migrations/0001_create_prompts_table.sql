-- Create prompts table
CREATE TABLE public.prompts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    repo_owner text NOT NULL,
    repo_name text NOT NULL,
    synthetic_prompt text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can insert their own prompts"
    ON public.prompts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all prompts"
    ON public.prompts
    FOR SELECT
    USING (true);
