"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  Search, Menu, X, Home, BookOpen, 
  GraduationCap, Bell, LogOut, LayoutDashboard, 
  ChevronDown, Settings, Layers, FileText, 
  Briefcase, Activity, MessageSquare, 
  User, Sparkles, ChevronRight, Users, 
  Newspaper, HelpCircle, Info, Phone, BadgeCheck, LogIn
} from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide on admin routes
  if (pathname?.startsWith('/admin')) return null;

  // --- STATE ---
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
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
    // Reset menus on navigation
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
    { name: "SSC Preparation", href: "/resources/ssc", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "HSC Preparation", href: "/resources/hsc", icon: Layers, color: "text-purple-600", bg: "bg-purple-50" },
    { name: "University Admission", href: "/resources/university-admission", icon: GraduationCap, color: "text-green-600", bg: "bg-green-50" },
    { name: "Medical Admission", href: "/resources/university-admission/science/medical-admission", icon: Activity, color: "text-red-600", bg: "bg-red-50" },
    { name: "MBA / IBA", href: "/resources/master's-admission/mba/iba", icon: Sparkles, color: "text-orange-600", bg: "bg-orange-50" },
    { name: "Job Preparation", href: "/resources/job-prep", icon: Briefcase, color: "text-slate-600", bg: "bg-slate-50" },
  ];

  const moreLinks = [
    { name: "Blog", href: "/blog", icon: FileText },
    { name: "Newsroom", href: "/news", icon: Newspaper },
    { name: "About Us", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Phone },
    { name: "Careers", href: "/careers", icon: Briefcase },
    { name: "Join as Teacher", href: "/join-as-teacher", icon: BadgeCheck, highlight: true },
  ];

  // --- HELPER COMPONENT: Nav Item ---
  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link 
      href={href} 
      className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
        pathname === href ? "text-indigo-600" : "text-slate-600 hover:text-indigo-600"
      }`}
    >
      {children}
      {pathname === href && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full animate-in fade-in zoom-in" />
      )}
    </Link>
  );

  return (
    <>
    {/* --- NOTIFICATION MODAL (Global) --- */}
    {selectedNotification && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 font-sans">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 border border-slate-100">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                    <h3 className="font-bold text-lg text-slate-800">Notification</h3>
                    <button onClick={() => setSelectedNotification(null)} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400 hover:text-red-500"/></button>
                </div>
                <div className="text-sm text-slate-600 mb-6 leading-relaxed whitespace-pre-wrap">{selectedNotification.message}</div>
                <button onClick={(e) => { markAsRead(e, selectedNotification.id); setSelectedNotification(null); }} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all">Close</button>
            </div>
        </div>
    )}

    {/* --- MAIN HEADER --- */}
    <header 
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 font-sans ${
        isScrolled || isMobileOpen 
          ? "bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm" 
          : "bg-white border-b border-transparent"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        
        {/* LEFT: Logo & Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group select-none">
            {/* LOGO FIX: Removed shadows/borders for cleaner look */}
            <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-105">
                <Image 
                    src="/icon.png" 
                    alt="NextPrepBD" 
                    fill
                    className="object-contain"
                />
            </div>
            <div className="flex flex-col -gap-1">
                <span className="text-xl font-black tracking-tight text-slate-900">
                    NextPrep<span className="text-indigo-600">BD</span>
                </span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION (Visible lg+) */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavLink href="/">Home</NavLink>
            
            {/* Resources Dropdown */}
            <div className="relative" ref={resourcesRef}>
              <button 
                onClick={() => setShowResourcesMenu(!showResourcesMenu)}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors ${
                    showResourcesMenu || pathname.includes('resources') ? "text-indigo-600" : "text-slate-600 hover:text-indigo-600"
                }`}
              >
                Exams & Resources 
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showResourcesMenu ? "rotate-180" : ""}`}/>
              </button>

              {/* Mega Menu */}
              {showResourcesMenu && (
                <div className="absolute top-full left-0 mt-2 w-[650px] bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-4 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 z-50">
                  {resourceLinks.map((link) => (
                    <Link key={link.name} href={link.href} onClick={() => setShowResourcesMenu(false)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${link.bg} ${link.color} group-hover:scale-110 transition-transform`}>
                        <link.icon className="w-5 h-5"/>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{link.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium">Study materials & questions</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
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
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors ${
                    showMoreMenu ? "text-indigo-600" : "text-slate-600 hover:text-indigo-600"
                }`}
              >
                More <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showMoreMenu ? "rotate-180" : ""}`}/>
              </button>

              {showMoreMenu && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 z-50">
                  {moreLinks.map((link) => (
                    <Link key={link.name} href={link.href} onClick={() => setShowMoreMenu(false)} className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${link.highlight ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}>
                      <link.icon className="w-4 h-4" /> {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* RIGHT: Actions */}
        <div className="hidden lg:flex items-center gap-3">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative group">
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-indigo-200 rounded-full text-sm text-slate-700 w-40 focus:w-60 transition-all outline-none focus:ring-4 focus:ring-indigo-50/50 placeholder:text-slate-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
            </form>

            <div className="h-6 w-px bg-slate-200 mx-2"></div>

            {user ? (
                <div className="flex items-center gap-3">
                    {/* Admin Notification */}
                    {profile?.role === 'admin' && (
                        <div className="relative" ref={notifRef}>
                            <button onClick={handleNotificationClick} className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-200 flex items-center justify-center text-slate-600 transition-all active:scale-95 relative">
                                <Bell className="w-4 h-4" />
                                {unreadCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
                            </button>
                            {showNotifications && (
                                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                    <div className="px-4 py-2 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notifications</span>
                                        {unreadCount > 0 && <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                                    </div>
                                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                        {notifications.length > 0 ? notifications.slice(0,5).map(n => (
                                            <div key={n.id} className={`p-3 border-b border-slate-50 text-sm hover:bg-slate-50 cursor-pointer transition-colors ${n.status === 'new' ? 'bg-indigo-50/40' : ''}`} onClick={() => setSelectedNotification(n)}>
                                                <div className="flex gap-3">
                                                    <div className="w-1.5 h-1.5 mt-2 rounded-full bg-indigo-500 shrink-0"></div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-xs">{n.full_name}</p>
                                                        <p className="text-slate-500 text-xs truncate w-56">{n.message}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : <div className="p-6 text-center text-xs text-slate-400 italic">No new notifications</div>}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Profile Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 group">
                            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-transparent group-hover:ring-indigo-100 transition-all">
                                {profile?.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                            </div>
                        </button>
                        
                        {showProfileMenu && (
                            <div className="absolute top-full right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 z-50">
                                <div className="px-3 py-3 bg-slate-50 rounded-xl mb-2 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold text-xs shadow-sm border border-slate-100">
                                        {profile?.full_name?.[0]}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold text-slate-900 truncate">{profile?.full_name}</p>
                                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Link href={getDashboardLink()} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                                    </Link>
                                    <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                        <Settings className="w-4 h-4" /> Settings
                                    </Link>
                                    {profile?.role !== 'admin' && (
                                        <Link href="/feedback" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                            <MessageSquare className="w-4 h-4" /> Feedback
                                        </Link>
                                    )}
                                </div>
                                <div className="h-px bg-slate-100 my-2"></div>
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <LogOut className="w-4 h-4" /> Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    <Link href="/login" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Log In</Link>
                    <Link href="/signup" className="px-5 py-2 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-indigo-600 shadow-md shadow-slate-200 transition-all hover:scale-105 active:scale-95">Get Started</Link>
                </div>
            )}
        </div>

        {/* MOBILE MENU TOGGLE (Visible < lg) */}
        <div className="flex lg:hidden items-center gap-3">
            {user && (
                <Link href="/profile" className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-xs">
                    {profile?.full_name?.[0] || "U"}
                </Link>
            )}
            <button onClick={() => setIsMobileOpen(true)} className="p-2 text-slate-700 rounded-full hover:bg-slate-100 transition-colors">
                <Menu className="w-6 h-6" />
            </button>
        </div>

      </div>
    </header>

    {/* --- MOBILE SIDEBAR --- */}
    <div 
        className={`fixed inset-0 z-[120] bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 lg:hidden font-sans ${isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} 
        onClick={() => setIsMobileOpen(false)}
    />
    
    <div className={`fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-white shadow-2xl z-[130] transform transition-transform duration-300 ease-out lg:hidden flex flex-col font-sans border-l border-slate-100 ${isMobileOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        {/* Sidebar Header */}
        <div className="p-5 flex justify-between items-center border-b border-slate-50">
            <span className="font-black text-lg text-slate-900 flex items-center gap-2">
                <Image src="/icon.png" alt="Logo" width={28} height={28} className="object-contain" /> 
                NextPrep<span className="text-indigo-600">BD</span>
            </span>
            <button onClick={() => setIsMobileOpen(false)} className="p-2 bg-slate-50 rounded-full text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
                <input type="text" placeholder="Search resources..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400" />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"/>
            </form>

            {/* Menu */}
            <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Navigation</p>
                
                <Link href="/" onClick={() => setIsMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${pathname === "/" ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"}`}>
                    <Home className="w-5 h-5"/> Home
                </Link>
                
                {user && (
                    <Link href={getDashboardLink()} onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
                        <LayoutDashboard className="w-5 h-5"/> Dashboard
                    </Link>
                )}

                {/* Mobile Accordion: Resources */}
                <div className="border border-slate-100 rounded-xl overflow-hidden mt-2">
                    <button onClick={() => setMobileExpandResources(!mobileExpandResources)} className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 font-bold text-slate-700">
                        <span className="flex items-center gap-3"><Layers className="w-5 h-5 text-indigo-500"/> Exams & Resources</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileExpandResources ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`} />
                    </button>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden bg-white ${mobileExpandResources ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
                        <div className="p-2 space-y-1">
                            {resourceLinks.map((link) => (
                                <Link key={link.name} href={link.href} onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors ml-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${link.color.replace('text-', 'bg-')}`}></div>
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mobile Accordion: More */}
                <div className="border border-slate-100 rounded-xl overflow-hidden mt-2">
                    <button onClick={() => setMobileExpandMore(!mobileExpandMore)} className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 font-bold text-slate-700">
                        <span className="flex items-center gap-3"><HelpCircle className="w-5 h-5 text-indigo-500"/> More Pages</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileExpandMore ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`} />
                    </button>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden bg-white ${mobileExpandMore ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
                        <div className="p-2 space-y-1">
                            {moreLinks.map((link) => (
                                <Link key={link.name} href={link.href} onClick={() => setIsMobileOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ml-2 ${link.highlight ? "text-indigo-600 bg-indigo-50" : "text-slate-500 hover:bg-slate-50"}`}>
                                    <link.icon className="w-4 h-4"/> {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Mobile Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/30">
            {user ? (
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-red-500 font-bold rounded-xl shadow-sm hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    <Link href="/login" onClick={() => setIsMobileOpen(false)} className="py-3 text-center font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Log In</Link>
                    <Link href="/signup" onClick={() => setIsMobileOpen(false)} className="py-3 text-center font-bold text-white bg-slate-900 rounded-xl shadow-md">Sign Up</Link>
                </div>
            )}
        </div>
    </div>
    </>
  );
}