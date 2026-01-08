"use client";
import { Search, Bell, Menu, LogOut, Settings, User, ExternalLink, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminHeader({ 
  user, 
  activeTab, 
  toggleSidebar,
  notifications = [], // Receive notifications
  onMarkRead          // Function to mark as read
}: { 
  user: any, 
  activeTab: string, 
  toggleSidebar: () => void,
  notifications?: any[],
  onMarkRead?: (id: string) => void
}) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const title = activeTab.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const unreadCount = notifications.filter(n => n.status === 'new').length;

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between transition-all">
      
      {/* LEFT: Sidebar Toggle & Title */}
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
            <Menu className="w-5 h-5"/>
        </button>
        <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">{title || "Dashboard"}</h2>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">Manage your platform content</p>
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        
        {/* View Site Button (Home) */}
        <Link href="/" target="_blank" className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors" title="Open Public Site">
            <ExternalLink className="w-3.5 h-3.5"/> View Site
        </Link>

        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
            <button 
                onClick={() => setShowNotif(!showNotif)} 
                className={`relative p-2.5 rounded-full transition-all ${showNotif ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
            >
                <Bell className="w-5 h-5"/>
                {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>}
            </button>

            {/* Notification Dropdown */}
            {showNotif && (
                <div className="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-50 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notifications</span>
                        <button onClick={() => setShowNotif(false)} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4"/></button>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                            notifications.slice(0,5).map(n => (
                                <div key={n.id} className={`p-3 border-b border-slate-50 text-sm hover:bg-slate-50 cursor-pointer transition-colors ${n.status === 'new' ? 'bg-indigo-50/50' : ''}`} onClick={() => { if(onMarkRead) onMarkRead(n.id); }}>
                                    <div className="flex items-start gap-3">
                                        <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${n.status === 'new' ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-xs">{n.full_name}</p>
                                            <p className="text-slate-500 text-xs truncate w-52">{n.message}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-400 text-xs italic">No notifications</div>
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <div className="p-2 border-t border-slate-50 bg-slate-50/50 text-center">
                            <button className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setShowMenu(!showMenu)}
                className={`flex items-center gap-3 pl-2 py-1 pr-1 rounded-full transition-all border ${showMenu ? 'bg-white border-indigo-100 shadow-sm ring-2 ring-indigo-50' : 'border-transparent hover:bg-slate-50'}`}
            >
                <div className="text-right hidden lg:block">
                    <p className="text-xs font-bold text-slate-800 leading-none">{user?.full_name || "Admin"}</p>
                    <p className="text-[10px] text-slate-400 font-medium leading-none mt-1 uppercase tracking-wider">Super Admin</p>
                </div>
                <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-full flex items-center justify-center shadow-md font-bold text-sm border-2 border-white">
                    {user?.full_name?.[0] || "A"}
                </div>
            </button>

            {showMenu && (
                <div className="absolute top-14 right-0 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 z-50">
                    
                    {/* User Info (Mobile Only) */}
                    <div className="lg:hidden px-3 py-2 border-b border-slate-50 mb-1">
                        <p className="text-sm font-bold text-slate-900">{user?.full_name}</p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>

                    <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                        <User className="w-4 h-4"/> Edit Profile
                    </Link>
                    
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                        <Settings className="w-4 h-4"/> Settings
                    </button>

                    <div className="h-px bg-slate-100 my-1 mx-2"></div>

                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                        <LogOut className="w-4 h-4"/> Sign Out
                    </button>
                </div>
            )}
        </div>

      </div>
    </header>
  );
}