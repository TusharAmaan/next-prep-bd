import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import PrintableBlogBody from "@/components/PrintableBlogBody"; // Import the component

export const dynamic = "force-dynamic";

export default async function UpdateDetailsPage({ params }: { params: Promise<{ segment_slug: string; id: string }> }) {
  const { segment_slug, id } = await params;

  // Fetch the Update Post
  const { data: post } = await supabase
    .from("segment_updates")
    .select("*, segments(title)")
    .eq("id", id)
    .single();

  if (!post) return notFound();

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  // Current URL for comments
  const currentUrl = `https://nextprepbd.com/resources/${segment_slug}/updates/${id}`;

  // --- DATA ADAPTER ---
  // The PrintableBlogBody expects nested subject data (from blogs), 
  // but Updates have 'segments'. We map it here so the UI components work correctly.
  const compatiblePost = {
    ...post,
    subjects: {
        groups: {
            segments: {
                title: post.segments?.title || post.type.replace('_', ' ') // Uses Segment Title or Update Type
            }
        }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      
      {/* NOTE: The previous Header section was removed because 
         PrintableBlogBody handles the Title/Date display inside the 
         printable card now. This ensures the PDF captures the title correctly.
      */}

      {/* CONTENT */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* 1. Use the Universal Printable Body */}
            <div className="lg:col-span-8">
                <PrintableBlogBody 
                    post={compatiblePost}
                    formattedDate={formattedDate}
                    attachmentUrl={post.attachment_url} // Pass the attachment URL for the blue box
                />

                {/* Discussion Section (Kept separate as it shouldn't be printed usually) */}
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

            {/* 2. Sidebar */}
            <div className="lg:col-span-4 space-y-8 no-print">
                <Sidebar />
            </div>
        </div>
      </section>
    </div>
  );
}