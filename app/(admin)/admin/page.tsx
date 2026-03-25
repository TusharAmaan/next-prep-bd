"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/shared/ThemeProvider";
import AnalyticsChart from "@/components/admin/dashboard/AnalyticsChart";
import { 
  LayoutDashboard, FileText, Users, Layers, BookOpen, 
  Bell, FileStack, Settings, HelpCircle, X, Clock, MessageSquare, RefreshCw, 
  AlertTriangle, Database, GraduationCap, Newspaper, Palette, Heart, TrendingUp, DollarSign, UserCheck, Menu, Search, ChevronRight
} from "lucide-react";

import StatsCard from "@/components/admin/dashboard/StatsCard";
import ActivityFeed from "@/components/admin/dashboard/ActivityFeed";
import PlatformInsights from "@/components/admin/dashboard/PlatformInsights";
import VersionNote from "@/components/admin/dashboard/VersionNote";
import AdminHeader from "@/components/admin/AdminHeader"; 

import UserManagement from "@/components/UserManagement";
import HierarchyManager from "@/components/admin/sections/HierarchyManager";
import CategoryManager from "@/components/admin/sections/CategoryManager";
import ContentManager from "@/components/admin/sections/ContentManager";
import FeedbackManager from "@/components/admin/sections/FeedbackManager";
import PendingManager from "@/components/admin/sections/PendingManager";
import QuestionBankManager from "@/components/admin/sections/QuestionBankManager"; 
import LectureSheetManager from "@/components/admin/sections/LectureSheetManager";
import LessonPlanManager from "@/components/admin/sections/LessonPlanManager";
import CourseManager from "@/components/admin/sections/CourseManager";
import CertificateDesigner from "@/components/admin/sections/CertificateDesigner";
import DonationManager from "@/components/admin/sections/DonationManager";

const getMonthRanges = () => {
    const now = new Date();
    const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    return { startThisMonth };
};

export default function AdminDashboard() {
    const supabase = createClient();
    const router = useRouter();
    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = useState("overview"); 
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // --- DASHBOARD DATA ---
    const [stats, setStats] = useState({
        materials: { total: 0, trend: 0 },
        questions: { total: 0, trend: 0 },
        donations: { total: 0, count: 0 },
        users: { total: 0, trend: 0 },
        pendingCount: 0
    });
    const [activities, setActivities] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]); 
    const [latestUpdate, setLatestUpdate] = useState<any>(null);

    // --- SHARED DROPDOWNS ---
    const [segments, setSegments] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    
    const [selectedSegment, setSelectedSegment] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");
    
    const [modal, setModal] = useState({ isOpen: false, type: '', message: '' });
    const showSuccess = (msg: string) => setModal({ isOpen: true, type: 'success', message: msg });
    const showError = (msg: string) => setModal({ isOpen: true, type: 'error', message: msg });
    const closeModal = () => setModal({ ...modal, isOpen: false });

    // --- FETCH DATA ---
    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        const { startThisMonth } = getMonthRanges();
        
        try {
            const [
                matTotal, quesTotal, userTotal, donationData,
                matLast, quesLast, userLast,
                recentUsers, recentResources, recentNews,
                sysUpdate, recentFeedbacks, pendingReviews
            ] = await Promise.all([
                supabase.from("resources").select('*', { count: 'exact', head: true }).in('type', ['pdf', 'video', 'blog']),
                supabase.from("question_bank").select('*', { count: 'exact', head: true }),
                supabase.from("profiles").select('*', { count: 'exact', head: true }),
                supabase.from("donations").select('amount').eq('status', 'approved'),

                supabase.from("resources").select('*', { count: 'exact', head: true }).in('type', ['pdf', 'video', 'blog']).lt('created_at', startThisMonth),
                supabase.from("question_bank").select('*', { count: 'exact', head: true }).lt('created_at', startThisMonth),
                supabase.from("profiles").select('*', { count: 'exact', head: true }).lt('created_at', startThisMonth),
                
                supabase.from("profiles").select('id, full_name, created_at').order('created_at', { ascending: false }).limit(5),
                supabase.from("resources").select('id, title, type, created_at').order('created_at', { ascending: false }).limit(5),
                supabase.from("news").select('id, title, created_at').order('created_at', { ascending: false }).limit(5),

                supabase.from("system_updates").select('*').order('created_at', { ascending: false }).limit(1).single(),
                supabase.from("feedbacks").select('*').order('created_at', { ascending: false }).limit(10),
                supabase.from("resources").select('*', { count: 'exact', head: true }).eq('status', 'pending')
            ]);

            const calcTrend = (total: number, prevTotal: number) => total - prevTotal;
            const totalDonation = donationData.data?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

            setStats({
                materials: { total: matTotal.count || 0, trend: calcTrend(matTotal.count || 0, matLast.count || 0) },
                questions: { total: quesTotal.count || 0, trend: calcTrend(quesTotal.count || 0, quesLast.count || 0) },
                donations: { total: totalDonation, count: donationData.data?.length || 0 },
                users: { total: userTotal.count || 0, trend: calcTrend(userTotal.count || 0, userLast.count || 0) },
                pendingCount: (pendingReviews.count || 0)
            });

            const rawActivities = [
                ...(recentUsers.data || []).map(u => ({ type: 'user', title: u.full_name || 'New User', action: 'New Registration', created_at: u.created_at })),
                ...(recentResources.data || []).map(r => ({ type: 'blog', title: r.title, action: `New ${r.type}`, created_at: r.created_at })),
                ...(recentNews.data || []).map(n => ({ type: 'news', title: n.title, action: 'News Update', created_at: n.created_at })),
            ];

            setActivities(rawActivities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
            setLatestUpdate(sysUpdate.data);
            setNotifications(recentFeedbacks.data || []); 

        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchDropdowns = useCallback(async () => {
        const { data: s } = await supabase.from("segments").select("*").order('id'); setSegments(s || []);
        const { data: c } = await supabase.from("categories").select("*").order('name'); setCategories(c || []);
    }, []);

    const fetchGroups = async (segId: string) => { const { data } = await supabase.from("groups").select("*").eq("segment_id", segId).order('id'); setGroups(data || []); };
    const fetchSubjects = async (grpId: string) => { const { data } = await supabase.from("subjects").select("*").eq("group_id", grpId).order('id'); setSubjects(data || []); };

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { router.replace("/login"); return; }
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            if (profile?.role !== 'admin' && profile?.role !== 'editor') { router.replace("/"); return; }
            setCurrentUser(profile);
            fetchDashboardData();
            fetchDropdowns();
        };
        init();
    }, [router, fetchDashboardData, fetchDropdowns]);

    if (isLoading && !currentUser) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
    );

    const navItems = [
      { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'question_bank', label: 'Question Bank', icon: Database },
      { id: 'donations', label: 'Donations', icon: Heart },
      { id: 'pending', label: 'Pending Reviews', icon: AlertTriangle, badge: stats.pendingCount },
      { isDivider: true, label: 'Content' },
      { id: 'materials', label: 'Study Materials', icon: FileStack },
      { id: 'lecture_sheets', label: 'Lecture Sheets', icon: FileText },
      { id: 'lesson_plans', label: 'Lesson Plans', icon: BookOpen },
      { id: 'ebooks', label: 'eBooks', icon: BookOpen },
      { id: 'courses', label: 'Courses', icon: GraduationCap },
      { id: 'news', label: 'Newsroom', icon: Newspaper },
      { isDivider: true, label: 'Settings' },
      { id: 'hierarchy', label: 'Hierarchy', icon: Layers },
      { id: 'categories', label: 'Categories', icon: Settings },
      { id: 'users', label: 'Users', icon: Users },
      { id: 'feedbacks', label: 'Feedbacks', icon: MessageSquare }
    ];

    return (
        <div className={`flex min-h-screen transition-colors duration-300 font-sans ${isDark ? 'bg-[#0f111a]' : 'bg-[#f5f7fa]'}`}>
            
            {/* --- PHOENIX SIDEBAR --- */}
            <aside className={`fixed top-0 bottom-0 left-0 bg-white border-r border-slate-200 z-50 transition-all duration-300 flex flex-col ${isSidebarCollapsed ? 'w-20' : 'w-[260px]'} ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                
                {/* Logo Section */}
                <div className="h-20 flex items-center px-6 border-b border-slate-100">
                    {!isSidebarCollapsed && (
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black italic">N</div>
                         <h2 className="text-xl font-black tracking-tighter text-slate-900">Phoenix<span className="text-indigo-600">Admin</span></h2>
                      </div>
                    )}
                    {isSidebarCollapsed && <div className="mx-auto w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black italic">N</div>}
                </div>

                {/* Nav Section */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                    {navItems.map((item, idx) => {
                      if (item.isDivider) {
                        return !isSidebarCollapsed ? (
                          <div key={idx} className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</div>
                        ) : <div key={idx} className="h-px bg-slate-100 my-4" />;
                      }
                      
                      const Icon = item.icon!;
                      const isActive = activeTab === item.id;
                      
                      return (
                        <button 
                          key={item.id}
                          onClick={() => item.id && setActiveTab(item.id)}
                          className={`w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                            isActive 
                            ? "bg-indigo-50 text-indigo-700 font-bold" 
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                            <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-900"}`} />
                            {!isSidebarCollapsed && <span className="text-sm">{item.label}</span>}
                            {isActive && !isSidebarCollapsed && <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
                            {item.badge ? (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 min-w-[20px] h-5 px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                {item.badge}
                              </span>
                            ) : null}
                            
                            {/* Tooltip for collapsed mode */}
                            {isSidebarCollapsed && (
                              <div className="absolute left-full ml-4 px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]">
                                {item.label}
                              </div>
                            )}
                        </button>
                      );
                    })}
                </nav>

                {/* Footer Section */}
                <div className="p-4 border-t border-slate-100">
                   <button 
                     onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                     className="w-full h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                   >
                     {isSidebarCollapsed ? <Menu className="w-5 h-5"/> : <div className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">Collapse Sidebar <ChevronRight className="w-3.5 h-3.5 rotate-180"/></div>}
                   </button>
                </div>
            </aside>

            {/* --- MAIN STACK --- */}
            <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[260px]'}`}>
                
                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500"><Menu className="w-6 h-6"/></button>
                        <div className="relative group hidden md:block">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600" />
                           <input type="text" placeholder="Search anything..." className="pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none w-64 transition-all" />
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                           <Bell className="w-5 h-5" />
                           {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>}
                        </button>
                        <div className="h-8 w-px bg-slate-100"></div>
                        <div className="flex items-center gap-3 cursor-pointer group">
                           <div className="text-right hidden sm:block">
                               <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{currentUser?.full_name || 'Admin'}</p>
                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chief Editor</p>
                           </div>
                           <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-black">
                               {currentUser?.full_name?.charAt(0) || 'A'}
                           </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 lg:p-12 max-w-[1600px] mx-auto w-full space-y-10">
                    
                    {activeTab === 'overview' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             
                             {/* Stats Grid */}
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 group hover:shadow-xl hover:-translate-y-1 transition-all">
                                   <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Users className="w-7 h-7"/></div>
                                   <div>
                                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Students</p>
                                      <h4 className="text-2xl font-black text-slate-900">{stats.users.total.toLocaleString()}</h4>
                                      <p className="text-[10px] font-bold text-green-500 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +{stats.users.trend} this month</p>
                                   </div>
                                </div>
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 group hover:shadow-xl hover:-translate-y-1 transition-all">
                                   <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><DollarSign className="w-7 h-7"/></div>
                                   <div>
                                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Donations</p>
                                      <h4 className="text-2xl font-black text-slate-900">৳{stats.donations.total.toLocaleString()}</h4>
                                      <p className="text-[10px] font-bold text-emerald-600 mt-1">{stats.donations.count} contributions</p>
                                   </div>
                                </div>
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 group hover:shadow-xl hover:-translate-y-1 transition-all">
                                   <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><FileStack className="w-7 h-7"/></div>
                                   <div>
                                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Study Resources</p>
                                      <h4 className="text-2xl font-black text-slate-900">{stats.materials.total}</h4>
                                      <p className="text-[10px] font-bold text-slate-400 mt-1">Live across all segments</p>
                                   </div>
                                </div>
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 group hover:shadow-xl hover:-translate-y-1 transition-all">
                                   <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center"><AlertTriangle className="w-7 h-7"/></div>
                                   <div>
                                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pending Review</p>
                                      <h4 className={`text-2xl font-black ${stats.pendingCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>{stats.pendingCount}</h4>
                                      <p className="text-[10px] font-bold text-rose-400 mt-1">Needs immediate attention</p>
                                   </div>
                                </div>
                             </div>

                             {/* Mid Section: Chart & Activity */}
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-8">
                                   <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                                      <div className="flex items-center justify-between mb-8">
                                         <div>
                                            <h4 className="text-xl font-black text-slate-900">Platform Growth</h4>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">User activity over time</p>
                                         </div>
                                         <div className="flex gap-2">
                                            {['Month', 'Year'].map(t => <button key={t} className="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-50">{t}</button>)}
                                         </div>
                                      </div>
                                      <div className="h-[350px]"><AnalyticsChart /></div>
                                   </div>
                                   
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                      <PlatformInsights />
                                      <VersionNote latestUpdate={latestUpdate} onUpdate={fetchDashboardData} />
                                   </div>
                                </div>
                                
                                <div className="lg:col-span-1">
                                   <ActivityFeed activities={activities} onViewAll={() => {}} />
                                   
                                   {/* Quick Link Card */}
                                   <div className="mt-8 bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                                      <Heart className="w-10 h-10 text-white/30 mb-6" />
                                      <h4 className="text-2xl font-black mb-4 leading-tight">Manage Donations</h4>
                                      <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Review and approve new contributions from the donor portal.</p>
                                      <button onClick={() => setActiveTab('donations')} className="px-6 py-3 bg-white text-indigo-700 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-indigo-50 transition-all">Go to Donations</button>
                                   </div>
                                </div>
                             </div>

                        </div>
                    )}

                    {/* Other Tabs */}
                    {activeTab === 'donations' && <DonationManager darkMode={isDark} />}
                    {activeTab === 'question_bank' && <QuestionBankManager darkMode={isDark} />}
                    {activeTab === 'pending' && <PendingManager darkMode={isDark} />}
                    {activeTab === 'users' && <UserManagement onShowError={showError} onShowSuccess={showSuccess} darkMode={isDark} />}
                    {activeTab === 'hierarchy' && <HierarchyManager segments={segments} groups={groups} subjects={subjects} selectedSegment={selectedSegment} setSelectedSegment={setSelectedSegment} selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup} fetchDropdowns={fetchDropdowns} fetchGroups={fetchGroups} fetchSubjects={fetchSubjects} darkMode={isDark} />}
                    {activeTab === 'categories' && <CategoryManager categories={categories} categoryCounts={{}} fetchCategories={fetchDropdowns} darkMode={isDark} />}
                    {activeTab === 'feedbacks' && <FeedbackManager darkMode={isDark} />}
                    {activeTab === 'lecture_sheets' && <LectureSheetManager segments={segments} groups={groups} subjects={subjects} darkMode={isDark} />}
                    {activeTab === 'lesson_plans' && <LessonPlanManager subjects={subjects} darkMode={isDark} />}
                    {activeTab === 'courses' && <CourseManager darkMode={isDark} />}
                    {activeTab === 'news' && <ContentManager activeTab="news" segments={segments} groups={groups} subjects={subjects} categories={categories} fetchGroups={fetchGroups} fetchSubjects={fetchSubjects} showSuccess={showSuccess} showError={showError} confirmAction={()=>{}} openCategoryModal={()=>{}} darkMode={isDark} />}
                    {activeTab === 'materials' && <ContentManager activeTab="materials" segments={segments} groups={groups} subjects={subjects} categories={categories} fetchGroups={fetchGroups} fetchSubjects={fetchSubjects} showSuccess={showSuccess} showError={showError} confirmAction={()=>{}} openCategoryModal={()=>{}} darkMode={isDark} />}
                    {activeTab === 'ebooks' && <ContentManager activeTab="ebooks" segments={segments} groups={groups} subjects={subjects} categories={categories} fetchGroups={fetchGroups} fetchSubjects={fetchSubjects} showSuccess={showSuccess} showError={showError} confirmAction={()=>{}} openCategoryModal={()=>{}} darkMode={isDark} />}

                </div>
            </main>

            {/* Modal */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full text-center shadow-3xl animate-in zoom-in-95 duration-200">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${modal.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-green-50 text-green-600'}`}>
                           {modal.type === 'error' ? <AlertTriangle className="w-8 h-8"/> : <CheckCircle2 className="w-8 h-8"/>}
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">{modal.type === 'error' ? 'Error' : 'Success!'}</h3>
                        <p className="text-slate-500 font-medium leading-relaxed mb-8">{modal.message}</p>
                        <button onClick={closeModal} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all">Continue</button>
                    </div>
                </div>
            )}
        </div>
    );
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  );
}