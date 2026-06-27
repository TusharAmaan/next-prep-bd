"use client";

import React from "react";
import { MathJax } from "better-react-mathjax";

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

/**
 * A centralized and robust component for safely rendering HTML content 
 * and accurately parsing LaTeX mathematical expressions using MathJax.
 * 
 * Uses dynamic `<MathJax>` to trigger parsing.
 */
export default function RichTextDisplay({ content, className }: RichTextDisplayProps) {
  return (
    <MathJax dynamic>
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    </MathJax>
  );
}
