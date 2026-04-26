"use server";

import { createClient } from "@/utils/supabase/server";

export async function processDailyGamification(userId: string) {
  const supabase = await createClient();
  
  // 1. Fetch current gamification status
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('current_streak, longest_streak, last_active_date, gamification_points, gamification_rank')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    console.error("Error fetching profile for gamification:", error);
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let { current_streak = 0, longest_streak = 0, gamification_points = 0, gamification_rank = 'Novice', last_active_date } = profile;
  
  // Handle nulls
  current_streak = current_streak || 0;
  longest_streak = longest_streak || 0;
  gamification_points = gamification_points || 0;

  let lastActive = last_active_date ? new Date(last_active_date) : null;
  if (lastActive) lastActive.setHours(0, 0, 0, 0);

  let updated = false;

  // 2. Evaluate Streak
  if (!lastActive) {
    // First time active
    current_streak = 1;
    longest_streak = 1;
    gamification_points += 10;
    updated = true;
  } else {
    const diffTime = Math.abs(today.getTime() - lastActive.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day
      current_streak += 1;
      if (current_streak > longest_streak) {
        longest_streak = current_streak;
      }
      gamification_points += 10;
      updated = true;
    } else if (diffDays > 1) {
      // Streak broken
      current_streak = 1;
      gamification_points += 10;
      updated = true;
    }
    // If diffDays === 0, they already got their points for today.
  }

  // 3. Evaluate Rank based on Points
  let newRank = gamification_rank;
  if (gamification_points >= 1000) newRank = 'Grandmaster';
  else if (gamification_points >= 500) newRank = 'Master';
  else if (gamification_points >= 250) newRank = 'Expert';
  else if (gamification_points >= 100) newRank = 'Scholar';
  else newRank = 'Novice';

  if (newRank !== gamification_rank) {
    updated = true;
  }

  // 4. Update Database if necessary
  if (updated) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        current_streak,
        longest_streak,
        last_active_date: new Date().toISOString(),
        gamification_points,
        gamification_rank: newRank,
      })
      .eq('id', userId);

    if (updateError) {
      console.error("Error updating gamification profile:", updateError);
      return null;
    }

    return {
      streakUpdated: true,
      current_streak,
      gamification_points,
      gamification_rank: newRank,
    };
  }

  return {
    streakUpdated: false,
    current_streak,
    gamification_points,
    gamification_rank,
  };
}

export async function addGamificationPoints(userId: string, points: number, actionLogDetails?: string) {
  const supabase = await createClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('gamification_points, gamification_rank')
    .eq('id', userId)
    .single();

  if (!profile) return;

  let newPoints = (profile.gamification_points || 0) + points;
  let newRank = profile.gamification_rank || 'Novice';
  
  if (newPoints >= 1000) newRank = 'Grandmaster';
  else if (newPoints >= 500) newRank = 'Master';
  else if (newPoints >= 250) newRank = 'Expert';
  else if (newPoints >= 100) newRank = 'Scholar';

  await supabase
    .from('profiles')
    .update({
      gamification_points: newPoints,
      gamification_rank: newRank
    })
    .eq('id', userId);

  if (actionLogDetails) {
    await supabase.from('activity_logs').insert([{
      actor_id: userId,
      action_type: 'gamification_reward',
      details: actionLogDetails
    }]);
  }
}
