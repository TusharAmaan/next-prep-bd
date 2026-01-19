"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import TutorSidebar from "@/components/tutor/TutorSidebar";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function TutorDashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "tutor" && profile?.role !== "admin") {
        // Redirect non-tutors
        router.push("/student/dashboard"); 
      }
      setIsLoading(false);
    };
    checkUser();
  }, [router, supabase]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      
      {/* MOBILE HEADER */}
      <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-30">
        <h1 className="font-black text-slate-900">Tutor Dashboard</h1>
        <button onClick={() => setIsMobileOpen(true)} className="p-2 bg-slate-50 rounded-lg">
            <Menu className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileOpen(false)}>
            <div className="absolute left-0 top-0 h-full w-64 shadow-2xl" onClick={e => e.stopPropagation()}>
                <TutorSidebar toggleMobile={() => setIsMobileOpen(false)} />
            </div>
            <button className="absolute top-4 right-4 p-2 bg-white rounded-full text-slate-900" onClick={() => setIsMobileOpen(false)}>
                <X className="w-6 h-6" />
            </button>
        </div>
      )}

      <div className="flex max-w-[1600px] mx-auto">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:block w-64 fixed top-16 bottom-0 left-0 z-20 pt-6 bg-white border-r border-slate-200">
            <div className="h-full">
                <TutorSidebar />
            </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 lg:ml-64 p-6 lg:p-10 mt-16 lg:mt-0">
            {children}
        </main>
      </div>
    </div>
  );
}