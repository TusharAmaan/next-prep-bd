"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import BubbleMenu from './BubbleMenu';
import MathNode from './MathNode';
import { toast } from 'sonner';

interface NextPrepEditorProps {
  initialValue?: string;
  onChange: (html: string) => void;
  darkMode?: boolean;
}

export default function NextPrepEditor({ initialValue = '', onChange, darkMode = false }: NextPrepEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [mathNodes, setMathNodes] = useState<{ id: string, element: HTMLElement, latex: string }[]>([]);
  const isInitialized = useRef(false);

  // Helper to extract clean HTML without the React Portal injected DOM
  const getCleanHTML = useCallback(() => {
    if (!editorRef.current) return '';
    const clone = editorRef.current.cloneNode(true) as HTMLElement;
    const wrappers = clone.querySelectorAll('.math-node-wrapper');
    wrappers.forEach(w => {
      w.innerHTML = ''; // Strip out the injected MathJax/React elements
    });
    return clone.innerHTML;
  }, []);

  useEffect(() => {
    if (!editorRef.current || isInitialized.current) return;
    editorRef.current.innerHTML = initialValue;
    isInitialized.current = true;
  }, [initialValue]);

  useEffect(() => {
    if (!editorRef.current) return;

    const syncMathNodes = () => {
      const wrappers = Array.from(editorRef.current!.querySelectorAll('.math-node-wrapper')) as HTMLElement[];
      const currentNodes = wrappers.map(el => {
        let id = el.getAttribute('data-math-id');
        if (!id) {
          id = 'math-' + Math.random().toString(36).substr(2, 9);
          el.setAttribute('data-math-id', id);
        }
        return {
          id,
          element: el,
          latex: el.getAttribute('data-latex') || ''
        };
      });
      setMathNodes(currentNodes);
    };

    const observer = new MutationObserver((mutations) => {
      let shouldSync = false;
      let shouldTriggerChange = false;

      for (const m of mutations) {
        // If nodes were added or removed, we might need to mount/unmount portals
        if (m.type === 'childList') {
          // Ignore mutations happening inside the math-node-wrapper (from React)
          let target = m.target as HTMLElement;
          if (!target.closest('.math-node-wrapper')) {
            shouldSync = true;
            shouldTriggerChange = true;
          }
        }
        if (m.type === 'characterData') {
           shouldTriggerChange = true;
        }
      }
      
      if (shouldSync) syncMathNodes();
      if (shouldTriggerChange && document.activeElement === editorRef.current) {
        onChange(getCleanHTML());
      }
    });

    observer.observe(editorRef.current, { childList: true, subtree: true, characterData: true });
    syncMathNodes(); // Initial scan

    return () => observer.disconnect();
  }, [onChange, getCleanHTML]);

  const insertMath = () => {
    editorRef.current?.focus();
    const id = 'math-' + Math.random().toString(36).substr(2, 9);
    // Insert empty math wrapper with a zero-width space so cursor can exit it
    const html = `<span class="math-node-wrapper" data-math-id="${id}" data-latex="" contenteditable="false"></span>&#8203;`;
    document.execCommand('insertHTML', false, html);
  };

  const handleMathUpdate = (id: string, newLatex: string) => {
    const el = editorRef.current?.querySelector(`[data-math-id="${id}"]`);
    if (el) {
      el.setAttribute('data-latex', newLatex);
      // Trigger sync manually because attribute changes on wrappers aren't tracked for onChange
      setMathNodes(prev => prev.map(n => n.id === id ? { ...n, latex: newLatex } : n));
      onChange(getCleanHTML());
    }
  };

  const handleMathRemove = (id: string) => {
    const el = editorRef.current?.querySelector(`[data-math-id="${id}"]`);
    if (el) {
      el.remove(); // MutationObserver will catch this
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    // We strictly insert plain text to avoid corruption from copying KaTeX/external HTML
    document.execCommand('insertText', false, text);
    onChange(getCleanHTML());
  };

  const mockUploadImageToBucket = async (file: File) => {
    toast.info('Simulating image upload...');
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve(URL.createObjectURL(file)); // Mock URL
      }, 1000);
    });
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = await mockUploadImageToBucket(file);
      
      let range;
      if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(e.clientX, e.clientY);
      }
      
      if (range) {
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        document.execCommand('insertImage', false, url);
        // Clean up img styles
        const img = editorRef.current?.querySelector(`img[src="${url}"]`) as HTMLImageElement;
        if (img) {
          img.className = 'max-w-full h-auto rounded-lg my-4 mx-auto block';
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Basic shortcut handling
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') { e.preventDefault(); document.execCommand('bold'); }
      if (e.key === 'i') { e.preventDefault(); document.execCommand('italic'); }
    }
    // Auto-trigger insertMath on $$ typing could be added here
  };

  return (
    <div className={`relative w-full rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900 ${darkMode ? 'dark' : ''}`}>
      <BubbleMenu editorRef={editorRef} onInsertMath={insertMath} />
      
      <div
        ref={editorRef}
        className="prose prose-lg dark:prose-invert max-w-none w-full min-h-[400px] p-6 focus:outline-none"
        contentEditable
        suppressContentEditableWarning
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onKeyDown={handleKeyDown}
        onBlur={() => onChange(getCleanHTML())}
        style={{ whiteSpace: 'pre-wrap' }}
      />

      {/* Render React Portals into the math node wrappers */}
      {mathNodes.map(({ id, element, latex }) =>
        createPortal(
          <MathNode
            key={id}
            initialLatex={latex}
            onUpdate={(newLatex) => handleMathUpdate(id, newLatex)}
            onRemove={() => handleMathRemove(id)}
          />,
          element
        )
      )}
    </div>
  );
}
