import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import FacebookComments from "@/components/FacebookComments";
import Sidebar from "@/components/Sidebar"; // Import Sidebar
import { headers } from 'next/headers';

export const dynamic = "force-dynamic";

export default async function SingleBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch the CURRENT blog post
  const { data: post } = await supabase
    .from("resources")
    .select("*, subjects(title, groups(title, segments(title)))")
    .eq("id", id)
    .single();

  if (!post || post.type !== 'blog') return notFound();

  // 3. Setup URL for Comments
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const absoluteUrl = `${protocol}://${host}/blog/${id}`;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* MAIN CONTENT (Left Column) */}
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
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">N</div>
                <div>
                    <p className="text-sm font-bold text-gray-900">NextPrep Desk</p>
                    <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Featured Image */}
            {post.content_url && (
                <div className="w-full aspect-video rounded-xl overflow-hidden mb-10 bg-gray-100 relative shadow-inner">
                    <img src={post.content_url} alt={post.title} className="w-full h-full object-cover" />
                </div>
            )}

            {/* Body */}
            <div className="prose prose-lg prose-blue max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content_body || "<p>No content available.</p>" }} />

            {/* Post Tags */}
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

          <div className="mt-12"><FacebookComments url={absoluteUrl} /></div>
        </div>

        {/* SIDEBAR (Right Column) - REUSABLE COMPONENT */}
        <aside className="lg:col-span-4">
            <Sidebar />
        </aside>

      </div>
    </div>
  );
}