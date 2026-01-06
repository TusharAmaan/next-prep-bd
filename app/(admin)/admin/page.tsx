"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import AnalyticsChart from "@/components/admin/dashboard/AnalyticsChart";
import { 
  LayoutDashboard, FileText, Users, Layers, BookOpen, 
  Bell, FileStack, Settings, LogOut, TrendingUp, HelpCircle, X, Clock 
} from "lucide-react";

// --- IMPORTS ---
import StatsCard from "@/components/admin/dashboard/StatsCard";
import ActivityFeed from "@/components/admin/dashboard/ActivityFeed";
import QuickStats from "@/components/admin/dashboard/QuickStats";
import VersionNote from "@/components/admin/dashboard/VersionNote";

// Existing Sections
import UserManagement from "@/components/UserManagement";
import HierarchyManager from "@/components/admin/sections/HierarchyManager";
import CategoryManager from "@/components/admin/sections/CategoryManager";
import ContentManager from "@/components/admin/sections/ContentManager";

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview"); 
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // --- DASHBOARD DATA STATES ---
    const [counts, setCounts] = useState({ materials: 0, questions: 0, ebooks: 0, users: 0, news: 0 });
    const [activities, setActivities] = useState<any[]>([]);
    const [latestUpdate, setLatestUpdate] = useState<any>(null);
    const [showActivityModal, setShowActivityModal] = useState(false); // <--- NEW STATE FOR MODAL

    // --- SHARED DATA STATES ---
    const [segments, setSegments] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [categoryCounts, setCategoryCounts] = useState<any>({});

    // Selection States
    const [selectedSegment, setSelectedSegment] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");

    // Modal Helpers
    const [modal, setModal] = useState({ isOpen: false, type: '', message: '' });
    const showSuccess = (msg: string) => setModal({ isOpen: true, type: 'success', message: msg });
    const showError = (msg: string) => setModal({ isOpen: true, type: 'error', message: msg });
    const closeModal = () => setModal({ ...modal, isOpen: false });

    // --- 1. FETCH DASHBOARD OVERVIEW DATA ---
    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        
        const [
            materialsRes, 
            questionsRes, 
            ebooksRes, 
            usersRes, 
            newsRes,
            recentUsers,
            recentResources,
            sysUpdate
        ] = await Promise.all([
            // FIX: Added 'blog' to the type list so your posts count properly
            supabase.from("resources").select('*', { count: 'exact', head: true }).in('type', ['pdf', 'video', 'blog']),
            supabase.from("resources").select('*', { count: 'exact', head: true }).eq('type', 'question'),
            supabase.from("ebooks").select('*', { count: 'exact', head: true }),
            supabase.from("profiles").select('*', { count: 'exact', head: true }),
            supabase.from("resources").select('*', { count: 'exact', head: true }).eq('type', 'news'),
            
            // Activity Feed Data
            supabase.from("profiles").select('full_name, created_at').order('created_at', { ascending: false }).limit(5),
            supabase.from("resources").select('title, type, created_at').order('created_at', { ascending: false }).limit(5),
            
            // Latest Version Note
            supabase.from("system_updates").select('*').order('created_at', { ascending: false }).limit(1).single()
        ]);

        setCounts({
            materials: materialsRes.count || 0,
            questions: questionsRes.count || 0,
            ebooks: ebooksRes.count || 0,
            users: usersRes.count || 0,
            news: newsRes.count || 0,
        });

        const newUsers = (recentUsers.data || []).map(u => ({ type: 'user', title: u.full_name || 'New User', action: 'joined the platform', created_at: u.created_at }));
        const newUploads = (recentResources.data || []).map(r => ({ type: 'resource', title: r.title, action: `added to ${r.type}`, created_at: r.created_at }));
        
        const combined = [...newUsers, ...newUploads].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setActivities(combined); // Store all activities, component handles slicing for preview

        setLatestUpdate(sysUpdate.data);
        setIsLoading(false);
    }, []);

    // --- 2. FETCH DROPDOWNS ---
    const fetchDropdowns = useCallback(async () => {
        const { data: s } = await supabase.from("segments").select("*").order('id'); setSegments(s || []);
        const { data: c } = await supabase.from("categories").select("*").order('name'); setCategories(c || []);
    }, []);

    const fetchGroups = async (segId: string) => { const { data } = await supabase.from("groups").select("*").eq("segment_id", segId).order('id'); setGroups(data || []); };
    const fetchSubjects = async (grpId: string) => { const { data } = await supabase.from("subjects").select("*").eq("group_id", grpId).order('id'); setSubjects(data || []); };

    // --- AUTH & INIT ---
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
        <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pt-16">
            
            {/* SIDEBAR */}
            <aside className="w-64 bg-[#0F172A] border-r border-slate-800 fixed top-0 bottom-0 z-20 flex flex-col pt-16 shadow-2xl">
                <div className="px-6 py-4">
                    <h2 className="text-white font-black text-xl tracking-tight">Admin<span className="text-indigo-500">Panel</span></h2>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">NextPrep Control</p>
                </div>
                
                <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    <div className="text-xs font-bold text-slate-600 uppercase px-3 py-2 mt-4">Overview</div>
                    <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        <LayoutDashboard className="w-5 h-5"/> Dashboard
                    </button>

                    <div className="text-xs font-bold text-slate-600 uppercase px-3 py-2 mt-4">Content</div>
                    {[{ id: 'materials', label: 'Study Materials', icon: FileStack },
                      { id: 'questions', label: 'Question Bank', icon: HelpCircle },
                      { id: 'ebooks', label: 'eBooks', icon: BookOpen },
                      { id: 'news', label: 'Newsroom', icon: Bell },
                      { id: 'hierarchy', label: 'Hierarchy', icon: Layers },
                      { id: 'categories', label: 'Categories', icon: Settings }
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                            <tab.icon className="w-5 h-5"/> {tab.label}
                        </button>
                    ))}

                    <div className="text-xs font-bold text-slate-600 uppercase px-3 py-2 mt-4">People</div>
                    <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        <Users className="w-5 h-5"/> User Management
                    </button>
                </nav>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 lg:ml-64 p-6 lg:p-10 overflow-x-hidden min-h-screen">
                <div className="max-w-[1600px] mx-auto space-y-8">
                    
                    {/* --- VIEW: DASHBOARD OVERVIEW --- */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            
                            {/* 1. HEADER */}
                            <div className="flex justify-between items-end">
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>
                                    <p className="text-slate-500 mt-1">Welcome back, {currentUser?.full_name}</p>
                                </div>
                            </div>

                            {/* 2. STATS ROW */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatsCard title="Total Materials" value={counts.materials} icon={<FileText className="w-6 h-6"/>} colorClass="bg-blue-500" trend="Active" trendUp={true} />
                                <StatsCard title="Total Questions" value={counts.questions} icon={<HelpCircle className="w-6 h-6"/>} colorClass="bg-amber-500" trend="Active" trendUp={true} />
                                <StatsCard title="Total eBooks" value={counts.ebooks} icon={<BookOpen className="w-6 h-6"/>} colorClass="bg-emerald-500" trend="Active" trendUp={true} />
                                <StatsCard title="Total Users" value={counts.users} icon={<Users className="w-6 h-6"/>} colorClass="bg-indigo-500" trend="Active" trendUp={true} />
                            </div>

                            {/* 3. MIDDLE SECTION (FIXED: Grid Layout was duplicated, now single and clean) */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column (2/3) - Quick Stats, Updates, Chart */}
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <QuickStats />
                                        <VersionNote latestUpdate={latestUpdate} onUpdate={fetchDashboardData} />
                                    </div>
                                    <div className="h-80">
                                        <AnalyticsChart />
                                    </div>
                                </div>

                                {/* Right Column (1/3) - Activity Feed */}
                                <div className="lg:col-span-1">
                                    <ActivityFeed 
                                        activities={activities} 
                                        onViewAll={() => setShowActivityModal(true)} // Opens the modal
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- VIEW: MANAGEMENT TABS --- */}
                    {activeTab === 'users' && <UserManagement onShowError={showError} onShowSuccess={showSuccess} />}
                    
                    {activeTab === 'hierarchy' && (
                        <HierarchyManager 
                            segments={segments} groups={groups} subjects={subjects}
                            selectedSegment={selectedSegment} setSelectedSegment={setSelectedSegment}
                            selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup}
                            fetchDropdowns={fetchDropdowns} fetchGroups={fetchGroups} fetchSubjects={fetchSubjects}
                        />
                    )}

                    {activeTab === 'categories' && (
                        <CategoryManager categories={categories} categoryCounts={categoryCounts} fetchCategories={fetchDropdowns} />
                    )}

                    {['materials', 'news', 'ebooks', 'courses', 'questions'].includes(activeTab) && (
                        <ContentManager 
                            activeTab={activeTab === 'questions' ? 'question' : activeTab}
                            segments={segments} groups={groups} subjects={subjects} categories={categories}
                            fetchGroups={fetchGroups} fetchSubjects={fetchSubjects}
                            showSuccess={showSuccess} showError={showError} confirmAction={()=>{}}
                            openCategoryModal={() => setActiveTab('categories')}
                        />
                    )}

                </div>
            </main>

            {/* GLOBAL SUCCESS/ERROR MODAL */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
                        <h3 className={`text-xl font-bold mb-2 ${modal.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{modal.type === 'error' ? 'Error' : 'Success'}</h3>
                        <p className="text-slate-600 mb-6">{modal.message}</p>
                        <button onClick={closeModal} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold">Okay</button>
                    </div>
                </div>
            )}

            {/* ACTIVITY FEED "VIEW ALL" MODAL (NEW) */}
            {showActivityModal && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">All Recent Activities</h3>
                            <button onClick={() => setShowActivityModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                                <X className="w-5 h-5"/>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                            {activities.map((item, i) => (
                                <div key={i} className="flex gap-4 items-start border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${item.type === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {item.type === 'user' ? <Users className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{item.title}</p>
                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                            {item.action} • <Clock className="w-3 h-3"/> {new Date(item.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {activities.length === 0 && <p className="text-center text-slate-400">No activities found.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}