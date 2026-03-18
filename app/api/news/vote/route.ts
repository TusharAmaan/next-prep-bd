import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { newsId, voteType, userId } = await request.json();

    if (!newsId || !voteType || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['upvote', 'downvote'].includes(voteType)) {
      return NextResponse.json(
        { error: 'Invalid vote type' },
        { status: 400 }
      );
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('news_votes')
      .select('*')
      .eq('news_id', newsId)
      .eq('user_id', userId)
      .single();

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Same vote - remove it
        await supabase
          .from('news_votes')
          .delete()
          .eq('id', existingVote.id);

        // Update counts
        await supabase.rpc('update_vote_counts', { p_news_id: newsId });
      } else {
        // Different vote - update it
        await supabase
          .from('news_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id);

        // Update counts
        await supabase.rpc('update_vote_counts', { p_news_id: newsId });
      }
    } else {
      // New vote - insert it
      await supabase.from('news_votes').insert({
        news_id: newsId,
        user_id: userId,
        vote_type: voteType,
      });

      // Update counts
      await supabase.rpc('update_vote_counts', { p_news_id: newsId });
    }

    // Fetch updated counts
    const { data: updatedPost } = await supabase
      .from('news')
      .select('upvotes, downvotes')
      .eq('id', newsId)
      .single();

    // Get user's current vote
    const { data: userVote } = await supabase
      .from('news_votes')
      .select('vote_type')
      .eq('news_id', newsId)
      .eq('user_id', userId)
      .single();

    return NextResponse.json({
      upvotes: updatedPost?.upvotes || 0,
      downvotes: updatedPost?.downvotes || 0,
      userVote: userVote?.vote_type || null,
    });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const newsId = searchParams.get('newsId');
    const userId = searchParams.get('userId');

    if (!newsId) {
      return NextResponse.json(
        { error: 'Missing newsId' },
        { status: 400 }
      );
    }

    // Fetch vote counts
    const { data: post } = await supabase
      .from('news')
      .select('upvotes, downvotes')
      .eq('id', newsId)
      .single();

    // Fetch user's vote if userId provided
    let userVote = null;
    if (userId) {
      const { data: vote } = await supabase
        .from('news_votes')
        .select('vote_type')
        .eq('news_id', newsId)
        .eq('user_id', userId)
        .single();
      userVote = vote?.vote_type || null;
    }

    return NextResponse.json({
      upvotes: post?.upvotes || 0,
      downvotes: post?.downvotes || 0,
      userVote,
    });
  } catch (error) {
    console.error('Fetch votes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch votes' },
      { status: 500 }
    );
  }
}
