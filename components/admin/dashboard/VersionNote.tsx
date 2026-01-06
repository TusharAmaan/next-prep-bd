import { useState } from "react";
import { Edit2, Save, X } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react"; // Using your requested TinyMCE
import { supabase } from "@/lib/supabaseClient";

export default function VersionNote({ latestUpdate, onUpdate }: { latestUpdate: any, onUpdate: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(latestUpdate?.content || "");
  const [version, setVersion] = useState(latestUpdate?.version_number || "v1.0.0");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Upsert logic logic or Insert new logic based on your preference. 
    // Here we insert a NEW record for every update to keep history.
    const { error } = await supabase.from("system_updates").insert({
        version_number: version,
        title: "System Update",
        content: content,
        is_published: true
    });
    
    if (!error) {
        setIsEditing(false);
        onUpdate(); // Refresh parent
    }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
            <h3 className="font-bold text-slate-800">System Updates</h3>
            {!isEditing && <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{version}</span>}
        </div>
        {isEditing ? (
            <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="p-2 text-slate-400 hover:text-red-500"><X className="w-4 h-4"/></button>
                <button onClick={handleSave} disabled={saving} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center gap-1 font-bold text-xs">
                    <Save className="w-4 h-4"/> {saving ? '...' : 'Save'}
                </button>
            </div>
        ) : (
            <button onClick={() => setIsEditing(true)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                <Edit2 className="w-4 h-4" />
            </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[200px]">
        {isEditing ? (
            <div className="space-y-3">
                <input 
                    type="text" 
                    value={version} 
                    onChange={(e)=>setVersion(e.target.value)} 
                    className="w-full text-sm font-bold border rounded p-2" 
                    placeholder="v1.x.x"
                />
                <Editor
                    apiKey="koqq37jhe68hq8n77emqg0hbl97ivgtwz2fvvvnvtwapuur1" // Make sure to use env variable in real app
                    value={content}
                    onEditorChange={(newContent) => setContent(newContent)}
                    init={{
                        height: 200,
                        menubar: false,
                        plugins: 'lists link',
                        toolbar: 'bold italic bullist numlist link',
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                    }}
                />
            </div>
        ) : (
            <div className="prose prose-sm max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: latestUpdate?.content || "<p>No updates yet.</p>" }}></div>
        )}
      </div>
    </div>
  );
}