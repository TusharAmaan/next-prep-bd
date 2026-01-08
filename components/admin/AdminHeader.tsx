"use client";
import { Search, Bell, Menu, LogOut, Settings, User, ExternalLink, X, Trash2, Check, Eye, Mail, Calendar } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminHeader({ 
  user, 
  activeTab, 
  toggleSidebar,
  notifications = [], 
  onMarkRead,
  onDelete          // <--- New Prop
}: { 
  user: any, 
  activeTab: string, 
  toggleSidebar: () => void,
  notifications?: any[],
  onMarkRead?: (id: string) => void,
  onDelete?: (id: string) => void
}) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  
  // State for the Notification Detail Popup
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  
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

  const handleViewDetails = (n: any) => {
      setSelectedNotif(n);
      setShowNotif(false); // Close dropdown
      if (onMarkRead && n.status === 'new') onMarkRead(n.id); // Auto-mark as read when viewed
  };

  const title = activeTab.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const unreadCount = notifications.filter(n => n.status === 'new').length;

  return (
    <>
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
        
        <Link href="/" target="_blank" className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors" title="Open Public Site">
            <ExternalLink className="w-3.5 h-3.5"/> View Site
        </Link>

        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

        {/* --- NOTIFICATIONS --- */}
        <div className="relative" ref={notifRef}>
            <button 
                onClick={() => setShowNotif(!showNotif)} 
                className={`relative p-2.5 rounded-full transition-all ${showNotif ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
            >
                <Bell className="w-5 h-5"/>
                {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>}
            </button>

            {/* Dropdown List */}
            {showNotif && (
                <div className="absolute top-12 right-0 w-96 bg-white rounded-xl shadow-xl border border-slate-100 py-2 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notifications ({unreadCount})</span>
                        <button onClick={() => setShowNotif(false)} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4"/></button>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <div key={n.id} className={`p-4 border-b border-slate-50 group hover:bg-slate-50 transition-colors ${n.status === 'new' ? 'bg-indigo-50/30' : ''}`}>
                                    <div className="flex justify-between items-start gap-3">
                                        
                                        {/* Content Area (Click to View) */}
                                        <div className="flex-1 cursor-pointer" onClick={() => handleViewDetails(n)}>
                                            <div className="flex items-center gap-2 mb-1">
                                                {n.status === 'new' && <div className="w-2 h-2 rounded-full bg-indigo-600"></div>}
                                                <p className="font-bold text-slate-800 text-sm">{n.full_name}</p>
                                            </div>
                                            <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{n.message}</p>
                                            <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                                                <Calendar className="w-3 h-3"/> {new Date(n.created_at).toLocaleDateString()} at {new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>

                                        {/* Actions (Hover to show) */}
                                        <div className="flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleViewDetails(n); }}
                                                title="View Details"
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            >
                                                <Eye className="w-4 h-4"/>
                                            </button>
                                            
                                            {n.status === 'new' && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); if(onMarkRead) onMarkRead(n.id); }}
                                                    title="Mark as Read"
                                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                >
                                                    <Check className="w-4 h-4"/>
                                                </button>
                                            )}

                                            <button 
                                                onClick={(e) => { e.stopPropagation(); if(onDelete) onDelete(n.id); }}
                                                title="Delete"
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-400 text-xs italic flex flex-col items-center gap-2">
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

    {/* --- NOTIFICATION DETAIL POPUP --- */}
    {selectedNotif && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0">
                            {selectedNotif.full_name[0]}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">{selectedNotif.full_name}</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                <Mail className="w-3 h-3"/> {selectedNotif.email || 'No email provided'}
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setSelectedNotif(null)} className="p-2 bg-white rounded-full border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors">
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-8 max-h-[60vh] overflow-y-auto">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Message Content</p>
                    <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {selectedNotif.message}
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="w-3 h-3"/>
                        Sent on {new Date(selectedNotif.created_at).toLocaleDateString()} at {new Date(selectedNotif.created_at).toLocaleTimeString()}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
                    <button 
                        onClick={() => { if(onDelete) onDelete(selectedNotif.id); setSelectedNotif(null); }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors"
                    >
                        <Trash2 className="w-4 h-4"/> Delete
                    </button>
                    <button 
                        onClick={() => setSelectedNotif(null)}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg"
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

function Clock(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}