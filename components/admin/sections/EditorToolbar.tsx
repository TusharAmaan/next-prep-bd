import { type Editor } from '@tiptap/react';
import { 
  Bold, Italic, Strikethrough, Code, List, ListOrdered, 
  Quote, Redo, Undo, Link as LinkIcon, Image as ImageIcon 
} from 'lucide-react';

interface Props {
  editor: Editor | null;
}

const ToolbarButton = ({ 
  onClick, 
  isActive = false, 
  children 
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  children: React.ReactNode 
}) => (
  <button
    onClick={(e) => { e.preventDefault(); onClick(); }}
    className={`p-2 rounded-lg transition-colors ${
      isActive 
        ? 'bg-blue-100 text-blue-600' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    {children}
  </button>
);

export function EditorToolbar({ editor }: Props) {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    
    // cancelled
    if (url === null) return;
    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    // update
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="border-b border-slate-200 p-2 flex flex-wrap gap-1 bg-white sticky top-0 z-10">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
      >
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-slate-200 mx-1 self-center" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
      >
        <span className="font-bold text-xs">H2</span>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
      >
        <span className="font-bold text-xs">H3</span>
      </ToolbarButton>

      <div className="w-px h-6 bg-slate-200 mx-1 self-center" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
      >
        <List className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-slate-200 mx-1 self-center" />

      <ToolbarButton onClick={setLink} isActive={editor.isActive('link')}>
        <LinkIcon className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton onClick={addImage}>
        <ImageIcon className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
      >
        <Quote className="w-4 h-4" />
      </ToolbarButton>
    </div>
  );
}