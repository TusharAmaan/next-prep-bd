"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Search, MapPin, BookOpen, User, Phone, 
  MessageCircle, Star, X, GraduationCap, 
  Briefcase, Mail, ArrowRight, CheckCircle2 
} from "lucide-react";

export default function FindTutorPage() {
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSubject, setActiveSubject] = useState("All");
  const [selectedTutor, setSelectedTutor] = useState<any | null>(null);

  // Quick Filter Tags
  const SUBJECT_FILTERS = ["All", "Math", "English", "Physics", "Chemistry", "Biology", "ICT"];

  useEffect(() => {
    const fetchTutors = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'tutor')
        .eq('status', 'active') 
        .eq('is_featured', true) // Filter by featured/approved
        .order('created_at', { ascending: false });

      if (data) setTutors(data);
      setLoading(false);
    };
    fetchTutors();
  }, []);

  // Filter Logic
  const filteredTutors = tutors.filter(t => {
    // Safety check for subject parsing
    let subjects = [];
    try {
        subjects = Array.isArray(t.subjects) ? t.subjects : JSON.parse(t.subjects || "[]");
    } catch (e) { subjects = []; }

    const matchSearch = t.full_name?.toLowerCase().includes(search.toLowerCase()) || 
                        subjects.some((s: string) => s.toLowerCase().includes(search.toLowerCase()));
    
    const matchSubject = activeSubject === "All" || subjects.includes(activeSubject);
    
    return matchSearch && matchSubject;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* === HERO HEADER === */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 text-white pt-32 pb-24 px-6 rounded-b-[3rem] shadow-xl overflow-hidden">
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl translate-x-1/4 translate-y-1/4"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            Master Your Studies with <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400">Expert Mentors</span>
          </h1>
          <p className="text-indigo-100 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            Connect with verified top-tier tutors from prestigious institutions ready to guide you to academic excellence.
          </p>

          {/* SEARCH BAR */}
          <div className="mt-10 max-w-xl mx-auto relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-300 group-focus-within:text-indigo-600 transition-colors z-10">
                  <Search className="w-6 h-6" />
              </div>
              <input 
                  type="text"
                  placeholder="Search by name or subject..."
                  className="w-full bg-white/95 backdrop-blur-sm border-0 rounded-full py-4 pl-14 pr-6 text-slate-800 font-bold text-lg placeholder:text-slate-400 shadow-2xl focus:ring-4 focus:ring-indigo-400/50 transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
              />
          </div>

          {/* QUICK TAGS */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
              {SUBJECT_FILTERS.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setActiveSubject(sub)}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${
                        activeSubject === sub 
                        ? 'bg-white text-indigo-900 border-white shadow-lg scale-105' 
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                    }`}
                  >
                    {sub}
                  </button>
              ))}
          </div>
        </div>
      </div>

      {/* === TUTOR GRID === */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {loading ? (
             [1,2,3,4].map(i => <SkeletonCard key={i} />)
          ) : filteredTutors.length === 0 ? (
             <div className="col-span-full bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-slate-300"/>
                 </div>
                 <h3 className="text-xl font-bold text-slate-700">No tutors found</h3>
                 <p className="text-slate-400">Try adjusting your search filters.</p>
             </div>
          ) : (
             filteredTutors.map((tutor) => (
                 <TutorCard 
                    key={tutor.id} 
                    tutor={tutor} 
                    onViewProfile={() => setSelectedTutor(tutor)} 
                 />
             ))
          )}

        </div>
      </div>

      {/* === MODAL === */}
      {selectedTutor && (
          <TutorModal tutor={selectedTutor} onClose={() => setSelectedTutor(null)} />
      )}
    </div>
  );
}

// --- SUB-COMPONENT: TUTOR CARD ---
function TutorCard({ tutor, onViewProfile }: { tutor: any, onViewProfile: () => void }) {
    
    // Parse Helper
    const parseArray = (data: any) => {
        if (Array.isArray(data)) return data;
        if (typeof data === 'string' && data.startsWith('[')) {
            try { return JSON.parse(data); } catch { return []; }
        }
        return data ? [data] : [];
    };

    const subjects = parseArray(tutor.subjects);

    return (
        <div 
            onClick={onViewProfile}
            className="group bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer relative overflow-hidden"
        >
            {/* Featured Badge */}
            {tutor.is_featured && (
                <div className="absolute top-0 right-0 bg-gradient-to-bl from-amber-400 to-orange-400 text-white text-[10px] font-black px-3 py-1.5 rounded-bl-xl shadow-sm z-10 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" /> STAR TUTOR
                </div>
            )}

            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center text-2xl font-black border-2 border-white shadow-md overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                     {tutor.full_name?.[0]?.toUpperCase() || <User className="w-8 h-8 opacity-50"/>}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                        {tutor.full_name}
                    </h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-indigo-400" /> {tutor.city || "Online"}
                    </p>
                </div>
            </div>

            {/* Subjects Pill */}
            <div className="flex flex-wrap gap-1.5 mb-4">
                {subjects.slice(0, 3).map((sub: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-md border border-slate-100 group-hover:border-indigo-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        {sub}
                    </span>
                ))}
                {subjects.length > 3 && (
                    <span className="px-2 py-1 text-[10px] font-bold text-slate-400">+{subjects.length - 3}</span>
                )}
            </div>

            {/* Snippet */}
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-6 flex-grow">
                {tutor.bio || "This tutor has not added a bio yet, but is verified and ready to teach."}
            </p>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-50 flex justify-between items-center mt-auto">
                <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                     <GraduationCap className="w-3.5 h-3.5" /> 
                     <span className="truncate max-w-[100px]">{tutor.institution || "Verified"}</span>
                </div>
                <button className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

// --- SUB-COMPONENT: SKELETON ---
function SkeletonCard() {
    return (
        <div className="bg-white rounded-3xl p-6 h-72 animate-pulse border border-slate-100 shadow-sm">
            <div className="flex gap-4 mb-6">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl"></div>
                <div className="flex-1 space-y-2 py-2">
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-3 bg-slate-100 rounded w-full"></div>
                <div className="h-3 bg-slate-100 rounded w-full"></div>
                <div className="h-3 bg-slate-100 rounded w-2/3"></div>
            </div>
        </div>
    )
}

// --- SUB-COMPONENT: TUTOR MODAL (POPUP) ---
function TutorModal({ tutor, onClose }: { tutor: any, onClose: () => void }) {
    // Prevent background scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const parseArray = (data: any) => {
        if (Array.isArray(data)) return data;
        if (typeof data === 'string' && data.startsWith('[')) {
            try { return JSON.parse(data); } catch { return []; }
        }
        return data ? [data] : [];
    };

    const segments = parseArray(tutor.interested_segments);
    const subjects = parseArray(tutor.subjects);

    return (
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-200">
            
            {/* Modal Container */}
            <div className="bg-white w-full md:max-w-2xl md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 duration-300">
                
                {/* Header (Sticky) */}
                <div className="relative bg-gradient-to-r from-indigo-600 to-violet-600 p-6 md:rounded-t-3xl shrink-0">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors backdrop-blur-md"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pt-4">
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-white p-1 shadow-lg shrink-0">
                            <div className="w-full h-full rounded-2xl bg-slate-100 text-indigo-600 flex items-center justify-center text-4xl font-black">
                                {tutor.full_name?.[0]?.toUpperCase()}
                            </div>
                        </div>
                        <div className="text-center md:text-left text-white pb-2">
                            <h2 className="text-2xl md:text-3xl font-black">{tutor.full_name}</h2>
                            <p className="text-indigo-100 font-medium flex items-center justify-center md:justify-start gap-2 mt-1">
                                <GraduationCap className="w-4 h-4" /> {tutor.institution || "Verified Tutor"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50 custom-scrollbar">
                    
                    {/* Bio */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <User className="w-4 h-4" /> About Tutor
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                            {tutor.bio || "No bio available."}
                        </p>
                    </div>

                    {/* Expertise Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {/* Subjects */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" /> Subjects
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {subjects.length > 0 ? subjects.map((sub: string, i: number) => (
                                    <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                                        {sub}
                                    </span>
                                )) : <span className="text-slate-400 text-sm italic">Not specified</span>}
                            </div>
                        </div>

                        {/* Segments */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Briefcase className="w-4 h-4" /> Teaching
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {segments.length > 0 ? segments.map((seg: string, i: number) => (
                                    <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3"/> {seg}
                                    </span>
                                )) : <span className="text-slate-400 text-sm italic">Not specified</span>}
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-6">
                         <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Location</p>
                            <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                                <MapPin className="w-4 h-4 text-indigo-500"/> {tutor.city || "Online / Remote"}
                            </p>
                         </div>
                         <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                            <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                                <Mail className="w-4 h-4 text-indigo-500"/> {tutor.email}
                            </p>
                         </div>
                    </div>
                </div>

                {/* Footer Action Bar (Sticky Bottom) */}
                <div className="p-4 bg-white border-t border-slate-100 flex gap-3 shrink-0 rounded-b-3xl">
                    {tutor.phone && (
                        <a href={`tel:${tutor.phone}`} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95">
                            <Phone className="w-4 h-4" /> Call Now
                        </a>
                    )}
                    {tutor.whatsapp ? (
                        <a href={`https://wa.me/${tutor.whatsapp}`} target="_blank" className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-200 active:scale-95">
                            <MessageCircle className="w-5 h-5" /> WhatsApp
                        </a>
                    ) : (
                        <button disabled className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-100 text-slate-400 rounded-xl font-bold cursor-not-allowed">
                             No WhatsApp
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}