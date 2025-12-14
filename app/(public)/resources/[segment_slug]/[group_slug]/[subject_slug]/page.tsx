import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function Level3_Resources({ params }: { params: Promise<{ segment_slug: string, group_slug: string, subject_slug: string }> }) {
  const { segment_slug, group_slug, subject_slug } = await params;

  const { data: subject } = await supabase.from("subjects").select("*").eq("slug", subject_slug).single();
  if (!subject) return notFound();

  const { data: resources } = await supabase.from("resources").select("*").eq("subject_id", subject.id).order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
         <div className="text-sm text-gray-500 mb-6 uppercase">
           <Link href={`/resources/${segment_slug}/${group_slug}`} className="hover:underline">&larr; Back to {group_slug}</Link>
        </div>
        <h1 className="text-4xl font-bold mb-8">{subject.title}</h1>
        <div className="space-y-4">
          {resources?.map((res) => (
            <a key={res.id} href={res.content_url} target="_blank" className="flex items-center p-4 border rounded hover:bg-gray-50">
               <span className={`mr-4 px-2 py-1 text-xs font-bold uppercase rounded ${res.type === 'video' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                 {res.type}
               </span>
               <span className="font-medium">{res.title}</span>
            </a>
          ))}
          {(!resources || resources.length === 0) && <p className="text-gray-500">No content uploaded yet.</p>}
        </div>
      </div>
    </div>
  );
}