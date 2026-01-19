"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, FileText, BookOpen, 
  User, LogOut, FileStack, PlusCircle, Hammer // <--- NEW ICON
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function TutorSidebar({ toggleMobile }: { toggleMobile?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const menuItems = [
    { label: "Overview", href: "/tutor/dashboard", icon: LayoutDashboard },
    { label: "Question Builder", href: "/tutor/dashboard/question-builder", icon: Hammer }, // <--- NEW ITEM
    { label: "My Content", href: "/tutor/dashboard/content", icon: FileStack },
    { label: "My Courses", href: "/tutor/dashboard/courses", icon: BookOpen },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            T
        </div>
        <div>
            <h2 className="font-bold text-slate-800 leading-none">Tutor Panel</h2>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">Instructor Zone</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <Link 
            href="/tutor/dashboard/create" 
            onClick={toggleMobile}
            className="flex items-center gap-3 px-4 py-3 mb-6 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
        >
            <PlusCircle className="w-5 h-5" /> Create New
        </Link>

        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={toggleMobile}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                isActive 
                  ? "bg-slate-900 text-white shadow-md" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
        >
            <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>
    </div>
  );
}