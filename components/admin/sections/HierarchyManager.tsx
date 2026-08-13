"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Trash2, Plus , Layers, FolderTree, BookOpen} from "lucide-react";

export default function HierarchyManager({ 
  segments, groups, subjects, 
  selectedSegment, setSelectedSegment, 
  selectedGroup, setSelectedGroup, 
  fetchDropdowns, fetchGroups, fetchSubjects,
  darkMode = false
}: any) {
  const [newName, setNewName] = useState("");
  const [activeLevel, setActiveLevel] = useState<'segment' | 'group' | 'subject'>('segment');

  // --- ACTIONS ---
  const handleAdd = async () => {
    if (!newName) return alert("Name required");
    const slug = newName.toLowerCase().replace(/\s+/g, '-');
    let error;

    if (activeLevel === 'segment') {
        const { error: err } = await supabase.from('segments').insert([{ title: newName, slug }]);
        error = err;
    } else if (activeLevel === 'group') {
        if (!selectedSegment) return alert("Select a Segment first");
        const { error: err } = await supabase.from('groups').insert([{ title: newName, slug, segment_id: Number(selectedSegment) }]);
        error = err;
    } else if (activeLevel === 'subject') {
        if (!selectedGroup) return alert("Select a Group first");
        const { error: err } = await supabase.from('subjects').insert([{ title: newName, slug, group_id: Number(selectedGroup), segment_id: Number(selectedSegment) }]);
        error = err;
    }

    if (error) alert(error.message);
    else {
        setNewName("");
        fetchDropdowns(); // Refresh Data
        if (selectedSegment) fetchGroups(selectedSegment);
        if (selectedGroup) fetchSubjects(selectedGroup);
    }
  };

  const handleDelete = async (table: string, id: number) => {
    if (!confirm("Permanently delete this item?")) return;
    await supabase.from(table).delete().eq("id", id);
    fetchDropdowns();
    if (selectedSegment) fetchGroups(selectedSegment);
    if (selectedGroup) fetchSubjects(selectedGroup);
  };

      // --- RENDER HELPERS ---
    const Column = ({ title, level, icon: Icon, items, selectedId, onSelect, onDelete }: any) => (
        <div 
            className={`bg-surf-1 border border-line rounded-xl overflow-hidden flex flex-col ${(level === 'group' && !selectedSegment) || (level === 'subject' && !selectedGroup) ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}
            onClick={() => setActiveLevel(level)}
        >
            <div className="px-4 h-11 flex items-center justify-between border-b border-line bg-surf-2/60 shrink-0">
                <span className={`text-[11px] font-bold tracking-wider ${activeLevel === level ? 'text-indigo-400' : 'text-ink-3'}`}>{title}</span>
                <Icon className={`w-[13px] h-[13px] ${activeLevel === level ? 'text-indigo-400' : 'text-ink-3'}`} />
            </div>
            <div className="p-2 space-y-0.5 flex-1 max-h-96 min-h-[300px] overflow-y-auto custom-scrollbar">
                {items.map((item: any) => {
                    const isSelected = selectedId === String(item.id);
                    return (
                        <div key={item.id} className="relative group/row">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onSelect && onSelect(String(item.id)); }} 
                                className={`w-full text-left px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors border ${isSelected ? 'bg-indigo-600/15 text-indigo-400 border-indigo-600/30' : 'text-ink-2 hover:bg-surf-2 border-transparent'}`}
                            >
                                {item.title}
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} 
                                className="absolute right-2 top-1/2 -translate-y-1/2 icon-btn p-1.5 rounded-md hover:bg-rose-500/10 text-ink-3 hover:text-rose-400 opacity-0 group-hover/row:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-[13px] h-[13px]" />
                            </button>
                        </div>
                    );
                })}
                {items.length === 0 && <div className="text-center text-[11.5px] text-ink-3 py-10 font-medium">No items yet</div>}
            </div>
        </div>
    );

    return (
        <section className="section space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="font-display font-bold text-[16px]">Hierarchy manager</h2>
                    <p className="text-[12px] text-ink-3 mt-0.5">Organize your content structure</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <input 
                        className="flex-1 sm:w-48 bg-surf-1 border border-line rounded-lg px-3 h-9 text-[12px] outline-none focus:border-indigo-600 text-ink-1 placeholder:text-ink-3" 
                        placeholder={`New ${activeLevel} name...`} 
                        value={newName} 
                        onChange={e => setNewName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    />
                    <button 
                        onClick={handleAdd} 
                        className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-medium transition-colors shrink-0"
                    >
                        <Plus className="w-[14px] h-[14px]" /> Add {activeLevel}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Column title="1 · SEGMENTS" level="segment" icon={Layers} items={segments} selectedId={selectedSegment} onSelect={(id: any) => { setSelectedSegment(id); setSelectedGroup(""); fetchGroups(id); fetchSubjects(""); }} onDelete={(id: any) => handleDelete('segments', id)} />
                <Column title="2 · GROUPS" level="group" icon={FolderTree} items={groups} selectedId={selectedGroup} onSelect={(id: any) => { setSelectedGroup(id); fetchSubjects(id); }} onDelete={(id: any) => handleDelete('groups', id)} />
                <Column title="3 · SUBJECTS" level="subject" icon={BookOpen} items={subjects} selectedId={null} onSelect={null} onDelete={(id: any) => handleDelete('subjects', id)} />
            </div>
        </section>
    );

}

