"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Search, MapPin, User, Phone, 
  MessageCircle, Star, X, GraduationCap, 
  ArrowRight, ChevronDown 
} from "lucide-react";

export default function FindTutorClient() {
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white pb-20 transition-colors duration-300">
      
      {/* === HERO HEADER === */}
      <div className="relative bg-slate-900 text-white pt-40 pb-32 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none -ml-20 -mb-20"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            <User className="w-3.5 h-3.5" /> Academic Mentorship
          </span>
          <h1 className="text-5xl md:text-8xl font-black mb-8 uppercase tracking-tighter leading-[0.9]">
            Find Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400">Expert Tutor</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            Browse verified mentors from top institutions to guide you through SSC, HSC, and Admission tests with excellence.
          </p>
        </div>
      </div>

      {/* === FILTER BAR (Floating) === */}
      <div className="max-w-6xl mx-auto px-6 -mt-14 relative z-20 mb-20">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-6 md:p-8 rounded-[2.5rem] shadow-2xl space-y-4 md:space-y-0 md:flex md:gap-4 items-center">
              
              <div className="relative flex-grow md:flex-[1.5]">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search name or subject..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black text-sm text-slate-700 dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all placeholder:font-medium placeholder:text-slate-400"
                  />
              </div>

              <div className="relative flex-1 min-w-[140px]">
                  <select 
                    value={selSegment} 
                    onChange={(e) => { setSelSegment(e.target.value); setSelGroup(""); setSelSubject(""); }}
                    className="w-full pl-6 pr-10 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-700 dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                  >
                      <option value="">All Levels</option>
                      {dbSegments.map(s => <option key={s.id} value={s.slug}>{s.title}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative flex-1 min-w-[140px]">
                  <select 
                    value={selGroup} 
                    onChange={(e) => { setSelGroup(e.target.value); setSelSubject(""); }}
                    disabled={!selSegment}
                    className="w-full pl-6 pr-10 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-700 dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <option value="">All Groups</option>
                      {filteredGroups.map(g => <option key={g.id} value={g.slug}>{g.title}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative flex-1 min-w-[140px]">
                  <select 
                    value={selSubject} 
                    onChange={(e) => setSelSubject(e.target.value)}
                    disabled={!selGroup}
                    className="w-full pl-6 pr-10 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-700 dark:text-white outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <option value="">All Subjects</option>
                      {filteredSubjects.map(s => <option key={s.id} value={s.slug}>{s.title}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {(selSegment || search) && (
                  <button onClick={clearFilters} className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 transition-colors" title="Clear Filters">
                      <X className="w-5 h-5 font-black" />
                  </button>
              )}
          </div>
      </div>

      {/* === TUTOR GRID === */}
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
             [1,2,3,4,5,6,7,8].map(i => <SkeletonCard key={i} />)
          ) : filteredTutors.length === 0 ? (
             <div className="col-span-full py-32 text-center bg-white dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-inner">
                 <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-300 dark:text-slate-600 border border-slate-100 dark:border-slate-700">
                    <Search className="w-10 h-10"/>
                 </div>
                 <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">No tutors found</h3>
                 <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-md mx-auto font-medium">Try adjusting your search criteria or explore other categories to discover more mentors.</p>
                 <button onClick={clearFilters} className="mt-10 px-10 py-5 bg-slate-900 dark:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-600/20">Clear All Filters</button>
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
    const displaySubjects = subjects.map((s: string) => s.split(' > ').pop());

    return (
        <div 
            onClick={onViewProfile}
            className="group bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-2xl dark:hover:shadow-indigo-900/10 hover:-translate-y-3 transition-all duration-500 flex flex-col h-full cursor-pointer relative overflow-hidden"
        >
            {tutor.is_featured && (
                <div className="absolute top-0 right-0 bg-gradient-to-bl from-amber-400 to-orange-400 text-white text-[9px] font-black px-4 py-2 rounded-bl-2xl shadow-lg z-10 flex items-center gap-1.5 uppercase tracking-wider transition-transform">
                    <Star className="w-3.5 h-3.5 fill-white" /> STAR
                </div>
            )}
            <div className="flex items-center gap-5 mb-8">
                <div className="w-20 h-20 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center text-3xl font-black border-2 border-white dark:border-slate-700 shadow-xl overflow-hidden shrink-0 group-hover:scale-110 transition-transform duration-500">
                     {tutor.full_name?.[0]?.toUpperCase() || <User className="w-10 h-10 opacity-30"/>}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 uppercase tracking-tight">
                        {tutor.full_name}
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {tutor.city ? tutor.city.split(',')[0] : "Academic Hub"}
                    </p>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-8 h-20 content-start overflow-hidden relative">
                {displaySubjects.slice(0, 4).map((sub: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-black rounded-lg border border-slate-100 dark:border-slate-800 group-hover:border-indigo-500/30 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-300 uppercase tracking-widest">
                        {sub}
                    </span>
                ))}
                {displaySubjects.length > 4 && (
                    <span className="px-3 py-1.5 text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">+{displaySubjects.length - 4} More</span>
                )}
                <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-white dark:from-slate-900 to-transparent"></div>
            </div>
            <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center mt-auto">
                <div className="text-[9px] font-black text-slate-400 dark:text-slate-500 flex items-center gap-2 uppercase tracking-widest group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                     <GraduationCap className="w-4 h-4 text-indigo-500" /> 
                     <span className="truncate max-w-[140px]">{tutor.institution || "Verified Educator"}</span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 h-80 animate-pulse border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex gap-4 mb-8">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl"></div>
                <div className="flex-1 space-y-3 py-2">
                    <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-lg w-3/4"></div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/2"></div>
                </div>
            </div>
            <div className="space-y-3">
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-full"></div>
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-full"></div>
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-2/3"></div>
            </div>
        </div>
    )
}

function TutorModal({ tutor, onClose }: { tutor: any, onClose: () => void }) {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    let subjects: string[] = [];
    try { subjects = Array.isArray(tutor.subjects) ? tutor.subjects : JSON.parse(tutor.subjects || "[]"); } catch { }
    const processedSubjects = subjects.map(s => {
        const parts = s.split(' > ');
        return { 
            full: s, 
            segment: parts.length > 1 ? parts[0] : "General", 
            subject: parts[parts.length - 1] 
        };
    });

    return (
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-slate-900/80 backdrop-blur-xl p-0 md:p-6 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-950 w-full md:max-w-3xl md:rounded-[3rem] rounded-t-[3rem] shadow-2xl flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-20 duration-500 overflow-hidden border border-slate-100/10">
                <div className="relative bg-slate-900 pt-16 pb-12 px-8 overflow-hidden shrink-0">
                    <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all backdrop-blur-xl z-20 group border border-white/5">
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    </button>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none -ml-10 -mb-10"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-8">
                        <div className="w-32 h-32 rounded-[2rem] bg-white dark:bg-slate-800 p-1.5 shadow-2xl shrink-0 group">
                            <div className="w-full h-full rounded-[1.8rem] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white flex items-center justify-center text-5xl font-black shadow-inner">
                                {tutor.full_name?.[0]?.toUpperCase()}
                            </div>
                        </div>
                        <div className="text-center md:text-left text-white mb-2">
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">{tutor.full_name}</h2>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <span className="px-4 py-2 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-sm border border-white/5 flex items-center gap-2">
                                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> {tutor.institution || "Verified Mentor"}
                                </span>
                                {tutor.city && (
                                    <span className="px-4 py-2 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-sm border border-white/5 flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-amber-500" /> {tutor.city}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 bg-slate-50 dark:bg-slate-950">
                    <section>
                        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">About Mentorship</h4>
                        <div className="text-slate-600 dark:text-slate-400 text-base leading-relaxed whitespace-pre-wrap bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                            {tutor.bio || "This tutor is a verified expert dedicated to student success."}
                        </div>
                    </section>
                    <section>
                        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-3">
                            Teaching Specialties <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-[10px] font-black">{subjects.length}</span>
                        </h4>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-wrap gap-4 transition-colors">
                            {processedSubjects.length > 0 ? processedSubjects.map((item, i) => (
                                <div key={i} className="flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-2 pr-5 gap-3 hover:border-indigo-500/50 transition-all duration-300 group cursor-default shadow-sm">
                                    <span className="px-3 py-1.5 text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 rounded-xl shadow-sm uppercase tracking-widest border border-slate-100 dark:border-slate-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        {item.segment}
                                    </span>
                                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">{item.subject}</span>
                                </div>
                            )) : <span className="text-slate-400 dark:text-slate-600 text-sm italic font-medium">Academic curriculum pending details.</span>}
                        </div>
                    </section>
                </div>
                <div className="p-8 bg-white dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-6 shrink-0 transition-colors">
                    {tutor.phone && (
                        <a href={`tel:${tutor.phone}`} className="flex-1 flex items-center justify-center gap-3 py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-950/20 dark:shadow-white/5">
                            <Phone className="w-4 h-4" /> Call Mentor
                        </a>
                    )}
                    {tutor.whatsapp ? (
                        <a href={`https://wa.me/${tutor.whatsapp}`} target="_blank" className="flex-1 flex items-center justify-center gap-3 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 border-b-4 border-emerald-700">
                            <MessageCircle className="w-5 h-5" /> WhatsApp
                        </a>
                    ) : (
                        <button disabled className="flex-1 flex items-center justify-center gap-3 py-5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-not-allowed">
                             Secure Contact
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
