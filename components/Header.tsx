"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useTheme } from "@/components/shared/ThemeProvider";
import { 
  Search, Menu, X, Home, BookOpen, 
  GraduationCap, Bell, LogOut, LayoutDashboard, 
  ChevronDown, Settings, Layers, FileText, 
  Briefcase, Activity, MessageSquare, 
  User, Sparkles, ChevronRight, Users, 
  Newspaper, HelpCircle, Info, Phone, BadgeCheck, LogIn,
  Moon, Sun, ArrowRight
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  // Hide on admin routes
  if (pathname?.startsWith('/admin')) return null;

  // --- STATE ---
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  
  // Notifications
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  // Dropdowns
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showResourcesMenu, setShowResourcesMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  // Mobile Accordions
  const [mobileExpandResources, setMobileExpandResources] = useState(false);
  const [mobileExpandMore, setMobileExpandMore] = useState(false);

  // Refs for click outside
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // --- DATA FETCHING ---
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

  const fetchNotifications = async () => {
    const { data } = await supabase.from('feedbacks').select('*').order('created_at', { ascending: false });
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => n.status === 'new').length);
    }
  };

  // --- EFFECTS ---
  useEffect(() => {
    fetchUserData();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserData();
    });
    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setShowProfileMenu(false);
    setShowResourcesMenu(false);
    setShowMoreMenu(false);
    setShowNotifications(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setShowProfileMenu(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifications(false);
      if (resourcesRef.current && !resourcesRef.current.contains(event.target as Node)) setShowResourcesMenu(false);
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) setShowMoreMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  // --- ACTIONS ---
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

  const getDashboardLink = () => {
    if (profile?.role === 'admin') return '/admin';
    if (profile?.role === 'tutor') return '/tutor/dashboard';
    if (profile?.role === 'institution') return '/institution/dashboard';
    return '/student/dashboard'; 
  };

  // --- CONFIG ---
  const resourceLinks = [
    { name: "SSC Preparation", href: "/resources/ssc", icon: BookOpen, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", desc: "Class 9-10 study material" },
    { name: "HSC Preparation", href: "/resources/hsc", icon: Layers, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20", desc: "Class 11-12 resources" },
    { name: "University Admission", href: "/resources/university-admission", icon: GraduationCap, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20", desc: "Admission question banks" },
    { name: "Medical Admission", href: "/resources/university-admission/science/medical-admission", icon: Activity, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20", desc: "MBBS preparation" },
    { name: "MBA / IBA", href: "/resources/master's-admission/mba/iba", icon: Sparkles, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20", desc: "Business admission" },
    { name: "Job Preparation", href: "/resources/job-prep", icon: Briefcase, color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-50 dark:bg-slate-800", desc: "BCS & bank jobs" },
  ];

  const moreLinks = [
    { name: "Blog", href: "/blog", icon: FileText },
    { name: "Newsroom", href: "/news", icon: Newspaper },
    { name: "About Us", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Phone },
    { name: "Careers", href: "/careers", icon: Briefcase },
    { name: "Donate", href: "/donate", icon: Sparkles, highlight: true },
  ];

  // --- HELPER: NavLink with animated underline ---
  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link 
      href={href} 
      className={`relative px-3 py-2 text-sm font-semibold transition-colors duration-200 group ${
        pathname === href 
          ? (isDark ? "text-indigo-400" : "text-indigo-600") 
          : (isDark ? "text-slate-300 hover:text-indigo-400" : "text-slate-600 hover:text-indigo-600")
      }`}
    >
      {children}
      {/* Animated underline */}
      <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-indigo-500 rounded-full transition-all duration-300 ${pathname === href ? 'w-full' : 'w-0 group-hover:w-full'}`} />
    </Link>
  );

  return (
    <>
    {/* --- NOTIFICATION MODAL --- */}
    {selectedNotification && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 font-sans animate-scale-in">
            <div className={`rounded-2xl shadow-2xl max-w-lg w-full p-6 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className={`flex justify-between items-center mb-4 border-b pb-4 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>Notification</h3>
                    <button onClick={() => setSelectedNotification(null)} className={`p-1 rounded-full transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}><X className={`w-5 h-5 hover:text-red-500 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}/></button>
                </div>
                <div className={`text-sm mb-6 leading-relaxed whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{selectedNotification.message}</div>
                <button onClick={(e) => { markAsRead(e, selectedNotification.id); setSelectedNotification(null); }} className={`w-full py-2.5 text-white rounded-xl font-bold transition-all ${isDark ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-900 hover:bg-slate-800'}`}>Close</button>
            </div>
        </div>
    )}

    {/* --- MAIN HEADER --- */}
    <header 
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 font-sans ${
        isScrolled || isMobileOpen 
          ? (isDark 
              ? "bg-slate-900/85 backdrop-blur-xl border-b border-slate-800/60 shadow-lg shadow-slate-950/20" 
              : "bg-white/85 backdrop-blur-xl border-b border-slate-200/60 shadow-lg shadow-slate-200/20")
          : (isDark 
              ? "bg-slate-950 border-b border-transparent" 
              : "bg-white border-b border-transparent")
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        
        {/* LEFT: Logo & Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group select-none">
            <div className="relative w-9 h-9 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Image 
                    src="/icon.png" 
                    alt="NextPrepBD" 
                    fill
                    className="object-contain"
                />
            </div>
            <span className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                NextPrep<span className="text-indigo-600 dark:text-indigo-400">BD</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden lg:flex items-center gap-0.5">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/curriculum">Lesson Plans</NavLink>
            
            {/* Resources Mega Dropdown */}
            <div className="relative" ref={resourcesRef}>
              <button 
                onClick={() => setShowResourcesMenu(!showResourcesMenu)}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-semibold transition-colors group ${
                    showResourcesMenu || pathname?.includes('resources') 
                      ? (isDark ? "text-indigo-400" : "text-indigo-600") 
                      : (isDark ? "text-slate-300 hover:text-indigo-400" : "text-slate-600 hover:text-indigo-600")
                }`}
              >
                Exams & Resources 
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showResourcesMenu ? "rotate-180" : ""}`}/>
              </button>

              {showResourcesMenu && (
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[680px] rounded-2xl shadow-2xl border p-5 grid grid-cols-2 gap-2 animate-nav-slide-down z-50 ${isDark ? 'bg-slate-800 border-slate-700 shadow-slate-950/50' : 'bg-white border-slate-100 shadow-slate-200/50'}`}>
                  {/* Decorative gradient */}
                  <div className={`absolute top-0 left-0 w-full h-1 rounded-t-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500`}></div>
                  
                  {resourceLinks.map((link, i) => (
                    <Link 
                      key={link.name} 
                      href={link.href} 
                      onClick={() => setShowResourcesMenu(false)} 
                      className={`flex items-center gap-4 p-3.5 rounded-xl transition-all group/item border border-transparent ${isDark ? 'hover:bg-slate-700/50 hover:border-slate-600' : 'hover:bg-slate-50 hover:border-slate-100'}`}
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${link.bg} ${link.color} group-hover/item:scale-110 group-hover/item:shadow-lg transition-all duration-300`}>
                        <link.icon className="w-5 h-5"/>
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold transition-colors ${isDark ? 'text-slate-200 group-hover/item:text-indigo-400' : 'text-slate-800 group-hover/item:text-indigo-600'}`}>{link.name}</p>
                        <p className={`text-[11px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{link.desc}</p>
                      </div>
                      <ArrowRight className={`w-4 h-4 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <NavLink href="/courses">Courses</NavLink>
            <NavLink href="/ebooks">eBooks</NavLink>
            
            {/* More Dropdown */}
            <div className="relative" ref={moreRef}>
              <button 
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-semibold transition-colors ${
                    showMoreMenu 
                      ? (isDark ? "text-indigo-400" : "text-indigo-600") 
                      : (isDark ? "text-slate-300 hover:text-indigo-400" : "text-slate-600 hover:text-indigo-600")
                }`}
              >
                More <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showMoreMenu ? "rotate-180" : ""}`}/>
              </button>

              {showMoreMenu && (
                <div className={`absolute top-full right-0 mt-3 w-56 rounded-2xl shadow-2xl border p-2 animate-nav-slide-down z-50 ${isDark ? 'bg-slate-800 border-slate-700 shadow-slate-950/50' : 'bg-white border-slate-100 shadow-slate-200/50'}`}>
                  <div className={`absolute top-0 left-0 w-full h-0.5 rounded-t-2xl bg-gradient-to-r from-indigo-500 to-purple-500`}></div>
                  {moreLinks.map((link) => (
                    <Link key={link.name} href={link.href} onClick={() => setShowMoreMenu(false)} className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${link.highlight ? (isDark ? 'text-indigo-400 bg-indigo-900/20 hover:bg-indigo-900/30' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100') : (isDark ? 'text-slate-300 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50')}`}>
                      <link.icon className="w-4 h-4" /> {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* RIGHT: Actions */}
        <div className="hidden lg:flex items-center gap-2.5">
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full border transition-all duration-300 hover:scale-110 active:scale-95 ${isDark ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700 hover:border-yellow-500/30' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-indigo-600'}`}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative group">
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className={`pl-9 pr-4 py-2 rounded-full text-sm transition-all duration-300 outline-none ${
                      isDark 
                        ? `bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-500 ${searchFocused ? 'w-60 border-indigo-500 ring-4 ring-indigo-500/10' : 'w-40 hover:border-slate-600'}`
                        : `bg-slate-50 border border-transparent text-slate-700 placeholder:text-slate-400 ${searchFocused ? 'w-60 bg-white border-indigo-200 ring-4 ring-indigo-50/50' : 'w-40 hover:bg-white hover:border-slate-200'}`
                    }`}
                />
                <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${searchFocused ? 'text-indigo-500' : (isDark ? 'text-slate-500' : 'text-slate-400')}`} />
            </form>

            <div className={`h-6 w-px mx-1.5 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

            {user ? (
                <div className="flex items-center gap-2.5">
                    {/* Admin Notification */}
                    {profile?.role === 'admin' && (
                        <div className="relative" ref={notifRef}>
                            <button onClick={handleNotificationClick} className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all active:scale-95 relative hover:scale-110 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100 hover:border-slate-200'}`}>
                                <Bell className="w-4 h-4" />
                                {unreadCount > 0 && <span className={`absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 animate-pulse ${isDark ? 'border-slate-900' : 'border-white'}`}></span>}
                            </button>
                            {showNotifications && (
                                <div className={`absolute top-full right-0 mt-3 w-80 rounded-2xl shadow-2xl border py-2 overflow-hidden z-50 animate-nav-slide-down ${isDark ? 'bg-slate-800 border-slate-700 shadow-slate-950/50' : 'bg-white border-slate-100 shadow-slate-200/50'}`}>
                                    <div className={`px-4 py-2 border-b flex justify-between items-center ${isDark ? 'border-slate-700 bg-slate-900/30' : 'border-slate-50 bg-slate-50/50'}`}>
                                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Notifications</span>
                                        {unreadCount > 0 && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>{unreadCount} New</span>}
                                    </div>
                                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                        {notifications.length > 0 ? notifications.slice(0,5).map(n => (
                                            <div key={n.id} className={`p-3 border-b text-sm cursor-pointer transition-colors ${isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-50 hover:bg-slate-50'} ${n.status === 'new' ? (isDark ? 'bg-indigo-900/10' : 'bg-indigo-50/40') : ''}`} onClick={() => setSelectedNotification(n)}>
                                                <div className="flex gap-3">
                                                    <div className={`w-1.5 h-1.5 mt-2 rounded-full shrink-0 ${n.status === 'new' ? 'bg-indigo-500' : (isDark ? 'bg-slate-600' : 'bg-slate-300')}`}></div>
                                                    <div>
                                                        <p className={`font-bold text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{n.full_name}</p>
                                                        <p className={`text-xs truncate w-56 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{n.message}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : <div className={`p-6 text-center text-xs italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No new notifications</div>}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Profile Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 group">
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-transparent group-hover:ring-indigo-200 dark:group-hover:ring-indigo-800 transition-all duration-300 group-hover:scale-110 group-hover:shadow-indigo-200/50 dark:group-hover:shadow-indigo-900/50`}>
                                {profile?.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                            </div>
                        </button>
                        
                        {showProfileMenu && (
                            <div className={`absolute top-full right-0 mt-3 w-60 rounded-2xl shadow-2xl border p-2 animate-nav-slide-down z-50 ${isDark ? 'bg-slate-800 border-slate-700 shadow-slate-950/50' : 'bg-white border-slate-100 shadow-slate-200/50'}`}>
                                <div className={`px-3 py-3 rounded-xl mb-2 flex items-center gap-3 ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm border ${isDark ? 'bg-slate-800 text-indigo-400 border-slate-700' : 'bg-white text-indigo-600 border-slate-100'}`}>
                                        {profile?.full_name?.[0]}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile?.full_name}</p>
                                        <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-0.5">
                                    <Link href={getDashboardLink()} className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${isDark ? 'text-slate-300 hover:text-indigo-400 hover:bg-slate-700' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                                    </Link>
                                    <Link href="/profile" className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${isDark ? 'text-slate-300 hover:text-indigo-400 hover:bg-slate-700' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                                        <Settings className="w-4 h-4" /> Settings
                                    </Link>
                                    {profile?.role !== 'admin' && (
                                        <Link href="/feedback" className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${isDark ? 'text-slate-300 hover:text-indigo-400 hover:bg-slate-700' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                                            <MessageSquare className="w-4 h-4" /> Feedback
                                        </Link>
                                    )}
                                </div>
                                <div className={`h-px my-1.5 mx-2 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}></div>
                                <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold rounded-xl transition-colors ${isDark ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`}>
                                    <LogOut className="w-4 h-4" /> Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2.5">
                    <Link href="/login" className={`px-4 py-2 text-sm font-bold transition-all hover:scale-105 ${isDark ? 'text-slate-300 hover:text-indigo-400' : 'text-slate-600 hover:text-indigo-600'}`}>Log In</Link>
                    <Link href="/signup" className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full text-sm font-bold shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/50 transition-all hover:scale-105 hover:shadow-xl active:scale-95">
                      Get Started
                    </Link>
                </div>
            )}
        </div>

        {/* MOBILE: Right actions */}
        <div className="flex lg:hidden items-center gap-2">
            {/* Mobile dark mode toggle */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all ${isDark ? 'text-yellow-400' : 'text-slate-500'}`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user && (
                <Link href="/profile" className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${isDark ? 'bg-indigo-900/30 text-indigo-400 border-indigo-800' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                    {profile?.full_name?.[0] || "U"}
                </Link>
            )}
            <button onClick={() => setIsMobileOpen(true)} className={`p-2 rounded-xl transition-all active:scale-90 ${isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}>
                <Menu className="w-6 h-6" />
            </button>
        </div>

      </div>
    </header>

    {/* --- MOBILE OVERLAY --- */}
    <div 
        className={`fixed inset-0 z-[120] transition-all duration-300 lg:hidden ${isMobileOpen ? "bg-slate-900/40 backdrop-blur-sm opacity-100" : "opacity-0 pointer-events-none"}`} 
        onClick={() => setIsMobileOpen(false)}
    />
    
    {/* --- MOBILE SIDEBAR --- */}
    <div className={`fixed top-0 right-0 h-full w-[85%] max-w-[340px] z-[130] transform transition-all duration-400 ease-out lg:hidden flex flex-col shadow-2xl border-l ${isDark ? 'bg-slate-900 border-slate-800 shadow-slate-950/80' : 'bg-white border-slate-100 shadow-slate-200/50'} ${isMobileOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        {/* Sidebar Header */}
        <div className={`p-5 flex justify-between items-center border-b ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
            <span className={`font-black text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Image src="/icon.png" alt="Logo" width={28} height={28} className="object-contain" /> 
                NextPrep<span className="text-indigo-600 dark:text-indigo-400">BD</span>
            </span>
            <button onClick={() => setIsMobileOpen(false)} className={`p-2 rounded-xl transition-colors ${isDark ? 'bg-slate-800 text-slate-400 hover:text-red-400' : 'bg-slate-50 text-slate-500 hover:text-red-500 hover:bg-red-50'}`}>
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
            
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
                <input type="text" placeholder="Search resources..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none transition-all border ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500'}`} />
                <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}/>
            </form>

            {/* Menu */}
            <div className="space-y-1">
                <p className={`text-[10px] font-bold uppercase tracking-widest px-2 mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Navigation</p>
                
                <Link href="/" onClick={() => setIsMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all active:scale-[0.98] ${pathname === "/" ? (isDark ? 'bg-indigo-900/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : (isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50')}`}>
                    <Home className="w-5 h-5"/> Home
                </Link>

                <Link href="/curriculum" onClick={() => setIsMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all active:scale-[0.98] ${pathname?.startsWith("/curriculum") ? (isDark ? 'bg-indigo-900/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600') : (isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50')}`}>
                    <BookOpen className="w-5 h-5"/> Lesson Plans
                </Link>
                
                {user && (
                    <Link href={getDashboardLink()} onClick={() => setIsMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all active:scale-[0.98] ${isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}>
                        <LayoutDashboard className="w-5 h-5"/> Dashboard
                    </Link>
                )}

                {/* Mobile Accordion: Resources */}
                <div className={`rounded-xl overflow-hidden mt-2 border ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <button onClick={() => setMobileExpandResources(!mobileExpandResources)} className={`w-full flex items-center justify-between px-4 py-3.5 font-bold ${isDark ? 'bg-slate-800/50 text-slate-200' : 'bg-slate-50/50 text-slate-700'}`}>
                        <span className="flex items-center gap-3"><Layers className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`}/> Exams & Resources</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileExpandResources ? 'rotate-180 text-indigo-500' : (isDark ? 'text-slate-500' : 'text-slate-400')}`} />
                    </button>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isDark ? 'bg-slate-900/50' : 'bg-white'} ${mobileExpandResources ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
                        <div className="p-2 space-y-0.5">
                            {resourceLinks.map((link) => (
                                <Link key={link.name} href={link.href} onClick={() => setIsMobileOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all active:scale-[0.98] ml-1 ${isDark ? 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${link.color.replace('text-', 'bg-').split(' ')[0]}`}></div>
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mobile Accordion: More */}
                <div className={`rounded-xl overflow-hidden mt-2 border ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <button onClick={() => setMobileExpandMore(!mobileExpandMore)} className={`w-full flex items-center justify-between px-4 py-3.5 font-bold ${isDark ? 'bg-slate-800/50 text-slate-200' : 'bg-slate-50/50 text-slate-700'}`}>
                        <span className="flex items-center gap-3"><HelpCircle className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`}/> More Pages</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileExpandMore ? 'rotate-180 text-indigo-500' : (isDark ? 'text-slate-500' : 'text-slate-400')}`} />
                    </button>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isDark ? 'bg-slate-900/50' : 'bg-white'} ${mobileExpandMore ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
                        <div className="p-2 space-y-0.5">
                            {moreLinks.map((link) => (
                                <Link key={link.name} href={link.href} onClick={() => setIsMobileOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all active:scale-[0.98] ml-1 ${link.highlight ? (isDark ? 'text-indigo-400 bg-indigo-900/20' : 'text-indigo-600 bg-indigo-50') : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50')}`}>
                                    <link.icon className="w-4 h-4"/> {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Mobile Footer */}
        <div className={`p-5 border-t ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/30'}`}>
            {user ? (
                <button onClick={handleLogout} className={`w-full flex items-center justify-center gap-2 py-3.5 font-bold rounded-xl transition-all active:scale-95 ${isDark ? 'bg-slate-800 border border-slate-700 text-red-400 hover:bg-red-900/20' : 'bg-white border border-slate-200 text-red-500 shadow-sm hover:bg-red-50'}`}>
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    <Link href="/login" onClick={() => setIsMobileOpen(false)} className={`py-3.5 text-center font-bold rounded-xl border transition-all active:scale-95 ${isDark ? 'text-slate-300 bg-slate-800 border-slate-700' : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'}`}>Log In</Link>
                    <Link href="/signup" onClick={() => setIsMobileOpen(false)} className="py-3.5 text-center font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-md transition-all active:scale-95">Sign Up</Link>
                </div>
            )}
        </div>
    </div>
    </>
  );
}