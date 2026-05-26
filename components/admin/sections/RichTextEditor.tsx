"use client";

import { Editor } from "@tinymce/tinymce-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  darkMode?: boolean;
}

export default function RichTextEditor({ content, onChange, darkMode = false }: RichTextEditorProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-300 dark:border-slate-600 shadow-sm">
      <Editor
        apiKey="koqq37jhe68hq8n77emqg0hbl97ivgtwz2fvvvnvtwapuur1" // Get a free key at tiny.cloud to remove the warning, or leave empty for dev
        value={content}
        onEditorChange={(newValue) => {
          onChange(newValue);
        }}
        init={{
          height: 400,
          menubar: true, // Shows File, Edit, View, Insert...
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'codesample'
          ],
          toolbar: 'undo redo | blocks fontfamily fontsize | ' +
            'bold italic underline strikethrough | forecolor backcolor | align | ' +
            'bullist numlist outdent indent | ' +
            'link image media table | insertMath insertBlockMath | codesample | removeformat | fullscreen preview | help',
          skin: darkMode ? "oxide-dark" : "oxide",
          content_css: darkMode ? "dark" : "default",
          content_style: `
            @import url('https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css');
            body { 
              font-family: Helvetica, Arial, sans-serif; 
              font-size: 15px; 
              color: ${darkMode ? '#f1f5f9' : '#334155'}; 
              background: ${darkMode ? '#0f172a' : '#ffffff'}; 
              line-height: 1.6;
              padding: 1.5rem;
            }
            .math-tex {
              display: inline-block;
              background-color: ${darkMode ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.05)'};
              padding: 2px 6px;
              border-radius: 4px;
              border: 1px dashed #6366f1;
            }
          `,
          branding: false, // Hides the "Powered by TinyMCE"
          resize: true, // Enables the resize handle
          statusbar: true, // Shows the word count and path at bottom
          setup: (editor: any) => {
            // Register Math insertion helpers
            editor.ui.registry.addButton('insertMath', { 
              text: 'Σ Inline', 
              tooltip: 'Insert Inline Math (e.g. $H_0$)', 
              onAction: () => editor.insertContent(' $H_0$ ') 
            });
            editor.ui.registry.addButton('insertBlockMath', { 
              text: 'Σ Block', 
              tooltip: 'Insert Centered Equation', 
              onAction: () => editor.insertContent(' $$\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$$ ') 
            });

            editor.on('init', () => {
              const doc = editor.getDoc();
              if (!doc) return;
              const head = doc.head;
              
              // 1. Add core KaTeX script
              const katexScript = doc.createElement('script');
              katexScript.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js';
              
              katexScript.onload = () => {
                // 2. Add auto-render extension
                const autoRenderScript = doc.createElement('script');
                autoRenderScript.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js';
                
                autoRenderScript.onload = () => {
                  const renderMath = () => {
                    const body = editor.getBody();
                    const win = editor.getWin();
                    if (body && win.renderMathInElement) {
                      win.renderMathInElement(body, {
                        delimiters: [
                          { left: "$$", right: "$$", display: true },
                          { left: "$", right: "$", display: false },
                          { left: "\\(", right: "\\)", display: false },
                          { left: "\\[", right: "\\]", display: true }
                        ],
                        throwOnError: false
                      });
                    }
                  };

                  // Run initial render and subscribe to editor changes
                  setTimeout(renderMath, 100);
                  editor.on('change keyup undo redo', renderMath);
                };
                
                head.appendChild(autoRenderScript);
              };
              
              head.appendChild(katexScript);
            });
          }
        }}
      />
    </div>
  );
}