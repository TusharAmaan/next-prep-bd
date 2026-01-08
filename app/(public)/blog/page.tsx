import { supabase } from "@/lib/supabaseClient";
import ProfessionalAppBanner from "@/components/ProfessionalAppBanner";
import BlogList from "@/components/BlogList";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 15;

export default async function BlogListPage() {
  
  // 1. Fetch All Segments for the Filter Bar
  const { data: segmentsData } = await supabase.from("segments").select("title").order("id");
  const segmentsList = ["All", ...(segmentsData?.map(s => s.title) || [])];

  // 2. Fetch Initial Blogs (Page 1)
  // UPDATED: Added 'slug' to the nested segments query to help build proper URLs if needed
  const { data: blogs, count } = await supabase
    .from("resources")
    .select(`
        id, title, content_body, created_at, content_url, type, seo_description,
        segment_id,
        subjects (
          groups (
            segments ( title, slug ) 
          )
        )
    `, { count: "exact" })
    .eq("type", "blog") // Currently only fetching blogs
    .order("created_at", { ascending: false })
    .range(0, ITEMS_PER_PAGE - 1);

  // 3. Format Data safely for the client
  const safeBlogs = blogs?.map((blog: any) => {
    
    // --- LINK GENERATION LOGIC ---
    // We pre-calculate the full URL here so the UI component doesn't have to guess.
    let link = `/blog/${blog.id}`; // Safe fallback to ID if no slug exists

    if (blog.content_url) {
        if (blog.type === 'blog') {
            link = `/blog/${blog.content_url}`;
        } else if (blog.type === 'news') {
            link = `/news/${blog.content_url}`;
        } else if (blog.type === 'updates') {
            // For updates, we reconstruct the complex path: resources/[segment]/updates/[slug]
            const segmentSlug = blog.subjects?.groups?.segments?.slug || 
                                blog.subjects?.groups?.segments?.title?.toLowerCase() || 
                                'general';
            link = `/resources/${segmentSlug}/updates/${blog.content_url}`;
        }
        // Add other types (ebooks, courses) here if you expand this page later
    }

    return {
        ...blog,
        segmentTitle: blog.subjects?.groups?.segments?.title || "General",
        link: link, // <--- The BlogList component should use this property for the href
    };
  }) || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="mb-8 text-center">
            <span className="text-blue-600 font-extrabold text-xs tracking-widest uppercase mb-3 block">
                Educational Resources
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Class <span className="text-blue-600">Blogs</span>
            </h1>
        </div>

        {/* CLIENT-SIDE LIST ENGINE */}
        <BlogList 
            initialBlogs={safeBlogs} 
            initialCount={count || 0} 
            segments={segmentsList} 
        />

        {/* APP BANNER */}
        <div className="mt-16">
            <ProfessionalAppBanner />
        </div>

      </div>
    </div>
  );
}