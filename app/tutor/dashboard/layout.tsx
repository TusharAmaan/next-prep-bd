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
    // ... (Your existing auth check logic) ...
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex pt-16"> 
      {/* ^^^ FIXED: Added 'pt-16' (64px) to push EVERYTHING down below the global navbar */}
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-slate-200 bg-white fixed inset-y-0 z-10 mt-16 h-[calc(100vh-64px)]">
        {/* ^^^ FIXED: Added 'mt-16' and adjusted height so it doesn't get hidden behind header */}
        <TutorSidebar />
      </aside>

      {/* MOBILE TOGGLE (Floating) */}
      <div className="lg:hidden fixed top-20 left-4 z-30">
        <button onClick={() => setIsMobileOpen(true)} className="p-2 bg-white shadow-md rounded-full border border-slate-200 text-slate-700">
            <Menu className="w-6 h-6"/>
        </button>
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl p-4 pt-20">
                <TutorSidebar toggleMobile={() => setIsMobileOpen(false)} />
                <button className="absolute top-6 right-4 p-2 bg-slate-100 rounded-full" onClick={() => setIsMobileOpen(false)}>
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:ml-72 w-full p-6 lg:p-10 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
}