'use server';

import { createClient } from '@/utils/supabase/server';

export async function fetchSubjectCurriculumUnits(subjectId: string, version: 'bn' | 'en' = 'bn') {
  try {
    const supabase = await createClient();
    const { data: units, error } = await supabase
      .from('lesson_plan_units')
      .select(`
        id,
        title,
        order_index,
        version,
        lesson_plan_lessons (
          id,
          title,
          order_index,
          lesson_plan_contents (
            id,
            title,
            type,
            order_index,
            view_count
          )
        )
      `)
      .eq('subject_id', subjectId)
      .eq('version', version)
      .order('order_index');

    if (error) {
      console.error('Error fetching curriculum units:', error);
      return [];
    }

    return units || [];
  } catch (error) {
    console.error('Server action fetchSubjectCurriculumUnits error:', error);
    return [];
  }
}

export async function searchCurriculumGlobal(query: string) {
  const cleanQuery = (query || '').trim();
  if (!cleanQuery || cleanQuery.length < 2) {
    return { contents: [], units: [] };
  }

  try {
    const supabase = await createClient();

    // 1. Search lesson_plan_contents with lesson & unit context
    const { data: contentsData, error: contentsError } = await supabase
      .from('lesson_plan_contents')
      .select(`
        id,
        title,
        type,
        lesson_plan_lessons (
          id,
          title,
          unit_id,
          lesson_plan_units (
            id,
            title,
            subject_id
          )
        )
      `)
      .ilike('title', `%${cleanQuery}%`)
      .limit(12);

    if (contentsError) {
      console.error('Error searching curriculum contents:', contentsError);
    }

    // 2. Search lesson_plan_units
    const { data: unitsData, error: unitsError } = await supabase
      .from('lesson_plan_units')
      .select('id, title, subject_id')
      .ilike('title', `%${cleanQuery}%`)
      .limit(8);

    if (unitsError) {
      console.error('Error searching curriculum units:', unitsError);
    }

    const formattedContents = (contentsData || []).map((c: any) => {
      const lesson = c.lesson_plan_lessons;
      const unit = lesson?.lesson_plan_units;
      return {
        id: c.id,
        title: c.title,
        type: c.type,
        lesson_id: lesson?.id,
        lesson_title: lesson?.title,
        unit_id: unit?.id,
        unit_title: unit?.title,
        subject_id: unit?.subject_id
      };
    });

    const formattedUnits = (unitsData || []).map((u: any) => ({
      id: u.id,
      title: u.title,
      subject_id: u.subject_id
    }));

    return {
      contents: formattedContents,
      units: formattedUnits
    };
  } catch (error) {
    console.error('Server action searchCurriculumGlobal error:', error);
    return { contents: [], units: [] };
  }
}

