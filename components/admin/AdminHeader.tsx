"use client";
import { Search, Bell, Menu, LogOut, Settings, User, ExternalLink, X, Trash2, Check, Eye, Mail, Moon, Sun } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/shared/ThemeProvider";

function ClockIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}

export default function AdminHeader({ 
  user, 
  activeTab, 
  toggleSidebar,
  notifications = [], 
  onMarkRead,
  onDelete,
}: { 
  user: any, 
  activeTab: string, 
  toggleSidebar: () => void,
  notifications?: any[],
  onMarkRead?: (id: string) => void,
  onDelete?: (id: string) => void,
}) {
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

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

  const handleViewDetails = (n: any) => {
      setSelectedNotif(n);
      setShowNotif(false);
      if (onMarkRead && n.status === 'new') onMarkRead(n.id);
  };

  const title = activeTab.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const unreadCount = notifications.filter(n => n.status === 'new').length;

  return (
    <>
    <header className={`sticky top-0 z-30 backdrop-blur-md border-b px-6 py-3 flex items-center justify-between transition-all ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
      
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className={`lg:hidden p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-900' : 'text-slate-500 hover:bg-slate-100'}`}>
            <Menu className="w-5 h-5"/>
        </button>
        <div>
            <h2 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{title || "Dashboard"}</h2>
            <p className={`text-[10px] font-bold uppercase tracking-widest hidden sm:block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>NextPrep Control Center</p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleTheme}
          className={`p-2 rounded-full border transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <Link href="/" target="_blank" className={`hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${isDark ? 'text-slate-300 bg-slate-800 hover:bg-slate-700' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'}`} title="Open Public Site">
            <ExternalLink className="w-3.5 h-3.5"/> View Site
        </Link>

        <div className={`h-6 w-px hidden md:block ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
            <button 
                onClick={() => setShowNotif(!showNotif)} 
                className={`relative p-2.5 rounded-full transition-all ${showNotif ? (isDark ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
            >
                <Bell className="w-5 h-5"/>
                {unreadCount > 0 && <span className={`absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border animate-pulse ${isDark ? 'border-slate-950' : 'border-white'}`}></span>}
            </button>

            {showNotif && (
                <div className={`absolute top-12 right-0 w-96 rounded-xl shadow-xl border py-2 overflow-hidden z-50 animate-nav-slide-down ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                    <div className={`px-4 py-3 border-b flex justify-between items-center ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-50 bg-slate-50/50'}`}>
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Notifications ({unreadCount})</span>
                        <button onClick={() => setShowNotif(false)} className={`${isDark ? 'text-slate-500' : 'text-slate-400'} hover:text-red-500`}><X className="w-4 h-4"/></button>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <div key={n.id} className={`p-4 border-b group transition-colors ${isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-50 hover:bg-slate-50'} ${n.status === 'new' ? (isDark ? 'bg-indigo-900/20' : 'bg-indigo-50/30') : ''}`}>
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex-1 cursor-pointer" onClick={() => handleViewDetails(n)}>
                                            <div className="flex items-center gap-2 mb-1">
                                                {n.status === 'new' && <div className="w-2 h-2 rounded-full bg-indigo-600"></div>}
                                                <p className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{n.full_name}</p>
                                            </div>
                                            <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{n.message}</p>
                                            <p className={`text-[10px] mt-2 flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                <ClockIcon className="w-3 h-3"/> {new Date(n.created_at).toLocaleDateString()} at {new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleViewDetails(n); }}
                                                title="View Details"
                                                className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-500 hover:text-indigo-400 hover:bg-indigo-900/20' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                            >
                                                <Eye className="w-4 h-4"/>
                                            </button>
                                            
                                            {n.status === 'new' && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); if(onMarkRead) onMarkRead(n.id); }}
                                                    title="Mark as Read"
                                                    className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-900/20' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                                >
                                                    <Check className="w-4 h-4"/>
                                                </button>
                                            )}

                                            <button 
                                                onClick={(e) => { e.stopPropagation(); if(onDelete) onDelete(n.id); }}
                                                title="Delete"
                                                className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-500 hover:text-red-400 hover:bg-red-900/20' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                                            >
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={`p-8 text-center text-xs italic flex flex-col items-center gap-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                <Bell className="w-8 h-8 opacity-20"/>
                                No notifications yet
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setShowMenu(!showMenu)}
                className={`flex items-center gap-3 pl-2 py-1 pr-1 rounded-full transition-all border ${showMenu ? (isDark ? 'bg-slate-800 border-slate-700 shadow-sm ring-2 ring-slate-700' : 'bg-white border-indigo-100 shadow-sm ring-2 ring-indigo-50') : 'border-transparent'}`}
            >
                <div className="text-right hidden lg:block">
                    <p className={`text-xs font-bold leading-none ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{user?.full_name || "Admin"}</p>
                    <p className={`text-[10px] font-medium leading-none mt-1 uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Super Admin</p>
                </div>
                <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-full flex items-center justify-center shadow-md font-bold text-sm border-2 border-white dark:border-slate-800">
                    {user?.full_name?.[0] || "A"}
                </div>
            </button>

            {showMenu && (
                <div className={`absolute top-14 right-0 w-56 rounded-2xl shadow-xl border p-2 animate-nav-slide-down z-50 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                    <div className={`lg:hidden px-3 py-2 border-b mb-1 ${isDark ? 'border-slate-700' : 'border-slate-50'}`}>
                        <p className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{user?.full_name}</p>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user?.email}</p>
                    </div>
                    <Link href="/profile" className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${isDark ? 'text-slate-300 hover:text-indigo-400 hover:bg-slate-700' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                        <User className="w-4 h-4"/> Edit Profile
                    </Link>
                    <button className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${isDark ? 'text-slate-300 hover:text-indigo-400 hover:bg-slate-700' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                        <Settings className="w-4 h-4"/> Settings
                    </button>
                    <div className={`h-px my-1 mx-2 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}></div>
                    <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 rounded-xl transition-colors ${isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}`}>
                        <LogOut className="w-4 h-4"/> Sign Out
                    </button>
                </div>
            )}
        </div>
      </div>
    </header>

    {/* Notification Detail Popup */}
    {selectedNotif && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-scale-in">
            <div className={`rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                
                <div className={`p-6 border-b flex justify-between items-start ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
                    <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${isDark ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                            {selectedNotif.full_name[0]}
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedNotif.full_name}</h3>
                            <div className={`flex items-center gap-2 text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                <Mail className="w-3 h-3"/> {selectedNotif.email || 'No email provided'}
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setSelectedNotif(null)} className={`p-2 rounded-full border transition-colors ${isDark ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-400'} hover:text-red-500 hover:border-red-200`}>
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                <div className="p-8 max-h-[60vh] overflow-y-auto">
                    <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Message Content</p>
                    <div className={`text-sm leading-relaxed whitespace-pre-wrap p-4 rounded-xl border ${isDark ? 'text-slate-200 bg-slate-900 border-slate-700' : 'text-slate-700 bg-slate-50 border-slate-100'}`}>
                        {selectedNotif.message}
                    </div>
                    <div className={`mt-6 flex items-center gap-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        <ClockIcon className="w-3 h-3"/>
                        Sent on {new Date(selectedNotif.created_at).toLocaleDateString()} at {new Date(selectedNotif.created_at).toLocaleTimeString()}
                    </div>
                </div>

                <div className={`p-4 border-t flex justify-end gap-3 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-100 bg-white'}`}>
                    <button 
                        onClick={() => { if(onDelete) onDelete(selectedNotif.id); setSelectedNotif(null); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm transition-colors ${isDark ? 'border-red-800 text-red-400 hover:bg-red-900/20' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
                    >
                        <Trash2 className="w-4 h-4"/> Delete
                    </button>
                    <button 
                        onClick={() => setSelectedNotif(null)}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-colors ${isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )}
    </>
  );
}