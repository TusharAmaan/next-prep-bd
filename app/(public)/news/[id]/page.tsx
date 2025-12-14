import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function SingleNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch specific news item
  const { data: post } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) return notFound();

  return (
    <div className="min-h-screen bg-white font-sans">
      
      {/* HERO / HEADER IMAGE */}
      <div className="w-full h-[400px] bg-gray-900 relative">
        {post.image_url && (
            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-4xl mx-auto">
            <Link href="/news" className="inline-block text-blue-300 font-bold text-sm mb-4 hover:text-white transition">← Back to News</Link>
            
            <div className="flex gap-2 mb-4">
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">{post.category || "General"}</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
                {post.title}
            </h1>
            <p className="text-gray-400 font-bold text-sm">
                Published on {new Date(post.created_at).toLocaleDateString()}
            </p>
        </div>
      </div>

      {/* CONTENT BODY */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* This div renders the HTML from SunEditor.
            We use 'prose' (Tailwind Typography) to style headings, lists, and images automatically.
        */}
        <div 
          className="prose prose-lg prose-blue max-w-none text-gray-800"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        {/* TAGS (If any) */}
        {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">Related Tags:</p>
                <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag: string, index: number) => (
                        <span key={index} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">#{tag}</span>
                    ))}
                </div>
            </div>
        )}
      </div>

    </div>
  );
}