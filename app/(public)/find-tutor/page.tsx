"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Search, MapPin, BookOpen, User, Phone, 
  MessageCircle, Star, X, GraduationCap, 
  Briefcase, Mail, ArrowRight, ChevronDown, CheckCircle2 
} from "lucide-react";

export default function FindTutorPage() {
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Reference Data
  const [dbSegments, setDbSegments] = useState<any[]>([]);
  const [dbGroups, setDbGroups] = useState<any[]>([]);
  const [dbSubjects, setDbSubjects] = useState<any[]>([]);

  // Filter States
  const [search, setSearch] = useState("");
  const [selSegment, setSelSegment] = useState("");
  const [selGroup, setSelGroup] = useState("");
  const [selSubject, setSelSubject] = useState("");
  
  const [selectedTutor, setSelectedTutor] = useState<any | null>(null);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const [profiles, segments, groups, subjects] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'tutor').eq('status', 'active').eq('is_featured', true).order('created_at', { ascending: false }),
        supabase.from('segments').select('id, title, slug'),
        supabase.from('groups').select('id, title, slug, segment_id'),
        supabase.from('subjects').select('id, title, slug, group_id')
      ]);

      if (profiles.data) setTutors(profiles.data);
      if (segments.data) setDbSegments(segments.data);
      if (groups.data) setDbGroups(groups.data);
      if (subjects.data) setDbSubjects(subjects.data);
      
      setLoading(false);
    };
    fetchData();
  }, []);

  // --- 2. FILTER LOGIC ---
  const filteredTutors = tutors.filter(t => {
    let subjects: string[] = [];
    try {
        subjects = Array.isArray(t.subjects) ? t.subjects : JSON.parse(t.subjects || "[]");
    } catch { subjects = []; }

    // Text Search
    const matchSearch = !search || 
        t.full_name?.toLowerCase().includes(search.toLowerCase()) || 
        subjects.some(s => s.toLowerCase().includes(search.toLowerCase()));

    // Hierarchy Filter
    let filterPrefix = "";
    if (selSegment) {
        const segTitle = dbSegments.find(s => s.slug === selSegment)?.title;
        filterPrefix += segTitle;
        if (selGroup) {
            const grpTitle = dbGroups.find(g => g.slug === selGroup)?.title;
            filterPrefix += ` > ${grpTitle}`;
            if (selSubject) {
                const subTitle = dbSubjects.find(s => s.slug === selSubject)?.title;
                filterPrefix += ` > ${subTitle}`;
            }
        }
    }

    const matchFilter = !filterPrefix || subjects.some(sub => sub.startsWith(filterPrefix));
    return matchSearch && matchFilter;
  });

  // --- 3. DYNAMIC DROPDOWN OPTIONS ---
  const filteredGroups = selSegment 
    ? dbGroups.filter(g => g.segment_id === dbSegments.find(s => s.slug === selSegment)?.id) 
    : [];
  
  const filteredSubjects = selGroup
    ? dbSubjects.filter(s => s.group_id === dbGroups.find(g => g.slug === selGroup)?.id)
    : [];

  const clearFilters = () => {
      setSelSegment(""); setSelGroup(""); setSelSubject(""); setSearch("");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* === HERO HEADER === */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 text-white pt-32 pb-32 px-6 rounded-b-[3rem] shadow-2xl overflow-hidden mb-12">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            Find Your Perfect <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400">Expert Tutor</span>
          </h1>
          <p className="text-indigo-100 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed opacity-90">
            Browse verified mentors from top institutions to guide you through SSC, HSC, and Admission tests.
          </p>
        </div>
      </div>

      {/* === FILTER BAR (Floating) === */}
      <div className="max-w-6xl mx-auto px-4 -mt-24 relative z-20 mb-12">
          <div className="bg-white/90 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-xl space-y-4 md:space-y-0 md:flex md:gap-4 items-center">
              
              <div className="relative flex-grow md:flex-[1.5]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search name or subject..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:font-normal"
                  />
              </div>

              <div className="relative flex-1 min-w-[140px]">
                  <select 
                    value={selSegment} 
                    onChange={(e) => { setSelSegment(e.target.value); setSelGroup(""); setSelSubject(""); }}
                    className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                  >
                      <option value="">All Levels</option>
                      {dbSegments.map(s => <option key={s.id} value={s.slug}>{s.title}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative flex-1 min-w-[140px]">
                  <select 
                    value={selGroup} 
                    onChange={(e) => { setSelGroup(e.target.value); setSelSubject(""); }}
                    disabled={!selSegment}
                    className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <option value="">All Groups</option>
                      {filteredGroups.map(g => <option key={g.id} value={g.slug}>{g.title}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative flex-1 min-w-[140px]">
                  <select 
                    value={selSubject} 
                    onChange={(e) => setSelSubject(e.target.value)}
                    disabled={!selGroup}
                    className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <option value="">All Subjects</option>
                      {filteredSubjects.map(s => <option key={s.id} value={s.slug}>{s.title}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {(selSegment || search) && (
                  <button onClick={clearFilters} className="p-3.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Clear Filters">
                      <X className="w-5 h-5" />
                  </button>
              )}
          </div>
      </div>

      {/* === TUTOR GRID === */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
             [1,2,3,4].map(i => <SkeletonCard key={i} />)
          ) : filteredTutors.length === 0 ? (
             <div className="col-span-full py-20 text-center">
                 <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <Search className="w-10 h-10"/>
                 </div>
                 <h3 className="text-2xl font-bold text-slate-800">No tutors found</h3>
                 <p className="text-slate-500 mt-2">Try adjusting your filters to see more results.</p>
                 <button onClick={clearFilters} className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">Clear All Filters</button>
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

      {/* === POPUP MODAL === */}
      {selectedTutor && (
          <TutorModal tutor={selectedTutor} onClose={() => setSelectedTutor(null)} />
      )}
    </div>
  );
}

// --- CARD COMPONENT ---
function TutorCard({ tutor, onViewProfile }: { tutor: any, onViewProfile: () => void }) {
    
    let subjects = [];
    try {
        subjects = Array.isArray(tutor.subjects) ? tutor.subjects : JSON.parse(tutor.subjects || "[]");
    } catch { subjects = []; }

    // Simplify subject string for the card: just show Subject name
    const displaySubjects = subjects.map((s: string) => s.split(' > ').pop());

    return (
        <div 
            onClick={onViewProfile}
            className="group bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer relative overflow-hidden"
        >
            {/* Featured Badge */}
            {tutor.is_featured && (
                <div className="absolute top-0 right-0 bg-gradient-to-bl from-amber-400 to-orange-400 text-white text-[10px] font-black px-3 py-1.5 rounded-bl-xl shadow-sm z-10 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" /> STAR
                </div>
            )}

            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center text-2xl font-black border-2 border-white shadow-md overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                     {tutor.full_name?.[0]?.toUpperCase() || <User className="w-8 h-8 opacity-50"/>}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {tutor.full_name}
                    </h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-indigo-400" /> {tutor.city ? tutor.city.split(',')[0] : "Online"}
                    </p>
                </div>
            </div>

            {/* Subjects Chips */}
            <div className="flex flex-wrap gap-1.5 mb-4 h-16 content-start overflow-hidden relative">
                {displaySubjects.slice(0, 4).map((sub: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-md border border-slate-100 group-hover:border-indigo-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        {sub}
                    </span>
                ))}
                {displaySubjects.length > 4 && (
                    <span className="px-2 py-1 text-[10px] font-bold text-slate-400">+{displaySubjects.length - 4}</span>
                )}
                <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-white to-transparent"></div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-50 flex justify-between items-center mt-auto">
                <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                     <GraduationCap className="w-3.5 h-3.5" /> 
                     <span className="truncate max-w-[120px]">{tutor.institution || "Verified Tutor"}</span>
                </div>
                <button className="w-8 h-8 rounded-full bg-slate-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

// --- SKELETON LOADER ---
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

// --- MODAL COMPONENT (UPDATED EXPERTISE VIEW) ---
function TutorModal({ tutor, onClose }: { tutor: any, onClose: () => void }) {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    let subjects: string[] = [];
    try { subjects = Array.isArray(tutor.subjects) ? tutor.subjects : JSON.parse(tutor.subjects || "[]"); } catch { }

    // REFINED PARSING LOGIC: Extract Segment (Start) and Subject (End), ignoring Group (Middle).
    const processedSubjects = subjects.map(s => {
        const parts = s.split(' > ');
        // parts[0] is Segment, last element is Subject. Ignore anything in between.
        return { 
            full: s, 
            segment: parts.length > 1 ? parts[0] : "General", 
            subject: parts[parts.length - 1] 
        };
    });

    return (
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full md:max-w-2xl md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 duration-300 overflow-hidden">
                
                {/* Header */}
                <div className="relative bg-slate-900 p-6 md:p-8 shrink-0">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md z-10"><X className="w-5 h-5" /></button>
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-400 via-purple-500 to-transparent"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6">
                        <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-xl shrink-0">
                            <div className="w-full h-full rounded-2xl bg-slate-50 text-slate-900 flex items-center justify-center text-3xl font-black">
                                {tutor.full_name?.[0]?.toUpperCase()}
                            </div>
                        </div>
                        <div className="text-center md:text-left text-white">
                            <h2 className="text-2xl md:text-3xl font-bold">{tutor.full_name}</h2>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10 flex items-center gap-1">
                                    <GraduationCap className="w-3 h-3" /> {tutor.institution || "Verified Tutor"}
                                </span>
                                {tutor.city && (
                                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {tutor.city}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-slate-50 custom-scrollbar">
                    
                    {/* About */}
                    <section>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">About Tutor</h4>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            {tutor.bio || "No biography provided."}
                        </p>
                    </section>

                    {/* UPDATED EXPERTISE SECTION */}
                    <section>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            Teaching Expertise <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px]">{subjects.length}</span>
                        </h4>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2">
                            {processedSubjects.length > 0 ? processedSubjects.map((item, i) => (
                                <div key={i} className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm p-1 pr-3 gap-2 hover:border-indigo-300 transition-all cursor-default">
                                    <span className="px-2 py-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 rounded uppercase tracking-wider">
                                        {item.segment}
                                    </span>
                                    <span className="text-xs font-bold text-slate-700">{item.subject}</span>
                                </div>
                            )) : <span className="text-slate-400 text-sm italic">No subjects listed.</span>}
                        </div>
                    </section>

                    {/* Academic Records */}
                    {tutor.academic_records && tutor.academic_records.length > 0 && (
                        <section>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Academic Background</h4>
                            <div className="grid gap-3">
                                {tutor.academic_records.map((rec: any, i: number) => (
                                    <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                            <BookOpen className="w-5 h-5"/>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{rec.degree}</p>
                                            <p className="text-xs text-slate-500 font-medium">{rec.institute}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-white border-t border-slate-100 flex gap-3 shrink-0">
                    {tutor.phone && (
                        <a href={`tel:${tutor.phone}`} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95">
                            <Phone className="w-4 h-4" /> Call
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