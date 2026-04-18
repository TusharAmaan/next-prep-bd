"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, FileText, Newspaper, 
  User, LogOut, FileStack, PlusCircle, 
  MessageSquare, Settings, CheckCircle, 
  PenTool, ListTodo
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function EditorSidebar({ toggleMobile }: { toggleMobile?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const menuGroups = [
    {
      title: "Content",
      items: [
        { label: "Overview", href: "/editor/dashboard", icon: LayoutDashboard },
        { label: "Blog Posts", href: "/editor/dashboard/blog", icon: FileText },
        { label: "Newsroom", href: "/editor/dashboard/news", icon: Newspaper },
        { label: "Drafts", href: "/editor/dashboard/drafts", icon: PenTool },
      ]
    },
    {
      title: "Review Center",
      items: [
        { label: "Pending Reviews", href: "/editor/dashboard/reviews", icon: CheckCircle },
        { label: "Tasks", href: "/editor/dashboard/tasks", icon: ListTodo },
        { label: "User Feedback", href: "/editor/dashboard/feedback", icon: MessageSquare },
      ]
    },
    {
      title: "Account",
      items: [
        { label: "Profile", href: "/profile", icon: User },
        { label: "Settings", href: "/editor/dashboard/settings", icon: Settings },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-64 flex-shrink-0 text-slate-300">
      
      {/* 1. Header */}
      <div className="p-6 border-b border-slate-800/60 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-900/40">
            E
        </div>
        <div>
            <h2 className="font-bold text-white text-sm leading-tight tracking-tight">Editor Console</h2>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5">Content Management</p>
        </div>
      </div>

      {/* 2. Scrollable Nav Area */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        
        {/* Primary CTA */}
        <button 
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-900/20 hover:bg-indigo-500 transition-all hover:scale-[1.02] active:scale-95 group"
        >
            <PlusCircle className="w-4 h-4 text-indigo-200 group-hover:text-white transition-colors" /> 
            <span>Create New Post</span>
        </button>

        {/* Menu Groups */}
        {menuGroups.map((group, idx) => (
            <div key={idx} className="animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${idx * 100}ms` }}>
                <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
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
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all relative group ${
                                    isActive 
                                    ? "bg-slate-800 text-white shadow-sm ring-1 ring-slate-700" 
                                    : "hover:bg-slate-800/50 hover:text-white"
                                }`}
                            >
                                <item.icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                                <span className="tracking-tight">{item.label}</span>
                                {isActive && (
                                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-500 rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        ))}
      </nav>

      {/* 3. Footer */}
      <div className="p-4 border-t border-slate-800/60">
        <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-red-400 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 transition-all active:scale-95"
        >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </div>
  );
}
