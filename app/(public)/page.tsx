import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch the exams (SSC, HSC, etc.)
  const { data: segments } = await supabase
    .from("segments")
    .select("*")
    .order("id");

  // Helper function to get a random cool color for each card
  const getGradient = (index: number) => {
    const gradients = [
      "from-blue-500 to-blue-700",       // Blue (HSC style)
      "from-orange-500 to-red-600",      // Orange (SSC style)
      "from-green-500 to-emerald-700",   // Green (Class 9 style)
      "from-purple-500 to-indigo-700",   // Purple
      "from-pink-500 to-rose-700",       // Pink
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* 1. HERO SECTION (The Big Dark Banner) */}
      <div className="relative bg-[#0a0a0a] text-white py-20 px-6 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-900/30 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Potential</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            The ultimate platform for SSC, HSC, and University Admission preparation. 
            Start learning today with our curated resources.
          </p>
          
          <div className="flex justify-center gap-4">
            <a href="#segments" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition shadow-lg shadow-blue-900/50">
              Start Learning &rarr;
            </a>
            <Link href="/login" className="px-8 py-3 rounded-full font-bold border border-gray-600 hover:border-gray-400 hover:bg-white/5 transition">
              Admin Login
            </Link>
          </div>
        </div>
      </div>

      {/* 2. SEGMENTS GRID (The Colorful Cards) */}
      <div id="segments" className="max-w-6xl mx-auto py-16 px-6">
        <div className="flex items-center gap-2 mb-8">
           <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
           <h2 className="text-2xl font-bold text-gray-900">Select Your Class</h2>
        </div>

        {(!segments || segments.length === 0) ? (
          <div className="text-center p-10 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500">No categories found.</p>
            <p className="text-sm text-blue-500 mt-2">Go to Admin Panel to add SSC/HSC categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {segments.map((segment, index) => (
              <Link 
                key={segment.id} 
                href={`/resources/${segment.slug}`}
                className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 transition-all hover:-translate-y-1 overflow-hidden"
              >
                {/* Colorful Header inside the card */}
                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${getGradient(index)}`}></div>
                
                <div className="flex items-start justify-between mb-4 mt-2">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getGradient(index)} flex items-center justify-center text-white shadow-md`}>
                    {/* Simple Icon (First Letter of Title) */}
                    <span className="text-xl font-bold">{segment.title.charAt(0)}</span>
                  </div>
                  <span className="text-gray-300 group-hover:text-blue-500 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                  {segment.title}
                </h3>
                <p className="text-sm text-gray-500">
                  Explore subjects & materials &rarr;
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Simple Footer */}
      <footer className="bg-white border-t py-8 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} NextPrep BD. All rights reserved.</p>
      </footer>

    </div>
  );
}