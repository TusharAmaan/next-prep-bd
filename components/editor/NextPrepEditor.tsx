"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import BubbleMenu from './BubbleMenu';
import TopToolbar from './TopToolbar';
import MenuBar from './MenuBar';
import TableToolbar from './TableToolbar';
import MathNode from './MathNode';
import { toast } from 'sonner';
import RichTextDisplay from '@/components/shared/RichTextDisplay';
import { Quote } from 'lucide-react';

// Simple HTML Formatter/Aligner
const formatHTML = (html: string): string => {
  let formatted = '';
  let indent = '';
  const tab = '  ';
  
  const cleanHtml = html
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
    
  const reg = /(<[^>]+>)/g;
  const elements = cleanHtml.replace(reg, '\r\n$1\r\n').split('\r\n');
  
  elements.forEach(element => {
    element = element.trim();
    if (!element) return;
    
    if (element.match(/^<\/\w/)) {
      indent = indent.substring(tab.length);
      formatted += indent + element + '\n';
    } else if (element.match(/^<\w[^>]*[^\/]>$/) && !element.match(/^<(br|hr|img|input|link|meta)/i)) {
      formatted += indent + element + '\n';
      indent += tab;
    } else {
      formatted += indent + element + '\n';
    }
  });
  
  return formatted.trim();
};

// Simple regex-based HTML Syntax Highlighter (Monokai Theme style)
const highlightHTML = (code: string): string => {
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
    
  escaped = escaped
    .replace(/(&lt;\/?[a-zA-Z0-9:-]+)/g, '<span class="code-tag">$1</span>')
    .replace(/(\/?&gt;)/g, '<span class="code-tag">$1</span>')
    .replace(/\b([a-zA-Z0-9:-]+)=/g, '<span class="code-attr">$1</span>=')
    .replace(/(&quot;.*?&quot;)/g, '<span class="code-val">$1</span>')
    .replace(/(&#x27;.*?&#x27;)/g, '<span class="code-val">$1</span>')
    .replace(/(".*?")/g, '<span class="code-val">$1</span>')
    .replace(/(&lt;!--.*?--&gt;)/g, '<span class="code-comment">$1</span>');
    
  return escaped;
};

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timeoutId: any;
  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => {
    clearTimeout(timeoutId);
  };
  return debounced;
}

interface HTMLViewProps {
  value: string;
  onChange: (val: string) => void;
}

const HTMLView = ({ value, onChange }: HTMLViewProps) => {
  const [htmlCode, setHtmlCode] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isEditing) {
      setHtmlCode(value);
    }
  }, [value, isEditing]);
  
  const handleFormat = () => {
    const formatted = formatHTML(htmlCode);
    setHtmlCode(formatted);
    onChange(formatted);
  };
  
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlCode(e.target.value);
    onChange(e.target.value);
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement | HTMLPreElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };
  
  const lines = htmlCode.split('\n');
  
  return (
    <div className="flex flex-col bg-[#1e1e24] text-slate-200 rounded-xl overflow-hidden border border-slate-700/50 font-mono text-sm shadow-xl select-text">
      <style>{`
        .code-tag { color: #f92672; font-weight: bold; }
        .code-attr { color: #a6e22e; }
        .code-val { color: #e6db74; }
        .code-comment { color: #75715e; font-style: italic; }
        .code-textarea {
          font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace !important;
          tab-size: 2;
          line-height: 20px;
          white-space: pre;
          overflow-x: auto;
          overflow-y: auto;
        }
        .code-pre {
          font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace !important;
          line-height: 20px;
          margin: 0;
          white-space: pre;
          overflow-x: auto;
          overflow-y: auto;
        }
        .line-numbers-container::-webkit-scrollbar {
          display: none;
        }
        .line-numbers-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#141419] border-b border-slate-800 select-none">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] block"></span>
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] block"></span>
            <span className="w-3 h-3 rounded-full bg-[#27c93f] block"></span>
          </div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">index.html</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all border ${
              isEditing 
                ? 'bg-blue-600 border-blue-500 text-white' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isEditing ? '✓ View Highlighted' : '✎ Edit HTML'}
          </button>
          
          <button
            onClick={handleFormat}
            className="px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 rounded-md text-xs font-bold transition-all"
          >
            Beautify HTML
          </button>
        </div>
      </div>
      
      <div className="flex h-[550px] relative border-t border-slate-800/80">
        <div 
          ref={lineNumbersRef}
          className="w-12 bg-[#141419] py-4 text-right pr-3 select-none text-slate-600 border-r border-slate-800/80 overflow-y-hidden line-numbers-container"
        >
          {lines.map((_, i) => (
            <div key={i} className="h-5 leading-5 text-xs font-semibold">{i + 1}</div>
          ))}
          <div className="h-[250px]" />
        </div>
        
        <div className="flex-1 bg-[#1e1e24] overflow-hidden h-full">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={htmlCode}
              onChange={handleTextareaChange}
              onScroll={handleScroll}
              className="w-full h-full bg-transparent text-slate-200 p-4 pt-4 resize-none focus:outline-none code-textarea"
              placeholder="Paste or write raw HTML here..."
              style={{ paddingBottom: '250px' }}
            />
          ) : (
            <pre 
              ref={preRef}
              onClick={() => setIsEditing(true)}
              onScroll={handleScroll}
              className="w-full h-full p-4 pt-4 code-pre cursor-pointer hover:bg-slate-800/10"
              dangerouslySetInnerHTML={{ __html: highlightHTML(htmlCode) || '<span style="color: #75715e;">&lt;!-- Empty Document --&gt;</span>' }}
              style={{ paddingBottom: '250px' }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

interface NextPrepEditorProps {
  initialValue?: string;
  onChange: (html: string) => void;
  darkMode?: boolean;
}

export default function NextPrepEditor({ initialValue = '', onChange, darkMode = false }: NextPrepEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mathNodes, setMathNodes] = useState<{ id: string, element: HTMLElement, latex: string }[]>([]);
  const isInitialized = useRef(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'raw'>('editor');
  const [editorMode, setEditorMode] = useState<'editing' | 'viewing'>('editing');
  const [showRuler, setShowRuler] = useState(false);
  const [showOutline, setShowOutline] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [headings, setHeadings] = useState<{ id: string, text: string, level: number }[]>([]);

  const [margins, setMargins] = useState({ top: 24, bottom: 24, left: 24, right: 24 });
  const [tempMargins, setTempMargins] = useState({ top: 24, bottom: 24, left: 24, right: 24 });
  const [isPageSetupOpen, setIsPageSetupOpen] = useState(false);

  const [showBlocks, setShowBlocks] = useState(false);
  const [linkModalConfig, setLinkModalConfig] = useState<{ isOpen: boolean, text: string, url: string, isNewTab: boolean } | null>(null);
  const [imageModalConfig, setImageModalConfig] = useState<{ isOpen: boolean, url: string, alt: string, width: string, align: string } | null>(null);
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  // Citation system states
  const [isCitationModalOpen, setIsCitationModalOpen] = useState(false);
  const [citationTab, setCitationTab] = useState<'add' | 'list'>('add');
  const [existingSources, setExistingSources] = useState<Array<{ id: string, authors: string, year: string, refDetails: string }>>([]);
  const [selectedExistingSourceId, setSelectedExistingSourceId] = useState<string>('');

  // Citation popover tooltip states
  const [activeCitationNode, setActiveCitationNode] = useState<HTMLAnchorElement | null>(null);
  const [citationPopoverPos, setCitationPopoverPos] = useState<{ top: number, left: number } | null>(null);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setSavedRange(selection.getRangeAt(0));
    }
  };

  const restoreSelection = () => {
    if (savedRange) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedRange);
      }
    }
  };

  const openLinkModal = () => {
    saveSelection();
    const selectedText = window.getSelection()?.toString() || '';
    setLinkModalConfig({
      isOpen: true,
      text: selectedText,
      url: '',
      isNewTab: true
    });
  };

  const openImageModal = () => {
    saveSelection();
    setImageModalConfig({
      isOpen: true,
      url: '',
      alt: '',
      width: '100%',
      align: 'center'
    });
  };

  const handleLinkModalSubmit = (text: string, url: string, isNewTab: boolean) => {
    restoreSelection();
    const targetAttr = isNewTab ? ' target="_blank"' : '';
    const linkHTML = `<a href="${url}"${targetAttr} class="text-blue-600 dark:text-blue-400 underline font-semibold">${text}</a>`;
    document.execCommand('insertHTML', false, linkHTML);
    
    const event = new Event('input', { bubbles: true });
    editorRef.current?.dispatchEvent(event);
    
    setLinkModalConfig(null);
    setSavedRange(null);
    editorRef.current?.focus();
  };

  const handleImageModalSubmit = (url: string, alt: string, width: string, align: string) => {
    restoreSelection();
    const alignStyle = align === 'center' 
      ? 'display: block; margin: 1rem auto;' 
      : align === 'left' 
        ? 'display: block; margin: 1rem auto 1rem 0;' 
        : 'display: block; margin: 1rem 0 1rem auto;';
        
    const imgHTML = `<img src="${url}" alt="${alt}" style="width: ${width}; max-w-full; height: auto; border-radius: 8px; ${alignStyle}" /><p><br></p>`;
    document.execCommand('insertHTML', false, imgHTML);
    
    const event = new Event('input', { bubbles: true });
    editorRef.current?.dispatchEvent(event);
    
    setImageModalConfig(null);
    setSavedRange(null);
    editorRef.current?.focus();
  };

  const openCitationModal = () => {
    saveSelection();
    setExistingSources(getCitationsFromDOM());
    setCitationTab('add');
    setSelectedExistingSourceId('');
    setIsCitationModalOpen(true);
  };

  const getCitationsFromDOM = (): Array<{ id: string, authors: string, year: string, refDetails: string }> => {
    if (!editorRef.current) return [];
    const elements = Array.from(editorRef.current.querySelectorAll('.nextprep-citation'));
    const uniqueMap = new Map<string, { id: string, authors: string, year: string, refDetails: string }>();
    
    elements.forEach(el => {
      if (el instanceof HTMLElement) {
        const id = el.getAttribute('data-ref-id') || '';
        const authors = el.getAttribute('data-authors') || '';
        const year = el.getAttribute('data-year') || '';
        const refDetails = el.getAttribute('data-ref-details') || '';
        if (id && authors) {
          uniqueMap.set(id, { id, authors, year, refDetails });
        }
      }
    });
    
    return Array.from(uniqueMap.values());
  };

  const updateReferencesBlock = () => {
    if (!editorRef.current) return;
    
    const citations = Array.from(editorRef.current.querySelectorAll('.nextprep-citation'));
    const uniqueRefs = new Map<string, { id: string, authors: string, details: string }>();
    
    citations.forEach(el => {
      if (el instanceof HTMLElement) {
        const id = el.getAttribute('data-ref-id') || '';
        const authors = el.getAttribute('data-authors') || '';
        const details = el.getAttribute('data-ref-details') || '';
        if (id && details) {
          uniqueRefs.set(id, { id, authors, details });
        }
      }
    });
    
    const existingHeading = editorRef.current.querySelector('#nextprep-references-heading');
    const existingList = editorRef.current.querySelector('#nextprep-references-list');
    
    existingHeading?.remove();
    existingList?.remove();
    
    if (uniqueRefs.size === 0) {
      const event = new Event('input', { bubbles: true });
      editorRef.current.dispatchEvent(event);
      return;
    }
    
    const sortedRefs = Array.from(uniqueRefs.values()).sort((a, b) => {
      return a.authors.localeCompare(b.authors);
    });
    
    const heading = document.createElement('h2');
    heading.id = 'nextprep-references-heading';
    heading.className = 'nextprep-references-title font-bold text-xl mt-8 mb-4 border-b pb-2';
    heading.textContent = 'References';
    heading.contentEditable = 'false';
    
    const container = document.createElement('div');
    container.id = 'nextprep-references-list';
    container.className = 'nextprep-references-container space-y-2';
    container.contentEditable = 'false';
    
    sortedRefs.forEach(ref => {
      const item = document.createElement('p');
      item.id = ref.id;
      item.className = 'nextprep-reference-item pl-8 -indent-8 text-sm text-slate-700 dark:text-slate-300';
      item.textContent = ref.details;
      container.appendChild(item);
    });
    
    editorRef.current.appendChild(heading);
    editorRef.current.appendChild(container);
    
    const event = new Event('input', { bubbles: true });
    editorRef.current.dispatchEvent(event);
  };

  const insertCitation = () => {
    if (!editorRef.current) return;
    
    let authors = '';
    let year = '';
    let refDetails = '';
    let isParenthetical = true;
    
    if (citationTab === 'add') {
      const authInput = document.getElementById('citation-authors') as HTMLInputElement;
      const yrInput = document.getElementById('citation-year') as HTMLInputElement;
      const refInput = document.getElementById('citation-ref-details') as HTMLTextAreaElement;
      const styleInputs = document.getElementsByName('cite-style') as NodeListOf<HTMLInputElement>;
      
      authors = authInput?.value.trim() || '';
      year = yrInput?.value.trim() || '';
      refDetails = refInput?.value.trim() || '';
      
      styleInputs.forEach(input => {
        if (input.checked) {
          isParenthetical = input.value === 'parenthetical';
        }
      });
      
      if (!authors || !year || !refDetails) {
        alert("Please fill in all reference details!");
        return;
      }
    } else {
      const selectedSrc = existingSources.find(s => s.id === selectedExistingSourceId);
      if (!selectedSrc) return;
      
      authors = selectedSrc.authors;
      year = selectedSrc.year;
      refDetails = selectedSrc.refDetails;
      
      const styleInputs = document.getElementsByName('cite-style-existing') as NodeListOf<HTMLInputElement>;
      styleInputs.forEach(input => {
        if (input.checked) {
          isParenthetical = input.value === 'parenthetical';
        }
      });
    }

    const refId = `ref-${authors.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${year}`;
    
    restoreSelection();
    
    let citationHTML = '';
    if (isParenthetical) {
      citationHTML = `<a href="#${refId}" class="nextprep-citation" data-ref-id="${refId}" data-authors="${authors}" data-year="${year}" data-ref-details="${refDetails}" contenteditable="false">(${authors}, ${year})</a>`;
    } else {
      citationHTML = `${authors} <a href="#${refId}" class="nextprep-citation" data-ref-id="${refId}" data-authors="${authors}" data-year="${year}" data-ref-details="${refDetails}" contenteditable="false">(${year})</a>`;
    }
    
    document.execCommand('insertHTML', false, citationHTML);
    
    setTimeout(() => {
      updateReferencesBlock();
    }, 100);

    setIsCitationModalOpen(false);
    setSavedRange(null);
  };

  const cleanEmptyLines = () => {
    if (!editorRef.current) return;
    
    const children = Array.from(editorRef.current.children);
    let removedCount = 0;
    children.forEach((child) => {
      if (child instanceof HTMLElement) {
        const text = child.textContent?.replace(/[\s\u00a0]+/g, '').trim();
        const hasImg = child.querySelector('img');
        const hasTable = child.querySelector('table');
        const hasMath = child.hasAttribute('data-math-id') || child.querySelector('[data-math-id]');
        
        if (!text && !hasImg && !hasTable && !hasMath) {
          child.remove();
          removedCount++;
        }
      }
    });
    
    const brs = Array.from(editorRef.current.querySelectorAll('br'));
    brs.forEach((br) => {
      const parent = br.parentElement;
      if (parent && parent.childNodes.length === 1 && parent.tagName === 'P') {
        // Keeps baseline placeholders
      } else {
        let next = br.nextSibling;
        while (next && next.nodeName === 'BR') {
          const toRemove = next;
          next = next.nextSibling;
          toRemove.remove();
          removedCount++;
        }
      }
    });
    
    if (editorRef.current.innerHTML.trim() === '') {
      editorRef.current.innerHTML = '<p><br></p>';
    }
    
    toast.success(`Cleaned empty lines successfully!`);
    onChange(getCleanHTML());
  };

  const cleanDoubleSpaces = () => {
    if (!editorRef.current) return;
    
    const walk = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT, null);
    let node;
    let count = 0;
    while (node = walk.nextNode()) {
      if (node.nodeValue) {
        const original = node.nodeValue;
        let cleaned = original.replace(/[ \u00a0]{2,}/g, ' ');
        if (cleaned !== original) {
          node.nodeValue = cleaned;
          count++;
        }
      }
    }
    
    toast.success(`Removed extra spaces successfully!`);
    onChange(getCleanHTML());
  };

  const clearEmptyBlocks = () => {
    if (!editorRef.current) return;
    
    const children = Array.from(editorRef.current.children);
    let removedCount = 0;
    children.forEach((child) => {
      if (child instanceof HTMLElement) {
        const text = child.textContent?.replace(/[\s\u00a0]+/g, '').trim();
        const hasImg = child.querySelector('img');
        const hasTable = child.querySelector('table');
        const hasMath = child.hasAttribute('data-math-id') || child.querySelector('[data-math-id]');
        
        if (!text && !hasImg && !hasTable && !hasMath) {
          child.remove();
          removedCount++;
        }
      }
    });
    
    if (editorRef.current.innerHTML.trim() === '') {
      editorRef.current.innerHTML = '<p><br></p>';
    }
    
    toast.success(`Cleared empty blocks successfully!`);
    onChange(getCleanHTML());
  };

  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target && target.classList.contains('nextprep-citation')) {
      e.preventDefault();
      const refId = target.getAttribute('href')?.replace('#', '');
      if (refId) {
        const refEl = editorRef.current?.querySelector(`#${refId}`);
        if (refEl) {
          refEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          refEl.classList.add('bg-blue-100/30', 'dark:bg-blue-900/20');
          setTimeout(() => {
            refEl.classList.remove('bg-blue-100/30', 'dark:bg-blue-900/20');
          }, 1500);
        }
      }
      return;
    }

    const clickCount = e.detail;
    if (clickCount === 3) {
      e.preventDefault();
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const node = sel.anchorNode;
      if (node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } else if (clickCount >= 4) {
      e.preventDefault();
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      let node = sel.anchorNode;
      let blockNode: HTMLElement | null = null;
      while (node) {
        if (node instanceof HTMLElement && ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'LI', 'PRE', 'BLOCKQUOTE', 'TABLE'].includes(node.tagName)) {
          blockNode = node;
          break;
        }
        node = node.parentNode;
      }
      if (blockNode) {
        const range = document.createRange();
        range.selectNodeContents(blockNode);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  };

  const handleMarginMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!editorRef.current) return;
    
    const clickY = e.clientY;
    const children = Array.from(editorRef.current.children);
    
    let targetEl: HTMLElement | null = null;
    for (const child of children) {
      if (child instanceof HTMLElement) {
        const rect = child.getBoundingClientRect();
        if (clickY >= rect.top && clickY <= rect.bottom) {
          targetEl = child;
          break;
        }
      }
    }
    
    if (!targetEl) return;
    
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    
    const range = document.createRange();
    
    if (e.detail === 1) {
      range.selectNodeContents(targetEl);
    } else if (e.detail === 2) {
      range.selectNode(targetEl);
    } else {
      range.selectNodeContents(editorRef.current);
    }
    
    sel.addRange(range);
  };

  const updateOutline = useCallback(() => {
    if (!editorRef.current) return;
    const headingElements = editorRef.current.querySelectorAll('h1, h2, h3, h4, h5');
    const items = Array.from(headingElements).map((el, i) => {
      if (!el.id) {
        el.id = `heading-${i}`;
      }
      return {
        id: el.id,
        text: el.textContent || '',
        level: parseInt(el.tagName.replace('H', ''))
      };
    });
    setHeadings(items);
  }, []);

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

  const debouncedOnChange = useCallback(
    debounce((html: string) => {
      onChange(html);
    }, 600),
    [onChange]
  );

  const debouncedUpdateOutline = useCallback(
    debounce(() => {
      updateOutline();
    }, 800),
    [updateOutline]
  );

  const flushChanges = useCallback(() => {
    debouncedOnChange.cancel();
    onChange(getCleanHTML());
  }, [onChange, getCleanHTML, debouncedOnChange]);

  useEffect(() => {
    updateOutline();
    const observer = new MutationObserver(() => debouncedUpdateOutline());
    if (editorRef.current) {
      observer.observe(editorRef.current, { childList: true, subtree: true, characterData: true });
    }
    return () => {
      observer.disconnect();
      debouncedUpdateOutline.cancel();
    };
  }, [activeTab, updateOutline, debouncedUpdateOutline]);

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
        debouncedOnChange(getCleanHTML());
      }
    });

    observer.observe(editorRef.current, { childList: true, subtree: true, characterData: true });
    syncMathNodes(); // Initial scan

    return () => {
      observer.disconnect();
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange, getCleanHTML]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleEditorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('nextprep-checklist-box')) {
        e.preventDefault();
        if (target.innerHTML.includes('\u2610') || target.innerHTML.includes('☐')) {
          target.innerHTML = '&#9745; ';
        } else {
          target.innerHTML = '&#9744; ';
        }
        onChange(getCleanHTML());
      }
    };

    editor.addEventListener('click', handleEditorClick);
    return () => editor.removeEventListener('click', handleEditorClick);
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
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') { e.preventDefault(); document.execCommand('bold'); }
      if (e.key === 'i') { e.preventDefault(); document.execCommand('italic'); }
      if (e.key === 'a') {
        e.preventDefault();
        const range = document.createRange();
        if (editorRef.current) {
          range.selectNodeContents(editorRef.current);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }
    }
  };

  return (
    <div ref={containerRef} className={`rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900 flex flex-col ${darkMode ? 'dark' : ''} ${isFullScreen ? 'fixed inset-0 z-[100] w-screen h-screen rounded-none m-0' : 'relative w-full'}`}>
      
      {/* Tab Controls (Editor, Live Preview, Raw HTML) */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2 gap-2 select-none z-40">
        <button
          onClick={() => {
            flushChanges();
            setActiveTab('editor');
          }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'editor' 
              ? 'bg-blue-600 text-white shadow-sm font-bold' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          Editor Mode
        </button>
        <button
          onClick={() => {
            updateReferencesBlock();
            flushChanges();
            setActiveTab('preview');
          }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'preview' 
              ? 'bg-blue-600 text-white shadow-sm font-bold' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          Live Preview (Math Rendered)
        </button>
        <button
          onClick={() => {
            updateReferencesBlock();
            flushChanges();
            setActiveTab('raw');
          }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'raw' 
              ? 'bg-blue-600 text-white shadow-sm font-bold' 
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          Raw HTML Code
        </button>
      </div>

      {/* Editor Toolbars (Only shown in editor mode) */}
      <div className={activeTab === 'editor' ? 'block' : 'hidden'}>
        <MenuBar 
          editorRef={editorRef} 
          onInsertMath={insertMath}
          editorMode={editorMode}
          setEditorMode={setEditorMode}
          showRuler={showRuler}
          setShowRuler={setShowRuler}
          showOutline={showOutline}
          setShowOutline={setShowOutline}
          isFullScreen={isFullScreen}
          setIsFullScreen={setIsFullScreen}
          onOpenPageSetup={() => {
            setTempMargins(margins);
            setIsPageSetupOpen(true);
          }}
          onOpenLinkModal={openLinkModal}
          onOpenImageModal={openImageModal}
          showBlocks={showBlocks}
          setShowBlocks={setShowBlocks}
          onCleanEmptyLines={cleanEmptyLines}
          onCleanDoubleSpaces={cleanDoubleSpaces}
          onClearEmptyBlocks={clearEmptyBlocks}
        />
        {editorMode === 'editing' && (
          <>
            <TopToolbar 
              editorRef={editorRef} 
              onInsertMath={insertMath} 
              onOpenLinkModal={openLinkModal}
              onOpenImageModal={openImageModal}
              onOpenCitationModal={openCitationModal}
            />
            <TableToolbar editorRef={editorRef} />
          </>
        )}
      </div>

      {/* Read-Only Warning Banner */}
      {editorMode === 'viewing' && activeTab === 'editor' && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 select-none z-30">
          <span className="font-semibold">Viewing Mode: You are viewing this document in read-only mode.</span>
          <button 
            onClick={() => setEditorMode('editing')}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded font-bold transition-colors"
          >
            Switch to Editing
          </button>
        </div>
      )}

      {/* Margins Ruler */}
      {showRuler && activeTab === 'editor' && (
        <div className="h-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center relative select-none px-6">
          <div className="absolute left-6 right-6 h-full flex items-center">
            {Array.from({ length: 40 }).map((_, i) => (
              <div 
                key={i} 
                className="absolute bg-slate-300 dark:bg-slate-700" 
                style={{ 
                  left: `${(i / 40) * 100}%`,
                  height: i % 5 === 0 ? '8px' : '4px',
                  width: '1px'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Document Workspace (Flex columns for sidebar & editing workspace) */}
      <div className={`flex flex-1 overflow-hidden min-h-[400px] ${activeTab === 'editor' ? 'flex-row' : 'flex-col'}`}>
        {/* Document Outline Sidebar */}
        {showOutline && activeTab === 'editor' && (
          <div className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 shrink-0 overflow-y-auto max-h-[600px] select-none">
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Document Outline</div>
            {headings.length === 0 ? (
              <div className="text-xs text-slate-400 dark:text-slate-600 italic">No headings in document</div>
            ) : (
              <div className="space-y-2.5">
                {headings.map(h => (
                  <button
                    key={h.id}
                    onClick={() => {
                      const el = document.getElementById(h.id);
                      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="w-full text-left text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors block truncate"
                    style={{ paddingLeft: `${(h.level - 1) * 8}px` }}
                  >
                    {h.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Editor Main Centered Page Container */}
        <div className={`flex-1 flex flex-row relative ${activeTab === 'editor' ? 'block' : 'hidden'}`}>
          {/* MS Word Selection Margin */}
          {activeTab === 'editor' && (
            <div 
              onMouseDown={handleMarginMouseDown}
              className="w-8 shrink-0 select-none bg-slate-50/50 dark:bg-slate-900/50 border-r border-dashed border-slate-200 dark:border-slate-800 cursor-pointer flex items-center justify-center group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              style={{
                cursor: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'18\' height=\'18\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><line x1=\'5\' y1=\'12\' x2=\'19\' y2=\'12\'/><polyline points=\'12 5 19 12 12 19\'/></svg>"), pointer'
              }}
              title="Click to select line, double-click for paragraph, triple-click for all"
            >
              <div className="text-[9px] text-slate-400 font-bold uppercase rotate-90 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity select-none whitespace-nowrap">
                Margin select
              </div>
            </div>
          )}

          {/* Editor Content Area */}
          <div
            ref={editorRef}
            className={`prose prose-lg dark:prose-invert max-w-none w-full focus:outline-none flex-1 overflow-y-auto ${showBlocks ? 'view-blocks' : ''}`}
            contentEditable={editorMode === 'editing'}
            suppressContentEditableWarning
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onKeyDown={handleKeyDown}
            onClick={handleEditorClick}
            onBlur={(e) => {
              const relatedTarget = e.relatedTarget as HTMLElement;
              if (containerRef.current?.contains(relatedTarget)) {
                return;
              }
              updateReferencesBlock();
              onChange(getCleanHTML());
            }}
            style={{ 
              whiteSpace: 'pre-wrap',
              paddingTop: `${margins.top}px`,
              paddingBottom: `${margins.bottom + 250}px`,
              paddingLeft: `${margins.left}px`,
              paddingRight: `${margins.right}px`,
            }}
          />
        </div>

        {/* Live Preview Mode */}
        {activeTab === 'preview' && (
          <div className="p-8 bg-white dark:bg-slate-950 flex-1 overflow-y-auto min-h-[400px]">
            <RichTextDisplay content={getCleanHTML()} className="prose prose-lg dark:prose-invert max-w-none" />
          </div>
        )}

        {/* Raw HTML Code Mode */}
        {activeTab === 'raw' && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950 flex-1 min-h-[400px]">
            <HTMLView 
              value={getCleanHTML()} 
              onChange={(newVal) => {
                if (editorRef.current) {
                  editorRef.current.innerHTML = newVal;
                  onChange(newVal);
                }
              }} 
            />
          </div>
        )}
      </div>

      {/* Page Setup Margins Modal */}
      {isPageSetupOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-900/50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-80 max-w-full flex flex-col gap-4 animate-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100">
            <h3 className="font-bold text-base border-b border-slate-100 dark:border-slate-700 pb-2 font-sans">Page setup - Margins (px)</h3>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 font-semibold font-sans">Top</span>
                <input 
                  type="number" 
                  value={tempMargins.top} 
                  onChange={(e) => setTempMargins(prev => ({ ...prev, top: parseInt(e.target.value) || 0 }))}
                  className="px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 text-sm font-sans"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 font-semibold font-sans">Bottom</span>
                <input 
                  type="number" 
                  value={tempMargins.bottom} 
                  onChange={(e) => setTempMargins(prev => ({ ...prev, bottom: parseInt(e.target.value) || 0 }))}
                  className="px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 text-sm font-sans"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 font-semibold font-sans">Left</span>
                <input 
                  type="number" 
                  value={tempMargins.left} 
                  onChange={(e) => setTempMargins(prev => ({ ...prev, left: parseInt(e.target.value) || 0 }))}
                  className="px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 text-sm font-sans"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 font-semibold font-sans">Right</span>
                <input 
                  type="number" 
                  value={tempMargins.right} 
                  onChange={(e) => setTempMargins(prev => ({ ...prev, right: parseInt(e.target.value) || 0 }))}
                  className="px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 text-sm font-sans"
                />
              </div>
            </div>
            
            <div className="flex gap-2 justify-end mt-4">
              <button 
                onClick={() => {
                  setMargins({ top: 24, bottom: 24, left: 24, right: 24 });
                  setTempMargins({ top: 24, bottom: 24, left: 24, right: 24 });
                  setIsPageSetupOpen(false);
                }}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold font-sans"
              >
                Reset Default
              </button>
              <button 
                onClick={() => {
                  setMargins(tempMargins);
                  setIsPageSetupOpen(false);
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold font-sans"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Link Modal */}
      {linkModalConfig?.isOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-900/50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-96 max-w-full flex flex-col gap-4 animate-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100">
            <h3 className="font-bold text-base border-b border-slate-100 dark:border-slate-700 pb-2 font-sans">Insert Link</h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 font-semibold font-sans">Text to display</span>
                <input 
                  type="text" 
                  value={linkModalConfig.text} 
                  onChange={(e) => setLinkModalConfig(prev => prev ? ({ ...prev, text: e.target.value }) : null)}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Link text"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 font-semibold font-sans">Link URL</span>
                <input 
                  type="text" 
                  value={linkModalConfig.url} 
                  onChange={(e) => setLinkModalConfig(prev => prev ? ({ ...prev, url: e.target.value }) : null)}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold select-none font-sans mt-1">
                <input 
                  type="checkbox" 
                  checked={linkModalConfig.isNewTab}
                  onChange={(e) => setLinkModalConfig(prev => prev ? ({ ...prev, isNewTab: e.target.checked }) : null)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Open in new tab
              </label>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button 
                onClick={() => setLinkModalConfig(null)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold font-sans"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleLinkModalSubmit(linkModalConfig.text || linkModalConfig.url, linkModalConfig.url, linkModalConfig.isNewTab)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold font-sans"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Image Modal */}
      {imageModalConfig?.isOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-900/50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-96 max-w-full flex flex-col gap-4 animate-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100">
            <h3 className="font-bold text-base border-b border-slate-100 dark:border-slate-700 pb-2 font-sans">Insert Image</h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 font-semibold font-sans">Image Source URL</span>
                <input 
                  type="text" 
                  value={imageModalConfig.url} 
                  onChange={(e) => setImageModalConfig(prev => prev ? ({ ...prev, url: e.target.value }) : null)}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.png"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 font-semibold font-sans">Alternative description (Alt text)</span>
                <input 
                  type="text" 
                  value={imageModalConfig.alt} 
                  onChange={(e) => setImageModalConfig(prev => prev ? ({ ...prev, alt: e.target.value }) : null)}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500 font-semibold font-sans">Width</span>
                  <select 
                    value={imageModalConfig.width}
                    onChange={(e) => setImageModalConfig(prev => prev ? ({ ...prev, width: e.target.value }) : null)}
                    className="px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="25%">25% (Thumbnail)</option>
                    <option value="50%">50% (Medium)</option>
                    <option value="75%">75% (Large)</option>
                    <option value="100%">100% (Full Width)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500 font-semibold font-sans">Alignment</span>
                  <select 
                    value={imageModalConfig.align}
                    onChange={(e) => setImageModalConfig(prev => prev ? ({ ...prev, align: e.target.value }) : null)}
                    className="px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="left">Left Align</option>
                    <option value="center">Center Align</option>
                    <option value="right">Right Align</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button 
                onClick={() => setImageModalConfig(null)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold font-sans"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleImageModalSubmit(imageModalConfig.url, imageModalConfig.alt, imageModalConfig.width, imageModalConfig.align)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold font-sans"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {isCitationModalOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-900/50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-[420px] max-w-full flex flex-col gap-4 animate-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100">
            <h3 className="font-bold text-base border-b border-slate-100 dark:border-slate-700 pb-2 font-sans flex items-center gap-2">
              <Quote size={18} className="text-blue-600 dark:text-blue-400" />
              Insert APA Citation & Reference
            </h3>
            
            {/* Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-700 text-xs font-bold font-sans">
              <button 
                onClick={() => setCitationTab('add')}
                className={`flex-1 pb-2 border-b-2 text-center transition-colors ${citationTab === 'add' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Add New Source
              </button>
              <button 
                onClick={() => {
                  setCitationTab('list');
                  setExistingSources(getCitationsFromDOM());
                }}
                className={`flex-1 pb-2 border-b-2 text-center transition-colors ${citationTab === 'list' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Use Existing ({getCitationsFromDOM().length})
              </button>
            </div>

            {citationTab === 'add' ? (
              <div className="flex flex-col gap-3 font-sans text-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-500 font-semibold">Author(s) (e.g. Hossain & Ahmed)</span>
                  <input 
                    type="text" 
                    id="citation-authors"
                    placeholder="e.g. Hossain & Ahmed"
                    className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-500 font-semibold">Year (e.g. 2025)</span>
                  <input 
                    type="text" 
                    id="citation-year"
                    placeholder="e.g. 2025"
                    className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-500 font-semibold">Full APA Reference Details</span>
                  <textarea 
                    id="citation-ref-details"
                    rows={3}
                    placeholder="e.g. Hossain, M. & Ahmed, N. (2025). AI Pair Programming. DeepMind Press."
                    className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans"
                  />
                </div>
                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-slate-500 font-semibold">Citation Format</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                      <input type="radio" name="cite-style" value="parenthetical" defaultChecked />
                      Parenthetical
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                      <input type="radio" name="cite-style" value="narrative" />
                      Narrative
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 font-sans text-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-500 font-semibold">Select Cited Source</span>
                  {existingSources.length === 0 ? (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded text-center text-slate-500">
                      No citations exist in this document yet.
                    </div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50 dark:bg-slate-900">
                      {existingSources.map(src => (
                        <button
                          key={src.id}
                          onClick={() => setSelectedExistingSourceId(src.id)}
                          className={`w-full text-left p-2.5 transition-colors flex flex-col gap-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 ${selectedExistingSourceId === src.id ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-600' : ''}`}
                        >
                          <span className="font-bold text-slate-800 dark:text-slate-200">{src.authors} ({src.year})</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full">{src.refDetails}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-slate-500 font-semibold">Citation Format</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                      <input type="radio" name="cite-style-existing" value="parenthetical" defaultChecked />
                      Parenthetical
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                      <input type="radio" name="cite-style-existing" value="narrative" />
                      Narrative
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end mt-4">
              <button 
                onClick={() => {
                  setIsCitationModalOpen(false);
                  setSavedRange(null);
                }}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold font-sans"
              >
                Cancel
              </button>
              <button 
                onClick={insertCitation}
                disabled={citationTab === 'list' && !selectedExistingSourceId}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold font-sans disabled:opacity-50"
              >
                Insert Citation
              </button>
            </div>
          </div>
        </div>
      )}
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

      <style dangerouslySetInnerHTML={{ __html: `
        .view-blocks p,
        .view-blocks h1,
        .view-blocks h2,
        .view-blocks h3,
        .view-blocks h4,
        .view-blocks h5,
        .view-blocks blockquote,
        .view-blocks pre,
        .view-blocks ul,
        .view-blocks ol,
        .view-blocks table {
          outline: 1px dashed rgba(59, 130, 246, 0.45) !important;
          outline-offset: 3px;
          position: relative;
        }
      `}} />
    </div>
  );
}
