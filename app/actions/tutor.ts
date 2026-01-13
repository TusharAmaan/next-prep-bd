// app/actions/tutor.ts
'use server'

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

// 1. ACTION: Create a Standalone Resource (Blog, Video, PDF, Question)
export async function createResource(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const type = formData.get('type') as string;
  const title = formData.get('title') as string;
  const content_body = formData.get('content') as string; // TinyMCE HTML
  const subject_id = formData.get('subject_id');
  const segment_id = formData.get('segment_id');
  
  // Basic validation
  if (!title || !type || !subject_id) {
    return { error: 'Please fill in all required fields (Title, Type, Subject).' };
  }

  const { error } = await supabase.from('resources').insert({
    title,
    type,
    content_body, // Stores HTML from TinyMCE
    subject_id: Number(subject_id),
    segment_id: Number(segment_id),
    author_id: user.id,
    status: 'pending', // <--- ENFORCES APPROVAL SYSTEM
    is_premium: false // Default to free, change if needed
  });

  if (error) return { error: error.message };

  redirect('/tutor/dashboard?success=resource_created');
}

// 2. ACTION: Create a Course Container
export async function createCourse(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = formData.get('price') as string;
  
  // Insert the course
  const { data, error } = await supabase.from('courses').insert({
    title,
    description,
    price: price || 'Free',
    tutor_id: user.id,
    status: 'pending' // <--- PENDING APPROVAL
  }).select().single();

  if (error) return { error: error.message };

  // Redirect to the Course Manager to add Modules/Lessons
  redirect(`/tutor/dashboard/course/${data.id}`);
}