import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

async function getSegments() {
  const { data } = await supabase.from("segments").select("*").order("id");
  return data || [];
}

export default async function Homepage() {
  const segments = await getSegments();

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      
      {/* HERO SECTION */}
      <header className="bg-blue-700 text-white py-20 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">NextPrepBD</h1>
        <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto">
          The comprehensive education portal for Bangladesh. 
          SSC, HSC, Admission, and Job Preparation all in one place.
        </p>
      </header>

      {/* CATEGORIES GRID */}
      <main className="max-w-6xl mx-auto py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-12 border-b pb-4 border-gray-200">
          Select Your Exam
        </h2>

        {segments.length === 0 ? (
          <p className="text-center text-gray-500">Loading categories...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {segments.map((seg) => (
              <Link 
                href={`/resources/${seg.slug}`} 
                key={seg.id}
                className="group block bg-gray-50 border border-gray-200 rounded-xl p-8 hover:shadow-xl hover:border-blue-500 transition-all transform hover:-translate-y-1"
              >
                <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-700">{seg.title}</h3>
                <p className="text-gray-500">Access resources for {seg.title}</p>
                <span className="inline-block mt-4 text-blue-600 font-medium group-hover:underline">
                  Enter &rarr;
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}