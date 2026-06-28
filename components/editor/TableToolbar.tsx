import React, { useState, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { 
  Trash2, Baseline, PaintBucket,
  ArrowUpFromLine, ArrowDownFromLine, 
  ArrowLeftFromLine, ArrowRightFromLine,
  Trash, Settings, ChevronDown
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

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!document.body.contains(target)) return;
      if (!target.closest('.table-toolbar-dropdown')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Click outside table / toolbar detector to close active cell selection
  useEffect(() => {
    const handleClickOutsideTable = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!document.body.contains(target)) return;
      
      if (target.closest('.nextprep-table') || target.closest('.table-toolbar-container')) {
        return;
      }
      setActiveCell(null);
    };
    document.addEventListener('mousedown', handleClickOutsideTable);
    return () => document.removeEventListener('mousedown', handleClickOutsideTable);
  }, []);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(prev => prev === name ? null : name);
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      if (!editorRef.current) return;
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
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
        const rect = foundCell.getBoundingClientRect();
        const editorRect = editorRef.current.getBoundingClientRect();
        
        setPosition({
          top: rect.top - editorRect.top - 45,
          left: Math.max(0, rect.left - editorRect.left)
        });
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [editorRef]);

  if (!activeCell) return null;

  // --- TABLE OPERATIONS ---
  const triggerChange = () => {
    const event = new Event('input', { bubbles: true });
    editorRef.current?.dispatchEvent(event);
  };

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
    triggerChange();
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
    triggerChange();
  };

  const deleteRow = () => {
    const data = getTableData();
    if (!data) return;
    data.tbody.removeChild(data.tr);
    if (data.tbody.children.length === 0) {
      data.table.remove();
    }
    setActiveCell(null);
    triggerChange();
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
    triggerChange();
  };

  const deleteTable = () => {
    const data = getTableData();
    if (!data) return;
    data.table.remove();
    setActiveCell(null);
    triggerChange();
  };

  const setCellColor = (color: string) => {
    if (activeCell) {
      activeCell.style.backgroundColor = color;
      setOriginalBg(color);
      triggerChange();
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

  const getSelectedCells = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    
    let anchorCell: HTMLTableCellElement | null = null;
    let node: Node | null = sel.anchorNode;
    while (node) {
      if (node.nodeName === 'TD' || node.nodeName === 'TH') {
        anchorCell = node as HTMLTableCellElement;
        break;
      }
      node = node.parentNode;
    }
    
    let focusCell: HTMLTableCellElement | null = null;
    node = sel.focusNode;
    while (node) {
      if (node.nodeName === 'TD' || node.nodeName === 'TH') {
        focusCell = node as HTMLTableCellElement;
        break;
      }
      node = node.parentNode;
    }
    
    if (!anchorCell || !focusCell) return null;
    if (anchorCell.closest('table') !== focusCell.closest('table')) return null;
    
    const table = anchorCell.closest('table') as HTMLTableElement;
    const rows = Array.from(table.querySelectorAll('tr'));
    
    const getCellCoords = (cell: HTMLTableCellElement) => {
      const tr = cell.parentNode as HTMLTableRowElement;
      const rIdx = rows.indexOf(tr);
      const cIdx = Array.from(tr.children).indexOf(cell);
      return { r: rIdx, c: cIdx };
    };
    
    const startCoords = getCellCoords(anchorCell);
    const endCoords = getCellCoords(focusCell);
    
    const rStart = Math.min(startCoords.r, endCoords.r);
    const rEnd = Math.max(startCoords.r, endCoords.r);
    const cStart = Math.min(startCoords.c, endCoords.c);
    const cEnd = Math.max(startCoords.c, endCoords.c);
    
    const cellsToMerge: HTMLTableCellElement[] = [];
    for (let r = rStart; r <= rEnd; r++) {
      const tr = rows[r];
      if (!tr) continue;
      for (let c = cStart; c <= cEnd; c++) {
        const cell = tr.children[c] as HTMLTableCellElement;
        if (cell) {
          cellsToMerge.push(cell);
        }
      }
    }
    
    return {
      table,
      cells: cellsToMerge,
      rStart,
      rEnd,
      cStart,
      cEnd,
      anchorCell
    };
  };

  const mergeCells = () => {
    const selected = getSelectedCells();
    if (!selected || selected.cells.length <= 1) {
      const data = getTableData();
      if (!data) return;
      const { tr, colIndex } = data;
      const currentCell = activeCell;
      const nextCell = tr.children[colIndex + 1] as HTMLTableCellElement;
      if (currentCell && nextCell) {
        const currentColspan = parseInt(currentCell.getAttribute('colspan') || '1');
        const nextColspan = parseInt(nextCell.getAttribute('colspan') || '1');
        
        currentCell.setAttribute('colspan', (currentColspan + nextColspan).toString());
        currentCell.innerHTML = currentCell.innerHTML + nextCell.innerHTML;
        nextCell.remove();
        triggerChange();
      }
      return;
    }
    
    const { cells, rStart, rEnd, cStart, cEnd } = selected;
    const targetCell = cells[0];
    if (!targetCell) return;
    
    let mergedHTML = '';
    cells.forEach((cell, idx) => {
      if (cell.innerHTML && cell.innerHTML !== '<br>') {
        mergedHTML += (idx === 0 ? '' : ' ') + cell.innerHTML;
      }
    });
    
    targetCell.innerHTML = mergedHTML || '<br>';
    
    const totalCols = cEnd - cStart + 1;
    const totalRows = rEnd - rStart + 1;
    
    if (totalCols > 1) {
      targetCell.setAttribute('colspan', totalCols.toString());
    } else {
      targetCell.removeAttribute('colspan');
    }
    
    if (totalRows > 1) {
      targetCell.setAttribute('rowspan', totalRows.toString());
    } else {
      targetCell.removeAttribute('rowspan');
    }
    
    cells.forEach((cell, idx) => {
      if (idx > 0) {
        cell.remove();
      }
    });
    
    triggerChange();
  };

  const splitCell = () => {
    const cell = activeCell;
    if (!cell) return;
    
    const colspan = parseInt(cell.getAttribute('colspan') || '1');
    const rowspan = parseInt(cell.getAttribute('rowspan') || '1');
    
    if (colspan === 1 && rowspan === 1) return;
    
    cell.removeAttribute('colspan');
    cell.removeAttribute('rowspan');
    
    const tr = cell.parentNode as HTMLTableRowElement;
    const table = tr.closest('table') as HTMLTableElement;
    const rows = Array.from(table.querySelectorAll('tr'));
    const startRowIdx = rows.indexOf(tr);
    const startCellIdx = Array.from(tr.children).indexOf(cell);
    
    for (let c = 1; c < colspan; c++) {
      const newCell = document.createElement('td');
      newCell.style.border = '1px solid #cbd5e1';
      newCell.style.padding = '8px';
      newCell.style.minWidth = '50px';
      newCell.innerHTML = '<br>';
      tr.insertBefore(newCell, tr.children[startCellIdx + c] || null);
    }
    
    for (let r = 1; r < rowspan; r++) {
      const targetRow = rows[startRowIdx + r];
      if (targetRow) {
        for (let c = 0; c < colspan; c++) {
          const newCell = document.createElement('td');
          newCell.style.border = '1px solid #cbd5e1';
          newCell.style.padding = '8px';
          newCell.style.minWidth = '50px';
          newCell.innerHTML = '<br>';
          targetRow.insertBefore(newCell, targetRow.children[startCellIdx] || null);
        }
      }
    }
    
    triggerChange();
  };

  const setTableBorderWidth = (width: number) => {
    const data = getTableData();
    if (!data) return;
    const { table } = data;
    const cells = table.querySelectorAll('td, th');
    cells.forEach(c => {
      if (c instanceof HTMLElement) {
        c.style.borderWidth = `${width}px`;
        if (width === 0) {
          c.style.borderStyle = 'none';
        } else {
          c.style.borderStyle = 'solid';
        }
      }
    });
    triggerChange();
  };

  const setCellPadding = (padding: string) => {
    const data = getTableData();
    if (!data) return;
    const { table } = data;
    const cells = table.querySelectorAll('td, th');
    cells.forEach(c => {
      if (c instanceof HTMLElement) {
        c.style.padding = padding;
      }
    });
    triggerChange();
  };

  const TBtn = ({ icon: Icon, onClick, title, isDanger }: any) => (
    <button
      onMouseDown={(e) => { 
        e.preventDefault(); 
        e.stopPropagation(); 
        e.nativeEvent.stopPropagation(); 
        onClick(); 
      }}
      title={title}
      className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${isDanger ? 'text-red-500 hover:text-red-600' : 'text-slate-600 dark:text-slate-300'}`}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div 
      className="absolute z-50 flex items-center gap-1 bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 rounded-lg animate-in fade-in zoom-in-95 duration-150 table-toolbar-container"
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

      <div className="relative table-toolbar-dropdown">
        <button 
          onMouseDown={(e) => { e.preventDefault(); toggleDropdown('bg'); }}
          className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300
            ${activeDropdown === 'bg' ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
        >
          <PaintBucket size={16} />
        </button>
        {activeDropdown === 'bg' && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1 z-[60]">
            <div className="w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-2 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="text-xs font-semibold text-slate-500 mb-2">Cell Background</div>
              <div className="grid grid-cols-10 gap-1 mb-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onMouseDown={(e) => { e.preventDefault(); setCellColor(color); setActiveDropdown(null); }}
                    className="w-4 h-4 rounded-sm border border-slate-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
                <button 
                  onMouseDown={(e) => { e.preventDefault(); setCellColor('transparent'); setActiveDropdown(null); }}
                  className="col-span-10 mt-1 text-xs text-center py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600"
                >None</button>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                <label className="flex items-center justify-between cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 p-1 rounded">
                  Custom Color...
                  <input 
                    type="color" 
                    className="w-6 h-6 p-0 border-0 rounded cursor-pointer" 
                    onChange={(e) => { setCellColor(e.target.value); setActiveDropdown(null); }}
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>

      {/* Advanced Table Options */}
      <div className="relative table-toolbar-dropdown">
        <button 
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); toggleDropdown('options'); }}
          className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 flex items-center gap-1
            ${activeDropdown === 'options' ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
          title="Table Formatting Options"
        >
          <Settings size={16} />
          <ChevronDown size={12} className="opacity-50" />
        </button>
        {activeDropdown === 'options' && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1 z-[60]">
            <div className="w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-2 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150 text-xs">
              <button 
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); mergeCells(); setActiveDropdown(null); }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200 font-medium"
              >
                Merge Cells
              </button>
              <button 
                onMouseDown={(e) => { 
                  const colspan = parseInt(activeCell?.getAttribute('colspan') || '1');
                  const rowspan = parseInt(activeCell?.getAttribute('rowspan') || '1');
                  if (colspan > 1 || rowspan > 1) {
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    splitCell(); 
                    setActiveDropdown(null); 
                  }
                }}
                disabled={!activeCell || (parseInt(activeCell.getAttribute('colspan') || '1') === 1 && parseInt(activeCell.getAttribute('rowspan') || '1') === 1)}
                className={`w-full text-left px-2.5 py-1.5 rounded font-medium transition-colors
                  ${(!activeCell || (parseInt(activeCell.getAttribute('colspan') || '1') === 1 && parseInt(activeCell.getAttribute('rowspan') || '1') === 1))
                    ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'}`}
              >
                Split Cell
              </button>
              
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-0.5" />
              
              <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Border Width
              </div>
              <div className="grid grid-cols-4 gap-1 px-1.5">
                {[0, 1, 2, 3].map(w => (
                  <button
                    key={w}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setTableBorderWidth(w); setActiveDropdown(null); }}
                    className="py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded text-center font-semibold"
                  >
                    {w === 0 ? 'None' : `${w}px`}
                  </button>
                ))}
              </div>

              <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Cell Padding
              </div>
              <div className="grid grid-cols-3 gap-1 px-1.5">
                {[
                  { label: 'Small', v: '4px' },
                  { label: 'Med', v: '8px' },
                  { label: 'Large', v: '14px' }
                ].map(p => (
                  <button
                    key={p.label}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setCellPadding(p.v); setActiveDropdown(null); }}
                    className="py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded text-center font-semibold"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
      
      <div className="relative table-toolbar-dropdown">
        <button 
          onMouseDown={(e) => { e.preventDefault(); toggleDropdown('delete'); }}
          className={`p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-500
            ${activeDropdown === 'delete' ? 'bg-red-100 dark:bg-red-900/30' : ''}`}
        >
          <Trash size={16} />
        </button>
        {activeDropdown === 'delete' && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1 z-[60]">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-1 flex flex-col min-w-[120px] animate-in fade-in slide-in-from-top-1 duration-150">
              <button onMouseDown={(e) => { e.preventDefault(); deleteRow(); setActiveDropdown(null); }} className="px-3 py-2 text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200">Delete Row</button>
              <button onMouseDown={(e) => { e.preventDefault(); deleteCol(); setActiveDropdown(null); }} className="px-3 py-2 text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200">Delete Column</button>
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-1 mx-2" />
              <button onMouseDown={(e) => { e.preventDefault(); deleteTable(); setActiveDropdown(null); }} className="px-3 py-2 text-sm text-left font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">Delete Table</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
