import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar"; 
import PrintableBlogBody from "@/components/PrintableBlogBody"; 
import FacebookComments from "@/components/FacebookComments"; 
import { headers } from 'next/headers';
import 'katex/dist/katex.min.css'; 

export const dynamic = "force-dynamic";

export default async function SingleBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch Data
  const { data: post } = await supabase
    .from("resources")
    .select("*, subjects(title, groups(title, segments(title)))")
    .eq("id", id)
    .single();

  if (!post || post.type !== 'blog') return notFound();

  // 2. Meta for Comments
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const absoluteUrl = `${protocol}://${host}/blog/${id}`;

  const formattedDate = new Date(post.created_at).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* MAIN CONTENT */}
        <div className="lg:col-span-8">
            {/* Printable Content Area (Client Component) */}
            <PrintableBlogBody post={post} formattedDate={formattedDate} />

            {/* Comments - Hidden during print via CSS */}
            <div className="mt-12 comments-section">
                <FacebookComments url={absoluteUrl} />
            </div>
        </div>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4 space-y-8">
            <Sidebar />
        </aside>

      </div>
    </div>
  );
}