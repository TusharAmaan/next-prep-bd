"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function EbooksPage() {
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>(["All"]);

  useEffect(() => {
    fetchEbooks();
  }, []);

  async function fetchEbooks() {
    setLoading(true);
    const { data } = await supabase
      .from("ebooks")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setEbooks(data);
      // Extract unique categories for the filter
      const uniqueCats = Array.from(new Set(data.map((item: any) => item.category))).filter(Boolean);
      setCategories(["All", ...uniqueCats]);
    }
    setLoading(false);
  }

  // Filter Logic
  const filteredBooks = ebooks.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          book.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pt-24 pb-20">
      
      {/* --- HEADER SECTION --- */}
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Digital <span className="text-blue-600">Library</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Access our curated collection of notes, textbooks, and guides completely free.
        </p>
      </div>

      {/* --- SEARCH & FILTER BAR --- */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-24 z-10">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96 group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </span>
                <input 
                    type="text" 
                    placeholder="Search by title or author..." 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                {categories.map((cat) => (
                    <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                            selectedCategory === cat 
                            ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* --- BOOK GRID --- */}
      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {[1,2,3,4].map(i => (
                    <div key={i} className="animate-pulse bg-white p-4 rounded-2xl h-80 border border-slate-200">
                        <div className="w-full h-48 bg-slate-200 rounded-xl mb-4"></div>
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        ) : filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {filteredBooks.map((book) => (
                    <div key={book.id} className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                        
                        {/* COVER IMAGE */}
                        <div className="relative w-full h-52 bg-slate-100 rounded-xl overflow-hidden mb-5 shadow-inner border border-slate-100">
                            {book.cover_url ? (
                                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                    <span className="text-4xl mb-2">📚</span>
                                    <span className="text-xs font-bold uppercase tracking-widest">No Cover</span>
                                </div>
                            )}
                            <div className="absolute top-3 left-3">
                                <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide">
                                    {book.category}
                                </span>
                            </div>
                        </div>

                        {/* CONTENT */}
                        <div className="flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-slate-900 mb-1 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                                {book.title}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium mb-4">{book.author}</p>
                            
                            {/* Tags */}
                            {book.tags && book.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-5">
                                    {book.tags.slice(0, 2).map((tag: string, i: number) => (
                                        <span key={i} className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-100">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Action Button */}
                            <div className="mt-auto pt-4 border-t border-slate-50">
                                <a 
                                    href={book.pdf_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block w-full py-3 bg-slate-900 hover:bg-blue-600 text-white text-center text-sm font-bold rounded-xl transition-all shadow-lg shadow-slate-200 hover:shadow-blue-200 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    Download PDF
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            /* EMPTY STATE */
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No books found</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                    We couldn't find any books matching "<span className="font-bold text-slate-800">{searchTerm}</span>". Try adjusting your filters.
                </p>
                <button 
                    onClick={() => {setSearchTerm(""); setSelectedCategory("All");}}
                    className="mt-6 text-blue-600 font-bold hover:underline"
                >
                    Clear all filters
                </button>
            </div>
        )}
      </div>

    </div>
  );
}