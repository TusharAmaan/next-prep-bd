import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import PrintableBlogBody from "@/components/PrintableBlogBody";
import { Noto_Serif_Bengali } from "next/font/google"; 
import { Metadata } from 'next';
import { createClient } from "@/utils/supabase/server";
import FacebookComments from "@/components/FacebookComments";
import { getBreadcrumbSchema, getArticleSchema } from "@/lib/seo-utils";

export const dynamic = "force-dynamic";

const bengaliFont = Noto_Serif_Bengali({ 
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

function getQueryColumn(param: string) {
  const isNumeric = /^\d+$/.test(param);
  return isNumeric ? 'id' : 'slug';
}

export async function generateMetadata({ params }: { params: Promise<{ id: string; segment_slug: string }> }): Promise<Metadata> {
  const { id, segment_slug } = await params;
  const column = getQueryColumn(id);

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
    alternates: {
      canonical: `/resources/${segment_slug}/updates/${id}`,
    },
    openGraph: {
      title: update.seo_title || update.title,
      description: update.seo_description || `Latest update: ${update.title}`,
      type: 'article',
      url: `https://nextprepbd.com/resources/${segment_slug}/updates/${id}`,
    },
  };
}

export default async function UpdateDetailsPage({ params }: { params: Promise<{ segment_slug: string; id: string }> }) {
  const { segment_slug, id } = await params;
  const column = getQueryColumn(id);

  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  const isLoggedIn = !!user;

  const { data: post } = await supabase
    .from("segment_updates")
    .select("*, segments(title)")
    .eq(column, id)
    .single();

  if (!post) return notFound();

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const currentUrl = `https://nextprepbd.com/resources/${segment_slug}/updates/${post.id}`;

  const breadcrumbItems = [
    { name: "Home", item: "https://nextprepbd.com" },
    { name: "Resources", item: "https://nextprepbd.com/resources" },
    { name: post.segments?.title || "Segment", item: `https://nextprepbd.com/resources/${segment_slug}` },
    { name: post.title, item: currentUrl }
  ];

  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems);
  const articleSchema = getArticleSchema({
    title: post.title,
    description: post.seo_description || post.title.substring(0, 160),
    image: post.attachment_url || "https://nextprepbd.com/og-image.png",
    authorName: "NextPrepBD Editor",
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    url: currentUrl
  });

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
        <section className="max-w-7xl mx-auto px-6 py-12 pt-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              <div className="lg:col-span-8">
                  <PrintableBlogBody 
                      post={compatiblePost}
                      formattedDate={formattedDate}
                      attachmentUrl={post.attachment_url}
                      bengaliFontClass={bengaliFont.className} 
                      isLoggedIn={isLoggedIn} 
                  />

                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 p-8 md:p-12 mt-12 transition-colors">
                      <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-4 uppercase tracking-tighter">
                          <span className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm">💬</span>
                          Community Discussion
                      </h3>
                      <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 min-h-[100px] flex justify-center border border-slate-100 dark:border-slate-800 shadow-inner">
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
    </>
  );
}