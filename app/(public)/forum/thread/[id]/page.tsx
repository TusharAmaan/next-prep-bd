import React from 'react';
import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ThreadMainPost from '@/components/forum/ThreadMainPost';
import MCQInteractiveWrapper from '@/components/forum/MCQInteractiveWrapper';
import DescriptiveRevealWrapper from '@/components/forum/DescriptiveRevealWrapper';
import CommentSection from '@/components/forum/CommentSection';
import { ClipboardList, Timer, BarChart3, User, Flame, Target, TrendingUp, Zap, BookOpen, AlertCircle } from 'lucide-react';

// Note: Revalidation depends on app routing caching strategy
export const revalidate = 60; 

interface Props {
  params: Promise<{ id: string }>;
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
    return { thread: null, comments: [], error: threadError.message || JSON.stringify(threadError) };
  }
  if (!thread) {
    return { thread: null, comments: [], error: "No thread found matching this ID in the database." };
  }

  // 2. Fetch linked questions separately (resilient to schema/relation/RLS variations)
  thread.questions = [];
  try {
    const { data: mappings, error: mapError } = await supabase
      .from('forum_thread_questions')
      .select('question_bank_id, order_index')
      .eq('thread_id', id);

    if (!mapError && mappings && mappings.length > 0) {
      const qIds = mappings.map((m: any) => m.question_bank_id);
      
      // Fetch questions
      const { data: questions, error: qError } = await supabase
        .from('question_bank')
        .select(`
          id, 
          question_text, 
          explanation,
          question_type
        `)
        .in('id', qIds);

      // Fetch options separately to bypass relationship mapping anomalies
      const { data: allOptions, error: optError } = await supabase
        .from('question_options')
        .select('id, question_id, option_text, is_correct')
        .in('question_id', qIds)
        .order('order_index', { ascending: true });

      if (!qError && questions) {
        if (!optError && allOptions) {
          questions.forEach((q: any) => {
            q.options = allOptions.filter((opt: any) => opt.question_id === q.id);
          });
        }
        
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
  const resolvedParams = await params;
  const data = await fetchThreadData(resolvedParams.id);
  if (!data || !data.thread) return { title: 'Thread Not Found' };

  const { thread } = data;
  
  // SEO metadata options
  const cleanDescription = thread.content.replace(/<[^>]+>/g, '').substring(0, 160) + '...';
  const metaTitle = thread.seo_title ? thread.seo_title : `${thread.title} | NextPrepBD Forum`;
  const metaDesc = thread.seo_description ? thread.seo_description : cleanDescription;

  return {
    title: metaTitle,
    description: metaDesc,
    keywords: thread.seo_tags ? thread.seo_tags : undefined,
    alternates: {
      canonical: `https://nextprepbd.com/forum/thread/${resolvedParams.id}`,
    },
  };
}

// 3. Page Component
export default async function ForumThreadPage({ params }: Props) {
  const resolvedParams = await params;
  const data = await fetchThreadData(resolvedParams.id);
  
  if (!data || data.error || !data.thread) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white dark:bg-[#1C1F26] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Failed to Load Discussion</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
          The forum thread could not be loaded due to a query or database permission issue:
        </p>
        <div className="text-xs text-red-600 dark:text-red-400 font-mono font-bold leading-relaxed bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-150 dark:border-red-900/30 text-left overflow-x-auto max-h-64">
          {data?.error || "Discussion thread could not be retrieved."}
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-6 font-semibold uppercase tracking-wider">
          Thread ID: {resolvedParams.id}
        </p>
      </div>
    );
  }

  const { thread, comments } = data;
  
  // Get current user if logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Fetch user upvote status and dynamic performance stats
  let userStats = { attemptsCount: 0, accuracyRate: 100, currentStreak: 0 };
  let initialIsUpvoted = false;
  let initialIsBookmarked = false;
  let hasAnswered = false;
  let previouslySelectedOptionId = undefined;
  let previouslyTimeSpent = undefined;
  const userAttemptsMap: { [questionId: string]: string } = {};
  const userAttemptsTimeMap: { [questionId: string]: number } = {};
  let userCommentUpvotes: string[] = [];
  let currentUserProfile: any = null;

  if (user) {
    // Check upvote status
    const { data: upvoteData } = await supabase
      .from('forum_upvotes')
      .select('id')
      .eq('thread_id', thread.id)
      .eq('user_id', user.id)
      .limit(1);
    if (upvoteData && upvoteData.length > 0) {
      initialIsUpvoted = true;
    }

    // Check bookmark status
    const { data: bookmarkData } = await supabase
      .from('user_forum_bookmarks')
      .select('thread_id')
      .eq('thread_id', thread.id)
      .eq('user_id', user.id)
      .limit(1);
    if (bookmarkData && bookmarkData.length > 0) {
      initialIsBookmarked = true;
    }

    // Check if user answered questions mapped to this thread
    const { data: attemptsData } = await supabase
      .from('forum_question_attempts')
      .select('question_id, selected_option_id, time_spent_seconds')
      .eq('thread_id', thread.id)
      .eq('user_id', user.id);
    
    if (attemptsData && attemptsData.length > 0) {
      attemptsData.forEach((att: any) => {
        if (att.question_id && att.selected_option_id) {
          userAttemptsMap[att.question_id] = att.selected_option_id;
          userAttemptsTimeMap[att.question_id] = att.time_spent_seconds || 0;
        }
      });
      // Fallback for single question post
      hasAnswered = true;
      previouslySelectedOptionId = attemptsData[0].selected_option_id;
      previouslyTimeSpent = attemptsData[0].time_spent_seconds || 0;
    }

    // Fetch user stats
    const [attemptsCountRes, correctCountRes, profileRes, commentVotesRes] = await Promise.all([
      supabase.from('forum_question_attempts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('forum_question_attempts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_correct', true),
      supabase.from('profiles').select('current_streak, id, full_name, gamification_rank').eq('id', user.id).single(),
      supabase.from('forum_upvotes').select('comment_id').eq('user_id', user.id).not('comment_id', 'is', null)
    ]);

    const totalAttempts = attemptsCountRes.count || 0;
    const correctAttempts = correctCountRes.count || 0;
    
    userStats = {
      attemptsCount: totalAttempts,
      accuracyRate: totalAttempts ? Math.round((correctAttempts / totalAttempts) * 100) : 100,
      currentStreak: profileRes.data?.current_streak || 0
    };

    if (profileRes.data) {
      currentUserProfile = {
        id: profileRes.data.id,
        full_name: profileRes.data.full_name,
        gamification_rank: profileRes.data.gamification_rank
      };
    }

    if (commentVotesRes.data) {
      userCommentUpvotes = commentVotesRes.data.map((v: any) => v.comment_id || '');
    }
  }

  // 2. Fetch options analytics metrics
  const metrics: { [key: string]: number } = {};
  const { data: attempts } = await supabase
    .from('forum_question_attempts')
    .select('selected_option_id')
    .eq('thread_id', thread.id);

  if (attempts && attempts.length > 0) {
    const total = attempts.length;
    const counts: { [key: string]: number } = {};
    attempts.forEach((att: any) => {
      if (att.selected_option_id) {
        counts[att.selected_option_id] = (counts[att.selected_option_id] || 0) + 1;
      }
    });
    Object.keys(counts).forEach(optId => {
      metrics[optId] = Math.round((counts[optId] / total) * 100);
    });
  }

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Inject Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
        <Link href="/forum" className="hover:text-blue-600 transition-colors">Forum</Link>
        {thread.segment && <span className="text-slate-400">/ {thread.segment.title}</span>}
        {thread.group && <span className="text-slate-400">/ {thread.group.title}</span>}
        {thread.subject && <span className="text-slate-400">/ {thread.subject.title}</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Post details & replies */}
        <div className="lg:col-span-8 space-y-6">
          <ThreadMainPost 
            thread={thread} 
            currentUserId={user?.id} 
            initialIsUpvoted={initialIsUpvoted}
            initialIsBookmarked={initialIsBookmarked}
            hasAnswered={hasAnswered}
            previouslySelectedOptionId={previouslySelectedOptionId}
            previouslyTimeSpent={previouslyTimeSpent}
            metrics={metrics}
          />

          {/* Reading Comprehension Questions Section */}
          {thread.thread_type === 'reading_comprehension' && thread.questions && thread.questions.length > 0 && (
            <div className="space-y-8 bg-white dark:bg-[#1C1F26] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-left">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white border-b border-slate-150 dark:border-slate-800 pb-3 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-indigo-600 rounded-full"></span>
                Comprehension Questions
              </h3>
              
              <div className="space-y-8">
                {thread.questions.map((tq: any, idx: number) => {
                  const q = tq.question;
                  const isMCQ = q.question_type === 'mcq';
                  const userSelectedOption = userAttemptsMap[q.id];
                  const hasAnsweredQ = userSelectedOption !== undefined;
                  
                  return (
                    <div key={q.id} className="space-y-4 border-b border-slate-100 dark:border-slate-800/60 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-start gap-2.5">
                        <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-extrabold text-xs px-2.5 py-1 rounded-lg">
                          Q{idx + 1}
                        </span>
                        <div 
                          className="prose dark:prose-invert font-semibold text-slate-850 dark:text-slate-100 text-base leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: q.question_text }}
                        />
                      </div>
                      
                      {isMCQ ? (
                        <>
                          {q.options && q.options.length > 0 && (
                            <div className="space-y-2.5 mt-3 mb-5 pl-4 border-l-2 border-slate-200 dark:border-slate-800">
                              {q.options.map((opt: any, optIdx: number) => (
                                <div key={opt.id} className="text-slate-750 dark:text-slate-350 text-sm font-semibold flex items-start gap-2">
                                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                                    {['A', 'B', 'C', 'D', 'E', 'F', 'G'][optIdx] || ''}.
                                  </span>
                                  <div dangerouslySetInnerHTML={{ __html: opt.option_text }} />
                                </div>
                              ))}
                            </div>
                          )}
                          <MCQInteractiveWrapper 
                            threadId={thread.id}
                            options={q.options || []}
                            hasAnswered={hasAnsweredQ}
                            previouslySelectedOptionId={userSelectedOption}
                            previouslyTimeSpent={userAttemptsTimeMap[q.id] || 0}
                            metrics={metrics}
                            isLoggedIn={!!user}
                          />
                        </>
                      ) : (
                        /* Descriptive question: direct question and a button to reveal the answer below */
                        <DescriptiveRevealWrapper explanation={q.explanation || ""} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <CommentSection 
            threadId={thread.id} 
            initialComments={rootComments}
            currentUserId={user?.id}
            userCommentUpvotes={userCommentUpvotes}
            currentUserProfile={currentUserProfile}
          />
        </div>

        {/* Right Column: Sidebar Toolkit */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Prep Toolkit Widget */}
          <div className="bg-white dark:bg-[#1C1F26] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2 pb-3 border-b border-slate-150 dark:border-slate-800">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
              Prep Toolkit
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/forum" className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-800/40 dark:hover:bg-blue-900/10 border border-slate-150 dark:border-slate-850 hover:border-blue-200 dark:hover:border-blue-900/30 text-center transition-all group">
                <ClipboardList className="w-5 h-5 text-blue-500 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Forum Quiz</span>
              </Link>
              <Link href="/exams" className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-800/40 dark:hover:bg-blue-900/10 border border-slate-150 dark:border-slate-850 hover:border-blue-200 dark:hover:border-blue-900/30 text-center transition-all group">
                <Timer className="w-5 h-5 text-indigo-500 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Practice Tests</span>
              </Link>
              <Link href="/student/dashboard" className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-800/40 dark:hover:bg-blue-900/10 border border-slate-150 dark:border-slate-850 hover:border-blue-200 dark:hover:border-blue-900/30 text-center transition-all group col-span-2 flex-row gap-3">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Open Error Log / Analytics</span>
              </Link>
              <Link href="/profile" className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-800/40 dark:hover:bg-blue-900/10 border border-slate-150 dark:border-slate-850 hover:border-blue-200 dark:hover:border-blue-900/30 text-center transition-all group">
                <User className="w-5 h-5 text-violet-500 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350">My Profile</span>
              </Link>
              <Link href="/forum" className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-800/40 dark:hover:bg-blue-900/10 border border-slate-150 dark:border-slate-850 hover:border-blue-200 dark:hover:border-blue-900/30 text-center transition-all group">
                <Flame className="w-5 h-5 text-orange-500 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Hot Topics</span>
              </Link>
            </div>
          </div>

          {/* Performance Overview Widget */}
          <div className="bg-white dark:bg-[#1C1F26] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2 pb-3 border-b border-slate-150 dark:border-slate-800">
              <span className="w-1.5 h-4 bg-emerald-600 rounded-full"></span>
              Your Performance Overview
            </h3>
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-150 dark:border-slate-850">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-blue-500" />
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Attempts</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Questions Attempted</span>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">{userStats.attemptsCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-150 dark:border-slate-850">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Accuracy</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Accuracy Rate</span>
                    </div>
                  </div>
                  <span className={`text-sm font-extrabold ${userStats.accuracyRate >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>{userStats.accuracyRate}%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-150 dark:border-slate-850">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-orange-500" />
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Streak</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Current Streak</span>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-orange-500">{userStats.currentStreak} Days</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-slate-505 dark:text-slate-405 font-semibold mb-3">Log in to track your questions accuracy, daily study streaks, and error log.</p>
                <Link href="/login" className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95">Sign In</Link>
              </div>
            )}
          </div>

          {/* Announcements Widget */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-10">
              <BookOpen className="w-28 h-28 text-white" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2">NextPrepBD updates</h3>
            <h4 className="text-base font-extrabold mb-3 leading-snug">GMAT & MBA Strategy Sessions every Wednesday!</h4>
            <p className="text-xs text-indigo-100 font-semibold leading-relaxed mb-4">Join our expert tutors live to solve complex Quantitative and Verbal reasoning questions and analyze exam shortcuts.</p>
            <Link href="/curriculum" className="inline-flex items-center gap-2 bg-white text-indigo-700 hover:bg-blue-50 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all active:scale-95">
              Explore Strategy <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
