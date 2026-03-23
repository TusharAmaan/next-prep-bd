-- Add missing columns to segment_updates
ALTER TABLE public.segment_updates 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS content_body TEXT,
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create index for slug if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS segment_updates_slug_idx ON public.segment_updates (slug);
