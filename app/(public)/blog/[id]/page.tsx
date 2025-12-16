import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import FacebookComments from "@/components/FacebookComments";
import { headers } from 'next/headers';

export const dynamic = "force-dynamic";

export default async function SingleBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch the CURRENT blog post
  const { data: post } = await supabase
    .from("resources")
    .select("*, subjects(title, groups(title, segments(title)))") // Join to get hierarchy info
    .eq("id", id)
    .single();

  if (!post || post.type !== 'blog') return notFound();

  // 2. Fetch RECENT posts for the Sidebar
  const { data: recentPosts } = await supabase
    .from("resources")
    .select("id, title, created_at")
    .eq("type", "blog")
    .neq("id", id) // Don't show the current post in "recent"
    .order("created_at", { ascending: false })
    .limit(5);

  // 3. Fetch CATEGORIES (Segments) for Sidebar
  const { data: categories } = await supabase
    .from("segments")
    .select("id, title, slug");

  // 4. Setup URL for Comments
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const absoluteUrl = `${protocol}://${host}/blog/${id}`;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* ================= MAIN CONTENT (Left Column) ================= */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-8 md:p-12">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
                <Link href="/" className="hover:text-blue-600">Home</Link> 
                <span>/</span>
                <span className="text-blue-600">{post.subjects?.groups?.segments?.title || "Blog"}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                {post.title}
            </h1>

            {/* Metadata */}
            <div className="flex items-center gap-4 border-b border-gray-100 pb-8 mb-8">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    N
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900">NextPrep Desk</p>
                    <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            {/* Featured Image */}
            {post.content_url && (
                <div className="w-full aspect-video rounded-xl overflow-hidden mb-10 bg-gray-100 relative shadow-inner">
                    <img src={post.content_url} alt={post.title} className="w-full h-full object-cover" />
                </div>
            )}

            {/* Blog Body */}
            <div 
              className="prose prose-lg prose-blue max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content_body || "<p>No content available.</p>" }}
            />

            {/* Tags Display (Bottom of Post) */}
            {post.tags && post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                        Related Topics:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag: string, i: number) => (
                            <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-blue-50 hover:text-blue-600 transition cursor-default">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="mt-12">
            <FacebookComments url={absoluteUrl} />
          </div>
        </div>


        {/* ================= SIDEBAR (Right Column) ================= */}
        <aside className="lg:col-span-4 space-y-8">
            
            {/* Widget 1: Search */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Search</h3>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Search articles..." 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
            </div>

            {/* Widget 2: Categories */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Categories</h3>
                <ul className="space-y-2">
                    {categories?.map((cat: any) => (
                        <li key={cat.id}>
                            <Link 
                                href={`/resources/${cat.slug}`} 
                                target="_blank" // <--- This prevents losing the blog page
                                rel="noopener noreferrer"
                                className="flex justify-between items-center text-gray-600 hover:text-blue-600 text-sm font-medium transition group"
                            >
                                <span>{cat.title}</span>
                                {/* Changed arrow to 'External Link' icon to indicate new tab */}
                                <span className="w-6 h-6 rounded bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center text-[10px]">↗</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Widget 3: Latest Posts */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Latest Updates</h3>
                <div className="space-y-4">
                    {recentPosts?.map((recent: any) => (
                        <Link href={`/blog/${recent.id}`} key={recent.id} className="block group">
                            <h4 className="text-sm font-bold text-gray-800 leading-snug group-hover:text-blue-600 transition mb-1 line-clamp-2">
                                {recent.title}
                            </h4>
                            <p className="text-xs text-gray-400">
                                {new Date(recent.created_at).toLocaleDateString()}
                            </p>
                        </Link>
                    ))}
                    {(!recentPosts || recentPosts.length === 0) && (
                        <p className="text-xs text-gray-400 italic">No other recent posts.</p>
                    )}
                </div>
            </div>

            {/* Widget 4: Tags Cloud (Aggregated from current post for now) */}
            {post.tags && post.tags.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                     <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Hot Topics</h3>
                     <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag: string, i: number) => (
                            <span key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                {tag}
                            </span>
                        ))}
                     </div>
                </div>
            )}

            {/* Sticky Ad / Promo (Optional) */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white text-center shadow-lg">
                <h3 className="font-bold text-lg mb-2">Need More Help?</h3>
                <p className="text-blue-100 text-sm mb-4">Check out our exclusive courses and question banks.</p>
                <Link href="/courses" className="inline-block bg-white text-blue-700 font-bold px-6 py-2 rounded-lg text-sm hover:bg-blue-50 transition">
                    View Courses
                </Link>
            </div>

        </aside>

      </div>
    </div>
  );
}