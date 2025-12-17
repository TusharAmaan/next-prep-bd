"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Sidebar() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [recentItems, setRecentItems] = useState<any[]>([]);

  // 1. Fetch Recent Uploads for the Sidebar
  useEffect(() => {
    const fetchRecent = async () => {
      const { data } = await supabase
        .from("resources")
        .select("id, title, type, content_url")
        .order("created_at", { ascending: false })
        .limit(4);
      
      if (data) setRecentItems(data);
    };
    fetchRecent();
  }, []);

  // 2. Search Handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm(""); 
    }
  };

  return (
    <div className="space-y-8">
      
      {/* --- WIDGET 1: PROFESSIONAL SEARCH --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-extrabold text-gray-900 mb-4 text-sm uppercase tracking-wider">Find Resources</h3>
        <form onSubmit={handleSearch} className="relative">
            <input 
                type="text" 
                placeholder="Search notes, blogs..." 
                className="w-full bg-white border border-gray-300 text-gray-900 placeholder-gray-400 rounded-xl pl-4 pr-12 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </button>
        </form>
      </div>

      {/* --- WIDGET 2: QUICK LINKS (Clean List) --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100">
            <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider">Browse Categories</h3>
        </div>
        <div className="flex flex-col">
            {[
                { label: "SSC Preparation", href: "/resources/ssc", icon: "📘" },
                { label: "HSC Preparation", href: "/resources/hsc", icon: "📙" },
                { label: "University Admission", href: "/resources/university-admission", icon: "🎓" },
                { label: "Job Preparation", href: "/resources/job-prep", icon: "💼" }
            ].map((item) => (
                <Link 
                    key={item.href}
                    href={item.href} 
                    className="flex items-center gap-3 p-4 hover:bg-blue-50 transition-colors group border-b border-gray-50 last:border-0"
                >
                    <span className="text-xl bg-gray-100 w-8 h-8 flex items-center justify-center rounded-lg group-hover:bg-white transition-colors">{item.icon}</span>
                    <span className="font-bold text-sm text-gray-700 group-hover:text-blue-700 flex-1">{item.label}</span>
                    <span className="text-gray-300 group-hover:text-blue-500">→</span>
                </Link>
            ))}
        </div>
      </div>

      {/* --- WIDGET 3: SOCIALS (The "Previous" style improved) --- */}
      <div className="space-y-3">
        <a 
            href="https://facebook.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between px-6 py-4 bg-[#1877F2] text-white rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all group"
        >
            <div className="flex items-center gap-3">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <div className="flex flex-col">
                    <span className="font-bold text-sm">Join Community</span>
                    <span className="text-xs text-blue-200">On Facebook</span>
                </div>
            </div>
            <span className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white/30 transition">↗</span>
        </a>

        <a 
            href="https://youtube.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between px-6 py-4 bg-[#FF0000] text-white rounded-2xl shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-1 transition-all group"
        >
            <div className="flex items-center gap-3">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                <div className="flex flex-col">
                    <span className="font-bold text-sm">Watch Tutorials</span>
                    <span className="text-xs text-red-200">On YouTube</span>
                </div>
            </div>
            <span className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white/30 transition">↗</span>
        </a>
      </div>

      {/* --- WIDGET 4: RECENT UPDATES (New) --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-extrabold text-gray-900 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            New Uploads
        </h3>
        <div className="space-y-4">
            {recentItems.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Loading updates...</p>
            ) : (
                recentItems.map(item => (
                    <a 
                        key={item.id} 
                        href={item.type === 'blog' ? `/blog/${item.id}` : item.content_url}
                        target={item.type === 'blog' ? '_self' : '_blank'}
                        className="flex gap-3 items-start group"
                    >
                         <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${item.type === 'pdf' ? 'bg-red-400' : item.type === 'video' ? 'bg-blue-400' : 'bg-purple-400'}`}></div>
                         <div>
                            <p className="text-sm font-bold text-gray-700 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                                {item.title}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">{item.type}</p>
                         </div>
                    </a>
                ))
            )}
        </div>
      </div>

    </div>
  );
}