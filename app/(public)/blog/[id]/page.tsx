import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import FacebookComments from "@/components/FacebookComments";
import { headers } from 'next/headers';

export const dynamic = "force-dynamic";

export default async function SingleBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch the blog resource
  const { data: post } = await supabase
    .from("resources")
    .select("*")
    .eq("id", id)
    .single();

  if (!post || post.type !== 'blog') return notFound();

  // URL for comments
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const absoluteUrl = `${protocol}://${host}/blog/${id}`;

  return (
    <div className="min-h-screen bg-white font-sans pb-20 pt-20">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Breadcrumb */}
        <Link href="/" className="inline-flex items-center text-blue-600 font-bold text-sm mb-6 hover:underline">
            ← Back to Home
        </Link>

        {/* Title & Date */}
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            {post.title}
        </h1>
        <p className="text-gray-500 font-bold text-sm mb-8 border-b pb-8">
            Published on {new Date(post.created_at).toLocaleDateString()}
        </p>

        {/* Featured Image */}
        {post.content_url && (
            <div className="w-full aspect-video rounded-2xl overflow-hidden mb-10 bg-gray-100 relative">
                <img src={post.content_url} alt={post.title} className="w-full h-full object-cover" />
            </div>
        )}

        {/* Blog Body Content */}
        <div 
          className="prose prose-lg prose-blue max-w-none text-gray-800 mb-12"
          dangerouslySetInnerHTML={{ __html: post.content_body || "<p>No content available.</p>" }}
        />

        {/* Comments */}
        <div className="mt-12">
            <FacebookComments url={absoluteUrl} />
        </div>
      </div>
    </div>
  );
}