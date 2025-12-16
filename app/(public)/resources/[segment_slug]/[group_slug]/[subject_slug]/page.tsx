import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

// UPDATED PARAMS HERE
export default async function SubjectPage({ params }: { params: Promise<{ segment_slug: string; group_slug: string; subject_slug: string }> }) {
  const { segment_slug, group_slug, subject_slug } = await params;

  // 1. Fetch Segment
  const { data: segmentData } = await supabase
    .from("segments")
    .select("id, title")
    .eq("slug", segment_slug)
    .single();
  
  if (!segmentData) return notFound();

  // 2. Fetch Group (must belong to segment)
  const { data: groupData } = await supabase
    .from("groups")
    .select("id, title")
    .eq("slug", group_slug)
    .eq("segment_id", segmentData.id)
    .single();

  if (!groupData) return notFound();

  // 3. Fetch Subject (must belong to group)
  const { data: subjectData } = await supabase
    .from("subjects")
    .select("id, title")
    .eq("slug", subject_slug)
    .eq("group_id", groupData.id)
    .single();

  if (!subjectData) return notFound();

  // 4. Fetch Resources
  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .eq("subject_id", subjectData.id)
    .order("created_at", { ascending: false });

  // 5. Fetch Sidebar Data
  const { data: relatedEbooks } = await supabase.from("ebooks").select("*").eq("category", segmentData.title).limit(4);
  const { data: relatedCourses } = await supabase.from("courses").select("*").limit(3);

  // Filter types
  const pdfResources = resources?.filter(r => r.type === 'pdf') || [];
  const videoResources = resources?.filter(r => r.type === 'video') || [];
  const questionResources = resources?.filter(r => r.type === 'question') || [];

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-20">
      
      {/* PAGE HEADER */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                <Link href="/" className="hover:text-blue-600">Home</Link> / 
                <Link href={`/resources/${segment_slug}/${group_slug}`} className="hover:text-blue-600">{groupData.title}</Link> /
                <span className="text-blue-600">{subjectData.title}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">{subjectData.title}</h1>
            <p className="text-gray-500 max-w-2xl">Access complete study materials, chapter-wise notes, video lectures, and previous year board questions.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT CONTENT (8 Cols) */}
            <div className="lg:col-span-8 space-y-10">
                
                {/* 1. STUDY MATERIALS (PDFs) */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-600 p-1 rounded">📄</span> Study Materials
                    </h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {pdfResources.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {pdfResources.map(res => (
                                    <div key={res.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                                        <div className="flex items-center gap-3">
                                            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H8z" clipRule="evenodd"/></svg>
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-sm">{res.title}</h4>
                                                <span className="text-xs text-gray-400">PDF Document</span>
                                            </div>
                                        </div>
                                        <a href={res.content_url} target="_blank" className="bg-blue-50 text-blue-600 text-xs font-bold px-4 py-2 rounded-full hover:bg-blue-600 hover:text-white transition">Download</a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-400 italic">No notes uploaded yet.</div>
                        )}
                    </div>
                </section>

                {/* 2. PREVIOUS YEAR QUESTIONS */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="bg-yellow-100 text-yellow-700 p-1 rounded">❓</span> Previous Year Questions
                    </h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {questionResources.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {questionResources.map(res => (
                                    <div key={res.id} className="p-4 flex justify-between items-center hover:bg-yellow-50 transition">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">📝</span>
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-sm">{res.title}</h4>
                                                <span className="text-xs text-gray-400">Board Question</span>
                                            </div>
                                        </div>
                                        <a href={res.content_url} target="_blank" className="bg-yellow-100 text-yellow-700 text-xs font-bold px-4 py-2 rounded-full hover:bg-yellow-600 hover:text-white transition">View PDF</a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-400 italic bg-gray-50">
                                No previous questions uploaded yet.
                            </div>
                        )}
                    </div>
                </section>

                {/* 3. VIDEO LECTURES */}
                {videoResources.length > 0 && (
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="bg-red-100 text-red-600 p-1 rounded">🎬</span> Video Classes
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {videoResources.map(video => (
                                <a href={video.content_url} target="_blank" key={video.id} className="block group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition">
                                    <div className="h-40 bg-gray-900 relative flex items-center justify-center">
                                        <div className="text-white flex flex-col items-center">
                                            <svg className="w-12 h-12 opacity-80 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-bold text-gray-800 text-sm line-clamp-2 group-hover:text-blue-600">{video.title}</h4>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* RIGHT SIDEBAR (4 Cols) */}
            <div className="lg:col-span-4 space-y-8">
                <Sidebar />
                
                {/* RECOMMENDED EBOOKS */}
                {relatedEbooks && relatedEbooks.length > 0 && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b">Recommended Books</h3>
                        <div className="space-y-4">
                            {relatedEbooks.map(book => (
                                <Link href={`/ebooks/${book.id}`} key={book.id} className="flex gap-3 group">
                                    <div className="w-12 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden border">
                                        {book.cover_url && <img src={book.cover_url} className="w-full h-full object-cover" />}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 leading-tight">{book.title}</h4>
                                        <p className="text-xs text-gray-400 mt-1">{book.author}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <Link href="/ebooks" className="block mt-4 text-center text-xs font-bold text-blue-600 hover:underline">View All eBooks</Link>
                    </div>
                )}

                {/* RECOMMENDED COURSES */}
                {relatedCourses && relatedCourses.length > 0 && (
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-lg">
                        <h3 className="font-bold text-lg mb-4 border-b border-gray-700 pb-2">Premium Courses</h3>
                        <div className="space-y-4">
                            {relatedCourses.map(course => (
                                <Link href={`/courses/${course.id}`} key={course.id} className="block group">
                                    <h4 className="font-bold text-sm group-hover:text-blue-300">{course.title}</h4>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-xs text-gray-400">{course.duration}</span>
                                        <span className="text-xs font-bold text-green-400">{course.price || "Free"}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
}