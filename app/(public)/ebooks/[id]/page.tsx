import { supabase } from "@/lib/supabaseClient";
import { parseHashtagsToHTML } from '@/utils/hashtagParser';
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from 'next';
import BookmarkButton from "@/components/shared/BookmarkButton";
import Discussion from "@/components/shared/Discussion";
import { BookOpen, User, Calendar, Download, Eye, ChevronRight, Share2, Info } from "lucide-react";
import { getBreadcrumbSchema, getProductSchema } from "@/lib/seo-utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  const { data: book } = await supabase
    .from('ebooks')
    .select('title, seo_title, seo_description, tags, cover_url, author')
    .eq('id', id)
    .single();

  if (!book) {
    return { title: 'Book Not Found' };
  }

  return {
    title: book.seo_title || book.title,
    description: book.seo_description || `Read or download ${book.title} by ${book.author} on NextPrepBD. Premium academic resource for candidates.`,
    keywords: book.tags,
    alternates: {
      canonical: `/ebooks/${id}`,
    },
    openGraph: {
      title: book.seo_title || book.title,
      description: book.seo_description,
      images: book.cover_url ? [book.cover_url] : [],
      type: 'book',
      url: `https://nextprepbd.com/ebooks/${id}`,
    },
  };
}

export default async function EbookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: book } = await supabase
    .from("ebooks")
    .select("*")
    .eq("id", id)
    .single();

  if (!book) return notFound();

  const currentUrl = `https://nextprepbd.com/ebooks/${id}`;

  const breadcrumbItems = [
    { name: "Home", item: "https://nextprepbd.com" },
    { name: "Library", item: "https://nextprepbd.com/ebooks" },
    { name: book.title, item: currentUrl }
  ];

  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems);
  const productSchema = getProductSchema({
    name: book.title,
    description: book.seo_description || book.title,
    image: book.cover_url || "https://nextprepbd.com/og-image.png",
    sku: `EB-${book.id}`,
    brandName: "NextPrepBD",
    category: book.category,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pt-32 pb-20 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6">
          
          {/* BREADCRUMB */}
          <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-12">
              <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link> 
              <ChevronRight className="w-3 h-3" /> 
              <Link href="/ebooks" className="hover:text-indigo-600 transition-colors">Archive</Link> 
              <ChevronRight className="w-3 h-3" />
              <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">{book.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              
              {/* LEFT: COVER & ACTION (5 Cols) */}
              <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
                  <div className="relative group perspective-1000">
                      <div className="bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 aspect-[3/4] mb-8 relative transition-transform duration-700 group-hover:rotate-y-12 group-hover:scale-105">
                          {book.cover_url ? (
                              <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 font-black">
                                  <BookOpen className="w-16 h-16 mb-4 opacity-50" />
                                  <span className="text-[10px] uppercase tracking-widest">Asset Not Visualized</span>
                              </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      </div>
                  </div>
                  
                  <div className="space-y-4">
                      {book.pdf_url ? (
                          <div className="flex gap-4">
                              <a 
                                  href={book.pdf_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-[0.2em] text-center rounded-2xl transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 hover:scale-105 active:scale-95"
                              >
                                  <Eye className="w-4 h-4" /> Initiate Access
                              </a>
                              <div className="bg-white dark:bg-slate-900 rounded-2xl p-1 border border-slate-100 dark:border-slate-800 shadow-xl flex items-center">
                                  <BookmarkButton 
                                      itemType="ebook" 
                                      itemId={book.id} 
                                      metadata={{ title: book.title, thumbnail_url: book.cover_url }} 
                                  />
                              </div>
                          </div>
                      ) : (
                          <div className="bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 p-6 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] text-center border border-amber-100 dark:border-amber-800/50 flex flex-col items-center gap-3">
                              <Info className="w-6 h-6 animate-pulse" />
                              Interactive view Unavailable - scan description below
                          </div>
                      )}
                  </div>
              </div>

              {/* RIGHT: INFO & DESCRIPTION (7 Cols) */}
              <div className="lg:col-span-8">
                  <div className="mb-10">
                      <div className="flex flex-wrap items-center gap-4 mb-8">
                          <span className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20">{book.category}</span>
                          <span className="flex items-center gap-2 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200/50 dark:border-slate-800">
                             <Calendar className="w-4 h-4" /> Uploaded {new Date(book.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                          </span>
                      </div>
                      
                      <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 leading-[1.1] uppercase tracking-tighter">{book.title}</h1>
                      <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-black text-[11px] uppercase tracking-widest mb-12">
                          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-inner">
                              <User className="w-5 h-5 text-indigo-500" />
                          </div>
                          By <span className="text-slate-900 dark:text-white">{book.author}</span>
                      </div>

                      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
                          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-10 flex items-center gap-4 uppercase tracking-tighter border-b border-slate-50 dark:border-slate-800 pb-6">
                             <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-inner"><Info size={20} /></div>
                             Institutional Abstract & Links
                          </h3>
                          <div className="prose prose-indigo dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                              <div dangerouslySetInnerHTML={{ __html: book.description ? parseHashtagsToHTML(book.description) : "" }} className="[&_a]:text-indigo-600 dark:[&_a]:text-indigo-400 [&_a]:underline [&_p]:mb-6 last:[&_p]:mb-0" />
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* DISCUSSION SECTION */}
          <div className="mt-24 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-8 md:p-16 shadow-xl dark:shadow-indigo-950/20 transition-colors duration-300">
             <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">Public Discourse</h3>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Share insights with the community</p>
                </div>
                <div className="flex gap-4">
                    <button className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-2xl hover:text-indigo-600 transition-all shadow-inner"><Share2 size={20} /></button>
                </div>
             </div>
             <div className="bg-slate-50 dark:bg-slate-950/50 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-900 shadow-inner">
                <Discussion itemType="ebook" itemId={book.id.toString()} />
             </div>
          </div>
        </div>
      </div>
    </>
  );
}