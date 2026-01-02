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
  Library
} from "lucide-react";

export default function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  
  // Dropdown States
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeDesktopDropdown, setActiveDesktopDropdown] = useState<string | null>(null);
  
  const pathname = usePathname();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // --- AUTH & DATA ---
  useEffect(() => {
    const fetchProfile = async (session: any) => {
      if (!session?.user) { setUser(null); setProfile(null); return; }
      setUser(session.user);
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (data) setProfile(data);
    };

    supabase.auth.getSession().then(({ data: { session } }) => fetchProfile(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchProfile(session);
      setIsMobileOpen(false);
    });

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    setIsMobileOpen(false);
  };

  // --- CONFIGURATION ---
  
  // 1. Desktop Center Nav
  // logic: if 'isDropdown' is true, it triggers the mega menu
  const centerNav = [
    { name: "Home", icon: Home, href: "/", isDropdown: false },
    { name: "Courses", icon: BookOpen, href: "/courses", isDropdown: false },
    { name: "Exams", icon: Layers, href: "#", isDropdown: true }, // Triggers Mega Menu
    { name: "eBooks", icon: FileText, href: "/ebooks", isDropdown: false },
  ];

  // 2. Exam Dropdown Links
  const examLinks = [
    { name: "SSC", href: "/resources/ssc", icon: BookOpen, color: "bg-blue-100 text-blue-600" },
    { name: "HSC", href: "/resources/hsc", icon: BookOpen, color: "bg-purple-100 text-purple-600" },
    { name: "University Admission", href: "/resources/university-admission", icon: GraduationCap, color: "bg-green-100 text-green-600" },
    { name: "Medical Prep", href: "/resources/university-admission/science/medical-admission", icon: ActivityIcon, color: "bg-red-100 text-red-600" },
    { name: "IBA MBA", href: "/resources/masters-admission/mba/iba", icon: Briefcase, color: "bg-orange-100 text-orange-600" },
    { name: "Job Prep", href: "/resources/job-prep", icon: Briefcase, color: "bg-slate-100 text-slate-600" },
  ];

  // 3. Mobile Grid Shortcuts (Dynamic based on role)
  const mobileShortcuts = [
    { name: "Home", href: "/", icon: Home, color: "text-blue-600" },
    { name: "Dashboard", href: profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard', icon: LayoutDashboard, color: "text-orange-600" },
    { name: "Courses", href: "/courses", icon: BookOpen, color: "text-green-600" },
    { name: "Materials", href: "/materials", icon: Library, color: "text-purple-600" }, // Placeholder for user specific materials
    { name: "eBooks", href: "/ebooks", icon: FileText, color: "text-red-500" },
  ];

  // Only add Feedback if NOT admin
  if (profile?.role !== 'admin') {
    mobileShortcuts.push({ name: "Feedback", href: "/feedback", icon: MessageCircle, color: "text-teal-600" });
  }

  // Helper: Active State Class
  const getNavClass = (path: string, isDropdown: boolean) => {
    // Active if pathname matches OR if it's the Exams dropdown and currently open
    const isActive = pathname === path || (isDropdown && activeDesktopDropdown === "Exams");
    
    return `relative group flex items-center justify-center w-full md:w-24 lg:w-28 h-12 rounded-lg transition-all duration-200 cursor-pointer 
      ${isActive 
        ? "text-blue-600 after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-1 after:bg-blue-600" 
        : "text-slate-500 hover:bg-slate-100"
      }`;
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm h-16">
      <div className="flex items-center justify-between h-full px-4 max-w-[1920px] mx-auto">
        
        {/* --- LEFT: LOGO & SEARCH --- */}
        <div className="flex items-center gap-3 w-auto lg:w-[25%]">
          <Link href="/" className="flex-shrink-0" onClick={() => setIsMobileOpen(false)}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-black text-xl shadow-blue-200 shadow-lg">
              N
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center bg-slate-100 rounded-full px-3 py-2.5 w-64">
            <Search className="w-4 h-4 text-slate-500 mr-2" />
            <input 
              type="text" 
              placeholder="Search NextPrep..." 
              className="bg-transparent border-none outline-none text-sm placeholder:text-slate-500 text-slate-900 w-full"
            />
          </div>
        </div>

        {/* --- CENTER: MAIN NAV --- */}
        <nav className="hidden md:flex items-center justify-center flex-1 h-full relative" ref={navRef}>
          {centerNav.map((item) => (
            <div key={item.name} className="relative">
                {item.isDropdown ? (
                    // Dropdown Trigger
                    <button 
                        onClick={() => setActiveDesktopDropdown(activeDesktopDropdown === item.name ? null : item.name)}
                        className={getNavClass(item.href, true)}
                    >
                        <item.icon className={`w-7 h-7 ${activeDesktopDropdown === item.name ? "fill-current" : ""}`} />
                        <span className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none z-50">
                            {item.name}
                        </span>
                    </button>
                ) : (
                    // Regular Link
                    <Link href={item.href} className={getNavClass(item.href, false)}>
                        <item.icon className={`w-7 h-7 ${pathname === item.href ? "fill-current" : ""}`} />
                        <span className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none z-50">
                            {item.name}
                        </span>
                    </Link>
                )}
            </div>
          ))}

          {/* EXAMS MEGA MENU DROPDOWN */}
          {activeDesktopDropdown === "Exams" && (
            <div className="absolute top-14 left-1/2 -translate-x-1/2 w-[600px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 animate-in fade-in slide-in-from-top-2 z-[60]">
                <h3 className="text-slate-900 font-bold mb-4 px-2">Exam Categories</h3>
                <div className="grid grid-cols-2 gap-4">
                    {examLinks.map((sub) => (
                        <Link 
                            key={sub.name} 
                            href={sub.href} 
                            onClick={() => setActiveDesktopDropdown(null)}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sub.color}`}>
                                <sub.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{sub.name}</p>
                                <p className="text-xs text-slate-500">View resources</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
          )}
        </nav>

        {/* --- RIGHT: ACTIONS & PROFILE (Desktop Only) --- */}
        <div className="hidden md:flex items-center justify-end gap-2 w-[25%]">
          {user ? (
            <>
              {/* Notification Icon */}
              <button className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors relative flex-shrink-0">
                <Bell className="w-5 h-5 text-slate-900" />
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity ml-1 flex-shrink-0"
                >
                  <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center font-bold">
                     {profile?.full_name?.[0] || user.email[0]}
                  </div>
                </button>

                {/* Desktop Profile Menu Content */}
                {showProfileMenu && (
                  <div className="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                    <div className="p-2 mb-2 shadow-sm rounded-lg border border-slate-50 bg-slate-50/50">
                        <p className="font-bold text-lg">{profile?.full_name || "User"}</p>
                        <p className="text-slate-500 text-sm capitalize">{profile?.role || "Student"}</p>
                    </div>

                    {/* Admin specific link */}
                    {profile?.role === 'admin' ? (
                        <Link 
                            href="/admin/dashboard" 
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg transition-colors font-semibold text-slate-700"
                        >
                            <LayoutDashboard className="w-5 h-5 text-orange-600" /> Admin Dashboard
                        </Link>
                    ) : (
                        <Link 
                            href="/dashboard" 
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg transition-colors font-semibold text-slate-700"
                        >
                            <LayoutDashboard className="w-5 h-5" /> Dashboard
                        </Link>
                    )}
                    
                    <Link href="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg transition-colors font-semibold text-slate-700">
                        <Settings className="w-5 h-5" /> Settings & Privacy
                    </Link>
                    
                    {/* Only show Give Feedback if NOT admin */}
                    {profile?.role !== 'admin' && (
                        <Link href="/feedback" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg transition-colors font-semibold text-slate-700">
                            <MessageCircle className="w-5 h-5" /> Give Feedback
                        </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors font-semibold">
                            <LogOut className="w-5 h-5" /> Log Out
                        </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
               <Link href="/login" className="px-4 py-2 rounded-full font-bold text-slate-700 hover:bg-slate-100 text-sm">Log In</Link>
               <Link href="/signup" className="px-4 py-2 rounded-full font-bold bg-blue-600 text-white hover:bg-blue-700 text-sm">Sign Up</Link>
            </div>
          )}
        </div>

        {/* --- MOBILE HAMBURGER (Only visible on mobile) --- */}
        <div className="md:hidden flex items-center justify-end flex-1">
             <button 
                onClick={() => setIsMobileOpen(true)}
                className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-full"
             >
                <Menu className="w-7 h-7" />
             </button>
        </div>

      </div>

      {/* --- MOBILE MENU OVERLAY --- */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-100 overflow-y-auto animate-in slide-in-from-right duration-200">
          <div className="p-4">
            
            {/* Header: Title & Close */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Menu</h2>
              <button 
                onClick={() => setIsMobileOpen(false)} 
                className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center"
              >
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </div>

            {/* Mobile Search (Inside Menu) */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search courses, exams..." 
                    className="w-full bg-white border border-slate-200 pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
            </div>

            {/* User Profile Card (Click closes menu) */}
            {user && (
                <Link 
                    href="/profile" 
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm mb-6 border border-slate-100 active:scale-95 transition-transform"
                >
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                        {profile?.full_name?.[0] || user.email[0]}
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-slate-900 text-lg">{profile?.full_name || "My Profile"}</p>
                        <p className="text-sm text-slate-500">View your profile</p>
                    </div>
                </Link>
            )}

            {/* Grid Shortcuts */}
            <h3 className="text-slate-500 font-semibold mb-3 px-1 text-sm uppercase tracking-wide">All Shortcuts</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
                {mobileShortcuts.map((item) => (
                    <Link 
                        key={item.name} 
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-3 active:scale-95 transition-transform hover:shadow-md"
                    >
                        <item.icon className={`w-7 h-7 ${item.color}`} />
                        <span className="font-semibold text-slate-800">{item.name}</span>
                    </Link>
                ))}
            </div>

            {/* Help & Settings List */}
            <div className="space-y-1 border-t border-slate-200 pt-4">
                 <Link href="/settings" onClick={() => setIsMobileOpen(false)} className="w-full flex items-center justify-between p-3 bg-transparent hover:bg-slate-200 rounded-lg">
                    <span className="font-semibold text-slate-700 flex items-center gap-3">
                        <Settings className="w-6 h-6 text-slate-500" /> Settings & Privacy
                    </span>
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                 </Link>
                 
                 {user ? (
                     <button onClick={handleLogout} className="w-full flex items-center justify-between p-3 bg-transparent hover:bg-slate-200 rounded-lg">
                        <span className="font-semibold text-slate-700 flex items-center gap-3">
                            <LogOut className="w-6 h-6 text-slate-500" /> Log Out
                        </span>
                    </button>
                 ) : (
                    <Link href="/login" onClick={() => setIsMobileOpen(false)} className="w-full flex items-center justify-between p-3 bg-transparent hover:bg-slate-200 rounded-lg">
                        <span className="font-semibold text-slate-700 flex items-center gap-3">
                            <LogOut className="w-6 h-6 text-slate-500" /> Log In
                        </span>
                    </Link>
                 )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
}

// Helper Icon for Medical (Simple placeholder)
function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}