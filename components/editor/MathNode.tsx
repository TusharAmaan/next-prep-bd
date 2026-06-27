"use client";

import React, { useState, useEffect, useRef } from "react";
import * as Popover from "@radix-ui/react-popover";
import { MathJax } from "better-react-mathjax";

interface MathNodeProps {
  initialLatex: string;
  onUpdate: (latex: string) => void;
  onRemove: () => void;
}

export default function MathNode({ initialLatex, onUpdate, onRemove }: MathNodeProps) {
  const [latex, setLatex] = useState(initialLatex);
  const [isOpen, setIsOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialLatex.trim() === "") {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      if (latex.trim() === "") {
        onRemove();
      } else {
        onUpdate(latex);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsOpen(false);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <span 
          className="inline-block px-2 py-1 mx-1 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
          style={{ minWidth: latex ? 'auto' : '30px', minHeight: '24px', display: 'inline-block' }}
          contentEditable={false} // Ensure it's not editable by the main editor
        >
          {latex ? (
            <MathJax dynamic>{`\\[ ${latex} \\]`}</MathJax>
          ) : (
            <span className="text-slate-400 italic text-sm">Type math...</span>
          )}
        </span>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-4 w-[350px] z-50 flex flex-col gap-3 focus:outline-none"
          sideOffset={5}
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              MathJax Editor
            </span>
            <button 
              onClick={() => onRemove()}
              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded-md text-xs font-medium transition-colors"
            >
              Remove
            </button>
          </div>
          
          <textarea
            ref={textareaRef}
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="\\int_{a}^{b} x^2 dx"
            className="w-full h-28 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none shadow-inner"
          />
          <div className="flex justify-end mt-1">
             <button 
               onClick={() => setIsOpen(false)}
               className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
             >
               Apply
             </button>
          </div>
          <Popover.Arrow className="fill-white dark:fill-slate-900 border-slate-200 dark:border-slate-800" width={14} height={7} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
