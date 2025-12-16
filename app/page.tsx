"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [segments, setSegments] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>(""); 
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    async function fetchData() {
      // 1. Get Segments (Tabs)
      const { data: segData } = await supabase.from("segments").select("*").order("id");
      if (segData && segData.length > 0) {
        setSegments(segData);
        setActiveTab(segData[0].title); // Default to first tab
      }

      // 2. Get Blog Resources
      const { data: blogData } = await supabase
        .from("resources")
        .select("*")
        .eq("type", "blog")
        .order("created_at", { ascending: false });
      
      setBlogs(blogData || []);

      // 3. Get Subjects (To map blogs -> segments)
      const { data: subData } = await supabase.from("subjects").select("id, segment_id");
      setSubjects(subData || []);

      setLoading(false);
    }
    fetchData();
  }, []);

  // --- LOGIC: Filter Blogs for Main Tabs ---
  const filteredBlogs = blogs.filter(blog => {
    const subject = subjects.find(s => s.id === blog.subject_id);
    if (!subject) return false;
    const segment = segments.find(s => s.id === subject.segment_id);
    return segment && segment.title === activeTab;
  });

  // --- LOGIC: Filter Blogs specifically for "Admission" Sidebar ---
  const admissionBlogs = blogs.filter(blog => {
      const subject = subjects.find(s => s.id === blog.subject_id);
      if (!subject) return false;
      const segment = segments.find(s => s.id === subject.segment_id);
      // Check if segment title contains "Admission" (case insensitive)
      return segment && segment.title.toLowerCase().includes("admission");
  }).slice(0, 5); // Limit to top 5

  // Separate featured vs list for Main Content
  const featuredBlog = filteredBlogs[0];
  const listBlogs = filteredBlogs.slice(1, 6); 

  return (
    <div className="min-h-screen bg-white font-sans">
      
      {/* --- HERO SECTION --- */}
      <div className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-black/80 z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-6 py-32 md:py-48 flex flex-col items-center text-center">
            <span className="bg-blue-600 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-widest mb-6 animate-fade-in-up">
                Education Reimagined
            </span>
            <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
                Unlock Your <span className="text-blue-400">Potential</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-medium">
                The ultimate platform for SSC, HSC, and University Admission preparation. Start learning today.
            </p>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <a href="#segments" className="bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 hover:shadow-xl shadow-blue-900/50">
                    Start Learning →
                </a>
            </div>
        </div>
      </div>

      {/* --- CLASS SELECTION (SEGMENTS) --- */}
      <div id="segments" className="max-w-7xl mx-auto px-6 py-20 border-b border-gray-100">
        <div className="border-l-4 border-blue-600 pl-4 mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Select Your Class</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {segments.map((segment, index) => {
                const colors = ["bg-blue-600", "bg-red-500", "bg-green-500", "bg-purple-600"];
                const color = colors[index % colors.length];
                
                return (
                    <Link href={`/resources/${segment.slug}`} key={segment.id} className="group bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                        <div className={`w-12 h-12 ${color} text-white rounded-xl flex items-center justify-center text-xl font-bold mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                            {segment.title.charAt(0)}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{segment.title}</h3>
                        <p className="text-gray-400 text-sm font-medium mb-8">Explore subjects & materials →</p>
                    </Link>
                )
            })}
        </div>
      </div>

      {/* --- MAIN CONTENT & SIDEBAR GRID --- */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
            
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Latest Educational Updates</h2>
                <p className="text-gray-500">Stay updated with the latest notices, suggestions, and guides.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* ================= LEFT COLUMN (MAIN FEED) - 8 COLS ================= */}
                <div className="lg:col-span-8">
                    
                    {/* TABS */}
                    <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-1">
                        {segments.map((seg) => (
                            <button
                                key={seg.id}
                                onClick={() => setActiveTab(seg.title)}
                                className={`px-5 py-2 rounded-t-lg font-bold text-sm transition-all border-b-2 relative -bottom-[3px]
                                    ${activeTab === seg.title 
                                        ? "bg-white border-blue-600 text-blue-600 shadow-sm z-10" 
                                        : "bg-transparent border-transparent text-gray-500 hover:bg-gray-100"
                                    }`}
                            >
                                {seg.title}
                            </button>
                        ))}
                    </div>

                    {/* BLOG CONTENT */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 min-h-[500px]">
                        {loading ? (
                            <div className="animate-pulse space-y-4">
                                <div className="h-64 bg-gray-200 rounded-xl"></div>
                                <div className="h-20 bg-gray-200 rounded-xl"></div>
                            </div>
                        ) : filteredBlogs.length > 0 ? (
                            <div className="flex flex-col gap-8">
                                {/* Featured Post */}
                                <div>
                                    <div className="relative group overflow-hidden rounded-2xl bg-gray-100 mb-5 aspect-video">
                                        {featuredBlog.content_url ? (
                                            <img src={featuredBlog.content_url} alt={featuredBlog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200 font-bold">No Image</div>
                                        )}
                                        <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">Latest</div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                        <Link href={`/blog/${featuredBlog.id}`}>{featuredBlog.title}</Link>
                                    </h3>
                                    <p className="text-gray-500 line-clamp-2 text-sm mb-4">
                                        {featuredBlog.content_body?.replace(/<[^>]+>/g, '') || "Read full details..."}
                                    </p>
                                    <Link href={`/blog/${featuredBlog.id}`} className="text-blue-600 font-bold text-sm hover:underline">Read Article →</Link>
                                </div>

                                {/* List Posts */}
                                <div className="space-y-4 border-t pt-8">
                                    {listBlogs.map((blog) => (
                                        <Link href={`/blog/${blog.id}`} key={blog.id} className="flex gap-4 group items-center p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                                            <div className="w-20 h-14 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                                                {blog.content_url && <img src={blog.content_url} className="w-full h-full object-cover" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-sm leading-snug group-hover:text-blue-600 line-clamp-2">{blog.title}</h4>
                                                <span className="text-xs text-gray-400">{new Date(blog.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-400">
                                <p className="text-xl font-bold mb-2">No updates yet</p>
                                <p className="text-sm">Check back later for news in {activeTab}.</p>
                            </div>
                        )}
                    </div>
                </div>


                {/* ================= RIGHT COLUMN (SIDEBAR) - 4 COLS ================= */}
                <div className="lg:col-span-4 space-y-8">
                    
                    {/* WIDGET 1: ADMISSION CORNER */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-extrabold text-gray-900 mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
                            <span className="text-xl">🎓</span> Admission Corner
                        </h3>
                        <div className="space-y-4">
                            {admissionBlogs.length > 0 ? (
                                admissionBlogs.map(blog => (
                                    <Link href={`/blog/${blog.id}`} key={blog.id} className="block group">
                                        <h4 className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition leading-snug mb-1">
                                            {blog.title}
                                        </h4>
                                        <p className="text-xs text-gray-400">{new Date(blog.created_at).toLocaleDateString()}</p>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 italic">No admission updates yet.</p>
                            )}
                        </div>
                        <div className="mt-5 pt-4 border-t border-gray-100">
                            <Link href="/resources/university-admission" className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-wide">
                                View All Admission Posts →
                            </Link>
                        </div>
                    </div>

                    {/* WIDGET 2: FACEBOOK */}
                    <div className="bg-[#1877F2] rounded-2xl shadow-lg p-6 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
                             <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </div>
                        <h3 className="font-bold text-lg mb-1 relative z-10">Join our Community</h3>
                        <p className="text-blue-100 text-xs mb-4 relative z-10">Get daily updates and study tips on Facebook.</p>
                        <a href="https://www.facebook.com" target="_blank" className="inline-block bg-white text-[#1877F2] font-bold py-2 px-6 rounded-lg text-sm hover:bg-gray-50 transition relative z-10">
                            Follow Page
                        </a>
                    </div>

                    {/* WIDGET 3: YOUTUBE */}
                    <div className="bg-[#FF0000] rounded-2xl shadow-lg p-6 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
                            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        </div>
                        <h3 className="font-bold text-lg mb-1 relative z-10">Watch Free Lectures</h3>
                        <p className="text-red-100 text-xs mb-4 relative z-10">Subscribe for video tutorials and guides.</p>
                        <a href="https://www.youtube.com" target="_blank" className="inline-block bg-white text-[#FF0000] font-bold py-2 px-6 rounded-lg text-sm hover:bg-gray-50 transition relative z-10">
                            Subscribe
                        </a>
                    </div>

                </div>

            </div>
        </div>
      </div>

    </div>
  );
}