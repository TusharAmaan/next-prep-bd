"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDashboard() {
  // --- Data ---
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  // --- Selections ---
  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");

  // --- Inputs ---
  const [newSegment, setNewSegment] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Initial Load ---
  useEffect(() => { fetchSegments(); }, []);

  // --- Fetching Logic ---
  async function fetchSegments() {
    const { data } = await supabase.from("segments").select("*").order('id');
    if (data) setSegments(data);
  }

  async function fetchGroups(segmentId: string) {
    const { data } = await supabase.from("groups").select("*").eq("segment_id", segmentId).order('id');
    if (data) setGroups(data);
    else setGroups([]);
  }

  async function fetchSubjects(groupId: string) {
    const { data } = await supabase.from("subjects").select("*").eq("group_id", groupId).order('id');
    if (data) setSubjects(data);
    else setSubjects([]);
  }

  // --- Handlers ---
  const handleSegmentClick = (id: string) => {
    setSelectedSegment(id);
    setSelectedGroup(""); 
    setSubjects([]); 
    fetchGroups(id);
  };

  const handleGroupClick = (id: string) => {
    setSelectedGroup(id);
    fetchSubjects(id);
  };

  // --- Add Functions ---
  async function addSegment() {
    if (!newSegment) return;
    setLoading(true);
    const slug = newSegment.toLowerCase().replace(/\s+/g, "-");
    await supabase.from("segments").insert([{ title: newSegment, slug }]);
    setNewSegment(""); fetchSegments(); setLoading(false);
  }

  async function addGroup() {
    if (!newGroup || !selectedSegment) return;
    setLoading(true);
    const slug = newGroup.toLowerCase().replace(/\s+/g, "-");
    await supabase.from("groups").insert([{ title: newGroup, slug, segment_id: Number(selectedSegment) }]);
    setNewGroup(""); fetchGroups(selectedSegment); setLoading(false);
  }

  async function addSubject() {
    if (!newSubject || !selectedGroup) return;
    setLoading(true);
    const slug = newSubject.toLowerCase().replace(/\s+/g, "-");
    // Notice we now link to group_id, AND segment_id (for easier querying later if needed)
    await supabase.from("subjects").insert([{ 
      title: newSubject, 
      slug, 
      group_id: Number(selectedGroup),
      segment_id: Number(selectedSegment) 
    }]);
    setNewSubject(""); fetchSubjects(selectedGroup); setLoading(false);
  }

  // --- Delete Function ---
  async function deleteItem(table: string, id: number, callback: () => void) {
    if(!confirm("Delete this? It will delete everything inside it.")) return;
    await supabase.from(table).delete().eq("id", id);
    callback();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-black font-sans">
      <h1 className="text-3xl font-bold mb-8 text-blue-900">Admin Master Control</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COLUMN 1: SEGMENTS (SSC, HSC) */}
        <div className="bg-white p-4 rounded shadow border-t-4 border-blue-500">
          <h2 className="font-bold text-lg mb-4">1. Exam / Segment</h2>
          <div className="flex gap-2 mb-4">
            <input className="border p-2 w-full text-sm" value={newSegment} onChange={e=>setNewSegment(e.target.value)} placeholder="e.g. HSC" />
            <button onClick={addSegment} className="bg-blue-600 text-white px-3 rounded">+</button>
          </div>
          <ul className="space-y-2">
            {segments.map(seg => (
              <li key={seg.id} 
                onClick={() => handleSegmentClick(seg.id)}
                className={`p-3 rounded cursor-pointer flex justify-between ${selectedSegment == seg.id ? 'bg-blue-100 ring-1 ring-blue-500' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                <span>{seg.title}</span>
                <button onClick={(e)=>{e.stopPropagation(); deleteItem('segments', seg.id, fetchSegments)}} className="text-red-400 hover:text-red-600">×</button>
              </li>
            ))}
          </ul>
        </div>

        {/* COLUMN 2: GROUPS (Science, Commerce) */}
        <div className={`bg-white p-4 rounded shadow border-t-4 border-green-500 ${!selectedSegment ? 'opacity-50 pointer-events-none' : ''}`}>
          <h2 className="font-bold text-lg mb-4">2. Group / Department</h2>
          <div className="flex gap-2 mb-4">
            <input className="border p-2 w-full text-sm" value={newGroup} onChange={e=>setNewGroup(e.target.value)} placeholder="e.g. Science" />
            <button onClick={addGroup} className="bg-green-600 text-white px-3 rounded">+</button>
          </div>
          <ul className="space-y-2">
            {groups.length === 0 && <p className="text-gray-400 text-xs">No groups yet.</p>}
            {groups.map(grp => (
              <li key={grp.id} 
                onClick={() => handleGroupClick(grp.id)}
                className={`p-3 rounded cursor-pointer flex justify-between ${selectedGroup == grp.id ? 'bg-green-100 ring-1 ring-green-500' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                <span>{grp.title}</span>
                <button onClick={(e)=>{e.stopPropagation(); deleteItem('groups', grp.id, ()=>fetchGroups(selectedSegment))}} className="text-red-400 hover:text-red-600">×</button>
              </li>
            ))}
          </ul>
        </div>

        {/* COLUMN 3: SUBJECTS (Physics, Accounting) */}
        <div className={`bg-white p-4 rounded shadow border-t-4 border-purple-500 ${!selectedGroup ? 'opacity-50 pointer-events-none' : ''}`}>
          <h2 className="font-bold text-lg mb-4">3. Subjects</h2>
          <div className="flex gap-2 mb-4">
            <input className="border p-2 w-full text-sm" value={newSubject} onChange={e=>setNewSubject(e.target.value)} placeholder="e.g. Physics 1st" />
            <button onClick={addSubject} className="bg-purple-600 text-white px-3 rounded">+</button>
          </div>
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {subjects.length === 0 && <p className="text-gray-400 text-xs">No subjects yet.</p>}
            {subjects.map(sub => (
              <li key={sub.id} className="p-3 bg-gray-50 rounded flex justify-between border-l-2 border-purple-300">
                <span>{sub.title}</span>
                <button onClick={()=>deleteItem('subjects', sub.id, ()=>fetchSubjects(selectedGroup))} className="text-red-400 hover:text-red-600">×</button>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}