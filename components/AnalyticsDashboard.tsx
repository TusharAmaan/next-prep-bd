'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  BookOpen,
  Target,
  Award,
  Activity,
  ArrowUp,
  LineChart,
  BarChart3,
  PieChart,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  userId: string;
  institutionId?: string;
  type?: 'user' | 'institution';
}

export function AnalyticsDashboard({
  userId,
  institutionId,
  type = 'user',
}: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        let endpoint = '';
        if (type === 'institution' && institutionId) {
          endpoint = `/api/analytics/institution?institutionId=${institutionId}&period=${selectedPeriod}`;
        } else {
          endpoint = `/api/analytics/user?userId=${userId}&type=all`;
        }

        const response = await fetch(endpoint);
        const data = await response.json();
        setAnalytics(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId, institutionId, type, selectedPeriod]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (type === 'user' && analytics) {
    return (
      <div className="space-y-6">
        {/* User Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Lessons */}
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">
                  Lessons Completed
                </p>
                <p className="text-3xl font-black text-blue-600">
                  {analytics.overview?.totalLessonsCompleted || 0}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </div>

          {/* Courses */}
          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">
                  Enrolled Courses
                </p>
                <p className="text-3xl font-black text-purple-600">
                  {analytics.overview?.enrolledCourses || 0}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {analytics.overview?.completedCourses || 0} completed
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600 opacity-20" />
            </div>
          </div>

          {/* Points */}
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">
                  Total Points
                </p>
                <p className="text-3xl font-black text-green-600">
                  {analytics.overview?.totalPointsEarned || 0}
                </p>
              </div>
              <Award className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </div>

          {/* Average Score */}
          <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">
                  Average Score
                </p>
                <p className="text-3xl font-black text-orange-600">
                  {analytics.overview?.averageScore || 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Performance by Subject */}
        {analytics.performance && Object.keys(analytics.performance).length > 0 && (
          <div className="p-6 bg-white rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5" /> Performance by Subject
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analytics.performance).map(([subject, data]: [string, any]) => (
                <div
                  key={subject}
                  className="p-4 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <p className="font-bold text-slate-900 text-sm mb-2">{subject}</p>
                  <div className="flex items-end gap-2">
                    <p className="text-2xl font-black text-blue-600">
                      {Math.round(data.average)}%
                    </p>
                    <p className="text-xs text-slate-500">
                      {data.scores?.length || 0} attempts
                    </p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${Math.round(data.average)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learning Trends */}
        {analytics.trends && (
          <div className="p-6 bg-white rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <LineChart className="w-5 h-5" /> Learning Trends
            </h3>
            <div className="flex items-end gap-2 h-40">
              {analytics.trends.map((month: any) => (
                <div key={month.month} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                    style={{
                      height: `${Math.max((month.activities / 30) * 100, 5)}px`,
                    }}
                  ></div>
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    {month.month}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {analytics.recommendations?.suggestedCourses &&
          analytics.recommendations.suggestedCourses.length > 0 && (
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl border border-indigo-200">
              <h3 className="font-bold text-slate-900 mb-4">
                📚 Recommended Courses
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                {analytics.recommendations.reason}
              </p>
              <div className="space-y-2">
                {analytics.recommendations.suggestedCourses.slice(0, 3).map(
                  (course: any) => (
                    <div
                      key={course.id}
                      className="p-3 bg-white rounded-lg flex items-start justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {course.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {course.difficulty_level}
                        </p>
                      </div>
                      <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 transition-colors flex-shrink-0">
                        Enroll
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
      </div>
    );
  }

  if (type === 'institution' && analytics) {
    return (
      <div className="space-y-6">
        {/* Period Selector */}
        <div className="flex gap-2">
          {['7', '30', '90', '180'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {period === '7' ? '7 days' : period === '30' ? '30 days' : period === '90' ? '90 days' : '6 months'}
            </button>
          ))}
        </div>

        {/* Institution Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">
                  Total Members
                </p>
                <p className="text-3xl font-black text-blue-600">
                  {analytics.overview?.totalMembers || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">
                  Active Members
                </p>
                <p className="text-3xl font-black text-green-600">
                  {analytics.overview?.activeMembers || 0}
                </p>
                <p className="text-xs text-slate-600 mt-2">
                  {analytics.overview?.activityRate || 0}% activity rate
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">
                  Completion Rate
                </p>
                <p className="text-3xl font-black text-purple-600">
                  {analytics.overview?.completionRate || 0}%
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-600 opacity-20" />
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">
                  Revenue
                </p>
                <p className="text-3xl font-black text-orange-600">
                  ৳{Math.round((analytics.overview?.totalRevenue || 0) / 1000)}K
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Top Courses */}
        {analytics.topCourses && analytics.topCourses.length > 0 && (
          <div className="p-6 bg-white rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4">Top Courses</h3>
            <div className="space-y-3">
              {analytics.topCourses.map((course: any, index: number) => (
                <div key={course.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                  <span className="text-xl font-black text-slate-400">
                    #{index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{course.title}</p>
                  </div>
                  <span className="text-lg font-black text-blue-600">
                    {course.enrollment_count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subject Wise Stats */}
        {analytics.subjectStats &&
          Object.keys(analytics.subjectStats).length > 0 && (
            <div className="p-6 bg-white rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4">Subject Wise Enrollment</h3>
              <div className="space-y-3">
                {Object.entries(analytics.subjectStats)
                  .sort((a, b) => (b[1] as number) - (a[1] as number))
                  .slice(0, 5)
                  .map(([subject, count]) => (
                    <div key={subject} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <p className="font-bold text-sm text-slate-900">
                            {subject}
                          </p>
                          <span className="text-sm font-bold text-blue-600">
                            {count}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{
                              width: `${Math.max(((count as number) / (Math.max(...Object.values(analytics.subjectStats) as number[]))) * 100, 10)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
      </div>
    );
  }

  return null;
}
