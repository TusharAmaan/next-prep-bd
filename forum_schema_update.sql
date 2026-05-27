-- ============================================================
-- NEXTPREPBD FORUM SCHEMA UPDATE SQL
-- Run this in your Supabase SQL Editor to apply these updates.
-- ============================================================

-- 1. Alter thread_type check constraint on public.forum_threads
ALTER TABLE public.forum_threads DROP CONSTRAINT IF EXISTS forum_threads_thread_type_check;
ALTER TABLE public.forum_threads ADD CONSTRAINT forum_threads_thread_type_check 
CHECK (thread_type IN ('standard', 'study_strategy', 'question_post', 'reading_comprehension'));

-- 2. Add SEO metadata columns to public.forum_threads
ALTER TABLE public.forum_threads ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE public.forum_threads ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE public.forum_threads ADD COLUMN IF NOT EXISTS seo_tags text[];

-- 3. Ensure user_forum_bookmarks table exists
CREATE TABLE IF NOT EXISTS public.user_forum_bookmarks (
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    thread_id uuid NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (user_id, thread_id)
);

-- 4. Enable Row Level Security (RLS) on bookmarks
ALTER TABLE public.user_forum_bookmarks ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for bookmarks
DROP POLICY IF EXISTS "Bookmarks are managed by owner" ON public.user_forum_bookmarks;
CREATE POLICY "Bookmarks are managed by owner" ON public.user_forum_bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- 6. Add question_id to forum_question_attempts to support multiple questions per thread
ALTER TABLE public.forum_question_attempts ADD COLUMN IF NOT EXISTS question_id uuid REFERENCES public.question_bank(id) ON DELETE CASCADE;

-- 7. Update unique constraint on forum_question_attempts
ALTER TABLE public.forum_question_attempts DROP CONSTRAINT IF EXISTS forum_question_attempts_thread_id_user_id_key;
ALTER TABLE public.forum_question_attempts DROP CONSTRAINT IF EXISTS forum_question_attempts_user_question_unique;
ALTER TABLE public.forum_question_attempts ADD CONSTRAINT forum_question_attempts_user_question_unique UNIQUE (user_id, question_id);
