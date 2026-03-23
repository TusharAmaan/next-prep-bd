"use client";
import { useState, useEffect } from "react";
import { Edit2, Save, X, Plus, Trash2, ChevronRight } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react"; 
import { supabase } from "@/lib/supabaseClient";
import { useTheme } from "@/components/shared/ThemeProvider";

function ClockIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}

export default function VersionNote({ latestUpdate, onUpdate }: { latestUpdate: any, onUpdate: () => void }) {
  const { isDark } = useTheme();
  const [mode, setMode] = useState<'view' | 'create'>('view');
  const [history, setHistory] = useState<any[]>([]);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  
  const [version, setVersion] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

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
        if (mode === 'view' && data.length > 0 && !selectedUpdate) {
            setSelectedUpdate(data[0]);
        }
    }
  };

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
        await fetchHistory();
        onUpdate();
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
    <div className={`rounded-2xl border flex flex-col h-full overflow-hidden transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
      
      {/* HEADER */}
      <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50'}`}>
        <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            System Updates
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm border ${isDark ? 'text-slate-400 bg-slate-950 border-slate-700' : 'text-slate-500 bg-white border-slate-200'}`}>v{history[0]?.version_number || '0.0'}</span>
        </h3>
        {mode === 'view' ? (
            <button 
                onClick={() => { setMode('create'); setVersion(''); setContent(''); }} 
                className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${isDark ? 'bg-slate-700 text-white hover:bg-indigo-600' : 'bg-slate-900 text-white hover:bg-indigo-600'}`}
            >
                <Plus size={14}/> New Version
            </button>
        ) : (
            <button onClick={() => setMode('view')} className={`text-xs font-bold px-3 py-1.5 transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>Cancel</button>
        )}
      </div>

      <div className="flex flex-1 h-[320px]">
        
        {/* LEFT: LIST */}
        <div className={`w-1/3 border-r overflow-y-auto custom-scrollbar ${isDark ? 'border-slate-800 bg-slate-950/20' : 'border-slate-100 bg-slate-50/50'}`}>
            {history.map((item) => (
                <button 
                    key={item.id}
                    onClick={() => { setMode('view'); setSelectedUpdate(item); }}
                    className={`w-full text-left p-3 border-b text-sm transition-colors relative group ${isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-100 hover:bg-white'} ${selectedUpdate?.id === item.id && mode === 'view' ? (isDark ? 'bg-slate-800 border-l-4 border-l-indigo-500' : 'bg-white border-l-4 border-l-indigo-600') : 'border-l-4 border-l-transparent'}`}
                >
                    <div className={`flex justify-between items-center mb-1 text-[11px] font-black uppercase tracking-tight ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                        <span className={selectedUpdate?.id === item.id ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : ''}>{item.version_number}</span>
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className={`text-[11px] line-clamp-1 h-4 overflow-hidden ${isDark ? 'text-slate-400' : 'text-slate-500'}`} dangerouslySetInnerHTML={{__html: item.content?.replace(/<[^>]+>/g, '') || 'No details'}}></div>
                    
                    <div 
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        className={`absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1 shadow-sm rounded text-red-500 hover:bg-red-50 cursor-pointer ${isDark ? 'bg-slate-900' : 'bg-white'}`}
                    >
                        <Trash2 size={12}/>
                    </div>
                </button>
            ))}
            {history.length === 0 && <div className={`p-4 text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No updates yet.</div>}
        </div>

        {/* RIGHT */}
        <div className="w-2/3 flex flex-col relative">
            
            {mode === 'create' ? (
                <div className="p-4 space-y-4 h-full flex flex-col">
                    <div>
                        <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Version Number</label>
                        <input 
                            value={version} 
                            onChange={e => setVersion(e.target.value)} 
                            className={`w-full border rounded-lg p-2 text-sm font-bold outline-none transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:ring-2 focus:ring-indigo-500/30' : 'bg-white border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-100'}`}
                            placeholder="e.g. v2.4.0"
                        />
                    </div>
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <label className={`block text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Release Notes</label>
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
                                content_style: `body { font-family:Inter,sans-serif; font-size:13px; ${isDark ? 'background:#1e293b; color:#e2e8f0;' : ''} }`
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
                <div className="p-6 h-full overflow-y-auto custom-scrollbar">
                    {selectedUpdate ? (
                        <>
                            <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                                    <ClockIcon size={20}/>
                                </div>
                                <div>
                                    <h2 className={`text-xl font-black ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{selectedUpdate.version_number}</h2>
                                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Released on {new Date(selectedUpdate.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>
                            <div className={`prose prose-sm prose-indigo max-w-none ${isDark ? 'text-slate-300 prose-invert' : 'text-slate-600'}`} dangerouslySetInnerHTML={{ __html: selectedUpdate.content }}></div>
                        </>
                    ) : (
                        <div className={`h-full flex flex-col items-center justify-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            <ClockIcon size={48} className="mb-2 opacity-20"/>
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