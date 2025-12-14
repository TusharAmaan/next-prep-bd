import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function Level3_Resources({ params }: { params: Promise<{ segment_slug: string, group_slug: string, subject_slug: string }> }) {
  const { segment_slug, group_slug, subject_slug } = await params;

  // 1. Fetch Subject (Duplicate Safe)
  const { data: subject } = await supabase
    .from("subjects")
    .select("*")
    .eq("slug", subject_slug)
    .limit(1)
    .maybeSingle();

  if (!subject) return notFound();

  // 2. Fetch Resources
  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .eq("subject_id", subject.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation Breadcrumb (High Contrast) */}
        <div className="text-sm font-bold text-gray-600 mb-8 uppercase tracking-wide">
          <Link href={`/resources/${segment_slug}/${group_slug}`} className="hover:text-blue-700 hover:underline">
            &larr; Back to Subject List
          </Link>
        </div>

        {/* Page Title */}
        <h1 className="text-4xl font-extrabold text-black mb-4">{subject.title}</h1>
        <div className="w-24 h-2 bg-blue-600 mb-10 rounded"></div>

        {/* Resources List */}
        {(!resources || resources.length === 0) ? (
          <div className="p-10 bg-white rounded-xl border-2 border-dashed border-gray-400 text-center shadow-sm">
            <p className="text-gray-800 font-semibold text-lg mb-2">No materials uploaded yet.</p>
            <p className="text-sm text-gray-500">(Admin: Go to Dashboard &rarr; Upload Content)</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {resources.map((res) => {
               if (!res.content_url) return null;

               return (
                <a 
                  key={res.id} 
                  href={res.content_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:shadow-lg transition-all group"
                >
                  {/* Icon */}
                  <div className={`mr-5 p-3 rounded-lg shrink-0 ${res.type === 'video' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {res.type === 'video' ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    )}
                  </div>
                  
                  {/* Text */}
                  <div className="flex-1">
                    <span className="font-bold text-gray-900 block text-lg group-hover:text-blue-700 transition-colors">{res.title}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{res.type}</span>
                  </div>
                  
                  {/* Arrow */}
                  <span className="text-gray-400 font-extrabold text-xl group-hover:text-blue-600 group-hover:translate-x-1 transition-transform">&rarr;</span>
                </a>
               );
            })}
          </div>
        )}
      </div>
    </div>
  );
}