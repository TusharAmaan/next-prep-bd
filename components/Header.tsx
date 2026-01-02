"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  Search, Menu, X, Home, BookOpen, 
  GraduationCap, Bell, MessageCircle, 
  LogOut, LayoutDashboard, ChevronDown, 
  Settings, Layers, FileText, Briefcase, 
  Library, Sparkles
} from "lucide-react";

export default function Header() {
  // --- STATE ---
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Dropdown States
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeDesktopDropdown, setActiveDesktopDropdown] = useState<string | null>(null);
  
  const pathname = usePathname();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // --- 1. AUTH & DATA FETCHING ---
  useEffect(() => {
    const fetchProfile = async (session: any) => {
      if (!session?.user) { setUser(null); setProfile(null); return; }
      setUser(session.user);
      
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (data) {
        setProfile(data);
        // If Admin, fetch notification count
        if (data.role === 'admin') fetchUnreadCount();
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => fetchProfile(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchProfile(session);
      setIsMobileOpen(false);
    });

    // Close menus on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDesktopDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      subscription.unsubscribe();
    };
  }, []);

  // --- 2. FIX: AUTO-CLOSE DROPDOWN ON NAVIGATION ---
  useEffect(() => {
    setActiveDesktopDropdown(null);
    setIsMobileOpen(false);
    setShowProfileMenu(false);
  }, [pathname]); // Runs whenever the URL changes

  const fetchUnreadCount = async () => {
    const { count } = await supabase
      .from('feedbacks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');
    setUnreadCount(count || 0);
  };

  // --- 3. ACTIONS ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsMobileOpen(false); // Close mobile menu if open
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  // --- CONFIGURATION ---
  
  const centerNav = [
    { name: "Home", icon: Home, href: "/", isDropdown: false },
    { name: "Courses", icon: BookOpen, href: "/courses", isDropdown: false },
    { name: "Exams", icon: Layers, href: "#", isDropdown: true }, // Triggers Mega Menu
    { name: "eBooks", icon: FileText, href: "/ebooks", isDropdown: false },
  ];

  const examLinks = [
    { name: "SSC", href: "/resources/ssc", icon: BookOpen, color: "bg-blue-100 text-blue-600" },
    { name: "HSC", href: "/resources/hsc", icon: BookOpen, color: "bg-purple-100 text-purple-600" },
    { name: "University Admission", href: "/resources/university-admission", icon: GraduationCap, color: "bg-green-100 text-green-600" },
    { name: "Medical Prep", href: "/resources/university-admission/science/medical-admission", icon: ActivityIcon, color: "bg-red-100 text-red-600" },
    { name: "IBA MBA", href: "/resources/masters-admission/mba/iba", icon: Briefcase, color: "bg-orange-100 text-orange-600" },
    { name: "Job Prep", href: "/resources/job-prep", icon: Briefcase, color: "bg-slate-100 text-slate-600" },
  ];

  const mobileShortcuts = [
    { name: "Home", href: "/", icon: Home, color: "text-blue-600" },
    { name: "Dashboard", href: profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard', icon: LayoutDashboard, color: "text-orange-600" },
    { name: "Courses", href: "/courses", icon: BookOpen, color: "text-green-600" },
    { name: "Materials", href: "/materials", icon: Library, color: "text-purple-600" },
    { name: "eBooks", href: "/ebooks", icon: FileText, color: "text-red-500" },
  ];

  if (profile?.role !== 'admin') {
    mobileShortcuts.push({ name: "Feedback", href: "/feedback", icon: MessageCircle, color: "text-teal-600" });
  }

  // --- STYLES ---
  // Improved Icon Style with better Hover/Active effects
  const getNavClass = (path: string, isDropdown: boolean) => {
    const isActive = pathname === path || (isDropdown && activeDesktopDropdown === "Exams");
    return `relative group flex items-center justify-center w-20 lg:w-28 h-12 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden
      ${isActive 
        ? "text-blue-600 bg-blue-50/50" 
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 hover:scale-105 active:scale-95"
      }`;
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm h-16 border-b border-white/20">
      <div className="flex items-center justify-between h-full px-4 max-w-[1920px] mx-auto">
        
        {/* --- LEFT: LOGO & SEARCH --- */}
        <div className="flex items-center gap-4 w-auto lg:w-[25%]">
          <Link href="/" className="flex-shrink-0 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 group-hover:rotate-3 transition-transform">
              N
            </div>
          </Link>
          
          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-slate-100/80 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 rounded-full px-4 py-2.5 w-64 transition-all">
            <Search className="w-4 h-4 text-slate-500 mr-2 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm placeholder:text-slate-400 text-slate-900 w-full"
            />
          </form>
        </div>

        {/* --- CENTER: MAIN NAV --- */}
        <nav className="hidden md:flex items-center justify-center flex-1 h-full relative gap-1" ref={navRef}>
          {centerNav.map((item) => (
            <div key={item.name}>
                {item.isDropdown ? (
                    <button 
                        onClick={() => setActiveDesktopDropdown(activeDesktopDropdown === item.name ? null : item.name)}
                        className={getNavClass(item.href, true)}
                    >
                        <item.icon className={`w-7 h-7 transition-all ${activeDesktopDropdown === item.name ? "fill-blue-200 stroke-blue-600" : "stroke-[1.5px]"}`} />
                        {activeDesktopDropdown === item.name && (
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-t-full"></span>
                        )}
                    </button>
                ) : (
                    <Link href={item.href} className={getNavClass(item.href, false)}>
                        <item.icon className={`w-7 h-7 transition-all ${pathname === item.href ? "fill-blue-200 stroke-blue-600" : "stroke-[1.5px]"}`} />
                        {pathname === item.href && (
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-t-full"></span>
                        )}
                    </Link>
                )}
            </div>
          ))}

          {/* EXAMS MEGA MENU */}
          {activeDesktopDropdown === "Exams" && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[650px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 p-6 animate-in fade-in slide-in-from-top-4 z-[60]">
                <div className="flex items-center gap-2 mb-4 px-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-slate-900 font-bold text-lg">Choose your goal</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {examLinks.map((sub) => (
                        <Link 
                            key={sub.name} 
                            href={sub.href} 
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${sub.color}`}>
                                <sub.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors">{sub.name}</p>
                                <p className="text-xs text-slate-500 font-medium">Click to explore resources</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
          )}
        </nav>

        {/* --- RIGHT: ACTIONS & PROFILE --- */}
        <div className="hidden md:flex items-center justify-end gap-3 w-[25%]">
          {user ? (
            <>
              {/* ADMIN NOTIFICATION (Only visible to admin) */}
              {profile?.role === 'admin' && (
                  <Link 
                    href="/admin/dashboard"
                    className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors relative group border border-slate-100"
                    title="Admin Notifications"
                  >
                    <Bell className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                  </Link>
              )}

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-slate-200 hover:bg-slate-50 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                     {profile?.full_name?.[0] || user.email[0]}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Menu Content */}
                {showProfileMenu && (
                  <div className="absolute top-12 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 animate-in fade-in zoom-in-95 duration-100 origin-top-right ring-1 ring-black/5">
                    <div className="px-3 py-3 mb-2 bg-slate-50 rounded-xl">
                        <p className="font-bold text-slate-900">{profile?.full_name || "User"}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{profile?.role || "Student"}</p>
                    </div>

                    <div className="space-y-1">
                        {profile?.role === 'admin' ? (
                            <Link href="/admin/dashboard" className="menu-item flex items-center gap-3 px-3 py-2 text-sm font-bold text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg">
                                <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                            </Link>
                        ) : (
                            <Link href="/dashboard" className="menu-item flex items-center gap-3 px-3 py-2 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                <LayoutDashboard className="w-4 h-4" /> Dashboard
                            </Link>
                        )}
                        
                        <Link href="/profile" className="menu-item flex items-center gap-3 px-3 py-2 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg">
                            <Settings className="w-4 h-4" /> Settings
                        </Link>
                    </div>

                    <div className="border-t border-slate-100 mt-2 pt-2">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors text-left">
                            <LogOut className="w-4 h-4" /> Log Out
                        </button>
                    </div>
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

        {/* --- MOBILE TOGGLE --- */}
        <div className="md:hidden flex items-center justify-end flex-1 gap-2">
            {/* Mobile Search Icon Trigger (Optional, opens menu) */}
            <button onClick={() => setIsMobileOpen(true)} className="p-2 text-slate-600">
                <Search className="w-6 h-6" />
            </button>
             <button 
                onClick={() => setIsMobileOpen(true)}
                className="w-10 h-10 flex items-center justify-center text-slate-800 bg-slate-100 rounded-full active:scale-90 transition-transform"
             >
                <Menu className="w-6 h-6" />
             </button>
        </div>

      </div>

      {/* --- MOBILE MENU OVERLAY --- */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-100 overflow-y-auto animate-in slide-in-from-right duration-300">
          <div className="p-4 min-h-screen flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Menu</h2>
              <button 
                onClick={() => setIsMobileOpen(false)} 
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform"
              >
                <X className="w-6 h-6 text-slate-900" />
              </button>
            </div>

            {/* Mobile Search - FIXED */}
            <form onSubmit={handleSearch} className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search courses, exams..." 
                    className="w-full bg-white border border-slate-200 pl-12 pr-4 py-4 rounded-2xl text-base font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
            </form>

            {/* User Profile Card */}
            {user && (
                <Link 
                    href="/profile" 
                    className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm mb-8 border border-slate-100 active:scale-95 transition-transform"
                >
                    <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                        {profile?.full_name?.[0] || user.email[0]}
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-slate-900 text-lg">{profile?.full_name || "My Profile"}</p>
                        <p className="text-sm text-slate-500 font-medium">View your profile</p>
                    </div>
                </Link>
            )}

            {/* Grid Shortcuts */}
            <h3 className="text-slate-400 font-bold mb-4 px-1 text-xs uppercase tracking-widest">Quick Access</h3>
            <div className="grid grid-cols-2 gap-3 mb-8">
                {mobileShortcuts.map((item) => (
                    <Link 
                        key={item.name} 
                        href={item.href}
                        className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start gap-4 active:scale-95 transition-all hover:shadow-md hover:border-blue-100 group"
                    >
                        <item.icon className={`w-8 h-8 ${item.color} group-hover:scale-110 transition-transform`} />
                        <span className="font-bold text-slate-800">{item.name}</span>
                    </Link>
                ))}
            </div>

            {/* Logout/Login */}
            <div className="mt-auto space-y-2 border-t border-slate-200 pt-6 pb-6">
                 {user ? (
                     <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 bg-red-50 rounded-2xl">
                        <span className="font-bold text-red-600 flex items-center gap-3">
                            <LogOut className="w-6 h-6" /> Log Out
                        </span>
                    </button>
                 ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/login" className="py-4 text-center bg-white border border-slate-200 rounded-xl font-bold text-slate-700 shadow-sm">
                            Log In
                        </Link>
                        <Link href="/signup" className="py-4 text-center bg-slate-900 text-white rounded-xl font-bold shadow-lg">
                            Sign Up
                        </Link>
                    </div>
                 )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// Icon Components
function ActivityIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
  )
}