-- 1. Create search_analytics table for search tracking
CREATE TABLE IF NOT EXISTS public.search_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    query TEXT NOT NULL,
    result_count INTEGER DEFAULT 0,
    user_segment TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for search_analytics
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert analytics
CREATE POLICY "Anyone can insert search analytics" ON public.search_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view search analytics" ON public.search_analytics FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- 2. Fix RLS on feedbacks table to allow authenticated users to submit
-- First drop existing insert policy if it exists (ignoring errors if not)
DROP POLICY IF EXISTS "Authenticated users can submit feedback" ON public.feedbacks;
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedbacks;

-- Allow ONLY authenticated users to insert feedbacks 
CREATE POLICY "Authenticated users can submit feedback" ON public.feedbacks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
