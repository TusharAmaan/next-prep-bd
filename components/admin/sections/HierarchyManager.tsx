"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Trash2, Plus } from "lucide-react";

export default function HierarchyManager({ 
  segments, groups, subjects, 
  selectedSegment, setSelectedSegment, 
  selectedGroup, setSelectedGroup, 
  fetchDropdowns, fetchGroups, fetchSubjects 
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
  const Column = ({ title, level, items, selectedId, onSelect, onDelete }: any) => (
    <div 
        className={`bg-white border rounded-2xl flex flex-col overflow-hidden shadow-sm transition-all duration-200 ${
            (level === 'group' && !selectedSegment) || (level === 'subject' && !selectedGroup) 
            ? 'opacity-50 pointer-events-none grayscale' 
            : 'opacity-100'
        }`}
        onClick={() => setActiveLevel(level)}
    >
        <div className={`p-4 font-bold border-b text-sm uppercase tracking-wider ${activeLevel === level ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-500'}`}>
            {title}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 h-[400px]">
            {items.map((item: any) => (
                <div 
                    key={item.id} 
                    onClick={(e) => { e.stopPropagation(); onSelect && onSelect(String(item.id)); }} 
                    className={`p-3 rounded-xl cursor-pointer flex justify-between items-center text-sm font-medium transition-colors ${
                        selectedId === String(item.id) 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                    <span>{item.title}</span>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} 
                        className={`p-1.5 rounded-lg transition-colors ${selectedId === String(item.id) ? 'text-indigo-200 hover:text-white hover:bg-white/20' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            ))}
            {items.length === 0 && <div className="text-center text-xs text-slate-400 py-10">No items yet</div>}
        </div>
    </div>
  );

  return (
    <div className="animate-fade-in h-full flex flex-col">
        <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
                <h2 className="text-xl font-black text-slate-800">Hierarchy Manager</h2>
                <p className="text-xs text-slate-500 font-bold">Organize your content structure</p>
            </div>
            <div className="flex gap-2">
                <input 
                    className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm outline-none w-64 focus:ring-2 focus:ring-indigo-500 font-medium" 
                    placeholder={`New ${activeLevel} name...`} 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)} 
                />
                <button 
                    onClick={handleAdd} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg"
                >
                    <Plus className="w-4 h-4" /> Add {activeLevel}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Column 
                title="1. Segments" 
                level="segment" 
                items={segments} 
                selectedId={selectedSegment} 
                onSelect={(id: string) => { setSelectedSegment(id); setSelectedGroup(""); fetchGroups(id); }} 
                onDelete={(id: number) => handleDelete('segments', id)} 
            />
            <Column 
                title="2. Groups" 
                level="group" 
                items={groups} 
                selectedId={selectedGroup} 
                onSelect={(id: string) => { setSelectedGroup(id); fetchSubjects(id); }} 
                onDelete={(id: number) => handleDelete('groups', id)} 
            />
            <Column 
                title="3. Subjects" 
                level="subject" 
                items={subjects} 
                selectedId={null} 
                onSelect={null} 
                onDelete={(id: number) => handleDelete('subjects', id)} 
            />
        </div>
    </div>
  );
}