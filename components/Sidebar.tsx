"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  Search, FileText, PlayCircle, HelpCircle, 
  PenTool, ChevronRight, LayoutGrid, Clock, Filter 
} from "lucide-react";

// --- HELPERS ---
const getIcon = (type: string) => {
  switch (type) {
    case "pdf": return <FileText className="w-4 h-4" />;
    case "video": return <PlayCircle className="w-4 h-4" />;
    case "blog": return <PenTool className="w-4 h-4" />;
    case "question": return <HelpCircle className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
};

const getIconStyle = (type: string) => {
  switch (type) {
    case "pdf": return "bg-red-50 text-red-500 border-red-100";
    case "video": return "bg-blue-50 text-blue-500 border-blue-100";
    case "blog": return "bg-purple-50 text-purple-500 border-purple-100";
    case "question": return "bg-amber-50 text-amber-600 border-amber-100";
    default: return "bg-gray-50 text-gray-500 border-gray-100";
  }
};

const getLink = (item: any) => {
  if (item.type === "blog") return `/blog/${item.id}`;
  if (item.type === "question") return `/question/${item.id}`; // Fixed: Removed slug
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

  // --- WIDGET DATA STATES ---
  const [materials, setMaterials] = useState<any[]>([]);
  const [materialFilter, setMaterialFilter] = useState("All");
  const [loadingMaterials, setLoadingMaterials] = useState(true);

  const [questions, setQuestions] = useState<any[]>([]);
  const [questionFilter, setQuestionFilter] = useState("All");
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  // 1. FETCH SEGMENTS (Dynamic Links)
  useEffect(() => {
    const fetchSegments = async () => {
      const { data } = await supabase.from("segments").select("id, title, slug").order("id");
      if (data) setSegments(data);
    };
    fetchSegments();
  }, []);

  // 2. FETCH MATERIALS (Fixed Query)
  useEffect(() => {
    const fetchMaterials = async () => {
      setLoadingMaterials(true);
      let query = supabase
        .from("resources")
        .select("id, title, type, content_url, created_at, segment_id") // REMOVED 'slug'
        .in("type", ["blog", "pdf", "video"])
        .order("created_at", { ascending: false })
        .limit(5);

      if (materialFilter !== "All") {
        const segId = segments.find(s => s.title === materialFilter)?.id;
        if (segId) query = query.eq("segment_id", segId);
      }

      const { data, error } = await query;
      if (data) setMaterials(data);
      if (error) console.error("Materials Error:", error);
      setLoadingMaterials(false);
    };

    // Only run if we have segments loaded or filter is All
    if (segments.length > 0 || materialFilter === "All") fetchMaterials();
  }, [materialFilter, segments]);

  // 3. FETCH QUESTIONS (Fixed Query)
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      let query = supabase
        .from("resources")
        .select("id, title, type, content_url, created_at, segment_id") // REMOVED 'slug'
        .eq("type", "question")
        .order("created_at", { ascending: false })
        .limit(5);

      if (questionFilter !== "All") {
        const segId = segments.find(s => s.title === questionFilter)?.id;
        if (segId) query = query.eq("segment_id", segId);
      }

      const { data, error } = await query;
      if (data) setQuestions(data);
      if (error) console.error("Questions Error:", error);
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
    <div className="space-y-6 sticky top-24">
      
      {/* 1. SEARCH WIDGET */}
      <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
        <form onSubmit={handleSearch} className="relative group">
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-slate-50 text-slate-900 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold placeholder:text-slate-400 outline-none transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
            <Search className="w-5 h-5" />
          </div>
        </form>
      </div>

      {/* 2. DYNAMIC QUICK ACCESS (Modern Grid) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm">
          <h3 className="font-black text-slate-700 text-[11px] uppercase tracking-widest flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-indigo-500" /> Explore Sections
          </h3>
        </div>
        <div className="p-2 grid grid-cols-2 gap-2">
          {segments.length > 0 ? segments.map((seg) => (
            <Link 
              key={seg.id} 
              href={`/resources/${seg.slug}`} 
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-sm transition-all group text-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                {seg.title.charAt(0)}
              </div>
              <span className="font-bold text-xs text-slate-600 group-hover:text-indigo-700 line-clamp-1">{seg.title}</span>
            </Link>
          )) : (
            <div className="col-span-2 p-4 text-center text-slate-400 text-xs">Loading...</div>
          )}
        </div>
      </div>

      {/* 3. LATEST MATERIALS (Polished Timeline) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <h3 className="font-black text-slate-700 text-[11px] uppercase tracking-widest flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" /> Materials
          </h3>
          <div className="relative">
             <select 
                value={materialFilter}
                onChange={(e) => setMaterialFilter(e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-slate-600 text-[10px] font-bold py-1 pl-2 pr-6 rounded-lg focus:outline-none focus:border-blue-400 hover:bg-slate-50 cursor-pointer"
             >
                <option value="All">All</option>
                {segments.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
             </select>
             <Filter className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"/>
          </div>
        </div>

        <div className="p-2">
          {loadingMaterials ? (
             <div className="space-y-3 p-2">
               {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse"></div>)}
             </div>
          ) : materials.length === 0 ? (
             <div className="py-8 px-4 text-center">
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-300"><FileText className="w-5 h-5"/></div>
                <p className="text-xs font-bold text-slate-400">No materials found.</p>
             </div>
          ) : (
             <div className="flex flex-col">
               {materials.map((item, i) => (
                 <Link 
                    key={item.id} 
                    href={getLink(item)} 
                    target={getTarget(item)}
                    className="flex gap-3 items-start p-3 rounded-xl hover:bg-slate-50 transition-all group relative overflow-hidden"
                 >
                    {/* Vertical Line Connector (Timeline effect) */}
                    {i !== materials.length - 1 && <div className="absolute left-[27px] top-10 bottom-[-10px] w-[2px] bg-slate-100 group-hover:bg-blue-100 transition-colors"></div>}
                    
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm shrink-0 z-10 ${getIconStyle(item.type)}`}>
                        {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-xs font-bold text-slate-700 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                            {item.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5"/> {new Date(item.created_at).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                            </span>
                            {/* Segment Tag */}
                            {materialFilter === "All" && item.segment_id && (
                                <span className="text-[9px] font-black text-blue-500 uppercase tracking-wide">
                                    {segments.find(s=>s.id===item.segment_id)?.title}
                                </span>
                            )}
                        </div>
                    </div>
                 </Link>
               ))}
             </div>
          )}
        </div>
        <Link href="/blog" className="block p-3 text-center text-[10px] font-black text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors border-t border-slate-100 uppercase tracking-widest">
            See All Library
        </Link>
      </div>

      {/* 4. QUESTION ARCHIVE (Polished) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <h3 className="font-black text-slate-700 text-[11px] uppercase tracking-widest flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-500" /> Questions
          </h3>
          <div className="relative">
             <select 
                value={questionFilter}
                onChange={(e) => setQuestionFilter(e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-slate-600 text-[10px] font-bold py-1 pl-2 pr-6 rounded-lg focus:outline-none focus:border-amber-400 hover:bg-slate-50 cursor-pointer"
             >
                <option value="All">All</option>
                {segments.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
             </select>
             <Filter className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"/>
          </div>
        </div>

        <div className="p-2">
          {loadingQuestions ? (
             <div className="space-y-3 p-2">
               {[1,2,3].map(i => <div key={i} className="h-10 bg-slate-50 rounded-lg animate-pulse"></div>)}
             </div>
          ) : questions.length === 0 ? (
             <div className="py-8 px-4 text-center">
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-300"><HelpCircle className="w-5 h-5"/></div>
                <p className="text-xs font-bold text-slate-400">No questions found.</p>
             </div>
          ) : (
             <div className="flex flex-col">
               {questions.map((item, i) => (
                 <Link 
                    key={item.id} 
                    href={getLink(item)} 
                    target={getTarget(item)}
                    className="flex gap-3 items-start p-3 rounded-xl hover:bg-amber-50/40 transition-all group relative overflow-hidden"
                 >
                    {/* Vertical Line */}
                    {i !== questions.length - 1 && <div className="absolute left-[27px] top-10 bottom-[-10px] w-[2px] bg-slate-100 group-hover:bg-amber-100 transition-colors"></div>}

                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border bg-amber-50 text-amber-600 border-amber-100 shadow-sm shrink-0 z-10 mt-0.5`}>
                        <HelpCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-xs font-bold text-slate-700 leading-snug group-hover:text-amber-700 transition-colors line-clamp-2">
                            {item.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5"/> {new Date(item.created_at).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                            </span>
                            {questionFilter === "All" && item.segment_id && (
                                <span className="text-[9px] font-black text-amber-600 uppercase tracking-wide">
                                    {segments.find(s=>s.id===item.segment_id)?.title}
                                </span>
                            )}
                        </div>
                    </div>
                 </Link>
               ))}
             </div>
          )}
        </div>
      </div>

      {/* 5. SOCIAL MEDIA (Preserved) */}
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