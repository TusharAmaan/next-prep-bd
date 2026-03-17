import { createClient } from '@/utils/supabase/client';
import { INTERVIEW_PREP_CONFIG } from '@/lib/interviewPrepConfig';

const supabase = createClient();

/**
 * Generate interview schedule with conflict detection
 */
export async function scheduleInterview(
  studentId: string,
  tutorId: string,
  interviewType: string,
  scheduledTime: string,
  duration: number,
  format: string
) {
  try {
    // Check for scheduling conflicts
    const { data: conflicts, error: conflictError } = await supabase
      .from('interviews')
      .select('*')
      .eq('status', 'scheduled')
      .or(`tutor_id.eq.${tutorId},student_id.eq.${studentId}`)
      .gte('scheduled_time', new Date(scheduledTime).toISOString())
      .lt(
        'scheduled_time',
        new Date(new Date(scheduledTime).getTime() + duration * 60000).toISOString()
      );

    if (conflictError) throw conflictError;

    if (conflicts && conflicts.length > 0) {
      throw new Error('Scheduling conflict exists');
    }

    // Create interview record
    const { data: interview, error: scheduleError } = await supabase
      .from('interviews')
      .insert({
        student_id: studentId,
        tutor_id: tutorId,
        interview_type: interviewType,
        scheduled_time: new Date(scheduledTime).toISOString(),
        duration_minutes: duration,
        format,
        status: 'scheduled',
        created_at: new Date().toISOString(),
      })
      .select();

    if (scheduleError) throw scheduleError;

    return { success: true, interview: interview?.[0] };
  } catch (error) {
    console.error('Error scheduling interview:', error);
    throw error;
  }
}

/**
 * Reschedule an existing interview
 */
export async function rescheduleInterview(
  interviewId: string,
  newScheduledTime: string,
  newDuration?: number
) {
  try {
    const { data: interview, error: fetchError } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', interviewId)
      .single();

    if (fetchError) throw fetchError;

    if (interview.completed_at || interview.status === 'completed') {
      throw new Error('Cannot reschedule completed interview');
    }

    // Check for new conflicts
    const { data: conflicts, error: conflictError } = await supabase
      .from('interviews')
      .select('*')
      .eq('status', 'scheduled')
      .neq('id', interviewId)
      .or(
        `tutor_id.eq.${interview.tutor_id},student_id.eq.${interview.student_id}`
      )
      .gte('scheduled_time', new Date(newScheduledTime).toISOString())
      .lt(
        'scheduled_time',
        new Date(
          new Date(newScheduledTime).getTime() +
            (newDuration || interview.duration_minutes) * 60000
        ).toISOString()
      );

    if (conflictError) throw conflictError;

    if (conflicts && conflicts.length > 0) {
      throw new Error('Scheduling conflict exists at new time');
    }

    // Update interview
    const { error: updateError } = await supabase
      .from('interviews')
      .update({
        scheduled_time: new Date(newScheduledTime).toISOString(),
        duration_minutes: newDuration || interview.duration_minutes,
        status: 'rescheduled',
      })
      .eq('id', interviewId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.error('Error rescheduling interview:', error);
    throw error;
  }
}

/**
 * Select questions for interview based on type, difficulty, and categories
 */
export async function selectInterviewQuestions(
  interviewType: string,
  difficulty: string,
  categories: string[],
  numQuestions: number
) {
  try {
    const difficultyDistribution =
      INTERVIEW_PREP_CONFIG.DIFFICULTY_DISTRIBUTION[
        difficulty as keyof typeof INTERVIEW_PREP_CONFIG.DIFFICULTY_DISTRIBUTION
      ];

    let easyCount = Math.floor(numQuestions * (difficultyDistribution?.easy || 0.33));
    let mediumCount = Math.floor(
      numQuestions * (difficultyDistribution?.medium || 0.33)
    );
    let hardCount = numQuestions - easyCount - mediumCount;

    const allQuestions: any[] = [];

    // Fetch easy questions
    if (easyCount > 0) {
      const { data, error } = await supabase
        .from('interview_questions')
        .select('*')
        .eq('interview_type', interviewType)
        .eq('difficulty', 'easy')
        .in('category', categories)
        .eq('active', true)
        .order('RANDOM()', { ascending: true })
        .limit(easyCount);

      if (error) throw error;
      allQuestions.push(...(data || []));
    }

    // Fetch medium questions
    if (mediumCount > 0) {
      const { data, error } = await supabase
        .from('interview_questions')
        .select('*')
        .eq('interview_type', interviewType)
        .eq('difficulty', 'medium')
        .in('category', categories)
        .eq('active', true)
        .order('RANDOM()', { ascending: true })
        .limit(mediumCount);

      if (error) throw error;
      allQuestions.push(...(data || []));
    }

    // Fetch hard questions
    if (hardCount > 0) {
      const { data, error } = await supabase
        .from('interview_questions')
        .select('*')
        .eq('interview_type', interviewType)
        .eq('difficulty', 'hard')
        .in('category', categories)
        .eq('active', true)
        .order('RANDOM()', { ascending: true })
        .limit(hardCount);

      if (error) throw error;
      allQuestions.push(...(data || []));
    }

    return allQuestions;
  } catch (error) {
    console.error('Error selecting interview questions:', error);
    throw error;
  }
}

/**
 * Score an interview response based on rubric
 */
export function scoreInterviewResponse(
  responses: any[],
  rubricType: string,
  evaluatorScores: {
    [key: string]: number;
  }
): {
  totalScore: number;
  maxScore: number;
  percentage: number;
  scores: { [key: string]: { score: number; weight: number; weighted: number } };
} {
  const rubric =
    INTERVIEW_PREP_CONFIG.SCORING_RUBRICS[
      rubricType as keyof typeof INTERVIEW_PREP_CONFIG.SCORING_RUBRICS
    ];

  if (!rubric) {
    throw new Error(`Invalid rubric type: ${rubricType}`);
  }

  let totalScore = 0;
  let maxScore = 0;
  const scores: {
    [key: string]: { score: number; weight: number; weighted: number };
  } = {};

  for (const [criterion, config] of Object.entries(rubric)) {
    const evaluatorScore = evaluatorScores[criterion] || 0;
    const weight = (config as any).weight;
    const normalizedWeight = weight / 100;
    const weightedScore = evaluatorScore * normalizedWeight;

    scores[criterion] = {
      score: evaluatorScore,
      weight: weight,
      weighted: weightedScore,
    };

    totalScore += weightedScore;
    maxScore += normalizedWeight;
  }

  return {
    totalScore: Math.round(totalScore * 100) / 100,
    maxScore: Math.round(maxScore * 100) / 100,
    percentage: Math.round((totalScore / maxScore) * 100) || 0,
    scores,
  };
}

/**
 * Generate performance report for student
 */
export async function generatePerformanceReport(studentId: string, days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch all completed interviews
    const { data: interviews, error: interviewError } = await supabase
      .from('interviews')
      .select('*')
      .eq('student_id', studentId)
      .eq('status', 'completed')
      .gte('completed_at', startDate.toISOString())
      .order('completed_at', { ascending: false });

    if (interviewError) throw interviewError;

    const report = {
      studentId,
      period: { startDate: startDate.toISOString(), endDate: new Date().toISOString() },
      totalInterviews: interviews?.length || 0,
      completedInterviews: interviews?.filter(i => i.status === 'completed').length || 0,
      averageScore: 0,
      scoresByType: {} as { [key: string]: number },
      scoresByCategory: {} as { [key: string]: number },
      improvementRate: 0,
      performanceTrend: [] as any[],
      strengthCategories: [] as string[],
      weakCategories: [] as string[],
      passRate: 0,
    };

    if (!interviews || interviews.length === 0) {
      return report;
    }

    // Calculate scores by type
    const scoresByType: { [key: string]: { sum: number; count: number } } = {};
    const allScores: number[] = [];

    for (const interview of interviews) {
      const score = interview.final_score || 0;
      allScores.push(score);

      if (!scoresByType[interview.interview_type]) {
        scoresByType[interview.interview_type] = { sum: 0, count: 0 };
      }
      scoresByType[interview.interview_type].sum += score;
      scoresByType[interview.interview_type].count += 1;
    }

    // Calculate average scores
    for (const [type, data] of Object.entries(scoresByType)) {
      report.scoresByType[type] = Math.round((data.sum / data.count) * 100) / 100;
    }

    report.averageScore = Math.round(
      (allScores.reduce((a, b) => a + b, 0) / allScores.length) * 100
    ) / 100;

    // Calculate improvement rate
    if (allScores.length >= 2) {
      const firstScore = allScores[allScores.length - 1];
      const lastScore = allScores[0];
      report.improvementRate =
        Math.round(((lastScore - firstScore) / firstScore) * 100 * 100) / 100;
    }

    // Calculate pass rate
    const passThreshold = INTERVIEW_PREP_CONFIG.BENCHMARKS.pass_threshold * 100;
    const passCount = allScores.filter(s => s >= passThreshold).length;
    report.passRate = Math.round((passCount / allScores.length) * 100);

    // Performance trend
    report.performanceTrend = interviews
      .map(i => ({
        date: i.completed_at,
        score: i.final_score,
        type: i.interview_type,
      }))
      .reverse();

    return report;
  } catch (error) {
    console.error('Error generating performance report:', error);
    throw error;
  }
}

/**
 * Provide AI-generated feedback based on interview performance
 */
export function generateAutoFeedback(
  score: number,
  responses: any[],
  rubricScores: any
): {
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  rating: string;
} {
  const percentage = score * 100;
  const strengths: string[] = [];
  const improvements: string[] = [];
  const suggestions: string[] = [];

  // Analyze rubric scores
  for (const [criterion, data] of Object.entries(rubricScores.scores || {})) {
    const { score: criterionScore, weight } = data as any;
    if (criterionScore >= 4) {
      strengths.push(
        `Strong performance in ${criterion.replace(/_/g, ' ')}`
      );
    } else if (criterionScore <= 2) {
      improvements.push(
        `Focus on improving ${criterion.replace(/_/g, ' ')}`
      );
      suggestions.push(`Practice and review ${criterion.replace(/_/g, ' ')} skills`);
    }
  }

  // Performance-based suggestions
  if (percentage >= 90) {
    suggestions.push('Excellent performance! Consider advanced topics.');
    suggestions.push('Share your expertise with peer learners.');
  } else if (percentage >= 75) {
    suggestions.push('Good foundation. Now focus on edge cases and optimization.');
    suggestions.push('Practice complex problem scenarios.');
  } else if (percentage >= 60) {
    suggestions.push('Strengthen fundamentals before progressing.');
    suggestions.push('Review core concepts and practice similar problems.');
  } else {
    suggestions.push('Seek additional tutoring support.');
    suggestions.push('Start with beginner level problems.');
  }

  let rating = 'Average';
  if (percentage >= INTERVIEW_PREP_CONFIG.BENCHMARKS.high_distinction_threshold * 100) {
    rating = 'Exceptional';
  } else if (percentage >= INTERVIEW_PREP_CONFIG.BENCHMARKS.distinction_threshold * 100) {
    rating = 'Excellent';
  } else if (percentage >= INTERVIEW_PREP_CONFIG.BENCHMARKS.good_score * 100) {
    rating = 'Good';
  } else if (percentage >= INTERVIEW_PREP_CONFIG.BENCHMARKS.average_score * 100) {
    rating = 'Average';
  } else if (percentage >= INTERVIEW_PREP_CONFIG.BENCHMARKS.poor_score * 100) {
    rating = 'Below Average';
  } else {
    rating = 'Poor';
  }

  return { strengths, improvements, suggestions, rating };
}

/**
 * Calculate category strengths and weaknesses
 */
export function analyzePerformanceByCategory(
  interviews: any[]
): {
  strengths: { [key: string]: number };
  weaknesses: { [key: string]: number };
} {
  const categoryScores: { [key: string]: number[] } = {};

  for (const interview of interviews) {
    const categories = interview.question_categories || [];
    const score = interview.final_score || 0;

    for (const category of categories) {
      if (!categoryScores[category]) {
        categoryScores[category] = [];
      }
      categoryScores[category].push(score);
    }
  }

  const averages: { [key: string]: number } = {};
  for (const [category, scores] of Object.entries(categoryScores)) {
    averages[category] =
      Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
  }

  // Sort by score
  const sorted = Object.entries(averages).sort((a, b) => b[1] - a[1]);
  const strengths = Object.fromEntries(sorted.slice(0, Math.ceil(sorted.length / 2)));
  const weaknesses = Object.fromEntries(sorted.slice(Math.ceil(sorted.length / 2)));

  return { strengths, weaknesses };
}

/**
 * Check if interview meets passing criteria
 */
export function checkPassStatus(
  score: number,
  criteria?: { threshold?: number; categoryThresholds?: { [key: string]: number } }
): boolean {
  const threshold = criteria?.threshold || INTERVIEW_PREP_CONFIG.BENCHMARKS.pass_threshold;
  return score >= threshold;
}

/**
 * Calculate time management metrics
 */
export function calculateTimeMetrics(
  questions: any[],
  responses: any[]
): {
  totalTimeSpent: number;
  averageTimePerQuestion: number;
  timeAllocation: { [key: string]: { spent: number; allocated: number } };
  efficiency: number;
} {
  let totalTime = 0;
  const timePerQuestion: { [key: string]: number } = {};

  for (const response of responses) {
    const timeSpent = response.time_spent_seconds || 0;
    totalTime += timeSpent;
    timePerQuestion[response.question_id] = timeSpent;
  }

  const averageTime = totalTime / (responses.length || 1);
  const allocation: { [key: string]: { spent: number; allocated: number } } = {};

  for (const question of questions) {
    allocation[question.id] = {
      spent: timePerQuestion[question.id] || 0,
      allocated: question.time_limit_seconds || 60,
    };
  }

  // Calculate efficiency (score based on time management)
  let efficiency = 100;
  for (const [, data] of Object.entries(allocation)) {
    if (data.spent > data.allocated) {
      efficiency -= Math.min(20, ((data.spent - data.allocated) / data.allocated) * 10);
    }
  }
  efficiency = Math.max(0, efficiency);

  return {
    totalTimeSpent: Math.round(totalTime),
    averageTimePerQuestion: Math.round(averageTime),
    timeAllocation: allocation,
    efficiency: Math.round(efficiency),
  };
}

/**
 * Get interview recommendations based on performance
 */
export async function getNextStepRecommendations(
  studentId: string
): Promise<{
  recommendedCategories: string[];
  recommendedDifficulty: string;
  focusAreas: string[];
  customizations: any;
}> {
  try {
    // Get recent performance
    const { data: recentInterviews } = await supabase
      .from('interviews')
      .select('*')
      .eq('student_id', studentId)
      .order('completed_at', { ascending: false })
      .limit(5);

    if (!recentInterviews || recentInterviews.length === 0) {
      return {
        recommendedCategories: ['arrays_strings', 'linked_lists'],
        recommendedDifficulty: 'beginner',
        focusAreas: [],
        customizations: {},
      };
    }

    const { strengths, weaknesses } = analyzePerformanceByCategory(recentInterviews);
    const avgScore = recentInterviews.reduce((sum, i) => sum + (i.final_score || 0), 0) /
      recentInterviews.length;

    let difficulty = 'beginner';
    if (avgScore >= INTERVIEW_PREP_CONFIG.BENCHMARKS.good_score) {
      difficulty = 'advanced';
    } else if (avgScore >= INTERVIEW_PREP_CONFIG.BENCHMARKS.average_score) {
      difficulty = 'intermediate';
    }

    const weaknessCategories = Object.keys(weaknesses).slice(0, 3);
    const strengthCategories = Object.keys(strengths).slice(0, 2);

    return {
      recommendedCategories: [...weaknessCategories, ...strengthCategories],
      recommendedDifficulty: difficulty,
      focusAreas: weaknessCategories,
      customizations: {
        emphasizeCategories: weaknessCategories,
        avoidCategories: [],
        includeStrengthReinforcement: true,
      },
    };
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
}

/**
 * Save interview to database
 */
export async function saveInterviewRecord(
  interviewData: any
): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('interviews')
      .insert({
        ...interviewData,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error('Error saving interview record:', error);
    throw error;
  }
}

/**
 * Update interview status
 */
export async function updateInterviewStatus(
  interviewId: string,
  status: string,
  additionalData?: any
) {
  try {
    const updateData = {
      status,
      ...additionalData,
    };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('interviews')
      .update(updateData)
      .eq('id', interviewId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating interview status:', error);
    throw error;
  }
}

/**
 * Format interview date for display
 */
export function formatInterviewDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get interviewer availability for given date range
 */
export async function getAvailableTutors(
  startDate: string,
  endDate: string,
  interviewType: string
): Promise<any[]> {
  try {
    // Get tutors qualified for interview type
    const { data: tutors, error } = await supabase
      .from('tutors')
      .select('*')
      .contains('specializations', [interviewType])
      .eq('active', true);

    if (error) throw error;

    // Filter by availability
    const availableTutors = [];
    for (const tutor of tutors || []) {
      const conflicts = await supabase
        .from('interviews')
        .select('*')
        .eq('tutor_id', tutor.id)
        .eq('status', 'scheduled')
        .gte('scheduled_time', startDate)
        .lt('scheduled_time', endDate);

      if (!conflicts.error && conflicts.data?.length === 0) {
        availableTutors.push(tutor);
      }
    }

    return availableTutors;
  } catch (error) {
    console.error('Error getting available tutors:', error);
    throw error;
  }
}

/**
 * Calculate streak and consistency metrics
 */
export function calculateConsistencyMetrics(interviews: any[]): {
  currentStreak: number;
  longestStreak: number;
  totalPassed: number;
  consistencyScore: number;
} {
  const passThreshold = INTERVIEW_PREP_CONFIG.BENCHMARKS.pass_threshold * 100;
  const sortedInterviews = interviews.sort(
    (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let totalPassed = 0;

  for (const interview of sortedInterviews) {
    const isPassed = (interview.final_score || 0) >= passThreshold;
    if (isPassed) {
      tempStreak++;
      totalPassed++;
    } else {
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      tempStreak = 0;
    }
  }

  currentStreak = tempStreak;
  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
  }

  const consistencyScore = Math.round(
    ((totalPassed / sortedInterviews.length) * 100 +
      (currentStreak / Math.max(1, longestStreak)) * 100) /
      2
  );

  return { currentStreak, longestStreak, totalPassed, consistencyScore };
}
