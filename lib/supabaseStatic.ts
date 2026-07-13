import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// This client does NOT use cookies, so it doesn't opt routes into dynamic rendering.
// Use this inside Server Components for fetching public static data.
export const supabaseStatic = createClient(supabaseUrl, supabaseKey);
