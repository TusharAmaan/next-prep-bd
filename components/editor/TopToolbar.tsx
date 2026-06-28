import React, { useState, useEffect } from 'react';
import { 
  Undo, Redo, Printer, Bold, Italic, Underline, Strikethrough, 
  Link as LinkIcon, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, IndentDecrease, IndentIncrease, 
  RemoveFormatting, ChevronDown, Check, Baseline, Highlighter,
  Paintbrush, CheckSquare, ArrowUpDown, Quote
} from 'lucide-react';
import PromptModal from '@/components/shared/PromptModal';

interface TopToolbarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  onInsertMath: () => void;
  onOpenLinkModal: () => void;
  onOpenImageModal: () => void;
  onOpenCitationModal: () => void;
}

const DEFAULT_FONTS = [
  { name: 'Default', value: 'inherit' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Times New Roman', value: '"Times New Roman", serif' },
  { name: 'Courier New', value: '"Courier New", monospace' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Noto Serif Bengali', value: '"Noto Serif Bengali", serif' }
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96];
const LINE_SPACINGS = [1.0, 1.15, 1.5, 2.0];
const HEADINGS = [
  { label: 'Normal text', value: 'P' },
  { label: 'Title', value: 'H1' },
  { label: 'Subtitle', value: 'H2' },
  { label: 'Heading 1', value: 'H3' },
  { label: 'Heading 2', value: 'H4' },
  { label: 'Heading 3', value: 'H5' },
];

const COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
];

export default function TopToolbar({ 
  editorRef, 
  onInsertMath,
  onOpenLinkModal,
  onOpenImageModal,
  onOpenCitationModal
}: TopToolbarProps) {
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [currentFont, setCurrentFont] = useState('Default');
  const [customFonts, setCustomFonts] = useState<{name: string, value: string}[]>([]);
  const [currentSize, setCurrentSize] = useState(16);
  const [currentHeading, setCurrentHeading] = useState('Normal text');
  
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!document.body.contains(target)) return;
      if (!target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(prev => prev === name ? null : name);
  };
  
  // Format Painter State
  const [isPainting, setIsPainting] = useState(false);
  const [paintedStyles, setPaintedStyles] = useState<any>(null);

  // Custom Modal State
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, type: string, title: string, placeholder: string} | null>(null);
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) setSavedRange(sel.getRangeAt(0));
  };

  const restoreSelection = () => {
    if (savedRange) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedRange);
    }
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      if (!editorRef.current || !editorRef.current.contains(document.activeElement)) return;
      
      const formats = [];
      if (document.queryCommandState('bold')) formats.push('bold');
      if (document.queryCommandState('italic')) formats.push('italic');
      if (document.queryCommandState('underline')) formats.push('underline');
      if (document.queryCommandState('strikethrough')) formats.push('strikethrough');
      if (document.queryCommandState('justifyLeft')) formats.push('justifyLeft');
      if (document.queryCommandState('justifyCenter')) formats.push('justifyCenter');
      if (document.queryCommandState('justifyRight')) formats.push('justifyRight');
      if (document.queryCommandState('justifyFull')) formats.push('justifyFull');
      if (document.queryCommandState('insertUnorderedList')) formats.push('insertUnorderedList');
      if (document.queryCommandState('insertOrderedList')) formats.push('insertOrderedList');
      
      setActiveFormats(formats);

      const fontNode = document.queryCommandValue('fontName');
      if (fontNode) {
        const cleanFont = fontNode.replace(/["']/g, '');
        const allFonts = [...DEFAULT_FONTS, ...customFonts];
        const matched = allFonts.find(f => f.value.includes(cleanFont) || cleanFont.includes(f.name));
        setCurrentFont(matched ? matched.name : cleanFont);
      }

      const blockFormat = document.queryCommandValue('formatBlock');
      if (blockFormat) {
        const cleanBlock = blockFormat.toUpperCase();
        const matchedH = HEADINGS.find(h => h.value === cleanBlock || h.value.toLowerCase() === cleanBlock);
        if (matchedH) setCurrentHeading(matchedH.label);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [editorRef, customFonts]);

  // Format Painter Listener
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleMouseUp = () => {
      if (isPainting && paintedStyles) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
          // Apply stored styles (Basic implementation for font, size, color)
          document.execCommand('styleWithCSS', false, 'true');
          if (paintedStyles.bold) document.execCommand('bold');
          if (paintedStyles.italic) document.execCommand('italic');
          if (paintedStyles.color) document.execCommand('foreColor', false, paintedStyles.color);
          if (paintedStyles.background) document.execCommand('hiliteColor', false, paintedStyles.background);
          if (paintedStyles.fontName) document.execCommand('fontName', false, paintedStyles.fontName);
          setIsPainting(false);
          setPaintedStyles(null);
        }
      }
    };

    editor.addEventListener('mouseup', handleMouseUp);
    return () => editor.removeEventListener('mouseup', handleMouseUp);
  }, [isPainting, paintedStyles, editorRef]);

  const toggleFormatPainter = () => {
    if (isPainting) {
      setIsPainting(false);
      setPaintedStyles(null);
    } else {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        alert("Select some text first to copy its formatting!");
        return;
      }
      setIsPainting(true);
      setPaintedStyles({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        color: document.queryCommandValue('foreColor'),
        background: document.queryCommandValue('hiliteColor'),
        fontName: document.queryCommandValue('fontName')
      });
    }
  };

  const exec = (command: string, value: string | undefined = undefined) => {
    document.execCommand('styleWithCSS', false, 'true');
    
    if (command === 'createLink') {
      saveSelection();
      setModalConfig({ isOpen: true, type: 'createLink', title: 'Insert Link', placeholder: 'https://example.com' });
      return;
    }
    
    if (command === 'insertImage') {
      saveSelection();
      setModalConfig({ isOpen: true, type: 'insertImage', title: 'Insert Image URL', placeholder: 'https://example.com/image.png' });
      return;
    }

    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const changeCase = (type: 'sentence' | 'lower' | 'upper' | 'title') => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const text = range.toString();
    if (!text) return;
    
    let newText = '';
    if (type === 'lower') {
      newText = text.toLowerCase();
    } else if (type === 'upper') {
      newText = text.toUpperCase();
    } else if (type === 'title') {
      newText = text.replace(/\b\w/g, c => c.toUpperCase());
    } else if (type === 'sentence') {
      newText = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
    
    range.deleteContents();
    range.insertNode(document.createTextNode(newText));
    
    const event = new Event('input', { bubbles: true });
    editorRef.current?.dispatchEvent(event);
  };

  const applyStyleToSelection = (styleName: string, styleValue: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    if (editorRef.current && !editorRef.current.contains(range.commonAncestorContainer)) {
      return;
    }

    if (selection.isCollapsed) {
      const span = document.createElement('span');
      (span.style as any)[styleName] = styleValue;
      span.appendChild(document.createTextNode('\u200B')); // Zero-width space
      range.insertNode(span);

      const newRange = document.createRange();
      newRange.setStart(span.firstChild!, 1);
      newRange.setEnd(span.firstChild!, 1);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      const span = document.createElement('span');
      (span.style as any)[styleName] = styleValue;
      const content = range.extractContents();
      span.appendChild(content);
      range.insertNode(span);

      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.addRange(newRange);
    }

    const event = new Event('input', { bubbles: true });
    editorRef.current?.dispatchEvent(event);
    editorRef.current?.focus();
  };

  const applyColor = (type: 'foreColor' | 'hiliteColor', color: string) => {
    if (type === 'foreColor') {
      applyStyleToSelection('color', color);
    } else {
      applyStyleToSelection('backgroundColor', color);
    }
    setActiveDropdown(null);
  };

  const handleModalSubmit = (value: string) => {
    if (!modalConfig) return;
    
    restoreSelection();
    
    if (modalConfig.type === 'createLink') {
      const selection = window.getSelection();
      if (selection && selection.isCollapsed) {
        const anchor = `<a href="${value}" target="_blank">${value}</a>&#8203;`;
        document.execCommand('insertHTML', false, anchor);
      } else {
        document.execCommand('createLink', false, value);
        if (selection && selection.rangeCount > 0) {
          let node: Node | null = selection.anchorNode;
          while (node && node !== editorRef.current) {
            if (node.nodeName === 'A') {
              (node as HTMLAnchorElement).target = '_blank';
              break;
            }
            node = node.parentNode;
          }
        }
      }
    } else if (modalConfig.type === 'insertImage') {
      document.execCommand('insertImage', false, value);
      setTimeout(() => {
        const img = editorRef.current?.querySelector(`img[src="${value}"]`) as HTMLImageElement;
        if (img) {
          img.className = 'max-w-full h-auto rounded-lg my-4 mx-auto block';
        }
      }, 50);
    } else if (modalConfig.type === 'addGoogleFont') {
      const fontName = value;
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      
      setCustomFonts([...customFonts, { name: fontName, value: `"${fontName}", sans-serif` }]);
      applyStyleToSelection('fontFamily', `"${fontName}", sans-serif`);
      setCurrentFont(fontName);
    }
    
    setModalConfig(null);
    setSavedRange(null);
    editorRef.current?.focus();
  };

  const addGoogleFont = () => {
    saveSelection();
    setModalConfig({ isOpen: true, type: 'addGoogleFont', title: 'Add Google Font', placeholder: "e.g. 'Roboto' or 'Outfit'" });
  };

  const handleCustomFontSize = (size: number) => {
    applyStyleToSelection('fontSize', `${size}px`);
    setCurrentSize(size);
  };

  const setLineSpacing = (spacing: number) => {
    const selection = window.getSelection();
    if (!selection) return;
    let node: Node | null = selection.anchorNode;
    while (node && node.nodeName !== 'P' && node.nodeName !== 'H1' && node.nodeName !== 'H2' && node.nodeName !== 'H3' && node.nodeName !== 'H4' && node.nodeName !== 'H5' && node.nodeName !== 'DIV') {
      node = node.parentNode;
    }
    if (node && node instanceof HTMLElement) {
      node.style.lineHeight = spacing.toString();
    }
    const event = new Event('input', { bubbles: true });
    editorRef.current?.dispatchEvent(event);
    setActiveDropdown(null);
  };

  const insertChecklist = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const span = document.createElement('span');
    span.className = 'nextprep-checklist-box';
    span.innerHTML = '&#9744; ';
    span.style.cursor = 'pointer';
    span.style.userSelect = 'none';
    
    const range = selection.getRangeAt(0);
    range.insertNode(span);
    range.collapse(false);
    
    const event = new Event('input', { bubbles: true });
    editorRef.current?.dispatchEvent(event);
    editorRef.current?.focus();
  };

  const setListStyle = (listType: string) => {
    if (!editorRef.current) return;
    const isOrdered = ['decimal', 'roman-upper', 'roman-lower', 'alpha-upper', 'alpha-lower'].includes(listType);
    const activeListCommand = isOrdered ? 'insertOrderedList' : 'insertUnorderedList';
    
    editorRef.current.focus();
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const getParentListNode = (node: Node | null, tagName: 'UL' | 'OL'): HTMLElement | null => {
      let curr: Node | null = node;
      while (curr && curr !== editorRef.current) {
        if (curr.nodeName === tagName) return curr as HTMLElement;
        curr = curr.parentNode;
      }
      return null;
    };
    
    let listNode = getParentListNode(selection.anchorNode, isOrdered ? 'OL' : 'UL');
    if (!listNode) {
      document.execCommand(activeListCommand, false);
      listNode = getParentListNode(window.getSelection()?.anchorNode, isOrdered ? 'OL' : 'UL');
    }
    
    if (listNode) {
      listNode.className = listNode.className.split(' ').filter(c => !c.startsWith('nextprep-list-')).join(' ');
      listNode.classList.add(`nextprep-list-${listType}`);
      
      const event = new Event('input', { bubbles: true });
      editorRef.current.dispatchEvent(event);
    }
  };

  const isActive = (format: string) => activeFormats.includes(format);
  
  const ToolbarButton = ({ icon: Icon, command, value, active, tooltip, onClick }: any) => (
    <button
      onMouseDown={(e) => { 
        e.preventDefault(); 
        if (onClick) onClick();
        else exec(command, value); 
      }}
      className={`p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center
        ${active ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}
      `}
      title={tooltip}
    >
      <Icon size={16} />
    </button>
  );

  const Divider = () => <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1 shrink-0"></div>;
  const allFonts = [...DEFAULT_FONTS, ...customFonts];

  return (
    <>
      <PromptModal
        isOpen={!!modalConfig?.isOpen}
        title={modalConfig?.title || ''}
        placeholder={modalConfig?.placeholder}
        onClose={() => setModalConfig(null)}
        onSubmit={handleModalSubmit}
      />
      <div className={`sticky top-0 z-20 flex flex-wrap items-center gap-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 ${!isPainting ? '' : 'ring-2 ring-blue-400'} text-sm shadow-sm w-full`}>
      <ToolbarButton icon={Undo} command="undo" tooltip="Undo" />
      <ToolbarButton icon={Redo} command="redo" tooltip="Redo" />
      <ToolbarButton icon={Printer} onClick={() => window.print()} tooltip="Print" />
      <ToolbarButton icon={Paintbrush} onClick={toggleFormatPainter} active={isPainting} tooltip="Format Painter" />
      
      <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1 shrink-0"></div>

      {/* Headings / Block Format */}
      <div className="relative dropdown-container">
        <button 
          onMouseDown={(e) => { e.preventDefault(); toggleDropdown('heading'); }}
          className={`flex items-center justify-between w-[110px] px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 transition-colors
            ${activeDropdown === 'heading' ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
        >
          <span className="truncate text-xs font-medium">{currentHeading}</span>
          <ChevronDown size={14} className="ml-1 opacity-50 shrink-0" />
        </button>
        {activeDropdown === 'heading' && (
          <div className="absolute left-0 top-full pt-1 z-50">
            <div className="w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-1 animate-in fade-in slide-in-from-top-1 duration-150">
              {HEADINGS.map(h => (
                <button
                  key={h.value}
                  onMouseDown={(e) => { 
                    e.preventDefault(); 
                    exec('formatBlock', `<${h.value}>`); 
                    setCurrentHeading(h.label); 
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 flex items-center justify-between"
                >
                  {h.label}
                  {currentHeading === h.label && <Check size={14} className="text-blue-500" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1 shrink-0"></div>

      {/* Font Family Picker */}
      <div className="relative dropdown-container">
        <button 
          onMouseDown={(e) => { e.preventDefault(); toggleDropdown('font'); }}
          className={`flex items-center justify-between w-[130px] px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 transition-colors
            ${activeDropdown === 'font' ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
        >
          <span className="truncate text-xs font-medium">{currentFont}</span>
          <ChevronDown size={14} className="ml-1 opacity-50 shrink-0" />
        </button>
        {activeDropdown === 'font' && (
          <div className="absolute left-0 top-full pt-1 z-50">
            <div className="w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-1 animate-in fade-in slide-in-from-top-1 duration-150">
              {allFonts.map(font => (
                <button
                  key={font.name}
                  onMouseDown={(e) => { 
                    e.preventDefault(); 
                    applyStyleToSelection('fontFamily', font.value); 
                    setCurrentFont(font.name); 
                    setActiveDropdown(null);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 flex items-center justify-between"
                  style={{ fontFamily: font.value !== 'inherit' ? font.value : undefined }}
                >
                  {font.name}
                  {currentFont === font.name && <Check size={14} className="text-blue-500" />}
                </button>
              ))}
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-1 mx-2" />
              <button
                onMouseDown={(e) => { e.preventDefault(); addGoogleFont(); }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md"
              >
                + Add Google Font...
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1 shrink-0"></div>

      {/* Font Size Picker */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-md p-0.5 border border-slate-200 dark:border-slate-700">
        <button 
          onMouseDown={(e) => { e.preventDefault(); handleCustomFontSize(Math.max(8, currentSize - 1)); }}
          className="p-1 w-6 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 flex items-center justify-center font-bold"
        >-</button>
        
        <div className="relative dropdown-container">
          <button 
            onMouseDown={(e) => { e.preventDefault(); toggleDropdown('fontSize'); }}
            className={`w-10 text-center text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded p-1
              ${activeDropdown === 'fontSize' ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
          >
            {currentSize}
          </button>
          {activeDropdown === 'fontSize' && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1 z-50">
              <div className="w-16 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-1 h-64 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
                {FONT_SIZES.map(size => (
                  <button
                    key={size}
                    onMouseDown={(e) => { e.preventDefault(); handleCustomFontSize(size); setActiveDropdown(null); }}
                    className={`w-full text-center px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md ${currentSize === size ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button 
          onMouseDown={(e) => { e.preventDefault(); handleCustomFontSize(Math.min(96, currentSize + 1)); }}
          className="p-1 w-6 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 flex items-center justify-center font-bold"
        >+</button>
      </div>

      <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1 shrink-0"></div>

      <ToolbarButton icon={Bold} command="bold" active={isActive('bold')} tooltip="Bold (Ctrl+B)" />
      <ToolbarButton icon={Italic} command="italic" active={isActive('italic')} tooltip="Italic (Ctrl+I)" />
      <ToolbarButton icon={Underline} command="underline" active={isActive('underline')} tooltip="Underline (Ctrl+U)" />
      <ToolbarButton icon={Strikethrough} command="strikethrough" active={isActive('strikethrough')} tooltip="Strikethrough" />

      {/* Subscript */}
      <ToolbarButton 
        icon={() => (
          <span className="font-semibold text-xs relative flex items-center justify-center select-none w-4 h-4">
            x<sub className="text-[8px] absolute left-2.5 bottom-[-1px]">2</sub>
          </span>
        )} 
        command="subscript" 
        active={isActive('subscript')} 
        tooltip="Subscript" 
      />

      {/* Superscript */}
      <ToolbarButton 
        icon={() => (
          <span className="font-semibold text-xs relative flex items-center justify-center select-none w-4 h-4">
            x<sup className="text-[8px] absolute left-2.5 top-[-1px]">2</sup>
          </span>
        )} 
        command="superscript" 
        active={isActive('superscript')} 
        tooltip="Superscript" 
      />

      {/* Change Case Dropdown */}
      <div className="relative dropdown-container">
        <button 
          onMouseDown={(e) => { e.preventDefault(); toggleDropdown('case'); }}
          className={`w-8 h-8 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs
            ${activeDropdown === 'case' ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
          title="Change Case"
        >
          Aa
        </button>
        {activeDropdown === 'case' && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1 z-50">
            <div className="w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-1 animate-in fade-in slide-in-from-top-1 duration-150 text-xs">
              <button 
                onMouseDown={(e) => { e.preventDefault(); changeCase('sentence'); setActiveDropdown(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 font-medium"
              >
                Sentence case
              </button>
              <button 
                onMouseDown={(e) => { e.preventDefault(); changeCase('lower'); setActiveDropdown(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 font-medium"
              >
                lowercase
              </button>
              <button 
                onMouseDown={(e) => { e.preventDefault(); changeCase('upper'); setActiveDropdown(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 font-medium"
              >
                UPPERCASE
              </button>
              <button 
                onMouseDown={(e) => { e.preventDefault(); changeCase('title'); setActiveDropdown(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 font-medium"
              >
                Capitalize Each Word
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Text Color */}
      <div className="relative dropdown-container">
        <button 
          onMouseDown={(e) => { e.preventDefault(); toggleDropdown('color'); }}
          className={`p-1.5 w-8 h-8 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center
            ${activeDropdown === 'color' ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
        >
          <Baseline size={16} />
          <div className="w-4 h-1 bg-slate-900 dark:bg-slate-100 mt-0.5 rounded-full"></div>
        </button>
        {activeDropdown === 'color' && (
          <div className="absolute left-0 top-full pt-1 z-50">
            <div className="w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-2 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="text-xs font-semibold text-slate-500 mb-2">Text Color</div>
              <div className="grid grid-cols-10 gap-1 mb-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onMouseDown={(e) => { e.preventDefault(); applyColor('foreColor', color); }}
                    className="w-4 h-4 rounded-sm border border-slate-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                <label className="flex items-center justify-between cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 p-1 rounded">
                  Custom Color...
                  <input 
                    type="color" 
                    className="w-6 h-6 p-0 border-0 rounded cursor-pointer" 
                    onChange={(e) => applyColor('foreColor', e.target.value)}
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Highlight Color */}
      <div className="relative dropdown-container">
        <button 
          onMouseDown={(e) => { e.preventDefault(); toggleDropdown('highlight'); }}
          className={`p-1.5 w-8 h-8 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center
            ${activeDropdown === 'highlight' ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
        >
          <Highlighter size={16} />
          <div className="w-4 h-1 bg-yellow-400 mt-0.5 rounded-full"></div>
        </button>
        {activeDropdown === 'highlight' && (
          <div className="absolute left-0 top-full pt-1 z-50">
            <div className="w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-2 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="text-xs font-semibold text-slate-500 mb-2">Highlight Color</div>
              <div className="grid grid-cols-10 gap-1 mb-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onMouseDown={(e) => { e.preventDefault(); applyColor('hiliteColor', color); }}
                    className="w-4 h-4 rounded-sm border border-slate-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
                <button 
                  onMouseDown={(e) => { e.preventDefault(); applyColor('hiliteColor', 'transparent'); }}
                  className="col-span-10 mt-1 text-xs text-center py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300"
                >None</button>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                <label className="flex items-center justify-between cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 p-1 rounded">
                  Custom Color...
                  <input 
                    type="color" 
                    className="w-6 h-6 p-0 border-0 rounded cursor-pointer" 
                    onChange={(e) => applyColor('hiliteColor', e.target.value)}
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1 shrink-0"></div>

      <ToolbarButton icon={LinkIcon} onClick={onOpenLinkModal} tooltip="Insert Link (Ctrl+K)" />
      <button 
        onMouseDown={(e) => { e.preventDefault(); onInsertMath(); }}
        className="px-2 py-1 w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-serif font-bold text-sm"
        title="Insert Math Equation"
      >
        Σ
      </button>
      <ToolbarButton icon={ImageIcon} onClick={onOpenImageModal} tooltip="Insert Image" />
      <ToolbarButton icon={Quote} onClick={onOpenCitationModal} tooltip="Insert Citation (APA)" />

      <Divider />

      <ToolbarButton icon={AlignLeft} command="justifyLeft" active={isActive('justifyLeft')} tooltip="Align Left" />
      <ToolbarButton icon={AlignCenter} command="justifyCenter" active={isActive('justifyCenter')} tooltip="Align Center" />
      <ToolbarButton icon={AlignRight} command="justifyRight" active={isActive('justifyRight')} tooltip="Align Right" />
      <ToolbarButton icon={AlignJustify} command="justifyFull" active={isActive('justifyFull')} tooltip="Justify" />
      
      <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1 shrink-0"></div>
      
      {/* Line Spacing */}
      <div className="relative dropdown-container">
        <button 
          onMouseDown={(e) => { e.preventDefault(); toggleDropdown('spacing'); }}
          className={`p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center
            ${activeDropdown === 'spacing' ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
        >
          <ArrowUpDown size={16} />
        </button>
        {activeDropdown === 'spacing' && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1 z-50">
            <div className="w-36 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-1 animate-in fade-in slide-in-from-top-1 duration-150">
              {LINE_SPACINGS.map(spacing => (
                <button
                  key={spacing}
                  onMouseDown={(e) => { e.preventDefault(); setLineSpacing(spacing); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 font-medium"
                >
                  {spacing === 2.0 ? 'Double (2.0)' : spacing === 1.0 ? 'Single (1.0)' : spacing === 1.15 ? '1.15' : '1.5'}
                </button>
              ))}
              
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-1 mx-2" />
              
              <div className="px-3 py-1.5 flex flex-col gap-1 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none font-sans">Custom Spacing</span>
                <div className="flex gap-1 items-center">
                  <input 
                    type="number" 
                    min={0.5} 
                    max={5} 
                    step={0.05}
                    defaultValue={1.2} 
                    id="custom-line-height-val"
                    className="w-14 px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-center bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-sans"
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const valInput = document.getElementById('custom-line-height-val') as HTMLInputElement;
                      const val = parseFloat(valInput?.value || '1.2');
                      setLineSpacing(val);
                    }}
                    className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold transition-colors font-sans shrink-0"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1 shrink-0"></div>

      <ToolbarButton icon={CheckSquare} onClick={insertChecklist} tooltip="Checklist" />
      {/* Unordered List Styles Dropdown */}
      <div className="relative dropdown-container flex items-center shrink-0">
        <button 
          onMouseDown={(e) => { e.preventDefault(); document.execCommand('insertUnorderedList', false); }}
          className={`p-1.5 rounded-l-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center h-8 w-8
            ${isActive('insertUnorderedList') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' : ''}`}
          title="Bulleted List"
        >
          <List size={16} />
        </button>
        <button 
          onMouseDown={(e) => { e.preventDefault(); toggleDropdown('unordered-list'); }}
          className={`p-1 rounded-r-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center h-8 border-l border-slate-200/50 dark:border-slate-700/50
            ${activeDropdown === 'unordered-list' ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
        >
          <ChevronDown size={10} />
        </button>
        {activeDropdown === 'unordered-list' && (
          <div className="absolute left-0 top-full pt-1 z-50">
            <div className="w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-1 animate-in fade-in slide-in-from-top-1 duration-150 text-xs">
              <button 
                onMouseDown={(e) => { e.preventDefault(); setListStyle('disc'); setActiveDropdown(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2"
              >
                <span className="text-[14px]">●</span> Disc bullet
              </button>
              <button 
                onMouseDown={(e) => { e.preventDefault(); setListStyle('circle'); setActiveDropdown(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2"
              >
                <span className="text-[14px]">○</span> Circle bullet
              </button>
              <button 
                onMouseDown={(e) => { e.preventDefault(); setListStyle('square'); setActiveDropdown(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2"
              >
                <span className="text-[14px]">■</span> Square bullet
              </button>
              <button 
                onMouseDown={(e) => { e.preventDefault(); setListStyle('arrow'); setActiveDropdown(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2"
              >
                <span className="text-[12px]">➔</span> Arrow bullet
              </button>
              <button 
                onMouseDown={(e) => { e.preventDefault(); setListStyle('checkmark'); setActiveDropdown(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2"
              >
                <span className="text-[12px]">✓</span> Checkmark bullet
              </button>
              <button 
                onMouseDown={(e) => { e.preventDefault(); setListStyle('dash'); setActiveDropdown(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2"
              >
                <span className="text-[12px]">–</span> Dash bullet
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ordered List Styles Dropdown */}
      <div className="relative dropdown-container flex items-center shrink-0">
        <button 
          onMouseDown={(e) => { e.preventDefault(); document.execCommand('insertOrderedList', false); }}
          className={`p-1.5 rounded-l-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center h-8 w-8
            ${isActive('insertOrderedList') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' : ''}`}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
        <button 
          onMouseDown={(e) => { e.preventDefault(); toggleDropdown('ordered-list'); }}
          className={`p-1 rounded-r-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center h-8 border-l border-slate-200/50 dark:border-slate-700/50
            ${activeDropdown === 'ordered-list' ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
        >
          <ChevronDown size={10} />
        </button>
        {activeDropdown === 'ordered-list' && (
          <div className="absolute left-0 top-full pt-1 z-50">
            <div className="w-44 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-1 animate-in fade-in slide-in-from-top-1 duration-150 text-xs">
              <button 
                onMouseDown={(e) => { e.preventDefault(); setListStyle('decimal'); setActiveDropdown(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 font-medium"
              >
                1. 2. 3. (Numbered)
              </button>
              <button 
                onMouseDown={(e) => { e.preventDefault(); setListStyle('roman-upper'); setActiveDropdown(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 font-medium"
              >
                I. II. III. (Roman Upper)
              </button>
              <button 
                onMouseDown={(e) => { e.preventDefault(); setListStyle('roman-lower'); setActiveDropdown(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 font-medium"
              >
                i. ii. iii. (Roman Lower)
              </button>
              <button 
                onMouseDown={(e) => { e.preventDefault(); setListStyle('alpha-upper'); setActiveDropdown(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 font-medium"
              >
                A. B. C. (Alpha Upper)
              </button>
              <button 
                onMouseDown={(e) => { e.preventDefault(); setListStyle('alpha-lower'); setActiveDropdown(null); }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 font-medium"
              >
                a. b. c. (Alpha Lower)
              </button>
            </div>
          </div>
        )}
      </div>
      <ToolbarButton icon={IndentDecrease} command="outdent" tooltip="Decrease Indent" />
      <ToolbarButton icon={IndentIncrease} command="indent" tooltip="Increase Indent" />

      <Divider />

      <ToolbarButton icon={RemoveFormatting} command="removeFormat" tooltip="Clear Formatting" />
    </div>
    </>
  );
}
