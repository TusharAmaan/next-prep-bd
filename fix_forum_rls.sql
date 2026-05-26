-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR FORUM SYSTEM
-- Run this script in the Supabase SQL Editor to resolve RLS violations
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
