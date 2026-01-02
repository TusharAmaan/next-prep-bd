"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  Search, Menu, X, Home, BookOpen, 
  GraduationCap, Bell, MessageCircle, 
  LogOut, LayoutDashboard, ChevronDown, 
  Settings, Layers, FileText
} from "lucide-react";

export default function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Home");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);

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
  };

  // --- NAVIGATION DATA ---
  const centerNav = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Courses", icon: BookOpen, href: "/courses" },
    { name: "Exams", icon: Layers, href: "/exams" }, // Facebook "Watch" equivalent
    { name: "eBooks", icon: FileText, href: "/ebooks" },
  ];

  // Helper: Active State Class
  const getNavClass = (path: string) => {
    const isActive = pathname === path;
    return `relative group flex items-center justify-center w-full md:w-28 h-12 rounded-lg transition-all duration-200 
      ${isActive 
        ? "text-blue-600 after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-1 after:bg-blue-600" 
        : "text-slate-500 hover:bg-slate-100"
      }`;
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm h-16">
      <div className="flex items-center justify-between h-full px-4 max-w-[1920px] mx-auto">
        
        {/* --- LEFT: LOGO & SEARCH --- */}
        <div className="flex items-center gap-3 w-[25%]">
          <Link href="/" className="flex-shrink-0">
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
          {/* Mobile Search Icon Only */}
          <button className="lg:hidden w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
             <Search className="w-5 h-5" />
          </button>
        </div>

        {/* --- CENTER: MAIN NAV (Facebook Tabs) --- */}
        <nav className="hidden md:flex items-center justify-center w-[50%] gap-1 h-full">
          {centerNav.map((item) => (
            <Link key={item.name} href={item.href} className={getNavClass(item.href)}>
              <item.icon className={`w-6 h-6 ${pathname === item.href ? "fill-current" : ""}`} />
              
              {/* Tooltip */}
              <span className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none">
                {item.name}
              </span>
            </Link>
          ))}
        </nav>

        {/* --- RIGHT: ACTIONS & PROFILE --- */}
        <div className="flex items-center justify-end gap-2 w-[25%]">
          {user ? (
            <>
               {/* Provide Feedback Button */}
               <Link 
                href="/feedback" 
                className="hidden xl:flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-sm px-3 py-2 rounded-full transition-colors mr-1"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Give Feedback</span>
              </Link>

              {/* Icon Buttons */}
              <button className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors relative">
                <Menu className="w-5 h-5 text-slate-900" />
              </button>
              <button className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors relative">
                <Bell className="w-5 h-5 text-slate-900" />
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity ml-1"
                >
                  <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center font-bold">
                     {profile?.full_name?.[0] || user.email[0]}
                  </div>
                </button>

                {/* Dropdown Content */}
                {showProfileMenu && (
                  <div className="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                    <div className="p-2 mb-2 shadow-sm rounded-lg border border-slate-50">
                        <p className="font-bold text-lg">{profile?.full_name || "User"}</p>
                        <p className="text-slate-500 text-sm capitalize">{profile?.role || "Student"}</p>
                    </div>
                    
                    <Link href="/profile" className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg transition-colors font-semibold text-slate-700">
                        <Settings className="w-5 h-5" /> Settings & Privacy
                    </Link>
                    
                    <Link href="/feedback" className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg transition-colors font-semibold text-slate-700">
                        <MessageCircle className="w-5 h-5" /> Help & Support
                    </Link>

                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg transition-colors font-semibold text-slate-700">
                        <LogOut className="w-5 h-5" /> Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
               <Link href="/login" className="px-5 py-2 rounded-full font-bold text-slate-700 hover:bg-slate-100">Log In</Link>
               <Link href="/signup" className="px-5 py-2 rounded-full font-bold bg-blue-600 text-white hover:bg-blue-700">Sign Up</Link>
            </div>
          )}
          
          {/* Mobile Hamburger */}
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden ml-2 w-10 h-10 flex items-center justify-center text-slate-700"
          >
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* --- MOBILE MENU OVERLAY (Facebook "Menu" Tab Style) --- */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-100 overflow-y-auto animate-in slide-in-from-right duration-200">
          <div className="p-4">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Menu</h2>
              <button 
                onClick={() => setIsMobileOpen(false)} 
                className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center"
              >
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </div>

            {/* User Profile Card */}
            {user && (
                <Link href="/profile" className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm mb-6">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        {profile?.full_name?.[0] || user.email[0]}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900">{profile?.full_name || "My Profile"}</p>
                        <p className="text-sm text-slate-500">View your profile</p>
                    </div>
                </Link>
            )}

            {/* Grid Navigation */}
            <h3 className="text-slate-500 font-semibold mb-3 px-1">All Shortcuts</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                    { name: "Home", href: "/", icon: Home, color: "text-blue-600" },
                    { name: "Exams", href: "/exams", icon: Layers, color: "text-purple-600" },
                    { name: "Courses", href: "/courses", icon: BookOpen, color: "text-green-600" },
                    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-orange-600" },
                    { name: "eBooks", href: "/ebooks", icon: FileText, color: "text-red-500" },
                    { name: "Feedback", href: "/feedback", icon: MessageCircle, color: "text-teal-600" },
                ].map((item) => (
                    <Link 
                        key={item.name} 
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className="bg-white p-4 rounded-xl shadow-sm flex flex-col gap-3 active:scale-95 transition-transform"
                    >
                        <item.icon className={`w-7 h-7 ${item.color}`} />
                        <span className="font-semibold text-slate-800">{item.name}</span>
                    </Link>
                ))}
            </div>

            {/* Help & Settings List */}
            <div className="space-y-1 border-t border-slate-200 pt-4">
                 <button className="w-full flex items-center justify-between p-3 bg-transparent hover:bg-slate-200 rounded-lg">
                    <span className="font-semibold text-slate-700 flex items-center gap-3">
                        <Settings className="w-6 h-6 text-slate-500" /> Settings & Privacy
                    </span>
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                 </button>
                 
                 {user ? (
                     <button onClick={handleLogout} className="w-full flex items-center justify-between p-3 bg-transparent hover:bg-slate-200 rounded-lg">
                        <span className="font-semibold text-slate-700 flex items-center gap-3">
                            <LogOut className="w-6 h-6 text-slate-500" /> Log Out
                        </span>
                    </button>
                 ) : (
                    <Link href="/login" className="w-full flex items-center justify-between p-3 bg-transparent hover:bg-slate-200 rounded-lg">
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