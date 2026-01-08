"use client";
import { Search, Bell, User, LogOut, Menu } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AdminHeader({ 
  user, 
  activeTab, 
  toggleSidebar 
}: { 
  user: any, 
  activeTab: string, 
  toggleSidebar: () => void 
}) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Format title (e.g., 'segment_updates' -> 'Segment Updates')
  const title = activeTab.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between transition-all">
      
      {/* LEFT: Sidebar Toggle & Title */}
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <Menu className="w-5 h-5"/>
        </button>
        <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">{title || "Dashboard"}</h2>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">Manage your platform content</p>
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-4">
        
        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-2 w-64 focus-within:w-80 focus-within:border-indigo-300 transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2"/>
            <input 
                type="text" 
                placeholder="Global search..." 
                className="bg-transparent text-sm font-medium text-slate-700 outline-none w-full placeholder:text-slate-400"
            />
        </div>

        <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <Bell className="w-5 h-5"/>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-3 pl-2 py-1 pr-1 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
            >
                <div className="text-right hidden lg:block">
                    <p className="text-xs font-bold text-slate-800 leading-none">{user?.full_name || "Admin"}</p>
                    <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">Super Admin</p>
                </div>
                <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 font-bold text-sm">
                    {user?.full_name?.[0] || "A"}
                </div>
            </button>

            {showMenu && (
                <div className="absolute top-12 right-0 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 animate-in fade-in slide-in-from-top-2">
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4"/> Sign Out
                    </button>
                </div>
            )}
        </div>

      </div>
    </header>
  );
}