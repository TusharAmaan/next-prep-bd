"use client";

import Script from "next/script";

/**
 * MathRenderer Component
 * 
 * Handles global KaTeX initialization in a Client Component.
 * This prevents Next.js "Event handlers cannot be passed to Client Component" errors
 * when used in Server Components like layout.tsx.
 */
export default function MathRenderer() {
  return (
    <>
      <Script
         id="katex-main"
         src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"
         strategy="lazyOnload"
         integrity="sha384-7zkInuTyB7u6idN0zM9AbwU58p0bQy7/9n5594"
         crossOrigin="anonymous"
      />
      <Script
         id="katex-auto-render"
         src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"
         strategy="lazyOnload"
         integrity="sha384-43gviUU0WGVuLz+bHJnvzQRKFHAtST667NV6"
         crossOrigin="anonymous"
         onLoad={() => {
           // @ts-ignore
           if (window.renderMathInElement) {
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
           }
         }}
      />
    </>
  );
}
