"use client";

import React, { useEffect } from "react";
import { MathJax } from "better-react-mathjax";

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

/**
 * A centralized and robust component for safely rendering HTML content,
 * loading dynamic Google Fonts CDN links used in inline styles,
 * and accurately parsing LaTeX mathematical expressions using MathJax.
 */
export default function RichTextDisplay({ content, className }: RichTextDisplayProps) {
  useEffect(() => {
    if (!content) return;

    // Detect font-family declarations in content
    const fontFamilyRegex = /font-family\s*:\s*['"]?([^;'"]+)['"]?/gi;
    let match;
    const fontsToLoad = new Set<string>();

    while ((match = fontFamilyRegex.exec(content)) !== null) {
      if (match[1]) {
        const primaryFont = match[1].split(',')[0].trim().replace(/['"]/g, '');
        // Exclude system web safe fallback fonts
        if (!['inherit', 'sans-serif', 'serif', 'monospace', 'arial', 'times new roman', 'georgia', 'courier new', 'system-ui'].includes(primaryFont.toLowerCase())) {
          fontsToLoad.add(primaryFont);
        }
      }
    }

    // Also detect any embedded google font link tags inside HTML content
    const linkRegex = /href=["'](https:\/\/fonts\.googleapis\.com\/css2\?[^"']+)["']/gi;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(content)) !== null) {
      const url = linkMatch[1];
      const linkId = `gfont-url-${url.replace(/[^a-z0-9]/gi, '')}`;
      if (!document.getElementById(linkId)) {
        const l = document.createElement('link');
        l.id = linkId;
        l.rel = 'stylesheet';
        l.href = url;
        document.head.appendChild(l);
      }
    }

    fontsToLoad.forEach(fontName => {
      const linkId = `gfont-auto-${fontName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;600;700&display=swap`;
        document.head.appendChild(link);
      }
    });
  }, [content]);

  return (
    <MathJax dynamic>
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    </MathJax>
  );
}
