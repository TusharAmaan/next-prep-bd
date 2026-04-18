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
          toolbar: 'undo redo | blocks fontfamily fontsize | ' +
            'bold italic underline strikethrough | forecolor backcolor | align | ' +
            'bullist numlist outdent indent | ' +
            'link image media table | math | codesample | removeformat | fullscreen preview | help',
          font_family_formats: 'Geist Sans=var(--font-geist-sans); Bengali=var(--font-bangla); Arial=arial,helvetica,sans-serif; Courier New=courier new,courier,monospace; Georgia=georgia,palatino; Tahoma=tahoma,arial,helvetica,sans-serif; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Noto Serif Bengali=notoserifbangla,serif',
          font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 20pt 24pt 30pt 36pt 48pt 60pt 72pt',
          skin: darkMode ? "oxide-dark" : "oxide",
          content_css: darkMode ? "dark" : "default",
          content_style: `
            @import url('https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css');
            :root {
                --font-geist-sans: "Inter", sans-serif;
                --font-bangla: "Noto Serif Bengali", serif;
            }
            body { 
              font-family: var(--font-geist-sans), sans-serif; 
              font-size: 16px; 
              color: ${darkMode ? '#f1f5f9' : '#334155'}; 
              background: ${darkMode ? '#0f172a' : '#ffffff'}; 
              line-height: 1.6;
              padding: 2rem;
              max-width: 900px;
              margin: 0 auto;
            }
            h1, h2, h3, h4, h5, h6 { color: ${darkMode ? '#ffffff' : '#0f172a'}; font-weight: 800; }
            .font-bangla { font-family: var(--font-bangla) !important; }
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