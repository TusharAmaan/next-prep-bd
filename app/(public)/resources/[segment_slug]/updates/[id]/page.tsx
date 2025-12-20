import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import { Noto_Serif_Bengali } from "next/font/google";
// 1. Import the Script component
import Script from "next/script";

export const dynamic = "force-dynamic";

const bengaliFont = Noto_Serif_Bengali({ 
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default async function UpdateDetailsPage({ params }: { params: Promise<{ segment_slug: string; id: string }> }) {
  const { segment_slug, id } = await params;

  const { data: post } = await supabase
    .from("segment_updates")
    .select("*, segments(title)")
    .eq("id", id)
    .single();

  if (!post) return notFound();

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const typeColors: any = {
    routine: "bg-blue-100 text-blue-700 border-blue-200",
    syllabus: "bg-emerald-100 text-emerald-700 border-emerald-200",
    exam_result: "bg-purple-100 text-purple-700 border-purple-200"
  };

  const currentUrl = `https://nextprepbd.com/resources/${segment_slug}/updates/${id}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      
      {/* 2. REQUIRED: Facebook SDK Root Div & Script */}
      <div id="fb-root"></div>
      <Script 
        async 
        defer 
        crossOrigin="anonymous" 
        src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0" 
        strategy="lazyOnload"
      />

      {/* HEADER */}
      <section className="bg-white border-b border-slate-200 pt-32 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                <Link href="/" className="hover:text-blue-600 transition">Home</Link> / 
                <Link href={`/resources/${segment_slug}`} className="hover:text-blue-600 transition">{post.segments?.title}</Link> /
                <span>Update</span>
            </div>
            
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border mb-4 ${typeColors[post.type] || "bg-gray-100"}`}>
                {post.type.replace('_', ' ')}
            </span>

            <h1 className={`text-3xl md:text-5xl font-black text-slate-900 mb-4 leading-tight ${bengaliFont.className}`}>
                {post.title}
            </h1>
            <p className="text-slate-500 font-medium">Posted on {formattedDate}</p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            <div className="lg:col-span-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 mb-8">
                    
                    {/* PDF Button: Only shows if attachment_url exists in database */}
                    {post.attachment_url && (
                        <div className="mb-10 bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white text-blue-600 rounded-lg flex items-center justify-center text-2xl shadow-sm">
                                    📄
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Official Document</h4>
                                    <p className="text-xs text-slate-500">Click download to view the full PDF/Image</p>
                                </div>
                            </div>
                            <a 
                                href={post.attachment_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 w-full md:w-auto text-center flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Download PDF
                            </a>
                        </div>
                    )}

                    <div 
                        className={`blog-content text-lg text-slate-800 leading-relaxed ${bengaliFont.className}`}
                        dangerouslySetInnerHTML={{ __html: post.content_body || "<p>No details provided.</p>" }}
                    />
                </div>

                {/* Discussion Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
                    <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        💬 Discussion
                    </h3>
                    <div className="w-full bg-slate-50 rounded-xl p-4 min-h-[100px] flex justify-center">
                         {/* 3. Ensure width is 100% explicitly in className as well */}
                         <div 
                            className="fb-comments w-full" 
                            data-href={currentUrl} 
                            data-width="100%" 
                            data-numposts="5">
                         </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
                <Sidebar />
            </div>
        </div>
      </section>
    </div>
  );
}