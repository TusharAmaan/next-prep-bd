"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDashboard() {
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);

  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  const [newSegment, setNewSegment] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newSubject, setNewSubject] = useState("");
  
  const [resTitle, setResTitle] = useState("");
  const [resLink, setResLink] = useState("");
  const [resFile, setResFile] = useState<File | null>(null);
  const [resType, setResType] = useState("pdf");
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchSegments(); }, []);

  async function fetchSegments() {
    const { data } = await supabase.from("segments").select("*").order('id');
    if (data) setSegments(data);
  }
  async function fetchGroups(segmentId: string) {
    const { data } = await supabase.from("groups").select("*").eq("segment_id", segmentId).order('id');
    setGroups(data || []);
  }
  async function fetchSubjects(groupId: string) {
    const { data } = await supabase.from("subjects").select("*").eq("group_id", groupId).order('id');
    setSubjects(data || []);
  }
  async function fetchResources(subjectId: string) {
    const { data } = await supabase.from("resources").select("*").eq("subject_id", subjectId).order('created_at', { ascending: false });
    setResources(data || []);
  }

  const handleSegmentClick = (id: string) => {
    setSelectedSegment(id); setSelectedGroup(""); setSelectedSubject(""); setGroups([]); setSubjects([]); setResources([]);
    fetchGroups(id);
  };
  const handleGroupClick = (id: string) => {
    setSelectedGroup(id); setSelectedSubject(""); setSubjects([]); setResources([]);
    fetchGroups(selectedSegment);
    fetchSubjects(id);
  };
  const handleSubjectClick = (id: string) => {
    setSelectedSubject(id);
    fetchResources(id);
  };

  async function addSegment() {
    if (!newSegment) return;
    const slug = newSegment.toLowerCase().replace(/\s+/g, "-");
    await supabase.from("segments").insert([{ title: newSegment, slug }]);
    setNewSegment(""); fetchSegments();
  }
  async function addGroup() {
    if (!newGroup || !selectedSegment) return;
    const slug = newGroup.toLowerCase().replace(/\s+/g, "-");
    await supabase.from("groups").insert([{ title: newGroup, slug, segment_id: Number(selectedSegment) }]);
    setNewGroup(""); fetchGroups(selectedSegment);
  }
  async function addSubject() {
    if (!newSubject || !selectedGroup) return;
    const slug = newSubject.toLowerCase().replace(/\s+/g, "-");
    await supabase.from("subjects").insert([{ title: newSubject, slug, group_id: Number(selectedGroup), segment_id: Number(selectedSegment) }]);
    setNewSubject(""); fetchSubjects(selectedGroup);
  }

  // --- 1. UPLOAD FUNCTION ---
  async function addResource() {
    if (!resTitle || !selectedSubject) return alert("Title required");
    setLoading(true);

    let finalUrl = resLink;

    if (resType === 'pdf' && resFile) {
        const fileName = `${Date.now()}-${resFile.name}`;
        const { error: uploadError } = await supabase.storage.from('materials').upload(fileName, resFile);
        if (uploadError) { alert("Upload Failed: " + uploadError.message); setLoading(false); return; }
        
        const { data: urlData } = supabase.storage.from('materials').getPublicUrl(fileName);
        finalUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from("resources").insert([{
        subject_id: Number(selectedSubject),
        title: resTitle,
        type: resType,
        content_url: finalUrl,
    }]);

    if (!error) {
        setResTitle(""); setResLink(""); setResFile(null);
        fetchResources(selectedSubject);
    } else {
        alert(error.message);
    }
    setLoading(false);
  }

  // --- 2. DELETE FUNCTION (FIXED) ---
  async function deleteResource(id: number) {
    if(!confirm("Are you sure you want to delete this?")) return;
    
    // Delete from Database
    const { error } = await supabase.from("resources").delete().eq("id", id);
    
    if (error) {
      alert("Error deleting: " + error.message);
    } else {
      // Refresh list
      fetchResources(selectedSubject);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-black font-sans">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">Admin Master Control</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* COL 1: EXAM */}
        <div className="bg-white p-4 rounded shadow border-t-4 border-blue-500">
          <h2 className="font-bold mb-2">1. Exam</h2>
          <div className="flex gap-1 mb-2">
            <input className="border p-1 w-full text-sm" value={newSegment} onChange={e=>setNewSegment(e.target.value)} placeholder="e.g. HSC" />
            <button onClick={addSegment} className="bg-blue-600 text-white px-2 rounded">+</button>
          </div>
          <ul className="space-y-1">
            {segments.map(s => (
              <li key={s.id} onClick={() => handleSegmentClick(s.id)} className={`p-2 text-sm rounded cursor-pointer flex justify-between ${selectedSegment == s.id ? 'bg-blue-100 ring-1 ring-blue-500' : 'bg-gray-100'}`}>
                {s.title}
              </li>
            ))}
          </ul>
        </div>

        {/* COL 2: GROUP */}
        <div className={`bg-white p-4 rounded shadow border-t-4 border-green-500 ${!selectedSegment ? 'opacity-50 pointer-events-none' : ''}`}>
          <h2 className="font-bold mb-2">2. Group</h2>
          <div className="flex gap-1 mb-2">
            <input className="border p-1 w-full text-sm" value={newGroup} onChange={e=>setNewGroup(e.target.value)} placeholder="e.g. Science" />
            <button onClick={addGroup} className="bg-green-600 text-white px-2 rounded">+</button>
          </div>
          <ul className="space-y-1">
            {groups.map(g => (
              <li key={g.id} onClick={() => handleGroupClick(g.id)} className={`p-2 text-sm rounded cursor-pointer flex justify-between ${selectedGroup == g.id ? 'bg-green-100 ring-1 ring-green-500' : 'bg-gray-100'}`}>
                {g.title}
              </li>
            ))}
          </ul>
        </div>

        {/* COL 3: SUBJECT */}
        <div className={`bg-white p-4 rounded shadow border-t-4 border-purple-500 ${!selectedGroup ? 'opacity-50 pointer-events-none' : ''}`}>
          <h2 className="font-bold mb-2">3. Subject</h2>
          <div className="flex gap-1 mb-2">
            <input className="border p-1 w-full text-sm" value={newSubject} onChange={e=>setNewSubject(e.target.value)} placeholder="e.g. Physics" />
            <button onClick={addSubject} className="bg-purple-600 text-white px-2 rounded">+</button>
          </div>
          <ul className="space-y-1 max-h-96 overflow-y-auto">
            {subjects.map(s => (
              <li key={s.id} onClick={() => handleSubjectClick(s.id)} className={`p-2 text-sm rounded cursor-pointer flex justify-between ${selectedSubject == s.id ? 'bg-purple-100 ring-1 ring-purple-500' : 'bg-gray-100'}`}>
                {s.title}
              </li>
            ))}
          </ul>
        </div>

        {/* COL 4: RESOURCES */}
        <div className={`bg-white p-4 rounded shadow border-t-4 border-orange-500 ${!selectedSubject ? 'opacity-50 pointer-events-none' : ''}`}>
          <h2 className="font-bold mb-2">4. Upload Content</h2>
          
          <div className="bg-gray-50 p-3 rounded mb-4 border">
            <select className="w-full p-2 mb-2 border rounded" value={resType} onChange={(e)=>setResType(e.target.value)}>
                <option value="pdf">PDF / Document</option>
                <option value="video">Video Link (YouTube)</option>
            </select>
            
            <input className="border p-2 w-full text-sm mb-2 rounded" value={resTitle} onChange={e=>setResTitle(e.target.value)} placeholder="Title (e.g. Chapter 1 PDF)" />
            
            {resType === 'pdf' ? (
                <input type="file" accept="application/pdf" onChange={(e) => setResFile(e.target.files?.[0] || null)} className="text-sm mb-2 w-full" />
            ) : (
                <input className="border p-2 w-full text-sm mb-2 rounded" value={resLink} onChange={e=>setResLink(e.target.value)} placeholder="Paste YouTube Link" />
            )}

            <button onClick={addResource} disabled={loading} className="w-full bg-orange-600 text-white py-2 rounded font-bold hover:bg-orange-700">
                {loading ? "Uploading..." : "Save Resource"}
            </button>
          </div>

          <h3 className="font-bold text-sm text-gray-500 mb-2">Existing Resources:</h3>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {resources.map(r => (
                <li key={r.id} className="p-2 text-xs bg-orange-50 border border-orange-200 rounded flex justify-between items-center">
                    <div className="overflow-hidden">
                        <span className="font-bold block truncate">{r.title}</span>
                        <span className="text-gray-500 uppercase text-[10px]">{r.type}</span>
                    </div>
                    {/* DELETE BUTTON FIXED */}
                    <button onClick={()=>deleteResource(r.id)} className="text-red-500 font-bold ml-2 hover:bg-red-100 px-2 rounded">Delete</button>
                </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}