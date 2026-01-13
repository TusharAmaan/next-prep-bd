"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, FileText, PlusCircle, 
  BarChart3, Settings, LogOut, BookOpen 
} from "lucide-react";
// FIX: Import the 'supabase' instance directly
import { supabase } from "@/lib/supabaseClient"; 

export default function TutorSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navItems = [
    { label: "Overview", href: "/tutor/dashboard", icon: LayoutDashboard },
    // NEW: Added Courses Tab
    { label: "My Courses", href: "/tutor/dashboard/courses", icon: BookOpen },
    { label: "My Resources", href: "/tutor/dashboard/content", icon: FileText },
    { label: "Create New", href: "/tutor/dashboard/create", icon: PlusCircle },
    { label: "Earnings", href: "/tutor/dashboard/earnings", icon: BarChart3 }, 
    { label: "Settings", href: "/tutor/dashboard/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex-col hidden lg:flex fixed left-0 top-0 border-r border-slate-800 z-50">
      
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Link href="/" className="font-black text-xl tracking-tight flex items-center gap-2">
          <span className="text-indigo-500">Next</span>Prep<span className="text-indigo-500">.</span>
          <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full ml-2">TUTOR</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          // Highlight active if path starts with href (handles sub-pages like /courses/123)
          const isActive = pathname === item.href || (item.href !== '/tutor/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-500 group-hover:text-white"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}