"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/shared/ThemeProvider";
import AnalyticsChart from "@/components/admin/dashboard/AnalyticsChart";
import { 
  LayoutDashboard, FileText, Users, Layers, BookOpen, 
  Bell, FileStack, Settings, HelpCircle, X, Clock, MessageSquare, RefreshCw, 
  AlertTriangle, Database, GraduationCap, Newspaper, Palette, Heart, TrendingUp, DollarSign, UserCheck, Menu, Search, ChevronRight, Moon, Sun, Monitor, Mail, CheckCircle2 as LucideCheckCircle2,
  Calendar, Award, AlertCircle
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
import QotDManager from "@/components/admin/sections/QotDManager";
import AnalyticsSuite from "@/components/admin/sections/AnalyticsSuite";
import BadgeManager from "@/components/admin/sections/BadgeManager";
import Discussion from "@/components/shared/Discussion";
import PendingManager from "@/components/admin/sections/PendingManager";
import QuestionBankManager from "@/components/admin/sections/QuestionBankManager"; 
import FeedbackManager from "@/components/admin/sections/FeedbackManager";
import LectureSheetManager from "@/components/admin/sections/LectureSheetManager";
import LessonPlanManager from "@/components/admin/sections/LessonPlanManager";
import CourseManager from "@/components/admin/sections/CourseManager";
import CertificateDesigner from "@/components/admin/sections/CertificateDesigner";
import DonationManager from "@/components/admin/sections/DonationManager";
import NewsletterManager from "@/components/admin/sections/NewsletterManager";
import ExamManager from "@/components/admin/sections/ExamManager";


const getMonthRanges = () => {
    const now = new Date();
    const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    return { startThisMonth };
};

export default function AdminDashboard() {
    const supabase = createClient();
    const router = useRouter();
    const { isDark, toggleTheme } = useTheme();
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
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

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
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from("donations").select('amount').eq('status', 'approved'),

                supabase.from("resources").select('*', { count: 'exact', head: true }).in('type', ['pdf', 'video', 'blog']).lt('created_at', startThisMonth),
                supabase.from("question_bank").select('*', { count: 'exact', head: true }).lt('created_at', startThisMonth),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).lt('created_at', startThisMonth),
                
                supabase.from('profiles').select('id, full_name, created_at').order('created_at', { ascending: false }).limit(5),
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
        
        // Fetch all groups and subjects for sections that need them (like ExamManager)
        const { data: g } = await supabase.from("groups").select("*").order('id'); setGroups(g || []);
        const { data: sub } = await supabase.from("subjects").select("*").order('id'); setSubjects(sub || []);
    }, [supabase]);

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

    const navGroups = [
      {
        label: 'Overview',
        items: [
          { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'analytics', label: 'System Insights', icon: TrendingUp },
          { id: 'feedback', label: 'User Feedback', icon: MessageSquare },
        ]
      },
      {
        label: 'Academic Core',
        items: [
          { id: 'hierarchy', label: 'Hierarchy', icon: Layers },
          { id: 'categories', label: 'Categories', icon: Settings },
          { id: 'question_bank', label: 'Question Bank', icon: Database },
          { id: 'lesson_plans', label: 'Lesson Plans', icon: BookOpen },
          { id: 'exams', label: 'Exam Center', icon: Calendar },
          { id: 'lecture_sheets', label: 'Lecture Sheets', icon: FileText },
        ]
      },
      {
        label: 'Academic Assets',
        items: [
          { id: 'materials', label: 'Study Materials', icon: FileStack },
          { id: 'ebooks', label: 'eBooks', icon: BookOpen },
          { id: 'courses', label: 'Courses', icon: GraduationCap },
          { id: 'qotd', label: 'QotD Scheduler', icon: Calendar },
        ]
      },
      {
        label: 'Community & Growth',
        items: [
          { id: 'discussion', label: 'Student Discussions', icon: MessageSquare },
          { id: 'newsletter', label: 'Newsletter', icon: Mail },
          { id: 'donations', label: 'Donation Hub', icon: Heart },
          { id: 'badges', label: 'Gamification', icon: Award },
          { id: 'news', label: 'Newsroom', icon: Newspaper },
        ]
      },
      {
        label: 'System Control',
        items: [
          { id: 'pending', label: 'Pending Reviews', icon: AlertTriangle, badge: stats.pendingCount },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'segment_updates', label: 'Segment Updates', icon: AlertCircle },
        ]
      }
    ];

    return (
        <div className={`flex min-h-screen transition-colors duration-500 font-sans ${isDark ? 'bg-[#0a0c14]' : 'bg-[#f8fafc]'}`}>
            
            {/* --- AURORA SIDEBAR --- */}
            <div 
              className={`fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onClick={() => setIsSidebarOpen(false)}
            />

            <aside className={`fixed top-0 bottom-0 left-0 ${isDark ? 'bg-[#121421] border-slate-800' : 'bg-white border-slate-200'} z-[70] transition-all duration-300 flex flex-col ${isSidebarCollapsed ? 'w-20' : 'w-[280px]'} ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} shadow-2xl lg:shadow-none`}>
                
                {/* Logo Section with Aurora Glow */}
                <div className="h-24 flex items-center px-8 relative overflow-hidden shrink-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/10 via-purple-600/5 to-transparent blur-2xl"></div>
                    {!isSidebarCollapsed && (
                      <div className="flex items-center gap-4 relative z-10 transition-all duration-300">
                         <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/30 transform rotate-3">N</div>
                         <div>
                            <h2 className={`text-xl font-black tracking-tighter leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>NextPrep<span className="text-indigo-600">BD</span></h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Admin Console</p>
                         </div>
                      </div>
                    )}
                    {isSidebarCollapsed && <div className="mx-auto w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/30">N</div>}
                    
                    {/* Mobile Close Button */}
                    <button 
                      onClick={() => setIsSidebarOpen(false)}
                      className="lg:hidden absolute top-6 right-6 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-all"
                    >
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                {/* Nav Section */}
                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8 custom-scrollbar">
                    {navGroups.map((group, gIdx) => (
                      <div key={gIdx} className="space-y-2">
                        {!isSidebarCollapsed && (
                          <p className={`px-4 text-[10px] font-black tracking-[0.2em] uppercase transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {group.label}
                          </p>
                        )}
                        <div className="space-y-1">
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            
                            return (
                              <button 
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                                className={`w-full group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all relative ${
                                  isActive 
                                  ? (isDark ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold" : "bg-indigo-600 text-white shadow-lg shadow-indigo-300 font-bold") 
                                  : (isDark ? "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900")
                                }`}
                              >
                                  <Icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                                  {!isSidebarCollapsed && <span className="text-sm tracking-tight">{item.label}</span>}
                                  
                                  {item.badge ? (
                                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 ${isDark ? 'border-[#121421]' : 'border-white'} shadow-sm`}>
                                      {item.badge}
                                    </span>
                                  ) : null}
                                  
                                  {/* Tooltip for collapsed mode */}
                                  {isSidebarCollapsed && (
                                    <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-[100] shadow-xl">
                                      {item.label}
                                    </div>
                                  )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                </nav>

                {/* Footer Section */}
                <div className={`p-6 mt-auto shrink-0 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                   <button 
                     onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                     className={`w-full h-12 rounded-2xl flex items-center justify-center transition-all ${isDark ? 'bg-slate-800/50 text-slate-500 hover:text-indigo-400 hover:bg-slate-800' : 'bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-slate-100'}`}
                   >
                     {isSidebarCollapsed ? <Menu className="w-5 h-5"/> : <div className="text-[10px] font-black tracking-widest flex items-center gap-3 uppercase">Collapse Menu <ChevronRight className="w-4 h-4 rotate-180"/></div>}
                   </button>
                </div>
            </aside>

            {/* --- MAIN STACK --- */}
            <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'} w-full relative`}>
                
                {/* Header */}
                <AdminHeader 
                    user={currentUser} 
                    activeTab={activeTab} 
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    notifications={notifications}
                />

                <div className="flex-1 p-4 sm:p-6 lg:p-10 xl:p-12 max-w-[1600px] mx-auto w-full">
                    
                    {activeTab === 'overview' && (
                        <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                             
                             {/* Aurora Welcome Hero */}
                             <div className="relative overflow-hidden rounded-[2.5rem] p-8 sm:p-12 bg-indigo-600 text-white shadow-2xl shadow-indigo-500/20">
                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse"></div>
                                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/30 rounded-full blur-[80px] -ml-24 -mb-24"></div>
                                
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="text-center md:text-left">
                                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">Welcome back, {currentUser?.full_name?.split(' ')[0] || 'Admin'}!</h1>
                                        <p className="text-indigo-100 text-sm sm:text-lg font-medium max-w-lg leading-relaxed opacity-90">Your command center is ready. You have <span className="font-black text-white underline underline-offset-4 decoration-rose-400">{stats.pendingCount} items</span> awaiting review today.</p>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-4">
                                        <button onClick={() => setActiveTab('pending')} className="px-6 py-3 bg-white text-indigo-700 rounded-2xl text-xs font-black tracking-widest uppercase shadow-xl hover:scale-105 transition-all active:scale-95">Review Pending</button>
                                        <button onClick={fetchDashboardData} className="px-6 py-3 bg-indigo-500/30 backdrop-blur-md text-white border border-white/20 rounded-2xl text-xs font-black tracking-widest uppercase hover:bg-indigo-500/50 transition-all flex items-center gap-2">
                                            <RefreshCw className="w-4 h-4"/> Sync Data
                                        </button>
                                    </div>
                                </div>
                             </div>

                              {/* Stats Grid - High Density */}
                             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                <div className={`p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border transition-all hover:shadow-2xl hover:-translate-y-1 ${isDark ? 'bg-[#1a1d2d] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                                   <div className="flex items-center justify-between mb-3 sm:mb-4">
                                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/10 text-indigo-500 rounded-xl sm:rounded-2xl flex items-center justify-center"><Users className="w-5 h-5 sm:w-6 sm:h-6"/></div>
                                      <span className="text-[8px] sm:text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">+{stats.users.trend}</span>
                                   </div>
                                   <p className={`text-[9px] sm:text-[11px] font-black tracking-[0.1em] uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Students</p>
                                   <h4 className={`text-xl sm:text-3xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.users.total.toLocaleString()}</h4>
                                </div>

                                <div className={`p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border transition-all hover:shadow-2xl hover:-translate-y-1 ${isDark ? 'bg-[#1a1d2d] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                                   <div className="flex items-center justify-between mb-3 sm:mb-4">
                                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/10 text-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center"><DollarSign className="w-5 h-5 sm:w-6 sm:h-6"/></div>
                                      <span className="text-[8px] sm:text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">{stats.donations.count}</span>
                                   </div>
                                   <p className={`text-[9px] sm:text-[11px] font-black tracking-[0.1em] uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Donations</p>
                                   <h4 className={`text-xl sm:text-3xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>৳{stats.donations.total.toLocaleString()}</h4>
                                </div>

                                <div className={`p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border transition-all hover:shadow-2xl hover:-translate-y-1 ${isDark ? 'bg-[#1a1d2d] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                                   <div className="flex items-center justify-between mb-3 sm:mb-4">
                                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 text-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center"><FileStack className="w-5 h-5 sm:w-6 sm:h-6"/></div>
                                      <span className="text-[8px] sm:text-[10px] font-black text-blue-400 bg-blue-400/10 px-2 py-1 rounded-lg">ACT</span>
                                   </div>
                                   <p className={`text-[9px] sm:text-[11px] font-black tracking-[0.1em] uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Resources</p>
                                   <h4 className={`text-xl sm:text-3xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stats.materials.total}</h4>
                                </div>

                                <div className={`p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border transition-all hover:shadow-2xl hover:-translate-y-1 ${isDark ? 'bg-[#1a1d2d] border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                                   <div className="flex items-center justify-between mb-3 sm:mb-4">
                                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-500/10 text-rose-500 rounded-xl sm:rounded-2xl flex items-center justify-center"><AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6"/></div>
                                      <span className={`text-[8px] sm:text-[10px] font-black px-2 py-1 rounded-lg ${stats.pendingCount > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}>REQ</span>
                                   </div>
                                   <p className={`text-[9px] sm:text-[11px] font-black tracking-[0.1em] uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Queue</p>
                                   <h4 className={`text-xl sm:text-3xl font-black mt-1 ${stats.pendingCount > 0 ? 'text-rose-500' : isDark ? 'text-white' : 'text-slate-900'}`}>{stats.pendingCount}</h4>
                                </div>
                             </div>


                             {/* Mid Section: Chart & Activity */}
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
                                <div className="lg:col-span-2 space-y-8 sm:space-y-12">
                                   <div className={`rounded-[2.5rem] border p-6 sm:p-10 ${isDark ? 'bg-[#1a1d2d] border-slate-800' : 'bg-white border-slate-100 shadow-lg'}`}>
                                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
                                         <div>
                                            <h4 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Platform Growth</h4>
                                            <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mt-2">Aggregate analytics engine</p>
                                         </div>
                                         <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                            {['Month', 'Year'].map(t => <button key={t} className="px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm">View {t}</button>)}
                                         </div>
                                      </div>
                                      <div className="h-[300px] sm:h-[400px]"><AnalyticsChart /></div>
                                   </div>
                                   
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                                      <PlatformInsights />
                                      <VersionNote latestUpdate={latestUpdate} onUpdate={fetchDashboardData} />
                                   </div>
                                </div>
                                
                                <div className="lg:col-span-1 space-y-8 sm:space-y-12">
                                   <ActivityFeed activities={activities.slice(0, 10)} onViewAll={() => setIsActivityModalOpen(true)} />
                                   
                                   {/* Advanced Control Box */}
                                   <div className="bg-gradient-to-br from-[#1e1b4b] to-[#312e81] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl group">
                                      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -mr-24 -mt-24 group-hover:scale-125 transition-transform duration-1000"></div>
                                      <Database className="w-10 h-10 text-indigo-400/50 mb-8" />
                                      <h4 className="text-2xl font-black mb-4 leading-tight">System Core</h4>
                                      <p className="text-indigo-200/80 text-sm mb-10 leading-relaxed font-medium">Manage database schemas, caching layers, and high-level platform hierarchy.</p>
                                      <button onClick={() => setActiveTab('hierarchy')} className="w-full py-4 bg-white text-indigo-950 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase shadow-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                                          Hierarchy Manager <ChevronRight className="w-4 h-4"/>
                                      </button>
                                   </div>
                                </div>
                             </div>

                        </div>
                    )}

                    {/* Department Sections */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {activeTab === 'donations' && <DonationManager darkMode={isDark} />}
                      {activeTab === 'newsletter' && <NewsletterManager darkMode={isDark} />}
                      {activeTab === 'question_bank' && <QuestionBankManager darkMode={isDark} />}
                      {activeTab === 'qotd' && <QotDManager darkMode={isDark} />}
                      {activeTab === 'analytics' && <AnalyticsSuite darkMode={isDark} />}
                      {activeTab === 'badges' && <BadgeManager darkMode={isDark} />}
                      {activeTab === 'pending' && <PendingManager darkMode={isDark} />}
                      {activeTab === 'users' && <UserManagement onShowError={showError} onShowSuccess={showSuccess} darkMode={isDark} />}
                      {activeTab === 'hierarchy' && <HierarchyManager segments={segments} groups={groups} subjects={subjects} selectedSegment={selectedSegment} setSelectedSegment={setSelectedSegment} selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup} fetchDropdowns={fetchDropdowns} fetchGroups={fetchGroups} fetchSubjects={fetchSubjects} darkMode={isDark} />}
                      {activeTab === 'categories' && <CategoryManager categories={categories} categoryCounts={{}} fetchCategories={fetchDropdowns} darkMode={isDark} />}
                      {activeTab === 'lecture_sheets' && <LectureSheetManager segments={segments} groups={groups} subjects={subjects} darkMode={isDark} />}
                      {activeTab === 'lesson_plans' && <LessonPlanManager subjects={subjects} darkMode={isDark} />}
                      {activeTab === 'courses' && <CourseManager darkMode={isDark} />}
                      {activeTab === 'exams' && <ExamManager segments={segments} groups={groups} subjects={subjects} darkMode={isDark} /> }
                      {activeTab === 'feedback' && <FeedbackManager darkMode={isDark} />}
                      {activeTab === 'discussion' && <div className="p-6 h-full bg-white dark:bg-[#1a1d2d] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"><Discussion itemType="admin" itemId="admin" /></div>}
                      {activeTab === 'news' && <ContentManager activeTab="news" segments={segments} groups={groups} subjects={subjects} categories={categories} fetchGroups={fetchGroups} fetchSubjects={fetchSubjects} showSuccess={showSuccess} showError={showError} confirmAction={()=>{}} openCategoryModal={()=>{}} darkMode={isDark} />}
                      {activeTab === 'materials' && <ContentManager activeTab="materials" segments={segments} groups={groups} subjects={subjects} categories={categories} fetchGroups={fetchGroups} fetchSubjects={fetchSubjects} showSuccess={showSuccess} showError={showError} confirmAction={()=>{}} openCategoryModal={()=>{}} darkMode={isDark} />}
                      {activeTab === 'segment_updates' && <ContentManager activeTab="segment_updates" segments={segments} groups={groups} subjects={subjects} categories={categories} fetchGroups={fetchGroups} fetchSubjects={fetchSubjects} showSuccess={showSuccess} showError={showError} confirmAction={()=>{}} openCategoryModal={()=>{}} darkMode={isDark} />}
                      {activeTab === 'ebooks' && <ContentManager activeTab="ebooks" segments={segments} groups={groups} subjects={subjects} categories={categories} fetchGroups={fetchGroups} fetchSubjects={fetchSubjects} showSuccess={showSuccess} showError={showError} confirmAction={()=>{}} openCategoryModal={()=>{}} darkMode={isDark} />}
                    </div>

                </div>
            </main>


            {/* Modal */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full text-center shadow-3xl animate-in zoom-in-95 duration-200">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${modal.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-green-50 text-green-600'}`}>
                           {modal.type === 'error' ? <AlertTriangle className="w-8 h-8"/> : <CheckCircleIcon className="w-8 h-8"/>}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{modal.type === 'error' ? 'Error' : 'Success!'}</h3>
                        <p className="text-slate-500 font-medium leading-relaxed mb-8">{modal.message}</p>
                        <button onClick={closeModal} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold tracking-widest shadow-xl hover:bg-slate-800 transition-all">Continue</button>
                    </div>
                </div>
            )}
            {/* Activity View All Modal */}
            {isActivityModalOpen && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-3xl w-full max-w-2xl overflow-hidden flex flex-col h-[80vh] animate-in slide-in-from-bottom-8 duration-300">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                   <Clock className="w-6 h-6 text-indigo-600" /> Recent Activities
                                </h3>
                                <p className="text-[11px] font-bold tracking-widest text-slate-400 mt-1">Platform-wide audit trail</p>
                            </div>
                            <button onClick={() => setIsActivityModalOpen(false)} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 text-slate-400"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-2 custom-scrollbar">
                           <ActivityFeed activities={activities} onViewAll={() => {}} />
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                            <button onClick={() => setIsActivityModalOpen(false)} className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold tracking-widest hover:bg-slate-800 transition-all">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  );
}
