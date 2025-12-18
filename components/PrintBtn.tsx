"use client";

import { useReactToPrint } from "react-to-print";

export default function PrintBtn({ contentRef }: { contentRef: any }) {
  
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: "NextPrepBD-Study-Material",
  });

  return (
    <button 
      onClick={() => handlePrint()}
      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-red-200 transition-all active:scale-95"
    >
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
      <span>Download PDF</span>
    </button>
  );
}