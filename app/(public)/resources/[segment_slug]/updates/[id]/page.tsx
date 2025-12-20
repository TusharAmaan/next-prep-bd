import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import PrintableBlogBody from "@/components/PrintableBlogBody";
import { Noto_Serif_Bengali } from "next/font/google"; // Ensure this is imported

export const dynamic = "force-dynamic";

// Initialize font
const bengaliFont = Noto_Serif_Bengali({ 
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default async function UpdateDetailsPage({ params }: { params: Promise<{ segment_slug: string; id: string }> }) {
  const { segment_slug, id } = await params;

  // Fetch data
  const { data: post } = await supabase
    .from("segment_updates")
    .select("*, segments(title)")
    .eq("id", id)
    .single();

  if (!post) return notFound();

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const currentUrl = `https://nextprepbd.com/resources/${segment_slug}/updates/${id}`;

  const compatiblePost = {
    ...post,
    subjects: {
        groups: {
            segments: {
                title: post.segments?.title || post.type.replace('_', ' ')
            }
        }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      
      {/* FIX 1: Added 'pt-32' (Padding Top). 
         This pushes the content down so it doesn't hide behind your Fixed Header.
      */}
      <section className="max-w-7xl mx-auto px-6 py-12 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            <div className="lg:col-span-8">
                <PrintableBlogBody 
                    post={compatiblePost}
                    formattedDate={formattedDate}
                    attachmentUrl={post.attachment_url}
                    // FIX 2: Pass the font class here so the component can use it
                    bengaliFontClass={bengaliFont.className} 
                />

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 mt-8">
                    <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        💬 Discussion
                    </h3>
                    <div className="w-full bg-slate-50 rounded-xl p-4 min-h-[100px] flex justify-center">
                        <div 
                            className="fb-comments" 
                            data-href={currentUrl} 
                            data-width="100%" 
                            data-numposts="5">
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 space-y-8 no-print">
                <Sidebar />
            </div>
        </div>
      </section>
    </div>
  );
}