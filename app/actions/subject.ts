'use server';

import { createClient } from '@/utils/supabase/server';

export async function incrementSubjectView(subjectId: string) {
  try {
    const supabase = await createClient();
    
    // We fetch the current view_count and increment it.
    // In a high-traffic app, you'd use a Postgres function (RPC) for atomic increments,
    // but this matches the previous implementation logic.
    const { data: subData } = await supabase
      .from('subjects')
      .select('view_count')
      .eq('id', subjectId)
      .single();
      
    if (subData) {
      await supabase
        .from('subjects')
        .update({ view_count: (subData.view_count || 0) + 1 })
        .eq('id', subjectId);
    }
  } catch (error) {
    console.error('Failed to increment subject view:', error);
  }
}
