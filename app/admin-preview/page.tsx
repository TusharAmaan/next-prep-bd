'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/shared/ThemeProvider";
import AnalyticsChart from "@/components/admin/dashboard/AnalyticsChart";
import { 
  LayoutDashboard, FileText, Users, Layers, BookOpen, 
  Bell, FileStack, Settings, HelpCircle, X, Clock, MessageSquare, ShieldAlert, RefreshCw, 
  AlertTriangle, Database, GraduationCap, Newspaper, Palette, Heart, TrendingUp, DollarSign, UserCheck, Menu, Search, ChevronRight, Moon, Sun, Monitor, Mail, CheckCircle2 as LucideCheckCircle2,
  Calendar, Award, AlertCircle, Shield, LogOut
} from "lucide-react";
import Link from "next/link";

import StatsCard from "@/components/admin/dashboard/StatsCard";
import ActivityFeed from "@/components/admin/dashboard/ActivityFeed";
import PlatformInsights from "@/components/admin/dashboard/PlatformInsights";
import VersionNote from "@/components/admin/dashboard/VersionNote";

import UserManagement from "@/components/UserManagement";
import HierarchyManager from "@/components/admin/sections/HierarchyManager";
import CategoryManager from "@/components/admin/sections/CategoryManager";
import ContentManager from "@/components/admin/sections/ContentManager";
import QotDManager from "@/components/admin/sections/QotDManager";
import BadgeManager from "@/components/admin/sections/BadgeManager";
import Discussion from "@/components/shared/Discussion";
import PendingManagerPreview from "@/components/admin/sections/PendingManagerPreview";
import QuestionBankManager from "@/components/admin/sections/QuestionBankManager"; 
import FeedbackManager from "@/components/admin/sections/FeedbackManager";
import LectureSheetManager from "@/components/admin/sections/LectureSheetManager";
import LessonPlanManager from "@/components/admin/sections/LessonPlanManager";
import CourseManager from "@/components/admin/sections/CourseManager";
import CertificateDesigner from "@/components/admin/sections/CertificateDesigner";
import DonationManager from "@/components/admin/sections/DonationManager";
import NewsletterManager from "@/components/admin/sections/NewsletterManager";
import ExamManager from "@/components/admin/sections/ExamManager";
import ForumManager from "@/components/admin/sections/ForumManager";

const getMonthRanges = () => {
    const now = new Date();
    const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    return { startThisMonth };
};

export default function AdminPreviewDashboard() {
    const supabase = createClient();
    const router = useRouter();
    const { isDark, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState("overview"); 
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    // BYPASS AUTH FOR PREVIEW
    useEffect(() => {
        // We mock the user for preview purposes so we don't need a live session
        setCurrentUser({ full_name: 'Preview Admin', role: 'admin' });
        fetchDashboardData();
        fetchDropdowns();
    }, [fetchDashboardData, fetchDropdowns]);

    const navGroups = [
      {
        label: 'Dashboard & insights',
        items: [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'feedback', label: 'User feedback', icon: MessageSquare },
        ]
      },
      {
        label: 'Academic curriculum',
        items: [
          { id: 'hierarchy', label: 'Stage hierarchy', icon: Layers },
          { id: 'categories', label: 'Class categories', icon: Settings },
          { id: 'lesson_plans', label: 'Lesson plans', icon: BookOpen },
          { id: 'lecture_sheets', label: 'Lecture sheets', icon: FileText },
        ]
      },
      {
        label: 'Assessments & practice',
        items: [
          { id: 'question_bank', label: 'Question bank', icon: Database },
          { id: 'exams', label: 'Exam center', icon: Calendar },
          { id: 'qotd', label: 'QotD scheduler', icon: Calendar },
        ]
      },
      {
        label: 'Learning materials',
        items: [
          { id: 'materials', label: 'Study materials', icon: FileStack },
          { id: 'ebooks', label: 'eBooks library', icon: BookOpen },
          { id: 'courses', label: 'Premium courses', icon: GraduationCap },
        ]
      },
      {
        label: 'Community & gamification',
        items: [
          { id: 'forum_manager', label: 'Forum moderator', icon: Shield, badge: stats.pendingReportsCount > 0 ? stats.pendingReportsCount : undefined },
          { id: 'discussion', label: 'Student discussions', icon: MessageSquare },
          { id: 'badges', label: 'Badges & rewards', icon: Award },
          { id: 'news', label: 'Newsroom', icon: Newspaper },
          { id: 'newsletter', label: 'Newsletter', icon: Mail },
          { id: 'donations', label: 'Donation hub', icon: Heart },
        ]
      },
      {
        label: 'System administration',
        items: [
          { id: 'pending', label: 'Pending posts', icon: ShieldAlert, badge: stats.pendingCount > 0 ? stats.pendingCount : undefined },
          { id: 'users', label: 'User directory', icon: Users },
          { id: 'segment_updates', label: 'Segment updates', icon: AlertCircle },
        ]
      }
    ];

    // Helper to get active tab label for header
    const getActiveTabLabel = () => {
        for (const group of navGroups) {
            const found = group.items.find(i => i.id === activeTab);
            if (found) return found.label;
        }
        return 'Dashboard';
    };

    if (isLoading) return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-sans relative">
            
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Modern Sidebar with Category Groups & Mobile Drawer */}
            <aside className={`
                fixed md:sticky top-0 left-0 h-screen w-72 bg-white dark:bg-[#0f111a] 
                border-r border-slate-200 dark:border-slate-800/60 flex flex-col shrink-0 z-50
                transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="h-20 flex items-center justify-between px-6 sm:px-8 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">N</div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            NextPrep<span className="text-indigo-500">BD</span>
                        </h1>
                    </div>
                    {/* Mobile Close Button */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6 custom-scrollbar">
                    {navGroups.map((group, idx) => (
                        <div key={idx} className="space-y-1">
                            <p className="px-4 text-xs font-semibold text-slate-400 mb-2 tracking-wide">
                                {group.label}
                            </p>
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                
                                return (
                                <button
                                    key={item.id}
                                    onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 ${
                                    isActive 
                                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold' 
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                    <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'opacity-70'}`} />
                                    <span className="text-sm">{item.label}</span>
                                    </div>
                                    {item.badge && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${isActive ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                        {item.badge}
                                    </span>
                                    )}
                                </button>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 mt-auto">
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                            {currentUser?.full_name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{currentUser?.full_name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">Administrator</p>
                        </div>
                        <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100" />
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
                
                <header className="h-20 bg-white/80 dark:bg-[#0f111a]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between px-4 sm:px-10 sticky top-0 z-30">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                            {getActiveTabLabel()}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-5">
                        <div className="hidden sm:flex relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search everywhere..." 
                                className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border-transparent rounded-full text-sm w-64 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all"
                            />
                        </div>

                        <button onClick={toggleTheme} className="p-2.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <button className="relative p-2.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#0f111a]"></span>
                        </button>
                        
                        <Link href="/" className="hidden sm:flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                            Public site
                        </Link>
                    </div>
                </header>

                <div className="flex-1 p-6 sm:p-10 overflow-y-auto custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto">
                        
                        {activeTab === 'overview' && (
                            <div className="space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                
                                {/* Refined Clean Welcome Hero */}
                                <div className="rounded-[2rem] p-8 sm:p-12 bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="text-center md:text-left">
                                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome back, {currentUser?.full_name?.split(' ')[0] || 'Admin'}</h1>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-lg">
                                            Your command center is ready. You have <span className="font-semibold text-indigo-600 dark:text-indigo-400">{stats.pendingCount} items</span> awaiting review today.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-4">
                                        <button onClick={() => setActiveTab('pending')} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-indigo-700 transition-all">Review pending</button>
                                        <button onClick={fetchDashboardData} className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2">
                                            <RefreshCw className="w-4 h-4"/> Sync
                                        </button>
                                    </div>
                                </div>

                                {/* Clean Stats Grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                    <div className="p-6 rounded-2xl bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/30 transition-colors">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center"><Users className="w-5 h-5"/></div>
                                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">+{stats.users.trend}</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Students</p>
                                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.users.total.toLocaleString()}</h4>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/30 transition-colors">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center"><DollarSign className="w-5 h-5"/></div>
                                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">{stats.donations.count}</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Donations</p>
                                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">৳{stats.donations.total.toLocaleString()}</h4>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/30 transition-colors">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center"><FileStack className="w-5 h-5"/></div>
                                        </div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Resources</p>
                                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.materials.total}</h4>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-rose-500/30 transition-colors">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center"><AlertTriangle className="w-5 h-5"/></div>
                                            {stats.pendingCount > 0 && <span className="text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-md animate-pulse">Action required</span>}
                                        </div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Approvals</p>
                                        <h4 className={`text-2xl font-bold mt-1 ${stats.pendingCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>{stats.pendingCount}</h4>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-8">
                                        <div className="rounded-[2rem] bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10">
                                            <div className="flex items-center justify-between mb-8">
                                                <div>
                                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Platform Growth</h4>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Aggregate growth charts and trends</p>
                                                </div>
                                            </div>
                                            <div className="h-[300px] sm:h-[400px]"><AnalyticsChart /></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <PlatformInsights />
                                            <VersionNote latestUpdate={latestUpdate} onUpdate={fetchDashboardData} />
                                        </div>
                                    </div>
                                    
                                    <div className="lg:col-span-1 space-y-8">
                                        <div className="bg-white dark:bg-[#1a1d2d] rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                            <ActivityFeed activities={activities.slice(0, 10)} onViewAll={() => setIsActivityModalOpen(true)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Department Sections rendered seamlessly without uppercase styling */}
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'donations' && <DonationManager darkMode={isDark} />}
                            {activeTab === 'newsletter' && <NewsletterManager darkMode={isDark} />}
                            {activeTab === 'question_bank' && <QuestionBankManager darkMode={isDark} />}
                            {activeTab === 'qotd' && <QotDManager darkMode={isDark} />}
                            {activeTab === 'badges' && <BadgeManager darkMode={isDark} />}
                            {activeTab === 'pending' && <PendingManagerPreview />}
                            {activeTab === 'users' && <UserManagement onShowError={showError} onShowSuccess={showSuccess} darkMode={isDark} />}
                            {activeTab === 'hierarchy' && <HierarchyManager segments={segments} groups={groups} subjects={subjects} selectedSegment={selectedSegment} setSelectedSegment={setSelectedSegment} selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup} fetchDropdowns={fetchDropdowns} fetchGroups={fetchGroups} fetchSubjects={fetchSubjects} darkMode={isDark} />}
                            {activeTab === 'categories' && <CategoryManager categories={categories} categoryCounts={{}} fetchCategories={fetchDropdowns} darkMode={isDark} />}
                            {activeTab === 'lecture_sheets' && <LectureSheetManager segments={segments} groups={groups} subjects={subjects} darkMode={isDark} />}
                            {activeTab === 'lesson_plans' && <LessonPlanManager subjects={subjects} darkMode={isDark} />}
                            {activeTab === 'courses' && <CourseManager darkMode={isDark} />}
                            {activeTab === 'exams' && <ExamManager segments={segments} groups={groups} subjects={subjects} darkMode={isDark} /> }
                            {activeTab === 'feedback' && <FeedbackManager darkMode={isDark} />}
                            {activeTab === 'forum_manager' && <ForumManager darkMode={isDark} />}
                            {activeTab === 'discussion' && <div className="p-6 h-full bg-white dark:bg-[#1a1d2d] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"><Discussion itemType="admin" itemId="admin" /></div>}
                            {activeTab === 'news' && <ContentManager activeTab="news" segments={segments} groups={groups} subjects={subjects} categories={categories} fetchGroups={fetchGroups} fetchSubjects={fetchSubjects} showSuccess={showSuccess} showError={showError} confirmAction={()=>{}} openCategoryModal={()=>{}} darkMode={isDark} />}
                            {activeTab === 'materials' && <ContentManager activeTab="materials" segments={segments} groups={groups} subjects={subjects} categories={categories} fetchGroups={fetchGroups} fetchSubjects={fetchSubjects} showSuccess={showSuccess} showError={showError} confirmAction={()=>{}} openCategoryModal={()=>{}} darkMode={isDark} />}
                            {activeTab === 'segment_updates' && <ContentManager activeTab="segment_updates" segments={segments} groups={groups} subjects={subjects} categories={categories} fetchGroups={fetchGroups} fetchSubjects={fetchSubjects} showSuccess={showSuccess} showError={showError} confirmAction={()=>{}} openCategoryModal={()=>{}} darkMode={isDark} />}
                            {activeTab === 'ebooks' && <ContentManager activeTab="ebooks" segments={segments} groups={groups} subjects={subjects} categories={categories} fetchGroups={fetchGroups} fetchSubjects={fetchSubjects} showSuccess={showSuccess} showError={showError} confirmAction={()=>{}} openCategoryModal={()=>{}} darkMode={isDark} />}
                        </div>

                    </div>
                </div>
            </main>

            {/* Modals */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6 ${modal.type === 'error' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                           {modal.type === 'error' ? <AlertTriangle className="w-7 h-7"/> : <LucideCheckCircle2 className="w-7 h-7"/>}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{modal.type === 'error' ? 'Error' : 'Success'}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">{modal.message}</p>
                        <button onClick={closeModal} className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold hover:opacity-90 transition-opacity">Close</button>
                    </div>
                </div>
            )}
            
            {isActivityModalOpen && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[80vh] animate-in slide-in-from-bottom-8 duration-300">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Recent Activities
                            </h3>
                            <button onClick={() => setIsActivityModalOpen(false)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">
                           <ActivityFeed activities={activities} onViewAll={() => {}} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
