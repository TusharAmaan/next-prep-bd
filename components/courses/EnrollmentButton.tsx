'use client';

import { useState, useTransition } from 'react';
import { enrollInCourse } from '@/app/actions/enrollment';
import { toast } from 'sonner';
import { Loader2, PlayCircle, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EnrollmentButtonProps {
  courseId: number;
  initialEnrolled: boolean;
}

export default function EnrollmentButton({ courseId, initialEnrolled }: EnrollmentButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isEnrolled, setIsEnrolled] = useState(initialEnrolled);
  const router = useRouter();

  const handleEnroll = async () => {
    startTransition(async () => {
      const result = await enrollInCourse(courseId);
      if (result.success) {
        setIsEnrolled(true);
        toast.success(result.message || 'Successfully enrolled!');
        router.push(`/courses/${courseId}/learn`);
      } else {
        toast.error(result.error || 'Failed to enroll.');
      }
    });
  };

  if (isEnrolled) {
    return (
      <button 
        onClick={() => router.push(`/courses/${courseId}/learn`)}
        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-center font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
      >
        <PlayCircle size={20} />
        Continue Learning
      </button>
    );
  }

  return (
    <button 
      onClick={handleEnroll}
      disabled={isPending}
      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="animate-spin" size={20} />
      ) : (
        <>
          <Lock size={18} />
          Enroll Now
        </>
      )}
    </button>
  );
}
