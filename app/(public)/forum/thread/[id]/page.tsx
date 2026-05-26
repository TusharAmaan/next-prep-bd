import React from 'react';
import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ThreadMainPost from '@/components/forum/ThreadMainPost';
import MCQInteractiveWrapper from '@/components/forum/MCQInteractiveWrapper';
import CommentSection from '@/components/forum/CommentSection';

// Note: Revalidation depends on app routing caching strategy
export const revalidate = 60; 

interface Props {
  params: { id: string };
}

// 1. Fetch data logic
async function fetchThreadData(id: string) {
  const supabase = await createClient();

  // 1. Fetch main thread details (same simple query that succeeds on homepage)
  const { data: thread, error: threadError } = await supabase
    .from('forum_threads')
    .select(`
      *,
      author:profiles!forum_threads_author_id_fkey(id, full_name, gamification_rank),
      segment:segments(title),
      group:groups(title),
      subject:subjects(title)
    `)
    .eq('id', id)
    .single();

  if (threadError) {
    console.error("Error in fetchThreadData (thread query):", threadError);
    return null;
  }
  if (!thread) return null;

  // 2. Fetch linked questions separately (resilient to schema/relation/RLS variations)
  thread.questions = [];
  try {
    const { data: mappings, error: mapError } = await supabase
      .from('forum_thread_questions')
      .select('question_bank_id, order_index')
      .eq('thread_id', id);

    if (!mapError && mappings && mappings.length > 0) {
      const qIds = mappings.map((m: any) => m.question_bank_id);
      
      const { data: questions, error: qError } = await supabase
        .from('question_bank')
        .select(`
          id, 
          question_text, 
          explanation, 
          options:question_options(id, option_text, is_correct)
        `)
        .in('id', qIds);

      if (!qError && questions) {
        thread.questions = mappings.map((m: any) => {
          const matchedQ = questions.find((q: any) => q.id === m.question_bank_id);
          return {
            order_index: m.order_index,
            question: matchedQ
          };
        }).filter((tq: any) => tq.question);
      } else if (qError) {
        console.error("Non-fatal: Error fetching questions from bank:", qError);
      }
    } else if (mapError) {
      console.error("Non-fatal: Error fetching thread question mappings:", mapError);
    }
  } catch (err) {
    console.error("Non-fatal: Exception in questions fetching:", err);
  }

  // Fetch comments (flat list for simplicity, frontend will tree-ify or we can do it here)
  const { data: comments, error: commentsError } = await supabase
    .from('forum_comments')
    .select(`
      *,
      author:profiles!forum_comments_author_id_fkey(id, full_name, gamification_rank)
    `)
    .eq('thread_id', id)
    .order('created_at', { ascending: true });

  if (commentsError) {
    console.error("Non-fatal: Error fetching comments:", commentsError);
  }

  return { thread, comments: comments || [] };
}

// 2. SEO: Dynamic Metadata & Canonical
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await fetchThreadData(params.id);
  if (!data) return { title: 'Thread Not Found' };

  const { thread } = data;
  // Strip HTML for description
  const cleanDescription = thread.content.replace(/<[^>]+>/g, '').substring(0, 160) + '...';

  return {
    title: `${thread.title} | NextPrepBD Forum`,
    description: cleanDescription,
    alternates: {
      canonical: `https://nextprepbd.com/forum/thread/${params.id}`,
    },
  };
}

// 3. Page Component
export default async function ForumThreadPage({ params }: Props) {
  const data = await fetchThreadData(params.id);
  
  if (!data) {
    notFound();
  }

  const { thread, comments } = data;
  
  // Get current user if logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // JSON-LD Schema (QAPage)
  const expertReply = comments.find((c: any) => c.is_expert_reply);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: thread.title,
      text: thread.content,
      answerCount: comments.length,
      acceptedAnswer: expertReply ? {
        '@type': 'Answer',
        text: expertReply.content,
        upvoteCount: expertReply.upvotes,
        url: `https://nextprepbd.com/forum/thread/${thread.id}#comment-${expertReply.id}`
      } : undefined
    }
  };

  // Convert flat comments to tree if parent_id is used
  const rootComments = comments.filter((c: any) => !c.parent_id);
  const childComments = comments.filter((c: any) => c.parent_id);
  
  rootComments.forEach((rc: any) => {
    rc.children = childComments.filter((cc: any) => cc.parent_id === rc.id);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Inject Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <span>Forum</span>
        {thread.segment && <span>/ {thread.segment.title}</span>}
        {thread.group && <span>/ {thread.group.title}</span>}
        {thread.subject && <span>/ {thread.subject.title}</span>}
      </div>

      {/* Main Post */}
      <ThreadMainPost thread={thread} currentUserId={user?.id} />

      {/* Question Posts (MCQ/Reading Comp) */}
      {thread.thread_type === 'question_post' && thread.questions && thread.questions.length > 0 && (
        <div className="space-y-8 mt-8">
          {thread.questions.map((tq: any) => (
            <div key={tq.question.id}>
              {/* Question Text (For Reading Comprehension specific question) */}
              <div 
                className="prose dark:prose-invert mb-4 font-medium"
                dangerouslySetInnerHTML={{ __html: tq.question.question_text }}
              />
              
              <MCQInteractiveWrapper 
                threadId={thread.id}
                options={tq.question.options}
                hasAnswered={false} // Would need to fetch from `forum_question_attempts`
                isLoggedIn={!!user}
              />
            </div>
          ))}
        </div>
      )}

      {/* Comment Section */}
      <CommentSection 
        threadId={thread.id} 
        initialComments={rootComments}
        currentUserId={user?.id}
      />
    </div>
  );
}
