'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, HelpCircle, AlertCircle, CheckCircle2, Timer } from 'lucide-react';
import { submitQuestionAttempt } from '@/app/actions/forumActions';
import { motion } from 'framer-motion';

interface MCQInteractiveWrapperProps {
  threadId: string;
  options: { id: string; option_text: string; is_correct?: boolean }[];
  hasAnswered: boolean;
  previouslySelectedOptionId?: string;
  metrics?: { [optionId: string]: number };
  isLoggedIn?: boolean;
  onAnswered?: (optionId: string) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

export default function MCQInteractiveWrapper({ 
  threadId, 
  options, 
  hasAnswered: initialHasAnswered,
  previouslySelectedOptionId,
  metrics,
  isLoggedIn,
  onAnswered
}: MCQInteractiveWrapperProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(previouslySelectedOptionId || null);
  const [hasAnswered, setHasAnswered] = useState(initialHasAnswered);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [nonLoggedInClicked, setNonLoggedInClicked] = useState(false);

  // Sync state if initial value changes
  useEffect(() => {
    setHasAnswered(initialHasAnswered);
    setSelectedOption(previouslySelectedOptionId || null);
  }, [initialHasAnswered, previouslySelectedOptionId]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!hasAnswered && !isPaused) {
      interval = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [hasAnswered, isPaused]);

  const handleOptionClick = async (optionId: string) => {
    if (hasAnswered) return;

    if (!isLoggedIn) {
      setNonLoggedInClicked(true);
      setSelectedOption(optionId);
      return;
    }

    setSelectedOption(optionId);
    setIsPaused(true);
    setIsSubmitting(true);
    setError('');

    try {
      const result = await submitQuestionAttempt(threadId, optionId, timeSpent);
      if (result.success) {
        setHasAnswered(true);
        if (onAnswered) {
          onAnswered(optionId);
        }
      } else {
        setError(result.error || 'Failed to submit attempt');
        setIsPaused(false);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setIsPaused(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getCorrectOptionLetter = () => {
    const correctIdx = options.findIndex(opt => opt.is_correct);
    return correctIdx !== -1 ? OPTION_LETTERS[correctIdx] : 'Unknown';
  };

  return (
    <div className="bg-[#FAFBFD] dark:bg-[#15171E] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden mb-8 text-left">
      
      {/* Control Dashboard Header */}
      <div className="bg-slate-100/70 dark:bg-slate-800/40 p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-slate-850 dark:text-slate-250 uppercase tracking-widest bg-blue-100 dark:bg-blue-900/30 text-blue-650 dark:text-blue-400 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
            <Timer className="w-3.5 h-3.5" /> GMAT Timer
          </span>
          <div className="flex items-center gap-1.5 font-mono text-base font-extrabold text-slate-850 dark:text-slate-100">
            <span>{formatTime(timeSpent)}</span>
            {!hasAnswered && (
              <button 
                onClick={() => setIsPaused(!isPaused)} 
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                title={isPaused ? "Resume Timer" : "Pause Timer"}
              >
                {isPaused ? <Play className="w-4 h-4 fill-current text-green-600" /> : <Pause className="w-4 h-4 fill-current text-slate-500" />}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasAnswered ? (
            <>
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1C1F26] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-650 dark:text-slate-300 transition-all active:scale-95 shadow-sm"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showExplanation ? 'Hide Answer' : 'Show Answer'}
              </button>
              <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-500/10">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Logged in Error Log
              </span>
            </>
          ) : (
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Select choice to answer
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {options.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No options available for this question. Make sure options are configured in the question bank.</p>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-150 dark:border-slate-800/80 shadow-inner">
            <div className="flex flex-wrap items-center gap-6 justify-center">
              {options.map((opt, index) => {
                const letter = OPTION_LETTERS[index] || '';
                const isSelected = selectedOption === opt.id;
                const showMetrics = hasAnswered && metrics;
                const pct = showMetrics ? (metrics[opt.id] || 0) : 0;
                
                return (
                  <div key={opt.id} className="flex flex-col items-center gap-2">
                    <motion.button
                      type="button"
                      onClick={() => handleOptionClick(opt.id)}
                      disabled={hasAnswered || isSubmitting}
                      whileHover={{ scale: hasAnswered ? 1 : 1.08 }}
                      whileTap={{ scale: hasAnswered ? 1 : 0.92 }}
                      animate={
                        hasAnswered
                          ? isSelected
                            ? opt.is_correct
                              ? { scale: [1, 1.15, 1], backgroundColor: '#10B981', borderColor: '#10B981', color: '#FFF' }
                              : { x: [0, -6, 6, -6, 6, 0], backgroundColor: '#EF4444', borderColor: '#EF4444', color: '#FFF' }
                            : opt.is_correct
                              ? { scale: [1, 1.05, 1], backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10B981', color: '#10B981' }
                              : { opacity: 0.5, backgroundColor: 'rgba(0,0,0,0)', borderColor: 'rgba(226, 232, 240, 0.5)' }
                          : isSelected
                            ? { scale: 1.05, backgroundColor: '#2563EB', borderColor: '#2563EB', color: '#FFF' }
                            : {}
                      }
                      transition={{ duration: 0.3 }}
                      className={`w-12 h-12 rounded-full border-2 font-black text-sm flex items-center justify-center transition-colors shadow-sm ${
                        hasAnswered
                          ? ''
                          : 'bg-white dark:bg-[#1C1F26] border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 text-slate-750 dark:text-slate-300 hover:text-blue-650'
                      }`}
                      title={hasAnswered ? `Answer choice ${letter}` : `Select ${letter}`}
                    >
                      {letter}
                    </motion.button>
                    
                    {showMetrics && (
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 bg-white dark:bg-[#1C1F26] px-1.5 py-0.5 rounded border border-slate-150 dark:border-slate-800 shadow-sm font-mono">
                        {pct}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            
            {nonLoggedInClicked && (
              <div className="mt-5 text-xs font-bold text-rose-500 bg-rose-500/10 dark:bg-rose-950/20 px-4 py-2 border border-rose-500/20 rounded-xl flex items-center gap-1.5 animate-in slide-in-from-top-2 duration-200">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>Log in to see the answer.</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-rose-500 text-xs font-bold mt-3 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </p>
        )}
      </div>

      {/* Dynamic Explanation Drawer */}
      {showExplanation && (
        <div className="p-6 bg-blue-500/5 dark:bg-blue-950/10 border-t border-slate-200 dark:border-slate-800/80 animate-in slide-in-from-top duration-300 text-left">
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-2">Answer & Explanation</h4>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
            Correct Option: <span className="text-green-600 dark:text-green-400 font-extrabold">Option {getCorrectOptionLetter()}</span>
          </div>
          <p className="text-xs text-slate-750 dark:text-slate-300 leading-relaxed font-medium">
            You selected option <span className="font-bold uppercase text-slate-900 dark:text-white">{selectedOption ? OPTION_LETTERS[options.findIndex(o => o.id === selectedOption)] : ''}</span>. 
            GMAT timer captured a total time spent of <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{formatTime(timeSpent)}</span>.
          </p>
        </div>
      )}

    </div>
  );
}

