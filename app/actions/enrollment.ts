'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Enrolls a user in a course.
 */
export async function enrollInCourse(courseId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to enroll.' };
  }

  const { error } = await supabase
    .from('course_enrollments')
    .insert({
      user_id: user.id,
      course_id: courseId,
      status: 'active'
    });

  if (error) {
    // 23505 is the error code for unique constraint violation (already enrolled)
    if (error.code === '23505') {
       return { success: true, message: 'Already enrolled' };
    }
    console.error('Enrollment error:', error);
    return { error: error.message };
  }

  revalidatePath(`/courses/${courseId}`);
  return { success: true };
}

/**
 * Checks if a user is enrolled in a course.
 */
export async function checkEnrollmentStatus(courseId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { enrolled: false };

  const { data } = await supabase
    .from('course_enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle();

  return { enrolled: !!data };
}

/**
 * Marks a content item as completed.
 */
export async function updateProgress(contentId: string, isCompleted: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('course_user_progress')
    .upsert({
      user_id: user.id,
      content_id: contentId,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null
    }, { onConflict: 'user_id,content_id' });

  if (error) {
    console.error('Progress update error:', error);
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Fetches user progress for a course.
 */
export async function getCourseProgress(courseId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from('course_user_progress')
    .select('content_id, is_completed')
    .eq('user_id', user.id);

  return data || [];
}
