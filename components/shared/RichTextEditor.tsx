"use client";

import NextPrepEditor from "@/components/editor/NextPrepEditor";

interface RichTextEditorProps {
  initialValue?: string;
  onChange: (content: string) => void;
  darkMode?: boolean;
}

export default function RichTextEditor({ initialValue = '', onChange, darkMode = false }: RichTextEditorProps) {
  return (
    <NextPrepEditor 
      initialValue={initialValue} 
      onChange={onChange} 
      darkMode={darkMode} 
    />
  );
}