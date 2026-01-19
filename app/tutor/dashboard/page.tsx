"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { 
  FileText, CheckCircle, Clock, AlertTriangle, 
  Plus, Hammer, Layout, TrendingUp, Loader2, Sparkles, 
  Crown, Zap, ChevronRight, BarChart3
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

export default function TutorDashboard() {
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Profile & Subscription Data
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, full_name, subscription_plan, subscription_expiry, monthly_question_count, max_questions, is_trial_used")
        .eq("id", user.id)
        .single();
      
      if (prof) setProfile(prof);

      // 2. Fetch Resources & Courses
      const [resData, courseData] = await Promise.all([
          supabase.from("resources").select("status, title, created_at, type, admin_feedback").eq("author_id", user.id).order("created_at", { ascending: false }).limit(5),
          supabase.from("courses").select("status, title, created_at, admin_feedback").eq("tutor_id", user.id).order("created_at", { ascending: false }).limit(5)
      ]);

      const allItems = [...(resData.data || []), ...(courseData.data || [])].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setStats({
        pending: allItems.filter(r => r.status === 'pending').length,
        approved: allItems.filter(r => r.status === 'approved').length,
        rejected: allItems.filter(r => r.status === 'rejected').length
      });
      setRecent(allItems.slice(0, 5));
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600"/></div>;

  // Plan Logic
  const isPro = profile?.subscription_plan === 'pro';
  const isTrial = profile?.subscription_plan === 'trial';
  const usageCount = profile?.monthly_question_count || 0;
  const maxLimit = profile?.max_questions || 50;
  const usagePercent = Math.min(100, (usageCount / maxLimit) * 100);
  const isNearLimit = !isPro && !isTrial && (usageCount >= maxLimit * 0.8);

  // Dynamic Styles based on Plan
  const heroGradient = isPro 
    ? "from-slate-900 via-slate-800 to-black" 
    : isTrial 
      ? "from-indigo-600 via-purple-600 to-pink-600" 
      : "from-blue-600 via-blue-500 to-indigo-600";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* 1. HERO SECTION (Dynamic based on Plan) */}
      <div className={`rounded-3xl p-8 shadow-2xl relative overflow-hidden text-white flex flex-col lg:flex-row justify-between items-center gap-8 bg-gradient-to-br ${heroGradient}`}>
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
        {isPro && <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>}

        <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isPro ? 'bg-amber-500/20 border-amber-500/30 text-amber-300' : 'bg-white/20 border-white/10'}`}>
                    {isPro ? <Crown className="w-3 h-3"/> : <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>}
                    {isPro ? "Pro Instructor" : isTrial ? "Trial Active" : "Free Plan"}
                </div>
                {profile?.subscription_expiry && (
                    <span className="text-xs text-white/60 font-medium">
                        Expires: {new Date(profile.subscription_expiry).toLocaleDateString()}
                    </span>
                )}
            </div>
            
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight leading-tight">
                Welcome back, {profile?.full_name?.split(' ')[0] || "Tutor"}!
            </h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-white/80">
                <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400"/> {stats.approved} Published</span>
                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-300"/> {stats.pending} Pending</span>
            </div>
        </div>
        
        {/* Quick Action & Usage Card */}
        <div className="flex flex-col gap-4 relative z-10 w-full lg:w-80">
            {/* Usage Meter (Only for Free/Trial logic visually, keeps pro users aware too) */}
            <div className="bg-black/20 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wide text-white/60">
                    <span>Monthly Quota</span>
                    <span className={usageCount >= maxLimit ? "text-red-300" : "text-emerald-300"}>
                        {usageCount} / {maxLimit > 1000 ? '∞' : maxLimit}
                    </span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden border border-white/5">
                    <div className={`h-full rounded-full transition-all duration-1000 ${usageCount >= maxLimit ? 'bg-red-500' : 'bg-emerald-400'}`} style={{ width: `${usagePercent}%` }}></div>
                </div>
                {isNearLimit && !isPro && (
                    <Link href="/tutor/dashboard/subscription" className="mt-3 block text-[10px] text-center font-bold text-white bg-red-500/20 border border-red-500/30 py-1.5 rounded hover:bg-red-500 hover:text-white transition-colors">
                        ⚠️ Limit Reached Soon. Upgrade Now
                    </Link>
                )}
            </div>

            <Link href="/tutor/dashboard/question-builder" className="group bg-white text-slate-900 px-6 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                <div className="bg-indigo-100 p-1.5 rounded-lg group-hover:bg-indigo-200 text-indigo-700 transition-colors"><Plus className="w-5 h-5"/></div>
                <span>Create Exam</span>
            </Link>
        </div>
      </div>

      {/* 2. MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: TOOLS & SUBSCRIPTION */}
          <div className="space-y-8 xl:col-span-1">
              
              {/* Badge Section */}
              {profile && <BadgeDisplay userId={profile.id} />}

              {/* Tools Section */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Workspace</h3>
                  <div className="space-y-3">
                      <Link href="/tutor/dashboard/question-builder" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-md transition-all group">
                          <div className="w-10 h-10 bg-white text-indigo-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><Hammer className="w-5 h-5"/></div>
                          <div>
                              <h4 className="font-bold text-slate-800 text-sm">Question Builder</h4>
                              <p className="text-[10px] text-slate-500 mt-0.5">Generate & Print Exams</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-indigo-400"/>
                      </Link>
                      
                      <Link href="/tutor/dashboard/courses" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 hover:shadow-md transition-all group">
                          <div className="w-10 h-10 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><Layout className="w-5 h-5"/></div>
                          <div>
                              <h4 className="font-bold text-slate-800 text-sm">Course Manager</h4>
                              <p className="text-[10px] text-slate-500 mt-0.5">Manage Curriculum</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-blue-400"/>
                      </Link>

                      <Link href="/tutor/subscription" className={`flex items-center gap-4 p-4 rounded-2xl border transition-all group ${isPro ? 'bg-amber-50 border-amber-100 hover:border-amber-300' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${isPro ? 'bg-amber-100 text-amber-600' : 'bg-white text-slate-600'}`}>
                              {isPro ? <Crown className="w-5 h-5"/> : <Zap className="w-5 h-5"/>}
                          </div>
                          <div>
                              <h4 className={`font-bold text-sm ${isPro ? 'text-amber-900' : 'text-slate-800'}`}>Subscription</h4>
                              <p className={`text-[10px] mt-0.5 ${isPro ? 'text-amber-700' : 'text-slate-500'}`}>{isPro ? "Manage Pro Plan" : "Upgrade to Pro"}</p>
                          </div>
                          <ChevronRight className={`w-4 h-4 ml-auto ${isPro ? 'text-amber-400' : 'text-slate-300'}`}/>
                      </Link>
                  </div>
              </div>
          </div>

          {/* RIGHT COLUMN: ANALYTICS & ACTIVITY */}
          <div className="xl:col-span-2 space-y-8">
              
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600"/>
                          <span className="text-xs font-bold text-emerald-800 uppercase">Live</span>
                      </div>
                      <p className="text-3xl font-black text-emerald-900">{stats.approved}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-amber-600"/>
                          <span className="text-xs font-bold text-amber-800 uppercase">Pending</span>
                      </div>
                      <p className="text-3xl font-black text-amber-900">{stats.pending}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl col-span-2 md:col-span-1">
                      <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="w-4 h-4 text-slate-600"/>
                          <span className="text-xs font-bold text-slate-800 uppercase">Rejected</span>
                      </div>
                      <p className="text-3xl font-black text-slate-900">{stats.rejected}</p>
                  </div>
              </div>

              {/* Recent Activity Table */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[300px]">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-slate-400"/> Recent Activity
                      </h3>
                      <Link href="/tutor/dashboard/content" className="text-xs font-bold bg-white border border-slate-200 px-4 py-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                          View Library
                      </Link>
                  </div>
                  
                  <div className="flex-1 overflow-x-auto">
                      {recent.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4"><Sparkles className="w-8 h-8 opacity-30"/></div>
                              <p>No recent activity.</p>
                          </div>
                      ) : (
                          <table className="w-full text-left text-sm">
                              <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase">
                                  <tr>
                                      <th className="px-6 py-4">Title</th>
                                      <th className="px-6 py-4">Type</th>
                                      <th className="px-6 py-4 text-right">Status</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                  {recent.map((item, i) => (
                                      <tr key={i} className="hover:bg-indigo-50/30 transition-colors group">
                                          <td className="px-6 py-4">
                                              <p className="font-bold text-slate-800 truncate max-w-[150px] sm:max-w-xs">{item.title}</p>
                                              {item.status === 'rejected' && item.admin_feedback && (
                                                  <div className="text-[10px] text-red-500 mt-1 flex items-center gap-1 bg-red-50 w-fit px-2 py-0.5 rounded border border-red-100">
                                                      <AlertTriangle className="w-3 h-3"/> {item.admin_feedback}
                                                  </div>
                                              )}
                                          </td>
                                          <td className="px-6 py-4">
                                              <span className="bg-white border border-slate-200 text-slate-500 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase shadow-sm">
                                                  {item.type || 'Course'}
                                              </span>
                                          </td>
                                          <td className="px-6 py-4 text-right">
                                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm ${
                                                  item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                  item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                  'bg-amber-100 text-amber-700'
                                              }`}>
                                                  {item.status}
                                              </span>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      )}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}