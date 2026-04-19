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
    <header className={`sticky top-0 z-40 backdrop-blur-xl px-4 sm:px-8 py-4 flex items-center justify-between transition-all duration-300 ${isDark ? 'bg-slate-950/40 border-slate-800/50' : 'bg-white/60 border-slate-200/50'}`}>
      
      <div className="flex items-center gap-4 lg:gap-8">
        <button 
          onClick={toggleSidebar} 
          className={`lg:hidden p-3 rounded-2xl transition-all active:scale-90 ${isDark ? 'text-slate-400 hover:bg-slate-900 border border-slate-800' : 'text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
        >
            <Menu className="w-5 h-5"/>
        </button>
        <div className="flex items-center gap-2 sm:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-500/30">N</div>
            <h2 className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>NextPrep<span className="text-indigo-600">BD</span></h2>
        </div>

        <div className="hidden sm:block">
            <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{title || "Dashboard"}</h2>
            <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 ${isDark ? 'text-indigo-400/80' : 'text-indigo-600'}`}>NextPrep Command Center</p>
        </div>

        {/* Search Bar - Modern Compact */}
        <div className="relative group hidden lg:block">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isDark ? 'text-slate-600 group-focus-within:text-indigo-400' : 'text-slate-400 group-focus-within:text-indigo-600'}`} />
            <input 
              type="text" 
              placeholder="Search assets..." 
              className={`pl-11 pr-4 py-2.5 rounded-2xl text-xs font-medium outline-none w-72 transition-all ${isDark ? 'bg-slate-900/50 border border-slate-800 text-slate-300 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-900/40' : 'bg-slate-100/50 border border-slate-200 text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-100'}`} 
            />
        </div>
        
        {/* Mobile Search Toggle */}
        <button className={`lg:hidden w-10 h-10 rounded-2xl flex items-center justify-center transition-all border ${isDark ? 'text-slate-400 border-slate-800 hover:bg-slate-800' : 'text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
            <Search className="w-5 h-5"/>
        </button>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleTheme}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all border ${isDark ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <Link href="/" target="_blank" className={`hidden md:flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${isDark ? 'text-slate-300 border-slate-800 hover:bg-slate-800' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`} title="Open Public Site">
            <ExternalLink className="w-3.5 h-3.5"/> View Site
        </Link>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
            <button 
                onClick={() => setShowNotif(!showNotif)} 
                className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all border ${showNotif ? (isDark ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-200') : isDark ? 'text-slate-400 border-slate-800 hover:bg-slate-800' : 'text-slate-500 border-slate-200 hover:bg-slate-50'}`}
            >
                <Bell className="w-5 h-5"/>
                {unreadCount > 0 && <span className={`absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full border-2 flex items-center justify-center animate-bounce ${isDark ? 'border-slate-950' : 'border-white'}`}>{unreadCount}</span>}
            </button>

            {showNotif && (
                <div className={`absolute top-14 right-0 w-[calc(100vw-2rem)] sm:w-96 rounded-3xl shadow-3xl border py-2 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300 ${isDark ? 'bg-[#1a1d2d] border-slate-800' : 'bg-white border-slate-100'}`}>
                    <div className={`px-6 py-4 border-b flex justify-between items-center ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-50 bg-slate-50/50'}`}>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Inbox ({unreadCount})</span>
                        <button onClick={() => setShowNotif(false)} className={`${isDark ? 'text-slate-500' : 'text-slate-400'} hover:text-rose-500`}><X className="w-4 h-4"/></button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <div key={n.id} className={`p-5 border-b group transition-colors cursor-pointer ${isDark ? 'border-slate-800 hover:bg-slate-800/40' : 'border-slate-50 hover:bg-slate-50/60'} ${n.status === 'new' ? (isDark ? 'bg-indigo-500/5' : 'bg-indigo-500/5') : ''}`} onClick={() => handleViewDetails(n)}>
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${isDark ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                                    {n.full_name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className={`font-black text-xs ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{n.full_name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold">{new Date(n.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <p className={`text-xs line-clamp-2 leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{n.message}</p>
                                        </div>
                                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); if(onDelete) onDelete(n.id); }} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-3.5 h-3.5"/></button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={`p-10 text-center text-[10px] font-black uppercase tracking-[0.2em] space-y-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                <Bell className="w-12 h-12 mx-auto opacity-10"/>
                                <p>No Unread Messages</p>
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
                className={`flex items-center gap-3 pl-2 py-1.5 pr-1.5 rounded-2xl transition-all border ${showMenu ? (isDark ? 'bg-slate-800 border-indigo-600/50 shadow-lg' : 'bg-white border-indigo-600/30 shadow-lg') : 'border-transparent'}`}
            >
                <div className="text-right hidden xl:block">
                    <p className={`text-[10px] font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.full_name || "Admin"}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Command Line</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-2xl flex items-center justify-center shadow-lg font-black text-sm border-2 border-white/20">
                    {user?.full_name?.[0] || "A"}
                </div>
            </button>

            {showMenu && (
                <div className={`absolute top-14 right-0 w-64 rounded-3xl shadow-3xl border p-2 animate-in fade-in slide-in-from-top-4 duration-300 z-50 ${isDark ? 'bg-[#1a1d2d] border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className={`px-4 py-3 border-b mb-1 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.full_name}</p>
                        <p className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{user?.email}</p>
                    </div>
                    <Link href="/profile" className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-2xl transition-all ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
                        <User className="w-4 h-4"/> Account Settings
                    </Link>
                    <div className={`h-px my-1 mx-2 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}></div>
                    <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black text-rose-500 rounded-2xl transition-all ${isDark ? 'hover:bg-rose-500/10' : 'hover:bg-rose-50'}`}>
                        <LogOut className="w-4 h-4"/> Terminate Session
                    </button>
                </div>
            )}
        </div>
      </div>
    </header>

    {/* Notification Detail Popup */}
    {selectedNotif && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
            <div className={`rounded-[2.5rem] shadow-4xl w-full max-w-xl overflow-hidden flex flex-col border ${isDark ? 'bg-[#121421] border-slate-800/50' : 'bg-white border-slate-200'}`}>
                
                <div className={`p-8 border-b flex justify-between items-start ${isDark ? 'bg-slate-900/40 border-slate-800/50' : 'bg-slate-50/50 border-slate-100'}`}>
                    <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-3xl flex items-center justify-center font-black text-2xl shadow-xl ${isDark ? 'bg-indigo-600/20 text-indigo-400 shadow-indigo-500/10' : 'bg-indigo-600 text-white shadow-indigo-500/20'}`}>
                            {selectedNotif.full_name?.[0] || 'U'}
                        </div>
                        <div>
                            <h3 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedNotif.full_name}</h3>
                            <div className="flex items-center gap-3 text-[10px] font-black mt-2 uppercase tracking-widest text-slate-500">
                                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5"/> {selectedNotif.email}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setSelectedNotif(null)} className={`p-3 rounded-2xl border transition-all ${isDark ? 'bg-slate-950 border-slate-800 text-slate-500 hover:text-rose-500' : 'bg-white border-slate-200 text-slate-400 hover:text-rose-600'} hover:scale-110 active:scale-95`}>
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                <div className="p-10 max-h-[50vh] overflow-y-auto custom-scrollbar">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-indigo-500">Transmission Content</p>
                    <div className={`text-base leading-relaxed whitespace-pre-wrap p-8 rounded-[2rem] border-2 font-medium ${isDark ? 'text-slate-200 bg-slate-950/50 border-slate-800/50' : 'text-slate-700 bg-slate-50/50 border-slate-100'}`}>
                        {selectedNotif.message}
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <ClockIcon className="w-4 h-4"/>
                        Received {new Date(selectedNotif.created_at).toLocaleString()}
                    </div>
                </div>

                <div className={`p-6 border-t flex justify-end gap-4 ${isDark ? 'bg-slate-900/40 border-slate-800/50' : 'bg-slate-50/50 border-slate-100'}`}>
                    <button 
                        onClick={() => { if(onDelete) onDelete(selectedNotif.id); setSelectedNotif(null); }}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-rose-500/20 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                    >
                        <Trash2 className="w-4 h-4"/> Delete Log
                    </button>
                    <button 
                        onClick={() => setSelectedNotif(null)}
                        className="px-8 py-3.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                        Acknowledge
                    </button>
                </div>
            </div>
        </div>
    )}

    </>
  );
}