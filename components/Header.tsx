"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  // --- STATE MANAGEMENT ---
  const [isOpen, setIsOpen] = useState(false); // Mobile Menu Toggle
  const [isScrolled, setIsScrolled] = useState(false); // Scroll detection
  const [user, setUser] = useState<any>(null); // Auth State
  
  // Desktop Dropdown State
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Mobile Submenu State
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);

  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  // --- DYNAMIC NAVIGATION STATE ---
  // We initialize with the static links. The "Exams" submenu starts empty or with defaults.
  const [navLinks, setNavLinks] = useState([
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { 
      name: "Exams", 
      href: "#", 
      submenu: [] as any[] // Will be populated from Supabase
    },
    { name: "eBooks", href: "/ebooks" },
    { name: "Courses", href: "/courses" },
    { name: "News", href: "/news" },
    { name: "Contact", href: "/contact" },
  ]);

  // --- EFFECTS ---
  useEffect(() => {
    // 1. Handle Scroll
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    // 2. Check Auth
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

    // 3. FETCH EXAM SEGMENTS FROM SUPABASE (Like a Boss)
    const fetchSegments = async () => {
      // REPLACE 'segments' with your actual table name (e.g., 'exam_segments', 'categories')
      const { data, error } = await supabase
        .from('segments') 
        .select('name, slug'); // Ensure your table has these columns

      if (data) {
        // Map the DB data to the menu structure
        const dynamicSubmenu = data.map(item => ({
          name: item.name,
          href: `/resources/${item.slug}` // Adjust this path structure if needed
        }));

        // Update the navLinks state with the new submenu
        setNavLinks(prevLinks => prevLinks.map(link => 
          link.name === "Exams" 
            ? { ...link, submenu: dynamicSubmenu } 
            : link
        ));
      } else if (error) {
        console.error("Error fetching segments:", error);
      }
    };
    fetchSegments();

    // 4. Handle Click Outside
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- HANDLERS ---
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleDropdownToggle = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  // Helper styles
  const getTextColor = () => isScrolled || pathname !== '/' ? 'text-gray-900' : 'text-white';
  const getHoverColor = () => isScrolled || pathname !== '/' ? 'hover:text-blue-600' : 'hover:text-gray-200';

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled || pathname !== '/' ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center gap-4">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-1 group flex-shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:rotate-12 transition-transform">N</div>
          <span className={`text-2xl font-extrabold tracking-tight ${getTextColor()}`}>
            NextPrep<span className="text-blue-500">BD</span>
          </span>
        </Link>

        {/* --- DESKTOP NAVIGATION --- */}
        <nav ref={navRef} className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <div key={link.name} className="relative">
              {link.submenu && link.submenu.length > 0 ? (
                // DROPDOWN PARENT (CLICKABLE)
                <>
                  <button 
                    onClick={() => handleDropdownToggle(link.name)}
                    className={`flex items-center gap-1 text-sm font-bold transition-colors ${getTextColor()} ${getHoverColor()} ${activeDropdown === link.name ? 'text-blue-600' : ''}`}
                  >
                    {link.name}
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === link.name ? "rotate-180" : ""}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* DROPDOWN MENU */}
                  <div className={`absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 transition-all duration-200 ease-in-out transform origin-top-left z-50 
                    ${activeDropdown === link.name ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-2"}`}>
                    <div className="p-2 flex flex-col gap-1 max-h-64 overflow-y-auto">
                      {link.submenu.map((subItem) => (
                        <Link 
                          key={subItem.name} 
                          href={subItem.href}
                          onClick={() => setActiveDropdown(null)}
                          className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-left truncate"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                // STANDARD LINK
                <Link 
                  href={link.href}
                  className={`text-sm font-bold transition-colors ${pathname === link.href ? "text-blue-500" : `${getTextColor()} ${getHoverColor()}`}`}
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* --- RIGHT SIDE: SEARCH + ACTIONS --- */}
        <div className="hidden md:flex items-center gap-4">
            
            {/* DESKTOP SEARCH BAR */}
            <form onSubmit={handleSearch} className="relative group">
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-full text-sm outline-none transition-all w-48 focus:w-64 border ${isScrolled || pathname !== '/' ? 'bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 text-gray-900 placeholder-gray-500' : 'bg-white/10 border-white/20 text-white placeholder-gray-300 focus:bg-white focus:text-gray-900 focus:border-white'}`}
                />
                <button type="submit" className={`absolute left-3 top-1/2 -translate-y-1/2 ${isScrolled || pathname !== '/' ? 'text-gray-400' : 'text-gray-300'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </button>
            </form>

            {/* LOGIN / DASHBOARD BUTTON */}
            {user ? (
                <Link href="/admin" className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                Dashboard ↗
                </Link>
            ) : (
                <Link href="/login" className={`px-5 py-2 rounded-full font-bold text-sm border-2 transition ${isScrolled || pathname !== '/' ? 'border-blue-600 text-blue-600 hover:bg-blue-50' : 'border-white text-white hover:bg-white/20'}`}>
                Login
                </Link>
            )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button className={`md:hidden p-2 ${getTextColor()}`} onClick={() => setIsOpen(!isOpen)}>
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             {isOpen 
               ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
             }
           </svg>
        </button>
      </div>

      {/* --- MOBILE MENU DROPDOWN --- */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl flex flex-col p-6 gap-4 max-h-[80vh] overflow-y-auto animate-fade-in-down">
           
           {/* MOBILE SEARCH BAR */}
           <form onSubmit={handleSearch} className="relative">
                <input 
                    type="text" 
                    placeholder="Search topics..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </span>
           </form>

           {navLinks.map((link) => (
             <div key={link.name}>
               {link.submenu && link.submenu.length > 0 ? (
                 <>
                   <button 
                     onClick={() => setMobileSubmenuOpen(!mobileSubmenuOpen)}
                     className="w-full flex justify-between items-center text-lg font-bold text-gray-800 hover:text-blue-600 py-2"
                   >
                      {link.name}
                      <svg className={`w-5 h-5 transition-transform ${mobileSubmenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                   </button>
                   {mobileSubmenuOpen && (
                     <div className="pl-4 border-l-2 border-gray-100 flex flex-col gap-2 mt-1 mb-2">
                       {link.submenu.map(sub => (
                         <Link 
                           key={sub.name} 
                           href={sub.href}
                           onClick={() => setIsOpen(false)}
                           className="text-gray-600 font-medium py-1 hover:text-blue-600 text-base"
                         >
                            {sub.name}
                         </Link>
                       ))}
                     </div>
                   )}
                 </>
               ) : (
                 <Link 
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block text-lg font-bold text-gray-800 hover:text-blue-600 py-2"
                 >
                    {link.name}
                 </Link>
               )}
             </div>
           ))}
           <hr className="my-2" />
           {user ? (
             <Link href="/admin" onClick={() => setIsOpen(false)} className="bg-blue-600 text-white text-center py-3 rounded-lg font-bold">Dashboard</Link>
           ) : (
             <Link href="/login" onClick={() => setIsOpen(false)} className="bg-gray-100 text-gray-700 text-center py-3 rounded-lg font-bold">Admin Login</Link>
           )}
        </div>
      )}
    </header>
  );
}