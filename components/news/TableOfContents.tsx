'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface TableOfContentsProps {
  contentHtml: string;
}

interface Heading {
  id: string;
  level: number;
  text: string;
}

export default function TableOfContents({ contentHtml }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Parse HTML to extract headings
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentHtml, 'text/html');
    const headingElements = doc.querySelectorAll('h2, h3, h4');

    const extractedHeadings: Heading[] = [];
    headingElements.forEach((el, index) => {
      const level = parseInt(el.tagName[1]);
      const text = el.textContent || '';
      const id = el.id || `heading-${index}`;

      if (!el.id && text) {
        el.id = id;
      }

      extractedHeadings.push({ id, level, text });
    });

    setHeadings(extractedHeadings);
  }, [contentHtml]);

  if (headings.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition font-semibold text-gray-800"
      >
        <span>Table of Contents</span>
        <ChevronDown className={`w-5 h-5 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <nav className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => scrollToHeading(heading.id)}
              className={`block w-full text-left py-2 px-3 rounded hover:bg-blue-50 hover:text-blue-600 transition text-sm ${
                heading.level === 2 ? 'font-semibold text-gray-900' : 'text-gray-700'
              } ${heading.level === 3 ? 'ml-4' : ''} ${heading.level === 4 ? 'ml-8' : ''}`}
            >
              {heading.text}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
