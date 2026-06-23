"use client";

import { useState } from "react";
import { AlertCircle, X, Loader2, Flag } from "lucide-react";
import { toast } from "sonner";
import { submitModerationReport } from "@/app/actions/forumActions";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId?: string | null;
  targetType?: "thread" | "comment";
  threadId?: string | null;
  commentId?: string | null;
}

const REPORT_REASONS = [
  "Spam or misleading",
  "Inappropriate or offensive content",
  "Harassment or bullying",
  "Off-topic",
  "Other",
];

export default function ReportModal({ 
  isOpen, 
  onClose, 
  targetId, 
  targetType, 
  threadId, 
  commentId 
}: ReportModalProps) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resolvedThreadId = (targetType === "thread" ? targetId : threadId) || null;
  const resolvedCommentId = (targetType === "comment" ? targetId : commentId) || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await submitModerationReport(
        resolvedThreadId,
        resolvedCommentId,
        reason,
        details
      );

      if (res.success) {
        toast.success("Report submitted successfully. Thank you for keeping our community safe.");
        onClose();
        setDetails("");
        setReason(REPORT_REASONS[0]);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit report. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-2xl transition-all border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <Flag className="h-5 w-5" />
            <h3 className="font-semibold text-lg">Report to Admin</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 p-3 border border-amber-100 dark:border-amber-900/50 flex gap-3 text-sm text-amber-800 dark:text-amber-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>
              Reports are strictly confidential and only visible to administrators. Misuse of the reporting tool may result in account suspension.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Reason for reporting
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              required
            >
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Additional Details (Optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder="Please provide any additional context..."
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
