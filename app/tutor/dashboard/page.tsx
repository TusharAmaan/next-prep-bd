"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { 
  FileText, CheckCircle, Clock, AlertTriangle, 
  Plus, Hammer, Layout, TrendingUp, Loader2, Sparkles, 
  Crown, Zap, ChevronRight, BarChart3, CreditCard,
  Layers, Settings, Search, Printer, ArrowUpRight
} from "lucide-react";
import BadgeDisplay from "@/components/tutor/BadgeDisplay";

interface Profile {
  id: string;
  full_name: string;
  subscription_plan: 'free' | 'trial' | 'pro';
  subscription_expiry: string | null;
  monthly_question_count: number;
  max_questions: number;
  is_trial_used: boolean;
}

interface SavedExam {
  id: number;
  title: string;
  total_marks: number;
  created_at: string;
  questions: any[];
}

export default function TutorDashboard() {
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, savedExams: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [recentExams, setRecentExams] = useState<SavedExam[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (prof) setProfile(prof);

      // 2. Fetch Resources & Courses (Activity Log)
      const [resData, courseData] = await Promise.all([
          supabase.from("resources").select("status, title, created_at, type, admin_feedback").eq("author_id", user.id).order("created_at", { ascending: false }).limit(5),
          supabase.from("courses").select("status, title, created_at, admin_feedback").eq("tutor_id", user.id).order("created_at", { ascending: false }).limit(5)
      ]);

      const allActivity = [...(resData.data || []), ...(courseData.data || [])]
        .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // 3. Fetch Saved Exams (New Requirement)
      const { data: exams } = await supabase
        .from("exam_papers")
        .select("id, title, total_marks, created_at, questions")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setStats({
        pending: allActivity.filter(r => r.status === 'pending').length,
        approved: allActivity.filter(r => r.status === 'approved').length,
        rejected: allActivity.filter(r => r.status === 'rejected').length,
        savedExams: exams?.length || 0 // Count of saved exams
      });

      setRecentActivity(allActivity.slice(0, 5));
      setRecentExams(exams?.slice(0, 3) || []); // Top 3 recent exams
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600"/></div>;

  const isPro = profile?.subscription_plan === 'pro';
  const isTrial = profile?.subscription_plan === 'trial';
  
  // Format Date Helper
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* 1. HERO HEADER (Minimal & Clean) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
              <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                      isPro ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                      isTrial ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                      'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                      {isPro ? 'Premium Plan' : isTrial ? 'Trial Plan' : 'Free Plan'}
                  </span>
              </div>
              <p className="text-slate-500 text-sm">Welcome back, {profile?.full_name?.split(' ')[0]}. Here is your daily overview.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
              <Link href="/tutor/dashboard/question-builder" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg">
                  <Plus className="w-4 h-4"/> Create New
              </Link>
          </div>
      </div>

      {/* 2. MAIN LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* === LEFT SIDEBAR (Navigation & Billing) - 3 COLS === */}
          <div className="lg:col-span-4 space-y-6">
              
              {/* Profile/Badge Card */}
              {profile && <BadgeDisplay userId={profile.id} />}

              {/* Navigation Menu */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Workspace</h3>
                  </div>
                  <div className="p-2 space-y-1">
                      <Link href="/tutor/dashboard/question-builder" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-indigo-600 transition-colors group">
                          <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Hammer className="w-4 h-4"/></div>
                          <div className="flex-1">
                              <span className="font-bold text-sm block">Exam Composer</span>
                              <span className="text-[10px] text-slate-400 block">Create & Print Papers</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300"/>
                      </Link>
                      
                      <Link href="/tutor/dashboard/my-exams" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-indigo-600 transition-colors group">
                          <div className="bg-blue-50 text-blue-600 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"><Layers className="w-4 h-4"/></div>
                          <div className="flex-1">
                              <span className="font-bold text-sm block">My Saved Exams</span>
                              <span className="text-[10px] text-slate-400 block">Library of papers</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300"/>
                      </Link>

                      <Link href="/tutor/dashboard/courses" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-indigo-600 transition-colors group">
                          <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors"><Layout className="w-4 h-4"/></div>
                          <div className="flex-1">
                              <span className="font-bold text-sm block">Courses</span>
                              <span className="text-[10px] text-slate-400 block">Manage curriculum</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300"/>
                      </Link>
                  </div>
              </div>

              {/* Subscription Management Widget */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 relative overflow-hidden group">
                  {isPro && <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 blur-2xl opacity-20 rounded-full -mr-4 -mt-4"></div>}
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                          <h3 className="font-bold text-slate-800 text-sm">Subscription</h3>
                          <p className="text-xs text-slate-500 mt-1">
                              {isPro ? "Active Premium Plan" : "Free Plan (Limited)"}
                          </p>
                      </div>
                      <div className={`p-2 rounded-lg ${isPro ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                          {isPro ? <Crown className="w-5 h-5"/> : <Zap className="w-5 h-5"/>}
                      </div>
                  </div>

                  {/* Usage Bar */}
                  <div className="space-y-2 mb-4 relative z-10">
                      <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                          <span>Usage This Month</span>
                          <span className={profile?.monthly_question_count! >= profile?.max_questions! ? "text-red-500" : "text-emerald-500"}>
                              {profile?.monthly_question_count} / {profile?.max_questions}
                          </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                              className={`h-full rounded-full transition-all duration-1000 ${profile?.monthly_question_count! >= profile?.max_questions! ? 'bg-red-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${Math.min(100, (profile?.monthly_question_count! / (profile?.max_questions || 1)) * 100)}%` }}
                          ></div>
                      </div>
                  </div>

                  <Link href="/tutor/subscription" className={`block w-full py-2.5 rounded-xl text-center text-xs font-bold border transition-all ${isPro ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100' : 'bg-slate-900 text-white hover:bg-black'}`}>
                      {isPro ? "Manage Billing" : "Upgrade to Pro"}
                  </Link>
              </div>
          </div>

          {/* === RIGHT CONTENT (Stats & Lists) - 8 COLS === */}
          <div className="lg:col-span-8 space-y-8">
              
              {/* 1. Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Saved Exams Stat (New) */}
                  <div className="bg-white border border-indigo-100 p-4 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                          <div className="bg-indigo-50 p-1.5 rounded-md text-indigo-600"><FileText className="w-3.5 h-3.5"/></div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Saved Exams</span>
                      </div>
                      <p className="text-2xl font-black text-indigo-900">{stats.savedExams}</p>
                  </div>

                  <div className="bg-white border border-emerald-100 p-4 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                          <div className="bg-emerald-50 p-1.5 rounded-md text-emerald-600"><CheckCircle className="w-3.5 h-3.5"/></div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Approved</span>
                      </div>
                      <p className="text-2xl font-black text-emerald-900">{stats.approved}</p>
                  </div>

                  <div className="bg-white border border-amber-100 p-4 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                          <div className="bg-amber-50 p-1.5 rounded-md text-amber-600"><Clock className="w-3.5 h-3.5"/></div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Pending</span>
                      </div>
                      <p className="text-2xl font-black text-amber-900">{stats.pending}</p>
                  </div>

                  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                          <div className="bg-slate-100 p-1.5 rounded-md text-slate-600"><BarChart3 className="w-3.5 h-3.5"/></div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Rejected</span>
                      </div>
                      <p className="text-2xl font-black text-slate-700">{stats.rejected}</p>
                  </div>
              </div>

              {/* 2. Recent Saved Exams (The "My Exams" Preview) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-indigo-500"/> Recent Exam Papers
                      </h3>
                      <Link href="/tutor/dashboard/my-exams" className="text-xs font-bold text-indigo-600 hover:underline">View All</Link>
                  </div>
                  
                  {recentExams.length === 0 ? (
                      <div className="p-8 text-center">
                          <p className="text-sm text-slate-400 mb-3">No exams created yet.</p>
                          <Link href="/tutor/dashboard/question-builder" className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded border border-indigo-100 hover:bg-indigo-100">
                              Create First Exam
                          </Link>
                      </div>
                  ) : (
                      <div className="divide-y divide-slate-100">
                          {recentExams.map((exam) => (
                              <div key={exam.id} className="p-4 hover:bg-slate-50 flex items-center justify-between group transition-colors">
                                  <div className="flex items-center gap-4">
                                      <div className="bg-white border border-slate-200 p-2 rounded-lg text-slate-400 group-hover:text-indigo-500 group-hover:border-indigo-200 transition-colors">
                                          <FileText className="w-5 h-5"/>
                                      </div>
                                      <div>
                                          <h4 className="font-bold text-sm text-slate-800">{exam.title}</h4>
                                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                              <span>{formatDate(exam.created_at)}</span>
                                              <span className="text-slate-300">•</span>
                                              <span>{exam.questions?.length || 0} Questions</span>
                                              <span className="text-slate-300">•</span>
                                              <span>{exam.total_marks} Marks</span>
                                          </div>
                                      </div>
                                  </div>
                                  <Link href={`/tutor/dashboard/my-exams/${exam.id}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Print/View">
                                      <Printer className="w-4 h-4"/>
                                  </Link>
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              {/* 3. General Activity Log */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                      <h3 className="font-bold text-slate-800 text-sm">Content Updates</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                      {recentActivity.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 text-sm">No recent activity.</div>
                      ) : (
                          recentActivity.map((item, i) => (
                              <div key={i} className="p-4 flex items-center justify-between text-sm hover:bg-slate-50 transition-colors">
                                  <div className="flex items-center gap-3">
                                      <span className={`w-2 h-2 rounded-full ${
                                          item.status === 'approved' ? 'bg-emerald-500' : 
                                          item.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
                                      }`}></span>
                                      <span className="font-medium text-slate-700 truncate max-w-[200px]">{item.title}</span>
                                  </div>
                                  <div className="flex items-center gap-4">
                                      <span className="text-xs text-slate-400 hidden sm:block uppercase font-bold">{item.type || 'Course'}</span>
                                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                                          item.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                          item.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                      }`}>
                                          {item.status}
                                      </span>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>

          </div>
      </div>
    </div>
  );
}