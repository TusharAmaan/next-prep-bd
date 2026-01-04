"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Search, MapPin, BookOpen, User, Phone, MessageCircle, Star } from "lucide-react";
import Link from "next/link";

export default function FindTutorPage() {
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSubject, setActiveSubject] = useState("All");

  // Fetch only ACTIVE and FEATURED tutors
  useEffect(() => {
    const fetchTutors = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'tutor')
        .eq('status', 'active') 
        .eq('is_featured', true) // Only show admins-approved featured tutors
        .order('created_at', { ascending: false });

      if (data) setTutors(data);
      setLoading(false);
    };
    fetchTutors();
  }, []);

  // Filter Logic
  const filteredTutors = tutors.filter(t => {
    const matchSearch = t.full_name?.toLowerCase().includes(search.toLowerCase()) || 
                        t.subjects?.toString().toLowerCase().includes(search.toLowerCase());
    const matchSubject = activeSubject === "All" || t.subjects?.includes(activeSubject); // Simplified subject match
    return matchSearch && matchSubject;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-4 font-sans text-slate-900">
      
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
          Find Your Perfect <span className="text-indigo-600">Mentor</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Browse our verified top-tier tutors ready to help you excel in your exams.
        </p>

        {/* SEARCH BAR */}
        <div className="mt-8 max-w-xl mx-auto relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <Search className="w-5 h-5" />
            </div>
            <input 
                type="text"
                placeholder="Search by name, subject (e.g. Math, Physics)..."
                className="w-full bg-white border-2 border-slate-200 rounded-full py-4 pl-12 pr-6 text-slate-700 font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      {/* TUTOR GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {loading ? (
            // SKELETON LOADERS
            [1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-80 animate-pulse">
                    <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-slate-100 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2 mx-auto"></div>
                </div>
            ))
        ) : filteredTutors.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-400">
                <p>No tutors found matching your criteria.</p>
            </div>
        ) : (
            filteredTutors.map((tutor) => (
                <TutorCard key={tutor.id} tutor={tutor} />
            ))
        )}

      </div>
    </div>
  );
}

// --- REUSABLE TUTOR CARD COMPONENT ---
function TutorCard({ tutor }: { tutor: any }) {
    const [showContact, setShowContact] = useState(false);

    // Parse subjects safely
    const subjects = Array.isArray(tutor.subjects) 
        ? tutor.subjects 
        : typeof tutor.subjects === 'string' && tutor.subjects.startsWith('[')
            ? JSON.parse(tutor.subjects)
            : [tutor.expertise || "General Science"];

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
            
            {/* FEATURED BADGE */}
            {tutor.is_featured && (
                <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Top Rated
                </div>
            )}

            <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 bg-slate-50 text-slate-800 rounded-full flex items-center justify-center text-3xl font-black mb-4 border-4 border-white shadow-lg group-hover:scale-105 transition-transform">
                    {tutor.full_name?.[0]?.toUpperCase() || <User className="w-10 h-10 text-slate-300" />}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{tutor.full_name}</h3>
                <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> {tutor.institution || "Professional Tutor"}
                </p>
                {tutor.city && (
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {tutor.city}
                    </p>
                )}
            </div>

            {/* TAGS */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
                {subjects.slice(0, 3).map((sub: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full border border-indigo-100">
                        {sub}
                    </span>
                ))}
                {subjects.length > 3 && (
                    <span className="px-2 py-1 text-xs text-slate-400 font-medium">+{subjects.length - 3} more</span>
                )}
            </div>

            {/* BIO SNIPPET */}
            <p className="text-sm text-slate-500 leading-relaxed text-center mb-6 line-clamp-2 flex-grow">
                {tutor.bio || "Passionate about teaching and helping students achieve their academic goals."}
            </p>

            {/* ACTION AREA */}
            <div className="mt-auto pt-6 border-t border-slate-50">
                {!showContact ? (
                    <button 
                        onClick={() => setShowContact(true)}
                        className="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-slate-200 hover:shadow-indigo-200 active:scale-95"
                    >
                        Contact Tutor
                    </button>
                ) : (
                    <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2">
                        {tutor.phone && (
                            <a href={`tel:${tutor.phone}`} className="flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl font-bold text-sm transition-colors border border-green-200">
                                <Phone className="w-4 h-4" /> Call
                            </a>
                        )}
                        {tutor.whatsapp ? (
                            <a href={`https://wa.me/${tutor.whatsapp}`} target="_blank" className="flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-bold text-sm transition-colors border border-emerald-200">
                                <MessageCircle className="w-4 h-4" /> WhatsApp
                            </a>
                        ) : (
                            <div className="flex items-center justify-center py-3 bg-slate-50 text-slate-400 rounded-xl font-bold text-xs border border-slate-100">
                                No WhatsApp
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}