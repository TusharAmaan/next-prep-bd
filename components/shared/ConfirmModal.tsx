"use client";
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: (inputValue?: string) => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  showInput?: boolean;
  inputPlaceholder?: string;
  defaultValue?: string;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  showInput = false,
  inputPlaceholder = "Type something...",
  defaultValue = ""
}: ConfirmModalProps) {
  const [val, setVal] = React.useState(defaultValue);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />
      
      {/* Modal Container */}
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 relative z-10 animate-scale-in overflow-hidden">
        {/* Header Decoration */}
        <div className={`h-2 w-full ${isDangerous ? 'bg-rose-500' : 'bg-indigo-600'}`} />
        
        <div className="p-8">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-4 rounded-3xl ${isDangerous ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-600'} dark:bg-slate-800`}>
              <AlertTriangle className="w-8 h-8" />
            </div>
            <button 
              onClick={onCancel}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight italic">
            {title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
            {message}
          </p>

          {showInput && (
            <div className="mb-6">
              <input 
                autoFocus
                type="text"
                placeholder={inputPlaceholder}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold text-slate-800 dark:text-white"
                value={val}
                onChange={(e) => setVal(e.target.value)}
              />
            </div>
          )}
          
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 py-4 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-black text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-95"
            >
              {cancelText}
            </button>
            <button
              onClick={() => onConfirm(val)}
              className={`flex-1 py-4 px-6 ${isDangerous ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
