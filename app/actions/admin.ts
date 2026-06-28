"use server";
import { createClient } from "@supabase/supabase-js";

// Use service role key to bypass RLS for admin actions (preview mode)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function saveCourseAdmin(data: any) {
  // Extract id from data
  const { id, ...updates } = data;
  if (id) {
    const { data: res, error } = await supabaseAdmin.from('courses').update(updates).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return res;
  } else {
    // Determine status based on role (hardcoded to approved for admin preview, but normally dynamic)
    if (!updates.status) updates.status = 'approved'; 

    const { data: res, error } = await supabaseAdmin.from('courses').insert(updates).select().single();
    if (error) throw new Error(error.message);
    return res;
  }
}

export async function addLessonAdmin(courseId: number, orderIndex: number) {
    const title = "New Lesson";
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    const { data, error } = await supabaseAdmin.from('course_lessons').insert({
        course_id: courseId, title, slug, order_index: orderIndex
    }).select().single();
    if (error) throw new Error(error.message);
    return data;
}

export async function updateLessonAdmin(id: string, updates: any) {
    const { error } = await supabaseAdmin.from('course_lessons').update(updates).eq('id', id);
    if (error) throw new Error(error.message);
}

export async function deleteLessonAdmin(id: string) {
    const { error } = await supabaseAdmin.from('course_lessons').delete().eq('id', id);
    if (error) throw new Error(error.message);
}

export async function addContentAdmin(lessonId: string, orderIndex: number) {
    const { data, error } = await supabaseAdmin.from('course_contents').insert({
        lesson_id: lessonId, title: "New Content Item", content_type: 'video', order_index: orderIndex
    }).select().single();
    if (error) throw new Error(error.message);
    return data;
}

export async function updateContentAdmin(id: string, updates: any) {
    const { error } = await supabaseAdmin.from('course_contents').update(updates).eq('id', id);
    if (error) throw new Error(error.message);
}

export async function deleteContentAdmin(id: string) {
    const { error } = await supabaseAdmin.from('course_contents').delete().eq('id', id);
    if (error) throw new Error(error.message);
}
