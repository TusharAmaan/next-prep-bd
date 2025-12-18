import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import FacebookComments from "@/components/FacebookComments";
import Sidebar from "@/components/Sidebar"; 
import DownloadPdfBtn from "@/components/DownloadPdfBtn"; 
import { headers } from 'next/headers';

export const dynamic = "force-dynamic";

export default async function SingleBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch Data
  const { data: post } = await supabase
    .from("resources")
    .select("*, subjects(title, groups(title, segments(title)))")
    .eq("id", id)
    .single();

  if (!post || post.type !== 'blog') return notFound();

  // 2. Setup Meta
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const absoluteUrl = `${protocol}://${host}/blog/${id}`;
  const safeFilename = post.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-20">
      
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* MAIN CONTENT */}
        <div className="lg:col-span-8">
          
          {/* Header & Download */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
             <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <Link href="/" className="hover:text-blue-600">Home</Link> / 
                <Link href="/blog" className="hover:text-blue-600">Blogs</Link> /
                <span className="text-blue-600">{post.subjects?.groups?.segments?.title || "Post"}</span>
             </div>
             <DownloadPdfBtn targetId="print-container" filename={safeFilename} />
          </div>

          {/* PRINTABLE AREA */}
          <div id="print-container" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-8 md:p-12">
            
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                {post.title}
            </h1>

            <div className="flex items-center gap-4 border-b border-gray-100 pb-8 mb-8">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">N</div>
                <div>
                    <p className="text-sm font-bold text-gray-900">NextPrep Desk</p>
                    <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Featured Image */}
            {post.content_url && (
                <div className="w-full aspect-video rounded-xl overflow-hidden mb-10 bg-gray-100 border border-gray-100">
                    <img 
                        src={post.content_url} 
                        alt={post.title} 
                        className="w-full h-full object-cover" 
                        crossOrigin="anonymous" 
                    />
                </div>
            )}

            {/* Main Body - THIS SECTION CONTROLS STYLING */}
            <div className="prose prose-lg max-w-none prose-headings:font-extrabold prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-900 prose-a:text-blue-600 prose-img:rounded-xl">
                 <div dangerouslySetInnerHTML={{ __html: post.content_body || "<p>No content available.</p>" }} />
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Related Topics:</h4>
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag: string, i: number) => (
                            <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">#{tag}</span>
                        ))}
                    </div>
                </div>
            )}
          </div>

          <div className="mt-12">
            <FacebookComments url={absoluteUrl} />
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4 space-y-8">
            <Sidebar />
        </aside>

      </div>
    </div>
  );
}