"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Sidebar() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [recentItems, setRecentItems] = useState<any[]>([]);

  // 1. Fetch Recent Uploads
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
    <div className="space-y-8 sticky top-24">
      
      {/* --- WIDGET 1: SEARCH --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-extrabold text-gray-900 mb-4 text-sm uppercase tracking-wider">Find Content</h3>
        <form onSubmit={handleSearch} className="relative group">
            <input 
                type="text" 
                placeholder="Search notes, blogs..." 
                className="w-full bg-white border border-gray-300 text-gray-900 placeholder-gray-400 rounded-xl pl-4 pr-12 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm group-hover:border-blue-300"
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

      {/* --- WIDGET 2: BROWSE CATEGORIES --- */}
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
                    <span className="text-xl bg-gray-100 w-8 h-8 flex items-center justify-center rounded-lg group-hover:bg-white transition-colors shadow-sm">{item.icon}</span>
                    <span className="font-bold text-sm text-gray-700 group-hover:text-blue-700 flex-1">{item.label}</span>
                    <span className="text-gray-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1">→</span>
                </Link>
            ))}
        </div>
      </div>

      {/* --- WIDGET 3: LATEST POSTS (Moved Up) --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-extrabold text-gray-900 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Recent Uploads
        </h3>
        <div className="space-y-4">
            {recentItems.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No recent items found.</p>
            ) : (
                recentItems.map(item => (
                    <a 
                        key={item.id} 
                        href={item.type === 'blog' ? `/blog/${item.id}` : item.content_url}
                        target={item.type === 'blog' ? '_self' : '_blank'}
                        className="flex gap-3 items-start group"
                    >
                         <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.type === 'pdf' ? 'bg-red-500' : item.type === 'video' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                         <div>
                            <p className="text-sm font-bold text-gray-700 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                                {item.title}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wide">{item.type}</p>
                         </div>
                    </a>
                ))
            )}
        </div>
      </div>

      {/* --- WIDGET 4: SOCIAL MEDIA (Redesigned) --- */}
      <div className="space-y-4">
        {/* Facebook */}
        <a 
            href="https://www.facebook.com/proyashcoaching" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between p-1 bg-[#1877F2] text-white rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all group"
        >
            <div className="bg-white/10 p-4 rounded-xl flex-1 flex items-center gap-4">
                <div className="bg-white text-[#1877F2] w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold">f</div>
                <div>
                    <h4 className="font-bold text-sm">Proyash Coaching</h4>
                    <p className="text-xs text-blue-100 opacity-90">12k Followers</p>
                </div>
            </div>
            <div className="px-4">
                <svg className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
            </div>
        </a>

        {/* YouTube */}
        <a 
            href="https://www.youtube.com/@gmatclub" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between p-1 bg-[#FF0000] text-white rounded-2xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-1 transition-all group"
        >
            <div className="bg-white/10 p-4 rounded-xl flex-1 flex items-center gap-4">
                <div className="bg-white text-[#FF0000] w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold">▶</div>
                <div>
                    <h4 className="font-bold text-sm">GMAT Club</h4>
                    <p className="text-xs text-red-100 opacity-90">Subscribe Now</p>
                </div>
            </div>
            <div className="px-4">
                <svg className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
            </div>
        </a>
      </div>

    </div>
  );
}