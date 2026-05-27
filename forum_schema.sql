-- ============================================================
-- FORUM SYSTEM COMPLETE DATABASE SCHEMA & SECURITY POLICIES
-- Run this entire script in your Supabase SQL Editor.
-- ============================================================

-- 1. Create Tables (Using IF NOT EXISTS to prevent overwriting existing data)
CREATE TABLE IF NOT EXISTS public.forum_threads (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    author_id uuid NOT NULL REFERENCES public.profiles(id),
    
    -- Thread Types
    thread_type text NOT NULL CHECK (thread_type IN ('standard', 'tutor_announcement', 'study_strategy', 'question_post')),
    question_format text CHECK (question_format IN ('descriptive', 'reading_comprehension', 'mcq')),
    
    -- Hierarchy Integration
    segment_id bigint REFERENCES public.segments(id),
    group_id bigint REFERENCES public.groups(id),
    subject_id bigint REFERENCES public.subjects(id),
    
    -- Metrics
    difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')),
    upvotes integer DEFAULT 0,
    views integer DEFAULT 0,
    is_pinned boolean DEFAULT false,
    
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 1b. Thread to Question Mapping
CREATE TABLE IF NOT EXISTS public.forum_thread_questions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id uuid NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    question_bank_id uuid NOT NULL REFERENCES public.question_bank(id) ON DELETE CASCADE,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(thread_id, question_bank_id)
);

-- 2. Nested Comments
CREATE TABLE IF NOT EXISTS public.forum_comments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id uuid NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    author_id uuid NOT NULL REFERENCES public.profiles(id),
    parent_id uuid REFERENCES public.forum_comments(id) ON DELETE CASCADE,
    
    content text NOT NULL,
    upvotes integer DEFAULT 0,
    
    is_expert_reply boolean DEFAULT false,
    is_pinned boolean DEFAULT false,
    
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. Tagging System
CREATE TABLE IF NOT EXISTS public.forum_tags (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.forum_thread_tags (
    thread_id uuid NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    tag_id bigint NOT NULL REFERENCES public.forum_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (thread_id, tag_id)
);

-- 4. User Question Attempts
CREATE TABLE IF NOT EXISTS public.forum_question_attempts (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id uuid NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id),
    selected_option_id uuid REFERENCES public.question_options(id),
    is_correct boolean NOT NULL,
    time_spent_seconds integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (thread_id, user_id)
);

-- 5. Bookmarks
CREATE TABLE IF NOT EXISTS public.user_forum_bookmarks (
    user_id uuid NOT NULL REFERENCES public.profiles(id),
    thread_id uuid NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (user_id, thread_id)
);

-- 6. Moderation Reports
CREATE TABLE IF NOT EXISTS public.forum_moderation_reports (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id uuid NOT NULL REFERENCES public.profiles(id),
    thread_id uuid REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    comment_id uuid REFERENCES public.forum_comments(id) ON DELETE CASCADE,
    reason text NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at timestamp with time zone DEFAULT now(),
    CHECK (
        (thread_id IS NOT NULL AND comment_id IS NULL) OR 
        (thread_id IS NULL AND comment_id IS NOT NULL)
    )
);

-- 7. Trigger function for gamification points sync
CREATE OR REPLACE FUNCTION sync_forum_upvote_to_profile()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.profiles 
        SET gamification_points = gamification_points + 5
        WHERE id = NEW.author_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.profiles 
        SET gamification_points = gamification_points - 5
        WHERE id = OLD.author_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 8. Upvotes tracker
CREATE TABLE IF NOT EXISTS public.forum_upvotes (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id),
    thread_id uuid REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    comment_id uuid REFERENCES public.forum_comments(id) ON DELETE CASCADE,
    author_id uuid NOT NULL REFERENCES public.profiles(id),
    created_at timestamp with time zone DEFAULT now(),
    CHECK (
        (thread_id IS NOT NULL AND comment_id IS NULL) OR 
        (thread_id IS NULL AND comment_id IS NOT NULL)
    )
);

-- Register Trigger
DROP TRIGGER IF EXISTS forum_upvote_gamification_trigger ON public.forum_upvotes;
CREATE TRIGGER forum_upvote_gamification_trigger
AFTER INSERT OR DELETE ON public.forum_upvotes
FOR EACH ROW EXECUTE FUNCTION sync_forum_upvote_to_profile();

-- 8b. Trigger function for upvote count sync
CREATE OR REPLACE FUNCTION public.sync_forum_upvotes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.thread_id IS NOT NULL THEN
            UPDATE public.forum_threads
            SET upvotes = COALESCE(upvotes, 0) + 1
            WHERE id = NEW.thread_id;
        ELSIF NEW.comment_id IS NOT NULL THEN
            UPDATE public.forum_comments
            SET upvotes = COALESCE(upvotes, 0) + 1
            WHERE id = NEW.comment_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.thread_id IS NOT NULL THEN
            UPDATE public.forum_threads
            SET upvotes = GREATEST(0, COALESCE(upvotes, 0) - 1)
            WHERE id = OLD.thread_id;
        ELSIF OLD.comment_id IS NOT NULL THEN
            UPDATE public.forum_comments
            SET upvotes = GREATEST(0, COALESCE(upvotes, 0) - 1)
            WHERE id = OLD.comment_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Register Upvote Count Trigger
DROP TRIGGER IF EXISTS forum_upvote_count_trigger ON public.forum_upvotes;
CREATE TRIGGER forum_upvote_count_trigger
AFTER INSERT OR DELETE ON public.forum_upvotes
FOR EACH ROW EXECUTE FUNCTION public.sync_forum_upvotes_count();



-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_thread_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_thread_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_forum_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_moderation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_upvotes ENABLE ROW LEVEL SECURITY;

-- 1. forum_threads
DROP POLICY IF EXISTS "Threads are viewable by everyone" ON public.forum_threads;
CREATE POLICY "Threads are viewable by everyone" ON public.forum_threads
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert threads" ON public.forum_threads;
CREATE POLICY "Authenticated users can insert threads" ON public.forum_threads
    FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors and admins can update threads" ON public.forum_threads;
CREATE POLICY "Authors and admins can update threads" ON public.forum_threads
    FOR UPDATE USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Authors and admins can delete threads" ON public.forum_threads;
CREATE POLICY "Authors and admins can delete threads" ON public.forum_threads
    FOR DELETE USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 2. forum_comments
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.forum_comments;
CREATE POLICY "Comments are viewable by everyone" ON public.forum_comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.forum_comments;
CREATE POLICY "Authenticated users can insert comments" ON public.forum_comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors and admins can update comments" ON public.forum_comments;
CREATE POLICY "Authors and admins can update comments" ON public.forum_comments
    FOR UPDATE USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Authors and admins can delete comments" ON public.forum_comments;
CREATE POLICY "Authors and admins can delete comments" ON public.forum_comments
    FOR DELETE USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. forum_thread_questions
DROP POLICY IF EXISTS "Thread questions are viewable by everyone" ON public.forum_thread_questions;
CREATE POLICY "Thread questions are viewable by everyone" ON public.forum_thread_questions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert thread questions" ON public.forum_thread_questions;
CREATE POLICY "Admins can insert thread questions" ON public.forum_thread_questions
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update thread questions" ON public.forum_thread_questions;
CREATE POLICY "Admins can update thread questions" ON public.forum_thread_questions
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can delete thread questions" ON public.forum_thread_questions;
CREATE POLICY "Admins can delete thread questions" ON public.forum_thread_questions
    FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. forum_tags
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON public.forum_tags;
CREATE POLICY "Tags are viewable by everyone" ON public.forum_tags
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage tags" ON public.forum_tags;
CREATE POLICY "Admins can manage tags" ON public.forum_tags
    FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. forum_thread_tags
DROP POLICY IF EXISTS "Thread tags are viewable by everyone" ON public.forum_thread_tags;
CREATE POLICY "Thread tags are viewable by everyone" ON public.forum_thread_tags
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Thread authors and admins can manage thread tags" ON public.forum_thread_tags;
CREATE POLICY "Thread authors and admins can manage thread tags" ON public.forum_thread_tags
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.forum_threads WHERE id = thread_id AND author_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 6. forum_question_attempts
DROP POLICY IF EXISTS "Attempts are viewable by owner or admin" ON public.forum_question_attempts;
CREATE POLICY "Attempts are viewable by owner or admin" ON public.forum_question_attempts
    FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users can insert their own attempts" ON public.forum_question_attempts;
CREATE POLICY "Users can insert their own attempts" ON public.forum_question_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can delete attempts" ON public.forum_question_attempts;
CREATE POLICY "Admins can delete attempts" ON public.forum_question_attempts
    FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 7. user_forum_bookmarks
DROP POLICY IF EXISTS "Bookmarks are managed by owner" ON public.user_forum_bookmarks;
CREATE POLICY "Bookmarks are managed by owner" ON public.user_forum_bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- 8. forum_moderation_reports
DROP POLICY IF EXISTS "Admins can select reports" ON public.forum_moderation_reports;
CREATE POLICY "Admins can select reports" ON public.forum_moderation_reports
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Authenticated users can create reports" ON public.forum_moderation_reports;
CREATE POLICY "Authenticated users can create reports" ON public.forum_moderation_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Admins can update reports" ON public.forum_moderation_reports;
CREATE POLICY "Admins can update reports" ON public.forum_moderation_reports
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can delete reports" ON public.forum_moderation_reports;
CREATE POLICY "Admins can delete reports" ON public.forum_moderation_reports
    FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 9. forum_upvotes
DROP POLICY IF EXISTS "Upvotes are viewable by everyone" ON public.forum_upvotes;
CREATE POLICY "Upvotes are viewable by everyone" ON public.forum_upvotes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own upvotes" ON public.forum_upvotes;
CREATE POLICY "Users can insert their own upvotes" ON public.forum_upvotes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own upvotes" ON public.forum_upvotes;
CREATE POLICY "Users can delete their own upvotes" ON public.forum_upvotes
    FOR DELETE USING (auth.uid() = user_id);
