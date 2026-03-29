import { supabase } from "@/lib/supabaseClient";
import ProfessionalAppBanner from "@/components/ProfessionalAppBanner";
import BlogList from "@/components/BlogList";
import { Sparkles } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academic Journals & Blog",
  description: "Explore high-quality educational insights, exam strategies, and structured learning material curated for excellence on NextPrepBD.",
  alternates: {
    canonical: "/blog",
  },
};

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 15;

export default async function BlogListPage() {
  
  const { data: segmentsData } = await supabase.from("segments").select("title").order("id");
  const segmentsList = ["All", ...(segmentsData?.map(s => s.title) || [])];

  const { data: blogs, count } = await supabase
    .from("resources")
    .select(`
        id, title, content_body, created_at, content_url, type, seo_description, slug,
        segment_id,
        status,
        subjects (
          groups (
            segments ( title, slug ) 
          )
        )
    `, { count: "exact" })
    .eq("type", "blog")      
    .eq("status", "approved") 
    .order("created_at", { ascending: false })
    .range(0, ITEMS_PER_PAGE - 1);

  const safeBlogs = blogs?.map((blog: any) => {
    const identifier = blog.slug || blog.id;
    let link = `/blog/${identifier}`; 

    if (blog.type === 'news') {
        link = `/news/${identifier}`;
    } else if (blog.type === 'updates') {
        const seg = blog.subjects?.groups?.segments;
        const segmentSlug = seg?.slug || seg?.title?.toLowerCase() || 'general';
        link = `/resources/${segmentSlug}/updates/${identifier}`;
    }

    return {
        ...blog,
        segmentTitle: blog.subjects?.groups?.segments?.title || "Academy",
        link: link,
    };
  }) || [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "NextPrepBD Academic Journals",
    "description": "Educational insights, exam strategies, and learning material.",
    "url": "https://nextprepbd.com/blog",
    "publisher": {
      "@type": "Organization",
      "name": "NextPrepBD",
      "logo": "https://nextprepbd.com/icon.png"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
        
        {/* HERO SECTION */}
        <div className="bg-slate-900 text-white pt-32 md:pt-40 pb-20 md:pb-32 px-4 md:px-6 relative overflow-hidden border-b border-white/5">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none -mr-40 -mt-20"></div>
          <div className="max-w-7xl mx-auto relative z-10">
              <div className="max-w-3xl">
                  <div className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 md:mb-8 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full w-fit">
                      <Sparkles className="w-3.5 h-3.5" />
                      Knowledge Repository
                  </div>
                  <h1 className="text-4xl sm:text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[1] md:leading-[0.9] mb-6 md:mb-8">
                      Academic <br className="hidden md:block"/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Journals</span>
                  </h1>
                  <p className="text-base md:text-xl text-slate-400 font-medium leading-relaxed opacity-80">
                      Explore high-quality educational insights, exam strategies, and structured learning material curated for excellence.
                  </p>
              </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* CLIENT-SIDE LIST ENGINE */}
          <BlogList 
              initialBlogs={safeBlogs} 
              initialCount={count || 0} 
              segments={segmentsList} 
          />

          {/* APP BANNER */}
          <div className="px-4 md:px-6 pb-12 md:pb-20">
              <ProfessionalAppBanner />
          </div>
        </div>
      </div>
    </>
  );
}