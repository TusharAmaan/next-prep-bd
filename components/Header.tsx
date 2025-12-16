"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false); // Mobile Menu
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Mobile Submenu State
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);

  const pathname = usePathname();

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

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- NAVIGATION DATA STRUCTURE ---
  const navLinks = [
    { name: "Home", href: "/" },
    { 
      name: "Exams", 
      href: "#", 
      submenu: [
        { name: "SSC", href: "/resources/ssc" },
        { name: "HSC", href: "/resources/hsc" },
        { name: "Admission", href: "/resources/university-admission" },
        { name: "Job Prep", href: "/resources/job-prep" },
      ]
    },
    { name: "eBooks", href: "/ebooks" },
    { name: "Courses", href: "/courses" },
    { name: "News", href: "/news" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled || pathname !== '/' ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-1 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:rotate-12 transition-transform">N</div>
          <span className={`text-2xl font-extrabold tracking-tight ${isScrolled || pathname !== '/' ? 'text-gray-900' : 'text-white'}`}>
            NextPrep<span className="text-blue-500">BD</span>
          </span>
        </Link>

        {/* --- DESKTOP NAVIGATION --- */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <div key={link.name} className="relative group">
              {link.submenu ? (
                // DROPDOWN PARENT
                <>
                  <button className={`flex items-center gap-1 text-sm font-bold transition-colors ${isScrolled || pathname !== '/' ? "text-gray-600 hover:text-blue-600" : "text-gray-200 hover:text-white"}`}>
                    {link.name}
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  
                  {/* DROPDOWN MENU */}
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0">
                    <div className="p-2 flex flex-col gap-1">
                      {link.submenu.map((subItem) => (
                        <Link 
                          key={subItem.name} 
                          href={subItem.href}
                          className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-left"
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
                  className={`text-sm font-bold transition-colors hover:text-blue-500 ${
                    pathname === link.href 
                      ? "text-blue-600" 
                      : (isScrolled || pathname !== '/' ? "text-gray-600" : "text-gray-200")
                  }`}
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* ACTION BUTTONS */}
        <div className="hidden md:flex items-center gap-3">
          <button className={`p-2 rounded-full transition ${isScrolled || pathname !== '/' ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
          {user ? (
             <Link href="/admin" className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                Dashboard ↗
             </Link>
          ) : (
             <Link href="/login" className={`px-5 py-2 rounded-full font-bold text-sm border-2 transition ${isScrolled || pathname !== '/' ? 'border-blue-600 text-blue-600 hover:bg-blue-50' : 'border-white text-white hover:bg-white/20'}`}>
                Admin Login
             </Link>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button className="md:hidden p-2 text-gray-500" onClick={() => setIsOpen(!isOpen)}>
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
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl flex flex-col p-6 gap-2 max-h-[80vh] overflow-y-auto animate-fade-in-down">
           {navLinks.map((link) => (
             <div key={link.name}>
               {link.submenu ? (
                 <>
                   <button 
                      onClick={() => setMobileSubmenuOpen(!mobileSubmenuOpen)}
                      className="w-full flex justify-between items-center text-lg font-bold text-gray-800 hover:text-blue-600 py-2"
                   >
                      {link.name}
                      <svg className={`w-5 h-5 transition-transform ${mobileSubmenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                   </button>
                   {/* Mobile Submenu List */}
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