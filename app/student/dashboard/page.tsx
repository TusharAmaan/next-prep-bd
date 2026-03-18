"use client";

import React, { useEffect, useState } from "react";
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
  MessageSquare
} from "lucide-react";
import StudentLectureSheets from "@/components/lecture-sheets/StudentLectureSheets";

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
}

interface ActivityLog {
  id: number;
  action_type: string;
  details: string;
  created_at: string;
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

  // Stats derived
  const [stats, setStats] = useState({
    coursesCount: 0,
    examsCount: 0,
    bookmarksCount: 0,
    averageScore: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: userData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !userData?.user) {
        router.push("/login");
        return;
      }
      const userId = userData.user.id;

      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (profileData) setProfile(profileData as Profile);

      // 2. Fetch Active/Enrolled Courses (Mocking enrollment via approved status for now)
      const { data: coursesData } = await supabase
        .from("courses")
        .select("id, title, description, thumbnail_url, instructor, category")
        .eq("status", "approved")
        .limit(4);
      
      const mockedCourses = (coursesData || []).map((c: any) => ({
        ...c,
        progress: Math.floor(Math.random() * 100), // MOCK progress
      }));
      setCourses(mockedCourses);

      // 3. Fetch Recent Activity
      const { data: activityData } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("actor_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);
      if (activityData) setActivities(activityData as ActivityLog[]);

      // 4. Fetch Bookmarks (via likes)
      const { data: likesData } = await supabase
        .from("likes")
        .select("resource_id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(6);

      if (likesData && likesData.length > 0) {
        const rIds = likesData.map((l: any) => l.resource_id);
        const { data: rData } = await supabase
          .from("resources")
          .select("id, title, type")
          .in("id", rIds);

        const mappedBkms = (rData || []).map((r: any) => {
          const lk = likesData.find((lk: any) => lk.resource_id === r.id);
          return {
            ...r,
            resource_id: r.id,
            created_at: lk ? lk.created_at : "",
          };
        });
        setBookmarks(mappedBkms);
      }

      // 5. Fetch Exams
      const { data: examsData } = await supabase
        .from("exam_papers")
        .select("id, title, duration, total_marks, created_at, is_finalized")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);
      if (examsData) setExams(examsData as ExamPaper[]);

      // 6. Fetch Badges
      const { data: badgesData } = await supabase
        .from("user_badges")
        .select("id, awarded_at, badge:badges(name, description, icon_key)")
        .eq("user_id", userId)
        .order("awarded_at", { ascending: false });
      if (badgesData) setBadges(badgesData as unknown as UserBadge[]);

      // Pre-calculate stats
      setStats({
        coursesCount: mockedCourses.length,
        examsCount: examsData?.length || 0,
        bookmarksCount: likesData?.length || 0,
        averageScore: 78, // Mock average score
      });

    } catch (e) {
      console.error("Error fetching dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Loading your workspace...</h2>
        <p className="text-slate-500 mt-2">Preparing your learning journey</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* --- Header Section (Bento Grid Hero) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <GraduationCap className="w-48 h-48" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-100 text-sm font-medium mb-6">
                  <Zap className="w-4 h-4 text-yellow-300" />
                  {profile?.subscription_plan === "premium" ? "Premium Learner" : "Free Tier"}
                </span>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
                  Welcome back, {profile?.full_name?.split(" ")[0] || "Student"}! 🚀
                </h1>
                <p className="text-indigo-100 text-lg max-w-xl leading-relaxed">
                  {profile?.current_goal 
                    ? `Your current goal: ${profile.current_goal}. Let's crush it today.`
                    : "Ready to continue your learning journey? Pick up right where you left off."}
                </p>
              </div>
              <div className="mt-8 flex gap-4">
                <button className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-slate-100 transition shadow-lg flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" /> Resume Learning
                </button>
                <button className="px-6 py-3 bg-indigo-700 text-white font-bold rounded-xl hover:bg-indigo-600 transition flex items-center gap-2 border border-indigo-500">
                  <Target className="w-5 h-5" /> View Targets
                </button>
              </div>
            </div>
          </div>

          {/* Quick Real-time Stats Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 font-semibold uppercase tracking-wider text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" /> Activity Pulse
              </h3>
            </div>
            <div className="space-y-6 flex-1">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{stats.coursesCount}</p>
                    <p className="text-xs text-slate-500 font-medium">Active Courses</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{stats.examsCount}</p>
                    <p className="text-xs text-slate-500 font-medium">Exams Taken</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{badges.length}</p>
                    <p className="text-xs text-slate-500 font-medium">Badges Earned</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Navigation Tabs (Pill style) --- */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 py-2 sticky top-20 z-40 bg-slate-50/80 backdrop-blur-md">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "courses", label: "My Learning", icon: BookOpen },
            { id: "lecture_sheets", label: "Lecture Sheets", icon: FileText },
            { id: "exams", label: "Mock Tests", icon: FileText },
            { id: "bookmarks", label: "Library", icon: Bookmark },
            { id: "achievements", label: "Achievements", icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                  isActive 
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/20" 
                    : "bg-white text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : ""}`} />
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
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Continue Learning</h2>
                    <button onClick={() => setActiveTab('courses')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center">
                      View all <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {courses.slice(0, 4).map((course) => (
                      <div key={course.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                        <div className="w-full h-36 bg-slate-100 rounded-xl mb-4 overflow-hidden relative">
                          {course.thumbnail_url ? (
                            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><BookOpen className="w-12 h-12" /></div>
                          )}
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                            {course.category || "Course"}
                          </div>
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg line-clamp-1 mb-1 group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                        <p className="text-slate-500 text-sm mb-4">{course.instructor || "Platform Tutor"}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-end">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Progress</span>
                            <span className="text-sm font-extrabold text-slate-800">{course.progress}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full" style={{ width: `${course.progress}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                    {courses.length === 0 && (
                      <div className="col-span-full bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                        <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-slate-900 font-bold">No active courses</h3>
                        <p className="text-slate-500 text-sm mt-1">Enroll in a course to see it here.</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Performance Chart (Mock Implementation) */}
                <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Performance Over Time</h2>
                      <p className="text-slate-500 text-sm mt-1">Your mock test scores this month</p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" /> +12%
                    </div>
                  </div>
                  <div className="h-48 flex items-end justify-between gap-2 px-2">
                    {[40, 55, 48, 65, 75, 82, stats.averageScore].map((h, i) => (
                      <div key={i} className="w-full bg-indigo-50 rounded-t-lg relative group">
                        <div 
                          className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-700 group-hover:opacity-90"
                          style={{ height: `${h}%` }}
                        ></div>
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded transition-opacity">
                          {h}%
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-400 mt-4 px-2 uppercase">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Today</span>
                  </div>
                </section>
              </div>

              {/* Sidebar (Right) */}
              <div className="space-y-8">
                {/* Up Next - Exams */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-500" /> Recent Exams
                  </h3>
                  <div className="space-y-4">
                    {exams.slice(0, 3).map(exam => (
                      <div key={exam.id} className="group cursor-pointer">
                        <div className="flex justify-between items-start mb-1.5">
                          <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{exam.title}</p>
                          <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">{exam.total_marks} Pts</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(exam.created_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {exam.duration}</span>
                        </div>
                        <div className="h-px w-full bg-slate-100 mt-4 group-last:hidden"></div>
                      </div>
                    ))}
                    {exams.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No recent exams.</p>}
                  </div>
                </div>

                {/* Recent Activity Timeline */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" /> Activity Log
                  </h3>
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {activities.map((act, i) => (
                      <div key={act.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-indigo-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                        <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] bg-slate-50 p-3 rounded border border-slate-100 shadow-sm ml-4 md:ml-0 md:mr-4 md:group-odd:ml-4 md:group-odd:mr-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-800 text-sm capitalize">{act.action_type.replace(/_/g, " ")}</span>
                          </div>
                          <p className="text-xs text-slate-500 mb-2 truncate" title={act.details}>{act.details || "Activity recorded"}</p>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">{new Date(act.created_at).toLocaleDateString()}</span>
                        </div>
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
             <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Mock Tests & Exminations</h2>
                <button className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition">Take a Test</button>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider border-b border-slate-200">
                     <th className="p-4 rounded-tl-xl">Exam Title</th>
                     <th className="p-4">Date Taken</th>
                     <th className="p-4">Duration</th>
                     <th className="p-4">Total Marks</th>
                     <th className="p-4 rounded-tr-xl">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 text-sm">
                   {exams.map(exam => (
                     <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                       <td className="p-4 font-bold text-slate-900">{exam.title}</td>
                       <td className="p-4 text-slate-600">{new Date(exam.created_at).toLocaleDateString()}</td>
                       <td className="p-4 text-slate-600">{exam.duration}</td>
                       <td className="p-4 text-slate-900 font-bold">{exam.total_marks}</td>
                       <td className="p-4">
                         {exam.is_finalized ? (
                           <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Evaluated</span>
                         ) : (
                           <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Pending</span>
                         )}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
               {exams.length === 0 && <div className="text-center p-8 text-slate-500">No exams taken yet. Start testing your knowledge!</div>}
             </div>
           </div>
          )}

          {/* BOOKMARKS TAB */}
          {activeTab === "bookmarks" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">My Library</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarks.map((bkm) => (
                  <div key={bkm.id} className="flex flex-col p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:border-indigo-300 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 bg-white rounded-lg shadow-sm text-indigo-600">
                        {bkm.type === "video" ? <PlayCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                      </div>
                      <Bookmark className="w-5 h-5 text-indigo-500 fill-indigo-500" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">{bkm.title}</h3>
                    <p className="text-xs text-slate-500 font-semibold uppercase mb-4">{bkm.type}</p>
                    <div className="mt-auto pt-4 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-xs text-slate-400">Saved: {new Date(bkm.created_at).toLocaleDateString()}</span>
                      <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800">Review</button>
                    </div>
                  </div>
                ))}
                {bookmarks.length === 0 && <div className="col-span-full text-center p-8 text-slate-500">Your library is empty. Bookmark resources to see them here.</div>}
              </div>
            </div>
          )}

          {/* ACHIEVEMENTS TAB */}
          {activeTab === "achievements" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <div className="text-center mb-10 max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center p-4 bg-amber-100 text-amber-600 rounded-full mb-4">
                  <Trophy className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">My Achievements</h2>
                <p className="text-slate-600">Collect badges and track your milestones as you progress through your learning journey.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {badges.map(b => (
                  <div key={b.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1">
                    <img 
                      src={`/badges/${b.badge.icon_key}.svg`} 
                      alt={b.badge.name} 
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=B&background=random'; }}
                      className="w-16 h-16 mx-auto mb-4 drop-shadow-md"
                    />
                    <h3 className="font-bold text-slate-900 text-sm mb-1">{b.badge.name}</h3>
                    <p className="text-xs text-slate-500 mb-2 line-clamp-2">{b.badge.description}</p>
                    <div className="text-[10px] font-bold text-slate-400 uppercase bg-slate-200 inline-block px-2 py-1 rounded">
                      {new Date(b.awarded_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {badges.length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
                    <Award className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="font-bold text-slate-700">No badges earned yet</p>
                    <p className="text-sm mt-1">Keep learning and completing exams to earn badges!</p>
                  </div>
                )}
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