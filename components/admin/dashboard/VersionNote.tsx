"use client";
import { useState, useEffect } from "react";
import { Edit2, Save, X, Check } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react"; 
import { supabase } from "@/lib/supabaseClient";

export default function VersionNote({ latestUpdate, onUpdate }: { latestUpdate: any, onUpdate: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState("");
  const [version, setVersion] = useState("");
  const [saving, setSaving] = useState(false);

  // Sync state when props change
  useEffect(() => {
    if (latestUpdate) {
        setVersion(latestUpdate.version_number);
        setContent(latestUpdate.content);
    }
  }, [latestUpdate]);

  const handleSave = async () => {
    if (!version || !content) return; // Prevent empty saves
    setSaving(true);
    
    // Always insert a new row to keep history (Log style)
    const { error } = await supabase.from("system_updates").insert({
        version_number: version,
        title: "System Update", // You can make this dynamic if needed
        content: content,
        is_published: true
    });
    
    if (error) {
        console.error("Failed to save update:", error);
        alert("Error saving update. Check console.");
    } else {
        setIsEditing(false);
        onUpdate(); // Trigger parent refresh
    }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-full flex flex-col relative group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <div>
            <h3 className="font-bold text-slate-800">System Updates</h3>
            {!isEditing && (
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block">
                    {latestUpdate ? latestUpdate.version_number : 'v0.0.1'}
                </span>
            )}
        </div>
        {isEditing ? (
            <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 rounded-lg"><X className="w-4 h-4"/></button>
                <button onClick={handleSave} disabled={saving} className="p-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg flex items-center gap-1 font-bold text-xs shadow-lg shadow-indigo-200">
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Save className="w-4 h-4"/> Save</>}
                </button>
            </div>
        ) : (
            <button onClick={() => setIsEditing(true)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                <Edit2 className="w-4 h-4" />
            </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[150px]">
        {isEditing ? (
            <div className="space-y-3 animate-in fade-in">
                <input 
                    type="text" 
                    value={version} 
                    onChange={(e)=>setVersion(e.target.value)} 
                    className="w-full text-sm font-bold border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="Version (e.g., v2.1.0)"
                />
                <Editor
                    apiKey="YOUR_TINYMCE_API_KEY_HERE" // <--- REMEMBER TO ADD YOUR KEY
                    value={content}
                    onEditorChange={(newContent) => setContent(newContent)}
                    init={{
                        height: 180,
                        menubar: false,
                        statusbar: false,
                        plugins: 'lists link',
                        toolbar: 'bold italic underline bullist numlist',
                        content_style: 'body { font-family:Inter,sans-serif; font-size:14px }'
                    }}
                />
            </div>
        ) : (
            <div className="prose prose-sm max-w-none text-slate-600">
                {latestUpdate ? (
                    <div dangerouslySetInnerHTML={{ __html: latestUpdate.content }}></div>
                ) : (
                    <div className="text-slate-400 italic text-sm py-4 flex flex-col items-center">
                        <span>No updates logged yet.</span>
                        <span className="text-xs">Click the pencil to add one.</span>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}