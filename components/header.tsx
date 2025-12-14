"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "SSC", href: "/resources/ssc" },
    { name: "HSC", href: "/resources/hsc" },
    { name: "Admission", href: "/admission" },
    { name: "Job Prep", href: "/job-prep" },
    { name: "eBooks", href: "/ebooks" },
    { name: "Courses", href: "/courses" },
    { name: "News", href: "/news" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      {/* SPACER (Prevents content from hiding behind fixed header) */}
      <div className="h-16 md:h-20"></div>

      {/* HEADER BAR */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          
          {/* 1. LOGO */}
          <Link href="/" className="flex items-center gap-2 group">
             {/* Simple Logo Icon */}
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-blue-200 shadow-lg group-hover:scale-110 transition">
                N
             </div>
             <span className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
                NextPrep<span className="text-blue-600">BD</span>
             </span>
          </Link>

          {/* 2. DESKTOP NAVIGATION (Hidden on Mobile) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-all
                    ${isActive 
                        ? "text-blue-600 bg-blue-50" 
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                    }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* 3. RIGHT SIDE ACTIONS */}
          <div className="hidden lg:flex items-center gap-4">
             {/* Search Icon */}
             <button className="p-2 text-gray-400 hover:text-blue-600 transition rounded-full hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
             </button>
             
             {/* Login Button */}
             <Link 
                href="/login" 
                className="bg-green-600 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-md shadow-green-200 hover:bg-green-700 hover:shadow-lg transition transform hover:-translate-y-0.5"
             >
                Login
             </Link>
          </div>

          {/* 4. MOBILE MENU BUTTON (Visible on Small Screens) */}
          <button 
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
             {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
             ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
             )}
          </button>
        </div>

        {/* 5. MOBILE MENU DROPDOWN */}
        {isMobileMenuOpen && (
           <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full left-0 top-16 md:top-20 animate-in slide-in-from-top-2">
              <nav className="flex flex-col p-4 space-y-2">
                 {navItems.map((item) => (
                    <Link 
                        key={item.name} 
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-3 rounded-lg text-gray-700 font-bold hover:bg-blue-50 hover:text-blue-600"
                    >
                        {item.name}
                    </Link>
                 ))}
                 <div className="h-px bg-gray-100 my-2"></div>
                 <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-center bg-green-600 text-white rounded-lg font-bold">
                    Login / Dashboard
                 </Link>
              </nav>
           </div>
        )}
      </header>
    </>
  );
}