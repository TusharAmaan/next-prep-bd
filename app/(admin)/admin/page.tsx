"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link"; 

// --- IMPORTS: The New Modular Components ---
import UserManagement from "@/components/UserManagement";
import HierarchyManager from "@/components/admin/sections/HierarchyManager";
import CategoryManager from "@/components/admin/sections/CategoryManager";
import ContentManager from "@/components/admin/sections/ContentManager";

// --- TYPES ---
type ModalState = { isOpen: boolean; type: 'success' | 'confirm' | 'error'; message: string; onConfirm?: () => void; };

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("materials");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Global Data State (Shared across tabs)
    const [segments, setSegments] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [categoryCounts, setCategoryCounts] = useState<any>({});

    // Modal State
    const [modal, setModal] = useState<ModalState>({ isOpen: false, type: 'success', message: '' });
    
    // Helpers
    const showSuccess = (msg: string) => setModal({ isOpen: true, type: 'success', message: msg });
    const showError = (msg: string) => setModal({ isOpen: true, type: 'error', message: msg });
    const confirmAction = (msg: string, action: () => void) => setModal({ isOpen: true, type: 'confirm', message: msg, onConfirm: action });
    const closeModal = () => setModal({ ...modal, isOpen: false });

    // --- FETCH SHARED DATA ---
    const fetchDropdowns = useCallback(async () => {
        const { data: s } = await supabase.from("segments").select("*").order('id'); setSegments(s || []);
        const { data: c } = await supabase.from("categories").select("*").order('name'); setCategories(c || []);
        
        // Fetch category counts
        if (c) {
            const counts: any = {};
            for (const cat of c) {
                const { count } = await supabase.from('resources').select('*', { count: 'exact', head: true }).eq('category', cat.name);
                counts[cat.id] = count || 0;
            }
            setCategoryCounts(counts);
        }
    }, []);

    const fetchGroups = async (segId: string) => { const { data } = await supabase.from("groups").select("*").eq("segment_id", segId).order('id'); setGroups(data || []); };
    const fetchSubjects = async (grpId: string) => { const { data } = await supabase.from("subjects").select("*").eq("group_id", grpId).order('id'); setSubjects(data || []); };

    // --- AUTH CHECK ---
    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) { 
                // Security Check
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                
                if (profile) {
                    if (profile.role === 'student') router.replace("/profile");
                    else if (profile.status === 'pending') router.replace("/verification-pending"); // Redirect pending users
                    else {
                        setIsAuthenticated(true);
                        setCurrentUser(profile);
                        fetchDropdowns();
                    }
                }
            } else { 
                router.push("/login"); 
            }
            setIsLoading(false);
        };
        init();
    }, [router, fetchDropdowns]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold bg-[#F8FAFC]">Loading Dashboard...</div>;
    if (!isAuthenticated) return null;

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pt-32">
            
            {/* GLOBAL MODAL */}
            {modal.isOpen && <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"><div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-pop-in text-center"><h3 className="text-xl font-black mb-2 capitalize text-slate-900">{modal.type}!</h3><p className="text-slate-500 text-sm mb-6 leading-relaxed">{modal.message}</p><div className="flex gap-3 justify-center">{modal.type === 'confirm' ? <><button onClick={closeModal} className="px-6 py-2.5 border border-gray-200 rounded-xl font-bold text-slate-600 hover:bg-gray-50">Cancel</button><button onClick={() => { modal.onConfirm?.(); closeModal() }} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200">Confirm</button></> : <button onClick={closeModal} className="px-8 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-lg">Okay</button>}</div></div></div>}

            <aside className="w-64 bg-[#0F172A] border-r border-slate-800 fixed top-0 bottom-0 z-20 hidden md:flex flex-col shadow-2xl pt-28">
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {[{ id: 'materials', label: 'Study Materials', icon: '📚' },
                    { id: 'updates', label: 'Updates', icon: '📢' },
                    { id: 'ebooks', label: 'eBooks', icon: '📖' },
                    { id: 'courses', label: 'Courses', icon: '🎓' },
                    { id: 'news', label: 'Newsroom', icon: '📰' },
                    { id: 'hierarchy', label: 'Hierarchy', icon: '🌳' },
                    { id: 'categories', label: 'Categories', icon: '🏷️' },
                    { id: 'users', label: 'User Manager', icon: '👥' }
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><span className="text-lg opacity-80">{tab.icon}</span> {tab.label}</button>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-800 relative">
                    {currentUser && (
                        <>
                            <div onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors">
                                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">{currentUser.full_name ? currentUser.full_name[0].toUpperCase() : "A"}</div>
                                <div className="flex-1 min-w-0"><p className="text-sm font-bold text-white truncate">{currentUser.full_name}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{currentUser.role}</p></div>
                                <span className="text-slate-500 text-xs">▲</span>
                            </div>
                            {showProfileMenu && (
                                <div className="absolute bottom-20 left-4 right-4 bg-white rounded-xl shadow-2xl overflow-hidden animate-slide-up z-30">
                                    <Link href="/profile" className="block px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 border-b border-gray-100">⚙️ Settings</Link>
                                    <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50">🚪 Log Out</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </aside>

            <main className="flex-1 md:ml-64 p-8 overflow-x-hidden min-h-screen">
                <div className="max-w-[1800px] mx-auto w-full">
                    
                    {/* 1. USER MANAGEMENT */}
                    {activeTab === 'users' && <UserManagement onShowError={showError} onShowSuccess={showSuccess} />}

                    {/* 2. HIERARCHY MANAGER */}
                    {activeTab === 'hierarchy' && (
                        <HierarchyManager 
                            segments={segments} groups={groups} subjects={subjects}
                            selectedSegment={null} setSelectedSegment={() => {}} // Pass generic handlers or local state if needed inside HierarchyManager
                            // NOTE: HierarchyManager has internal state, but we pass fetching logic
                            fetchDropdowns={fetchDropdowns} fetchGroups={fetchGroups} fetchSubjects={fetchSubjects}
                        />
                    )}

                    {/* 3. CATEGORY MANAGER */}
                    {activeTab === 'categories' && (
                        <CategoryManager 
                            categories={categories} categoryCounts={categoryCounts}
                            filter="all" setFilter={() => {}} search="" setSearch={() => {}} // Pass local state if needed
                            fetchCategories={fetchDropdowns}
                        />
                    )}

                    {/* 4. CONTENT MANAGER (Materials, News, Ebooks, Courses, Updates) */}
                    {['materials', 'news', 'ebooks', 'courses', 'updates'].includes(activeTab) && (
                        <ContentManager 
                            activeTab={activeTab}
                            segments={segments} groups={groups} subjects={subjects} categories={categories}
                            fetchGroups={fetchGroups} fetchSubjects={fetchSubjects}
                            showSuccess={showSuccess} showError={showError} confirmAction={confirmAction}
                            openCategoryModal={() => { /* Handle opening category modal here if needed, or move modal state up */ }}
                        />
                    )}

                </div>
            </main>
        </div>
    );
}