import React, { useState, useEffect } from 'react';
import { 
  Undo, Redo, Printer, Bold, Italic, Underline, Strikethrough, 
  Link as LinkIcon, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, IndentDecrease, IndentIncrease, 
  RemoveFormatting, ChevronDown, Check, Baseline, Highlighter,
  Paintbrush, CheckSquare, ArrowUpDown
} from 'lucide-react';
import PromptModal from '@/components/shared/PromptModal';

interface TopToolbarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  onInsertMath: () => void;
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

export default function TopToolbar({ editorRef, onInsertMath }: TopToolbarProps) {
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [currentFont, setCurrentFont] = useState('Default');
  const [customFonts, setCustomFonts] = useState<{name: string, value: string}[]>([]);
  const [currentSize, setCurrentSize] = useState(16);
  const [currentHeading, setCurrentHeading] = useState('Normal text');
  
  // Format Painter State
  const [isPainting, setIsPainting] = useState(false);
  const [paintedStyles, setPaintedStyles] = useState<any>(null);
  const [previewActive, setPreviewActive] = useState(false);

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

  const previewColor = (type: 'foreColor' | 'hiliteColor', color: string) => {
    document.execCommand(type, false, color);
    setPreviewActive(true);
    if (editorRef.current) editorRef.current.classList.add('hide-selection');
  };

  const revertColor = () => {
    if (previewActive) {
      document.execCommand('undo');
      setPreviewActive(false);
    }
    if (editorRef.current) editorRef.current.classList.remove('hide-selection');
  };

  const applyColor = (type: 'foreColor' | 'hiliteColor', color: string) => {
    if (previewActive) {
      document.execCommand('undo');
      setPreviewActive(false);
    }
    if (editorRef.current) editorRef.current.classList.remove('hide-selection');
    document.execCommand(type, false, color);
    editorRef.current?.focus();
  };

  const handleModalSubmit = (value: string) => {
    if (!modalConfig) return;
    
    restoreSelection();
    
    if (modalConfig.type === 'createLink' || modalConfig.type === 'insertImage') {
      document.execCommand(modalConfig.type, false, value);
    } else if (modalConfig.type === 'addGoogleFont') {
      const fontName = value;
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      
      setCustomFonts([...customFonts, { name: fontName, value: `"${fontName}", sans-serif` }]);
      document.execCommand('fontName', false, `"${fontName}", sans-serif`);
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
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const span = document.createElement('span');
    span.style.fontSize = `${size}px`;
    const range = selection.getRangeAt(0);
    const content = range.extractContents();
    span.appendChild(content);
    range.insertNode(span);
    
    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    selection.addRange(newRange);
    setCurrentSize(size);
    editorRef.current?.focus();
  };

  const setLineSpacing = (spacing: number) => {
    const selection = window.getSelection();
    if (!selection) return;
    let node: Node | null = selection.anchorNode;
    while (node && node.nodeName !== 'P' && node.nodeName !== 'H1' && node.nodeName !== 'H2' && node.nodeName !== 'DIV') {
      node = node.parentNode;
    }
    if (node && node instanceof HTMLElement) {
      node.style.lineHeight = spacing.toString();
    }
  };

  const insertChecklist = () => {
    // Visual Checklist implementation
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const span = document.createElement('span');
    span.innerHTML = '&#9744; '; // Empty checkbox symbol
    span.style.cursor = 'pointer';
    span.style.userSelect = 'none';
    span.onclick = () => {
      if (span.innerHTML.includes('&#9744;')) {
        span.innerHTML = '&#9745; '; // Checked box
      } else {
        span.innerHTML = '&#9744; ';
      }
    };
    const range = selection.getRangeAt(0);
    range.insertNode(span);
    range.collapse(false);
    editorRef.current?.focus();
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
      <style>{`
        .hide-selection ::selection {
          background-color: transparent !important;
          color: inherit !important;
        }
      `}</style>
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
      <ToolbarButton icon={Printer} command="print" tooltip="Print" />
      <ToolbarButton icon={Paintbrush} onClick={toggleFormatPainter} active={isPainting} tooltip="Format Painter" />
      
      <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1 shrink-0"></div>

      {/* Headings / Block Format */}
      <div className="relative group">
        <button className="flex items-center justify-between w-[110px] px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 transition-colors">
          <span className="truncate text-xs font-medium">{currentHeading}</span>
          <ChevronDown size={14} className="ml-1 opacity-50 shrink-0" />
        </button>
        <div className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible z-50">
          <div className="w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-1">
            {HEADINGS.map(h => (
              <button
                key={h.value}
                onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', `<${h.value}>`); setCurrentHeading(h.label); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 flex items-center justify-between"
              >
                {h.label}
                {currentHeading === h.label && <Check size={14} className="text-blue-500" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1 shrink-0"></div>

      {/* Font Family Picker */}
      <div className="relative group">
        <button className="flex items-center justify-between w-[130px] px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 transition-colors">
          <span className="truncate text-xs font-medium">{currentFont}</span>
          <ChevronDown size={14} className="ml-1 opacity-50 shrink-0" />
        </button>
        <div className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible z-50">
          <div className="w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-1">
            {allFonts.map(font => (
              <button
                key={font.name}
                onMouseDown={(e) => { e.preventDefault(); exec('fontName', font.value); setCurrentFont(font.name); }}
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
      </div>

      <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1 shrink-0"></div>

      {/* Font Size Picker */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-md p-0.5 border border-slate-200 dark:border-slate-700">
        <button 
          onMouseDown={(e) => { e.preventDefault(); handleCustomFontSize(Math.max(8, currentSize - 1)); }}
          className="p-1 w-6 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 flex items-center justify-center font-bold"
        >-</button>
        
        <div className="relative group">
          <button className="w-10 text-center text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded p-1">
            {currentSize}
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible z-50">
            <div className="w-16 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-1 h-64 overflow-y-auto">
              {FONT_SIZES.map(size => (
                <button
                  key={size}
                  onMouseDown={(e) => { e.preventDefault(); handleCustomFontSize(size); }}
                  className={`w-full text-center px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md ${currentSize === size ? 'bg-blue-50 text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
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
      
      {/* Text Color */}
      <div className="relative group">
        <button className="p-1.5 w-8 h-8 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center">
          <Baseline size={16} />
          <div className="w-4 h-1 bg-slate-900 dark:bg-slate-100 mt-0.5 rounded-full"></div>
        </button>
        <div className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible z-50">
          <div className="w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-2">
            <div className="text-xs font-semibold text-slate-500 mb-2">Text Color</div>
            <div className="grid grid-cols-10 gap-1 mb-2" onMouseLeave={revertColor}>
              {COLORS.map(color => (
                <button
                  key={color}
                  onMouseEnter={() => previewColor('foreColor', color)}
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
      </div>

      {/* Highlight Color */}
      <div className="relative group">
        <button className="p-1.5 w-8 h-8 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center">
          <Highlighter size={16} />
          <div className="w-4 h-1 bg-yellow-400 mt-0.5 rounded-full"></div>
        </button>
        <div className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible z-50">
          <div className="w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-2">
            <div className="text-xs font-semibold text-slate-500 mb-2">Highlight Color</div>
            <div className="grid grid-cols-10 gap-1 mb-2" onMouseLeave={revertColor}>
              {COLORS.map(color => (
                <button
                  key={color}
                  onMouseEnter={() => previewColor('hiliteColor', color)}
                  onMouseDown={(e) => { e.preventDefault(); applyColor('hiliteColor', color); }}
                  className="w-4 h-4 rounded-sm border border-slate-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
              <button 
                onMouseEnter={() => previewColor('hiliteColor', 'transparent')}
                onMouseDown={(e) => { e.preventDefault(); applyColor('hiliteColor', 'transparent'); }}
                className="col-span-10 mt-1 text-xs text-center py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600"
              >None</button>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
              <label className="flex items-center justify-between cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 p-1 rounded">
                Custom Color...
                <input 
                  type="color" 
                  className="w-6 h-6 p-0 border-0 rounded cursor-pointer" 
                  onChange={(e) => exec('hiliteColor', e.target.value)}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1 shrink-0"></div>

      <ToolbarButton icon={LinkIcon} command="createLink" tooltip="Insert Link (Ctrl+K)" />
      <button 
        onMouseDown={(e) => { e.preventDefault(); onInsertMath(); }}
        className="px-2 py-1 w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-serif font-bold text-sm"
        title="Insert Math Equation"
      >
        Σ
      </button>
      <ToolbarButton icon={ImageIcon} command="insertImage" tooltip="Insert Image" />

      <Divider />

      <ToolbarButton icon={AlignLeft} command="justifyLeft" active={isActive('justifyLeft')} tooltip="Align Left" />
      <ToolbarButton icon={AlignCenter} command="justifyCenter" active={isActive('justifyCenter')} tooltip="Align Center" />
      <ToolbarButton icon={AlignRight} command="justifyRight" active={isActive('justifyRight')} tooltip="Align Right" />
      <ToolbarButton icon={AlignJustify} command="justifyFull" active={isActive('justifyFull')} tooltip="Justify" />
      
      <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1 shrink-0"></div>
      
      {/* Line Spacing */}
      <div className="relative group">
        <button className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center">
          <ArrowUpDown size={16} />
        </button>
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible z-50">
          <div className="w-32 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-1">
            {LINE_SPACINGS.map(spacing => (
              <button
                key={spacing}
                onMouseDown={(e) => { e.preventDefault(); setLineSpacing(spacing); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300"
              >
                {spacing === 2.0 ? 'Double' : spacing}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-[1px] h-5 bg-slate-300 dark:bg-slate-700 mx-1 shrink-0"></div>

      <ToolbarButton icon={CheckSquare} onClick={insertChecklist} tooltip="Checklist" />
      <ToolbarButton icon={ListOrdered} command="insertOrderedList" active={isActive('insertOrderedList')} tooltip="Numbered List" />
      <ToolbarButton icon={List} command="insertUnorderedList" active={isActive('insertUnorderedList')} tooltip="Bulleted List" />
      <ToolbarButton icon={IndentDecrease} command="outdent" tooltip="Decrease Indent" />
      <ToolbarButton icon={IndentIncrease} command="indent" tooltip="Increase Indent" />

      <Divider />

      <ToolbarButton icon={RemoveFormatting} command="removeFormat" tooltip="Clear Formatting" />
    </div>
    </>
  );
}
