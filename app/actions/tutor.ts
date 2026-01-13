'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

// ----------------------------------------------------------------------
// 1. CREATE SINGLE RESOURCE (Blog, PDF, Video)
// ----------------------------------------------------------------------
export async function createResource(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  // Extract fields
  const title = formData.get('title') as string;
  const type = formData.get('type') as string;
  const content = formData.get('content') as string; // HTML body or Link
  const segment_id = formData.get('segment_id');
  const group_id = formData.get('group_id');
  const subject_id = formData.get('subject_id');

  // Logic: Map specific fields based on type
  const insertData: any = {
    author_id: user.id,
    title,
    type, // 'blog', 'video', 'pdf', 'question'
    status: 'pending', // Always pending for review
    segment_id: segment_id ? Number(segment_id) : null,
    group_id: group_id ? Number(group_id) : null,
    subject_id: subject_id ? Number(subject_id) : null,
    created_at: new Date().toISOString(),
  };

  // If it's a blog/question, 'content' goes to 'content_body'
  // If it's a video/pdf, 'content' might be a URL (depending on your editor usage)
  if (type === 'video') {
    insertData.video_url = content; // Assuming user pasted link in editor
    insertData.content_body = content; // Keep copy in body just in case
  } else if (type === 'pdf') {
    insertData.pdf_url = content; 
    insertData.content_body = content;
  } else {
    insertData.content_body = content;
  }

  const { error } = await supabase.from('resources').insert(insertData);

  if (error) {
    console.error('Create Resource Error:', error);
    return { error: error.message };
  }

  // Success Redirect
  redirect('/tutor/dashboard/content');
}

// ----------------------------------------------------------------------
// 2. CREATE FULL COURSE (With Modules & Lessons)
// ----------------------------------------------------------------------
export async function createFullCourse(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  // 1. Extract Course Details
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = formData.get('price') as string;
  const thumbnail_url = formData.get('thumbnail_url') as string;
  const segment_id = formData.get('segment_id');
  const group_id = formData.get('group_id');
  const subject_id = formData.get('subject_id');
  
  // 2. Extract Curriculum (JSON stringified from frontend)
  const modulesRaw = formData.get('modules') as string;
  const modules = JSON.parse(modulesRaw || '[]');

  try {
    // 3. Insert Course "Container"
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        tutor_id: user.id,
        title,
        description,
        price: price || null,
        thumbnail_url,
        segment_id: segment_id ? Number(segment_id) : null,
        group_id: group_id ? Number(group_id) : null,
        subject_id: subject_id ? Number(subject_id) : null,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (courseError) throw new Error(courseError.message);

    // 4. Insert Modules & Lessons (Loop)
    for (const [mIndex, mod] of modules.entries()) {
      
      // Insert Module
      const { data: newModule, error: modError } = await supabase
        .from('course_modules')
        .insert({
          course_id: course.id,
          title: mod.title,
          order_index: mIndex
        })
        .select()
        .single();

      if (modError) throw modError;

      // Insert Lessons for this Module
      if (mod.lessons && mod.lessons.length > 0) {
        const lessonsToInsert = mod.lessons.map((less: any, lIndex: number) => ({
          module_id: newModule.id,
          title: less.title,
          lesson_type: less.type, // video, pdf, text
          video_url: less.type === 'video' ? less.content : null,
          pdf_url: less.type === 'pdf' ? less.content : null,
          text_content: less.type === 'text' ? less.content : null,
          is_free_preview: less.isFree || false,
          order_index: lIndex
        }));

        const { error: lessonError } = await supabase
          .from('course_lessons')
          .insert(lessonsToInsert);

        if (lessonError) throw lessonError;
      }
    }

    return { success: true };

  } catch (error: any) {
    console.error('Create Course Error:', error);
    return { error: error.message };
  }
}

// ----------------------------------------------------------------------
// 3. (Legacy) CREATE SIMPLE COURSE CONTAINER
// ----------------------------------------------------------------------
// Keeping this just in case other parts of your app still use it
export async function createCourse(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = formData.get('price') as string;

  const { data, error } = await supabase
    .from('courses')
    .insert({
      tutor_id: user.id,
      title,
      description,
      price: price || null,
      status: 'draft',
    })
    .select()
    .single();

  if (error) return { error: error.message };
  
  // Note: This function doesn't redirect automatically, it returns data
  return { data };
}