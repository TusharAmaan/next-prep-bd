"use client";

import React, { useEffect, useState, useMemo } from "react";
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
  ChevronRight,
  Activity,
  FileText,
  PlayCircle,
  Trophy,
  History,
  Target,
  GraduationCap,
  MessageSquare,
  Search as SearchIcon,
  Library,
  Users,
  HelpCircle,
  Trash2 as TrashIcon,
  ThumbsUp,
  MessageCircle
} from "lucide-react";
import StudentLectureSheets from "@/components/lecture-sheets/StudentLectureSheets";
import BookmarkButton from "@/components/shared/BookmarkButton";
import { processDailyGamification, rewardProfileCompletion } from "@/app/actions/gamification";
import { toast } from "sonner";

// --- Types ---
interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
  current_goal?: string;
  batch?: string;
  subscription_plan?: string;
  phone?: string;
  institution?: string;
  city?: string;
  bio?: string;
  date_of_birth?: string;
  current_streak?: number;
  gamification_points?: number;
  gamification_rank?: string;
}

interface ActivityLog {
  id: number;
  action_type: string;
  details: string;
  created_at: string;
  item_id?: number;
  item_title?: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  instructor: string;
  progress: number; // Mocked for now
  category: string;
}

interface Resource {
  id: number;
  title: string;
  type: string;
  created_at: string;
  resource_id: number;
}

interface ExamPaper {
  id: number;
  title: string;
  duration: string;
  total_marks: number;
  created_at: string;
  is_finalized: boolean;
}

interface UserBadge {
  id: number;
  awarded_at: string;
  badge: {
    name: string;
    description: string;
    icon_key: string;
  };
}

// --- Main Component ---
export default function ModernStudentDashboard() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [bookmarks, setBookmarks] = useState<Resource[]>([]);
  const [exams, setExams] = useState<ExamPaper[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);

  const [stats, setStats] = useState({
    coursesCount: 0,
    examsCount: 0,
    bookmarksCount: 0,
    averageScore: 0,
  });

  // Library/Bookmarks States
  const [searchTerm, setSearchTerm] = useState("");
  const [libraryFilter, setLibraryFilter] = useState("all");

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(bkm => {
      const matchSearch = bkm.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFilter = libraryFilter === "all" || bkm.type === libraryFilter;
      return matchSearch && matchFilter;
    });
  }, [bookmarks, searchTerm, libraryFilter]);

  const groupedBookmarks = useMemo(() => {
    const groups: Record<string, typeof filteredBookmarks> = {};
    filteredBookmarks.forEach(b => {
      const type = b.type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(b);
    });
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [filteredBookmarks]);

  const getLibraryLink = (type: string, id: number) => {
    switch(type) {
      case 'course': return `/courses/${id}`;
      case 'ebook': return `/ebooks/${id}`;
      case 'news': return `/news/${id}`;
      case 'question': return `/question/${id}`;
      case 'post': return `/blog/${id}`;
      case 'segment_post': return `/resources/redirect/${id}`; // Future-proofing
      default: return `/blog/${id}`;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const profileProgress = useMemo(() => {
    if (!profile) return 0;
    const fields = [
      profile.full_name,
      profile.phone,
      profile.institution,
      profile.current_goal,
      profile.batch,
      profile.city,
      profile.bio,
      profile.date_of_birth
    ];
    const filled = fields.filter(f => {
      if (typeof f === 'string') return f.trim() !== "";
      return f !== null && f !== undefined;
    }).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  const handleClaimProfileReward = async () => {
    if (!profile || profileProgress < 100) return;
    const res = await rewardProfileCompletion(profile.id);
    if (res.success) {
      toast.success("Awesome! You earned 50 points for completing your profile.");
      fetchDashboardData();
    } else {
      toast.error(res.message || "Failed to claim reward");
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: userData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !userData?.user) {
        router.push("/login");
        return;
      }
      const userId = userData.user.id;

      // 0. Process Gamification Daily Login
      await processDailyGamification(userId);

      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select("*")
        .eq("id", userId)
        .single();
      if (profileData) {
        setProfile(profileData as Profile);
        // Role-based redirect after profile is loaded
        if (profileData.role === 'admin') {
          router.replace('/admin');
        } else if (profileData.role === 'editor') {
          router.replace('/editor/dashboard');
        }
      }

      // 2. Fetch Enrolled Courses
      // We check the 'course_enrollments' table (aligned with schema)
      const { data: enrollmentData } = await supabase
        .from("course_enrollments")
        .select("course_id, status")
        .eq("user_id", userId)
        .eq("status", "active");

      if (enrollmentData && enrollmentData.length > 0) {
        const courseIds = enrollmentData.map(e => e.course_id);
        const { data: coursesData } = await supabase
          .from("courses")
          .select("id, title, description, thumbnail_url, instructor, category")
          .in("id", courseIds);
        
        // 3. Fetch All Course Contents (to count total items)
        const { data: contentsData } = await supabase
          .from("course_contents")
          .select("id, lesson_id, course_lessons!inner(course_id)")
          .in("course_lessons.course_id", courseIds);

        // 4. Fetch User Progress
        const { data: progressData } = await supabase
          .from("course_user_progress")
          .select("content_id, is_completed")
          .eq("user_id", userId)
          .eq("is_completed", true);

        const mergedCourses = (coursesData || []).map(c => {
          const totalItems = contentsData?.filter((cnt: any) => cnt.course_lessons.course_id === c.id).length || 0;
          const completedItems = progressData?.filter((p: any) => 
            contentsData?.some((cnt: any) => cnt.id === p.content_id && cnt.course_lessons.course_id === c.id)
          ).length || 0;

          const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
          
          return { ...c, progress: progressPercent };
        });
        setCourses(mergedCourses);
      } else {
        setCourses([]);
      }

      // 4. Fetch Universal User Bookmarks
      const { data: bkmData } = await supabase
        .from("user_bookmarks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (bkmData) {
        setBookmarks(bkmData.map(b => ({
          id: b.id,
          title: b.metadata?.title || 'Untitled',
          type: b.item_type,
          created_at: b.created_at,
          resource_id: b.item_id
        })));
      }

      // 5. Fetch Official Exams (Mock Tests)
      const { data: examsData } = await supabase
        .from("exams")
        .select("id, title, duration_minutes, total_marks, created_at, status")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(5);
      if (examsData) {
        setExams((examsData as any[]).map(e => ({
          ...e,
          duration: `${e.duration_minutes}m`
        })));
      }

      // 6. Fetch Badges
      const { data: badgesData } = await supabase
        .from("user_badges")
        .select("id, awarded_at, badge:badges(name, description, icon_key)")
        .eq("user_id", userId)
        .order("awarded_at", { ascending: false });
      if (badgesData) setBadges(badgesData as unknown as UserBadge[]);

      // 7. Fetch Likes & Comments for Activity Log
      const [likesRes, commentsRes] = await Promise.all([
        supabase.from('likes').select('id, created_at, resource_id, resources(title)').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
        supabase.from('comments').select('id, content, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(5)
      ]);

      const combinedActivities: ActivityLog[] = [
        ...(likesRes.data || []).map(l => ({
          id: l.id,
          action_type: 'like',
          details: `Liked: ${(Array.isArray(l.resources) ? l.resources[0]?.title : (l.resources as any)?.title) || 'a resource'}`,
          created_at: l.created_at,
          item_id: l.id
        })),
        ...(commentsRes.data || []).map(c => ({
          id: c.id,
          action_type: 'comment',
          details: `Commented: "${c.content.substring(0, 30)}..."`,
          created_at: c.created_at,
          item_id: c.id
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);

      setActivities(combinedActivities);

      // Pre-calculate stats
      setStats({
        coursesCount: enrollmentData?.length || 0,
        examsCount: examsData?.length || 0,
        bookmarksCount: bkmData?.length || 0,
        averageScore: 78, // Mock average score
      });

    } catch (e) {
      console.error("Error fetching dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveActivity = async (id: number, type: string) => {
    if (!confirm(`Are you sure you want to remove this ${type}?`)) return;
    try {
      const table = type === 'like' ? 'likes' : 'comments';
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      toast.success(`${type} removed`);
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Setting things up...</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Getting your dashboard ready</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-20 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none z-0"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* --- Top Nav (Simple) --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Hey, {profile?.full_name?.split(" ")[0] || "Learner"} 👋
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Ready to crush your goals today?</p>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                 <span className="text-amber-500 font-black">🔥 {profile?.current_streak || 0}</span>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l border-slate-100 dark:border-slate-800 pl-2">Streak</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                 <Trophy className="w-4 h-4 text-purple-500" />
                 <span className="text-slate-900 dark:text-white font-black">{profile?.gamification_points || 0}</span>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l border-slate-100 dark:border-slate-800 pl-2">{profile?.gamification_rank}</span>
              </div>
           </div>
        </div>

        {/* --- Quick Overview (Compact Pulse) --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { label: 'Courses', value: stats.coursesCount, icon: BookOpen, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
             { label: 'Mock Tests', value: stats.examsCount, icon: GraduationCap, color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' },
             { label: 'Rank', value: profile?.gamification_rank || 'N/A', icon: Target, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' },
             { label: 'Badges', value: badges.length, icon: Award, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' },
           ].map(stat => (
             <div key={stat.label} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                   <stat.icon className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{stat.value}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
             </div>
           ))}
        </div>

        {/* --- Navigation Tabs --- */}
        <div className="flex overflow-x-auto hide-scrollbar gap-3 py-2 sticky top-16 md:top-20 z-40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md -mx-4 px-4 md:mx-0 md:px-0">
          {[
            { id: "overview", label: "My Hub", icon: BarChart3 },
            { id: "courses", label: "Courses", icon: BookOpen },
            { id: "lecture_sheets", label: "Sheets", icon: FileText },
            { id: "exams", label: "Mock Tests", icon: Award },
            { id: "bookmarks", label: "Saved", icon: Library },
            { id: "achievements", label: "Badges", icon: Trophy },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 ${
                  isActive 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg -translate-y-1" 
                    : "bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-100 dark:border-slate-800 shadow-sm"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* --- Content Area --- */}
        <div className="transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content (Left) */}
              <div className="lg:col-span-2 space-y-8">
                {/* Active Courses */}
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Active Courses</h2>
                    <button onClick={() => setActiveTab('courses')} className="text-sm font-bold tracking-widest text-indigo-600 hover:text-indigo-700 flex items-center group">
                      View all <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  <div className="flex overflow-x-auto hide-scrollbar pb-8 md:grid md:grid-cols-2 gap-8 -mx-4 px-4 md:mx-0 md:px-0">
                    {courses.slice(0, 4).map((course) => (
                      <div key={course.id} className="min-w-[300px] md:min-w-0 bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-100 p-6 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500 cursor-pointer group shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="w-full h-48 bg-slate-100 rounded-[1.5rem] mb-6 overflow-hidden relative shadow-inner">
                              {course.thumbnail_url ? (
                                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 bg-indigo-50/50"><BookOpen className="w-12 h-12" /></div>
                              )}
                              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur border border-white/50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm">
                                {course.category || "Course"}
                              </div>
                            </div>
                            <h3 className="font-bold text-slate-900 text-xl line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors leading-tight">{course.title}</h3>
                            <p className="text-slate-500 text-sm font-bold mb-6 flex items-center gap-2"><Users className="w-4 h-4 text-indigo-400" /> {course.instructor || "Platform Tutor"}</p>
                        </div>
                        
                        <div className="space-y-3 mt-auto">
                          <div className="flex justify-between items-end px-1">
                            <span className="text-xs font-bold text-slate-400 tracking-widest">Mastery</span>
                            <span className="text-sm font-bold text-indigo-600">{course.progress}%</span>
                          </div>
                          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 relative" style={{ width: `${course.progress}%` }}>
                                <div className="absolute inset-0 bg-white/20 w-full h-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {courses.length === 0 && (
                      <div className="col-span-full bg-white/80 rounded-[2.5rem] border-2 border-dashed border-slate-200 p-12 text-center backdrop-blur-sm">
                        <BookOpen className="w-14 h-14 text-indigo-300 mx-auto mb-4" />
                        <h3 className="text-2xl text-slate-900 font-bold tracking-tight">No active courses</h3>
                        <p className="text-slate-500 text-lg font-medium mt-2">Enroll in a course to see it here and start learning.</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Profile Progress */}
                {profileProgress < 100 ? (
                  <section className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile Progress</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Complete your profile to unlock rewards and full features.</p>
                      </div>
                      <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        {profileProgress}%
                      </div>
                    </div>
                    <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner mb-6">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                        style={{ width: `${profileProgress}%` }}
                      ></div>
                    </div>
                    <Link href="/profile" className="inline-block w-full text-center px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-all">
                      Go to Profile
                    </Link>
                  </section>
                ) : (
                  <section className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 md:p-10 rounded-[2.5rem] border border-indigo-500 shadow-2xl text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-bold mb-2">Ready to Study?</h2>
                          <p className="text-indigo-100 text-sm leading-relaxed mb-8">Access your personalized curriculum built specifically for {profile?.batch || "your goal"}.</p>
                        </div>
                        <button 
                          onClick={handleClaimProfileReward}
                          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-all"
                        >
                           Claim Bonus
                        </button>
                      </div>
                      <Link href={`/curriculum?batch=${profile?.batch || ''}`} className="w-full text-center px-6 py-4 bg-white text-indigo-900 font-black rounded-xl hover:bg-slate-50 transition-colors shadow-xl active:scale-95 flex justify-center items-center gap-2">
                        <BookOpen className="w-5 h-5" /> Visit Lesson Plan
                      </Link>
                    </div>
                  </section>
                )}
              </div>

              {/* Sidebar (Right) */}
              <div className="space-y-8">
                {/* Up Next - Exams */}
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <History className="w-6 h-6 text-indigo-500" /> Recent Exams
                  </h3>
                  <div className="space-y-4">
                    {exams.slice(0, 5).map((exam) => (
                      <div key={exam.id} className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm line-clamp-1">{exam.title}</h4>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded inline-block whitespace-nowrap">{exam.total_marks} Pts</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400 tracking-wide">
                          <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(exam.created_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {exam.duration}</span>
                        </div>
                      </div>
                    ))}
                    {exams.length === 0 && <p className="text-slate-500 text-sm font-medium text-center py-6">No recent exams.</p>}
                  </div>
                </div>

                {/* Recent Activity Timeline */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                    <Activity className="w-6 h-6 text-blue-500" /> Recent Activity
                  </h3>
                  <div className="space-y-4">
                    {activities.map((act) => (
                      <div key={`${act.action_type}-${act.id}`} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                        <div className="flex items-center gap-4 min-w-0">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${act.action_type === 'like' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-purple-50 text-purple-600 dark:bg-purple-900/20'}`}>
                              {act.action_type === 'like' ? <ThumbsUp className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                           </div>
                           <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{act.details}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{new Date(act.created_at).toLocaleDateString()}</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveActivity(act.id, act.action_type)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                        >
                           <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {activities.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No recent activity.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COURSES TAB */}
          {activeTab === "courses" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">My Learning Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div key={course.id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
                    {course.thumbnail_url && (
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-48 object-cover" />
                    )}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded-full">{course.category || "General"}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg mb-2">{course.title}</h3>
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{course.description || "Course description not available."}</p>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-slate-700">Completion</span>
                          <span className="text-sm font-bold text-indigo-600">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4">
                          <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
                        </div>
                        <button className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors">
                          Continue Learning
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {courses.length === 0 && <p className="text-slate-500 col-span-full text-center">No courses enrolled.</p>}
              </div>
            </div>
          )}

          {/* EXAMS TAB */}
          {activeTab === "exams" && (
             <div className="space-y-6">
               <div className="flex justify-between items-center px-2">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Mock Tests</h2>
                  <button className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg active:scale-95 text-sm">Take Test</button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                 {exams.map(exam => (
                   <div key={exam.id} className="bg-white rounded-3xl p-5 md:p-6 border border-slate-100 hover:shadow-xl transition-all group relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                         <FileText className="w-16 h-16" />
                      </div>
                      <div className="relative z-10 space-y-4">
                        <div className="flex justify-between items-start">
                           <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider ${exam.is_finalized ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                             {exam.is_finalized ? 'Evaluated' : 'Pending'}
                           </span>
                           <p className="text-xs font-bold text-slate-400">{new Date(exam.created_at).toLocaleDateString()}</p>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight line-clamp-2">{exam.title}</h3>
                        <div className="flex items-center gap-6 pt-2 border-t border-slate-50">
                           <div className="text-center md:text-left">
                              <p className="text-[11px] font-bold text-slate-300 tracking-widest">Marks</p>
                              <p className="text-lg font-bold text-indigo-600">{exam.total_marks}</p>
                           </div>
                           <div className="text-center md:text-left">
                              <p className="text-[11px] font-bold text-slate-300 tracking-widest">Time</p>
                              <p className="text-sm font-bold text-slate-600">{exam.duration}</p>
                           </div>
                           <button className="ml-auto bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold tracking-widest hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100 hidden md:block">
                              Review
                           </button>
                        </div>
                      </div>
                   </div>
                 ))}
                 {exams.length === 0 && (
                   <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                     <Trophy className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                     <h3 className="text-xl font-bold text-slate-900 tracking-tight">No exams yet</h3>
                     <p className="text-slate-500 mt-2 font-medium">Start testing your knowledge today!</p>
                   </div>
                 )}
               </div>
             </div>
          )}

          {/* LIBRARY TAB */}
          {activeTab === "bookmarks" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-2 gap-4">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Your Library</h2>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Search Input */}
                    <div className="relative flex-1 sm:w-64">
                       <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                       <input 
                         type="text" 
                         placeholder="Search library..." 
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium shadow-sm"
                       />
                    </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 px-2 overflow-x-auto pb-2 scrollbar-hide">
                 {[
                   { id: 'all', label: 'All Items' },
                   { id: 'post', label: 'Blogs' },
                   { id: 'course', label: 'Courses' },
                   { id: 'ebook', label: 'Ebooks' },
                   { id: 'question', label: 'Questions' },
                   { id: 'news', label: 'News' },
                   { id: 'segment_post', label: 'Updates' }
                 ].map(filter => (
                   <button
                     key={filter.id}
                     onClick={() => setLibraryFilter(filter.id)}
                     className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all border whitespace-nowrap ${
                       libraryFilter === filter.id 
                       ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                       : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                     }`}
                   >
                     {filter.label}
                   </button>
                 ))}
              </div>

              {/* Grouped Bookmarks */}
              <div className="space-y-12">
                {groupedBookmarks.map(([type, items]) => (
                  <div key={type} className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight capitalize flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        {type === "question" ? <HelpCircle className="w-4 h-4" /> : (type === "course" ? <PlayCircle className="w-4 h-4" /> : (type === "ebook" ? <BookOpen className="w-4 h-4" /> : <FileText className="w-4 h-4" />))}
                      </div>
                      {type.replace('_', ' ')}s
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{items.length}</span>
                    </h3>
                    
                    <div className="flex overflow-x-auto pb-6 -mx-4 px-4 md:mx-0 md:px-0 gap-6 snap-x snap-mandatory custom-scrollbar">
                      {items.map((bkm) => (
                        <div key={bkm.id} className="min-w-[280px] md:min-w-[320px] max-w-[320px] snap-center bg-white rounded-3xl p-6 border border-slate-100 hover:shadow-2xl transition-all group relative overflow-hidden shadow-sm flex flex-col focus-within:ring-2 focus-within:ring-indigo-200">
                          <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                              {bkm.type === "question" ? <HelpCircle className="w-8 h-8" /> : (bkm.type === "course" ? <PlayCircle className="w-8 h-8" /> : (bkm.type === "ebook" ? <BookOpen className="w-8 h-8" /> : <FileText className="w-8 h-8" />))}
                            </div>
                            <BookmarkButton itemType={bkm.type as any} itemId={bkm.resource_id} metadata={{ title: bkm.title }} />
                          </div>
                          <div className="space-y-4 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded tracking-widest">{bkm.type.replace('_', ' ')}</span>
                              </div>
                              <Link 
                                  href={getLibraryLink(bkm.type, bkm.resource_id)}
                                  className="block"
                              >
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight leading-tight line-clamp-2">
                                   {bkm.title}
                                </h3>
                              </Link>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-4">
                              <span className="text-[11px] font-bold text-slate-400">Saved: {new Date(bkm.created_at).toLocaleDateString()}</span>
                              <Link 
                                 href={getLibraryLink(bkm.type, bkm.resource_id)}
                                 className="text-xs font-bold text-slate-900 hover:text-indigo-600 tracking-widest transition-colors flex items-center gap-1 group/btn"
                              >
                                 View <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {groupedBookmarks.length === 0 && bookmarks.length > 0 && (
                  <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <SearchIcon className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">No results found</h3>
                    <p className="text-slate-500 mt-2 font-medium max-w-xs mx-auto text-center">Try adjusting your search or filters.</p>
                  </div>
                )}

                {bookmarks.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <Library className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Empty Library</h3>
                    <p className="text-slate-500 mt-2 font-medium max-w-xs mx-auto text-center">Bookmark courses, sheets, and articles to save them here for quick access.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ACHIEVEMENTS TAB */}
          {activeTab === "achievements" && (
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 text-[11px] font-bold rounded-full mb-3 uppercase tracking-widest">
                     <Trophy className="w-3.5 h-3.5" /> Achievements
                  </span>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tighter leading-none mb-3">Your Badges</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">Milestones you've reached during your learning journey.</p>
                </div>
                <Link 
                  href="/student/leaderboard"
                  className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 dark:shadow-none"
                >
                   <Trophy className="w-5 h-5" /> View Leaderboard
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
                {badges.map(b => (
                  <div key={b.id} className="bg-white rounded-3xl p-6 text-center hover:shadow-2xl transition-all hover:-translate-y-2 group shadow-sm border border-slate-50">
                    <div className="relative mb-4 mx-auto w-16 h-16 md:w-20 md:h-20">
                       <div className="absolute inset-0 bg-indigo-100 rounded-full scale-0 group-hover:scale-110 transition-transform duration-500 opacity-20"></div>
                       <img 
                         src={`/badges/${b.badge.icon_key}.svg`} 
                         alt={b.badge.name} 
                         onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=B&background=random'; }}
                         className="w-full h-full object-contain relative z-10 drop-shadow-[0_10px_10px_rgba(0,0,0,0.1)] group-hover:drop-shadow-[0_15px_20px_rgba(79,70,229,0.3)] transition-all duration-500"
                       />
                    </div>
                    <h3 className="font-bold text-slate-900 text-[11px] md:text-xs tracking-tight mb-1">{b.badge.name}</h3>
                    <div className="text-[10px] font-bold text-slate-300 mt-4">
                      {new Date(b.awarded_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {badges.length === 0 && (
                  <div className="col-span-full py-16 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <Award className="w-16 h-16 mx-auto text-slate-200 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">No badges earned yet</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">Keep learning to unlock your first achievement!</p>
                  </div>
                )}
              </div>

              {/* Progress Level */}
              <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="absolute top-0 right-0 p-12 opacity-5">
                    <Zap className="w-64 h-64" />
                 </div>
                 <div className="relative z-10 text-center md:text-left">
                    <p className="text-indigo-400 font-bold text-xs tracking-widest mb-2">Platform Rank</p>
                    <h3 className="text-3xl md:text-4xl font-bold tracking-tighter mb-2">Novice Explorer</h3>
                    <p className="text-indigo-200 font-medium text-sm">Next level: Elite Master (Collect 10 more badges)</p>
                 </div>
                 <div className="relative z-10 w-24 h-24 rounded-full border-4 border-indigo-500/30 flex items-center justify-center p-2">
                    <div className="w-full h-full rounded-full bg-indigo-600 flex items-center justify-center text-xl font-bold">78%</div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === "lecture_sheets" && profile && (
            <StudentLectureSheets user={profile} />
          )}

        </div>
      </div>
    </div>
  );
}
