-- 1. Forum Threads
CREATE TABLE public.forum_threads (
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
    difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')), -- Manually set by author
    upvotes integer DEFAULT 0,
    views integer DEFAULT 0,
    is_pinned boolean DEFAULT false,
    
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 1b. Thread to Question Mapping (Supports Reading Comprehension with multiple questions)
CREATE TABLE public.forum_thread_questions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id uuid NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    question_bank_id uuid NOT NULL REFERENCES public.question_bank(id) ON DELETE CASCADE,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(thread_id, question_bank_id)
);

-- 2. Nested Comments
CREATE TABLE public.forum_comments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id uuid NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    author_id uuid NOT NULL REFERENCES public.profiles(id),
    parent_id uuid REFERENCES public.forum_comments(id) ON DELETE CASCADE, -- Enables Reddit-style nesting
    
    content text NOT NULL,
    upvotes integer DEFAULT 0,
    
    -- Badges / Roles display handled via author_id join to profiles
    is_expert_reply boolean DEFAULT false,
    is_pinned boolean DEFAULT false, -- Admin control only
    
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. Tagging System
CREATE TABLE public.forum_tags (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.forum_thread_tags (
    thread_id uuid NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    tag_id bigint NOT NULL REFERENCES public.forum_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (thread_id, tag_id)
);

-- 4. User Question Attempts (For MCQ Timer & Performance Metrics)
CREATE TABLE public.forum_question_attempts (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id uuid NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id),
    selected_option_id uuid REFERENCES public.question_options(id),
    is_correct boolean NOT NULL,
    time_spent_seconds integer NOT NULL, -- The timer tracking
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (thread_id, user_id) -- One recorded attempt per user per thread
);

-- 5. Bookmarks / Workbook Dashboard
CREATE TABLE public.user_forum_bookmarks (
    user_id uuid NOT NULL REFERENCES public.profiles(id),
    thread_id uuid NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (user_id, thread_id)
);

-- 6. Moderation Reports
CREATE TABLE public.forum_moderation_reports (
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

-- 7. Trigger function to sync upvotes to gamification_points
CREATE OR REPLACE FUNCTION sync_forum_upvote_to_profile()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Add points to the author of the thread/comment
        UPDATE public.profiles 
        SET gamification_points = gamification_points + 5
        WHERE id = NEW.author_id;
    ELSIF TG_OP = 'DELETE' THEN
        -- Remove points
        UPDATE public.profiles 
        SET gamification_points = gamification_points - 5
        WHERE id = OLD.author_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 8. Upvotes tracker to prevent double-voting and trigger the gamification function
CREATE TABLE public.forum_upvotes (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id),
    thread_id uuid REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    comment_id uuid REFERENCES public.forum_comments(id) ON DELETE CASCADE,
    author_id uuid NOT NULL REFERENCES public.profiles(id), -- Denormalized for easier trigger access
    created_at timestamp with time zone DEFAULT now(),
    CHECK (
        (thread_id IS NOT NULL AND comment_id IS NULL) OR 
        (thread_id IS NULL AND comment_id IS NOT NULL)
    )
);

CREATE TRIGGER forum_upvote_gamification_trigger
AFTER INSERT OR DELETE ON public.forum_upvotes
FOR EACH ROW EXECUTE FUNCTION sync_forum_upvote_to_profile();
