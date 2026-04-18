"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import EditorSidebar from "@/components/editor/EditorSidebar";
import { Loader2, Menu, X, Bell, Search, User } from "lucide-react";
import Link from "next/link";

export default function EditorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("users")
        .select("role, full_name")
        .eq("id", session.user.id)
        .single();

      if (error || !profile || (profile.role !== "editor" && profile.role !== "admin")) {
        router.push("/");
        return;
      }

      setUser({ ...session.user, ...profile });
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        </div>
        <p className="font-black text-slate-400 text-xs uppercase tracking-[0.2em] animate-pulse">Initializing Console</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      
      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block h-full">
        <EditorSidebar />
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isMobileSidebarOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden animate-in fade-in duration-300"
            onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <div className={`fixed top-0 left-0 h-full z-[101] w-64 transform transition-transform duration-500 ease-out lg:hidden ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <EditorSidebar toggleMobile={() => setIsMobileSidebarOpen(false)} />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-40">
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-50 rounded-xl transition-colors"
            >
                <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Console</span>
                <span className="text-slate-200">/</span>
                <span className="text-indigo-600">Overview</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
             <div className="hidden sm:flex items-center relative group">
                <Search className="w-4 h-4 absolute left-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search resources..." 
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium w-48 focus:w-64 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
             </div>
             
             <button className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-slate-500 transition-all relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white shadow-sm" />
             </button>

             <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

             <Link href="/profile" className="flex items-center gap-3 pl-2 group">
                <div className="hidden text-right lg:block">
                    <p className="text-xs font-black text-slate-900 leading-none">{user.full_name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">Editor</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-500 text-sm group-hover:border-indigo-500 transition-all">
                    {user.full_name?.[0].toUpperCase()}
                </div>
             </Link>
          </div>
        </header>

        {/* PAGE SCROLL AREA */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
          {children}
        </main>
      </div>

    </div>
  );
}
