"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  Search, Menu, X, ChevronDown, 
  User, LayoutDashboard, LogOut, Settings, 
  BookOpen, Bell
} from "lucide-react";

export default function Header() {
  // --- STATE ---
  const [isOpen, setIsOpen] = useState(false); // Mobile Menu
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null); // Store Full Name/Role
  
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false); // Profile Dropdown
  const navRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const router = useRouter();
  const pathname = usePathname();

  // --- DATA ---
  const examLinks = [
    { name: "SSC", href: "/resources/ssc" },
    { name: "HSC", href: "/resources/hsc" },
    { name: "Job Prep", href: "/resources/job-prep" },
    { name: "University Admission", href: "/resources/university-admission" },
    { name: "Specialized Exams", href: "/resources/specialized-exams" },
  ];

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Exams", href: "#", isDropdown: true, submenu: examLinks },
    { name: "eBooks", href: "/ebooks" },
    { name: "Courses", href: "/courses" },
    { name: "News", href: "/news" },
    { name: "Contact", href: "/contact" },
  ];

  // --- AUTH & SCROLL LOGIC ---
  useEffect(() => {
    // 1. Scroll Handler
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    // 2. Fetch Profile Helper
    const fetchProfile = async (session: any) => {
        if (!session?.user) {
            setUser(null);
            setProfile(null);
            return;
        }
        setUser(session.user);
        // Fetch public profile for name/role
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (data) setProfile(data);
    };

    // 3. Initial Load
    supabase.auth.getSession().then(({ data: { session } }) => fetchProfile(session));

    // 4. REAL-TIME LISTENER (Fixes Refresh Issue)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        fetchProfile(session);
        // Close dropdowns on auth change
        setUserDropdownOpen(false);
        setIsOpen(false);
    });

    // 5. Click Outside (Closes Dropdowns)
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      subscription.unsubscribe();
    };
  }, []);

  // --- ACTIONS ---
  const handleLogout = async () => {
      await supabase.auth.signOut();
      router.refresh();
      router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Helper for dynamic styles
  const isTransparent = !isScrolled && pathname === '/';
  const textColor = isTransparent ? 'text-white' : 'text-slate-900';
  const hoverColor = isTransparent ? 'hover:text-white/80' : 'hover:text-blue-600';

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${!isTransparent ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        
        {/* --- 1. LOGO --- */}
        <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                    N
                </div>
                <span className={`text-2xl font-black tracking-tight ${textColor} hidden sm:block`}>
                    NextPrep<span className="text-blue-500">BD</span>
                </span>
            </Link>

            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="relative hidden md:block w-64 lg:w-80 transition-all focus-within:w-96">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${!isTransparent ? 'text-slate-400' : 'text-white/60'}`} />
                <input 
                    type="text" 
                    placeholder="Search courses..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-full text-sm outline-none transition-all border ${
                        !isTransparent 
                        ? 'bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 text-slate-900 placeholder:text-slate-400' 
                        : 'bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white focus:text-slate-900'
                    }`}
                />
            </form>
        </div>

        {/* --- 2. DESKTOP NAV --- */}
        <nav ref={navRef} className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <div key={link.name} className="relative px-3 py-2">
              {link.isDropdown ? (
                <>
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === link.name ? null : link.name)}
                    className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${textColor} ${hoverColor} ${activeDropdown === link.name ? 'opacity-70' : ''}`}
                  >
                    {link.name}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === link.name ? "rotate-180" : ""}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className={`absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-2 transform transition-all duration-200 origin-top-right ${activeDropdown === link.name ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"}`}>
                    {link.submenu?.map((sub) => (
                        <Link key={sub.name} href={sub.href} onClick={() => setActiveDropdown(null)} className="block px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors">
                          {sub.name}
                        </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link href={link.href} className={`text-sm font-bold transition-colors ${pathname === link.href ? "text-blue-500" : `${textColor} ${hoverColor}`}`}>
                  {link.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* --- 3. RIGHT ACTIONS --- */}
        <div className="flex items-center gap-3">
            
            {/* LOGGED IN VIEW */}
            {user ? (
                <div className="relative hidden lg:block" ref={profileRef}>
                    <button 
                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                        className={`flex items-center gap-3 pl-1 pr-2 py-1 rounded-full border transition-all hover:bg-white/10 ${!isTransparent ? 'border-slate-200 bg-white hover:bg-slate-50' : 'border-white/20 bg-white/10 text-white'}`}
                    >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                            {profile?.full_name ? profile.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${userDropdownOpen ? 'rotate-180' : ''} ${!isTransparent ? 'text-slate-500' : 'text-white'}`} />
                    </button>

                    {/* PROFILE DROPDOWN */}
                    <div className={`absolute top-full right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 transform transition-all duration-200 origin-top-right z-50 ${userDropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"}`}>
                        
                        {/* User Header */}
                        <div className="px-4 py-3 border-b border-slate-50 mb-1">
                            <p className="font-bold text-slate-900 truncate">{profile?.full_name || "User"}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-0.5">{profile?.role || "Student"}</p>
                        </div>

                        {/* Menu Items */}
                        <div className="space-y-0.5">
                            <Link 
                                href={profile?.role === 'student' ? '/student/dashboard' : '/admin'} 
                                onClick={() => setUserDropdownOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-colors"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                {profile?.role === 'student' ? 'My Dashboard' : 'Admin Panel'}
                            </Link>

                            <Link 
                                href="/profile" 
                                onClick={() => setUserDropdownOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                                Account Settings
                            </Link>
                        </div>

                        <div className="border-t border-slate-50 mt-2 pt-2">
                             <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left"
                            >
                                <LogOut className="w-4 h-4" />
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* GUEST VIEW */
                <div className="hidden lg:flex items-center gap-3">
                    <Link href="/login" className={`text-sm font-bold px-4 py-2 rounded-full transition-colors ${!isTransparent ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/20'}`}>
                        Log In
                    </Link>
                    <Link href="/signup" className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                        Sign Up
                    </Link>
                </div>
            )}

            {/* MOBILE TOGGLE */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`lg:hidden p-2 rounded-lg transition-colors ${!isTransparent ? 'text-slate-900 hover:bg-slate-100' : 'text-white hover:bg-white/20'}`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
        </div>
      </div>

      {/* --- 4. MOBILE MENU --- */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-slate-100 shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-5">
            <div className="p-4 space-y-1">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500" />
                </form>

                {navLinks.map((link) => (
                    <div key={link.name}>
                        {link.isDropdown ? (
                            <>
                                <button onClick={() => setMobileSubmenuOpen(!mobileSubmenuOpen)} className="w-full flex justify-between items-center py-3 px-2 text-base font-bold text-slate-800 hover:text-blue-600">
                                    {link.name}
                                    <ChevronDown className={`w-5 h-5 transition-transform ${mobileSubmenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {mobileSubmenuOpen && (
                                    <div className="pl-4 border-l-2 border-slate-100 space-y-1 mb-2">
                                        {link.submenu?.map((sub) => (
                                            <Link key={sub.name} href={sub.href} onClick={() => setIsOpen(false)} className="block py-2 px-4 text-sm font-medium text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-50">
                                                {sub.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <Link href={link.href} onClick={() => setIsOpen(false)} className="block py-3 px-2 text-base font-bold text-slate-800 hover:text-blue-600">
                                {link.name}
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            {/* MOBILE AUTH / PROFILE */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
                {user ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                                {profile?.full_name ? profile.full_name[0].toUpperCase() : "U"}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">{profile?.full_name}</p>
                                <p className="text-xs font-bold text-slate-500 uppercase">{profile?.role}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm">
                                <Settings className="w-4 h-4" /> Settings
                            </Link>
                            <button onClick={handleLogout} className="flex items-center justify-center gap-2 py-2.5 bg-red-50 border border-red-100 rounded-xl text-sm font-bold text-red-600">
                                <LogOut className="w-4 h-4" /> Log Out
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/login" onClick={() => setIsOpen(false)} className="py-3 text-center bg-white border border-slate-200 rounded-xl font-bold text-slate-700 shadow-sm">
                            Log In
                        </Link>
                        <Link href="/signup" onClick={() => setIsOpen(false)} className="py-3 text-center bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30">
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </div>
      )}
    </header>
  );
}