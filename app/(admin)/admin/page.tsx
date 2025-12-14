"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("materials"); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- DATA ---
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([]);

  // --- SELECTIONS ---
  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  // --- INPUTS (Materials) ---
  const [newSegment, setNewSegment] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [resTitle, setResTitle] = useState("");
  const [resLink, setResLink] = useState("");
  const [resFile, setResFile] = useState<File | null>(null);
  const [resType, setResType] = useState("pdf");
  const [submitting, setSubmitting] = useState(false);

  // --- INPUTS (News CMS) ---
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsCategory, setNewsCategory] = useState("General"); // NEW
  const [newsFile, setNewsFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null); // NEW: For Editing

  // --- INIT ---
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        fetchSegments();
        fetchNews();
      } else {
        router.push("/login");
      }
      setIsLoading(false);
    };
    checkSession();
  }, [router]);

  // --- FETCHERS ---
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
  async function fetchNews() {
    const { data } = await supabase.from("news").select("*").order('created_at', { ascending: false });
    setNewsList(data || []);
  }

  // --- LOGIC ---
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

  // --- MATERIAL FUNCTIONS ---
  async function addItem(table: string, payload: any, refresh: () => void) {
    await supabase.from(table).insert([payload]);
    refresh();
  }
  async function uploadResource() {
    if (!resTitle || !selectedSubject) return alert("Title required");
    setSubmitting(true);
    let finalUrl = resLink;

    if (resType === 'pdf' && resFile) {
        const fileName = `res-${Date.now()}-${resFile.name}`;
        const { error } = await supabase.storage.from('materials').upload(fileName, resFile);
        if (error) { alert("Upload Failed"); setSubmitting(false); return; }
        const { data } = supabase.storage.from('materials').getPublicUrl(fileName);
        finalUrl = data.publicUrl;
    }

    await addItem('resources', { 
        subject_id: Number(selectedSubject), 
        title: resTitle, 
        type: resType, 
        content_url: finalUrl 
    }, () => fetchResources(selectedSubject));
    setResTitle(""); setResLink(""); setResFile(null); setSubmitting(false);
  }

  // --- NEWS CMS FUNCTIONS ---
  async function handleNewsSubmit() {
    if (!newsTitle || !newsContent) return alert("Title & Content required");
    setSubmitting(true);
    let imageUrl = null;

    // 1. Upload Image (if selected)
    if (newsFile) {
        const fileName = `news-${Date.now()}-${newsFile.name}`;
        const { error } = await supabase.storage.from('materials').upload(fileName, newsFile);
        if (error) { alert("Image Upload Failed"); setSubmitting(false); return; }
        const { data } = supabase.storage.from('materials').getPublicUrl(fileName);
        imageUrl = data.publicUrl;
    }

    const payload: any = { 
        title: newsTitle, 
        content: newsContent, 
        category: newsCategory 
    };
    if (imageUrl) payload.image_url = imageUrl;

    if (editingId) {
        // UPDATE EXISTING
        await supabase.from('news').update(payload).eq('id', editingId);
        setEditingId(null);
    } else {
        // CREATE NEW
        await supabase.from('news').insert([payload]);
    }

    fetchNews();
    setNewsTitle(""); setNewsContent(""); setNewsFile(null); setNewsCategory("General");
    setSubmitting(false);
  }

  function loadForEdit(item: any) {
    setNewsTitle(item.title);
    setNewsContent(item.content);
    setNewsCategory(item.category || "General");
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setNewsTitle(""); setNewsContent(""); setNewsCategory("General"); setEditingId(null);
  }

  async function deleteItem(table: string, id: number, refresh: () => void) {
    if(!confirm("Are you sure?")) return;
    await supabase.from(table).delete().eq("id", id);
    refresh();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (isLoading) return <div className="p-10 text-center font-bold text-gray-500">Loading Dashboard...</div>;
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
            <h1 className="text-xl font-extrabold text-blue-900">Admin Panel</h1>
            <p className="text-xs text-gray-400 mt-1">NextPrep Command Center</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
            <button onClick={() => setActiveTab('materials')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'materials' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>📚 Study Materials</button>
            <button onClick={() => setActiveTab('news')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'news' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>📰 News CMS</button>
        </nav>
        <div className="p-4 border-t border-gray-100">
            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded">Sign Out</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 p-8">
        <div className="md:hidden flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <button onClick={handleLogout} className="text-red-500 font-bold text-sm">Sign Out</button>
        </div>
        {/* Mobile Tabs */}
        <div className="md:hidden flex gap-2 mb-6">
             <button onClick={() => setActiveTab('materials')} className={`px-4 py-2 rounded-full text-sm font-bold ${activeTab === 'materials' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Study Materials</button>
             <button onClick={() => setActiveTab('news')} className={`px-4 py-2 rounded-full text-sm font-bold ${activeTab === 'news' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>News CMS</button>
        </div>

        {/* --- TAB 1: STUDY MATERIALS --- */}
        {activeTab === 'materials' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">🗂 Manage Content</h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* 1. SEGMENTS */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">1. Segments</h3>
                    <div className="flex gap-2 mb-4">
                        <input className="bg-gray-50 border p-2 rounded w-full text-sm" value={newSegment} onChange={e=>setNewSegment(e.target.value)} placeholder="New Segment..." />
                        <button onClick={() => addItem('segments', {title: newSegment, slug: newSegment.toLowerCase().replace(/\s+/g, '-')}, fetchSegments)} className="bg-blue-600 text-white px-3 rounded font-bold">+</button>
                    </div>
                    <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                        {segments.map(s => (
                            <li key={s.id} onClick={() => handleSegmentClick(s.id)} className={`p-3 rounded-lg cursor-pointer flex justify-between items-center text-sm font-medium ${selectedSegment === s.id ? 'bg-blue-600 text-white' : 'bg-gray-50'}`}>
                                {s.title}
                                <button onClick={(e) => {e.stopPropagation(); deleteItem('segments', s.id, fetchSegments)}} className="text-xs opacity-50 hover:opacity-100">✕</button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 2. GROUPS */}
                <div className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 ${!selectedSegment ? 'opacity-50 pointer-events-none' : ''}`}>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">2. Groups</h3>
                    <div className="flex gap-2 mb-4">
                        <input className="bg-gray-50 border p-2 rounded w-full text-sm" value={newGroup} onChange={e=>setNewGroup(e.target.value)} placeholder="New Group..." />
                        <button onClick={() => addItem('groups', {title: newGroup, slug: newGroup.toLowerCase().replace(/\s+/g, '-'), segment_id: Number(selectedSegment)}, () => fetchGroups(selectedSegment))} className="bg-green-600 text-white px-3 rounded font-bold">+</button>
                    </div>
                    <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                        {groups.map(g => (
                            <li key={g.id} onClick={() => handleGroupClick(g.id)} className={`p-3 rounded-lg cursor-pointer flex justify-between items-center text-sm font-medium ${selectedGroup === g.id ? 'bg-green-600 text-white' : 'bg-gray-50'}`}>
                                {g.title}
                                <button onClick={(e) => {e.stopPropagation(); deleteItem('groups', g.id, () => fetchGroups(selectedSegment))}} className="text-xs opacity-50 hover:opacity-100">✕</button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 3. SUBJECTS */}
                <div className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 ${!selectedGroup ? 'opacity-50 pointer-events-none' : ''}`}>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">3. Subjects</h3>
                    <div className="flex gap-2 mb-4">
                        <input className="bg-gray-50 border p-2 rounded w-full text-sm" value={newSubject} onChange={e=>setNewSubject(e.target.value)} placeholder="New Subject..." />
                        <button onClick={() => addItem('subjects', {title: newSubject, slug: newSubject.toLowerCase().replace(/\s+/g, '-'), group_id: Number(selectedGroup), segment_id: Number(selectedSegment)}, () => fetchSubjects(selectedGroup))} className="bg-purple-600 text-white px-3 rounded font-bold">+</button>
                    </div>
                    <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                        {subjects.map(s => (
                            <li key={s.id} onClick={() => handleSubjectClick(s.id)} className={`p-3 rounded-lg cursor-pointer flex justify-between items-center text-sm font-medium ${selectedSubject === s.id ? 'bg-purple-600 text-white' : 'bg-gray-50'}`}>
                                {s.title}
                                <button onClick={(e) => {e.stopPropagation(); deleteItem('subjects', s.id, () => fetchSubjects(selectedGroup))}} className="text-xs opacity-50 hover:opacity-100">✕</button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 4. UPLOAD */}
                <div className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 ${!selectedSubject ? 'opacity-50 pointer-events-none' : ''}`}>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">4. Uploads</h3>
                    <div className="space-y-3 mb-6">
                        <select className="w-full bg-gray-50 border p-2 rounded text-sm" value={resType} onChange={(e)=>setResType(e.target.value)}>
                            <option value="pdf">PDF File</option>
                            <option value="video">Video Link</option>
                        </select>
                        <input className="w-full bg-gray-50 border p-2 rounded text-sm" value={resTitle} onChange={e=>setResTitle(e.target.value)} placeholder="Resource Title" />
                        {resType === 'pdf' ? <input type="file" onChange={(e) => setResFile(e.target.files?.[0] || null)} className="w-full text-xs" /> : <input className="w-full bg-gray-50 border p-2 rounded text-sm" value={resLink} onChange={e=>setResLink(e.target.value)} placeholder="Video URL" />}
                        <button onClick={uploadResource} disabled={submitting} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded font-bold transition">
                            {submitting ? "Uploading..." : "Save Resource"}
                        </button>
                    </div>
                    <div className="border-t pt-4">
                        <p className="text-xs font-bold text-gray-400 mb-2">Attached Files:</p>
                        <ul className="space-y-1 max-h-[200px] overflow-y-auto">
                            {resources.map(r => (
                                <li key={r.id} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded border border-gray-100">
                                    <span className="truncate max-w-[120px]">{r.title}</span>
                                    <button onClick={() => deleteItem('resources', r.id, () => fetchResources(selectedSubject))} className="text-red-500 font-bold">Del</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: NEWS CMS (WORDPRESS STYLE) --- */}
        {activeTab === 'news' && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">📰 News CMS</h2>
            
            {/* EDITOR CARD */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 relative">
                {editingId && (
                    <div className="absolute top-0 right-0 bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-bl-lg">
                        EDITING MODE
                    </div>
                )}
                <h3 className="font-bold text-lg mb-4">{editingId ? "Edit Post" : "Write New Post"}</h3>
                
                <div className="space-y-4">
                    {/* TITLE & CATEGORY */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                             <input 
                                className="w-full text-xl font-bold p-3 border-b border-gray-200 outline-none placeholder-gray-300 focus:border-blue-500 transition" 
                                placeholder="Enter Article Headline..."
                                value={newsTitle}
                                onChange={e => setNewsTitle(e.target.value)}
                            />
                        </div>
                        <div className="col-span-1">
                             <select 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-blue-100"
                                value={newsCategory}
                                onChange={e => setNewsCategory(e.target.value)}
                             >
                                <option value="General">General News</option>
                                <option value="Exam Alert">🚨 Exam Alert</option>
                                <option value="Suggestion">💡 Suggestions</option>
                                <option value="Admission">🎓 Admission</option>
                                <option value="Job Circular">💼 Job Circular</option>
                             </select>
                        </div>
                    </div>

                    {/* CONTENT AREA */}
                    <textarea 
                        className="w-full h-48 p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition font-mono text-sm"
                        placeholder="Write your article content here..."
                        value={newsContent}
                        onChange={e => setNewsContent(e.target.value)}
                    ></textarea>
                    
                    {/* FOOTER ACTIONS */}
                    <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center gap-2">
                             <span className="text-xs font-bold text-gray-400 uppercase">Cover Image</span>
                             <input type="file" onChange={(e) => setNewsFile(e.target.files?.[0] || null)} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        </div>
                        <div className="flex gap-2">
                            {editingId && (
                                <button onClick={cancelEdit} className="px-6 py-2 rounded-lg font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
                            )}
                            <button onClick={handleNewsSubmit} disabled={submitting} className={`text-white px-8 py-2 rounded-lg font-bold transition shadow-lg ${editingId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                {submitting ? "Saving..." : (editingId ? "Update Post" : "Publish Post")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* POST LIST */}
            <div className="flex justify-between items-end mb-4">
                <h3 className="font-bold text-gray-500 uppercase tracking-wider text-sm">All Posts ({newsList.length})</h3>
            </div>
            
            <div className="grid gap-3">
                {newsList.map(item => (
                    <div key={item.id} className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-center hover:shadow-md transition group">
                        {/* Image Thumbnail */}
                        <div className="w-16 h-16 bg-gray-100 rounded-lg bg-cover bg-center shrink-0" style={{backgroundImage: `url(${item.image_url || '/placeholder.png'})`}}></div>
                        
                        {/* Text Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase tracking-wide border border-gray-200">
                                    {item.category || "General"}
                                </span>
                                <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                            <h4 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition">{item.title}</h4>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button onClick={() => loadForEdit(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                                ✏️
                            </button>
                            <button onClick={() => deleteItem('news', item.id, fetchNews)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}