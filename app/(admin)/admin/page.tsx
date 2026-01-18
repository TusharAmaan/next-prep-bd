"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import AnalyticsChart from "@/components/admin/dashboard/AnalyticsChart";
import { 
  LayoutDashboard, FileText, Users, Layers, BookOpen, 
  Bell, FileStack, Settings, HelpCircle, X, Clock, MessageSquare, RefreshCw, 
  AlertTriangle, Database // Added Database icon for Question Bank
} from "lucide-react";

import StatsCard from "@/components/admin/dashboard/StatsCard";
import ActivityFeed from "@/components/admin/dashboard/ActivityFeed";
import QuickStats from "@/components/admin/dashboard/QuickStats";
import VersionNote from "@/components/admin/dashboard/VersionNote";
import AdminHeader from "@/components/admin/AdminHeader"; 

import UserManagement from "@/components/UserManagement";
import HierarchyManager from "@/components/admin/sections/HierarchyManager";
import CategoryManager from "@/components/admin/sections/CategoryManager";
import ContentManager from "@/components/admin/sections/ContentManager";
import FeedbackManager from "@/components/admin/sections/FeedbackManager";
import PendingManager from "@/components/admin/sections/PendingManager";
import QuestionBankManager from "@/components/admin/sections/QuestionBankManager"; // <--- IMPORT THIS

const getMonthRanges = () => {
    const now = new Date();
    const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    return { startThisMonth };
};

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview"); 
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- DASHBOARD DATA ---
    const [stats, setStats] = useState({
        materials: { total: 0, trend: 0 },
        questions: { total: 0, trend: 0 },
        ebooks: { total: 0, trend: 0 },
        users: { total: 0, trend: 0 }
    });
    const [activities, setActivities] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]); 
    const [latestUpdate, setLatestUpdate] = useState<any>(null);
    const [showActivityModal, setShowActivityModal] = useState(false);

    // --- SHARED DROPDOWNS ---
    const [segments, setSegments] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [categoryCounts, setCategoryCounts] = useState<any>({});

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
                matTotal, quesTotal, ebookTotal, userTotal,
                matLast, quesLast, ebookLast, userLast,
                recentUsers, recentResources, sysUpdate,
                recentFeedbacks
            ] = await Promise.all([
                supabase.from("resources").select('*', { count: 'exact', head: true }).in('type', ['pdf', 'video', 'blog']).eq('status', 'approved'),
                supabase.from("resources").select('*', { count: 'exact', head: true }).eq('type', 'question').eq('status', 'approved'),
                supabase.from("ebooks").select('*', { count: 'exact', head: true }),
                supabase.from("profiles").select('*', { count: 'exact', head: true }),

                supabase.from("resources").select('*', { count: 'exact', head: true }).in('type', ['pdf', 'video', 'blog']).lt('created_at', startThisMonth),
                supabase.from("resources").select('*', { count: 'exact', head: true }).eq('type', 'question').lt('created_at', startThisMonth),
                supabase.from("ebooks").select('*', { count: 'exact', head: true }).lt('created_at', startThisMonth),
                supabase.from("profiles").select('*', { count: 'exact', head: true }).lt('created_at', startThisMonth),
                
                supabase.from("profiles").select('full_name, created_at').order('created_at', { ascending: false }).limit(5),
                supabase.from("resources").select('title, type, created_at').eq('status', 'approved').order('created_at', { ascending: false }).limit(5),
                supabase.from("system_updates").select('*').order('created_at', { ascending: false }).limit(1).single(),
                supabase.from("feedbacks").select('*').order('created_at', { ascending: false }).limit(10)
            ]);

            const calcTrend = (total: number, prevTotal: number) => total - prevTotal;

            setStats({
                materials: { total: matTotal.count || 0, trend: calcTrend(matTotal.count || 0, matLast.count || 0) },
                questions: { total: quesTotal.count || 0, trend: calcTrend(quesTotal.count || 0, quesLast.count || 0) },
                ebooks: { total: ebookTotal.count || 0, trend: calcTrend(ebookTotal.count || 0, ebookLast.count || 0) },
                users: { total: userTotal.count || 0, trend: calcTrend(userTotal.count || 0, userLast.count || 0) },
            });

            const newUsers = (recentUsers.data || []).map(u => ({ type: 'user', title: u.full_name || 'New User', action: 'joined the platform', created_at: u.created_at }));
            const newUploads = (recentResources.data || []).map(r => ({ type: 'resource', title: r.title, action: `added to ${r.type}`, created_at: r.created_at }));
            const combined = [...newUsers, ...newUploads].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            
            setActivities(combined);
            setLatestUpdate(sysUpdate.data);
            setNotifications(recentFeedbacks.data || []); 
        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const markNotificationRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
        await supabase.from('feedbacks').update({ status: 'read' }).eq('id', id);
    };

    // --- NEW: DELETE NOTIFICATION HANDLER ---
    const deleteNotification = async (id: string) => {
        // Optimistic update: Remove from UI immediately
        setNotifications(prev => prev.filter(n => n.id !== id));
        // Delete from Database
        const { error } = await supabase.from('feedbacks').delete().eq('id', id);
        if (error) {
            console.error("Error deleting notification:", error);
            // Optionally revert UI if error occurs (usually not needed for simple deletes)
            showError("Failed to delete notification.");
        } else {
            showSuccess("Notification deleted.");
        }
    };

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
            if (profile?.role !== 'admin') { router.replace("/"); return; }
            setCurrentUser(profile);
            fetchDashboardData();
            fetchDropdowns();
        };
        init();
    }, [router, fetchDashboardData, fetchDropdowns]);

    if (isLoading && !currentUser) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
            
            {/* SIDEBAR (Responsive) */}
            <aside className={`w-64 bg-[#0F172A] border-r border-slate-800 fixed top-0 bottom-0 z-50 flex flex-col pt-6 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="px-6 py-4 mb-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-white font-black text-xl tracking-tight">Admin<span className="text-indigo-500">Panel</span></h2>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">NextPrep Control</p>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
                </div>
                
                <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    <button onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        <LayoutDashboard className="w-5 h-5"/> Dashboard
                    </button>

                    {/* NEW: QUESTION BANK TAB */}
                    <button onClick={() => { setActiveTab('question_bank'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all mt-2 ${activeTab === 'question_bank' ? 'bg-purple-600 text-white' : 'text-purple-400 hover:bg-slate-800 hover:text-white'}`}>
                        <Database className="w-5 h-5"/> Question Bank
                    </button>

                    <button onClick={() => { setActiveTab('pending'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all mt-2 ${activeTab === 'pending' ? 'bg-amber-600 text-white' : 'text-amber-500 hover:bg-slate-800 hover:text-white'}`}>
                        <AlertTriangle className="w-5 h-5"/> Pending Reviews
                    </button>

                    <div className="text-xs font-bold text-slate-600 uppercase px-3 py-2 mt-4">Content</div>
                    {[
                      { id: 'materials', label: 'Study Materials', icon: FileStack },
                      { id: 'ebooks', label: 'eBooks', icon: BookOpen },
                      { id: 'segment_updates', label: 'Segment Updates', icon: RefreshCw },
                      { id: 'courses', label: 'Courses', icon: BookOpen },
                      { id: 'news', label: 'Newsroom', icon: Bell }
                    ].map(item => (
                        <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                            <item.icon className="w-5 h-5"/> {item.label}
                        </button>
                    ))}

                    <div className="text-xs font-bold text-slate-600 uppercase px-3 py-2 mt-4">Configuration</div>
                    {[
                      { id: 'hierarchy', label: 'Hierarchy', icon: Layers },
                      { id: 'categories', label: 'Categories', icon: Settings },
                      { id: 'users', label: 'User Management', icon: Users },
                      { id: 'feedbacks', label: 'Feedbacks', icon: MessageSquare }
                    ].map(item => (
                        <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                            <item.icon className="w-5 h-5"/> {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 lg:ml-64 bg-[#F8FAFC] min-h-screen flex flex-col">
                
                {/* 1. ADMIN HEADER */}
                <AdminHeader 
                    user={currentUser} 
                    activeTab={activeTab} 
                    toggleSidebar={() => setIsSidebarOpen(true)} 
                    notifications={notifications}        
                    onMarkRead={markNotificationRead}
                    onDelete={deleteNotification} // <--- PASSED THE DELETE HANDLER
                />

                {/* 2. PAGE CONTENT */}
                <div className="p-6 lg:p-10 max-w-[1600px] mx-auto w-full space-y-8">
                    
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatsCard title="Total Materials" value={stats.materials.total} icon={<FileText className="w-6 h-6"/>} gradient="bg-gradient-to-br from-blue-600 to-blue-800" trend={stats.materials.trend > 0 ? `+${stats.materials.trend}` : `${stats.materials.trend}`} trendUp={stats.materials.trend >= 0} />
                                <StatsCard title="Total Questions" value={stats.questions.total} icon={<HelpCircle className="w-6 h-6"/>} gradient="bg-gradient-to-br from-amber-500 to-orange-600" trend={stats.questions.trend > 0 ? `+${stats.questions.trend}` : `${stats.questions.trend}`} trendUp={stats.questions.trend >= 0} />
                                <StatsCard title="Total eBooks" value={stats.ebooks.total} icon={<BookOpen className="w-6 h-6"/>} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" trend={stats.ebooks.trend > 0 ? `+${stats.ebooks.trend}` : `${stats.ebooks.trend}`} trendUp={stats.ebooks.trend >= 0} />
                                <StatsCard title="Total Users" value={stats.users.total} icon={<Users className="w-6 h-6"/>} gradient="bg-gradient-to-br from-violet-600 to-purple-700" trend={stats.users.trend > 0 ? `+${stats.users.trend}` : `${stats.users.trend}`} trendUp={stats.users.trend >= 0} />
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <QuickStats />
                                        <VersionNote latestUpdate={latestUpdate} onUpdate={fetchDashboardData} />
                                    </div>
                                    <div className="h-80"><AnalyticsChart /></div>
                                </div>
                                <div className="lg:col-span-1">
                                    <ActivityFeed activities={activities} onViewAll={() => setShowActivityModal(true)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* NEW QUESTION BANK MANAGER */}
                    {activeTab === 'question_bank' && <QuestionBankManager />}

                    {/* NEW PENDING MANAGER */}
                    {activeTab === 'pending' && <PendingManager />}

                    {activeTab === 'users' && <UserManagement onShowError={showError} onShowSuccess={showSuccess} />}
                    {activeTab === 'hierarchy' && <HierarchyManager segments={segments} groups={groups} subjects={subjects} selectedSegment={selectedSegment} setSelectedSegment={setSelectedSegment} selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup} fetchDropdowns={fetchDropdowns} fetchGroups={fetchGroups} fetchSubjects={fetchSubjects} />}
                    {activeTab === 'categories' && <CategoryManager categories={categories} categoryCounts={categoryCounts} fetchCategories={fetchDropdowns} />}
                    {activeTab === 'feedbacks' && <FeedbackManager />}

                    {['materials', 'news', 'ebooks', 'segment_updates', 'courses'].includes(activeTab) && (
                        <ContentManager 
                            key={activeTab} 
                            activeTab={activeTab}
                            segments={segments} groups={groups} subjects={subjects} categories={categories}
                            fetchGroups={fetchGroups} fetchSubjects={fetchSubjects}
                            showSuccess={showSuccess} showError={showError} confirmAction={()=>{}}
                            openCategoryModal={() => setActiveTab('categories')}
                        />
                    )}

                </div>
            </main>

            {modal.isOpen && <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"><div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center"><h3 className={`text-xl font-bold mb-2 ${modal.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{modal.type === 'error' ? 'Error' : 'Success'}</h3><p className="text-slate-600 mb-6">{modal.message}</p><button onClick={closeModal} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold">Okay</button></div></div>}
            
            {showActivityModal && <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"><div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95"><div className="p-6 border-b border-slate-100 flex justify-between items-center"><h3 className="font-bold text-lg text-slate-800">All Recent Activities</h3><button onClick={() => setShowActivityModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-red-500"/></button></div><div className="p-6 overflow-y-auto custom-scrollbar space-y-4">{activities.map((item, i) => (<div key={i} className="flex gap-4 items-start border-b border-slate-50 pb-4 last:border-0 last:pb-0"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${item.type === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>{item.type === 'user' ? <Users className="w-4 h-4" /> : <FileText className="w-4 h-4" />}</div><div><p className="text-sm font-bold text-slate-800">{item.title}</p><p className="text-xs text-slate-500 mt-1 flex items-center gap-1">{item.action} • <Clock className="w-3 h-3"/> {new Date(item.created_at).toLocaleDateString()}</p></div></div>))}{activities.length === 0 && <p className="text-center text-slate-400">No activities found.</p>}</div></div></div>}
        </div>
    );
}