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

      // 3. Get Subjects (To link blogs -> segments)
      const { data: subData } = await supabase.from("subjects").select("id, segment_id");
      setSubjects(subData || []);

      setLoading(false);
    }
    fetchData();
  }, []);

  // Filter Blogs based on Active Tab
  const filteredBlogs = blogs.filter(blog => {
    // Find the subject for this blog
    const subject = subjects.find(s => s.id === blog.subject_id);
    if (!subject) return false;
    // Find the segment for that subject
    const segment = segments.find(s => s.id === subject.segment_id);
    return segment && segment.title === activeTab;
  });

  // Separate featured vs list
  const featuredBlog = filteredBlogs[0];
  const listBlogs = filteredBlogs.slice(1, 6); // Next 5 blogs

  return (
    <div className="min-h-screen bg-white font-sans">
      
      {/* --- HERO SECTION --- */}
      <div className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-black/80 z-10"></div>
        {/* You can replace this URL with your own banner image */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-6 py-32 md:py-48 flex flex-col items-center text-center">
            <span className="bg-blue-600 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-widest mb-6 animate-fade-in-up">
                Education Reimagined
            </span>
            <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
                Unlock Your <span className="text-blue-400">Potential</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed font-medium">
                The ultimate platform for SSC, HSC, and University Admission preparation. Start learning today with our curated resources.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <a href="#segments" className="bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 hover:shadow-xl shadow-blue-900/50">
                    Start Learning →
                </a>
            </div>
        </div>
      </div>

      {/* --- CLASS SELECTION (SEGMENTS) --- */}
      <div id="segments" className="max-w-7xl mx-auto px-6 py-20">
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
                        <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150`}></div>
                    </Link>
                )
            })}
        </div>
      </div>

      {/* --- LATEST UPDATES (BLOGS) --- */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Latest Educational Updates</h2>
                <p className="text-gray-500">Stay updated with the latest notices, suggestions, and guides.</p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
                {segments.map((seg) => (
                    <button
                        key={seg.id}
                        onClick={() => setActiveTab(seg.title)}
                        className={`px-6 py-3 rounded-t-lg font-bold text-sm transition-all border-b-2 
                            ${activeTab === seg.title 
                                ? "bg-white border-blue-600 text-blue-600 shadow-sm" 
                                : "bg-transparent border-transparent text-gray-500 hover:bg-gray-100"
                            }`}
                    >
                        {seg.title}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-gray-200 min-h-[400px]">
                {loading ? (
                    <div className="animate-pulse flex gap-6">
                        <div className="w-2/3 h-80 bg-gray-200 rounded-xl"></div>
                        <div className="w-1/3 h-80 bg-gray-200 rounded-xl"></div>
                    </div>
                ) : filteredBlogs.length > 0 ? (
                    <div className="flex flex-col lg:flex-row gap-8">
                        
                        {/* LEFT: Featured Post (Big) */}
                        <div className="lg:w-2/3">
                            <div className="relative group overflow-hidden rounded-2xl bg-gray-100 mb-6 aspect-video">
                                {featuredBlog.content_url ? (
                                    <img src={featuredBlog.content_url} alt={featuredBlog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200">
                                        <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" /><path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                    Latest Update
                                </div>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                                <Link href={`/blog/${featuredBlog.id}`}>{featuredBlog.title}</Link>
                            </h3>
                            {/* Snippet */}
                            <div className="text-gray-500 mb-6 line-clamp-3 text-sm md:text-base">
                                {featuredBlog.content_body?.replace(/<[^>]+>/g, '') || "Click to read more details about this topic..."}
                            </div>
                            <Link href={`/blog/${featuredBlog.id}`} className="inline-block bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition-colors">
                                Read More
                            </Link>
                        </div>

                        {/* RIGHT: List of other posts */}
                        <div className="lg:w-1/3 flex flex-col gap-4 border-l border-gray-100 lg:pl-8">
                            {listBlogs.map((blog) => (
                                <Link href={`/blog/${blog.id}`} key={blog.id} className="flex gap-4 group items-start p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                    <div className="w-24 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                                        {blog.content_url ? (
                                            <img src={blog.content_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200"></div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm leading-snug group-hover:text-blue-600 line-clamp-2">
                                            {blog.title}
                                        </h4>
                                        <span className="text-xs text-gray-400 mt-1 block">
                                            {new Date(blog.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                            {listBlogs.length === 0 && (
                                <p className="text-sm text-gray-400 italic">No more posts in this category.</p>
                            )}
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
      </div>

    </div>
  );
}