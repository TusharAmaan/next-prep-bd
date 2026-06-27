import React, { useState, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { 
  Trash2, Baseline, PaintBucket,
  ArrowUpFromLine, ArrowDownFromLine, 
  ArrowLeftFromLine, ArrowRightFromLine,
  Trash
} from 'lucide-react';

interface TableToolbarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
}

const COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
];

export default function TableToolbar({ editorRef }: TableToolbarProps) {
  const [activeCell, setActiveCell] = useState<HTMLTableCellElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [originalBg, setOriginalBg] = useState<string | null>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      if (!editorRef.current || !editorRef.current.contains(document.activeElement)) {
        setActiveCell(null);
        return;
      }
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setActiveCell(null);
        return;
      }

      let node: Node | null = selection.anchorNode;
      let foundCell: HTMLTableCellElement | null = null;
      
      while (node && node !== editorRef.current) {
        if (node.nodeName === 'TD' || node.nodeName === 'TH') {
          foundCell = node as HTMLTableCellElement;
          break;
        }
        node = node.parentNode;
      }

      if (foundCell) {
        setActiveCell(foundCell);
        // Calculate position based on the cell's bounding rect
        const rect = foundCell.getBoundingClientRect();
        const editorRect = editorRef.current.getBoundingClientRect();
        
        // Position it floating just above the table cell
        setPosition({
          top: rect.top - editorRect.top - 45, // 45px above the cell
          left: Math.max(0, rect.left - editorRect.left)
        });
      } else {
        setActiveCell(null);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [editorRef]);

  if (!activeCell) return null;

  // --- TABLE OPERATIONS ---
  const getTableData = () => {
    if (!activeCell) return null;
    const tr = activeCell.parentElement as HTMLTableRowElement;
    const tbody = tr.parentElement as HTMLTableSectionElement;
    const table = tbody.parentElement as HTMLTableElement;
    
    const rowIndex = Array.from(tbody.children).indexOf(tr);
    const colIndex = Array.from(tr.children).indexOf(activeCell);
    
    return { table, tbody, tr, rowIndex, colIndex };
  };

  const insertRow = (above: boolean) => {
    const data = getTableData();
    if (!data) return;
    const { tbody, tr, colIndex } = data;
    const newRow = document.createElement('tr');
    
    Array.from(tr.children).forEach(() => {
      const newCell = document.createElement('td');
      newCell.style.border = '1px solid #cbd5e1';
      newCell.style.padding = '8px';
      newCell.style.minWidth = '50px';
      newCell.innerHTML = '<br>';
      newRow.appendChild(newCell);
    });

    if (above) {
      tbody.insertBefore(newRow, tr);
    } else {
      if (tr.nextSibling) {
        tbody.insertBefore(newRow, tr.nextSibling);
      } else {
        tbody.appendChild(newRow);
      }
    }
  };

  const insertCol = (left: boolean) => {
    const data = getTableData();
    if (!data) return;
    const { tbody, colIndex } = data;
    
    Array.from(tbody.children).forEach((row) => {
      const newCell = document.createElement('td');
      newCell.style.border = '1px solid #cbd5e1';
      newCell.style.padding = '8px';
      newCell.style.minWidth = '50px';
      newCell.innerHTML = '<br>';
      
      const targetCell = row.children[colIndex];
      if (left) {
        row.insertBefore(newCell, targetCell);
      } else {
        if (targetCell.nextSibling) {
          row.insertBefore(newCell, targetCell.nextSibling);
        } else {
          row.appendChild(newCell);
        }
      }
    });
  };

  const deleteRow = () => {
    const data = getTableData();
    if (!data) return;
    data.tbody.removeChild(data.tr);
    if (data.tbody.children.length === 0) {
      data.table.remove();
    }
    setActiveCell(null);
  };

  const deleteCol = () => {
    const data = getTableData();
    if (!data) return;
    const { tbody, colIndex } = data;
    
    Array.from(tbody.children).forEach((row) => {
      if (row.children[colIndex]) {
        row.removeChild(row.children[colIndex]);
      }
    });

    if (tbody.children.length > 0 && tbody.children[0].children.length === 0) {
      data.table.remove();
    }
    setActiveCell(null);
  };

  const deleteTable = () => {
    const data = getTableData();
    if (!data) return;
    data.table.remove();
    setActiveCell(null);
  };

  const setCellColor = (color: string) => {
    if (activeCell) {
      activeCell.style.backgroundColor = color;
      setOriginalBg(color);
    }
  };

  const previewCellColor = (color: string) => {
    if (activeCell) {
      if (originalBg === null) setOriginalBg(activeCell.style.backgroundColor || '');
      activeCell.style.backgroundColor = color;
    }
  };

  const revertCellColor = () => {
    if (activeCell && originalBg !== null) {
      activeCell.style.backgroundColor = originalBg;
    }
  };

  const TBtn = ({ icon: Icon, onClick, title, isDanger }: any) => (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${isDanger ? 'text-red-500 hover:text-red-600' : 'text-slate-600 dark:text-slate-300'}`}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div 
      className="absolute z-50 flex items-center gap-1 bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 rounded-lg animate-in fade-in zoom-in-95 duration-150"
      style={{ top: Math.max(10, position.top), left: Math.max(10, position.left) }}
    >
      <div className="text-[10px] uppercase font-bold text-slate-400 px-2 select-none tracking-wider flex items-center">
        Table
      </div>
      
      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>

      <TBtn icon={ArrowUpFromLine} onClick={() => insertRow(true)} title="Insert Row Above" />
      <TBtn icon={ArrowDownFromLine} onClick={() => insertRow(false)} title="Insert Row Below" />
      
      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>

      <TBtn icon={ArrowLeftFromLine} onClick={() => insertCol(true)} title="Insert Column Left" />
      <TBtn icon={ArrowRightFromLine} onClick={() => insertCol(false)} title="Insert Column Right" />

      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>

      <div className="relative group">
        <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300">
          <PaintBucket size={16} />
        </button>
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible z-[60]">
          <div className="w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-2">
            <div className="text-xs font-semibold text-slate-500 mb-2">Cell Background</div>
            <div className="grid grid-cols-10 gap-1 mb-2" onMouseLeave={revertCellColor}>
              {COLORS.map(color => (
                <button
                  key={color}
                  onMouseEnter={() => previewCellColor(color)}
                  onMouseDown={(e) => { e.preventDefault(); setCellColor(color); }}
                  className="w-4 h-4 rounded-sm border border-slate-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
              <button 
                onMouseEnter={() => previewCellColor('transparent')}
                onMouseDown={(e) => { e.preventDefault(); setCellColor('transparent'); }}
                className="col-span-10 mt-1 text-xs text-center py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600"
              >None</button>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
              <label className="flex items-center justify-between cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 p-1 rounded">
                Custom Color...
                <input 
                  type="color" 
                  className="w-6 h-6 p-0 border-0 rounded cursor-pointer" 
                  onChange={(e) => setCellColor(e.target.value)}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
      
      <div className="relative group">
        <button className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-500">
          <Trash size={16} />
        </button>
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible z-[60]">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-1 flex flex-col min-w-[120px]">
            <button onMouseDown={(e) => { e.preventDefault(); deleteRow(); }} className="px-3 py-2 text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200">Delete Row</button>
            <button onMouseDown={(e) => { e.preventDefault(); deleteCol(); }} className="px-3 py-2 text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200">Delete Column</button>
            <div className="h-px bg-slate-200 dark:bg-slate-700 my-1 mx-2" />
            <button onMouseDown={(e) => { e.preventDefault(); deleteTable(); }} className="px-3 py-2 text-sm text-left font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">Delete Table</button>
          </div>
        </div>
      </div>
      
    </div>
  );
}
