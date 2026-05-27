'use client';

import React, { useState } from 'react';
import { Flag, X, Loader2, CheckCircle2 } from 'lucide-react';
import { submitModerationReport } from '@/app/actions/forumActions';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  threadId: string | null;
  commentId: string | null;
}

export default function ReportModal({ isOpen, onClose, threadId, commentId }: ReportModalProps) {
  const [reasonType, setReasonType] = useState('Question Error');
  const [customMessage, setCustomMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await submitModerationReport(threadId, commentId, reasonType, customMessage);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setCustomMessage('');
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-left">
      <div className="bg-white dark:bg-[#1C1F26] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-md w-full relative space-y-4 animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <Flag className="w-4 h-4 text-rose-500" />
            Report Post to Admin
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-150 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Report Submitted Successfully</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Our moderators will review this post shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Problem Type Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">What has gone wrong?</label>
              <div className="space-y-2">
                {[
                  'Question Error',
                  'Answer choice error',
                  'Needs correction',
                  'Spam or Harassment',
                  'Other'
                ].map((option) => (
                  <label
                    key={option}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      reasonType === option
                        ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-950/10 text-slate-850 dark:text-slate-250'
                        : 'border-slate-150 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report_reason"
                      value={option}
                      checked={reasonType === option}
                      onChange={() => setReasonType(option)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-350 bg-white dark:bg-[#1C1F26]"
                    />
                    <span className="text-xs font-bold">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom message details */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Describe the issue (optional)</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Describe the issue in detail so we can fix it..."
                rows={3}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 font-semibold transition-all resize-none"
              />
            </div>

            {error && (
              <p className="text-rose-500 text-[11px] font-bold">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-850 text-slate-750 dark:text-slate-300 font-bold text-xs rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Flag className="w-3.5 h-3.5" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
