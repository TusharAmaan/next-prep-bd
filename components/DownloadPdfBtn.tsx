"use client";

import { useState } from "react";

export default function DownloadPdfBtn({ 
  targetId, 
  filename 
}: { 
  targetId: string; 
  filename: string 
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);

    try {
      // 1. Load library
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.getElementById(targetId);

      if (!element) {
        alert("Error: Content not found!");
        setIsGenerating(false);
        return;
      }

      // 2. Options
      const opt: any = {
        margin: [0.5, 0.5, 1.0, 0.5], // Extra bottom margin for footer
        filename: `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      // 3. Generate PDF
      const worker = html2pdf().from(element).set(opt).toPdf();

      worker.get('pdf').then((pdf: any) => {
          try {
            const totalPages = pdf.internal.getNumberOfPages();
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            for (let i = 1; i <= totalPages; i++) {
              pdf.setPage(i);
              
              // --- DRAW FOOTER ---
              const footerY = pageHeight - 0.5;

              // 1. Gray Line
              pdf.setDrawColor(200, 200, 200);
              pdf.line(0.5, footerY - 0.3, pageWidth - 0.5, footerY - 0.3);

              // 2. Logo Icon (Blue Rounded Square)
              pdf.setFillColor(37, 99, 235); // Blue-600
              pdf.roundedRect(0.5, footerY - 0.2, 0.25, 0.25, 0.05, 0.05, 'F');
              
              // 3. Logo "N" text inside box
              pdf.setTextColor(255, 255, 255);
              pdf.setFontSize(10);
              pdf.setFont("helvetica", "bold");
              pdf.text("N", 0.56, footerY - 0.04);

              // 4. Logo Text "NextPrepBD"
              pdf.setTextColor(40, 40, 40);
              pdf.setFontSize(12);
              pdf.setFont("helvetica", "bold");
              pdf.text("NextPrep", 0.8, footerY);
              
              pdf.setTextColor(37, 99, 235); // Blue part
              pdf.text("BD", 1.4, footerY);

              // 5. Page Number (Centered)
              pdf.setTextColor(100, 100, 100);
              pdf.setFontSize(9);
              pdf.setFont("helvetica", "normal");
              const pageNumText = `Page ${i} of ${totalPages}`;
              const textWidth = pdf.getStringUnitWidth(pageNumText) * 9 / 72;
              pdf.text(pageNumText, (pageWidth - textWidth) / 2, footerY);
            }
          } catch (e) {
            console.warn("Footer injection failed, skipping...");
          }
          
          pdf.save(`${filename}.pdf`);
      }).then(() => {
          setIsGenerating(false);
      });

    } catch (error) {
      console.error("PDF Failed:", error);
      alert("Could not generate PDF.");
      setIsGenerating(false);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={isGenerating}
      className={`flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-red-200 transition-all active:scale-95 ${isGenerating ? 'opacity-75 cursor-not-allowed' : ''}`}
    >
      {isGenerating ? (
        <>
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span>Generating...</span>
        </>
      ) : (
        <>
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 16L7 11H10V4H14V11H17L12 16ZM12 18C16.4183 18 20 18 20 18C20.5523 18 21 18.4477 21 19C21 19.5523 20.5523 20 20 20C20 20 4 20 4 20C3.44772 20 3 19.5523 3 19C3 18.4477 3.44772 18 4 18C4 18 7.58172 18 12 18Z"/></svg>
            <span>Download PDF</span>
        </>
      )}
    </button>
  );
}