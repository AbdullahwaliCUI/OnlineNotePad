-- Run this in your Supabase SQL Editor to fix the "relation public.notes_with_tags does not exist" error

DROP VIEW IF EXISTS public.notes_with_tags;
CREATE OR REPLACE VIEW public.notes_with_tags AS
SELECT 
    n.*,
    COALESCE(
        json_agg(
            json_build_object(
                'id', t.id,
                'name', t.name,
                'color', t.color
            )
        ) FILTER (WHERE t.id IS NOT NULL),
        '[]'::json
    ) as tags
FROM public.notes n
LEFT JOIN public.note_tags nt ON n.id = nt.note_id
LEFT JOIN public.tags t ON nt.tag_id = t.id
GROUP BY n.id;

GRANT SELECT ON public.notes_with_tags TO authenticated;
