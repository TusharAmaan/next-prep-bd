"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorToolbar } from './EditorToolbar'; // Ensure this file exists from previous step

interface RichTextEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ initialContent, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: true, allowBase64: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-500 hover:underline cursor-pointer' },
      }),
      Placeholder.configure({ placeholder: 'Write something amazing...' }),
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-y-auto cursor-text bg-slate-50/30">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}