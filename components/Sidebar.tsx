import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default async function Sidebar() {
  // 1. Fetch Categories
  const { data: categories } = await supabase
    .from("segments")
    .select("id, title, slug")
    .order("id");

  // 2. Fetch Admission Blogs (Specific Logic)
  // We first need to find the ID of the 'Admission' segment or subjects related to it.
  // For simplicity/performance in this widget, we will fetch recent blogs 
  // and filter for 'Admission' in the title or subject on the client side logic here, 
  // or just show 'Latest Updates' if Admission is too complex to filter without exact IDs.
  // Let's do "Latest Updates" but highlight they are useful.
  const { data: recentPosts } = await supabase
    .from("resources")
    .select("id, title, created_at")
    .eq("type", "blog")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <aside className="space-y-8">
      
      {/* WIDGET 1: SEARCH */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4">Search</h3>
        <div className="relative">
            <input 
                type="text" 
                placeholder="Search topics..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      {/* WIDGET 2: FACEBOOK (The "Amazing" One) */}
      <div className="bg-[#1877F2] rounded-2xl shadow-lg p-6 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </div>
        <h3 className="font-bold text-lg mb-1 relative z-10">Join our Community</h3>
        <p className="text-blue-100 text-xs mb-4 relative z-10">Get daily updates and study tips on Facebook.</p>
        <a href="https://www.facebook.com" target="_blank" className="inline-block bg-white text-[#1877F2] font-bold py-2 px-6 rounded-lg text-sm hover:bg-gray-50 transition relative z-10 shadow-md">
            Follow Page
        </a>
      </div>

      {/* WIDGET 3: YOUTUBE (The "Amazing" One) */}
      <div className="bg-[#FF0000] rounded-2xl shadow-lg p-6 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
        </div>
        <h3 className="font-bold text-lg mb-1 relative z-10">Watch Lectures</h3>
        <p className="text-red-100 text-xs mb-4 relative z-10">Subscribe for video tutorials and guides.</p>
        <a href="https://www.youtube.com" target="_blank" className="inline-block bg-white text-[#FF0000] font-bold py-2 px-6 rounded-lg text-sm hover:bg-gray-50 transition relative z-10 shadow-md">
            Subscribe
        </a>
      </div>

      {/* WIDGET 4: LATEST UPDATES / ADMISSION */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            <span className="text-xl">🔔</span> Latest Updates
        </h3>
        <div className="space-y-4">
            {recentPosts?.map((blog: any) => (
                <Link href={`/blog/${blog.id}`} key={blog.id} className="block group">
                    <h4 className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition leading-snug mb-1 line-clamp-2">
                        {blog.title}
                    </h4>
                    <p className="text-xs text-gray-400">{new Date(blog.created_at).toLocaleDateString()}</p>
                </Link>
            ))}
            {(!recentPosts || recentPosts.length === 0) && (
                <p className="text-xs text-gray-400 italic">No updates available.</p>
            )}
        </div>
      </div>

      {/* WIDGET 5: CATEGORIES */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Browse Categories</h3>
        <ul className="space-y-2">
            {categories?.map((cat: any) => (
                <li key={cat.id}>
                    <Link 
                        href={`/resources/${cat.slug}`} 
                        target="_blank" 
                        className="flex justify-between items-center text-gray-600 hover:text-blue-600 text-sm font-medium transition group"
                    >
                        <span>{cat.title}</span>
                        <span className="w-6 h-6 rounded bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center text-[10px]">↗</span>
                    </Link>
                </li>
            ))}
        </ul>
      </div>

    </aside>
  );
}