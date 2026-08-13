"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/shared/ThemeProvider";
import AnalyticsChart from "@/components/admin/dashboard/AnalyticsChart";
import { 
  LayoutDashboard, FileText, Users, Layers, BookOpen, 
  Bell, FileStack, Settings, HelpCircle, X, Clock, MessageSquare, ShieldAlert, RefreshCw, 
  AlertTriangle, Database, GraduationCap, Newspaper, Palette, Heart, TrendingUp, DollarSign, UserCheck, Menu, Search, ChevronRight, Moon, Sun, Monitor, Mail, CheckCircle2 as LucideCheckCircle2,
  Calendar, Award, AlertCircle
} from "lucide-react";

import StatsCard from "@/components/admin/dashboard/StatsCard";
import ActivityFeed from "@/components/admin/dashboard/ActivityFeed";
import PlatformInsights from "@/components/admin/dashboard/PlatformInsights";
import VersionNote from "@/components/admin/dashboard/VersionNote";
import AdminHeader from "@/components/admin/AdminHeader"; 

import dynamic from "next/dynamic";

const UserManagement = dynamic(() => import("@/components/UserManagement"), { ssr: false });
const HierarchyManager = dynamic(() => import("@/components/admin/sections/HierarchyManager"), { ssr: false });
const CategoryManager = dynamic(() => import("@/components/admin/sections/CategoryManager"), { ssr: false });
const ContentManager = dynamic(() => import("@/components/admin/sections/ContentManager"), { ssr: false });
const QotDManager = dynamic(() => import("@/components/admin/sections/QotDManager"), { ssr: false });
const BadgeManager = dynamic(() => import("@/components/admin/sections/BadgeManager"), { ssr: false });
const Discussion = dynamic(() => import("@/components/shared/Discussion"), { ssr: false });
const PendingManager = dynamic(() => import("@/components/admin/sections/PendingManager"), { ssr: false });
const QuestionBankManager = dynamic(() => import("@/components/admin/sections/QuestionBankManager"), { ssr: false });
const FeedbackManager = dynamic(() => import("@/components/admin/sections/FeedbackManager"), { ssr: false });
const LectureSheetManager = dynamic(() => import("@/components/admin/sections/LectureSheetManager"), { ssr: false });
const LessonPlanManager = dynamic(() => import("@/components/admin/sections/LessonPlanManager"), { ssr: false });
const CourseManager = dynamic(() => import("@/components/admin/sections/CourseManager"), { ssr: false });
const CertificateDesigner = dynamic(() => import("@/components/admin/sections/CertificateDesigner"), { ssr: false });
const DonationManager = dynamic(() => import("@/components/admin/sections/DonationManager"), { ssr: false });
const NewsletterManager = dynamic(() => import("@/components/admin/sections/NewsletterManager"), { ssr: false });
const ExamManager = dynamic(() => import("@/components/admin/sections/ExamManager"), { ssr: false });
const ForumManager = dynamic(() => import("@/components/admin/sections/ForumManager"), { ssr: false });


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
        pendingCount: 0,
        pendingReportsCount: 0
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
                sysUpdate, recentFeedbacks, pendingReviews,
                pendingReports,
                recentForumThreads, recentForumReports, recentForumUpvotes
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
                supabase.from("resources").select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from("forum_moderation_reports").select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                
                supabase.from("forum_threads").select("id, title, created_at, updated_at").order("created_at", { ascending: false }).limit(5),
                supabase.from("forum_moderation_reports").select("id, reason, created_at, reporter:reporter_id(full_name), thread:thread_id(title)").order("created_at", { ascending: false }).limit(5),
                supabase.from("forum_upvotes").select("id, created_at, thread:forum_threads(title), comment:forum_comments(content, thread:forum_threads(title)), user:profiles!forum_upvotes_user_id_fkey(full_name)").order("created_at", { ascending: false }).limit(5)
            ]);

            const calcTrend = (total: number, prevTotal: number) => total - prevTotal;
            const totalDonation = donationData.data?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

            setStats({
                materials: { total: matTotal.count || 0, trend: calcTrend(matTotal.count || 0, matLast.count || 0) },
                questions: { total: quesTotal.count || 0, trend: calcTrend(quesTotal.count || 0, quesLast.count || 0) },
                donations: { total: totalDonation, count: donationData.data?.length || 0 },
                users: { total: userTotal.count || 0, trend: calcTrend(userTotal.count || 0, userLast.count || 0) },
                pendingCount: (pendingReviews.count || 0),
                pendingReportsCount: (pendingReports.count || 0)
            });

            const rawActivities = [
                ...(recentUsers.data || []).map(u => ({ type: 'user', title: u.full_name || 'New User', action: 'New Registration', created_at: u.created_at })),
                ...(recentResources.data || []).map(r => ({ type: 'blog', title: r.title, action: `New ${r.type}`, created_at: r.created_at })),
                ...(recentNews.data || []).map(n => ({ type: 'news', title: n.title, action: 'News Update', created_at: n.created_at })),
                ...(recentForumThreads.data || []).map((t: any) => {
                    const isEdit = t.updated_at && new Date(t.updated_at).getTime() > new Date(t.created_at).getTime() + 1000;
                    return {
                        type: 'forum',
                        title: t.title,
                        action: isEdit ? 'Forum Thread Edited' : 'New Forum Post',
                        created_at: isEdit ? t.updated_at : t.created_at
                    };
                }),
                ...(recentForumReports.data || []).map((rep: any) => {
                    const reporterName = rep.reporter?.full_name || 'A user';
                    const threadTitle = rep.thread?.title || 'a discussion';
                    return {
                        type: 'report',
                        title: `"${threadTitle}" reported by ${reporterName} (Reason: ${rep.reason})`,
                        action: 'Forum Post Flagged',
                        created_at: rep.created_at
                    };
                }),
                ...(recentForumUpvotes.data || []).map((vote: any) => {
                    const voterName = vote.user?.full_name || 'Someone';
                    const targetTitle = vote.thread?.title 
                        ? vote.thread.title 
                        : vote.comment?.thread?.title 
                            ? `reply on "${vote.comment.thread.title}"` 
                            : 'a post';
                    return {
                        type: 'kudos',
                        title: `${voterName} liked "${targetTitle}"`,
                        action: 'Kudos Received',
                        created_at: vote.created_at
                    };
                }),
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
            // const { data: { session } } = await supabase.auth.getSession();
            // if (!session) { router.replace("/login"); return; }
            // const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            // if (profile?.role !== 'admin' && profile?.role !== 'editor') { router.replace("/"); return; }
            // setCurrentUser(profile);
            setCurrentUser({ full_name: 'Citi Admin', role: 'admin' });
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
        label: 'Dashboard & Insights',
        items: [
          { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'feedback', label: 'User Feedback', icon: MessageSquare },
        ]
      },
      {
        label: 'Academic Curriculum',
        items: [
          { id: 'hierarchy', label: 'Stage Hierarchy', icon: Layers },
          { id: 'categories', label: 'Class Categories', icon: Settings },
          { id: 'lesson_plans', label: 'Lesson Plans', icon: BookOpen },
          { id: 'lecture_sheets', label: 'Lecture Sheets', icon: FileText },
        ]
      },
      {
        label: 'Assessments & Practice',
        items: [
          { id: 'question_bank', label: 'Question Bank', icon: Database },
          { id: 'exams', label: 'Exam Center', icon: Calendar },
          { id: 'qotd', label: 'QotD Scheduler', icon: Calendar },
        ]
      },
      {
        label: 'Learning Materials',
        items: [
          { id: 'materials', label: 'Study Materials', icon: FileStack },
          { id: 'ebooks', label: 'eBooks Library', icon: BookOpen },
          { id: 'courses', label: 'Premium Courses', icon: GraduationCap },
        ]
      },
      {
        label: 'Community & Gamification',
        items: [
          { id: 'forum_manager', label: 'Forum Moderator', icon: ShieldAlert, badge: stats.pendingReportsCount },
          { id: 'discussion', label: 'Student Discussions', icon: MessageSquare },
          { id: 'badges', label: 'Badges & Rewards', icon: Award },
          { id: 'news', label: 'Newsroom', icon: Newspaper },
          { id: 'newsletter', label: 'Newsletter', icon: Mail },
          { id: 'donations', label: 'Donation Hub', icon: Heart },
        ]
      },
      {
        label: 'System Administration',
        items: [
          { id: 'pending', label: 'Pending Reviews', icon: AlertTriangle, badge: stats.pendingCount },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'segment_updates', label: 'Segment Updates', icon: AlertCircle },
        ]
      }
    ];

    return (
        <div className="bg-base text-ink-1 font-sans text-[13px] antialiased flex h-screen overflow-hidden">
            
            <aside className={`flex flex-col shrink-0 ${isSidebarCollapsed ? 'w-[72px]' : 'w-[248px]'} bg-surf-1 border-r border-line transition-all duration-300 ease-out z-[70] ${isSidebarOpen ? 'fixed inset-y-0 left-0 translate-x-0' : 'fixed inset-y-0 -translate-x-full lg:static lg:translate-x-0'}`}>
                <div className="h-16 flex items-center gap-3 px-5 border-b border-line shrink-0 relative">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-display font-bold text-[13px] shrink-0">N</div>
                    {!isSidebarCollapsed && (
                        <div className="overflow-hidden">
                            <p className="font-display font-bold text-[14px] leading-none tracking-tight whitespace-nowrap">NextPrepBD</p>
                            <p className="text-[10px] text-ink-3 tracking-wider mt-1 whitespace-nowrap">ADMIN CONSOLE</p>
                        </div>
                    )}
                    {/* Mobile Close Button */}
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden absolute top-4 right-4 p-2 rounded-xl text-ink-2 hover:bg-surf-2 transition-all">
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
                    {navGroups.map((group, gIdx) => (
                        <div key={gIdx}>
                            {!isSidebarCollapsed && <div className="px-3 mb-2 text-[10.5px] font-bold tracking-widest text-ink-3 uppercase">{group.label}</div>}
                            <div className="space-y-0.5">
                                {group.items.map(item => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                                            className={`w-full group flex items-center gap-3 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors relative ${isActive ? 'bg-surf-2 text-ink-1' : 'text-ink-2 hover:bg-surf-2 hover:text-ink-1'}`}
                                            title={isSidebarCollapsed ? item.label : ""}
                                        >
                                            {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-indigo-500 rounded-r-full"></div>}
                                            <Icon className={`w-[16px] h-[16px] shrink-0 ${isActive ? 'text-indigo-400' : 'text-ink-3 group-hover:text-ink-2'}`} />
                                            {!isSidebarCollapsed && <span>{item.label}</span>}
                                            {!isSidebarCollapsed && (item.badge ?? 0) > 0 && <span className="ml-auto bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-mono px-1.5 py-0.5 rounded">{item.badge}</span>}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="border-t border-line p-3 shrink-0">
                    <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-ink-2 hover:bg-surf-2 hover:text-ink-1 transition-colors justify-center lg:justify-start">
                        <Menu className="w-[18px] h-[18px] shrink-0" />
                        {!isSidebarCollapsed && <span className="whitespace-nowrap text-[12.5px] font-medium">Collapse menu</span>}
                    </button>
                </div>
            </aside>

            {/* --- MAIN STACK --- */}
            <div className="flex-1 flex flex-col min-w-0 bg-base">
                
                {/* Header */}
                <header className="h-16 shrink-0 border-b border-line flex items-center justify-between px-6 bg-surf-1/60 backdrop-blur z-[60]">
                    <div className="flex items-center gap-3 min-w-0">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden icon-btn p-2 rounded-lg hover:bg-surf-2 text-ink-2"><Menu className="w-[18px] h-[18px]"/></button>
                        <div className="min-w-0">
                            <h1 className="font-display font-bold text-[16px] leading-none tracking-tight truncate capitalize">{activeTab.replace('_', ' ')}</h1>
                            <p className="text-[11.5px] text-ink-3 mt-1 truncate">NextPrep Command Center</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="hidden md:flex items-center gap-2 bg-surf-2 border border-line rounded-lg px-3 h-9 w-64 focus-within:border-indigo-600">
                            <Search className="w-[15px] h-[15px] text-ink-3" />
                            <input type="text" placeholder="Search console..." className="bg-transparent outline-none text-[12.5px] w-full placeholder:text-ink-3" />
                        </div>
                        <button className="icon-btn p-2 rounded-lg hover:bg-surf-2 text-ink-2 relative" aria-label="Notifications">
                            <Bell className="w-[18px] h-[18px]" />
                            {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500"></span>}
                        </button>
                        <a href="https://nextprepbd.com/" target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg border border-line text-ink-2 hover:text-ink-1 hover:border-line-strong text-[12px] font-medium transition-colors">
                            <Monitor className="w-[13px] h-[13px]" /> View site
                        </a>
                        <div className="w-8 h-8 rounded-full bg-bronze-500 flex items-center justify-center text-[12px] font-bold text-base ml-1">{currentUser?.full_name?.charAt(0) || 'C'}</div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-6 py-5" id="mainContent">
                    
                    {activeTab === 'overview' && (
                        <section className="section space-y-5 animate-in fade-in duration-500">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="font-display font-bold text-[20px] text-ink-1">Welcome back, {currentUser?.full_name?.split(' ')[0] || 'Admin'}!</h2>
                                    <p className="text-[12.5px] text-ink-3 mt-1">Here's what's happening on your platform today.</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={fetchDashboardData} className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-line text-ink-2 hover:text-ink-1 hover:border-line-strong text-[12px] font-medium transition-colors">
                                        <RefreshCw className="w-[14px] h-[14px]" /> Sync data
                                    </button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                <div className="bg-surf-1 border border-line rounded-xl p-4 flex flex-col justify-between">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                                            <Users className="w-[15px] h-[15px] text-indigo-400" />
                                        </div>
                                        <span className="text-[10.5px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">+{stats.users.trend}%</span>
                                    </div>
                                    <div><p className="text-[11.5px] text-ink-3 mb-0.5">Total Users</p><p className="font-display font-bold text-[20px] tracking-tight text-ink-1">{stats.users.total.toLocaleString()}</p></div>
                                </div>
                                
                                <div className="bg-surf-1 border border-line rounded-xl p-4 flex flex-col justify-between">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                            <DollarSign className="w-[15px] h-[15px] text-emerald-400" />
                                        </div>
                                        <span className="text-[10.5px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{stats.donations.count} counts</span>
                                    </div>
                                    <div><p className="text-[11.5px] text-ink-3 mb-0.5">Donations</p><p className="font-display font-bold text-[20px] tracking-tight text-ink-1">৳{stats.donations.total.toLocaleString()}</p></div>
                                </div>

                                <div className="bg-surf-1 border border-line rounded-xl p-4 flex flex-col justify-between">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                            <FileStack className="w-[15px] h-[15px] text-blue-400" />
                                        </div>
                                    </div>
                                    <div><p className="text-[11.5px] text-ink-3 mb-0.5">Resources</p><p className="font-display font-bold text-[20px] tracking-tight text-ink-1">{stats.materials.total}</p></div>
                                </div>

                                <div className="bg-surf-1 border border-line rounded-xl p-4 flex flex-col justify-between">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
                                            <AlertTriangle className="w-[15px] h-[15px] text-rose-400" />
                                        </div>
                                        {stats.pendingCount > 0 && <span className="text-[10.5px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">REQ</span>}
                                    </div>
                                    <div><p className="text-[11.5px] text-ink-3 mb-0.5">Pending Approvals</p><p className="font-display font-bold text-[20px] tracking-tight text-ink-1">{stats.pendingCount}</p></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2 bg-surf-1 border border-line rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-display font-bold text-[13.5px]">Platform Growth</h3>
                                        <div className="flex bg-surf-2 border border-line rounded-lg p-0.5 text-[11px]">
                                            <button className="px-3 py-1 rounded-md text-ink-1 bg-surf-1 border border-line shadow-sm">Monthly</button>
                                            <button className="px-3 py-1 rounded-md text-ink-3 hover:text-ink-2">Yearly</button>
                                        </div>
                                    </div>
                                    <div className="h-64"><AnalyticsChart /></div>
                                </div>
                                <div className="bg-surf-1 border border-line rounded-xl p-5 flex flex-col">
                                    <h3 className="font-display font-bold text-[13.5px] mb-4">Content Mix</h3>
                                    <div className="flex-1 flex flex-col justify-center space-y-4">
                                        <div>
                                            <div className="flex justify-between text-[12px] mb-1"><span className="text-ink-2">Video Lectures</span><span className="font-mono">42</span></div>
                                            <div className="h-1.5 bg-surf-2 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{width: '45%'}}></div></div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[12px] mb-1"><span className="text-ink-2">PDF Notes</span><span className="font-mono">87</span></div>
                                            <div className="h-1.5 bg-surf-2 rounded-full overflow-hidden"><div className="h-full bg-blue-400 rounded-full" style={{width: '85%'}}></div></div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[12px] mb-1"><span className="text-ink-2">Quizzes</span><span className="font-mono">15</span></div>
                                            <div className="h-1.5 bg-surf-2 rounded-full overflow-hidden"><div className="h-full bg-emerald-400 rounded-full" style={{width: '25%'}}></div></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2 bg-surf-1 border border-line rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-display font-bold text-[13.5px]">Recent activity</h3>
                                        <button className="text-[11.5px] text-indigo-400 hover:text-indigo-300 font-medium">View all</button>
                                    </div>
                                    <div className="divide-y divide-line">
                                        <ActivityFeed activities={activities.slice(0,5)} onViewAll={()=>{}} />
                                    </div>
                                </div>
                                <div className="bg-surf-1 border border-line rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-display font-bold text-[13.5px]">System updates</h3>
                                    </div>
                                    <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                                        <VersionNote latestUpdate={latestUpdate} onUpdate={fetchDashboardData} />
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Department Sections */}
                    <div className="animate-in fade-in duration-500 mt-2">
                      {activeTab === 'donations' && <DonationManager darkMode={isDark} />}
                      {activeTab === 'newsletter' && <NewsletterManager darkMode={isDark} />}
                      {activeTab === 'question_bank' && <QuestionBankManager darkMode={isDark} />}
                      {activeTab === 'qotd' && <QotDManager darkMode={isDark} />}
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
                      {activeTab === 'forum_manager' && <ForumManager darkMode={isDark} />}
                      {activeTab === 'discussion' && <div className="p-6 h-full bg-surf-1 rounded-xl border border-line shadow-sm"><Discussion itemType="admin" itemId="admin" /></div>}
                      {activeTab === 'news' && <ContentManager activeTab="news" segments={segments} groups={groups} subjects={subjects} categories={categories} fetchGroups={fetchGroups} fetchSubjects={fetchSubjects} showSuccess={showSuccess} showError={showError} confirmAction={()=>{}} openCategoryModal={()=>{}} darkMode={isDark} />}
                      {activeTab === 'materials' && <ContentManager activeTab="materials" segments={segments} groups={groups} subjects={subjects} categories={categories} fetchGroups={fetchGroups} fetchSubjects={fetchSubjects} showSuccess={showSuccess} showError={showError} confirmAction={()=>{}} openCategoryModal={()=>{}} darkMode={isDark} />}
                      {activeTab === 'segment_updates' && <ContentManager activeTab="segment_updates" segments={segments} groups={groups} subjects={subjects} categories={categories} fetchGroups={fetchGroups} fetchSubjects={fetchSubjects} showSuccess={showSuccess} showError={showError} confirmAction={()=>{}} openCategoryModal={()=>{}} darkMode={isDark} />}
                      {activeTab === 'ebooks' && <ContentManager activeTab="ebooks" segments={segments} groups={groups} subjects={subjects} categories={categories} fetchGroups={fetchGroups} fetchSubjects={fetchSubjects} showSuccess={showSuccess} showError={showError} confirmAction={()=>{}} openCategoryModal={()=>{}} darkMode={isDark} />}
                    </div>

                </main>
            </div>

            {/* Modal */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-base/80 backdrop-blur-sm p-4">
                    <div className="bg-surf-1 border border-line rounded-[1.5rem] p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${modal.type === 'error' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                           {modal.type === 'error' ? <AlertTriangle className="w-6 h-6"/> : <LucideCheckCircle2 className="w-6 h-6"/>}
                        </div>
                        <h3 className="text-lg font-bold text-ink-1 mb-2">{modal.type === 'error' ? 'Error' : 'Success!'}</h3>
                        <p className="text-ink-3 font-medium text-[12.5px] leading-relaxed mb-6">{modal.message}</p>
                        <button onClick={closeModal} className="w-full py-2.5 bg-ink-1 text-base rounded-lg font-medium shadow-xl hover:opacity-90 transition-all">Continue</button>
                    </div>
                </div>
            )}
        </div>
    );

}


