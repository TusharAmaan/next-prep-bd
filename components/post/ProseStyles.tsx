"use client";

export default function ProseStyles() {
  return (
    <style jsx global>{`
      .single-post-prose {
        font-size: clamp(1.0625rem, 0.5vw + 1rem, 1.25rem) !important;
        line-height: 1.8 !important;
      }
      .single-post-prose h2, .single-post-prose h3, .single-post-prose h4 {
        margin-top: 2rem !important;
        margin-bottom: 1rem !important;
        letter-spacing: -0.02em !important;
        line-height: 1.3 !important;
      }
      .single-post-prose p { margin-bottom: 1.5rem !important; }
      .single-post-prose h2 { font-size: clamp(1.5rem, 3vw, 2rem) !important; font-weight: 800 !important; }
      .single-post-prose h3 { font-size: clamp(1.25rem, 2vw, 1.75rem) !important; font-weight: 700 !important; }
      .single-post-prose img {
        border-radius: 1rem !important;
        margin: 2rem auto !important;
        box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.08) !important;
      }
      .single-post-prose blockquote {
        border-left: 3px solid #10b981 !important;
        padding-left: 1rem !important;
        margin: 1.5rem 0 !important;
        color: #475569 !important;
        font-style: italic !important;
      }
      .single-post-prose table {
        width: 100% !important;
        border-collapse: collapse !important;
        margin: 1.5rem 0 !important;
        font-size: 0.875rem !important;
      }
      .single-post-prose table th,
      .single-post-prose table td {
        padding: 0.625rem 0.75rem !important;
        border: 1px solid #e2e8f0 !important;
        text-align: left !important;
      }
      .single-post-prose table th {
        background: #f8fafc !important;
        font-weight: 600 !important;
      }
      .dark .single-post-prose h2, .dark .single-post-prose h3, .dark .single-post-prose h4, .dark .single-post-prose strong { color: #ffffff !important; }
      .dark .single-post-prose p, .dark .single-post-prose li, .dark .single-post-prose span:not(.katex):not(.katex *) { color: #cbd5e1 !important; }
      .dark .single-post-prose blockquote {
        border-left-color: #059669 !important;
        color: #94a3b8 !important;
      }
      .dark .single-post-prose table th,
      .dark .single-post-prose table td {
        border-color: #1e293b !important;
      }
      .dark .single-post-prose table th {
        background: #0f172a !important;
      }
    `}</style>
  );
}
