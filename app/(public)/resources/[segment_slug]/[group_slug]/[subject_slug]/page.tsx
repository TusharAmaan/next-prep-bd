import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function Level3_Resources({ params }: { params: Promise<{ segment_slug: string, group_slug: string, subject_slug: string }> }) {
  const { segment_slug, group_slug, subject_slug } = await params;

  // --- 1. ROBUST SUBJECT SEARCH ---
  // We use .limit(1).maybeSingle() instead of .single()
  // This prevents the "404 Crash" if you accidentally added the same subject twice (e.g. in 'Science' and 'All')
  const { data: subject } = await supabase
    .from("subjects")
    .select("*")
    .eq("slug", subject_slug)
    .limit(1)
    .maybeSingle();

  if (!subject) {
    console.error(`Subject not found: ${subject_slug}`);
    return notFound();
  }

  // --- 2. FETCH RESOURCES ---
  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .eq("subject_id", subject.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="text-sm text-gray-500 mb-8 uppercase tracking-wide">
          <Link href={`/resources/${segment_slug}/${group_slug}`} className="hover:text-blue-600">
            &larr; Back to List
          </Link>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{subject.title}</h1>
        <div className="w-20 h-1 bg-blue-600 mb-8"></div>

        {/* Resources List */}
        {(!resources || resources.length === 0) ? (
          <div className="p-8 bg-gray-50 rounded border border-gray-200 text-center">
            <p className="text-gray-500 italic mb-2">No materials uploaded yet.</p>
            <p className="text-xs text-gray-400">(Admin: Check Admin Panel &rarr; Upload Content)</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {resources.map((res) => {
               // Safety check: Don't crash if a link is missing
               if (!res.content_url) return null;

               return (
                <a 
                  key={res.id} 
                  href={res.content_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-4 border rounded hover:bg-gray-50 transition hover:shadow-sm"
                >
                  {/* Icon */}
                  <div className={`mr-4 p-2 rounded-full ${res.type === 'video' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {res.type === 'video' ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    )}
                  </div>
                  
                  {/* Text */}
                  <div className="flex-1">
                    <span className="font-bold text-gray-800 block text-lg">{res.title}</span>
                    <span className="text-xs text-gray-500 uppercase">{res.type}</span>
                  </div>
                  
                  {/* Arrow */}
                  <span className="text-gray-400 font-bold">&rarr;</span>
                </a>
               );
            })}
          </div>
        )}
      </div>
    </div>
  );
}