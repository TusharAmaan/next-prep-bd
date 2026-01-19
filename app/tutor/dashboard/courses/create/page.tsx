"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import CourseEditor from "@/components/tutor/CourseEditor"; // Reusing the component I gave you in the previous turn
import { Loader2 } from "lucide-react";

// We separate the logic component to wrap it in Suspense (Next.js requirement for useSearchParams)
function CourseCreateLogic() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");
  
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(!!courseId); // Only load if ID exists

  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      // Fetch the specific course to edit
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (!error && data) {
        setInitialData(data);
      } else {
        alert("Course not found or access denied.");
      }
      setLoading(false);
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
        <div className="h-[50vh] flex flex-col items-center justify-center text-indigo-600">
            <Loader2 className="w-10 h-10 animate-spin mb-4"/>
            <p className="font-bold text-sm">Loading course details...</p>
        </div>
    );
  }

  return (
    <CourseEditor existingCourse={initialData} />
  );
}

export default function CreateCoursePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading Editor...</div>}>
        <CourseCreateLogic />
    </Suspense>
  );
}