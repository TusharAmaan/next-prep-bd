"use client";
import { useState, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";
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
        router.replace("/student/dashboard"); // Redirect unauthorized
      }
      setLoading(false);
    };
    protectRoute();
  }, [router, supabase]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-indigo-600 rounded-full animate-spin border-t-transparent"></div></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 bg-white fixed inset-y-0 z-20">
        <TutorSidebar />
      </aside>

      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 p-4 z-30 flex justify-between items-center">
        <span className="font-black text-slate-800">Tutor Panel</span>
        <button onClick={() => setIsMobileOpen(true)}><Menu className="w-6 h-6 text-slate-600"/></button>
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileOpen(false)}>
            <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl" onClick={e => e.stopPropagation()}>
                <TutorSidebar toggleMobile={() => setIsMobileOpen(false)} />
            </div>
            <button className="absolute top-4 right-4 p-2 bg-white rounded-full text-slate-900" onClick={() => setIsMobileOpen(false)}>
                <X className="w-6 h-6" />
            </button>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:ml-64 w-full p-6 pt-20 lg:p-8 lg:pt-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}