import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar"; 
import PrintableBlogBody from "@/components/PrintableBlogBody"; // <--- Kept your component
import FacebookComments from "@/components/FacebookComments"; 
import { headers } from 'next/headers';
import 'katex/dist/katex.min.css'; 
import { Metadata } from 'next';
import { Noto_Serif_Bengali } from "next/font/google";

export const dynamic = "force-dynamic";

// --- 1. INITIALIZE FONT ---
const bengaliFont = Noto_Serif_Bengali({ 
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"], 
  display: "swap",
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data: post } = await supabase
    .from('resources')
    .select('title, seo_title, seo_description, content_url, tags')
    .eq('id', id)
    .single();

  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.seo_title || post.title, 
    description: post.seo_description || `Read about ${post.title} on NextPrepBD.`,
    keywords: post.tags,
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description,
      images: post.content_url ? [post.content_url] : [],
      type: 'article',
    },
  };
}

// --- MAIN PAGE COMPONENT ---
export default async function SingleBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. CHECK USER SESSION
  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  const isLoggedIn = !!user; 

  // 2. FETCH DATA
  const { data: post } = await supabase
    .from("resources")
    .select("*, subjects(title, groups(title, segments(title)))")
    .eq("id", id)
    .single();

  if (!post || post.type !== 'blog') return notFound();

  // 3. META FOR COMMENTS
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const absoluteUrl = `${protocol}://${host}/blog/${id}`;
  const formattedDate = new Date(post.created_at).toLocaleDateString();

  return (
    <div className={`min-h-screen bg-gray-50 font-sans pt-24 pb-20 ${bengaliFont.className}`}>
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* MAIN CONTENT */}
        <div className="lg:col-span-8">
            {/* We pass the data to your component, which now internally handles the TOC */}
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
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="lg:col-span-4 space-y-8 print:hidden">
            <Sidebar />
        </aside>

      </div>
    </div>
  );
}