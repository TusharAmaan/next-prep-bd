import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// Force dynamic rendering so database changes show immediately
export const dynamic = "force-dynamic";

export default async function Level1_GroupsModalStyle({ params }: { params: Promise<{ segment_slug: string }> }) {
  const { segment_slug } = await params;
  
  // 1. Get Segment details (e.g., SSC)
  const { data: segment } = await supabase.from("segments").select("*").eq("slug", segment_slug).single();
  if (!segment) return notFound();

  // 2. Get Groups for this segment (e.g., Science, Arts)
  const { data: groups } = await supabase.from("groups").select("*").eq("segment_id", segment.id).order("id");

  // Helper to create acronyms from group titles (e.g. "Business Studies" -> "BS")
  const getAcronym = (title: string) => title.split(' ').map(w => w[0]).join('').toUpperCase();

  return (
    // --- MODAL OVERLAY BACKGROUND ---
    // This creates the dark, blurred background effect
    <div className="min-h-[calc(100vh-64px)] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      
      {/* --- MODAL CONTAINER --- */}
      {/* The centered white box */}
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* MODAL HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white">
            <div>
                 <h1 className="text-2xl font-extrabold text-gray-800">{segment.title} Selection</h1>
                 <p className="text-sm text-gray-500">Choose your group to proceed</p>
            </div>
             {/* Close Button (Redirects to Home) */}
             <Link href="/" className="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
             </Link>
        </div>

        {/* MODAL CONTENT AREA (GRAY BG) */}
        <div className="p-6 md:p-8 bg-gray-50 max-h-[70vh] overflow-y-auto">
            
            {(!groups || groups.length === 0) ? (
                <div className="p-8 bg-white rounded-xl text-center shadow text-gray-500">
                    No groups found for {segment.title}. (Admin: Add groups in dashboard).
                </div>
            ) : (
                // GRID LAYOUT LIKE REFERENCE IMAGE (3 per row on large screens)
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                    <Link 
                    key={group.id} 
                    href={`/resources/${segment.slug}/${group.slug}`} 
                    className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-200 hover:border-blue-300 hover:-translate-y-1"
                    >
                        {/* 1. RED TOP BANNER */}
                        <div className="bg-[#DC3545] text-white text-[10px] font-bold text-center py-1.5 uppercase tracking-widest leading-none">
                            {segment.title} | Online Batch
                        </div>

                        <div className="p-6 text-center">
                            {/* 2. BOLD TITLE & ACRONYM */}
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
                                {getAcronym(group.title)}
                            </h2>
                            <h3 className="text-sm font-bold text-gray-600 mb-5">{group.title}</h3>

                            {/* 3. IMAGE PLACEHOLDER (You can replace this later) */}
                            <div className="w-full h-32 bg-gray-100 rounded-lg mb-5 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-300 group-hover:border-blue-200 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 opacity-50">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                </svg>
                                <span className="text-xs font-medium">Image Placeholder</span>
                            </div>

                            {/* 4. DESCRIPTION PLACEHOLDER */}
                            <p className="text-xs text-gray-500 mb-6 px-2 leading-relaxed">
                                Complete preparation package for {group.title} students. Click details to explore all subjects.
                            </p>

                            {/* 5. GREEN FOOTER LINK */}
                            <div className="inline-flex items-center text-[#198754] font-bold text-sm group-hover:underline">
                                View Details 
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform">
                                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}