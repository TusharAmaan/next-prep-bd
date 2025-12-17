import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// This creates a client that automatically handles Cookies for you
export const supabase = createBrowserClient(supabaseUrl, supabaseKey);