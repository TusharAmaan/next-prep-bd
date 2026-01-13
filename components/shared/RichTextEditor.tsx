"use client";

import { Editor } from "@tinymce/tinymce-react";

interface RichTextEditorProps {
  initialValue?: string; // Changed from 'content' to match your parent component
  onChange: (content: string) => void;
}

export default function RichTextEditor({ initialValue, onChange }: RichTextEditorProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-300 shadow-sm">
      <Editor
        apiKey="koqq37jhe68hq8n77emqg0hbl97ivgtwz2fvvvnvtwapuur1"
        
        // FIX: Use 'initialValue' instead of 'value'. 
        // This makes it Uncontrolled (better for performance & prevents cursor jumping)
        initialValue={initialValue || ""}
        
        onEditorChange={(newValue, editor) => {
          onChange(newValue);
        }}
        
        init={{
          height: 400, // Fixed height is better for UI consistency
          menubar: false, // Cleaner look for tutors
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic underline | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'link image | removeformat | code',
          content_style: 'body { font-family:Inter,sans-serif; font-size:16px; color: #334155; }',
          branding: false,
          statusbar: true,
        }}
      />
    </div>
  );
}