"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Sidebar() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [recentItems, setRecentItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecent = async () => {
      // Fetch recent 5 items
      const { data } = await supabase
        .from("resources")
        .select("id, title, type, content_url, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (data) setRecentItems(data);
    };
    fetchRecent();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) { router.push(`/search?q=${encodeURIComponent(searchTerm)}`); setSearchTerm(""); }
  };

  // Helper to get icon based on type
  const getIcon = (type: string) => {
    switch(type) {
        case 'pdf': return '📄';
        case 'video': return '▶';
        case 'blog': return '✍️';
        case 'question': return '❓';
        default: return '📁';
    }
  };

  // Helper to get color style based on type
  const getIconStyle = (type: string) => {
      switch(type) {
          case 'pdf': return 'bg-red-50 text-red-500 border-red-100';
          case 'video': return 'bg-blue-50 text-blue-500 border-blue-100';
          case 'blog': return 'bg-purple-50 text-purple-500 border-purple-100';
          default: return 'bg-gray-50 text-gray-500 border-gray-100';
      }
  };

  return (
    <div className="space-y-8 sticky top-32">
      
      {/* 1. SEARCH */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-extrabold text-slate-900 mb-4 text-xs uppercase tracking-wider">Find Content</h3>
        <form onSubmit={handleSearch} className="relative group">
            <input type="text" placeholder="Search..." className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></button>
        </form>
      </div>

      {/* 2. CATEGORIES */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100"><h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Quick Access</h3></div>
        <div className="flex flex-col">
            {[
                { label: "SSC Preparation", href: "/resources/ssc", icon: "📘" },
                { label: "HSC Preparation", href: "/resources/hsc", icon: "📙" },
                { label: "Admission Test", href: "/resources/university-admission", icon: "🎓" }
            ].map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-3 p-4 hover:bg-blue-50 transition-colors group border-b border-slate-50 last:border-0">
                    <span className="text-lg bg-slate-100 w-8 h-8 flex items-center justify-center rounded-lg group-hover:bg-white transition-colors">{item.icon}</span>
                    <span className="font-bold text-sm text-slate-700 group-hover:text-blue-700 flex-1">{item.label}</span>
                    <span className="text-slate-300 group-hover:text-blue-500">→</span>
                </Link>
            ))}
        </div>
      </div>

      {/* 3. RECENT UPLOADS (REDESIGNED) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Latest Materials</h3>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        </div>
        <div className="p-2">
            {recentItems.length === 0 ? <p className="text-xs text-slate-400 italic p-4">No recent items.</p> : recentItems.map(item => (
                <a key={item.id} href={item.type === 'blog' ? `/blog/${item.id}` : item.content_url} target={item.type === 'blog' ? '_self' : '_blank'} className="flex gap-3 items-center p-3 rounded-xl hover:bg-slate-50 transition-all group mb-1 last:mb-0">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border ${getIconStyle(item.type)} shadow-sm group-hover:scale-110 transition-transform`}>
                        {getIcon(item.type)}
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">{item.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wide">{item.type} • {new Date(item.created_at).toLocaleDateString()}</p>
                     </div>
                </a>
            ))}
        </div>
      </div>

      {/* 4. SOCIAL MEDIA */}
      <div className="space-y-3">
        <a href="https://www.facebook.com/proyashcoaching" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-5 py-4 bg-[#1877F2] text-white rounded-2xl shadow-lg hover:shadow-blue-500/40 hover:-translate-y-1 transition-all group">
            <div className="flex items-center gap-3">
                <span className="bg-white/20 p-2 rounded-full"><svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></span>
                <div><h4 className="font-bold text-sm">Join Community</h4><p className="text-[10px] text-blue-100">Facebook Page</p></div>
            </div>
        </a>
      </div>

    </div>
  );
}