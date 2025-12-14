import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function Level3_Resources({ params }: { params: Promise<{ segment_slug: string, group_slug: string, subject_slug: string }> }) {
  const { segment_slug, group_slug, subject_slug } = await params;

  // 1. Fetch Subject directly by its slug (Simple and robust)
  const { data: subject } = await supabase
    .from("subjects")
    .select("*")
    .eq("slug", subject_slug)
    .single();

  if (!subject) {
    return notFound(); // If subject doesn't exist, show 404
  }

  // 2. Fetch Resources for this Subject
  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .eq("subject_id", subject.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumb - Navigation Bar */}
        <div className="text-sm text-gray-500 mb-8 uppercase tracking-wide">
          <Link href="/" className="hover:text-blue-600">Home</Link> / 
          <Link href={`/resources/${segment_slug}`} className="hover:text-blue-600 mx-1">{segment_slug}</Link> / 
          <Link href={`/resources/${segment_slug}/${group_slug}`} className="hover:text-blue-600 mx-1">{group_slug}</Link> / 
          <span className="text-gray-900 font-bold ml-1">Materials</span>
        </div>

        {/* Title Section */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{subject.title}</h1>
        <div className="w-20 h-1 bg-blue-600 mb-8"></div>

        {/* Resource List */}
        {(!resources || resources.length === 0) ? (
          <div className="p-8 bg-gray-50 rounded text-center border border-gray-200">
            <p className="text-gray-500 mb-2">No study materials uploaded yet.</p>
            <p className="text-sm text-gray-400">(Admin: Go to Dashboard &rarr; Select {subject.title} &rarr; Upload PDF/Video)</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {resources.map((res) => (
              <a 
                key={res.id} 
                href={res.content_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 hover:shadow-sm transition group"
              >
                {/* Icon based on Type */}
                <div className={`p-3 rounded-full mr-4 ${res.type === 'video' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                   {res.type === 'video' ? (
                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                   ) : (
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                   )}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-700">{res.title}</h3>
                  <p className="text-xs text-gray-500 uppercase mt-1">{res.type}</p>
                </div>
                
                <span className="text-gray-400 group-hover:text-blue-600">&rarr;</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}