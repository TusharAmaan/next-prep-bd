"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function EbooksPage() {
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "SSC", "HSC", "Admission", "Job Prep", "General"];

  // Fetch eBooks on load
  useEffect(() => {
    const fetchEbooks = async () => {
      let query = supabase.from("ebooks").select("*").order('created_at', { ascending: false });
      
      if (activeTab !== "All") {
        query = query.eq("category", activeTab);
      }
      
      const { data, error } = await query;
      if (!error) setEbooks(data || []);
      setLoading(false);
    };

    fetchEbooks();
  }, [activeTab]);

  // Client-side search filtering
  const filteredEbooks = ebooks.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans py-12 px-6">
      
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Digital <span className="text-blue-600">Library</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Access hundreds of free educational eBooks, notes, and guides for your preparation.
        </p>

        {/* SEARCH BAR */}
        <div className="mt-8 max-w-lg mx-auto relative">
          <input 
            type="text" 
            placeholder="Search by book title or author..." 
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none shadow-sm transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="max-w-7xl mx-auto mb-10 overflow-x-auto">
        <div className="flex justify-center min-w-max gap-2 px-2">
            {categories.map((cat) => (
                <button 
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`px-6 py-2 rounded-full font-bold text-sm transition-all
                        ${activeTab === cat 
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105" 
                            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                        }`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {/* EBOOKS GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {loading ? (
             // SKELETON LOADING STATE
             [...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl h-80"></div>
             ))
        ) : filteredEbooks.length > 0 ? (
            filteredEbooks.map((book) => (
                <div key={book.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 group flex flex-col">
                    {/* BOOK COVER */}
                    <div className="h-48 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                        {book.cover_url ? (
                            <img src={book.cover_url} alt={book.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                            <div className="text-gray-400 text-xs font-bold uppercase tracking-wider flex flex-col items-center">
                                <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                No Cover
                            </div>
                        )}
                        {/* BADGE */}
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                            {book.category}
                        </div>
                    </div>

                    {/* DETAILS */}
                    <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-gray-900 leading-tight mb-1 line-clamp-2" title={book.title}>{book.title}</h3>
                        <p className="text-xs text-gray-500 mb-4">{book.author || "Unknown Author"}</p>
                        
                        <a 
                            href={book.pdf_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="mt-auto w-full block text-center bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white py-2 rounded-lg text-xs font-bold transition-colors"
                        >
                            Download / Read
                        </a>
                    </div>
                </div>
            ))
        ) : (
            <div className="col-span-full text-center py-20">
                <p className="text-gray-400 text-lg">No eBooks found in this category.</p>
            </div>
        )}
      </div>

    </div>
  );
}