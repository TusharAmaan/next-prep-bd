import React from 'react';
import { 
  File, Edit, Eye, Type, Image as ImageIcon, Link as LinkIcon, 
  Table, HelpCircle, Sigma
} from 'lucide-react';
import PromptModal from '@/components/shared/PromptModal';
import { toast } from 'sonner';

interface MenuBarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  onInsertMath: () => void;
  editorMode: 'editing' | 'viewing';
  setEditorMode: (mode: 'editing' | 'viewing') => void;
  showRuler: boolean;
  setShowRuler: (show: boolean) => void;
  showOutline: boolean;
  setShowOutline: (show: boolean) => void;
  isFullScreen: boolean;
  setIsFullScreen: (full: boolean) => void;
  onOpenPageSetup: () => void;
  onOpenLinkModal: () => void;
  onOpenImageModal: () => void;
  showBlocks: boolean;
  setShowBlocks: (show: boolean) => void;
  onCleanEmptyLines: () => void;
  onCleanDoubleSpaces: () => void;
  onClearEmptyBlocks: () => void;
}

export default function MenuBar({ 
  editorRef, 
  onInsertMath,
  editorMode,
  setEditorMode,
  showRuler,
  setShowRuler,
  showOutline,
  setShowOutline,
  isFullScreen,
  setIsFullScreen,
  onOpenPageSetup,
  onOpenLinkModal,
  onOpenImageModal,
  showBlocks,
  setShowBlocks,
  onCleanEmptyLines,
  onCleanDoubleSpaces,
  onClearEmptyBlocks
}: MenuBarProps) {
  
  const [modalConfig, setModalConfig] = React.useState<{isOpen: boolean, type: string, title: string, placeholder: string} | null>(null);
  const [savedRange, setSavedRange] = React.useState<Range | null>(null);

  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = React.useState<string | null>(null);

  // Table Grid State
  const [hoveredCell, setHoveredCell] = React.useState({ r: 0, c: 0 });

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!document.body.contains(target)) return;
      if (!target.closest('.menubar-container')) {
        setActiveMenu(null);
        setActiveSubmenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    
    const event = new Event('input', { bubbles: true });
    editorRef.current?.dispatchEvent(event);
    
    editorRef.current?.focus();
  };

  const insertTable = (rows: number, cols: number) => {
    restoreSelection();
    const tableHTML = `
      <table class="nextprep-table" style="width: 100%; border-collapse: collapse; margin-bottom: 1rem;">
        <tbody>
          ${Array(rows).fill(0).map(() => `
            <tr>
              ${Array(cols).fill(0).map(() => `
                <td style="border: 1px solid #cbd5e1; padding: 8px; min-width: 50px;"><br></td>
              `).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table><p><br></p>
    `;
    document.execCommand('insertHTML', false, tableHTML);
    
    const event = new Event('input', { bubbles: true });
    editorRef.current?.dispatchEvent(event);
    
    editorRef.current?.focus();
  };

  const handleModalSubmit = (value: string) => {
    if (!modalConfig) return;
    restoreSelection();
    document.execCommand(modalConfig.type, false, value);
    
    const event = new Event('input', { bubbles: true });
    editorRef.current?.dispatchEvent(event);
    
    setModalConfig(null);
    setSavedRange(null);
    editorRef.current?.focus();
  };

  const MenuDropdown = ({ label, items }: { label: string, items: any[] }) => {
    const isOpen = activeMenu === label;
    
    return (
      <div className="relative">
        <button 
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopPropagation();
            saveSelection();
            setActiveSubmenu(null);
            setActiveMenu(prev => prev === label ? null : label);
          }}
          onMouseEnter={() => {
            if (activeMenu !== null) {
              saveSelection();
              setActiveSubmenu(null);
              setActiveMenu(label);
            }
          }}
          className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors
            ${isOpen 
              ? 'bg-slate-200 dark:bg-slate-700 text-blue-700 dark:text-blue-400 font-semibold' 
              : 'text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'}`}
        >
          {label}
        </button>
        {isOpen && (
          <div className="absolute left-0 top-full pt-1 z-50">
            <div className="w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1.5">
              {items.map((item, idx) => {
                if (item === 'separator') {
                  return <div key={idx} className="h-px bg-slate-200 dark:bg-slate-700 my-1.5" />;
                }
                if (item.component) {
                  return <React.Fragment key={idx}>{item.component}</React.Fragment>;
                }
                return (
                  <button
                    key={idx}
                    onMouseEnter={() => {
                      if (activeSubmenu !== null) {
                        setActiveSubmenu(null);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.nativeEvent.stopPropagation();
                      if (!item.disabled && item.action) {
                        item.action();
                        setActiveMenu(null);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-4 py-1.5 text-sm transition-colors
                      ${item.disabled 
                        ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed' 
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                    disabled={item.disabled}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && <item.icon size={16} className={item.disabled ? "text-slate-300 dark:text-slate-700" : "text-slate-400"} />}
                      <span className={item.disabled ? "opacity-50" : ""}>{item.label}</span>
                    </div>
                    {item.shortcut && (
                      <span className="text-xs text-slate-400 font-mono">{item.shortcut}</span>
                    )}
                    {item.checked && (
                      <span className="text-blue-500 dark:text-blue-400 font-bold">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const fileItems = [
    { label: 'New', disabled: true },
    { label: 'Open', disabled: true },
    { label: 'Make a copy', disabled: true },
    'separator',
    { label: 'Page Setup...', action: () => onOpenPageSetup() },
    { label: 'Download', disabled: true },
    'separator',
    { label: 'Print', shortcut: 'Ctrl+P', action: () => window.print() }
  ];

  const editItems = [
    { label: 'Undo', shortcut: 'Ctrl+Z', action: () => exec('undo') },
    { label: 'Redo', shortcut: 'Ctrl+Y', action: () => exec('redo') },
    'separator',
    { label: 'Cut', shortcut: 'Ctrl+X', action: () => exec('cut') },
    { label: 'Copy', shortcut: 'Ctrl+C', action: () => exec('copy') },
    { 
      label: 'Paste', 
      shortcut: 'Ctrl+V', 
      action: async () => {
        try {
          const text = await navigator.clipboard.readText();
          document.execCommand('insertText', false, text);
        } catch (err) {
          toast.error('Clipboard paste permission denied. Please use Ctrl+V directly.');
        }
      }
    },
    'separator',
    { 
      label: 'Select all', 
      shortcut: 'Ctrl+A', 
      action: () => {
        if (!editorRef.current) return;
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
  ];

  const viewItems = [
    { 
      label: 'Editing Mode', 
      checked: editorMode === 'editing', 
      action: () => setEditorMode('editing') 
    },
    { 
      label: 'Viewing Mode (Read-only)', 
      checked: editorMode === 'viewing', 
      action: () => setEditorMode('viewing') 
    },
    'separator',
    { 
      label: 'Show ruler', 
      checked: showRuler, 
      action: () => setShowRuler(!showRuler) 
    },
    { 
      label: 'Show outline', 
      checked: showOutline, 
      action: () => setShowOutline(!showOutline) 
    },
    { 
      label: 'Show blocks', 
      checked: showBlocks, 
      action: () => setShowBlocks(!showBlocks) 
    },
    { 
      label: 'Full screen', 
      checked: isFullScreen, 
      action: () => setIsFullScreen(!isFullScreen) 
    }
  ];

  const TablePicker = () => {
    const isSubmenuOpen = activeSubmenu === 'table';

    return (
      <div 
        className="relative w-full"
        onMouseEnter={() => {
          saveSelection();
          setActiveSubmenu('table');
        }}
      >
        <button 
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopPropagation();
          }}
          className="w-full flex items-center justify-between px-4 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Table size={16} className="text-slate-400" />
            <span>Table</span>
          </div>
          <span className="text-xs text-slate-400">▶</span>
        </button>
        
        {isSubmenuOpen && (
          <div className="absolute left-[100%] top-0 pl-1 z-[60]">
            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700">
              <div className="text-xs font-semibold text-slate-500 mb-2 text-center select-none">
                {hoveredCell.r > 0 ? `${hoveredCell.c} x ${hoveredCell.r}` : 'Insert Table'}
              </div>
              <div className="flex flex-col gap-0.5">
                {Array(10).fill(0).map((_, r) => (
                  <div key={r} className="flex gap-0.5">
                    {Array(10).fill(0).map((_, c) => {
                      const isHovered = r < hoveredCell.r && c < hoveredCell.c;
                      return (
                        <div
                          key={c}
                          onMouseEnter={() => setHoveredCell({ r: r + 1, c: c + 1 })}
                          onMouseDown={(e) => { 
                            e.preventDefault(); 
                            e.stopPropagation();
                            e.nativeEvent.stopPropagation();
                            insertTable(r + 1, c + 1);
                            setActiveMenu(null); // Close the whole menu bar
                          }}
                          className={`w-4 h-4 border cursor-pointer transition-colors ${
                            isHovered 
                              ? 'bg-blue-100 border-blue-400 dark:bg-blue-900/50 dark:border-blue-600' 
                              : 'bg-slate-50 border-slate-200 dark:bg-slate-700 dark:border-slate-600'
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              
              {/* Custom input row */}
              <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500 font-semibold select-none font-sans">Rows:</span>
                  <input 
                    type="number" 
                    min={1} 
                    max={50} 
                    defaultValue={3} 
                    id="custom-table-rows"
                    className="w-8 px-1 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-xs text-center bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100" 
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.nativeEvent.stopPropagation();
                    }}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500 font-semibold select-none font-sans">Cols:</span>
                  <input 
                    type="number" 
                    min={1} 
                    max={50} 
                    defaultValue={3} 
                    id="custom-table-cols"
                    className="w-8 px-1 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-xs text-center bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100" 
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.nativeEvent.stopPropagation();
                    }}
                  />
                </div>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopPropagation();
                    const rInput = document.getElementById('custom-table-rows') as HTMLInputElement;
                    const cInput = document.getElementById('custom-table-cols') as HTMLInputElement;
                    const r = parseInt(rInput?.value || '3');
                    const c = parseInt(cInput?.value || '3');
                    insertTable(r, c);
                    setActiveMenu(null);
                  }}
                  className="ml-auto px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold transition-colors font-sans"
                >
                  Insert
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const insertItems = [
    { label: 'Image', icon: ImageIcon, action: () => onOpenImageModal() },
    { component: <TablePicker /> },
    { label: 'Link', icon: LinkIcon, shortcut: 'Ctrl+K', action: () => onOpenLinkModal() },
    { label: 'Equation', icon: Sigma, action: () => onInsertMath() },
  ];

  const formatItems = [
    { label: 'Bold', shortcut: 'Ctrl+B', action: () => exec('bold') },
    { label: 'Italic', shortcut: 'Ctrl+I', action: () => exec('italic') },
    { label: 'Underline', shortcut: 'Ctrl+U', action: () => exec('underline') },
    { label: 'Strikethrough', shortcut: 'Alt+Shift+5', action: () => exec('strikethrough') },
    'separator',
    { label: 'Clear formatting', shortcut: 'Ctrl+\\', action: () => exec('removeFormat') }
  ];

  return (
    <>
      <PromptModal
        isOpen={!!modalConfig?.isOpen}
        title={modalConfig?.title || ''}
        placeholder={modalConfig?.placeholder}
        onClose={() => setModalConfig(null)}
        onSubmit={handleModalSubmit}
      />
      <div className="menubar-container relative z-30 flex flex-wrap items-center px-2 py-1 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 rounded-t-xl w-full">
      <MenuDropdown label="File" items={fileItems} />
      <MenuDropdown label="Edit" items={editItems} />
      <MenuDropdown label="View" items={viewItems} />
      <MenuDropdown label="Insert" items={insertItems} />
      <MenuDropdown label="Format" items={formatItems} />
      <MenuDropdown label="Tools" items={[{ label: 'Clean empty lines', action: () => onCleanEmptyLines() }, { label: 'Clean double spaces', action: () => onCleanDoubleSpaces() }, { label: 'Clear empty blocks', action: () => onClearEmptyBlocks() }, 'separator', { label: 'Word count', disabled: true }, { label: 'Spelling', disabled: true }]} />
      <MenuDropdown label="Extensions" items={[{ label: 'Manage extensions', disabled: true }]} />
      <MenuDropdown label="Help" items={[{ label: 'Help', disabled: true }]} />
    </div>
    </>
  );
}
