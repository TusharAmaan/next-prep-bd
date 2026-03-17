"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  Loader2,
  BarChart3,
  Bookmark,
  Calendar,
  Award,
} from "lucide-react";

interface EnrolledCourse {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  price: string;
  progress: number; // percentage
  instructor: string;
  lessons_total: number;
  lessons_completed: number;
}

interface BookmarkedResource {
  id: number;
  title: string;
  type: string;
  created_at: string;
  resource_id: number;
}

interface UpcomingExam {
  id: number;
  title: string;
  exam_date: string;
  duration: string;
  total_marks: number;
  category: string;
}

interface PerformanceMetric {
  subject: string;
  score: number;
  average: number;
  trend: "up" | "down" | "stable";
}

export default function StudentDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [bookmarkedResources, setBookmarkedResources] =
    useState<BookmarkedResource[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<UpcomingExam[]>([]);
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetric[]>([]);
  const [stats, setStats] = useState({
    totalProgress: 0,
    coursesEnrolled: 0,
    resourcesSaved: 0,
    certificatesEarned: 0,
  });
  const [activeTab, setActiveTab] = useState<
    "overview" | "courses" | "bookmarks" | "exams" | "analytics"
  >("overview");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Get user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }
      setUser(userData.user);

      // Get profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();
      if (profileData) setProfile(profileData);

      // Fetch enrolled courses (mock data structure - adjust based on your actual enrollment table)
      const { data: coursesData } = await supabase
        .from("courses")
        .select(
          "id, title, description, thumbnail_url, price, instructor, status"
        )
        .eq("status", "approved")
        .limit(6);

      const enrolledWithProgress = (coursesData || []).map((course: any) => ({
        ...course,
        progress: Math.floor(Math.random() * 100),
        lessons_total: 12,
        lessons_completed: Math.floor(Math.random() * 12),
      }));
      setEnrolledCourses(enrolledWithProgress);

      // Fetch bookmarked resources (via likes table)
      const { data: likesData } = await supabase
        .from("likes")
        .select("resource_id, created_at")
        .eq("user_id", userData.user.id)
        .limit(5);

      if (likesData && likesData.length > 0) {
        const resourceIds = likesData.map((like: any) => like.resource_id);
        const { data: resourcesData } = await supabase
          .from("resources")
          .select("id, title, type, created_at")
          .in("id", resourceIds);

        const bookmarked = (resourcesData || []).map((resource: any, idx) => ({
          ...resource,
          resource_id: resource.id,
        }));
        setBookmarkedResources(bookmarked);
      }

      // Fetch exam papers (saved exams)
      const { data: examsData } = await supabase
        .from("exam_papers")
        .select("id, title, duration, total_marks, created_at")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (examsData) {
        const upcomingFormatted = (examsData || []).map((exam: any) => ({
          ...exam,
          exam_date: new Date(exam.created_at).toLocaleDateString(),
          category: "Mock Test",
        }));
        setUpcomingExams(upcomingFormatted);
      }

      // Calculate stats
      setStats({
        totalProgress: Math.round(
          enrolledWithProgress.reduce((a: number, c: any) => a + c.progress, 0) /
            (enrolledWithProgress.length || 1)
        ),
        coursesEnrolled: enrolledWithProgress.length,
        resourcesSaved: bookmarked?.length || 0,
        certificatesEarned: Math.floor(Math.random() * 5),
      });

      // Mock performance metrics
      const mockMetrics: PerformanceMetric[] = [
        { subject: "Mathematics", score: 78, average: 72, trend: "up" },
        { subject: "Physics", score: 85, average: 80, trend: "up" },
        { subject: "Chemistry", score: 72, average: 75, trend: "down" },
        { subject: "English", score: 88, average: 82, trend: "up" },
      ];
      setPerformanceMetrics(mockMetrics);

      setLoading(false);
    };

    fetchData();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center pt-24">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900">
            Welcome back, {profile?.full_name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-slate-600 mt-2">
            Continue learning and track your progress
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={BookOpen}
            label="Courses Enrolled"
            value={stats.coursesEnrolled}
            color="blue"
          />
          <StatCard
            icon={Bookmark}
            label="Saved Resources"
            value={stats.resourcesSaved}
            color="green"
          />
          <StatCard
            icon={Award}
            label="Certificates"
            value={stats.certificatesEarned}
            color="purple"
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Progress"
            value={`${stats.totalProgress}%`}
            color="orange"
          />
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24 z-40">
          <div className="flex overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "courses", label: "My Courses", icon: BookOpen },
              { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
              { id: "exams", label: "Exams", icon: Calendar },
              { id: "analytics", label: "Analytics", icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-4 font-semibold text-sm flex items-center gap-2 whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "text-indigo-600 border-indigo-600 bg-indigo-50"
                      : "text-slate-600 border-transparent hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Sections */}
        <div className="mt-8">
          {activeTab === "overview" && (
            <OverviewSection
              enrolledCourses={enrolledCourses.slice(0, 3)}
              upcomingExams={upcomingExams.slice(0, 3)}
              recentBookmarks={bookmarkedResources.slice(0, 3)}
              performanceMetrics={performanceMetrics}
            />
          )}

          {activeTab === "courses" && (
            <CoursesSection enrolledCourses={enrolledCourses} />
          )}

          {activeTab === "bookmarks" && (
            <BookmarksSection bookmarkedResources={bookmarkedResources} />
          )}

          {activeTab === "exams" && (
            <ExamsSection upcomingExams={upcomingExams} />
          )}

          {activeTab === "analytics" && (
            <AnalyticsSection
              performanceMetrics={performanceMetrics}
              stats={stats}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ============ STAT CARD ============
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className={`inline-flex p-3 rounded-xl ${colorMap[color]} mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-slate-600 text-sm font-medium">{label}</p>
      <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
    </div>
  );
}

// ============ OVERVIEW SECTION ============
function OverviewSection({
  enrolledCourses,
  upcomingExams,
  recentBookmarks,
  performanceMetrics,
}: {
  enrolledCourses: EnrolledCourse[];
  upcomingExams: UpcomingExam[];
  recentBookmarks: BookmarkedResource[];
  performanceMetrics: PerformanceMetric[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Recent Courses */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Continue Learning
        </h2>
        {enrolledCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex gap-4">
              {course.thumbnail_url && (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">{course.title}</h3>
                <p className="text-sm text-slate-600 mt-1">
                  {course.instructor}
                </p>
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-600">
                      Progress
                    </span>
                    <span className="text-xs font-bold text-indigo-600">
                      {course.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Upcoming Exams */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Upcoming Exams
          </h3>
          <div className="space-y-3">
            {upcomingExams.slice(0, 2).map((exam) => (
              <div
                key={exam.id}
                className="p-3 bg-indigo-50 rounded-lg border border-indigo-200"
              >
                <p className="font-semibold text-sm text-slate-900">
                  {exam.title}
                </p>
                <p className="text-xs text-slate-600 mt-1">{exam.exam_date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Top Subjects
          </h3>
          <div className="space-y-2">
            {performanceMetrics.slice(0, 2).map((metric) => (
              <div key={metric.subject} className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">
                  {metric.subject}
                </span>
                <span className="font-bold text-slate-900">{metric.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ COURSES SECTION ============
function CoursesSection({ enrolledCourses }: { enrolledCourses: EnrolledCourse[] }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">My Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrolledCourses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all group"
          >
            {course.thumbnail_url && (
              <div className="relative h-40 overflow-hidden bg-slate-100">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-bold">Continue</span>
                </div>
              </div>
            )}
            <div className="p-4">
              <h3 className="font-bold text-slate-900 line-clamp-2">
                {course.title}
              </h3>
              <p className="text-sm text-slate-600 mt-2">{course.instructor}</p>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-600">
                    {course.lessons_completed}/{course.lessons_total} lessons
                  </span>
                  <span className="text-xs font-bold text-indigo-600">
                    {course.progress}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ============ BOOKMARKS SECTION ============
function BookmarksSection({
  bookmarkedResources,
}: {
  bookmarkedResources: BookmarkedResource[];
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Saved Resources</h2>
      {bookmarkedResources.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">No bookmarks yet</p>
          <p className="text-sm text-slate-500 mt-1">
            Save resources as you explore the platform
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarkedResources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-md transition-shadow flex justify-between items-start"
            >
              <div>
                <h3 className="font-bold text-slate-900">{resource.title}</h3>
                <div className="flex gap-4 mt-2 text-sm text-slate-600">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full font-medium">
                    {resource.type}
                  </span>
                  <span>
                    Saved{" "}
                    {new Date(resource.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Bookmark className="w-5 h-5 text-indigo-600 fill-current" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ EXAMS SECTION ============
function ExamsSection({
  upcomingExams,
}: {
  upcomingExams: UpcomingExam[];
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Mock Tests</h2>
      {upcomingExams.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">No tests yet</p>
          <p className="text-sm text-slate-500 mt-1">
            Start taking tests to track your progress
          </p>
          <Link
            href="/tutor/dashboard/question-builder"
            className="inline-block mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Create Test
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingExams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900">{exam.title}</h3>
                  <div className="flex gap-4 mt-3 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {exam.exam_date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {exam.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {exam.total_marks} marks
                    </span>
                  </div>
                </div>
                <Link
                  href={`/tutor/dashboard/my-exams/${exam.id}`}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ ANALYTICS SECTION ============
function AnalyticsSection({
  performanceMetrics,
  stats,
}: {
  performanceMetrics: PerformanceMetric[];
  stats: any;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Performance by Subject */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Performance by Subject
        </h2>
        <div className="space-y-4">
          {performanceMetrics.map((metric) => (
            <div key={metric.subject}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-slate-900">
                  {metric.subject}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    {metric.score}%
                  </span>
                  {metric.trend === "up" && (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  )}
                  {metric.trend === "down" && (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-blue-500 h-3 rounded-full"
                  style={{ width: `${metric.score}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Class average: {metric.average}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Summary */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Learning Summary
        </h2>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-slate-600">Total Learning Hours</p>
            <p className="text-3xl font-black text-blue-600 mt-2">
              {Math.round(stats.totalProgress * 1.5)}h
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-sm text-slate-600">Completion Rate</p>
            <p className="text-3xl font-black text-green-600 mt-2">
              {stats.totalProgress}%
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <p className="text-sm text-slate-600">Badges Earned</p>
            <p className="text-3xl font-black text-purple-600 mt-2">
              {stats.certificatesEarned}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}