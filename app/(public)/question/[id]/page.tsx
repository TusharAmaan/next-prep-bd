import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar"; 
import BlogTOC from "@/components/BlogTOC"; 
import ScrollToTop from "@/components/ScrollToTop"; 
import BlogContentWrapper from "@/components/public/BlogContentWrapper"; 
import Discussion from "@/components/shared/Discussion";
import TypographyScaler from "@/components/shared/TypographyScaler";
import { headers } from 'next/headers';
import 'katex/dist/katex.min.css'; 
import { Metadata } from 'next';
import { Noto_Serif_Bengali } from "next/font/google";
import { getBreadcrumbSchema, getArticleSchema } from "@/lib/seo-utils";

export const dynamic = "force-dynamic";

const bengaliFont = Noto_Serif_Bengali({ 
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"], 
  display: "swap",
});

function getQueryColumn(param: string) {
  const isNumeric = /^\d+$/.test(param);
  return isNumeric ? 'id' : 'slug';
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const column = getQueryColumn(id);

  const { data: post } = await supabase
    .from('resources')
    .select('title, seo_title, seo_description, content_url, tags')
    .eq(column, id)
    .eq("status", "approved")
    .single();

  if (!post) return { title: 'Question Not Found' };

  return {
    title: post.seo_title || post.title, 
    description: post.seo_description || `Detail solution and explanation for ${post.title}. Level up your preparation with NextPrepBD verified resources.`,
    keywords: post.tags,
    alternates: {
      canonical: `/question/${id}`,
    },
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description,
      images: post.content_url ? [post.content_url] : [],
      type: 'article',
      url: `https://nextprepbd.com/question/${id}`,
    },
  };
}

export default async function SingleQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const column = getQueryColumn(id);

  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  const isLoggedIn = !!user;

  const { data: post } = await supabase
    .from("resources")
    .select("*, subjects(title, groups(title, segments(title)))")
    .eq(column, id)
    .single();

  if (!post || post.type !== 'question') return notFound();

  const { data: linkedQuestions } = await supabase
    .from('resource_questions')
    .select(`
      order_index,
      question:question_bank!question_id (
        id, question_text, question_type, marks, explanation,
        options:question_options(option_text, is_correct),
        sub_questions:question_bank!parent_id(
           id, question_text, question_type, marks, explanation,
           options:question_options(option_text, is_correct)
        )
      )
    `)
    .eq('resource_id', post.id)
    .order('order_index');

  const questions = linkedQuestions?.map(lq => lq.question).filter(q => q !== null) || [];

  const wordCount = post.content_body ? post.content_body.replace(/<[^>]+>/g, '').split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  
  const currentUrl = `https://nextprepbd.com/question/${id}`;

  // SEO schemas
  const breadcrumbItems = [
    { name: "Home", item: "https://nextprepbd.com" },
    { name: "Question Bank", item: "https://nextprepbd.com/resources" }, // Generic for accessibility
    { name: post.subjects?.title || "Subject", item: `https://nextprepbd.com/resources` },
    { name: post.title, item: currentUrl }
  ];

  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbItems);
  const articleSchema = getArticleSchema({
    title: post.title,
    description: post.seo_description || post.title.substring(0, 160),
    image: post.content_url || "https://nextprepbd.com/og-image.png",
    authorName: "NextPrepBD Specialist",
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pt-32 pb-20 relative transition-colors duration-300 ${bengaliFont.className}`}>
        <TypographyScaler />
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 grid grid-cols-1 xl:grid-cols-12 gap-12 relative">
          
          {/* LEFT TOC */}
          <aside className="hidden xl:block xl:col-span-2 relative">
              <div className="sticky top-32">
                  <div className="mb-6 flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                      <span className="w-8 h-px bg-slate-200 dark:bg-slate-800"></span>
                      Navigation
                  </div>
                  <BlogTOC content={post.content_body || ""} />
              </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="xl:col-span-7 lg:col-span-8 col-span-1">
              <BlogContentWrapper 
                  post={post} 
                  questions={questions}
                  formattedDate={formattedDate}
                  readTime={readTime}
                  bengaliFontClass={bengaliFont.className} 
                  isLoggedIn={isLoggedIn}
              />

              <div className="mt-16 comments-section print:hidden bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 md:p-12 shadow-sm transition-colors">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-4 uppercase tracking-tighter">
                      <span className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm">💬</span>
                      Community Solutions
                  </h3>
                  <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 min-h-[100px] flex justify-center border border-slate-100 dark:border-slate-800 shadow-inner">
                      <Discussion itemType="question" itemId={post.id.toString()} />
                  </div>
              </div>
              
              <div className="xl:hidden mt-8">
                  <BlogTOC content={post.content_body || ""} />
              </div>
          </main>

          {/* RIGHT SIDEBAR */}
          <aside className="xl:col-span-3 lg:col-span-4 col-span-1 space-y-8 print:hidden">
              <div className="sticky top-32">
                <Sidebar />
              </div>
          </aside>

        </div>
        <ScrollToTop />
      </div>
    </>
  );
}