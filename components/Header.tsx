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
  Library, Trash2, Check, User
} from "lucide-react";

export default function Header() {
  // --- STATE ---
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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
  const [showExamsMenu, setShowExamsMenu] = useState(false); // Toggle for Exams
  
  const pathname = usePathname();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const examsRef = useRef<HTMLDivElement>(null);

  // --- 1. DATA FETCHING ---
  const fetchUserData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { 
        setUser(null); 
        setProfile(null); 
        return; 
    }
    setUser(session.user);
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (data) {
      setProfile(data);
      if (data.role === 'admin') fetchNotifications();
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserData();
    });
    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  // Scroll Listener for Glass Effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation Reset
  useEffect(() => {
    fetchUserData(); 
    setIsMobileOpen(false);
    setShowProfileMenu(false);
    setShowExamsMenu(false);
    setShowNotifications(false);
  }, [pathname, fetchUserData]);

  // Click Outside Listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setShowProfileMenu(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifications(false);
      if (examsRef.current && !examsRef.current.contains(event.target as Node)) setShowExamsMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- 2. NOTIFICATIONS (Keep logic same) ---
  const fetchNotifications = async () => {
    const { data } = await supabase.from('feedbacks').select('*').order('created_at', { ascending: false });
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => n.status === 'new').length);
    }
  };

  const handleNotificationClick = () => {
    if (!showNotifications) fetchNotifications();
    setShowNotifications(!showNotifications);
  };

  const markAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const currentNotif = notifications.find(n => n.id === id);
    if (currentNotif && currentNotif.status === 'new') setUnreadCount(prev => Math.max(0, prev - 1));
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
    await supabase.from('feedbacks').update({ status: 'read' }).eq('id', id);
  };

  const deleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(!confirm("Delete?")) return;
    const currentNotif = notifications.find(n => n.id === id);
    if (currentNotif && currentNotif.status === 'new') setUnreadCount(prev => Math.max(0, prev - 1));
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

  const examLinks = [
    { name: "SSC Prep", href: "/resources/ssc", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "HSC Prep", href: "/resources/hsc", icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
    { name: "Admission", href: "/resources/university-admission", icon: GraduationCap, color: "text-green-600", bg: "bg-green-50" },
    { name: "Medical", href: "/resources/university-admission/science/medical-admission", icon: ActivityIcon, color: "text-red-600", bg: "bg-red-50" },
    { name: "MBA / IBA", href: "/resources/master's-admission/mba/iba", icon: Briefcase, color: "text-orange-600", bg: "bg-orange-50" },
    { name: "Job Prep", href: "/resources/job-prep", icon: Briefcase, color: "text-slate-600", bg: "bg-slate-50" },
  ];

  return (
    <>
    {/* --- NOTIFICATION MODAL --- */}
    {selectedNotification && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                    <h3 className="font-bold text-lg">Notification</h3>
                    <button onClick={() => setSelectedNotification(null)}><X className="w-5 h-5 text-slate-400"/></button>
                </div>
                <div className="text-sm text-slate-600 mb-6">{selectedNotification.message}</div>
                <button onClick={(e) => { markAsRead(e, selectedNotification.id); setSelectedNotification(null); }} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold">Close</button>
            </div>
        </div>
    )}

    {/* --- MAIN HEADER --- */}
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
        isScrolled || isMobileOpen ? "bg-white/95 backdrop-blur-xl border-slate-200 shadow-sm py-2" : "bg-white border-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between h-14">
        
        {/* LEFT: LOGO & NAV */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">N</div>
            <span className={`text-xl font-bold tracking-tight ${isScrolled ? "text-slate-900" : "text-slate-800"}`}>NextPrep</span>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/" className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${pathname === "/" ? "bg-slate-100 text-indigo-600" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
              Home
            </Link>
            <Link href="/courses" className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${pathname === "/courses" ? "bg-slate-100 text-indigo-600" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
              Courses
            </Link>
            
            {/* EXAMS MEGA MENU (CLICK TOGGLE) */}
            <div className="relative" ref={examsRef}>
              <button 
                onClick={() => setShowExamsMenu(!showExamsMenu)}
                className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold transition-all ${showExamsMenu ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
              >
                Exams <ChevronDown className={`w-4 h-4 transition-transform ${showExamsMenu ? "rotate-180" : ""}`}/>
              </button>

              {/* DROPDOWN CARD */}
              {showExamsMenu && (
                <div className="absolute top-12 left-0 w-[600px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 z-50">
                  {examLinks.map((link) => (
                    <Link key={link.name} href={link.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${link.bg} ${link.color}`}>
                        <link.icon className="w-5 h-5"/>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{link.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">View resources & questions</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/ebooks" className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${pathname === "/ebooks" ? "bg-slate-100 text-indigo-600" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
              eBooks
            </Link>
          </nav>
        </div>

        {/* RIGHT: ACTIONS */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative group">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm font-medium text-slate-700 w-48 focus:w-64 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              {/* Notifications */}
              {profile?.role === 'admin' && (
                <div className="relative" ref={notifRef}>
                  <button onClick={handleNotificationClick} className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 relative transition-colors">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>}
                  </button>
                  {/* Notification Dropdown (Simplified for brevity, use same logic as before) */}
                  {showNotifications && (
                     <div className="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 overflow-hidden z-50">
                        {notifications.length > 0 ? (
                            notifications.slice(0,5).map(n => (
                                <div key={n.id} className="p-3 border-b border-slate-50 text-xs hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedNotification(n)}>
                                    <p className="font-bold text-slate-800">{n.full_name}</p>
                                    <p className="text-slate-500 truncate">{n.message}</p>
                                </div>
                            ))
                        ) : <div className="p-4 text-center text-xs text-slate-400">No notifications</div>}
                     </div>
                  )}
                </div>
              )}

              {/* Profile Menu */}
              <div className="relative" ref={profileRef}>
                <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 group">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white group-hover:ring-indigo-100 transition-all">
                    {profile?.full_name?.[0] || user.email[0]}
                  </div>
                </button>
                
                {showProfileMenu && (
                  <div className="absolute top-12 right-0 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-50 mb-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{profile?.full_name}</p>
                      <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
                    </div>
                    <Link href={getDashboardLink()} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1">
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <Link href="/login" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Log In</Link>
              <Link href="/signup" className="px-5 py-2 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 shadow-md hover:shadow-lg transition-all">Get Started</Link>
            </div>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <div className="flex lg:hidden items-center gap-4">
           {user && (
             <Link href="/profile" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
                {profile?.full_name?.[0] || "U"}
             </Link>
           )}
           <button onClick={() => setIsMobileOpen(true)} className="p-2 text-slate-700">
             <Menu className="w-6 h-6" />
           </button>
        </div>

      </div>
    </header>

    {/* --- MOBILE SLIDE-OVER MENU --- */}
    {/* Overlay */}
    <div 
        className={`fixed inset-0 z-[60] bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} 
        onClick={() => setIsMobileOpen(false)}
    />
    
    {/* Sidebar Content */}
    <div className={`fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-out lg:hidden ${isMobileOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col h-full">
            
            {/* Mobile Header */}
            <div className="p-5 flex justify-between items-center border-b border-slate-100">
                <span className="font-bold text-lg text-slate-900">Menu</span>
                <button onClick={() => setIsMobileOpen(false)} className="p-2 bg-slate-50 rounded-full text-slate-500 hover:text-red-500 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Mobile Scroll Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-8">
                
                {/* 1. Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                    <input type="text" placeholder="What do you want to learn?" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm font-bold outline-none focus:border-indigo-500 transition-all" />
                    <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"/>
                </form>

                {/* 2. Main Navigation Links */}
                <div className="space-y-1">
                    <Link href="/" onClick={() => setIsMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${pathname === "/" ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"}`}>
                        <Home className="w-5 h-5"/> Home
                    </Link>
                    <Link href={getDashboardLink()} onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                        <LayoutDashboard className="w-5 h-5"/> Dashboard
                    </Link>
                    <Link href="/courses" onClick={() => setIsMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${pathname === "/courses" ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"}`}>
                        <BookOpen className="w-5 h-5"/> Courses
                    </Link>
                </div>

                {/* 3. Accordion Style Exams Menu */}
                <div className="border rounded-2xl border-slate-100 overflow-hidden">
                    <button onClick={() => setShowExamsMenu(!showExamsMenu)} className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 font-bold text-slate-700">
                        <span className="flex items-center gap-3"><Layers className="w-5 h-5 text-indigo-500"/> Exam Categories</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showExamsMenu ? 'rotate-180' : ''}`} />
                    </button>
                    {/* Collapsible Content */}
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showExamsMenu ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                        <div className="p-2 space-y-1">
                            {examLinks.map((link) => (
                                <Link key={link.name} href={link.href} onClick={() => setIsMobileOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors ml-4 border-l-2 border-slate-100 hover:border-indigo-300 pl-3">
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. Quick Tools */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Library</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/ebooks" onClick={() => setIsMobileOpen(false)} className="flex flex-col items-center justify-center gap-2 bg-slate-50 p-4 rounded-xl text-slate-600 font-bold text-xs hover:bg-red-50 hover:text-red-600 transition-colors">
                            <FileText className="w-6 h-6"/> eBooks
                        </Link>
                        {profile?.role === 'student' && (
                            <Link href={profile.current_goal || '/profile'} onClick={() => setIsMobileOpen(false)} className="flex flex-col items-center justify-center gap-2 bg-slate-50 p-4 rounded-xl text-slate-600 font-bold text-xs hover:bg-purple-50 hover:text-purple-600 transition-colors">
                                <Library className="w-6 h-6"/> Materials
                            </Link>
                        )}
                    </div>
                </div>

            </div>

            {/* Mobile Footer (Auth) */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                {user ? (
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-red-500 font-bold rounded-xl shadow-sm hover:bg-red-50 hover:border-red-100 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/login" onClick={() => setIsMobileOpen(false)} className="py-3 text-center font-bold text-slate-600 bg-white border border-slate-200 rounded-xl">Log In</Link>
                        <Link href="/signup" onClick={() => setIsMobileOpen(false)} className="py-3 text-center font-bold text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">Sign Up</Link>
                    </div>
                )}
            </div>
        </div>
    </div>
    </>
  );
}

function ActivityIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
}