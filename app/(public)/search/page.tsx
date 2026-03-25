import { createClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { Search, BookOpen, Newspaper, HelpCircle, FileText, ChevronRight, Filter } from "lucide-react";
import URLPagination from "@/components/shared/URLPagination";

interface Props {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", type = "all", page = "1" } = await searchParams;
  const currentPage = parseInt(page) || 1;
  const pageSize = 12;
  const supabase = await createClient();

  // 1. FETCH DATA FROM MULTIPLE TABLES
  // In a real multi-table search, we'd ideally use a unified search view or separate queries
  
  const searchResults: any[] = [];
  let totalCount = 0;

  if (q) {
    const qLower = `%${q.toLowerCase()}%`;

    const [courses, news, questions, resources] = await Promise.all([
      supabase.from("courses").select("id, title, teaser, image_url, created_at").ilike("title", qLower).limit(5),
      supabase.from("news").select("id, title, excerpt, image_url, created_at").ilike("title", qLower).limit(5),
      supabase.from("question_bank").select("id, question_text, created_at").ilike("question_text", qLower).limit(5),
      supabase.from("resources").select("id, title, type, created_at").ilike("title", qLower).limit(10),
    ]);

    // Format results
    if (courses.data) courses.data.forEach(c => searchResults.push({ ...c, searchType: 'Course', icon: BookOpen, link: `/courses/${c.id}` }));
    if (news.data) news.data.forEach(n => searchResults.push({ ...n, searchType: 'News', icon: Newspaper, link: `/news/${n.id}` }));
    if (questions.data) questions.data.forEach(q => searchResults.push({ ...q, title: q.question_text, searchType: 'Question', icon: HelpCircle, link: `/question-bank` }));
    if (resources.data) resources.data.forEach(r => searchResults.push({ ...r, searchType: r.type, icon: FileText, link: `/study-material` }));
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 pt-32">
       <div className="max-w-7xl mx-auto px-6">
          
          {/* Search Header */}
          <div className="mb-12">
             <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                Search Results for <span className="text-indigo-600">"{q}"</span>
             </h1>
             <p className="text-slate-500 font-medium">Found {searchResults.length} matching items across the platform.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
             
             {/* Sidebar Filters */}
             <div className="lg:col-span-1 space-y-8">
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                   <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                      <Filter className="w-5 h-5 text-indigo-600" /> Filter by Type
                   </h3>
                   <div className="space-y-2">
                      {['All', 'Courses', 'News', 'Questions', 'Materials'].map((t) => (
                         <Link 
                           key={t}
                           href={`/search?q=${q}&type=${t.toLowerCase()}`}
                           className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                             type === t.toLowerCase() || (type === 'all' && t === 'All')
                             ? 'bg-indigo-600 text-white shadow-lg'
                             : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                           }`}
                         >
                            {t}
                            <ChevronRight className="w-4 h-4 opacity-50" />
                         </Link>
                      ))}
                   </div>
                </div>
             </div>

             {/* Results Grid */}
             <div className="lg:col-span-3">
                {searchResults.length > 0 ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {searchResults.map((item, i) => (
                         <Link 
                           key={i} 
                           href={item.link}
                           className="group bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full"
                         >
                            <div className="flex items-start justify-between mb-4">
                               <div className={`p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors`}>
                                  <item.icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-100 text-slate-500 rounded-full group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                   {item.searchType}
                                </span>
                            </div>
                            <h4 className="text-lg font-black text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                               {item.title}
                            </h4>
                            <p className="text-sm text-slate-500 font-medium line-clamp-2 flex-grow mb-6">
                               {item.teaser || item.excerpt || `Experience premium learning content in our ${item.searchType} section.`}
                            </p>
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                               <span className="text-[10px] font-bold text-slate-400 capitalize">
                                  {new Date(item.created_at).toLocaleDateString()}
                               </span>
                               <span className="text-indigo-600 text-xs font-black uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                                  View Details <ChevronRight className="w-3.5 h-3.5" />
                               </span>
                            </div>
                         </Link>
                      ))}
                   </div>
                ) : (
                   <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-sm">
                      <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                         <Search className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 mb-2">No results found</h3>
                      <p className="text-slate-500 font-medium mb-8">We couldn't find anything matching "{q}". Try different keywords or browse categories.</p>
                      <Link href="/" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all">
                         Back to Home
                      </Link>
                   </div>
                )}

                {searchResults.length > 0 && totalCount > pageSize && (
                  <URLPagination 
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalCount / pageSize)}
                    baseUrl="/search"
                    additionalParams={{ q }}
                  />
                )}
             </div>
          </div>
       </div>
    </div>
  );
}