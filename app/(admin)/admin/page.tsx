"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // --- Data ---
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);

  // --- Selections ---
  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  // --- Inputs ---
  const [newSegment, setNewSegment] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newSubject, setNewSubject] = useState("");
  
  // --- Resource Inputs ---
  const [resTitle, setResTitle] = useState("");
  const [resLink, setResLink] = useState(""); 
  const [resFile, setResFile] = useState<File | null>(null); 
  const [resType, setResType] = useState("pdf"); 
  const [loading, setLoading] = useState(false);

  // --- SECURITY CHECK ---
  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/login");
      else { setIsAuthenticated(true); fetchSegments(); }
    }
    checkUser();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  // --- FETCHING ---
  async function fetchSegments() {
    const { data } = await supabase.from("segments").select("*").order('id');
    setSegments(data || []);
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

  // --- CLICK HANDLERS ---
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

  // --- ADD FUNCTIONS ---
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

    if (!error) { setResTitle(""); setResLink(""); setResFile(null); fetchResources(selectedSubject); } 
    else { alert(error.message); }
    setLoading(false);
  }

  // --- DELETE FUNCTIONS (NEW!) ---
  async function deleteItem(table: string, id: number, refresh: () => void) {
    if(!confirm("⚠️ Delete this item? \n(You cannot undo this action)")) return;
    
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) alert("Could not delete. Make sure it is empty first! \n\nError: " + error.message);
    else refresh();
  }

  if (!isAuthenticated) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-black font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-900">Admin Master Control</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-bold text-sm">Sign Out</button>
      </div>

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
              <li key={s.id} onClick={() => handleSegmentClick(s.id)} className={`p-2 text-sm rounded cursor-pointer flex justify-between items-center ${selectedSegment == s.id ? 'bg-blue-100 ring-1 ring-blue-500' : 'bg-gray-100'}`}>
                <span>{s.title}</span>
                <button onClick={(e) => {e.stopPropagation(); deleteItem('segments', s.id, fetchSegments)}} className="text-red-400 hover:text-red-600 font-bold px-1">×</button>
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
              <li key={g.id} onClick={() => handleGroupClick(g.id)} className={`p-2 text-sm rounded cursor-pointer flex justify-between items-center ${selectedGroup == g.id ? 'bg-green-100 ring-1 ring-green-500' : 'bg-gray-100'}`}>
                <span>{g.title}</span>
                <button onClick={(e) => {e.stopPropagation(); deleteItem('groups', g.id, () => fetchGroups(selectedSegment))}} className="text-red-400 hover:text-red-600 font-bold px-1">×</button>
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
              <li key={s.id} onClick={() => handleSubjectClick(s.id)} className={`p-2 text-sm rounded cursor-pointer flex justify-between items-center ${selectedSubject == s.id ? 'bg-purple-100 ring-1 ring-purple-500' : 'bg-gray-100'}`}>
                <span>{s.title}</span>
                <button onClick={(e) => {e.stopPropagation(); deleteItem('subjects', s.id, () => fetchSubjects(selectedGroup))}} className="text-red-400 hover:text-red-600 font-bold px-1">×</button>
              </li>
            ))}
          </ul>
        </div>

        {/* COL 4: RESOURCES */}
        <div className={`bg-white p-4 rounded shadow border-t-4 border-orange-500 ${!selectedSubject ? 'opacity-50 pointer-events-none' : ''}`}>
          <h2 className="font-bold mb-2">4. Upload Content</h2>
          <div className="bg-gray-50 p-3 rounded mb-4 border">
            <select className="w-full p-2 mb-2 border rounded" value={resType} onChange={(e)=>setResType(e.target.value)}><option value="pdf">PDF</option><option value="video">Video</option></select>
            <input className="border p-2 w-full text-sm mb-2 rounded" value={resTitle} onChange={e=>setResTitle(e.target.value)} placeholder="Title" />
            {resType === 'pdf' ? <input type="file" onChange={(e) => setResFile(e.target.files?.[0] || null)} className="text-sm mb-2 w-full" /> : <input className="border p-2 w-full text-sm mb-2 rounded" value={resLink} onChange={e=>setResLink(e.target.value)} placeholder="YouTube Link" />}
            <button onClick={addResource} disabled={loading} className="w-full bg-orange-600 text-white py-2 rounded font-bold hover:bg-orange-700">{loading ? "Uploading..." : "Save Resource"}</button>
          </div>
          <h3 className="font-bold text-sm text-gray-500 mb-2">Existing Resources:</h3>
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {resources.map(r => (
                <li key={r.id} className="p-2 text-xs bg-orange-50 border border-orange-200 rounded flex justify-between items-center">
                    <div className="overflow-hidden"><span className="font-bold block truncate">{r.title}</span><span className="text-gray-500 uppercase text-[10px]">{r.type}</span></div>
                    <button onClick={()=>deleteItem('resources', r.id, () => fetchResources(selectedSubject))} className="text-red-500 font-bold ml-2 hover:bg-red-100 px-2 rounded">Delete</button>
                </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}