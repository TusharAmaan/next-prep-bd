import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import FacebookComments from "@/components/FacebookComments";
import { headers } from 'next/headers';

export const dynamic = "force-dynamic";

export default async function SingleCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch Course Details
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (!course) return notFound();

  // 2. Fix the Link Logic (The "Messy Link" Fix)
  let enrollLink = course.enrollment_link || "#";
  if (enrollLink !== "#" && !enrollLink.startsWith("http")) {
      enrollLink = `https://${enrollLink}`;
  }

  // 3. Prepare URL for comments
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const absoluteUrl = `${protocol}://${host}/courses/${id}`;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-20">
      
      {/* HERO SECTION (Dark Background) */}
      <div className="bg-gray-900 text-white py-12 md:py-16 px-6">
        <div className="max-w-7xl mx-auto md:flex gap-10 items-center">
            <div className="md:w-2/3">
                <div className="inline-block bg-blue-600 text-xs font-bold px-3 py-1 rounded-full mb-4">
                    {course.duration || "Self-Paced"} Course
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                    {course.title}
                </h1>
                <p className="text-gray-300 text-lg mb-6">
                    Master this subject with expert guidance. Comprehensive curriculum designed for exam success.
                </p>
                <div className="flex items-center gap-4 text-sm font-medium text-gray-400">
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                        Instructor: {course.instructor || "NextPrep Team"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                        Last Updated: {new Date(course.created_at).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 md:-mt-0 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* LEFT COLUMN: Course Info */}
        <div className="lg:col-span-2 py-10">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Course Overview</h3>
                <div 
                    className="prose prose-lg prose-blue max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: course.description || "<p>No description provided.</p>" }}
                />
            </div>

            {/* Q&A Section */}
            <div className="mt-12">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Student Discussion</h3>
                <FacebookComments url={absoluteUrl} />
            </div>
        </div>

        {/* RIGHT COLUMN: Sticky Enrollment Card */}
        <div className="lg:col-span-1">
            <div className="sticky top-24">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden transform -translate-y-20 md:translate-y-0">
                    {/* Thumbnail */}
                    <div className="h-48 bg-gray-100 relative">
                        {course.thumbnail_url ? (
                            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">No Preview</div>
                        )}
                        {/* Play Button Overlay (Visual) */}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg cursor-default">
                                <svg className="w-5 h-5 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                            </div>
                        </div>
                    </div>

<div className="p-6">
    <div className="flex items-end gap-2 mb-6">
        {course.discount_price ? (
            <>
                <span className="text-3xl font-extrabold text-green-600">{course.discount_price}</span>
                <span className="text-gray-400 text-lg mb-1 line-through">{course.price}</span>
            </>
        ) : (
            <span className="text-3xl font-extrabold text-gray-900">{course.price || "Free"}</span>
        )}
    </div>

    <a 
        href={enrollLink} 
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 mb-4"
    >
        Enroll Now
    </a>
    
    {/* ... rest of the card ... */}
                        <p className="text-xs text-gray-500 text-center mb-6">30-Day Money-Back Guarantee</p>

                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-gray-900">This course includes:</h4>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Full video access</li>
                                <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> Downloadable resources</li>
                                <li className="flex items-center gap-3"><svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Certificate of completion</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}