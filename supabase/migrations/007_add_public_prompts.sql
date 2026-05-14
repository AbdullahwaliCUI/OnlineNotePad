-- Add is_public column to prompts table
ALTER TABLE public.prompts ADD COLUMN is_public BOOLEAN DEFAULT false;

-- Update RLS policies to allow anyone to read public prompts
-- Create a policy that allows selecting a prompt if it is public
CREATE POLICY "Public prompts are viewable by everyone"
    ON public.prompts FOR SELECT
    USING (is_public = true);

-- We also need to ensure that prompt_texts associated with public prompts are viewable by everyone
-- This policy allows reading prompt_texts if their parent prompt is public
CREATE POLICY "Prompt texts for public prompts are viewable by everyone"
    ON public.prompt_texts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.prompts
            WHERE prompts.id = prompt_texts.prompt_id AND prompts.is_public = true
        )
    );
