// Advanced Reporting System Configuration

export const REPORTING_CONFIG = {
  // ============ REPORT TYPES ============
  REPORT_TYPES: {
    STUDENT_PERFORMANCE: 'student_performance',
    COURSE_ANALYTICS: 'course_analytics',
    REVENUE_ANALYSIS: 'revenue_analysis',
    AFFILIATE_PERFORMANCE: 'affiliate_performance',
    USER_ENGAGEMENT: 'user_engagement',
    CONTENT_POPULARITY: 'content_popularity',
    LICENSE_USAGE: 'license_usage',
    PAYMENT_SUMMARY: 'payment_summary',
    LEARNER_PROGRESSION: 'learner_progression',
    INSTRUCTOR_EFFECTIVENESS: 'instructor_effectiveness',
    CUSTOM: 'custom',
  },

  // ============ REPORT SUBTYPES ============
  REPORT_SUBTYPES: {
    student_performance: [
      'overall_scores',
      'course_completion_rates',
      'quiz_performance',
      'progress_timeline',
      'learning_velocity',
      'skill_mastery',
    ],
    course_analytics: [
      'enrollment_trends',
      'completion_rates',
      'engagement_metrics',
      'content_popularity',
      'quiz_difficulty_analysis',
      'student_feedback_summary',
    ],
    revenue_analysis: [
      'daily_revenue',
      'monthly_revenue',
      'revenue_by_source',
      'revenue_by_course',
      'revenue_forecast',
      'churn_analysis',
    ],
    affiliate_performance: [
      'top_performers',
      'commission_payouts',
      'referral_trends',
      'fraud_detection',
      'tier_distribution',
      'seasonal_performance',
    ],
    user_engagement: [
      'daily_active_users',
      'session_duration',
      'feature_usage',
      'retention_cohorts',
      'churn_prediction',
      'user_lifecycle',
    ],
  },

  // ============ EXPORT FORMATS ============
  EXPORT_FORMATS: {
    PDF: 'pdf',
    CSV: 'csv',
    XLSX: 'xlsx',
    JSON: 'json',
    POWERPOINT: 'pptx',
    EMAIL: 'email',
  },

  // ============ VISUALIZATION TYPES ============
  VISUALIZATION_TYPES: {
    LINE_CHART: 'line',
    BAR_CHART: 'bar',
    AREA_CHART: 'area',
    PIE_CHART: 'pie',
    DONUT_CHART: 'donut',
    SCATTER_PLOT: 'scatter',
    HEATMAP: 'heatmap',
    HISTOGRAM: 'histogram',
    GAUGE: 'gauge',
    TABLE: 'table',
    METRIC_CARD: 'metric_card',
    WATERFALL: 'waterfall',
    FUNNEL: 'funnel',
  },

  // ============ TIME PERIODS ============
  TIME_PERIODS: {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    YEARLY: 'yearly',
    CUSTOM: 'custom',
  },

  // ============ DATE RANGE PRESETS ============
  DATE_RANGES: {
    today: { label: 'Today', days: 1 },
    yesterday: { label: 'Yesterday', days: 1, offset: -1 },
    last_7_days: { label: 'Last 7 Days', days: 7 },
    last_30_days: { label: 'Last 30 Days', days: 30 },
    last_90_days: { label: 'Last 90 Days', days: 90 },
    last_6_months: { label: 'Last 6 Months', days: 180 },
    last_year: { label: 'Last 12 Months', days: 365 },
    this_month: { label: 'This Month', type: 'month' },
    last_month: { label: 'Last Month', type: 'month', offset: -1 },
    this_quarter: { label: 'This Quarter', type: 'quarter' },
    last_quarter: { label: 'Last Quarter', type: 'quarter', offset: -1 },
    this_year: { label: 'This Year', type: 'year' },
    last_year_full: { label: 'Last 12 Months', type: 'year', offset: -1 },
    ytd: { label: 'Year to Date', type: 'ytd' },
  },

  // ============ AGGREGATION FUNCTIONS ============
  AGGREGATIONS: {
    SUM: 'sum',
    AVG: 'average',
    MIN: 'minimum',
    MAX: 'maximum',
    COUNT: 'count',
    DISTINCT: 'distinct',
    MEDIAN: 'median',
    STDDEV: 'stddev',
    PERCENTILE: 'percentile',
  },

  // ============ COMPARISON MODES ============
  COMPARISON_MODES: {
    YEAR_OVER_YEAR: 'yoy',
    MONTH_OVER_MONTH: 'mom',
    WEEK_OVER_WEEK: 'wow',
    PERIOD_TO_PERIOD: 'p2p',
    NONE: 'none',
  },

  // ============ SEGMENTATION OPTIONS ============
  SEGMENTS: {
    BY_COURSE: 'course_id',
    BY_INSTRUCTOR: 'instructor_id',
    BY_USER_TYPE: 'user_type', // 'student', 'instructor', 'admin'
    BY_LICENSE_TIER: 'license_tier', // 'personal', 'team', 'institution'
    BY_COUNTRY: 'country',
    BY_REGION: 'region',
    BY_COHORT: 'cohort',
    BY_SUBSCRIPTION: 'subscription_status',
    BY_PAYMENT_METHOD: 'payment_method',
    BY_AFFILIATE_TIER: 'affiliate_tier',
  },

  // ============ FILTERS ============
  FILTERS: {
    MIN_ENGAGEMENT_THRESHOLD: 5,
    MIN_COURSE_DURATION_MINUTES: 30,
    MIN_QUIZ_ATTEMPTS: 3,
    MAX_CHURN_PREDICTION_SCORE: 100,
    RETENTION_WINDOW_DAYS: 30,
    COHORT_SIZE_MINIMUM: 10,
  },

  // ============ PREDICTIVE ANALYTICS ============
  PREDICTIVE_MODELS: {
    CHURN_PREDICTION: 'churn_prediction',
    REVENUE_FORECAST: 'revenue_forecast',
    ENROLLMENT_TREND: 'enrollment_trend',
    CONTENT_RECOMMENDATION: 'content_recommendation',
    LEARNING_TIME_ESTIMATE: 'learning_time_estimate',
  },

  // ============ REPORT PERMISSIONS ============
  PERMISSIONS: {
    viewer: ['read'], // View only
    editor: ['read', 'edit'], // View and edit own reports
    manager: ['read', 'edit', 'delete', 'share'], // Full team control
    admin: ['read', 'edit', 'delete', 'share', 'export', 'schedule', 'approve'], // Full system control
  },

  // ============ SCHEDULING ============
  SCHEDULES: {
    ONCE: 'once',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    YEARLY: 'yearly',
  },

  SCHEDULE_TIMES: {
    DAILY: ['09:00', '12:00', '15:00', '18:00', '21:00'],
    WEEKLY: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    MONTHLY: [1, 5, 10, 15, 20, 25],
  },

  // ============ REPORT TEMPLATES ============
  TEMPLATES: {
    EXECUTIVE_SUMMARY: {
      name: 'Executive Summary',
      description: 'High-level overview of key metrics',
      sections: ['kpis', 'trends', 'alerts', 'forecast'],
      defaultVisualizations: [
        'metric_card',
        'line_chart',
        'bar_chart',
        'gauge',
      ],
    },
    OPERATIONAL_DASHBOARD: {
      name: 'Operational Dashboard',
      description: 'Detailed operational metrics',
      sections: ['engagement', 'performance', 'content', 'users'],
      defaultVisualizations: [
        'table',
        'line_chart',
        'heatmap',
        'scatter_plot',
      ],
    },
    FINANCIAL_REPORT: {
      name: 'Financial Report',
      description: 'Revenue, payments, and financial analysis',
      sections: ['revenue', 'payments', 'payouts', 'forecast'],
      defaultVisualizations: [
        'area_chart',
        'waterfall',
        'pie_chart',
        'gauge',
      ],
    },
    STUDENT_PERFORMANCE: {
      name: 'Student Performance Report',
      description: 'Individual or cohort performance analysis',
      sections: ['overview', 'progress', 'assessments', 'recommendations'],
      defaultVisualizations: [
        'metric_card',
        'line_chart',
        'histogram',
        'table',
      ],
    },
    COURSE_ANALYTICS: {
      name: 'Course Analytics Report',
      description: 'Detailed course performance metrics',
      sections: ['enrollment', 'engagement', 'completion', 'feedback'],
      defaultVisualizations: [
        'funnel',
        'heatmap',
        'bar_chart',
        'pie_chart',
      ],
    },
    AFFILIATE_COMMISSION: {
      name: 'Affiliate Commission Report',
      description: 'Affiliate earnings, payouts, and fraud detection',
      sections: ['earnings', 'payouts', 'fraud', 'leaderboard'],
      defaultVisualizations: [
        'table',
        'bar_chart',
        'pie_chart',
        'gauge',
      ],
    },
  },

  // ============ ALERT CONDITIONS ============
  ALERT_CONDITIONS: {
    REVENUE_DROP: {
      metric: 'revenue',
      operator: 'decreased_by',
      threshold_percent: 20,
      severity: 'high',
    },
    HIGH_CHURN: {
      metric: 'churn_rate',
      operator: 'exceeds',
      threshold_percent: 5,
      severity: 'high',
    },
    LOW_ENGAGEMENT: {
      metric: 'engagement_rate',
      operator: 'below',
      threshold_percent: 30,
      severity: 'medium',
    },
    LOW_COMPLETION_RATE: {
      metric: 'completion_rate',
      operator: 'below',
      threshold_percent: 40,
      severity: 'medium',
    },
    HIGH_FRAUD_SCORE: {
      metric: 'affiliate_fraud_score',
      operator: 'exceeds',
      threshold: 70,
      severity: 'critical',
    },
  },

  // ============ EXPORT OPTIONS ============
  EXPORT_OPTIONS: {
    PDF: {
      pageSize: 'A4',
      orientation: 'portrait',
      includeCharts: true,
      includeData: true,
      includeMetadata: true,
    },
    CSV: {
      includeHeaders: true,
      delimiter: ',',
      encoding: 'utf-8',
      dateFormat: 'YYYY-MM-DD',
    },
    XLSX: {
      includeHeaders: true,
      frozen_rows: 1,
      autoWidth: true,
      dateFormat: 'YYYY-MM-DD',
    },
    JSON: {
      pretty: true,
      includeMetadata: true,
      nested: false,
    },
  },

  // ============ STORAGE & LIMITS ============
  LIMITS: {
    MAX_REPORT_NAME_LENGTH: 255,
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_CUSTOM_QUERY_LENGTH: 10000,
    MAX_DATA_POINTS_IN_VISUALIZATION: 10000,
    MAX_EXPORT_RECORDS: 100000,
    MAX_SCHEDULED_REPORTS_PER_USER: 50,
    REPORT_RETENTION_DAYS: 365,
    MAX_CONCURRENT_EXPORTS: 5,
  },

  // ============ PERFORMANCE TUNING ============
  CACHING: {
    REPORT_CACHE_TTL: 3600, // 1 hour in seconds
    METRIC_CACHE_TTL: 1800, // 30 minutes
    FORECAST_CACHE_TTL: 86400, // 1 day
    AGGREGATION_CACHE_TTL: 7200, // 2 hours
  },

  // ============ PREDICTIVE ANALYTICS MODELS ============
  ML_CONFIG: {
    CHURN_PREDICTION: {
      lookback_days: 90,
      prediction_window_days: 30,
      min_data_points: 30,
      confidence_threshold: 0.7,
    },
    REVENUE_FORECAST: {
      lookback_days: 180,
      forecast_days: 90,
      min_data_points: 60,
      method: 'arima', // or 'exponential_smoothing', 'linear_regression'
    },
    ENROLLMENT_TREND: {
      lookback_days: 365,
      forecast_days: 180,
      min_data_points: 90,
      seasonality: true,
    },
    LEARNING_TIME_ESTIMATE: {
      min_samples: 50,
      percentile: 75, // 75th percentile learning time
      variance_factor: 1.2,
    },
  },

  // ============ FEATURE FLAGS ============
  FEATURES: {
    PREDICTIVE_ANALYTICS_ENABLED: true,
    SCHEDULED_REPORTS_ENABLED: true,
    CUSTOM_REPORTS_ENABLED: true,
    REPORT_SHARING_ENABLED: true,
    EXPORT_PDF_ENABLED: true,
    EXPORT_XLSX_ENABLED: true,
    EXPORT_EMAIL_ENABLED: true,
    ALERTS_ENABLED: true,
    COMPARISON_ANALYSIS_ENABLED: true,
    SEGMENTATION_ENABLED: true,
  },

  // ============ EMAIL TEMPLATES FOR REPORTS ============
  EMAIL_TEMPLATES: {
    REPORT_READY: 'report_ready',
    SCHEDULED_REPORT: 'scheduled_report',
    REPORT_ERROR: 'report_error',
    ALERT_NOTIFICATION: 'alert_notification',
  },

  // ============ DEFAULT VALUES ============
  DEFAULTS: {
    ROWS_PER_PAGE: 50,
    DEFAULT_TIME_PERIOD: 'monthly',
    DEFAULT_DATE_RANGE: 'last_30_days',
    DEFAULT_AGGREGATION: 'sum',
    DEFAULT_COMPARISON_MODE: 'none',
    DEFAULT_VISUALIZATION: 'line_chart',
    AUTO_REFRESH_INTERVAL: 300000, // 5 minutes in ms
    REPORT_GENERATION_TIMEOUT: 300000, // 5 minutes for large reports
  },

  // ============ METRIC DEFINITIONS ============
  METRICS: {
    // User Metrics
    DAILY_ACTIVE_USERS: {
      name: 'Daily Active Users',
      type: 'count',
      aggregation: 'distinct',
      description: 'Number of unique users active per day',
    },
    MONTHLY_ACTIVE_USERS: {
      name: 'Monthly Active Users',
      type: 'count',
      aggregation: 'distinct',
      description: 'Number of unique users active per month',
    },

    // Engagement Metrics
    AVERAGE_SESSION_DURATION: {
      name: 'Avg Session Duration',
      unit: 'minutes',
      type: 'time',
      aggregation: 'average',
    },
    ENGAGEMENT_RATE: {
      name: 'Engagement Rate',
      unit: 'percent',
      type: 'percentage',
      aggregation: 'average',
    },

    // Revenue Metrics
    DAILY_REVENUE: {
      name: 'Daily Revenue',
      unit: 'BDT',
      type: 'currency',
      aggregation: 'sum',
    },
    MONTHLY_RECURRING_REVENUE: {
      name: 'Monthly Recurring Revenue',
      unit: 'BDT',
      type: 'currency',
      aggregation: 'sum',
    },
    AVERAGE_ORDER_VALUE: {
      name: 'Average Order Value',
      unit: 'BDT',
      type: 'currency',
      aggregation: 'average',
    },

    // Course Metrics
    COURSE_COMPLETION_RATE: {
      name: 'Completion Rate',
      unit: 'percent',
      type: 'percentage',
      aggregation: 'average',
    },
    AVERAGE_QUIZ_SCORE: {
      name: 'Avg Quiz Score',
      unit: 'percent',
      type: 'percentage',
      aggregation: 'average',
    },
  },
};

export type ReportType = keyof typeof REPORTING_CONFIG.REPORT_TYPES;
export type ReportFormat = keyof typeof REPORTING_CONFIG.EXPORT_FORMATS;
export type VisualizationType = keyof typeof REPORTING_CONFIG.VISUALIZATION_TYPES;
export type TimePeriod = keyof typeof REPORTING_CONFIG.TIME_PERIODS;
