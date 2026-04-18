import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import SinglePostContent from "@/components/public/SinglePostContent";
import { Noto_Serif_Bengali } from "next/font/google"; 
import { Metadata } from 'next';
import { createClient } from "@/utils/supabase/server";
import { getBreadcrumbSchema, getArticleSchema } from "@/lib/seo-utils";
import Discussion from "@/components/shared/Discussion";

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
                  <SinglePostContent 
                      post={post}
                      formattedDate={formattedDate}
                      bengaliFontClass={bengaliFont.className} 
                      isLoggedIn={isLoggedIn} 
                  />

                  <div className="mt-12 no-print">
                      <Discussion itemType="update" itemId={post.id.toString()} />
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