'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function submitQuestionAttempt(threadId: string, optionId: string, timeSpentSeconds: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Unauthorized")

  // 1. Verify if the option is correct and find the question_id from question_options table
  const { data: optionData, error: optionError } = await supabase
    .from('question_options')
    .select('is_correct, question_id')
    .eq('id', optionId)
    .single()

  if (optionError) throw new Error("Option not found")

  // 2. Record the attempt in forum_question_attempts
  const { error: insertError } = await supabase.from('forum_question_attempts').insert({
    thread_id: threadId,
    user_id: user.id,
    selected_option_id: optionId,
    question_id: optionData.question_id,
    is_correct: optionData.is_correct,
    time_spent_seconds: timeSpentSeconds
  })

  if (insertError) {
    // If it's a unique constraint violation, they already answered
    if (insertError.code === '23505') {
      return { success: false, error: "You have already answered this question." }
    }
    throw new Error("Failed to record attempt")
  }

  // 3. Trigger revalidation to update the dynamic UI metrics (e.g. "X% answered correctly")
  revalidatePath(`/forum/thread/${threadId}`)
  
  return { success: true, isCorrect: optionData.is_correct }
}

export async function checkAndConsumeGuestAnswerLimit(): Promise<boolean> {
  const cookieStore = await cookies()
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const cookieName = `guest_answers_${today}`
  
  const currentCount = parseInt(cookieStore.get(cookieName)?.value || '0', 10)
  
  if (currentCount >= 5) {
    return false; // Limit reached
  }
  
  // Consume one limit
  cookieStore.set(cookieName, (currentCount + 1).toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
  
  return true;
}

export async function toggleForumUpvote(threadId: string | null, commentId: string | null, authorId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Unauthorized")

  if (!threadId && !commentId) throw new Error("Must provide threadId or commentId")
  if (threadId && commentId) throw new Error("Cannot provide both threadId and commentId")

  // Check if upvote exists
  let query = supabase.from('forum_upvotes').select('id').eq('user_id', user.id)
  
  if (threadId) query = query.eq('thread_id', threadId)
  if (commentId) query = query.eq('comment_id', commentId)

  const { data: existingVote } = await query.maybeSingle()

  if (existingVote) {
    // Remove upvote
    await supabase.from('forum_upvotes').delete().eq('id', existingVote.id)
    
    // Decrement upvote count directly on thread/comment to guarantee accuracy
    if (threadId) {
      const { data: thread } = await supabase.from('forum_threads').select('upvotes').eq('id', threadId).single()
      const newUpvotes = Math.max(0, (thread?.upvotes || 0) - 1)
      await supabase.from('forum_threads').update({ upvotes: newUpvotes }).eq('id', threadId)
    }
    if (commentId) {
      const { data: comment } = await supabase.from('forum_comments').select('upvotes').eq('id', commentId).single()
      const newUpvotes = Math.max(0, (comment?.upvotes || 0) - 1)
      await supabase.from('forum_comments').update({ upvotes: newUpvotes }).eq('id', commentId)
    }
    
    revalidatePath(threadId ? `/forum/thread/${threadId}` : `/forum/thread`)
    return { upvoted: false }
  } else {
    // Add upvote
    const insertData: any = {
      user_id: user.id,
      author_id: authorId
    }
    if (threadId) insertData.thread_id = threadId
    if (commentId) insertData.comment_id = commentId

    await supabase.from('forum_upvotes').insert(insertData)

    // Increment upvote count directly on thread/comment to guarantee accuracy
    if (threadId) {
      const { data: thread } = await supabase.from('forum_threads').select('upvotes').eq('id', threadId).single()
      const newUpvotes = (thread?.upvotes || 0) + 1
      await supabase.from('forum_threads').update({ upvotes: newUpvotes }).eq('id', threadId)
    }
    if (commentId) {
      const { data: comment } = await supabase.from('forum_comments').select('upvotes').eq('id', commentId).single()
      const newUpvotes = (comment?.upvotes || 0) + 1
      await supabase.from('forum_comments').update({ upvotes: newUpvotes }).eq('id', commentId)
    }

    revalidatePath(threadId ? `/forum/thread/${threadId}` : `/forum/thread`)
    return { upvoted: true }
  }
}

export async function submitModerationReport(
  threadId: string | null,
  commentId: string | null,
  reasonType: string,
  customMessage: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("You must be logged in to report posts.")

  const formattedReason = customMessage.trim() 
    ? `${reasonType} - ${customMessage.trim()}`
    : reasonType

  const { error } = await supabase
    .from('forum_moderation_reports')
    .insert({
      reporter_id: user.id,
      thread_id: threadId || null,
      comment_id: commentId || null,
      reason: formattedReason,
      status: 'pending'
    })

  if (error) {
    console.error("Error submitting report:", error)
    throw new Error(error.message || "Failed to submit moderation report.")
  }

  return { success: true }
}

export async function toggleForumBookmark(threadId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  // Check if bookmark exists
  const { data: existingBookmark, error: selectError } = await supabase
    .from('user_forum_bookmarks')
    .select('thread_id')
    .eq('user_id', user.id)
    .eq('thread_id', threadId)
    .maybeSingle()

  if (selectError) {
    console.error("Error checking bookmark:", selectError)
    throw new Error("Failed to check bookmark state")
  }

  if (existingBookmark) {
    // Delete bookmark
    const { error: deleteError } = await supabase
      .from('user_forum_bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('thread_id', threadId)

    if (deleteError) throw deleteError
    revalidatePath(`/forum/thread/${threadId}`)
    return { bookmarked: false }
  } else {
    // Insert bookmark
    const { error: insertError } = await supabase
      .from('user_forum_bookmarks')
      .insert({
        user_id: user.id,
        thread_id: threadId
      })

    if (insertError) throw insertError
    revalidatePath(`/forum/thread/${threadId}`)
    return { bookmarked: true }
  }
}

export async function checkIsBookmarked(threadId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const { data, error } = await supabase
    .from('user_forum_bookmarks')
    .select('thread_id')
    .eq('user_id', user.id)
    .eq('thread_id', threadId)
    .maybeSingle()

  if (error) {
    console.error("Error checking bookmark:", error)
    return false
  }

  return !!data
}

export async function getStudentForumStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const [savedRes, postsRes, repliesRes, upvotesCastRes, upvotesReceivedRes] = await Promise.all([
    supabase.from('user_forum_bookmarks').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('forum_threads').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
    supabase.from('forum_comments').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
    supabase.from('forum_upvotes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('forum_upvotes').select('*', { count: 'exact', head: true }).eq('author_id', user.id)
  ])

  return {
    savedCount: savedRes.count || 0,
    myPostsCount: postsRes.count || 0,
    myRepliesCount: repliesRes.count || 0,
    kudosGivenCount: upvotesCastRes.count || 0,
    kudosReceivedCount: upvotesReceivedRes.count || 0
  }
}

export async function getForumTagsSuggestions(prefix: string) {
  if (!prefix || prefix.trim().length === 0) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('forum_tags')
    .select('id, name')
    .ilike('name', `%${prefix}%`)
    .limit(10)

  if (error) {
    console.error("Error fetching tag suggestions:", error)
    return []
  }

  return data || []
}

export async function createForumComment(threadId: string, content: string, parentId: string | null = null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  if (!content || content.trim().length === 0) {
    throw new Error("Comment content cannot be empty")
  }

  // Fetch current user profile to determine if expert reply
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isExpert = profile?.role === 'tutor' || profile?.role === 'admin'

  const { data: comment, error: insertError } = await supabase
    .from('forum_comments')
    .insert({
      thread_id: threadId,
      author_id: user.id,
      content: content.trim(),
      parent_id: parentId,
      upvotes: 0,
      is_expert_reply: isExpert
    })
    .select()
    .single()

  if (insertError) {
    console.error("Error inserting forum comment:", insertError)
    throw new Error(insertError.message || "Failed to create comment")
  }

  // Create an activity log entry
  try {
    await supabase.from('activity_logs').insert([{
      actor_id: user.id,
      action_type: 'forum_comment_create',
      details: `Added reply to thread ${threadId}`
    }])
  } catch (err) {
    console.error("Failed to log activity:", err)
  }

  revalidatePath(`/forum/thread/${threadId}`)
  
  return { success: true, comment }
}

