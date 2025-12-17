import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EbookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: book } = await supabase
    .from("ebooks")
    .select("*")
    .eq("id", id)
    .single();

  if (!book) return notFound();

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
            <Link href="/" className="hover:text-blue-600 transition">Home</Link> / 
            <Link href="/ebooks" className="hover:text-blue-600 transition">Library</Link> /
            <span className="text-gray-800">{book.title}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            
            {/* LEFT: COVER & ACTION (4 Cols) */}
            <div className="md:col-span-4">
                <div className="bg-gray-100 rounded-xl overflow-hidden shadow-lg border border-gray-200 aspect-[3/4] mb-6 relative">
                    {book.cover_url ? (
                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold flex-col">
                            <span className="text-4xl mb-2">📚</span>
                            <span>No Cover</span>
                        </div>
                    )}
                </div>
                
                {book.pdf_url ? (
                    <a 
                        href={book.pdf_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-center rounded-xl transition shadow-lg shadow-blue-200"
                    >
                        View / Download Book
                    </a>
                ) : (
                    <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm font-bold text-center border border-yellow-100">
                        Read Online / See Link Below
                    </div>
                )}
            </div>

            {/* RIGHT: INFO & DESCRIPTION (8 Cols) */}
            <div className="md:col-span-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{book.category}</span>
                    {book.tags?.map((tag: string) => (
                        <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">#{tag}</span>
                    ))}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 leading-tight">{book.title}</h1>
                <p className="text-lg text-gray-500 font-medium mb-8">By <span className="text-gray-800">{book.author}</span></p>

                <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                    <h3 className="font-bold text-gray-900 text-lg mb-3">Description & Links</h3>
                    {/* Render HTML Description safely */}
                    <div dangerouslySetInnerHTML={{ __html: book.description }} />
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}