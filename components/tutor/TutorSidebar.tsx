"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, FileText, BookOpen, 
  User, LogOut, FileStack, PlusCircle, 
  Hammer, Layers, CreditCard, Settings, Crown
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function TutorSidebar({ toggleMobile }: { toggleMobile?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Grouped Menu Items for Better Organization
  const menuGroups = [
    {
      title: "Workspace",
      items: [
        { label: "Overview", href: "/tutor/dashboard", icon: LayoutDashboard },
        { label: "Exam Composer", href: "/tutor/dashboard/question-builder", icon: Hammer },
        { label: "My Saved Exams", href: "/tutor/dashboard/my-exams", icon: Layers },
        { label: "Course Manager", href: "/tutor/dashboard/courses", icon: BookOpen },
      ]
    },
    {
      title: "Library",
      items: [
        { label: "My Content", href: "/tutor/dashboard/content", icon: FileStack },
      ]
    },
    {
      title: "Account & Billing",
      items: [
        { label: "Subscription", href: "/tutor/dashboard/subscription", icon: CreditCard },
        { label: "Settings", href: "/tutor/dashboard/settings", icon: Settings },
        { label: "Profile", href: "/profile", icon: User },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64 flex-shrink-0">
      
      {/* 1. Header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">
            T
        </div>
        <div>
            <h2 className="font-bold text-slate-800 text-sm leading-tight">Tutor Portal</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Professional Console</p>
        </div>
      </div>

      {/* 2. Scrollable Nav Area */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        
        {/* Primary CTA */}
        <Link 
            href="/tutor/dashboard/question-builder" 
            onClick={toggleMobile}
            className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white rounded-xl font-bold shadow-xl shadow-slate-200 hover:bg-black transition-all hover:scale-[1.02] active:scale-95 group"
        >
            <PlusCircle className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" /> 
            <span>Create Exam</span>
        </Link>

        {/* Menu Groups */}
        {menuGroups.map((group, idx) => (
            <div key={idx}>
                <h3 className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    {group.title}
                </h3>
                <div className="space-y-1">
                    {group.items.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={toggleMobile}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                    isActive 
                                    ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100" 
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                            >
                                <item.icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                                {item.label}
                                {item.label === 'Subscription' && (
                                    <Crown className="w-3 h-3 text-amber-400 ml-auto fill-amber-400"/>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        ))}
      </nav>

      {/* 3. Footer */}
      <div className="p-4 border-t border-slate-100">
        <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors"
        >
            <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}