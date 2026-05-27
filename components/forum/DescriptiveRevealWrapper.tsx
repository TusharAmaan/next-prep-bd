'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface DescriptiveRevealWrapperProps {
  explanation: string;
}

export default function DescriptiveRevealWrapper({ explanation }: DescriptiveRevealWrapperProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="mt-2 space-y-3 text-left">
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-650 dark:text-indigo-400 border border-slate-200/50 dark:border-slate-700/50 rounded-xl text-xs font-extrabold transition-all active:scale-95 shadow-sm flex items-center gap-1.5"
      >
        {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        <span>{show ? 'Hide Answer' : 'Reveal Answer'}</span>
      </button>

      {show && explanation && (
        <div className="p-4 bg-indigo-500/5 dark:bg-indigo-950/10 border border-indigo-500/10 rounded-xl animate-in slide-in-from-top-2 duration-200 text-left">
          <h4 className="font-extrabold text-[10px] text-indigo-600 dark:text-indigo-400 mb-1.5 uppercase tracking-wider">Correct Answer & Explanation</h4>
          <div 
            className="text-slate-700 dark:text-slate-350 text-xs leading-relaxed font-semibold prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: explanation }}
          />
        </div>
      )}
      {show && !explanation && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-750 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-450 animate-in slide-in-from-top-2 duration-200 text-left">
          No explanation details configured for this question.
        </div>
      )}
    </div>
  );
}
