"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function EbooksPage() {
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "SSC", "HSC", "Admission", "Job Prep", "General"];

  useEffect(() => {
    const fetchEbooks = async () => {
      let query = supabase.from("ebooks").select("*").order('created_at', { ascending: false });
      if (activeTab !== "All") query = query.eq("category", activeTab);
      
      const { data, error } = await query;
      if (!error) setEbooks(data || []);
      setLoading(false);
    };
    fetchEbooks();
  }, [activeTab]);

  const filteredEbooks = ebooks.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans py-24 px-6">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Digital <span className="text-blue-600">Library</span></h1>
        
        <div className="mt-8 max-w-lg mx-auto relative">
          <input 
            type="text" 
            placeholder="Search books..." 
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-10 overflow-x-auto flex justify-center gap-2">
            {categories.map((cat) => (
                <button 
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${activeTab === cat ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200"}`}
                >
                    {cat}
                </button>
            ))}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {loading ? [...Array(5)].map((_, i) => <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-xl"></div>) : 
        filteredEbooks.map((book) => (
            <Link href={`/ebooks/${book.id}`} key={book.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 group">
                <div className="h-48 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                    {book.cover_url ? <img src={book.cover_url} alt={book.title} className="h-full w-full object-cover" /> : <span className="text-gray-400 text-xs font-bold uppercase">No Cover</span>}
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded">{book.category}</div>
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-2 group-hover:text-blue-600">{book.title}</h3>
                    <p className="text-xs text-gray-500">{book.author || "Unknown"}</p>
                </div>
            </Link>
        ))}
      </div>
      {!loading && filteredEbooks.length === 0 && <p className="text-center text-gray-400">No books found.</p>}
    </div>
  );
}