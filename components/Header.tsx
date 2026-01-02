"use client";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  Search, Menu, X, Home, BookOpen, 
  GraduationCap, Bell, MessageCircle, 
  LogOut, LayoutDashboard, ChevronDown, 
  Settings, Layers, FileText, Briefcase, 
  Library, Trash2, Check
} from "lucide-react";

export default function Header() {
  // --- STATE ---
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Notification State
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  // Dropdown States
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeDesktopDropdown, setActiveDesktopDropdown] = useState<string | null>(null);
  
  const pathname = usePathname();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // --- 1. DATA FETCHING (Refactored to be reusable) ---
  const fetchUserData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { 
        setUser(null); 
        setProfile(null); 
        return; 
    }
    
    setUser(session.user);
    
    // Fetch Profile & Goal
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (data) {
      setProfile(data);
      if (data.role === 'admin') fetchNotifications();
    }
  }, []);

  // Initial Load & Auth Listener
  useEffect(() => {
    fetchUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserData]);

  // --- FIX: Re-fetch on Path Change (Updates 'Materials' link after profile save) ---
  useEffect(() => {
    fetchUserData(); // <--- This ensures the header updates when you navigate away from Profile
    setActiveDesktopDropdown(null);
    setIsMobileOpen(false);
    setShowProfileMenu(false);
    setShowNotifications(false);
  }, [pathname, fetchUserData]);


  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setShowProfileMenu(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifications(false);
      if (navRef.current && !navRef.current.contains(event.target as Node)) setActiveDesktopDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  // --- 2. NOTIFICATIONS ---
  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('feedbacks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setNotifications(data);
      const unread = data.filter((n: any) => n.status === 'new').length;
      setUnreadCount(unread);
    }
  };

  const handleNotificationClick = () => {
    if (!showNotifications) fetchNotifications();
    setShowNotifications(!showNotifications);
  };

  const markAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const currentNotif = notifications.find(n => n.id === id);
    if (currentNotif && currentNotif.status === 'new') {
        setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
    await supabase.from('feedbacks').update({ status: 'read' }).eq('id', id);
  };

  const deleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(!confirm("Delete this notification?")) return;
    const currentNotif = notifications.find(n => n.id === id);
    if (currentNotif && currentNotif.status === 'new') {
        setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
    await supabase.from('feedbacks').delete().eq('id', id);
  };

  // --- 3. HELPERS ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsMobileOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const getDashboardLink = () => {
    if (profile?.role === 'admin') return '/admin';
    if (profile?.role === 'tutor') return '/tutor/dashboard';
    if (profile?.role === 'institution') return '/institution/dashboard';
    return '/student/dashboard'; 
  };

  // --- 4. DYNAMIC LINK LOGIC (FIXED) ---
  const getMaterialsLink = () => {
      // If goal exists, return it. Otherwise default to profile.
      return profile?.current_goal ? profile.current_goal : '/profile';
  };

  // --- DATA ---
  const centerNav = [
    { name: "Home", icon: Home, href: "/", isDropdown: false },
    { name: "Courses", icon: BookOpen, href: "/courses", isDropdown: false },
    { name: "Exams", icon: Layers, href: "#", isDropdown: true },
    { name: "eBooks", icon: FileText, href: "/ebooks", isDropdown: false },
  ];

  const examLinks = [
    { name: "SSC", href: "/resources/ssc", icon: BookOpen, color: "bg-blue-100 text-blue-600" },
    { name: "HSC", href: "/resources/hsc", icon: BookOpen, color: "bg-purple-100 text-purple-600" },
    { name: "University Admission", href: "/resources/university-admission", icon: GraduationCap, color: "bg-green-100 text-green-600" },
    { name: "Medical Prep", href: "/resources/university-admission/science/medical-admission", icon: ActivityIcon, color: "bg-red-100 text-red-600" },
    { name: "IBA MBA", href: "/resources/master's-admission/mba/iba", icon: Briefcase, color: "bg-orange-100 text-orange-600" },
    { name: "Job Prep", href: "/resources/job-prep", icon: Briefcase, color: "bg-slate-100 text-slate-600" },
  ];

  const mobileShortcuts = [
    { name: "Home", href: "/", icon: Home, color: "text-blue-600" },
    { name: "Dashboard", href: getDashboardLink(), icon: LayoutDashboard, color: "text-orange-600" },
    { name: "Courses", href: "/courses", icon: BookOpen, color: "text-green-600" },
    { name: "Materials", href: getMaterialsLink(), icon: Library, color: "text-purple-600" },
    { name: "eBooks", href: "/ebooks", icon: FileText, color: "text-red-500" },
  ];

  if (profile?.role !== 'admin') {
    mobileShortcuts.push({ name: "Feedback", href: "/feedback", icon: MessageCircle, color: "text-teal-600" });
  }

  const getNavClass = (path: string, isDropdown: boolean) => {
    const isActive = pathname === path || (isDropdown && activeDesktopDropdown === "Exams");
    return `relative group flex items-center justify-center w-20 lg:w-28 h-12 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden ${isActive ? "text-blue-600 bg-blue-50/50" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 hover:scale-105 active:scale-95"}`;
  };

  return (
    <>
    {/* --- NOTIFICATION MODAL --- */}
    {selectedNotification && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in font-sans">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95">
                <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedNotification.category === 'bug' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                             {selectedNotification.full_name?.[0]}
                         </div>
                         <div>
                             <h3 className="font-bold text-lg text-slate-900">{selectedNotification.full_name}</h3>
                             <p className="text-xs text-slate-500 uppercase font-bold">{selectedNotification.role} • {selectedNotification.category}</p>
                         </div>
                    </div>
                    <button onClick={() => setSelectedNotification(null)} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm leading-relaxed mb-6 max-h-60 overflow-y-auto">
                    {selectedNotification.message}
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={(e) => { markAsRead(e, selectedNotification.id); setSelectedNotification(null); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700">
                        Mark Read & Close
                    </button>
                </div>
            </div>
        </div>
    )}

    {/* --- HEADER --- */}
    <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm h-16 border-b border-white/20 font-sans">
      <div className="flex items-center justify-between h-full px-4 max-w-[1920px] mx-auto">
        
        {/* --- LEFT: LOGO --- */}
        <div className="flex items-center gap-4 w-auto lg:w-[25%]">
          <Link href="/" className="flex-shrink-0 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 group-hover:rotate-3 transition-transform">
              N
            </div>
          </Link>
          <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-slate-100/80 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 rounded-full px-4 py-2.5 w-64 transition-all">
            <Search className="w-4 h-4 text-slate-500 mr-2 flex-shrink-0" />
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-sm placeholder:text-slate-400 text-slate-900 w-full" />
          </form>
        </div>

        {/* --- CENTER: MAIN NAV --- */}
        <nav className="hidden md:flex items-center justify-center flex-1 h-full relative gap-1" ref={navRef}>
          {centerNav.map((item) => (
            <div key={item.name}>
                {item.isDropdown ? (
                    <button onClick={() => setActiveDesktopDropdown(activeDesktopDropdown === item.name ? null : item.name)} className={getNavClass(item.href, true)}>
                        <item.icon className={`w-7 h-7 transition-all ${activeDesktopDropdown === item.name ? "fill-blue-200 stroke-blue-600" : "stroke-[1.5px]"}`} />
                        {activeDesktopDropdown === item.name && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-t-full"></span>}
                    </button>
                ) : (
                    <Link href={item.href} className={getNavClass(item.href, false)}>
                        <item.icon className={`w-7 h-7 transition-all ${pathname === item.href ? "fill-blue-200 stroke-blue-600" : "stroke-[1.5px]"}`} />
                        {pathname === item.href && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-t-full"></span>}
                    </Link>
                )}
            </div>
          ))}

          {/* EXAMS MEGA MENU */}
          {activeDesktopDropdown === "Exams" && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[650px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 p-6 animate-in fade-in slide-in-from-top-4 z-[60]">
                <div className="grid grid-cols-2 gap-4">
                    {examLinks.map((sub) => (
                        <Link key={sub.name} href={sub.href} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${sub.color}`}><sub.icon className="w-6 h-6" /></div>
                            <div><p className="font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors">{sub.name}</p><p className="text-xs text-slate-500 font-medium">Click to explore resources</p></div>
                        </Link>
                    ))}
                </div>
            </div>
          )}
        </nav>

        {/* --- RIGHT: ACTIONS --- */}
        <div className="hidden md:flex items-center justify-end gap-3 w-[25%]">
          {user ? (
            <>
              {profile?.role === 'admin' && (
                  <div className="relative" ref={notifRef}>
                      <button onClick={handleNotificationClick} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors relative group border border-slate-100">
                        <Bell className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
                        {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">{unreadCount}</span>}
                      </button>
                      {showNotifications && (
                          <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-0 animate-in fade-in zoom-in-95 duration-100 z-50 overflow-hidden">
                              <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                  <h4 className="font-bold text-slate-800">Notifications</h4>
                                  <span className="text-xs font-bold text-slate-400">{unreadCount} new</span>
                              </div>
                              <div className="max-h-80 overflow-y-auto">
                                  {notifications.length === 0 ? <div className="p-8 text-center text-slate-500 text-sm">No notifications</div> : notifications.map((notif) => (
                                      <div key={notif.id} onClick={() => { setSelectedNotification(notif); setShowNotifications(false); }} className={`p-3 border-b border-slate-50 transition-colors flex gap-3 cursor-pointer group ${notif.status === 'read' ? 'bg-white opacity-60' : 'bg-blue-50/30'}`}>
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${notif.category === 'bug' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>{notif.category === 'bug' ? <Settings className="w-4 h-4"/> : <MessageCircle className="w-4 h-4"/>}</div>
                                          <div className="flex-1 min-w-0"><p className="text-sm font-bold text-slate-800 truncate">{notif.full_name}</p><p className="text-xs text-slate-500 truncate">{notif.message}</p></div>
                                          <div className="flex flex-col gap-1">{notif.status === 'new' && <button onClick={(e) => markAsRead(e, notif.id)} className="text-green-600 hover:bg-green-100 p-1 rounded"><Check className="w-3 h-3" /></button>}<button onClick={(e) => deleteNotification(e, notif.id)} className="text-red-500 hover:bg-red-100 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button></div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              )}
              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-slate-200 hover:bg-slate-50 transition-all group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">{profile?.full_name?.[0] || user.email[0]}</div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>
                {showProfileMenu && (
                  <div className="absolute top-12 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 animate-in fade-in zoom-in-95 duration-100 origin-top-right ring-1 ring-black/5">
                    <div className="px-3 py-3 mb-2 bg-slate-50 rounded-xl"><p className="font-bold text-slate-900">{profile?.full_name || "User"}</p><p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{profile?.role || "Student"}</p></div>
                    <div className="space-y-1">
                        <Link href={getDashboardLink()} className="menu-item flex items-center gap-3 px-3 py-2 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><LayoutDashboard className="w-4 h-4" /> Dashboard</Link>
                        <Link href="/profile" className="menu-item flex items-center gap-3 px-3 py-2 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg"><Settings className="w-4 h-4" /> Settings</Link>
                    </div>
                    <div className="border-t border-slate-100 mt-2 pt-2"><button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors text-left"><LogOut className="w-4 h-4" /> Log Out</button></div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
               <Link href="/login" className="px-5 py-2.5 rounded-full font-bold text-slate-600 hover:bg-slate-100 text-sm transition-colors">Log In</Link>
               <Link href="/signup" className="px-5 py-2.5 rounded-full font-bold bg-slate-900 text-white hover:bg-slate-800 text-sm shadow-lg shadow-slate-900/20 transition-all hover:scale-105 active:scale-95">Sign Up</Link>
            </div>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <div className="md:hidden flex items-center justify-end flex-1 gap-2">
            <button onClick={() => setIsMobileOpen(true)} className="p-2 text-slate-600"><Search className="w-6 h-6" /></button>
             <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="w-10 h-10 flex items-center justify-center text-slate-800 bg-slate-100 rounded-full active:scale-90 transition-transform">
                {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileOpen && (
        <div className="fixed inset-0 top-[64px] z-[60] bg-slate-100 w-full h-[calc(100vh-64px)] overflow-y-auto animate-in slide-in-from-right duration-300">
          <div className="p-4 pb-20">
            <form onSubmit={handleSearch} className="relative mb-6 mt-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full bg-white border border-slate-200 pl-12 pr-4 py-4 rounded-2xl text-base font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
            </form>

            {user && (
                <Link href="/profile" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm mb-8 border border-slate-100 active:scale-95 transition-transform">
                    <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">{profile?.full_name?.[0] || user.email[0]}</div>
                    <div className="flex-1"><p className="font-bold text-slate-900 text-lg">{profile?.full_name || "My Profile"}</p><p className="text-sm text-slate-500 font-medium">View your profile</p></div>
                </Link>
            )}

            <h3 className="text-slate-400 font-bold mb-4 px-1 text-xs uppercase tracking-widest">Quick Access</h3>
            <div className="grid grid-cols-2 gap-3 mb-8">
                {mobileShortcuts.map((item) => (
                    <Link key={item.name} href={item.href} onClick={() => setIsMobileOpen(false)} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start gap-4 active:scale-95 transition-all hover:shadow-md hover:border-blue-100 group">
                        <item.icon className={`w-8 h-8 ${item.color} group-hover:scale-110 transition-transform`} />
                        <span className="font-bold text-slate-800">{item.name}</span>
                    </Link>
                ))}
            </div>

            <div className="mt-auto space-y-2 border-t border-slate-200 pt-6">
                 {user ? (
                     <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 bg-red-50 rounded-2xl">
                        <span className="font-bold text-red-600 flex items-center gap-3"><LogOut className="w-6 h-6" /> Log Out</span>
                    </button>
                 ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/login" onClick={() => setIsMobileOpen(false)} className="py-4 text-center bg-white border border-slate-200 rounded-xl font-bold text-slate-700 shadow-sm">Log In</Link>
                        <Link href="/signup" onClick={() => setIsMobileOpen(false)} className="py-4 text-center bg-slate-900 text-white rounded-xl font-bold shadow-lg">Sign Up</Link>
                    </div>
                 )}
            </div>
          </div>
        </div>
      )}
    </header>
    </>
  );
}

function ActivityIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
}