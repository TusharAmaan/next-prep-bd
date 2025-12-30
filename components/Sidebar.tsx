"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// Helper: Get Icon based on file type
const getIcon = (type: string) => {
  switch (type) {
    case "pdf": return "📄";
    case "video": return "▶";
    case "blog": return "✍️";
    case "question": return "❓";
    default: return "📁";
  }
};

// Helper: Get Color Style based on file type
const getIconStyle = (type: string) => {
  switch (type) {
    case "pdf": return "bg-red-50 text-red-500 border-red-100";
    case "video": return "bg-blue-50 text-blue-500 border-blue-100";
    case "blog": return "bg-purple-50 text-purple-500 border-purple-100";
    case "question": return "bg-yellow-50 text-yellow-600 border-yellow-100";
    default: return "bg-gray-50 text-gray-500 border-gray-100";
  }
};

// Helper: Link Logic
const getLink = (item: any) => {
  if (item.type === "blog") return `/blog/${item.id}`;
  if (item.type === "question") return `/question/${item.id}`;
  return item.content_url || "#";
};

const getTarget = (item: any) => {
  if (item.type === "blog" || item.type === "question") return "_self";
  return "_blank";
};

export default function Sidebar() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [segments, setSegments] = useState<any[]>([]);

  // --- STATE FOR WIDGETS ---
  const [materials, setMaterials] = useState<any[]>([]);
  const [materialFilter, setMaterialFilter] = useState("All");
  const [loadingMaterials, setLoadingMaterials] = useState(true);

  const [questions, setQuestions] = useState<any[]>([]);
  const [questionFilter, setQuestionFilter] = useState("All");
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  // 1. FETCH SEGMENTS (For Filters)
  useEffect(() => {
    const fetchSegments = async () => {
      const { data } = await supabase.from("segments").select("id, title").order("id");
      if (data) setSegments(data);
    };
    fetchSegments();
  }, []);

  // 2. FETCH MATERIALS (Blogs, PDFs, Videos)
  useEffect(() => {
    const fetchMaterials = async () => {
      setLoadingMaterials(true);
      let query = supabase
        .from("resources")
        .select("id, title, type, content_url, created_at, segment_id")
        .in("type", ["blog", "pdf", "video"])
        .order("created_at", { ascending: false })
        .limit(5);

      if (materialFilter !== "All") {
        const segId = segments.find(s => s.title === materialFilter)?.id;
        if (segId) query = query.eq("segment_id", segId);
      }

      const { data } = await query;
      if (data) setMaterials(data);
      setLoadingMaterials(false);
    };

    if (segments.length > 0 || materialFilter === "All") fetchMaterials();
  }, [materialFilter, segments]);

  // 3. FETCH QUESTIONS
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      let query = supabase
        .from("resources")
        .select("id, title, type, content_url, created_at, segment_id")
        .eq("type", "question")
        .order("created_at", { ascending: false })
        .limit(5);

      if (questionFilter !== "All") {
        const segId = segments.find(s => s.title === questionFilter)?.id;
        if (segId) query = query.eq("segment_id", segId);
      }

      const { data } = await query;
      if (data) setQuestions(data);
      setLoadingQuestions(false);
    };

    if (segments.length > 0 || questionFilter === "All") fetchQuestions();
  }, [questionFilter, segments]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  return (
    <div className="space-y-8 sticky top-32">
      
      {/* 1. SEARCH WIDGET */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-extrabold text-slate-900 mb-4 text-xs uppercase tracking-wider flex items-center gap-2">
          <span>🔍</span> Find Content
        </h3>
        <form onSubmit={handleSearch} className="relative group">
          <input
            type="text"
            placeholder="Search topics..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </button>
        </form>
      </div>

      {/* 2. QUICK ACCESS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100">
          <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">🚀 Quick Access</h3>
        </div>
        <div className="flex flex-col divide-y divide-slate-50">
          {[
            { label: "SSC Preparation", href: "/resources/ssc", icon: "📘" },
            { label: "HSC Preparation", href: "/resources/hsc", icon: "📙" },
            { label: "Admission Test", href: "/resources/university-admission", icon: "🎓" },
            { label: "Job Preparation", href: "/resources/job-prep", icon: "💼" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 p-4 hover:bg-blue-50 transition-colors group">
              <span className="text-lg bg-slate-100 w-8 h-8 flex items-center justify-center rounded-lg group-hover:bg-white transition-colors shadow-sm">{item.icon}</span>
              <span className="font-bold text-sm text-slate-700 group-hover:text-blue-700 flex-1">{item.label}</span>
              <span className="text-slate-300 group-hover:text-blue-500 text-xs">➔</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. LATEST MATERIALS WIDGET (Blogs/PDFs) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header with Filter */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
            <span>📚</span> Materials
          </h3>
          <select 
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-600 focus:outline-none focus:border-blue-400 cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <option value="All">All Levels</option>
            {segments.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
          </select>
        </div>

        {/* Content List */}
        <div className="p-2">
          {loadingMaterials ? (
             <div className="p-4 space-y-3">
               {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse"></div>)}
             </div>
          ) : materials.length === 0 ? (
             <div className="p-6 text-center text-slate-400 text-xs italic">No materials found for {materialFilter}.</div>
          ) : (
             materials.map(item => (
                <Link 
                    key={item.id} 
                    href={getLink(item)} 
                    target={getTarget(item)}
                    className="flex gap-3 items-start p-3 rounded-xl hover:bg-slate-50 transition-all group mb-1 last:mb-0"
                >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm border ${getIconStyle(item.type)} shadow-sm group-hover:scale-110 transition-transform flex-shrink-0 mt-0.5`}>
                        {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">{item.title}</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide flex items-center gap-1">
                           <span>{new Date(item.created_at).toLocaleDateString()}</span>
                           {/* Show segment tag only if 'All' is selected to give context */}
                           {materialFilter === "All" && item.segment_id && (
                               <>• <span className="text-blue-400">{segments.find(s=>s.id===item.segment_id)?.title}</span></>
                           )}
                        </p>
                    </div>
                </Link>
             ))
          )}
        </div>
        {/* Footer Link */}
        <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
            <Link href="/blog" className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors">
                View All Materials →
            </Link>
        </div>
      </div>

      {/* 4. QUESTION ARCHIVE WIDGET */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header with Filter */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
            <span>❓</span> Questions
          </h3>
          <select 
            value={questionFilter}
            onChange={(e) => setQuestionFilter(e.target.value)}
            className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-600 focus:outline-none focus:border-yellow-400 cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <option value="All">All Exams</option>
            {segments.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
          </select>
        </div>

        {/* Content List */}
        <div className="p-2">
          {loadingQuestions ? (
             <div className="p-4 space-y-3">
               {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse"></div>)}
             </div>
          ) : questions.length === 0 ? (
             <div className="p-6 text-center text-slate-400 text-xs italic">No questions found for {questionFilter}.</div>
          ) : (
             questions.map(item => (
                <Link 
                    key={item.id} 
                    href={getLink(item)} 
                    target={getTarget(item)}
                    className="flex gap-3 items-start p-3 rounded-xl hover:bg-yellow-50/50 transition-all group mb-1 last:mb-0"
                >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm border bg-yellow-50 text-yellow-600 border-yellow-100 shadow-sm group-hover:scale-110 transition-transform flex-shrink-0 mt-0.5`}>
                        ❓
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 leading-snug group-hover:text-yellow-700 transition-colors line-clamp-2">{item.title}</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide flex items-center gap-1">
                           <span>{new Date(item.created_at).toLocaleDateString()}</span>
                           {questionFilter === "All" && item.segment_id && (
                               <>• <span className="text-yellow-500">{segments.find(s=>s.id===item.segment_id)?.title}</span></>
                           )}
                        </p>
                    </div>
                </Link>
             ))
          )}
        </div>
        {/* Footer Link (Generic link for now, or link to a dedicated question page if you have one) */}
        <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
            <Link href="/" className="text-[10px] font-bold text-yellow-600 hover:text-yellow-800 uppercase tracking-widest transition-colors">
                Visit Archive →
            </Link>
        </div>
      </div>

      {/* 5. SOCIAL MEDIA */}
      <div className="space-y-3">
        <a href="https://www.facebook.com/proyashcoaching" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-5 py-4 bg-[#1877F2] text-white rounded-2xl shadow-lg hover:shadow-blue-500/40 hover:-translate-y-1 transition-all group">
            <div className="flex items-center gap-3">
                <span className="bg-white/20 p-2 rounded-full"><svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></span>
                <div><h4 className="font-bold text-sm">Join Community</h4><p className="text-[10px] text-blue-100">Facebook Page</p></div>
            </div>
        </a>
        <a href="https://www.youtube.com/@gmatclub" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-5 py-4 bg-[#FF0000] text-white rounded-2xl shadow-lg hover:shadow-red-500/40 hover:-translate-y-1 transition-all group">
            <div className="flex items-center gap-3">
                <span className="bg-white/20 p-2 rounded-full"><svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg></span>
                <div><h4 className="font-bold text-sm">Watch Classes</h4><p className="text-[10px] text-red-100">YouTube Channel</p></div>
            </div>
        </a>
      </div>

    </div>
  );
}