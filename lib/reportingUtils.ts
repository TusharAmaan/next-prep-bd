import { supabase } from '@/lib/supabaseClient';
import { REPORTING_CONFIG } from '@/lib/reportingConfig';
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subYears,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfQuarter,
  endOfQuarter,
  subQuarters,
} from 'date-fns';

// ============ REPORT GENERATION ============

export async function generateStudentPerformanceReport(
  userId: string,
  dateRange: string,
  subtype: string = 'overall_scores'
) {
  try {
    const dates = getDateRange(dateRange);

    // Fetch student data
    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (studentError) throw studentError;

    // Fetch course enrollments
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('course_enrollments')
      .select(`
        id,
        course_id,
        enrolled_at,
        completed_at,
        progress_percentage,
        courses (title, description)
      `)
      .eq('student_id', userId)
      .gte('enrolled_at', dates.startDate.toISOString())
      .lte('enrolled_at', dates.endDate.toISOString());

    if (enrollmentsError) throw enrollmentsError;

    // Fetch quiz scores
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quiz_attempts')
      .select('*, quizzes(title, course_id)')
      .eq('student_id', userId)
      .gte('attempted_at', dates.startDate.toISOString())
      .lte('attempted_at', dates.endDate.toISOString());

    if (quizzesError) throw quizzesError;

    // Calculate aggregations
    const totalEnrollments = enrollments?.length || 0;
    const completedCourses = enrollments?.filter((e) => e.completed_at)?.length || 0;
    const avgProgress = enrollments?.length
      ? (enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / enrollments.length)
      : 0;

    const avgQuizScore =
      quizzes?.length
        ? quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.length
        : 0;

    return {
      reportType: 'student_performance',
      subtype,
      studentId: userId,
      studentName: student?.full_name || 'Unknown',
      dateRange,
      generatedAt: new Date().toISOString(),
      metrics: {
        totalEnrollments,
        completedCourses,
        completionRate:
          totalEnrollments > 0
            ? ((completedCourses / totalEnrollments) * 100).toFixed(2)
            : 0,
        avgProgress: avgProgress.toFixed(2),
        totalQuizAttempts: quizzes?.length || 0,
        avgQuizScore: avgQuizScore.toFixed(2),
      },
      data: {
        enrollments: enrollments || [],
        quizzes: quizzes || [],
      },
    };
  } catch (error) {
    console.error('Error generating student performance report:', error);
    throw error;
  }
}

export async function generateCourseAnalyticsReport(
  courseId: string,
  dateRange: string,
  subtype: string = 'engagement_metrics'
) {
  try {
    const dates = getDateRange(dateRange);

    // Fetch course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError) throw courseError;

    // Fetch enrollment stats
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('course_enrollments')
      .select('*')
      .eq('course_id', courseId)
      .gte('enrolled_at', dates.startDate.toISOString())
      .lte('enrolled_at', dates.endDate.toISOString());

    if (enrollmentsError) throw enrollmentsError;

    // Calculate completion rate
    const totalEnrolled = enrollments?.length || 0;
    const completed = enrollments?.filter((e) => e.completed_at)?.length || 0;
    const completionRate = totalEnrolled > 0 ? (completed / totalEnrolled) * 100 : 0;

    // Fetch quiz data
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('course_id', courseId)
      .gte('attempted_at', dates.startDate.toISOString())
      .lte('attempted_at', dates.endDate.toISOString());

    if (quizzesError) throw quizzesError;

    const avgQuizScore =
      quizzes?.length
        ? (quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.length)
        : 0;

    return {
      reportType: 'course_analytics',
      subtype,
      courseId,
      courseName: course?.title || 'Unknown',
      dateRange,
      generatedAt: new Date().toISOString(),
      metrics: {
        totalEnrollments: totalEnrolled,
        completedStudents: completed,
        completionRate: completionRate.toFixed(2),
        avgProgressPerStudent:
          totalEnrolled > 0
            ? (
                enrollments?.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) /
                totalEnrolled
              ).toFixed(2)
            : 0,
        totalQuizAttempts: quizzes?.length || 0,
        avgQuizScore: avgQuizScore.toFixed(2),
        activeEnrollments: enrollments?.filter((e) => !e.completed_at)?.length || 0,
      },
      data: {
        enrollments: enrollments || [],
        quizAttempts: quizzes || [],
      },
    };
  } catch (error) {
    console.error('Error generating course analytics report:', error);
    throw error;
  }
}

export async function generateRevenueAnalysisReport(
  dateRange: string,
  subtype: string = 'daily_revenue'
) {
  try {
    const dates = getDateRange(dateRange);

    // Fetch payment transactions
    const { data: payments, error: paymentsError } = await supabase
      .from('payment_transactions')
      .select('*')
      .gte('created_at', dates.startDate.toISOString())
      .lte('created_at', dates.endDate.toISOString())
      .eq('status', 'completed');

    if (paymentsError) throw paymentsError;

    // Calculate metrics
    const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const transactionCount = payments?.length || 0;
    const avgTransactionValue = transactionCount > 0 ? totalRevenue / transactionCount : 0;

    // Group by payment method
    const revenueByMethod = groupBy(
      payments || [],
      'payment_method'
    ) as Record<string, any[]>;
    const revenueByMethodBreakdown: Record<string, number> = {};

    for (const [method, txns] of Object.entries(revenueByMethod)) {
      revenueByMethodBreakdown[method] = txns.reduce((sum, t) => sum + (t.amount || 0), 0);
    }

    return {
      reportType: 'revenue_analysis',
      subtype,
      dateRange,
      generatedAt: new Date().toISOString(),
      metrics: {
        totalRevenue: totalRevenue.toFixed(2),
        transactionCount,
        avgTransactionValue: avgTransactionValue.toFixed(2),
        revenueByMethod: revenueByMethodBreakdown,
        dailyAvgRevenue:
          dates.dayCount > 0
            ? (totalRevenue / dates.dayCount).toFixed(2)
            : 0,
      },
      data: {
        transactions: payments || [],
      },
    };
  } catch (error) {
    console.error('Error generating revenue analysis report:', error);
    throw error;
  }
}

// ============ DATE RANGE UTILITIES ============

export function getDateRange(rangeKey: string) {
  const now = new Date();
  let startDate: Date;
  let endDate = endOfDay(now);

  const preset = REPORTING_CONFIG.DATE_RANGES[rangeKey as keyof typeof REPORTING_CONFIG.DATE_RANGES];

  if (!preset) {
    // Default to last 30 days
    startDate = startOfDay(subDays(now, 30));
  } else if (preset.type === 'month') {
    startDate = startOfMonth(subMonths(now, preset.offset || 0));
    endDate = endOfMonth(subMonths(now, preset.offset || 0));
  } else if (preset.type === 'quarter') {
    startDate = startOfQuarter(subQuarters(now, preset.offset || 0));
    endDate = endOfQuarter(subQuarters(now, preset.offset || 0));
  } else if (preset.type === 'year') {
    startDate = startOfYear(subYears(now, preset.offset || 0));
    endDate = endOfYear(subYears(now, preset.offset || 0));
  } else if (preset.type === 'ytd') {
    startDate = startOfYear(now);
  } else {
    startDate = startOfDay(subDays(now, preset.days || 30));
  }

  const dayCount = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    startDate,
    endDate,
    dayCount,
    rangeLabel: preset?.label || 'Custom',
  };
}

// ============ DATA AGGREGATION ============

export function aggregateData(
  data: any[],
  aggregationType: string,
  field: string
): number {
  const values = data.map((d) => d[field]).filter((v) => v !== null && v !== undefined);

  if (values.length === 0) return 0;

  switch (aggregationType) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0);
    case 'average':
      return values.reduce((a, b) => a + b, 0) / values.length;
    case 'minimum':
      return Math.min(...values);
    case 'maximum':
      return Math.max(...values);
    case 'count':
      return values.length;
    case 'distinct':
      return new Set(values).size;
    case 'median':
      const sorted = values.sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    case 'stddev':
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const squaredDeviations = values.map((v) => Math.pow(v - avg, 2));
      const variance = squaredDeviations.reduce((a, b) => a + b, 0) / values.length;
      return Math.sqrt(variance);
    default:
      return values.reduce((a, b) => a + b, 0);
  }
}

// ============ SEGMENTATION ============

export function segmentData(
  data: any[],
  segmentKey: string
): Record<string, any[]> {
  return data.reduce((acc, item) => {
    const key = item[segmentKey] || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, any[]>);
}

// ============ TIME SERIES AGGREGATION ============

export function aggregateAsTimeSeries(
  data: any[],
  dateField: string,
  valueField: string,
  period: 'daily' | 'weekly' | 'monthly' = 'daily'
): Array<{ date: string; value: number }> {
  const grouped: Record<string, number[]> = {};

  data.forEach((item) => {
    const date = new Date(item[dateField]);
    let key: string;

    if (period === 'daily') {
      key = date.toISOString().split('T')[0];
    } else if (period === 'weekly') {
      const weekStart = startOfWeek(date);
      key = weekStart.toISOString().split('T')[0];
    } else if (period === 'monthly') {
      key = date.toISOString().slice(0, 7);
    }

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item[valueField]);
  });

  return Object.entries(grouped).map(([date, values]) => ({
    date,
    value: values.reduce((a, b) => a + b, 0) / values.length,
  }));
}

// ============ PREDICTIVE ANALYTICS ============

export function predictChurn(
  userData: any[],
  threshold: number = 0.7
): Array<{ userId: string; riskScore: number; risk: 'high' | 'medium' | 'low' }> {
  return userData.map((user) => {
    let riskScore = 0;

    // Factor 1: Days since last activity
    const lastActivityDays = Math.floor(
      (Date.now() - new Date(user.last_activity).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (lastActivityDays > 30) riskScore += 30;
    else if (lastActivityDays > 14) riskScore += 15;

    // Factor 2: Low engagement
    if ((user.session_count || 0) < 5) riskScore += 25;

    // Factor 3: Course completion rate
    if ((user.completion_rate || 0) < 0.3) riskScore += 25;

    // Factor 4: Infrequent logins
    const sessionFrequency = (user.session_count || 0) / Math.max(1, user.days_as_member || 1);
    if (sessionFrequency < 0.1) riskScore += 20;

    const risk: 'high' | 'medium' | 'low' =
      riskScore >= threshold * 100 ? 'high' : riskScore >= threshold * 70 ? 'medium' : 'low';

    return {
      userId: user.id,
      riskScore: Math.min(100, riskScore),
      risk,
    };
  });
}

export function forecastRevenue(
  historicalData: Array<{ date: string; revenue: number }>,
  forecastDays: number = 30
): Array<{ date: string; forecast: number; lower: number; upper: number }> {
  if (historicalData.length < 7) {
    console.warn('Insufficient data for revenue forecast');
    return [];
  }

  // Simple exponential smoothing
  const alpha = 0.3;
  let level = historicalData[0].revenue;
  const forecasts: Array<{ date: string; forecast: number; lower: number; upper: number }> = [];

  let lastDate = new Date(historicalData[historicalData.length - 1].date);

  for (let i = 0; i < forecastDays; i++) {
    // Update level
    if (i < historicalData.length) {
      level = alpha * historicalData[i].revenue + (1 - alpha) * level;
    }

    lastDate = new Date(lastDate.getTime() + 24 * 60 * 60 * 1000);

    // Calculate confidence interval (±20%)
    const forecast = level;
    forecasts.push({
      date: lastDate.toISOString().split('T')[0],
      forecast: Math.round(forecast),
      lower: Math.round(forecast * 0.8),
      upper: Math.round(forecast * 1.2),
    });
  }

  return forecasts;
}

// ============ EXPORT UTILITIES ============

export function formatDataForCSV(
  data: any[],
  columns?: string[]
): string {
  if (!data || data.length === 0) return '';

  const keys = columns || Object.keys(data[0]);
  const headers = keys.join(',');
  const rows = data.map((item) =>
    keys
      .map((key) => {
        const value = item[key];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      })
      .join(',')
  );

  return [headers, ...rows].join('\n');
}

export function formatDataForJSON(data: any[]): string {
  return JSON.stringify(data, null, 2);
}

export async function saveReportToDatabase(
  userId: string,
  reportName: string,
  reportType: string,
  reportData: any,
  format: string = 'json'
) {
  try {
    const { data, error } = await supabase
      .from('reports')
      .insert({
        user_id: userId,
        name: reportName,
        type: reportType,
        data: reportData,
        export_format: format,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving report:', error);
    throw error;
  }
}

// ============ HELPER FUNCTIONS ============

export function groupBy(array: any[], key: string): Record<string, any[]> {
  return array.reduce((acc, item) => {
    const groupKey = item[key] || 'unknown';
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, any[]>);
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function calculateGrowthRate(values: number[]): number {
  if (values.length < 2) return 0;
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  return ((lastValue - firstValue) / firstValue) * 100;
}

export function calculateCompoundGrowthRate(startValue: number, endValue: number, periods: number): number {
  if (startValue === 0 || periods === 0) return 0;
  return (Math.pow(endValue / startValue, 1 / periods) - 1) * 100;
}

export function detectOutliers(values: number[], stdDevMultiplier: number = 2): number[] {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return values.filter((v) => Math.abs(v - mean) > stdDevMultiplier * stdDev);
}

export function normalizeData(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  if (range === 0) return values.map(() => 0);

  return values.map((v) => (v - min) / range);
}

export function calculateTrendLine(
  points: Array<{ x: number; y: number }>
): {
  slope: number;
  intercept: number;
  r2: number;
} {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };

  const sumX = points.reduce((a, p) => a + p.x, 0);
  const sumY = points.reduce((a, p) => a + p.y, 0);
  const sumXY = points.reduce((a, p) => a + p.x * p.y, 0);
  const sumX2 = points.reduce((a, p) => a + p.x * p.x, 0);
  const sumY2 = points.reduce((a, p) => a + p.y * p.y, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const yMean = sumY / n;
  const ssRes = points.reduce((a, p) => a + Math.pow(p.y - (slope * p.x + intercept), 2), 0);
  const ssTot = points.reduce((a, p) => a + Math.pow(p.y - yMean, 2), 0);
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return { slope, intercept, r2 };
}
