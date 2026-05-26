'use client';

import React, { useState, useEffect } from 'react';
import { submitQuestionAttempt } from '@/app/actions/forumActions';

interface MCQInteractiveWrapperProps {
  threadId: string;
  options: { id: string; option_text: string; is_correct?: boolean }[];
  hasAnswered: boolean;
  previouslySelectedOptionId?: string;
  metrics?: { [optionId: string]: number }; // percentage of users who picked this
  isLoggedIn?: boolean;
}

export default function MCQInteractiveWrapper({ 
  threadId, 
  options, 
  hasAnswered: initialHasAnswered,
  previouslySelectedOptionId,
  metrics,
  isLoggedIn 
}: MCQInteractiveWrapperProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(previouslySelectedOptionId || null);
  const [hasAnswered, setHasAnswered] = useState(initialHasAnswered);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!hasAnswered) {
      interval = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [hasAnswered]);

  const handleSubmit = async () => {
    if (!selectedOption) return;
    setIsSubmitting(true);
    setError('');

    try {
      const result = await submitQuestionAttempt(threadId, selectedOption, timeSpent);
      if (result.success) {
        setHasAnswered(true);
      } else {
        setError(result.error || 'Failed to submit attempt');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-50 dark:bg-[#252830] rounded-xl p-6 border border-slate-200 dark:border-slate-800 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          Select Your Answer
        </h3>
        
        {/* Timer display */}
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-mono bg-white dark:bg-[#1C1F26] px-3 py-1 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {formatTime(timeSpent)}
        </div>
      </div>

      <div className="space-y-3">
        {options.map((opt) => {
          const isSelected = selectedOption === opt.id;
          const showMetrics = hasAnswered && metrics;
          const pct = showMetrics ? (metrics[opt.id] || 0) : 0;
          
          return (
            <label 
              key={opt.id}
              className={`relative block p-4 rounded-lg border-2 cursor-pointer transition-all overflow-hidden ${
                hasAnswered 
                  ? isSelected 
                    ? opt.is_correct 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : opt.is_correct 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'border-slate-200 dark:border-slate-700 opacity-60'
                  : isSelected 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-[#1C1F26]'
              }`}
            >
              {/* Progress bar background for metrics */}
              {showMetrics && (
                <div 
                  className="absolute inset-y-0 left-0 bg-slate-100 dark:bg-slate-800/50 -z-10 transition-all duration-1000"
                  style={{ width: `${pct}%` }}
                />
              )}

              <div className="flex items-center justify-between z-10 relative">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="mcq_option"
                    value={opt.id}
                    checked={isSelected}
                    onChange={() => {
                      if (!isLoggedIn) {
                        alert("Log in to select an answer and see the results.");
                        return;
                      }
                      if (!hasAnswered) setSelectedOption(opt.id);
                    }}
                    disabled={hasAnswered}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span 
                    className="text-slate-700 dark:text-slate-300"
                    dangerouslySetInnerHTML={{ __html: opt.option_text }}
                  />
                </div>
                
                {/* Metric percentage display */}
                {showMetrics && (
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    {pct}%
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-3">{error}</p>
      )}

      {!hasAnswered && (
        <button
          onClick={handleSubmit}
          disabled={!selectedOption || isSubmitting}
          className="mt-6 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold rounded-lg shadow-md transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit & See Results'}
        </button>
      )}
    </div>
  );
}
