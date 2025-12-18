import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import FacebookComments from "@/components/FacebookComments";
import Sidebar from "@/components/Sidebar"; 
import DownloadPdfBtn from "@/components/DownloadPdfBtn"; // <--- NEW IMPORT
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

  // 2. Setup URL for Comments
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const absoluteUrl = `${protocol}://${host}/blog/${id}`;
  
  // Helper for filename
  const safeFilename = post.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-20">
      
      {/* PROGRESS BAR DECOR */}
      <div className="fixed top-20 left-0 w-full h-1 bg-gray-200 z-40">
         <div className="h-full bg-blue-600 w-1/3"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* MAIN CONTENT (Left Column) */}
        <div className="lg:col-span-8">
          
          {/* HEADER ACTION AREA */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
             {/* Breadcrumb */}
             <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <Link href="/" className="hover:text-blue-600">Home</Link> 
                <span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Blogs</Link>
                <span>/</span>
                <span className="text-blue-600">{post.subjects?.groups?.segments?.title || "Post"}</span>
             </div>

             {/* DOWNLOAD BUTTON */}
             <DownloadPdfBtn targetId="print-container" filename={safeFilename} />
          </div>

          {/* PRINTABLE CONTAINER STARTS HERE */}
          <div id="print-container" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-8 md:p-12">
            
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
                <div className="w-full aspect-video rounded-xl overflow-hidden mb-10 bg-gray-100 relative shadow-inner border border-gray-100">
                    {/* Standard img tag is safer for PDF generation than next/image */}
                    <img 
                        src={post.content_url} 
                        alt={post.title} 
                        className="w-full h-full object-cover" 
                        crossOrigin="anonymous" 
                    />
                </div>
            )}

            {/* Body Content */}
            {/* We use 'prose' from Tailwind Typography to format the HTML beautifully */}
            <div 
              className="prose prose-lg max-w-none prose-headings:font-extrabold prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-900 prose-a:text-blue-600 prose-img:rounded-xl" 
              dangerouslySetInnerHTML={{ __html: post.content_body || "<p>No content available.</p>" }} 
            />

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
          {/* PRINTABLE CONTAINER ENDS HERE */}

          {/* Comments Section (Outside PDF) */}
          <div className="mt-12">
            <FacebookComments url={absoluteUrl} />
          </div>

        </div>

        {/* SIDEBAR (Right Column) */}
        <aside className="lg:col-span-4 space-y-8">
            <Sidebar />
        </aside>

      </div>
    </div>
  );
}