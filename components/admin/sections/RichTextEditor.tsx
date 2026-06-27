"use client";

import NextPrepEditor from "@/components/editor/NextPrepEditor";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  darkMode?: boolean;
}

export default function RichTextEditor({ content, onChange, darkMode = false }: RichTextEditorProps) {
  return (
    <NextPrepEditor 
      initialValue={content} 
      onChange={onChange} 
      darkMode={darkMode} 
    />
  );
}