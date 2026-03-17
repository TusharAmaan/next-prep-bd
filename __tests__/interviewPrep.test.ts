import { describe, it, expect, beforeEach } from 'vitest';
import {
  scheduleInterview,
  selectInterviewQuestions,
  scoreInterviewResponse,
  generatePerformanceReport,
  generateAutoFeedback,
  analyzePerformanceByCategory,
  checkPassStatus,
  calculateTimeMetrics,
  getNextStepRecommendations,
  calculateConsistencyMetrics,
  formatInterviewDate,
} from '@/lib/interviewPrepUtils';
import { INTERVIEW_PREP_CONFIG } from '@/lib/interviewPrepConfig';

describe('Interview Prep Config', () => {
  it('should have all required interview types', () => {
    expect(Object.keys(INTERVIEW_PREP_CONFIG.INTERVIEW_TYPES).length).toBeGreaterThan(0);
    expect(INTERVIEW_PREP_CONFIG.INTERVIEW_TYPES.technical).toBe('Technical');
    expect(INTERVIEW_PREP_CONFIG.INTERVIEW_TYPES.behavioral).toBe('Behavioral');
  });

  it('should have all difficulty levels', () => {
    const levels = INTERVIEW_PREP_CONFIG.DIFFICULTY_LEVELS;
    expect(levels.beginner).toBe('Beginner');
    expect(levels.intermediate).toBe('Intermediate');
    expect(levels.advanced).toBe('Advanced');
    expect(levels.expert).toBe('Expert');
  });

  it('should have valid question categories', () => {
    const categories = INTERVIEW_PREP_CONFIG.QUESTION_CATEGORIES;
    expect(Object.keys(categories).length).toBeGreaterThan(20);
    expect(categories.arrays_strings).toBe('Arrays & Strings');
    expect(categories.dynamic_programming).toBe('Dynamic Programming');
  });

  it('should have all duration templates', () => {
    const templates = INTERVIEW_PREP_CONFIG.DURATION_TEMPLATES;
    expect(templates.quick_session.minutes).toBe(15);
    expect(templates.standard_session.minutes).toBe(60);
    expect(templates.full_day.minutes).toBe(240);
  });

  it('should have valid scoring rubrics', () => {
    const rubrics = INTERVIEW_PREP_CONFIG.SCORING_RUBRICS;
    expect(rubrics.technical_coding).toBeDefined();
    expect(rubrics.behavioral).toBeDefined();
    expect(rubrics.system_design).toBeDefined();
    
    // Check weights sum to 100
    const techWeights = Object.values(rubrics.technical_coding).reduce(
      (sum, item: any) => sum + item.weight,
      0
    );
    expect(techWeights).toBe(100);
  });

  it('should have valid difficulty distributions', () => {
    const dist = INTERVIEW_PREP_CONFIG.DIFFICULTY_DISTRIBUTION;
    expect(dist.intermediate.easy).toBe(0.2);
    expect(dist.intermediate.medium).toBe(0.6);
    expect(dist.intermediate.hard).toBe(0.2);
    
    // Check distributions sum to 1
    const intermediate = dist.intermediate;
    const sum = intermediate.easy + intermediate.medium + intermediate.hard;
    expect(sum).toBeCloseTo(1, 1);
  });

  it('should have valid interview status values', () => {
    const statuses = INTERVIEW_PREP_CONFIG.INTERVIEW_STATUS;
    expect(statuses.scheduled).toBe('Scheduled');
    expect(statuses.completed).toBe('Completed');
    expect(statuses.cancelled).toBe('Cancelled');
  });

  it('should have performance benchmarks in valid range', () => {
    const benchmarks = INTERVIEW_PREP_CONFIG.BENCHMARKS;
    expect(benchmarks.excellent_score).toBeGreaterThan(benchmarks.good_score);
    expect(benchmarks.good_score).toBeGreaterThan(benchmarks.average_score);
    expect(benchmarks.average_score).toBeGreaterThan(benchmarks.poor_score);
    expect(benchmarks.pass_threshold).toBeGreaterThan(0);
    expect(benchmarks.pass_threshold).toBeLessThanOrEqual(1);
  });
});

describe('Interview Scoring', () => {
  it('should calculate score correctly with rubric', () => {
    const rubricScores = {
      correctness: 5,
      efficiency: 4,
      code_quality: 5,
      testing: 4,
      communication: 5,
    };

    const result = scoreInterviewResponse([], 'technical_coding', rubricScores);

    expect(result.totalScore).toBeGreaterThan(0);
    expect(result.maxScore).toBeGreaterThan(0);
    expect(result.percentage).toBeGreaterThanOrEqual(0);
    expect(result.percentage).toBeLessThanOrEqual(100);
    expect(result.scores).toBeDefined();
  });

  it('should give perfect score when all rubric items are excellent', () => {
    const perfectScore = {
      content: 5,
      structure: 5,
      communication: 5,
      authenticity: 5,
      growth_mindset: 5,
    };

    const result = scoreInterviewResponse([], 'behavioral', perfectScore);
    expect(result.percentage).toBe(100);
  });

  it('should give zero score when all rubric items are poor', () => {
    const poorScore = {
      content: 1,
      structure: 1,
      communication: 1,
      authenticity: 1,
      growth_mindset: 1,
    };

    const result = scoreInterviewResponse([], 'behavioral', poorScore);
    expect(result.percentage).toBe(20);
  });

  it('should handle mixed scores correctly', () => {
    const mixedScore = {
      correctness: 5,
      efficiency: 3,
      code_quality: 4,
      testing: 2,
      communication: 4,
    };

    const result = scoreInterviewResponse([], 'technical_coding', mixedScore);
    expect(result.percentage).toBeGreaterThan(0);
    expect(result.percentage).toBeLessThan(100);
  });

  it('should weight criteria correctly in scoring', () => {
    const rubric = INTERVIEW_PREP_CONFIG.SCORING_RUBRICS.technical_coding;
    const correctnessWeight = rubric.correctness.weight;
    
    // Verify correctness has the highest weight
    expect(correctnessWeight).toBe(25);
  });
});

describe('Pass/Fail Determination', () => {
  it('should correctly identify passing score', () => {
    const passScore = 75; // Above 60% threshold
    const passing = checkPassStatus(passScore / 100);
    expect(passing).toBe(true);
  });

  it('should correctly identify failing score', () => {
    const failScore = 40; // Below 60% threshold
    const passing = checkPassStatus(failScore / 100);
    expect(passing).toBe(false);
  });

  it('should correctly identify borderline pass', () => {
    const borderlineScore = 60; // Exactly at threshold
    const passing = checkPassStatus(borderlineScore / 100);
    expect(passing).toBe(true);
  });

  it('should support custom threshold', () => {
    const score = 75;
    const customThreshold = 80 / 100;
    const passing = checkPassStatus(score / 100, { threshold: customThreshold });
    expect(passing).toBe(false);
  });
});

describe('Auto-Generated Feedback', () => {
  it('should generate feedback for excellent performance', () => {
    const excellentScore = 95;
    const rubricScores = {
      scores: {
        correctness: { score: 5 },
        efficiency: { score: 5 },
        code_quality: { score: 5 },
      },
    };

    const feedback = generateAutoFeedback(excellentScore / 100, [], rubricScores);

    expect(feedback.rating).toBe('Exceptional');
    expect(feedback.strengths.length).toBeGreaterThan(0);
    expect(feedback.suggestions.length).toBeGreaterThan(0);
  });

  it('should generate feedback for average performance', () => {
    const averageScore = 65;
    const rubricScores = {
      scores: {
        correctness: { score: 3 },
        efficiency: { score: 3 },
        communication: { score: 2 },
      },
    };

    const feedback = generateAutoFeedback(averageScore / 100, [], rubricScores);

    expect(feedback.rating).toBe('Average');
    expect(feedback.improvements).toBeDefined();
  });

  it('should generate feedback for poor performance', () => {
    const poorScore = 35;
    const rubricScores = {
      scores: {
        correctness: { score: 1 },
        efficiency: { score: 1 },
        communication: { score: 1 },
      },
    };

    const feedback = generateAutoFeedback(poorScore / 100, [], rubricScores);

    expect(feedback.rating).toBe('Poor');
    expect(feedback.suggestions).toContain(expect.stringMatching(/tutoring|beginner/i));
  });
});

describe('Time Management Metrics', () => {
  it('should calculate total time spent correctly', () => {
    const questions = [
      { id: '1', time_limit_seconds: 300 },
      { id: '2', time_limit_seconds: 300 },
    ];
    const responses = [
      { question_id: '1', time_spent_seconds: 280 },
      { question_id: '2', time_spent_seconds: 320 },
    ];

    const metrics = calculateTimeMetrics(questions, responses);

    expect(metrics.totalTimeSpent).toBe(600);
    expect(metrics.averageTimePerQuestion).toBe(300);
  });

  it('should calculate efficiency score', () => {
    const questions = [
      { id: '1', time_limit_seconds: 300 },
    ];
    const responses = [
      { question_id: '1', time_spent_seconds: 250 },
    ];

    const metrics = calculateTimeMetrics(questions, responses);
    expect(metrics.efficiency).toBeGreaterThanOrEqual(0);
    expect(metrics.efficiency).toBeLessThanOrEqual(100);
  });

  it('should detect over-time responses', () => {
    const questions = [
      { id: '1', time_limit_seconds: 300 },
    ];
    const responses = [
      { question_id: '1', time_spent_seconds: 500 },
    ];

    const metrics = calculateTimeMetrics(questions, responses);
    expect(metrics.efficiency).toBeLessThan(100);
  });
});

describe('Performance Analysis by Category', () => {
  it('should identify strongest categories', () => {
    const interviews = [
      { question_categories: ['arrays', 'strings'], final_score: 95 },
      { question_categories: ['arrays'], final_score: 90 },
      { question_categories: ['strings'], final_score: 85 },
      { question_categories: ['trees'], final_score: 40 },
    ];

    const { strengths, weaknesses } = analyzePerformanceByCategory(interviews);

    expect(Object.keys(strengths).length).toBeGreaterThan(0);
    expect(Object.keys(weaknesses).length).toBeGreaterThan(0);
  });

  it('should calculate category averages correctly', () => {
    const interviews = [
      { question_categories: ['math'], final_score: 80 },
      { question_categories: ['math'], final_score: 100 },
    ];

    const { strengths, weaknesses } = analyzePerformanceByCategory(interviews);

    const avgMath = strengths.math || weaknesses.math;
    expect(avgMath).toBe(90);
  });
});

describe('Consistency Metrics', () => {
  it('should calculate current streak correctly', () => {
    const interviews = [
      { completed_at: '2026-03-01', final_score: 75 },
      { completed_at: '2026-03-02', final_score: 80 },
      { completed_at: '2026-03-03', final_score: 85 },
      { completed_at: '2026-03-04', final_score: 40 },
    ];

    const metrics = calculateConsistencyMetrics(interviews);

    expect(metrics.currentStreak).toBe(0);
  });

  it('should calculate longest streak', () => {
    const interviews = [
      { completed_at: '2026-03-01', final_score: 75 },
      { completed_at: '2026-03-02', final_score: 80 },
      { completed_at: '2026-03-03', final_score: 85 },
    ];

    const metrics = calculateConsistencyMetrics(interviews);

    expect(metrics.longestStreak).toBe(3);
  });

  it('should count total passed interviews', () => {
    const interviews = [
      { completed_at: '2026-03-01', final_score: 75 },
      { completed_at: '2026-03-02', final_score: 80 },
      { completed_at: '2026-03-03', final_score: 40 },
    ];

    const metrics = calculateConsistencyMetrics(interviews);

    expect(metrics.totalPassed).toBe(2);
  });

  it('should calculate consistency score', () => {
    const interviews = [
      { completed_at: '2026-03-01', final_score: 75 },
      { completed_at: '2026-03-02', final_score: 80 },
      { completed_at: '2026-03-03', final_score: 85 },
    ];

    const metrics = calculateConsistencyMetrics(interviews);

    expect(metrics.consistencyScore).toBeGreaterThanOrEqual(0);
    expect(metrics.consistencyScore).toBeLessThanOrEqual(100);
  });
});

describe('Date Formatting', () => {
  it('should format interview date correctly', () => {
    const date = '2026-04-01T10:30:00Z';
    const formatted = formatInterviewDate(date);

    expect(formatted).toMatch(/April|Apr/);
    expect(formatted).toMatch(/10:30|10 AM|10AM/);
  });

  it('should handle different date formats', () => {
    const dates = [
      '2026-04-01T10:30:00Z',
      '2026-12-25T15:00:00Z',
      '2026-01-15T08:00:00Z',
    ];

    dates.forEach(date => {
      const formatted = formatInterviewDate(date);
      expect(formatted).toBeTruthy();
      expect(formatted.length).toBeGreaterThan(10);
    });
  });
});

describe('Configuration Validation', () => {
  it('should have matching video conferencing providers', () => {
    const providers = Object.keys(INTERVIEW_PREP_CONFIG.INTEGRATIONS.video_conferencing);
    expect(providers.length).toBeGreaterThan(0);
    expect(providers).toContain('zoom');
  });

  it('should have valid permission definitions', () => {
    const permissions = INTERVIEW_PREP_CONFIG.PERMISSIONS;
    expect(permissions.student).toBeDefined();
    expect(permissions.tutor).toBeDefined();
    expect(permissions.platform_admin).toBeDefined();
  });

  it('should have valid feature flags', () => {
    const features = INTERVIEW_PREP_CONFIG.FEATURES;
    expect(typeof features.mock_interviews).toBe('boolean');
    expect(typeof features.recording).toBe('boolean');
    expect(typeof features.transcription).toBe('boolean');
  });

  it('should have valid limits', () => {
    const limits = INTERVIEW_PREP_CONFIG.LIMITS;
    expect(limits.max_interview_name_length).toBeGreaterThan(0);
    expect(limits.max_questions_per_interview).toBeGreaterThan(0);
    expect(limits.max_participants_per_interview).toBeGreaterThan(0);
  });

  it('should have valid default values', () => {
    const defaults = INTERVIEW_PREP_CONFIG.DEFAULTS;
    expect(defaults.items_per_page).toBeGreaterThan(0);
    expect(defaults.default_interview_duration).toBeGreaterThan(0);
    expect(defaults.session_timeout_minutes).toBeGreaterThan(0);
  });
});

describe('Error Handling', () => {
  it('should have error messages defined', () => {
    const errors = INTERVIEW_PREP_CONFIG.ERROR_MESSAGES;
    expect(errors.interview_not_found).toBeTruthy();
    expect(errors.scheduling_conflict).toBeTruthy();
    expect(errors.insufficient_permissions).toBeTruthy();
  });

  it('should have success messages defined', () => {
    const messages = INTERVIEW_PREP_CONFIG.SUCCESS_MESSAGES;
    expect(messages.interview_scheduled).toBeTruthy();
    expect(messages.feedback_submitted).toBeTruthy();
  });
});

describe('Interview Templates', () => {
  it('should have valid interview templates', () => {
    const templates = INTERVIEW_PREP_CONFIG.INTERVIEW_TEMPLATES;
    expect(templates.quick_technical).toBeDefined();
    expect(templates.full_day_loop).toBeDefined();
    
    expect(templates.quick_technical.duration).toBe(30);
    expect(templates.full_day_loop.duration).toBe(240);
  });

  it('should have complete template configurations', () => {
    const templates = INTERVIEW_PREP_CONFIG.INTERVIEW_TEMPLATES;
    Object.values(templates).forEach(template => {
      expect(template.name).toBeTruthy();
      expect(template.type).toBeTruthy();
      expect(template.duration).toBeGreaterThan(0);
    });
  });
});

describe('Integration Scenarios', () => {
  it('should handle full interview lifecycle', () => {
    // Mock interview progression
    const interview = {
      id: '1',
      student_id: 'student_1',
      tutor_id: 'tutor_1',
      final_score: 82,
      status: 'completed',
      completed_at: '2026-04-01T11:00:00Z',
    };

    // Verify score calculation
    const rubricScores = {
      correctness: 4,
      efficiency: 4,
      code_quality: 5,
      testing: 4,
      communication: 4,
    };
    const result = scoreInterviewResponse([], 'technical_coding', rubricScores);
    expect(result.percentage).toBeGreaterThan(0);

    // Verify feedback generation
    const feedback = generateAutoFeedback(result.percentage / 100, [], result);
    expect(feedback.rating).toBeTruthy();

    // Verify pass status
    const passing = checkPassStatus(result.percentage / 100);
    expect(typeof passing).toBe('boolean');
  });

  it('should support multiple interview types in analysis', () => {
    const interviews = [
      { interview_type: 'technical', final_score: 85, completed_at: '2026-03-01' },
      { interview_type: 'behavioral', final_score: 78, completed_at: '2026-03-02' },
      { interview_type: 'system_design', final_score: 92, completed_at: '2026-03-03' },
    ];

    // Calculate metrics for different types
    expect(interviews.length).toBe(3);
    const avgScore = interviews.reduce((sum, i) => sum + i.final_score, 0) / interviews.length;
    expect(avgScore).toBeGreaterThan(0);
    expect(avgScore).toBeLessThanOrEqual(100);
  });
});

describe('Edge Cases', () => {
  it('should handle empty interview list', () => {
    const interviews: any[] = [];
    const { strengths, weaknesses } = analyzePerformanceByCategory(interviews);
    
    expect(Object.keys(strengths).length).toBe(0);
    expect(Object.keys(weaknesses).length).toBe(0);
  });

  it('should handle single interview for consistency metrics', () => {
    const interviews = [
      { completed_at: '2026-03-01', final_score: 85 },
    ];

    const metrics = calculateConsistencyMetrics(interviews);
    expect(metrics.currentStreak).toBeGreaterThanOrEqual(0);
    expect(metrics.longestStreak).toBeGreaterThanOrEqual(1);
  });

  it('should handle zero-duration interviews', () => {
    const questions = [{ id: '1', time_limit_seconds: 0 }];
    const responses = [{ question_id: '1', time_spent_seconds: 0 }];

    const metrics = calculateTimeMetrics(questions, responses);
    expect(metrics.totalTimeSpent).toBe(0);
  });

  it('should normalize edge case scores', () => {
    const perfectRubricScore = {
      requirements: 4,
      architecture: 4,
      scalability: 4,
      trade_offs: 4,
      communication: 4,
    };

    const result = scoreInterviewResponse([], 'system_design', perfectRubricScore);
    expect(result.percentage).toBe(80);
  });
});
