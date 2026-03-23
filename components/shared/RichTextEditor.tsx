"use client";

import { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

interface RichTextEditorProps {
  initialValue?: string;
  onChange: (content: string) => void;
  darkMode?: boolean;
}

export default function RichTextEditor({ initialValue, onChange, darkMode = false }: RichTextEditorProps) {
  // Use a ref to store the initial value so it doesn't trigger re-renders if the prop changes
  const initialRef = useRef(initialValue);

  return (
    <div className="rounded-xl overflow-hidden border border-slate-300 dark:border-slate-600 shadow-sm">
      <Editor
        apiKey="koqq37jhe68hq8n77emqg0hbl97ivgtwz2fvvvnvtwapuur1"
        initialValue={initialRef.current || ""}
        onEditorChange={(newValue) => {
          onChange(newValue);
        }}
        
        init={{
          height: 400, // Fixed height is better for UI consistency
          menubar: true, // Show menubar for advanced features like table, insert, etc.
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'codesample', 'math'
          ],
          toolbar: 'undo redo | formatselect | ' +
            'bold italic underline strikethrough | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'link image media table math | removeformat | codesample code fullscreen preview | help',
          skin: darkMode ? "oxide-dark" : "oxide",
          content_css: darkMode ? "dark" : "default",
          content_style: `
            @import url('https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css');
            body { 
              font-family:Inter,sans-serif; 
              font-size:16px; 
              color: ${darkMode ? '#f1f5f9' : '#334155'}; 
              background: ${darkMode ? '#0f172a' : '#ffffff'}; 
            }
          `,
          branding: false,
          statusbar: true,
          convert_urls: false,
          relative_urls: false,
          remove_script_host: false,
          link_assume_external_targets: true,
          link_context_toolbar: true,
          target_list: [
            { title: 'New window', value: '_blank' },
            { title: 'Same window', value: '_self' }
          ],
          default_link_target: '_blank',
          setup: (editor: any) => {
            editor.on('init', () => {
              const doc = editor.getDoc();
              const head = doc.head;
              
              // 1. Add KaTeX Script to Iframe
              const script = doc.createElement('script');
              script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js';
              script.onload = () => {
                const renderMath = () => {
                  const body = editor.getBody();
                  const win = editor.getWin();
                  if (body && win.renderMathInElement) {
                    win.renderMathInElement(body, {
                      delimiters: [
                        { left: "$$", right: "$$", display: true },
                        { left: "$", right: "$", display: false },
                        { left: "\\(", right: "\\)", display: false },
                        { left: "\\[", right: "\\]", display: true },
                      ],
                      throwOnError: false,
                    });
                  }
                };

                // Initial render + on change
                setTimeout(renderMath, 100);
                editor.on('change keyup undo redo', renderMath);
              };
              head.appendChild(script);
            });

            editor.ui.registry.addButton('insertMath', { 
              text: 'Σ Inline', 
              tooltip: 'Insert Inline Math', 
              onAction: () => editor.insertContent('<span class="math-tex">\\( x^2 \\)</span>&nbsp;') 
            });
            editor.ui.registry.addButton('insertBlockMath', { 
              text: 'Σ Block', 
              tooltip: 'Insert Centered Equation', 
              onAction: () => editor.insertContent('<span class="math-tex">$$ E = mc^2 $$</span>&nbsp;') 
            });
          },
        }}
      />
    </div>
  );
}