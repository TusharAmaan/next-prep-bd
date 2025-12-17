"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm(""); 
    }
  };

  return (
    <div className="space-y-8">
      
      {/* 1. REDESIGNED SEARCH WIDGET */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4 text-lg">Search Content</h3>
        <form onSubmit={handleSearch} className="relative group">
            {/* Input Field */}
            <input 
                type="text" 
                placeholder="Find notes, blogs..." 
                className="w-full bg-white border-2 border-gray-100 rounded-xl pl-4 pr-12 py-3.5 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* Search Button/Icon */}
            <button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                aria-label="Search"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </button>
        </form>
      </div>

      {/* 2. COMMUNITY WIDGET */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:opacity-20 transition-opacity"></div>
        
        <div className="relative z-10">
            <span className="bg-white/20 text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block backdrop-blur-sm">Community</span>
            <h3 className="font-bold text-2xl mb-2 leading-tight">Join 5000+ Students</h3>
            <p className="text-blue-100 text-sm mb-6 opacity-90">Get daily updates, exclusive notes, and exam tips directly on our Facebook page.</p>
            <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full bg-white text-blue-700 text-center font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all transform hover:-translate-y-0.5"
            >
                Follow Page
            </a>
        </div>
      </div>

      {/* 3. QUICK LINKS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4 text-lg">Quick Access</h3>
        <div className="flex flex-col gap-2">
            {[
                { label: "SSC Preparation", href: "/resources/ssc" },
                { label: "HSC Preparation", href: "/resources/hsc" },
                { label: "Admission Test", href: "/resources/university-admission" }
            ].map((item) => (
                <Link 
                    key={item.href}
                    href={item.href} 
                    className="flex justify-between items-center p-3.5 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-700 transition group"
                >
                    <span className="font-bold text-sm">{item.label}</span>
                    <span className="text-gray-300 group-hover:text-blue-500 transition-colors transform group-hover:translate-x-1">→</span>
                </Link>
            ))}
        </div>
      </div>

    </div>
  );
}