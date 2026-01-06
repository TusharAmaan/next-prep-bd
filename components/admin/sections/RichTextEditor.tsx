"use client";

import { Editor } from "@tinymce/tinymce-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-300 shadow-sm">
      <Editor
        apiKey="koqq37jhe68hq8n77emqg0hbl97ivgtwz2fvvvnvtwapuur1" // Get a free key at tiny.cloud to remove the warning, or leave empty for dev
        value={content}
        onEditorChange={(newValue, editor) => {
          onChange(newValue);
        }}
        init={{
          height: 500,
          menubar: true, // Shows File, Edit, View, Insert...
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks fontfamily fontsize | ' +
            'bold italic underline strikethrough | link image media table mergetags | ' +
            'alignline alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent | ' +
            'removeformat | forecolor backcolor | code', 
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; background-color: #ffffff; }',
          branding: false, // Hides the "Powered by TinyMCE"
          resize: false, // Disables the resize handle (height is fixed)
          statusbar: true, // Shows the word count and path at bottom
        }}
      />
    </div>
  );
}