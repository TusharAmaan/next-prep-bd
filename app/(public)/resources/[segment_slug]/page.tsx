import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

async function getData(subjectSlug: string) {
  // 1. Get Subject Details
  const { data: subject } = await supabase.from("subjects").select("*").eq("slug", subjectSlug).single();
  if (!subject) return null;

  // 2. Get Resources (PDFs/Videos) for this subject
  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .eq("subject_id", subject.id)
    .order("created_at", { ascending: false });

  return { subject, resources: resources || [] };
}

export default async function ResourcePage({ params }: { params: Promise<{ segment_slug: string, group_slug: string, subject_slug: string }> }) {
  const { segment_slug, group_slug, subject_slug } = await params;
  const data = await getData(subject_slug);

  if (!data) return notFound();

  const { subject, resources } = data;

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-8">
          <Link href={`/resources/${segment_slug}/${group_slug}`} className="hover:underline">&larr; Back to Subjects</Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{subject.title}</h1>
        <p className="text-gray-500 mb-10">Study Materials, Videos & PDFs</p>

        {resources.length === 0 ? (
          <div className="p-8 bg-gray-50 rounded text-center border border-gray-200">
            <p className="text-gray-500">No resources uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resources.map((res) => (
              <div key={res.id} className="p-4 border rounded-lg hover:bg-gray-50 transition flex items-start gap-4">
                {/* ICON Based on Type */}
                <div className={`p-3 rounded-full ${res.type === 'video' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                   {res.type === 'video' ? (
                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                   ) : (
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                   )}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800">{res.title}</h3>
                  <a 
                    href={res.content_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`inline-block mt-2 text-sm font-bold ${res.type === 'video' ? 'text-red-600 hover:text-red-800' : 'text-blue-600 hover:text-blue-800'}`}
                  >
                    {res.type === 'video' ? 'Watch Video' : 'Download PDF'} &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}