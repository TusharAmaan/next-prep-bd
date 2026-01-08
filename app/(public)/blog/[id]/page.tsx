import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar"; 
import PrintableBlogBody from "@/components/PrintableBlogBody"; 
import FacebookComments from "@/components/FacebookComments"; 
import BlogTOC from "@/components/BlogTOC"; 
import { headers } from 'next/headers';
import 'katex/dist/katex.min.css'; 
import { Metadata } from 'next';
import { Noto_Serif_Bengali } from "next/font/google";

export const dynamic = "force-dynamic";

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

// --- 1. DYNAMIC METADATA ---
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const column = getQueryColumn(id);

  // Fetch using ID or Slug
  const { data: post } = await supabase
    .from('resources')
    .select('title, seo_title, seo_description, content_url, tags')
    .eq(column, id)
    .single();

  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.seo_title || post.title, 
    description: post.seo_description,
    keywords: post.tags,
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description,
      images: post.content_url ? [post.content_url] : [],
      type: 'article',
    },
  };
}

// --- 2. MAIN COMPONENT ---
export default async function SingleBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const column = getQueryColumn(id);

  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  const isLoggedIn = !!user;

  // Fetch using ID or Slug
  const { data: post } = await supabase
    .from("resources")
    .select("*, subjects(title, groups(title, segments(title)))")
    .eq(column, id)
    .single();

  if (!post || post.type !== 'blog') return notFound();

  const headersList = await headers();
  const host = headersList.get("host") || "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const absoluteUrl = `${protocol}://${host}/blog/${id}`;
  const formattedDate = new Date(post.created_at).toLocaleDateString();

  return (
    <div className={`min-h-screen bg-[#F8FAFC] font-sans pt-24 pb-20 ${bengaliFont.className}`}>
      {/* 3-COLUMN GRID LAYOUT */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 grid grid-cols-1 xl:grid-cols-12 gap-8 relative">
        
        {/* COL 1: LEFT TOC (2 Cols) - Hidden on mobile/laptop, visible on XL */}
        <aside className="hidden xl:block xl:col-span-2 relative">
            <BlogTOC content={post.content_body || ""} />
        </aside>

        {/* COL 2: MAIN CONTENT (7 Cols on XL, 8 Cols on LG) */}
        <main className="xl:col-span-7 lg:col-span-8 col-span-1">
            <PrintableBlogBody 
                post={post} 
                formattedDate={formattedDate}
                bengaliFontClass={bengaliFont.className} 
                isLoggedIn={isLoggedIn}
                attachmentUrl={post.content_url} 
            />
            <div className="mt-12 comments-section print:hidden">
                <FacebookComments url={absoluteUrl} />
            </div>
            
            {/* Mobile/Tablet TOC Bubble */}
            <div className="xl:hidden">
                <BlogTOC content={post.content_body || ""} />
            </div>
        </main>

        {/* COL 3: RIGHT SIDEBAR (3 Cols on XL, 4 Cols on LG) */}
        <aside className="xl:col-span-3 lg:col-span-4 col-span-1 space-y-8 print:hidden">
            <Sidebar />
        </aside>

      </div>
    </div>
  );
}