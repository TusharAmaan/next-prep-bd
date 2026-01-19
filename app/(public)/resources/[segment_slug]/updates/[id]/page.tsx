import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import PrintableBlogBody from "@/components/PrintableBlogBody";
import { Noto_Serif_Bengali } from "next/font/google"; 
import { Metadata } from 'next';
import { createClient } from "@/utils/supabase/server";
import FacebookComments from "@/components/FacebookComments";

export const dynamic = "force-dynamic";

// Initialize font
const bengaliFont = Noto_Serif_Bengali({ 
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// --- HELPER: Detect ID vs Slug ---
function getQueryColumn(param: string) {
  // Checks if the string contains only numbers
  const isNumeric = /^\d+$/.test(param);
  return isNumeric ? 'id' : 'slug';
}

// --- DYNAMIC SEO METADATA ---
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const column = getQueryColumn(id);

  // Fetch SEO data using ID or Slug
  const { data: update } = await supabase
    .from('segment_updates')
    .select('title, seo_title, seo_description, tags')
    .eq(column, id)
    .eq("status", "approved")
    .single();

  if (!update) {
    return { title: 'Update Not Found' };
  }

  return {
    title: update.seo_title || update.title,
    description: update.seo_description || `Latest update: ${update.title}`,
    keywords: update.tags,
    openGraph: {
      title: update.seo_title || update.title,
      description: update.seo_description,
      type: 'article',
    },
  };
}

// --- MAIN PAGE COMPONENT ---
export default async function UpdateDetailsPage({ params }: { params: Promise<{ segment_slug: string; id: string }> }) {
  const { segment_slug, id } = await params;
  const column = getQueryColumn(id);

  // --- AUTH CHECK ---
  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  const isLoggedIn = !!user;

  // Fetch data (Smart Lookup)
  const { data: post } = await supabase
    .from("segment_updates")
    .select("*, segments(title)")
    .eq(column, id)
    .single();

  if (!post) return notFound();

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  // Use ID for canonical URL to avoid duplicates if accessing via slug
  const currentUrl = `https://nextprepbd.com/resources/${segment_slug}/updates/${post.id}`;

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
      
      {/* Page Content with Padding for Fixed Header */}
      <section className="max-w-7xl mx-auto px-6 py-12 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            <div className="lg:col-span-8">
                <PrintableBlogBody 
                    post={compatiblePost}
                    formattedDate={formattedDate}
                    attachmentUrl={post.attachment_url}
                    bengaliFontClass={bengaliFont.className} 
                    isLoggedIn={isLoggedIn} 
                />

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 mt-8">
                    <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        💬 Discussion
                    </h3>
                    <div className="w-full bg-slate-50 rounded-xl p-4 min-h-[100px] flex justify-center">
                        <FacebookComments url={currentUrl} />
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