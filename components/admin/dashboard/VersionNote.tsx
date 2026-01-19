"use client";
import { useState, useEffect } from "react";
import { Edit2, Save, X, Plus, Clock, Trash2, ChevronRight } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react"; 
import { supabase } from "@/lib/supabaseClient";

export default function VersionNote({ latestUpdate, onUpdate }: { latestUpdate: any, onUpdate: () => void }) {
  // --- STATE ---
  const [mode, setMode] = useState<'view' | 'create'>('view');
  const [history, setHistory] = useState<any[]>([]);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  
  // Form State
  const [version, setVersion] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  // --- FETCH HISTORY ---
  useEffect(() => {
    fetchHistory();
  }, [latestUpdate]);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from("system_updates")
      .select("*")
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
        setHistory(data);
        // Default to showing the latest one if in view mode
        if (mode === 'view' && data.length > 0 && !selectedUpdate) {
            setSelectedUpdate(data[0]);
        }
    }
  };

  // --- ACTIONS ---
  const handleSave = async () => {
    if (!version || !content) return alert("Please fill in version and content");
    setSaving(true);
    
    const { error } = await supabase.from("system_updates").insert({
        version_number: version,
        title: "System Update",
        content: content,
        is_published: true
    });
    
    if (error) {
        console.error("Failed to save:", error);
        alert(`Error: ${error.message}`);
    } else {
        // Success
        await fetchHistory();
        onUpdate(); // Refresh parent dashboard
        setMode('view');
        setVersion("");
        setContent("");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
      if(!confirm("Delete this update log?")) return;
      const { error } = await supabase.from("system_updates").delete().eq('id', id);
      if(!error) {
          fetchHistory();
          onUpdate();
      }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
      
      {/* HEADER */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
            System Updates
            <span className="text-xs font-normal text-slate-400 bg-white border px-2 py-0.5 rounded-full">v{history[0]?.version_number || '0.0'}</span>
        </h3>
        {mode === 'view' ? (
            <button 
                onClick={() => { setMode('create'); setVersion(''); setContent(''); }} 
                className="text-xs font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-indigo-600 transition-colors"
            >
                <Plus size={14}/> New Version
            </button>
        ) : (
            <button onClick={() => setMode('view')} className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5">Cancel</button>
        )}
      </div>

      <div className="flex flex-1 h-[320px]"> {/* Fixed height for consistency */}
        
        {/* LEFT: LIST (History) */}
        <div className="w-1/3 border-r border-slate-100 overflow-y-auto custom-scrollbar bg-slate-50/30">
            {history.map((item) => (
                <button 
                    key={item.id}
                    onClick={() => { setMode('view'); setSelectedUpdate(item); }}
                    className={`w-full text-left p-3 border-b border-slate-100 text-sm hover:bg-slate-50 transition-colors relative group ${selectedUpdate?.id === item.id && mode === 'view' ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}`}
                >
                    <div className="flex justify-between items-center mb-1">
                        <span className={`font-bold ${selectedUpdate?.id === item.id ? 'text-indigo-700' : 'text-slate-700'}`}>{item.version_number}</span>
                        <span className="text-[10px] text-slate-400">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs text-slate-500 line-clamp-1 h-4 overflow-hidden" dangerouslySetInnerHTML={{__html: item.content?.replace(/<[^>]+>/g, '') || 'No details'}}></div>
                    
                    {/* Delete Action (Hover only) */}
                    <div 
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1 bg-white shadow-sm rounded text-red-500 hover:bg-red-50 cursor-pointer"
                    >
                        <Trash2 size={12}/>
                    </div>
                </button>
            ))}
            {history.length === 0 && <div className="p-4 text-center text-xs text-slate-400">No updates yet.</div>}
        </div>

        {/* RIGHT: CONTENT (View or Edit) */}
        <div className="w-2/3 flex flex-col relative">
            
            {mode === 'create' ? (
                // --- CREATE MODE ---
                <div className="p-4 space-y-4 animate-in fade-in h-full flex flex-col">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Version Number</label>
                        <input 
                            value={version} 
                            onChange={e => setVersion(e.target.value)} 
                            className="w-full border border-slate-200 rounded-lg p-2 text-sm font-bold focus:ring-2 focus:ring-indigo-100 outline-none"
                            placeholder="e.g. v2.4.0"
                        />
                    </div>
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Release Notes</label>
                        <Editor
                            apiKey="koqq37jhe68hq8n77emqg0hbl97ivgtwz2fvvvnvtwapuur1" 
                            value={content}
                            onEditorChange={setContent}
                            init={{
                                height: 180,
                                menubar: false,
                                statusbar: false,
                                plugins: 'lists link',
                                toolbar: 'bold italic bullist numlist',
                                content_style: 'body { font-family:Inter,sans-serif; font-size:13px }'
                            }}
                        />
                    </div>
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 shadow-md flex justify-center items-center gap-2"
                    >
                        {saving ? "Publishing..." : <><Save size={16}/> Publish Update</>}
                    </button>
                </div>
            ) : (
                // --- VIEW MODE ---
                <div className="p-6 h-full overflow-y-auto custom-scrollbar">
                    {selectedUpdate ? (
                        <>
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                                    <Clock size={20}/>
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-800">{selectedUpdate.version_number}</h2>
                                    <p className="text-xs text-slate-500">Released on {new Date(selectedUpdate.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>
                            <div className="prose prose-sm prose-indigo max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: selectedUpdate.content }}></div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <Clock size={48} className="mb-2 opacity-20"/>
                            <p className="text-sm">Select a version to view details</p>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}