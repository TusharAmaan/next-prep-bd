import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
// Use the same Facebook comments component
import FacebookComments from "@/components/FacebookComments";
import { headers } from 'next/headers';

export const dynamic = "force-dynamic";

export default async function SingleEbookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch specific ebook details
  const { data: book } = await supabase
    .from("ebooks")
    .select("*")
    .eq("id", id)
    .single();

  if (!book) return notFound();

  // Prepare URL for comments
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const absoluteUrl = `${protocol}://${host}/ebooks/${id}`;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* TOP ACCENT BAR */}
      <div className="h-60 bg-blue-900 w-full absolute top-0 left-0 z-0"></div>

      <div className="max-w-5xl mx-auto px-6 relative z-10 pt-20">
        
        {/* BREADCRUMB */}
        <Link href="/ebooks" className="inline-flex items-center text-blue-200 hover:text-white mb-8 font-bold text-sm transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Library
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            
            {/* MAIN CONTENT GRID */}
            <div className="md:flex">
                
                {/* LEFT SIDE - COVER IMAGE & DOWNLOAD ACTION */}
                <div className="md:w-1/3 bg-gray-100 p-8 flex flex-col items-center justify-center border-r border-gray-100">
                    <div className="w-full max-w-[240px] aspect-[3/4] bg-white p-2 rounded-lg shadow-md relative mb-6">
                        {book.cover_url ? (
                            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover rounded" />
                        ) : (
                             <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center text-gray-400 font-bold">
                                <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                No Cover
                             </div>
                        )}
                    </div>

                    {/* MAIN DOWNLOAD BUTTON */}
                    <a 
                        href={book.pdf_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full max-w-[240px] bg-blue-600 hover:bg-blue-700 text-white text-center py-4 rounded-xl font-extrabold text-lg shadow-lg shadow-blue-200 transition-all hover:scale-105 flex items-center justify-center gap-3"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Download / Read PDF
                    </a>
                     <p className="text-xs text-gray-500 mt-3 font-medium">File type: PDF • Free Access</p>
                </div>

                {/* RIGHT SIDE - BOOK DETAILS & RICH DESCRIPTION */}
                <div className="md:w-2/3 p-8 md:p-12">
                    {/* Metadata Badges */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        <span className="bg-blue-100 text-blue-800 text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">
                            {book.category}
                        </span>
                        {book.author && (
                             <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center">
                                🔍 Author: {book.author}
                             </span>
                        )}
                         <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center">
                            📅 Added: {new Date(book.created_at).toLocaleDateString()}
                         </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 leading-tight">
                        {book.title}
                    </h1>

                    {/* RICH TEXT DESCRIPTION BODY */}
                    <div className="prose prose-lg prose-blue max-w-none text-gray-700">
                        {book.description ? (
                             <div dangerouslySetInnerHTML={{ __html: book.description }} />
                        ) : (
                            <p className="text-gray-400 italic">No detailed description available for this book.</p>
                        )}
                    </div>

                    {/* TAGS */}
                    {book.tags && book.tags.length > 0 && (
                        <div className="mt-10 pt-6 border-t border-gray-100">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.5 3A2.5 2.5 0 003 5.5v2.879a2.5 2.5 0 00.732 1.767l6.5 6.5a2.5 2.5 0 003.536 0l2.878-2.878a2.5 2.5 0 000-3.536l-6.5-6.5A2.5 2.5 0 0011.379 3H5.5zM6 7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                                Related Tags:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {book.tags.map((tag: string, index: number) => (
                                    <span key={index} className="bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors cursor-default">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* COMMENT SECTION */}
        <div className="mt-12 max-w-4xl mx-auto">
             <FacebookComments url={absoluteUrl} />
        </div>

      </div>
    </div>
  );
}
// Deployment Attempt: Final Live Push