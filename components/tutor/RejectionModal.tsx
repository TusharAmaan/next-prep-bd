"use client";
import { X, AlertTriangle } from "lucide-react";

export default function RejectionModal({ reason, onClose }: { reason: string, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-red-50 p-6 flex items-start gap-4 border-b border-red-100">
          <div className="bg-red-100 p-2 rounded-full text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-900">Content Rejected</h3>
            <p className="text-sm text-red-700 mt-1">
              Your submission did not meet our guidelines. Please review the feedback below.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Admin Feedback</label>
          <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 font-medium border border-slate-200 leading-relaxed">
            "{reason}"
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-200 rounded-lg transition-colors">
            Close
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700 shadow-md">
            Edit & Resubmit
          </button>
        </div>
      </div>
    </div>
  );
}