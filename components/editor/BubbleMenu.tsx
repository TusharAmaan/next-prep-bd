"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Bold, Italic, Underline, Heading2, Quote, Sigma } from 'lucide-react';

interface BubbleMenuProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  onInsertMath: () => void;
}

export default function BubbleMenu({ editorRef, onInsertMath }: BubbleMenuProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      
      if (!selection || selection.isCollapsed || !editorRef.current) {
        setPosition(null);
        return;
      }

      // Check if selection is inside the editor
      if (!editorRef.current.contains(selection.anchorNode)) {
        setPosition(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Position above the selection
      setPosition({
        top: rect.top - 50 + window.scrollY, // 50px offset above
        left: rect.left + (rect.width / 2) + window.scrollX, // Center horizontally
      });
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    // Also listen to mouseup and keyup to catch selection updates reliably
    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('keyup', handleSelectionChange);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleSelectionChange);
      document.removeEventListener('keyup', handleSelectionChange);
    };
  }, [editorRef]);

  const exec = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  if (!position) return null;

  return (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)',
        zIndex: 50
      }}
      className="bg-slate-900 dark:bg-slate-800 text-white shadow-xl rounded-lg px-1 py-1 flex items-center gap-1 border border-slate-700/50"
      onMouseDown={(e) => e.preventDefault()} // Prevent losing focus when clicking buttons
    >
      <MenuButton onClick={() => exec('bold')} icon={<Bold size={16} />} tooltip="Bold" />
      <MenuButton onClick={() => exec('italic')} icon={<Italic size={16} />} tooltip="Italic" />
      <MenuButton onClick={() => exec('underline')} icon={<Underline size={16} />} tooltip="Underline" />
      
      <div className="w-px h-5 bg-slate-700 mx-1" />
      
      <MenuButton onClick={() => exec('formatBlock', 'H2')} icon={<Heading2 size={16} />} tooltip="Heading 2" />
      <MenuButton onClick={() => exec('formatBlock', 'BLOCKQUOTE')} icon={<Quote size={16} />} tooltip="Quote" />
      
      <div className="w-px h-5 bg-slate-700 mx-1" />
      
      <MenuButton 
        onClick={() => {
          onInsertMath();
          setPosition(null); // Hide menu after inserting
        }} 
        icon={<Sigma size={16} />} 
        tooltip="Insert Math" 
      />
    </div>
  );
}

function MenuButton({ onClick, icon, tooltip }: { onClick: () => void, icon: React.ReactNode, tooltip: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={tooltip}
      className="p-2 hover:bg-slate-700 dark:hover:bg-slate-700 rounded-md transition-colors flex items-center justify-center text-slate-300 hover:text-white"
    >
      {icon}
    </button>
  );
}
