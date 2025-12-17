import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import FacebookComments from "@/components/FacebookComments";
import { headers } from 'next/headers';

export const dynamic = "force-dynamic";

export default async function SingleEbookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: book } = await supabase.from("ebooks").select("*").eq("id", id).single();
  
  if (!book) return notFound();

  const headersList = await headers();
  const host = headersList.get("host") || "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const absoluteUrl = `${protocol}://${host}/ebooks/${id}`;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <Link href="/ebooks" className="text-blue-600 font-bold text-sm mb-6 inline-block">← Back to Library</Link>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden md:flex">
            <div className="md:w-1/3 bg-gray-100 p-8 flex flex-col items-center justify-center">
                <div className="w-48 shadow-xl rounded overflow-hidden mb-6">
                    {book.cover_url ? <img src={book.cover_url} className="w-full" /> : <div className="h-64 bg-gray-200 flex items-center justify-center text-gray-400 font-bold">No Cover</div>}
                </div>
                <a href={book.pdf_url} target="_blank" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-700 w-full text-center">Download PDF</a>
            </div>
            <div className="md:w-2/3 p-8 md:p-12">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">{book.category}</span>
                <h1 className="text-3xl font-extrabold text-gray-900 mt-4 mb-2">{book.title}</h1>
                <p className="text-gray-500 font-bold text-sm mb-8">Author: {book.author || "Unknown"}</p>
                <div className="prose prose-blue max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: book.description || "<p>No description available.</p>" }} />
                {book.tags && (
                    <div className="mt-8 flex flex-wrap gap-2">
                        {book.tags.map((t: string, i: number) => <span key={i} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">#{t}</span>)}
                    </div>
                )}
            </div>
        </div>
        <div className="mt-12"><FacebookComments url={absoluteUrl} /></div>
      </div>
    </div>
  );
}