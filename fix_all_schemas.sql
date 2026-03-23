-- ============================================================
-- CONSOLIDATED SCHEMA FIXES FOR NEXTPREPBD
-- Run this entire script in the Supabase SQL Editor.
-- ============================================================

-- ── 1. FIX COMMENTS TABLE ──
-- Ensure required columns exist
DO $BODY$
BEGIN
    -- Add item_type if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='comments' AND column_name='item_type') THEN
        ALTER TABLE public.comments ADD COLUMN item_type TEXT NOT NULL DEFAULT '';
    END IF;
    -- Add item_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='comments' AND column_name='item_id') THEN
        ALTER TABLE public.comments ADD COLUMN item_id TEXT NOT NULL DEFAULT '';
    END IF;
    -- Add parent_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='comments' AND column_name='parent_id') THEN
        ALTER TABLE public.comments ADD COLUMN parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;
    END IF;
    -- Add content if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='comments' AND column_name='content') THEN
        ALTER TABLE public.comments ADD COLUMN content TEXT NOT NULL DEFAULT '';
    END IF;
END $BODY$;

-- ── 2. FIX USER_ID FK TO REFERENCE PROFILES ──
-- This allows PostgREST to resolve the `profiles:user_id(...)` join
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE public.comments
ADD CONSTRAINT comments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ── 3. FIX SEGMENT_UPDATES TABLE ──
DO $BODY$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='segment_updates' AND column_name='status') THEN
        ALTER TABLE public.segment_updates ADD COLUMN status TEXT DEFAULT 'draft';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='segment_updates' AND column_name='author_id') THEN
        ALTER TABLE public.segment_updates ADD COLUMN author_id UUID REFERENCES public.profiles(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='segment_updates' AND column_name='seo_title') THEN
        ALTER TABLE public.segment_updates ADD COLUMN seo_title TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='segment_updates' AND column_name='seo_description') THEN
        ALTER TABLE public.segment_updates ADD COLUMN seo_description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='segment_updates' AND column_name='tags') THEN
        ALTER TABLE public.segment_updates ADD COLUMN tags TEXT[];
    END IF;
END $BODY$;

-- ── 4. ENSURE INDEXES ──
CREATE INDEX IF NOT EXISTS comments_item_idx ON public.comments(item_type, item_id);
CREATE INDEX IF NOT EXISTS comments_parent_idx ON public.comments(parent_id);

-- ── 5. ENSURE RLS POLICIES ──
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
CREATE POLICY "Authenticated users can insert comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);
