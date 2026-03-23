"use client";

import { useEffect } from 'react';

export default function TypographyScaler() {
  useEffect(() => {
    const scaleTypography = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;
      
      // Select all text-heavy elements within main content areas
      const contentElements = document.querySelectorAll('article p, article h1, article h2, article h3, article h4, .prose p, .prose h1, .prose h2, .prose h3, .prose h4, .discussion-content');
      
      contentElements.forEach((el: any) => {
        if (isMobile) {
          // Store original size if not already stored
          if (!el.dataset.originalSize) {
             const style = window.getComputedStyle(el);
             el.dataset.originalSize = style.fontSize;
          }
          
          // Apply reduction (approx 15-20% smaller on mobile for better readability)
          const original = parseFloat(el.dataset.originalSize);
          if (original > 14) { 
            el.style.fontSize = `${Math.max(14, original * 0.86)}px`;
            el.style.lineHeight = '1.6';
          }
        } else {
          // Restore original on resize back to desktop
          if (el.dataset.originalSize) {
            el.style.fontSize = el.dataset.originalSize;
            el.style.lineHeight = '';
          }
        }
      });
    };

    window.addEventListener('resize', scaleTypography);
    scaleTypography(); // Run once on mount

    return () => window.removeEventListener('resize', scaleTypography);
  }, []);

  return null;
}
