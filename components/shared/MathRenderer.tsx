"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

/**
 * MathRenderer Component
 * 
 * Handles global KaTeX initialization in a Client Component.
 * Utilizes a MutationObserver to dynamically render LaTeX equations
 * (e.g., $H_0$, $$x^2$$) when client-side page updates or navigations occur.
 */
export default function MathRenderer() {
  const isRenderingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const renderMath = () => {
    // Prevent overlapping rendering cycles
    if (isRenderingRef.current) return;
    
    // @ts-ignore
    if (window.renderMathInElement) {
      try {
        isRenderingRef.current = true;
        // @ts-ignore
        window.renderMathInElement(document.body, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true }
          ],
          throwOnError: false
        });
      } catch (err) {
        console.error("KaTeX auto-render error:", err);
      } finally {
        isRenderingRef.current = false;
      }
    }
  };

  useEffect(() => {
    // 1. Initial attempt on mount (handles case where scripts already loaded)
    renderMath();

    // 2. Watch for DOM changes to render new math components dynamically
    const observer = new MutationObserver((mutations) => {
      const hasMathSymbol = Array.from(mutations).some(mutation => {
        return Array.from(mutation.addedNodes).some(node => {
          // Skip if the node itself is KaTeX or resides within one to prevent feedback loops
          if (node instanceof HTMLElement) {
            if (node.classList.contains('katex') || node.querySelector('.katex')) {
              return false;
            }
            const text = node.textContent || '';
            return text.includes('$') || text.includes('\\(') || text.includes('\\[');
          }
          if (node.nodeType === Node.TEXT_NODE) {
            const parent = node.parentElement;
            if (parent && (parent.classList.contains('katex') || parent.closest('.katex'))) {
              return false;
            }
            const text = node.textContent || '';
            return text.includes('$') || text.includes('\\(') || text.includes('\\[');
          }
          return false;
        });
      });

      if (hasMathSymbol) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(renderMath, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      <Script
         id="katex-main"
         src="https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/katex.min.js"
         strategy="lazyOnload"
         crossOrigin="anonymous"
      />
      <Script
         id="katex-auto-render"
         src="https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/contrib/auto-render.min.js"
         strategy="lazyOnload"
         crossOrigin="anonymous"
         onLoad={renderMath}
      />
    </>
  );
}
