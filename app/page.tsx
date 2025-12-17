"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";

export default function Home() {
  const [segments, setSegments] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>(""); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch Segments
      const { data: segData } = await supabase.from("segments").select("*").order("id");
      if (segData && segData.length > 0) {
        setSegments(segData);
        setActiveTab(segData[0].title); // Default tab
      }

      // 2. Fetch Blogs (Latest Resources)
      const { data: blogData } = await supabase.from("resources").select("*").eq("type", "blog").order("created_at", { ascending: false });
      setBlogs(blogData || []);

      // 3. Fetch Subjects (for filtering)
      const { data: subData } = await supabase.from("subjects").select("id, segment_id");
      setSubjects(subData || []);
      
      setLoading(false);
    }
    fetchData();
  }, []);

  // Filter Blogs based on Active Tab (Segment)
  const filteredBlogs = blogs.filter(blog => {
    const subject = subjects.find(s => s.id === blog.subject_id);
    if (!subject) return false;
    const segment = segments.find(s => s.id === subject.segment_id);
    return segment && segment.title === activeTab;
  });

  const featuredBlog = filteredBlogs[0]; // First item is "Featured"
  const listBlogs = filteredBlogs.slice(1, 5); // Next 4 items are "List"

  return (
    <div className="min-h-screen bg-white font-sans">
      
      {/* HERO SECTION */}
      <div className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-black/80 z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
        <div className="relative z-20 max-w-7xl mx-auto px-6 py-32 md:py-48 flex flex-col items-center text-center mt-10">
            <span className="bg-blue-600 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-widest mb-6 animate-fade-in-up">Education Reimagined</span>
            <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight drop-shadow-lg">Unlock Your <span className="text-blue-400">Potential</span></h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-medium">The ultimate platform for SSC, HSC, and University Admission preparation.</p>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <a href="#segments" className="bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 hover:shadow-xl shadow-blue-900/50">Start Learning →</a>
            </div>
        </div>
      </div>

      {/* CLASS SELECTION */}
      <div id="segments" className="max-w-7xl mx-auto px-6 py-20 border-b border-gray-100">
        <div className="border-l-4 border-blue-600 pl-4 mb-10"><h2 className="text-3xl font-bold text-gray-900">Select Your Class</h2></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {segments.map((segment, index) => {
                const colors = ["bg-blue-600", "bg-red-500", "bg-green-500", "bg-purple-600"];
                const color = colors[index % colors.length];
                return (
                    <Link href={`/resources/${segment.slug}`} key={segment.id} className="group bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden flex flex-col items-center text-center">
                        <div className={`w-16 h-16 ${color} text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                            {segment.title.charAt(0)}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{segment.title}</h3>
                        <p className="text-gray-400 text-sm font-medium">Explore subjects & materials →</p>
                    </Link>
                )
            })}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
            
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Latest Educational Updates</h2>
                <p className="text-gray-500">Stay updated with the latest notices, suggestions, and guides.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* LEFT CONTENT (8 Columns) */}
                <div className="lg:col-span-8">
                    
                    {/* TABS */}
                    <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-1">
                        {segments.map((seg) => (
                            <button 
                                key={seg.id} 
                                onClick={() => setActiveTab(seg.title)} 
                                className={`px-5 py-2 rounded-t-lg font-bold text-sm transition-all border-b-2 relative -bottom-[3px] ${activeTab === seg.title ? "bg-white border-blue-600 text-blue-600 shadow-sm z-10" : "bg-transparent border-transparent text-gray-500 hover:bg-gray-100"}`}
                            >
                                {seg.title}
                            </button>
                        ))}
                    </div>

                    {/* MAGAZINE LAYOUT */}
                    {loading ? (
                        <div className="animate-pulse space-y-4"><div className="h-96 bg-gray-200 rounded-2xl"></div></div>
                    ) : filteredBlogs.length > 0 ? (
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                
                                {/* 1. FEATURED POST (Left - 7 cols) */}
                                <div className="lg:col-span-7">
                                    <div className="relative group overflow-hidden rounded-2xl bg-gray-100 mb-5 aspect-[4/3]">
                                    {featuredBlog.content_url ? (
                                        <Image 
                                            src={featuredBlog.content_url} 
                                            alt={featuredBlog.title} 
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            priority // This forces the image to load immediately
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200 font-bold">No Image</div>
                                    )}
                                        <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">Latest</div>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                                        <Link href={`/blog/${featuredBlog.id}`} className="hover:text-blue-700 transition">{featuredBlog.title}</Link>
                                    </h3>
                                    <p className="text-gray-500 mb-4 line-clamp-3 leading-relaxed">
                                        {featuredBlog.content_body ? featuredBlog.content_body.replace(/<[^>]+>/g, '').substring(0, 120) + "..." : "Click to read more details about this topic."}
                                    </p>
                                    <Link href={`/blog/${featuredBlog.id}`} className="inline-flex items-center text-blue-600 font-bold text-sm hover:underline">
                                        Read Full Article <span className="ml-1">→</span>
                                    </Link>
                                </div>

                                {/* 2. SIDE LIST (Right - 5 cols) */}
                                <div className="lg:col-span-5 flex flex-col gap-6 border-t lg:border-t-0 lg:border-l border-gray-100 pt-8 lg:pt-0 lg:pl-8">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">More Updates</h4>
                                    <div className="space-y-6">
                                        {listBlogs.map((blog) => (
                                            <Link href={`/blog/${blog.id}`} key={blog.id} className="flex gap-4 group items-start">
                                                <div className="w-24 h-20 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 relative border border-gray-100">
                                                    {blog.content_url ? (
                                                        <img src={blog.content_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">N/A</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                                                        {blog.title}
                                                    </h4>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                                        {new Date(blog.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                    <Link href="/news" className="mt-auto w-full text-center py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold rounded-xl transition border border-gray-200">
                                        View All Posts
                                    </Link>
                                </div>

                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl p-20 text-center border border-gray-200">
                            <span className="text-4xl block mb-2">📭</span>
                            <p className="text-xl font-bold text-gray-400">No updates available yet.</p>
                        </div>
                    )}
                </div>

                {/* SIDEBAR (4 Columns) */}
                <div className="lg:col-span-4">
                    <Sidebar />
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}