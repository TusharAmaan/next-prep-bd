/**
 * Interview Prep Module Configuration
 * Comprehensive constants for interview preparation system
 */

export const INTERVIEW_PREP_CONFIG = {
  // ============ INTERVIEW TYPES ============
  INTERVIEW_TYPES: {
    technical: 'Technical',
    behavioral: 'Behavioral',
    case_study: 'Case Study',
    system_design: 'System Design',
    coding_challenge: 'Coding Challenge',
    communication: 'Communication',
    data_structures: 'Data Structures & Algorithms',
    problem_solving: 'Problem Solving',
    domain_specific: 'Domain Specific',
    hr_round: 'HR Round',
    group_discussion: 'Group Discussion',
    presentation: 'Presentation',
    custom: 'Custom',
  } as const,

  // ============ DIFFICULTY LEVELS ============
  DIFFICULTY_LEVELS: {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    expert: 'Expert',
    mixed: 'Mixed',
  } as const,

  // ============ QUESTION CATEGORIES ============
  QUESTION_CATEGORIES: {
    // Technical Categories
    arrays_strings: 'Arrays & Strings',
    linked_lists: 'Linked Lists',
    stacks_queues: 'Stacks & Queues',
    trees_graphs: 'Trees & Graphs',
    sorting_searching: 'Sorting & Searching',
    dynamic_programming: 'Dynamic Programming',
    bit_manipulation: 'Bit Manipulation',
    math_logic: 'Math & Logic',
    database_sql: 'Database & SQL',
    api_design: 'API Design',
    microservices: 'Microservices',
    distributed_systems: 'Distributed Systems',
    cloud_computing: 'Cloud Computing',
    security: 'Security',
    networking: 'Networking',
    
    // Behavioral Categories
    leadership: 'Leadership',
    teamwork: 'Teamwork',
    conflict_resolution: 'Conflict Resolution',
    time_management: 'Time Management',
    communication: 'Communication',
    creativity_innovation: 'Creativity & Innovation',
    adaptability: 'Adaptability',
    failure_recovery: 'Failure & Recovery',
    motivation_goals: 'Motivation & Goals',
    ethics_integrity: 'Ethics & Integrity',
    
    // HR Categories
    background_experience: 'Background & Experience',
    career_goals: 'Career Goals',
    company_culture_fit: 'Company Culture Fit',
    salary_expectations: 'Salary Expectations',
    availability: 'Availability',
    notice_period: 'Notice Period',
    remote_work: 'Remote Work',
    work_life_balance: 'Work-Life Balance',
  } as const,

  // ============ INTERVIEW FORMATS ============
  INTERVIEW_FORMATS: {
    mcq: 'Multiple Choice',
    coding: 'Coding Challenge',
    written: 'Written Response',
    verbal: 'Verbal Interview',
    take_home: 'Take Home Assignment',
    pair_programming: 'Pair Programming',
    code_review: 'Code Review',
    design_document: 'Design Document',
    presentation: 'Presentation',
    group_discussion: 'Group Discussion',
    whiteboard: 'Whiteboard',
    video_submission: 'Video Submission',
  } as const,

  // ============ DURATION TEMPLATES ============
  DURATION_TEMPLATES: {
    quick_session: { label: 'Quick (15 min)', minutes: 15 },
    short_session: { label: 'Short (30 min)', minutes: 30 },
    standard_session: { label: 'Standard (60 min)', minutes: 60 },
    extended_session: { label: 'Extended (90 min)', minutes: 90 },
    full_day: { label: 'Full Day (4 hours)', minutes: 240 },
    custom: { label: 'Custom', minutes: 0 },
  } as const,

  // ============ PERFORMANCE METRICS ============
  PERFORMANCE_METRICS: {
    // Technical Metrics
    time_to_solve: 'Time to Solve',
    code_quality: 'Code Quality',
    algorithm_efficiency: 'Algorithm Efficiency',
    edge_case_handling: 'Edge Case Handling',
    code_cleanliness: 'Code Cleanliness',
    error_handling: 'Error Handling',
    testing_approach: 'Testing Approach',
    design_patterns: 'Design Patterns',
    
    // Communication Metrics
    clarity: 'Clarity',
    articulation: 'Articulation',
    listening: 'Listening',
    presentation: 'Presentation',
    explanation: 'Explanation Quality',
    feedback_receptiveness: 'Feedback Receptiveness',
    
    // Problem Solving Metrics
    problem_understanding: 'Problem Understanding',
    logical_thinking: 'Logical Thinking',
    approach_selection: 'Approach Selection',
    optimization: 'Optimization',
    creativity: 'Creativity',
    completeness: 'Completeness',
    
    // Behavioral Metrics
    confidence: 'Confidence',
    professionalism: 'Professionalism',
    enthusiasm: 'Enthusiasm',
    adaptability: 'Adaptability',
    collaboration: 'Collaboration',
    accountability: 'Accountability',
  } as const,

  // ============ SCORING RUBRICS ============
  SCORING_RUBRICS: {
    technical_coding: {
      correctness: { weight: 25, description: 'Solution correctness and completeness' },
      efficiency: { weight: 20, description: 'Time and space complexity optimization' },
      code_quality: { weight: 20, description: 'Code readability and maintainability' },
      testing: { weight: 15, description: 'Edge case handling and testing' },
      communication: { weight: 20, description: 'Explanation and problem-solving approach' },
    },
    behavioral: {
      content: { weight: 30, description: 'Content quality and relevance of answer' },
      structure: { weight: 20, description: 'Logical structure and organization' },
      communication: { weight: 25, description: 'Clarity and articulation' },
      authenticity: { weight: 15, description: 'Genuine examples and experiences' },
      growth_mindset: { weight: 10, description: 'Demonstrates learning and growth' },
    },
    system_design: {
      requirements: { weight: 15, description: 'Understanding of requirements' },
      architecture: { weight: 25, description: 'System design and architecture' },
      scalability: { weight: 20, description: 'Scalability and performance' },
      trade_offs: { weight: 20, description: 'Trade-off analysis' },
      communication: { weight: 20, description: 'Explanation and reasoning' },
    },
  } as const,

  // ============ RATING SCALES ============
  RATING_SCALES: {
    five_point: {
      5: 'Excellent',
      4: 'Good',
      3: 'Average',
      2: 'Below Average',
      1: 'Poor',
    } as const,
    four_point: {
      4: 'Exceeds Expectations',
      3: 'Meets Expectations',
      2: 'Below Expectations',
      1: 'Does Not Meet Expectations',
    } as const,
    three_point: {
      3: 'Pass',
      2: 'Borderline',
      1: 'Fail',
    } as const,
    binary: {
      2: 'Pass',
      1: 'Fail',
    } as const,
  } as const,

  // ============ INTERVIEW STATUS ============
  INTERVIEW_STATUS: {
    draft: 'Draft',
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rescheduled: 'Rescheduled',
    no_show: 'No Show',
    expired: 'Expired',
  } as const,

  // ============ PARTICIPANT ROLES ============
  PARTICIPANT_ROLES: {
    interviewee: 'Interviewee',
    interviewer: 'Interviewer',
    observer: 'Observer',
    evaluator: 'Evaluator',
    admin: 'Admin',
  } as const,

  // ============ FEEDBACK TYPES ============
  FEEDBACK_TYPES: {
    strengths: 'Strengths',
    areas_for_improvement: 'Areas for Improvement',
    technical_feedback: 'Technical Feedback',
    soft_skills_feedback: 'Soft Skills Feedback',
    behavioral_feedback: 'Behavioral Feedback',
    actionable_suggestions: 'Actionable Suggestions',
  } as const,

  // ============ INTERVIEW TEMPLATES ============
  INTERVIEW_TEMPLATES: {
    quick_technical: {
      name: 'Quick Technical Assessment',
      type: 'technical',
      duration: 30,
      format: 'coding',
      categories: ['arrays_strings', 'linked_lists'],
      difficulty: 'intermediate',
      numQuestions: 2,
      timePerQuestion: 15,
    },
    full_day_loop: {
      name: 'Full Day Loop',
      type: 'mixed',
      duration: 240,
      format: 'mixed',
      difficulty: 'mixed',
      rounds: [
        { type: 'technical', duration: 60, format: 'coding', difficulty: 'intermediate' },
        { type: 'system_design', duration: 60, format: 'verbal', difficulty: 'advanced' },
        { type: 'behavioral', duration: 45, format: 'verbal', difficulty: 'intermediate' },
        { type: 'hr_round', duration: 30, format: 'verbal', difficulty: 'beginner' },
      ],
    },
    coding_challenge: {
      name: 'Coding Challenge',
      type: 'coding_challenge',
      duration: 60,
      format: 'coding',
      difficulty: 'advanced',
      categories: ['dynamic_programming', 'trees_graphs'],
      numQuestions: 1,
      canViewSolution: false,
    },
    behavioral_interview: {
      name: 'Behavioral Interview',
      type: 'behavioral',
      duration: 45,
      format: 'verbal',
      categories: ['teamwork', 'leadership', 'conflict_resolution'],
      numQuestions: 4,
      useCoreCompetencies: true,
    },
    system_design_interview: {
      name: 'System Design Interview',
      type: 'system_design',
      duration: 75,
      format: 'verbal',
      difficulty: 'advanced',
      numQuestions: 1,
      categories: ['api_design', 'distributed_systems', 'scalability'],
    },
  } as const,

  // ============ QUESTION DIFFICULTY DISTRIBUTION ============
  DIFFICULTY_DISTRIBUTION: {
    beginner: {
      easy: 0.8,
      medium: 0.2,
      hard: 0,
    },
    intermediate: {
      easy: 0.2,
      medium: 0.6,
      hard: 0.2,
    },
    advanced: {
      easy: 0,
      medium: 0.4,
      hard: 0.6,
    },
    expert: {
      easy: 0,
      medium: 0.2,
      hard: 0.8,
    },
    mixed: {
      easy: 0.33,
      medium: 0.33,
      hard: 0.34,
    },
  } as const,

  // ============ SCHEDULING ============
  SCHEDULING: {
    min_preparation_time_minutes: 60,
    max_concurrent_interviews: 5,
    min_time_between_interviews_minutes: 15,
    cancellation_notice_hours: 24,
    reschedule_notice_hours: 12,
    timezone_support: true,
    automated_reminders: true,
    reminder_times: ['24-hours', '1-hour', '15-minutes'],
  } as const,

  // ============ RECORDING & TRANSCRIPTION ============
  RECORDING: {
    enabled: true,
    record_audio: true,
    record_video: true,
    record_screen: true,
    auto_transcription: true,
    transcription_language: 'en-US',
    storage_days: 365,
    retention_policy: 'delete_after_365_days',
  } as const,

  // ============ NOTIFICATION SETTINGS ============
  NOTIFICATIONS: {
    interview_scheduled: true,
    interview_reminder: true,
    interview_started: true,
    interview_completed: true,
    feedback_received: true,
    score_released: true,
    rescheduling_request: true,
    cancellation_notice: true,
    invitation_sent: true,
  } as const,

  // ============ ANALYTICS & INSIGHTS ============
  ANALYTICS_METRICS: {
    success_rate: 'Success Rate',
    average_score: 'Average Score',
    improvement_rate: 'Improvement Rate',
    time_to_solve: 'Average Time to Solve',
    question_difficulty_preference: 'Question Difficulty Preference',
    strongest_categories: 'Strongest Categories',
    weakest_categories: 'Weakest Categories',
    performance_trend: 'Performance Trend',
    peer_comparison: 'Peer Comparison',
    pass_fail_rate: 'Pass/Fail Rate',
  } as const,

  // ============ INTERVIEW POOL MANAGEMENT ============
  POOL_MANAGEMENT: {
    question_types: {
      easy: { min: 100, reserve_percentage: 0.2 },
      medium: { min: 200, reserve_percentage: 0.25 },
      hard: { min: 150, reserve_percentage: 0.3 },
    },
    question_rotation: {
      enabled: true,
      recycle_after_days: 90,
      max_repeats_per_month: 1,
      exclude_recent_days: 30,
    },
    quality_control: {
      flagging_enabled: true,
      peer_review_required: true,
      validation_threshold: 0.8,
    },
  } as const,

  // ============ PERMISSIONS & ROLES ============
  PERMISSIONS: {
    student: {
      view_scheduled_interviews: true,
      take_practice_interviews: true,
      view_own_feedback: true,
      view_own_scores: true,
      reschedule_interview: true,
      submit_feedback: true,
      download_resources: true,
      access_practice_questions: true,
    },
    tutor: {
      create_interview: true,
      schedule_interview: true,
      conduct_interview: true,
      grade_interview: true,
      provide_feedback: true,
      view_student_performance: true,
      create_custom_questions: true,
      manage_question_pool: true,
      view_analytics: true,
      schedule_mock_interviews: true,
    },
    institution_admin: {
      manage_tutors: true,
      manage_students: true,
      view_institution_analytics: true,
      manage_interview_templates: true,
      schedule_campus_interviews: true,
      manage_question_library: true,
      configure_settings: true,
      manage_departments: true,
    },
    platform_admin: {
      manage_all_interviews: true,
      manage_all_users: true,
      manage_question_pool: true,
      system_configuration: true,
      analytics_access: true,
      audit_logs: true,
      backup_restore: true,
    },
  } as const,

  // ============ INTEGRATION SETTINGS ============
  INTEGRATIONS: {
    video_conferencing: {
      zoom: { enabled: true, pro_required: false },
      google_meet: { enabled: true, pro_required: false },
      microsoft_teams: { enabled: true, pro_required: false },
    },
    calendar_sync: {
      google_calendar: { enabled: true },
      outlook_calendar: { enabled: true },
      apple_calendar: { enabled: true },
    },
    messaging: {
      email_notifications: true,
      slack_notifications: true,
      sms_notifications: false,
    },
  } as const,

  // ============ LIMITS & QUOTAS ============
  LIMITS: {
    max_interview_name_length: 255,
    max_question_pool_size: 5000,
    max_questions_per_interview: 10,
    max_participants_per_interview: 50,
    max_feedback_length: 5000,
    max_daily_interviews_per_tutor: 10,
    max_monthly_interviews_per_student: 20,
    max_concurrent_recordings: 5,
    storage_limit_gb: 100,
    batch_import_max_questions: 1000,
  } as const,

  // ============ PERFORMANCE BENCHMARKS ============
  BENCHMARKS: {
    excellent_score: 0.9,
    good_score: 0.75,
    average_score: 0.6,
    poor_score: 0.4,
    pass_threshold: 0.6,
    distinction_threshold: 0.85,
    high_distinction_threshold: 0.95,
  } as const,

  // ============ CACHING ============
  CACHING: {
    interview_list_ttl: 3600, // 1 hour
    performance_analytics_ttl: 7200, // 2 hours
    question_pool_ttl: 86400, // 24 hours
    feedback_ttl: 1800, // 30 minutes
    user_performance_ttl: 3600, // 1 hour
  } as const,

  // ============ FEATURE FLAGS ============
  FEATURES: {
    mock_interviews: true,
    practice_questions: true,
    scheduled_interviews: true,
    live_feedback: true,
    ai_feedback: false,
    video_recording: true,
    transcription: true,
    group_interviews: true,
    peer_feedback: true,
    performance_analytics: true,
    custom_templates: true,
    question_bank_management: true,
    bulk_scheduling: true,
    automated_reminders: true,
    calendar_integration: true,
    skill_assessment: true,
    certification_program: false,
  } as const,

  // ============ DEFAULT VALUES ============
  DEFAULTS: {
    items_per_page: 10,
    timezone: 'UTC',
    date_format: 'YYYY-MM-DD',
    time_format: '24h',
    rating_scale: 'five_point',
    default_interview_duration: 60,
    default_difficulty: 'intermediate',
    default_format: 'verbal',
    auto_save_interval_seconds: 30,
    session_timeout_minutes: 120,
  } as const,

  // ============ ERROR MESSAGES ============
  ERROR_MESSAGES: {
    interview_not_found: 'Interview not found',
    invalid_format: 'Invalid interview format',
    scheduling_conflict: 'Scheduling conflict with existing interview',
    insufficient_permissions: 'Insufficient permissions to perform this action',
    past_interview_modification: 'Cannot modify past interviews',
    no_available_tutors: 'No available tutors for this time slot',
    question_pool_exhausted: 'Question pool exhausted for selected parameters',
    invalid_date_range: 'Invalid date range selected',
    recording_failed: 'Failed to record interview',
    transcription_failed: 'Failed to transcribe interview',
  } as const,

  // ============ SUCCESS MESSAGES ============
  SUCCESS_MESSAGES: {
    interview_scheduled: 'Interview scheduled successfully',
    interview_cancelled: 'Interview cancelled successfully',
    feedback_submitted: 'Feedback submitted successfully',
    assessment_completed: 'Assessment completed successfully',
    report_generated: 'Report generated successfully',
    tutors_assigned: 'Tutors assigned successfully',
  } as const,
} as const;

// Type definitions
export type InterviewType = keyof typeof INTERVIEW_PREP_CONFIG.INTERVIEW_TYPES;
export type DifficultyLevel = keyof typeof INTERVIEW_PREP_CONFIG.DIFFICULTY_LEVELS;
export type QuestionCategory = keyof typeof INTERVIEW_PREP_CONFIG.QUESTION_CATEGORIES;
export type InterviewFormat = keyof typeof INTERVIEW_PREP_CONFIG.INTERVIEW_FORMATS;
export type InterviewStatus = keyof typeof INTERVIEW_PREP_CONFIG.INTERVIEW_STATUS;
export type ParticipantRole = keyof typeof INTERVIEW_PREP_CONFIG.PARTICIPANT_ROLES;
export type FeedbackType = keyof typeof INTERVIEW_PREP_CONFIG.FEEDBACK_TYPES;
