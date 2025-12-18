"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";

function BlogListContent() {
  const searchParams = useSearchParams();
  const segmentFilter = searchParams.get("segment") || "All";
  
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchBlogs() {
      setLoading(true);
      // Fetch blogs with their hierarchy to allow filtering
      const { data } = await supabase
        .from("resources")
        .select(`
          *,
          subjects (
            id,
            groups (
              id,
              segments (
                title
              )
            )
          )
        `)
        .eq("type", "blog")
        .order("created_at", { ascending: false });

      if (data) {
        // Flatten data for easier use
        const formattedData = data.map((item: any) => ({
          ...item,
          segmentName: item.subjects?.groups?.segments?.title || "General"
        }));
        setBlogs(formattedData);
      }
      setLoading(false);
    }
    fetchBlogs();
  }, []);

  // Filter Logic
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSegment = segmentFilter === "All" || blog.segmentName === segmentFilter;
    return matchesSearch && matchesSegment;
  });

  return (
    <div className="max-w-7xl mx-auto px-6">
      
      {/* HEADER */}
      <div className="mb-12 text-center">
        <span className="text-blue-600 font-extrabold text-xs tracking-widest uppercase mb-3 block">
          {segmentFilter === "All" ? "All Classes" : segmentFilter}
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Class <span className="text-blue-600">Blogs</span>
        </h1>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative group">
          <input 
            type="text" 
            placeholder={`Search ${segmentFilter} blogs...`} 
            className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-full pl-6 pr-12 py-4 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* CONTENT GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
           {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>)}
        </div>
      ) : filteredBlogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.id}`} className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="h-48 bg-slate-100 relative overflow-hidden">
                        {blog.content_url ? (
                            <Image src={blog.content_url} alt={blog.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">No Image</div>
                        )}
                        <div className="absolute top-3 left-3">
                            <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-slate-100">{blog.segmentName}</span>
                        </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2 block">
                            {new Date(blog.created_at).toLocaleDateString()}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                            {blog.title}
                        </h3>
                        <div className="text-slate-500 text-xs line-clamp-3 leading-relaxed mb-4 flex-1" dangerouslySetInnerHTML={{ __html: blog.content_body || "" }}></div>
                        <span className="text-blue-600 text-xs font-bold mt-auto group-hover:underline">Read Full Post →</span>
                    </div>
                </Link>
            ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="text-4xl mb-4">✍️</div>
            <h3 className="text-xl font-bold text-slate-900">No blogs found</h3>
            <p className="text-slate-500 mt-2">There are no blogs for {segmentFilter} yet.</p>
            <button onClick={()=>setSearchTerm("")} className="mt-4 text-blue-600 font-bold text-sm hover:underline">Clear Search</button>
        </div>
      )}
    </div>
  );
}

export default function BlogListPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans pt-32 pb-20">
            <Suspense fallback={<div className="text-center pt-20">Loading...</div>}>
                <BlogListContent />
            </Suspense>
        </div>
    )
}