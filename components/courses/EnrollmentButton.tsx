'use client';

import { useState, useTransition } from 'react';
import { enrollInCourse } from '@/app/actions/enrollment';
import { toast } from 'sonner';
import { Loader2, PlayCircle, Lock, Trophy } from 'lucide-react';
import { submitManualPayment } from '../../app/actions/payment';
import PaymentModal from '@/components/shared/PaymentModal';
import { useRouter } from 'next/navigation';

interface EnrollmentButtonProps {
  courseId: number;
  courseName?: string;
  price?: string | number | null;
  initialEnrolled: boolean;
  isCompleted?: boolean;
  progressPercentage?: number;
}

export default function EnrollmentButton({ courseId, courseName = "Course", price, initialEnrolled, isCompleted = false, progressPercentage = 0 }: EnrollmentButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isEnrolled, setIsEnrolled] = useState(initialEnrolled);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const router = useRouter();

  const handleEnrollClick = () => {
    // If it has a price (and price is not '0'), show payment modal
    if (price && price !== "0" && price !== 0) {
        setShowPaymentModal(true);
    } else {
        // Free course, enroll instantly
        executeEnrollment();
    }
  };

  const executeEnrollment = async () => {
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

  const handlePaymentSubmit = async (data: { method: "bkash" | "nagad" | "upay", senderNumber: string, transactionId: string }) => {
    const result = await submitManualPayment({
        courseId,
        amount: Number(price),
        method: data.method,
        senderNumber: data.senderNumber,
        transactionId: data.transactionId
    });

    if (result.success) {
        toast.success("Payment submitted successfully! Waiting for admin approval.");
        setShowPaymentModal(false);
        router.push('/student/dashboard');
    } else {
        throw new Error(result.error || "Failed to submit payment");
    }
  };

  if (isEnrolled) {
    if (isCompleted) {
       return (
          <div className="flex-1 flex flex-col gap-3">
             <button 
                onClick={() => router.push(`/courses/${courseId}/learn`)}
                className="w-full bg-white hover:bg-slate-50 border-2 border-indigo-600 text-indigo-700 text-center font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <PlayCircle size={20} />
                Restart Course
              </button>
              <button 
                onClick={() => router.push(`/courses/${courseId}/certificate`)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-center font-bold py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Trophy size={20} />
                View Certificate
              </button>
          </div>
       );
    }

    return (
      <div className="flex-1 flex flex-col gap-3">
          <button 
            onClick={() => router.push(`/courses/${courseId}/learn`)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <PlayCircle size={20} />
            Continue Learning
          </button>
          <div className="w-full px-1">
             <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">
                <span>Progress</span>
                <span>{progressPercentage}%</span>
             </div>
             <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                   className="h-full bg-indigo-500 transition-all duration-1000" 
                   style={{ width: `${progressPercentage}%` }}
                />
             </div>
          </div>
      </div>
    );
  }

  return (
    <>
      <button 
        onClick={handleEnrollClick}
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

      {/* Payment Modal for paid courses */}
      <PaymentModal 
         isOpen={showPaymentModal}
         onClose={() => setShowPaymentModal(false)}
         courseName={courseName}
         amount={price || 0}
         onSubmit={handlePaymentSubmit}
      />
    </>
  );
}
