import React from 'react';
import { 
  File, Edit, Eye, Type, Image as ImageIcon, Link as LinkIcon, 
  Table, HelpCircle, Sigma
} from 'lucide-react';
import PromptModal from '@/components/shared/PromptModal';

interface MenuBarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  onInsertMath: () => void;
}

export default function MenuBar({ editorRef, onInsertMath }: MenuBarProps) {
  
  const [modalConfig, setModalConfig] = React.useState<{isOpen: boolean, type: string, title: string, placeholder: string} | null>(null);
  const [savedRange, setSavedRange] = React.useState<Range | null>(null);

  // Table Grid State
  const [hoveredCell, setHoveredCell] = React.useState({ r: 0, c: 0 });

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
    editorRef.current?.focus();
  };

  const handleModalSubmit = (value: string) => {
    if (!modalConfig) return;
    restoreSelection();
    document.execCommand(modalConfig.type, false, value);
    setModalConfig(null);
    setSavedRange(null);
    editorRef.current?.focus();
  };

  const MenuDropdown = ({ label, items }: { label: string, items: any[] }) => (
    <div className="relative group">
      <button className="px-3 py-1.5 text-[13px] font-medium text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 rounded-md transition-colors">
        {label}
      </button>
      <div className="absolute left-0 top-full pt-1 hidden group-hover:block z-50">
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
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (item.action) item.action();
                }}
                className="w-full flex items-center justify-between px-4 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                disabled={item.disabled}
              >
                <div className="flex items-center gap-3">
                  {item.icon && <item.icon size={16} className="text-slate-400" />}
                  <span className={item.disabled ? "opacity-50" : ""}>{item.label}</span>
                </div>
                {item.shortcut && (
                  <span className="text-xs text-slate-400 font-mono">{item.shortcut}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const fileItems = [
    { label: 'New', disabled: true },
    { label: 'Open', disabled: true },
    { label: 'Make a copy', disabled: true },
    'separator',
    { label: 'Download', disabled: true },
    'separator',
    { label: 'Print', shortcut: 'Ctrl+P', action: () => window.print() }
  ];

  const editItems = [
    { label: 'Undo', shortcut: 'Ctrl+Z', action: () => exec('undo') },
    { label: 'Redo', shortcut: 'Ctrl+Y', action: () => exec('redo') },
    'separator',
    { label: 'Cut', shortcut: 'Ctrl+X', disabled: true },
    { label: 'Copy', shortcut: 'Ctrl+C', disabled: true },
    { label: 'Paste', shortcut: 'Ctrl+V', disabled: true },
    'separator',
    { label: 'Select all', shortcut: 'Ctrl+A', action: () => exec('selectAll') }
  ];

  const viewItems = [
    { label: 'Mode', disabled: true },
    { label: 'Show ruler', disabled: true },
    { label: 'Show outline', disabled: true },
    { label: 'Full screen', disabled: true }
  ];

  const TablePicker = () => (
    <div className="relative group/table w-full">
      <button 
        onMouseEnter={saveSelection}
        className="w-full flex items-center justify-between px-4 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Table size={16} className="text-slate-400" />
          <span>Table</span>
        </div>
        <span className="text-xs text-slate-400">▶</span>
      </button>
      
      <div className="absolute left-[100%] top-0 pl-1 hidden group-hover/table:block z-[60]">
        <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700">
          <div className="text-xs font-semibold text-slate-500 mb-2 text-center">
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
                      onMouseDown={(e) => { e.preventDefault(); insertTable(hoveredCell.r, hoveredCell.c); }}
                      className={`w-4 h-4 border cursor-pointer ${isHovered ? 'bg-blue-100 border-blue-400 dark:bg-blue-900/50' : 'bg-slate-50 border-slate-200 dark:bg-slate-700 dark:border-slate-600'}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const insertItems = [
    { label: 'Image', icon: ImageIcon, action: () => exec('insertImage') },
    { component: <TablePicker /> },
    { label: 'Link', icon: LinkIcon, shortcut: 'Ctrl+K', action: () => exec('createLink') },
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
      <div className="flex flex-wrap items-center px-2 py-1 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 rounded-t-xl w-full">
      <MenuDropdown label="File" items={fileItems} />
      <MenuDropdown label="Edit" items={editItems} />
      <MenuDropdown label="View" items={viewItems} />
      <MenuDropdown label="Insert" items={insertItems} />
      <MenuDropdown label="Format" items={formatItems} />
      <MenuDropdown label="Tools" items={[{ label: 'Word count', disabled: true }, { label: 'Spelling', disabled: true }]} />
      <MenuDropdown label="Extensions" items={[{ label: 'Manage extensions', disabled: true }]} />
      <MenuDropdown label="Help" items={[{ label: 'Help', disabled: true }]} />
    </div>
    </>
  );
}
