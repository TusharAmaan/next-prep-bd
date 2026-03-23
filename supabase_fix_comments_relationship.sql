-- Fix relationship between comments and profiles
-- The current schema has comments.user_id referencing auth.users(id)
-- To allow PostgREST joins with the public.profiles table, we should point the FK there.

ALTER TABLE public.comments 
DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

ALTER TABLE public.comments
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Also ensure RLS allows viewing profiles for comments
-- (Assuming profiles is already public or has appropriate policies)
