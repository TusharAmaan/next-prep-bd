"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("materials"); // 'materials' | 'news'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- DATA STATES ---
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([]);

  // --- SELECTIONS ---
  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  // --- INPUTS ---
  const [newSegment, setNewSegment] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newSubject, setNewSubject] = useState("");

  // --- RESOURCE UPLOAD ---
  const [resTitle, setResTitle] = useState("");
  const [resLink, setResLink] = useState("");
  const [resFile, setResFile] = useState<File | null>(null);
  const [resType, setResType] = useState("pdf");
  const [submitting, setSubmitting] = useState(false);

  // --- NEWS INPUTS ---
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsFile, setNewsFile] = useState<File | null>(null);

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

  // --- CREATE FUNCTIONS ---
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
    
    setResTitle(""); setResLink(""); setResFile(null);
    setSubmitting(false);
  }

  async function postNews() {
    if (!newsTitle || !newsContent) return alert("Title & Content required");
    setSubmitting(true);
    let imageUrl = null;

    if (newsFile) {
        const fileName = `news-${Date.now()}-${newsFile.name}`;
        const { error } = await supabase.storage.from('materials').upload(fileName, newsFile);
        if (error) { alert("Image Upload Failed"); setSubmitting(false); return; }
        const { data } = supabase.storage.from('materials').getPublicUrl(fileName);
        imageUrl = data.publicUrl;
    }

    await addItem('news', { title: newsTitle, content: newsContent, image_url: imageUrl }, fetchNews);
    setNewsTitle(""); setNewsContent(""); setNewsFile(null);
    setSubmitting(false);
  }

  // --- DELETE ---
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
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
            <h1 className="text-xl font-extrabold text-blue-900">Admin Panel</h1>
            <p className="text-xs text-gray-400 mt-1">NextPrep Command Center</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
            <button 
                onClick={() => setActiveTab('materials')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'materials' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                📚 Study Materials
            </button>
            <button 
                onClick={() => setActiveTab('news')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'news' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                📰 Newsroom
            </button>
        </nav>
        <div className="p-4 border-t border-gray-100">
            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded">Sign Out</button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 md:ml-64 p-8">
        
        {/* HEADER FOR MOBILE (Hidden on desktop) */}
        <div className="md:hidden flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <button onClick={handleLogout} className="text-red-500 font-bold text-sm">Sign Out</button>
        </div>
        <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
             <button onClick={() => setActiveTab('materials')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${activeTab === 'materials' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Study Materials</button>
             <button onClick={() => setActiveTab('news')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${activeTab === 'news' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Newsroom</button>
        </div>

        {/* --- TAB 1: STUDY MATERIALS --- */}
        {activeTab === 'materials' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">🗂 Manage Content</h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* COL 1: EXAM */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">1. Segments</h3>
                    <div className="flex gap-2 mb-4">
                        <input className="bg-gray-50 border border-gray-200 p-2 rounded w-full text-sm outline-none focus:border-blue-500" value={newSegment} onChange={e=>setNewSegment(e.target.value)} placeholder="New Segment..." />
                        <button onClick={() => addItem('segments', {title: newSegment, slug: newSegment.toLowerCase().replace(/\s+/g, '-')}, fetchSegments)} className="bg-blue-600 text-white px-3 rounded font-bold">+</button>
                    </div>
                    <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                        {segments.map(s => (
                            <li key={s.id} onClick={() => handleSegmentClick(s.id)} className={`p-3 rounded-lg cursor-pointer flex justify-between items-center text-sm font-medium transition ${selectedSegment === s.id ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                {s.title}
                                <button onClick={(e) => {e.stopPropagation(); deleteItem('segments', s.id, fetchSegments)}} className="text-xs opacity-50 hover:opacity-100">✕</button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* COL 2: GROUP */}
                <div className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-opacity ${!selectedSegment ? 'opacity-50 pointer-events-none' : ''}`}>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">2. Groups</h3>
                    <div className="flex gap-2 mb-4">
                        <input className="bg-gray-50 border border-gray-200 p-2 rounded w-full text-sm outline-none focus:border-green-500" value={newGroup} onChange={e=>setNewGroup(e.target.value)} placeholder="New Group..." />
                        <button onClick={() => addItem('groups', {title: newGroup, slug: newGroup.toLowerCase().replace(/\s+/g, '-'), segment_id: Number(selectedSegment)}, () => fetchGroups(selectedSegment))} className="bg-green-600 text-white px-3 rounded font-bold">+</button>
                    </div>
                    <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                        {groups.map(g => (
                            <li key={g.id} onClick={() => handleGroupClick(g.id)} className={`p-3 rounded-lg cursor-pointer flex justify-between items-center text-sm font-medium transition ${selectedGroup === g.id ? 'bg-green-600 text-white shadow-md' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                {g.title}
                                <button onClick={(e) => {e.stopPropagation(); deleteItem('groups', g.id, () => fetchGroups(selectedSegment))}} className="text-xs opacity-50 hover:opacity-100">✕</button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* COL 3: SUBJECT */}
                <div className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-opacity ${!selectedGroup ? 'opacity-50 pointer-events-none' : ''}`}>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">3. Subjects</h3>
                    <div className="flex gap-2 mb-4">
                        <input className="bg-gray-50 border border-gray-200 p-2 rounded w-full text-sm outline-none focus:border-purple-500" value={newSubject} onChange={e=>setNewSubject(e.target.value)} placeholder="New Subject..." />
                        <button onClick={() => addItem('subjects', {title: newSubject, slug: newSubject.toLowerCase().replace(/\s+/g, '-'), group_id: Number(selectedGroup), segment_id: Number(selectedSegment)}, () => fetchSubjects(selectedGroup))} className="bg-purple-600 text-white px-3 rounded font-bold">+</button>
                    </div>
                    <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                        {subjects.map(s => (
                            <li key={s.id} onClick={() => handleSubjectClick(s.id)} className={`p-3 rounded-lg cursor-pointer flex justify-between items-center text-sm font-medium transition ${selectedSubject === s.id ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                {s.title}
                                <button onClick={(e) => {e.stopPropagation(); deleteItem('subjects', s.id, () => fetchSubjects(selectedGroup))}} className="text-xs opacity-50 hover:opacity-100">✕</button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* COL 4: UPLOAD */}
                <div className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 transition-opacity ${!selectedSubject ? 'opacity-50 pointer-events-none' : ''}`}>
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

        {/* --- TAB 2: NEWSROOM --- */}
        {activeTab === 'news' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">📰 Newsroom</h2>
            
            {/* WRITE NEW POST */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <h3 className="font-bold text-lg mb-4">Write a New Post</h3>
                <div className="space-y-4">
                    <input 
                        className="w-full text-xl font-bold p-3 border-b border-gray-200 outline-none placeholder-gray-300" 
                        placeholder="Enter Headline Here..."
                        value={newsTitle}
                        onChange={e => setNewsTitle(e.target.value)}
                    />
                    <textarea 
                        className="w-full h-32 p-3 bg-gray-50 rounded border border-gray-200 outline-none focus:border-blue-500 transition"
                        placeholder="Write your article content here..."
                        value={newsContent}
                        onChange={e => setNewsContent(e.target.value)}
                    ></textarea>
                    
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                             <span className="text-sm font-bold text-gray-500">Cover Image:</span>
                             <input type="file" onChange={(e) => setNewsFile(e.target.files?.[0] || null)} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        </div>
                        <button onClick={postNews} disabled={submitting} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                            {submitting ? "Publishing..." : "Publish Post"}
                        </button>
                    </div>
                </div>
            </div>

            {/* EXISTING NEWS LIST */}
            <h3 className="font-bold text-gray-500 uppercase tracking-wider text-sm mb-4">Published Articles</h3>
            <div className="grid gap-4">
                {newsList.map(item => (
                    <div key={item.id} className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-start">
                        {item.image_url && (
                            <div className="w-24 h-24 bg-gray-100 rounded-lg bg-cover bg-center shrink-0" style={{backgroundImage: `url(${item.image_url})`}}></div>
                        )}
                        <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900">{item.title}</h4>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{item.content}</p>
                            <p className="text-xs text-gray-400 mt-2">{new Date(item.created_at).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => deleteItem('news', item.id, fetchNews)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                ))}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}