"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import TutorSidebar from "@/components/tutor/TutorSidebar";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function TutorDashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const protectRoute = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== 'tutor' && profile?.role !== 'admin') {
        router.replace("/student/dashboard"); 
      }
      setLoading(false);
    };
    protectRoute();
  }, [router, supabase]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex text-slate-900">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-slate-200 bg-white fixed inset-y-0 z-20 shadow-sm">
        <TutorSidebar />
      </aside>

      {/* MOBILE HEADER (Fixed Top) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 z-30 flex justify-between items-center shadow-sm">
        <span className="font-black text-xl text-slate-800 tracking-tight">Tutor<span className="text-indigo-600">Panel</span></span>
        <button onClick={() => setIsMobileOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Menu className="w-6 h-6 text-slate-600"/>
        </button>
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl animate-in slide-in-from-left duration-200">
                <TutorSidebar toggleMobile={() => setIsMobileOpen(false)} />
                <button className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:text-red-500 transition-colors" onClick={() => setIsMobileOpen(false)}>
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      {/* Fix: Added extra padding top (pt-24) for mobile to prevent header overlap */}
      <main className="flex-1 lg:ml-72 w-full p-6 pt-24 lg:p-10 lg:pt-10 overflow-x-hidden min-h-screen">
        <div className="max-w-7xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
}