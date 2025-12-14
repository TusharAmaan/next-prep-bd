import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function Level1_Groups({ params }: { params: Promise<{ segment_slug: string }> }) {
  const { segment_slug } = await params;
  
  // 1. Get Segment
  const { data: segment } = await supabase.from("segments").select("*").eq("slug", segment_slug).single();
  if (!segment) return notFound();

  // 2. Get Groups
  const { data: groups } = await supabase.from("groups").select("*").eq("segment_id", segment.id).order("id");

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-blue-900">{segment.title}</h1>
        
        {(!groups || groups.length === 0) ? (
            <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
                No groups found. Please add them in the Admin Panel.
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => (
                <Link 
                  key={group.id} 
                  href={`/resources/${segment.slug}/${group.slug}`} 
                  // --- THE FIX IS HERE (Added the missing class string) ---
                  className="block bg-white p-6 rounded shadow hover:border-blue-500 border border-transparent transition"
                >
                  <h2 className="text-xl font-bold text-gray-800">{group.title}</h2>
                  <p className="text-blue-600 text-sm mt-2">View Subjects &rarr;</p>
                </Link>
              ))}
            </div>
        )}
      </div>
    </div>
  );
}