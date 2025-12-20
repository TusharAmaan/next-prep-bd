import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function UpdateDetailsPage({ params }: { params: Promise<{ segment_slug: string; id: string }> }) {
  const { segment_slug, id } = await params;

  // 1. Fetch the Update Post
  const { data: post } = await supabase
    .from("segment_updates")
    .select("*, segments(title)")
    .eq("id", id)
    .single();

  if (!post) return notFound();

  // Helper to format date
  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  // Type Badge Color
  const typeColors: any = {
    routine: "bg-blue-100 text-blue-700 border-blue-200",
    syllabus: "bg-emerald-100 text-emerald-700 border-emerald-200",
    exam_result: "bg-purple-100 text-purple-700 border-purple-200"
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* HEADER */}
      <section className="bg-white border-b border-slate-200 pt-32 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                <Link href="/" className="hover:text-blue-600">Home</Link> / 
                <Link href={`/resources/${segment_slug}`} className="hover:text-blue-600">{post.segments?.title}</Link> /
                <span>Update</span>
            </div>
            
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border mb-4 ${typeColors[post.type] || "bg-gray-100"}`}>
                {post.type.replace('_', ' ')}
            </span>

            <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
                {post.title}
            </h1>
            <p className="text-slate-500 font-medium">Posted on {formattedDate}</p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
                    
                    {/* Attachment Download Button (If exists) */}
                    {post.attachment_url && (
                        <div className="mb-10 bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-2xl">📄</div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Official Document/PDF</h4>
                                    <p className="text-xs text-slate-500">Click to view or download</p>
                                </div>
                            </div>
                            <a 
                                href={post.attachment_url} 
                                target="_blank" 
                                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition shadow-lg w-full md:w-auto text-center"
                            >
                                Download Now
                            </a>
                        </div>
                    )}

                    {/* Rich Text Content */}
                    <div 
                        className="blog-content text-lg text-slate-800 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: post.content_body || "<p>No details provided.</p>" }}
                    />
                </div>
            </div>

            <div className="lg:col-span-4">
                <Sidebar />
            </div>
        </div>
      </section>
    </div>
  );
}