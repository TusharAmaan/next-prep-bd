"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";

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

  // Filter Blogs based on Active Tab
  const filteredBlogs = blogs.filter(blog => {
    const subject = subjects.find(s => s.id === blog.subject_id);
    if (!subject) return false;
    const segment = segments.find(s => s.id === subject.segment_id);
    return segment && segment.title === activeTab;
  });

  // Separate featured vs list
  const featuredBlog = filteredBlogs[0];
  const listBlogs = filteredBlogs.slice(1, 6); 

  return (
    <div className="min-h-screen bg-white font-sans">
      
      {/* --- HERO SECTION --- */}
      <div className="relative bg-gray-900 overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-black/80 z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
        
        {/* Content with padding-top to clear Fixed Header */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 py-32 md:py-48 flex flex-col items-center text-center mt-10">
            <span className="bg-blue-600 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-widest mb-6 animate-fade-in-up">
                Education Reimagined
            </span>
            <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
                Unlock Your <span className="text-blue-400">Potential</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-medium">
                The ultimate platform for SSC, HSC, and University Admission preparation.
            </p>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <a href="#segments" className="bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 hover:shadow-xl shadow-blue-900/50">
                    Start Learning →
                </a>
            </div>
        </div>
      </div>

      {/* --- CLASS SELECTION SECTION --- */}
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

      {/* --- MAIN CONTENT & SIDEBAR SECTION --- */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
            
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Latest Educational Updates</h2>
                <p className="text-gray-500">Stay updated with the latest notices, suggestions, and guides.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN (Content) */}
                <div className="lg:col-span-8">
                    
                    {/* Tabs */}
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

                    {/* Blog Feed */}
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

                {/* RIGHT COLUMN (Sidebar) */}
                <div className="lg:col-span-4">
                    <Sidebar />
                </div>

            </div>
        </div>
      </div>

    </div>
  );
}