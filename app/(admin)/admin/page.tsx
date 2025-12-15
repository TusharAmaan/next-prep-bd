"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

// 1. Import SunEditor CSS
import 'suneditor/dist/css/suneditor.min.css'; 

// 2. Dynamic Import (Prevents "document is not defined" crash)
const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
});

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("materials"); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- DATA STATE ---
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]); 

  // --- SELECTIONS ---
  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  // --- MATERIALS INPUTS ---
  const [newSegment, setNewSegment] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [resTitle, setResTitle] = useState("");
  const [resLink, setResLink] = useState("");
  const [resFile, setResFile] = useState<File | null>(null);
  const [resType, setResType] = useState("pdf");
  const [submitting, setSubmitting] = useState(false);

  // --- NEWS INPUTS ---
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState(""); // Stores HTML from editor
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [newCategoryInput, setNewCategoryInput] = useState(""); 
  const [newsTags, setNewsTags] = useState(""); 
  const [newsFile, setNewsFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // --- EBOOK INPUTS (NEW) ---
  const [ebDescription, setEbDescription] = useState(""); 
  const [ebTags, setEbTags] = useState("");

  // --- INIT ---
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        fetchSegments();
        fetchNews();
        fetchCategories();
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
  async function fetchCategories() {
    const { data } = await supabase.from("categories").select("*").order('name');
    setCategoryList(data || []);
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
        const fileName = `res-${Date.now()}-${resFile.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
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
  async function createCategory() {
    if (!newCategoryInput) return;
    const { error } = await supabase.from('categories').insert([{ name: newCategoryInput }]);
    if (!error) {
        setNewCategoryInput("");
        fetchCategories();
        setSelectedCategory(newCategoryInput); 
    } else {
        alert("Error creating category (might already exist)");
    }
  }

  async function handleNewsSubmit() {
    if (!newsTitle) return alert("Title required");
    setSubmitting(true);
    let imageUrl = null;

    if (newsFile) {
        const fileName = `news-${Date.now()}-${newsFile.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
        const { error } = await supabase.storage.from('materials').upload(fileName, newsFile);
        if (error) { alert("Image Upload Failed"); setSubmitting(false); return; }
        const { data } = supabase.storage.from('materials').getPublicUrl(fileName);
        imageUrl = data.publicUrl;
    }

    const tagsArray = newsTags.split(',').map(tag => tag.trim()).filter(tag => tag !== "");

    const payload: any = { 
        title: newsTitle, 
        content: newsContent, 
        category: selectedCategory,
        tags: tagsArray
    };
    if (imageUrl) payload.image_url = imageUrl;

    if (editingId) {
        await supabase.from('news').update(payload).eq('id', editingId);
        setEditingId(null);
    } else {
        await supabase.from('news').insert([payload]);
    }

    fetchNews();
    setNewsTitle(""); setNewsContent(""); setNewsFile(null); setSelectedCategory("General"); setNewsTags("");
    setSubmitting(false);
  }

  function loadForEdit(item: any) {
    setNewsTitle(item.title);
    setNewsContent(item.content);
    setSelectedCategory(item.category || "General");
    setNewsTags(item.tags ? item.tags.join(", ") : "");
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setNewsTitle(""); setNewsContent(""); setSelectedCategory("General"); setNewsTags(""); setEditingId(null);
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
    <div className="flex min-h-screen bg-gray-100 font-sans text-gray-800">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
            <h1 className="text-xl font-extrabold text-blue-900">Admin Panel</h1>
            <p className="text-xs text-gray-400 mt-1">NextPrep Command Center</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
            <button onClick={() => setActiveTab('materials')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'materials' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>📚 Study Materials</button>
            <button onClick={() => setActiveTab('news')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'news' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>📰 News CMS</button>
            <button onClick={() => setActiveTab('ebooks')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'ebooks' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>📖 Manage eBooks</button>
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
        <div className="md:hidden flex gap-2 mb-6 overflow-x-auto">
             <button onClick={() => setActiveTab('materials')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${activeTab === 'materials' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Materials</button>
             <button onClick={() => setActiveTab('news')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${activeTab === 'news' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>News</button>
             <button onClick={() => setActiveTab('ebooks')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${activeTab === 'ebooks' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>eBooks</button>
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

        {/* --- TAB 2: NEWS CMS (SUNEDITOR) --- */}
        {activeTab === 'news' && (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">📰 News CMS</h2>
            
            <div className="flex flex-col lg:flex-row gap-6">
                
                {/* LEFT: EDITOR (70%) */}
                <div className="lg:w-[70%] space-y-4">
                    <input 
                        className="w-full text-3xl font-bold p-4 bg-white border border-gray-200 rounded-lg outline-none placeholder-gray-300 focus:border-blue-500 transition" 
                        placeholder="Add Title"
                        value={newsTitle}
                        onChange={e => setNewsTitle(e.target.value)}
                    />
                    
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <SunEditor 
                            setContents={newsContent}
                            onChange={setNewsContent}
                            height="450px"
                            setOptions={{
                                buttonList: [
                                    ['undo', 'redo'],
                                    ['font', 'fontSize', 'formatBlock'],
                                    ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                                    ['removeFormat'],
                                    ['fontColor', 'hiliteColor'],
                                    ['outdent', 'indent'],
                                    ['align', 'horizontalRule', 'list', 'lineHeight'],
                                    ['table', 'link', 'image', 'video'], 
                                    ['fullScreen', 'showBlocks', 'codeView']
                                ]
                            }}
                        />
                    </div>
                </div>

                {/* RIGHT: SIDEBAR (30%) */}
                <div className="lg:w-[30%] space-y-6">
                    
                    {/* PUBLISH */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Publish</h3>
                        {editingId && (
                             <div className="mb-4 p-2 bg-yellow-50 text-yellow-800 text-sm rounded font-bold">Editing Post ID: {editingId}</div>
                        )}
                        <div className="flex gap-2">
                             {editingId && <button onClick={cancelEdit} className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded">Cancel</button>}
                             <button 
                                onClick={handleNewsSubmit} 
                                disabled={submitting} 
                                className={`flex-1 py-2 rounded text-white font-bold shadow-md transition ${editingId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                             >
                                {submitting ? "Saving..." : (editingId ? "Update" : "Publish")}
                             </button>
                        </div>
                    </div>

                    {/* CATEGORIES */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Categories</h3>
                        <div className="space-y-3">
                             <select 
                                className="w-full p-2 bg-gray-50 border rounded text-sm"
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                             >
                                <option value="General">General</option>
                                {categoryList.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                             </select>
                             
                             <div className="flex gap-2 pt-2 border-t border-dashed">
                                <input 
                                    className="flex-1 p-2 border rounded text-xs" 
                                    placeholder="New Category Name"
                                    value={newCategoryInput}
                                    onChange={e => setNewCategoryInput(e.target.value)}
                                />
                                <button onClick={createCategory} className="bg-gray-100 px-3 py-1 rounded text-xs font-bold hover:bg-gray-200">Add</button>
                             </div>
                        </div>
                    </div>

                    {/* TAGS */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Tags (SEO)</h3>
                        <textarea 
                            className="w-full p-2 border rounded text-sm h-20"
                            placeholder="Separate tags with commas (e.g. Exam, Routine, PDF)"
                            value={newsTags}
                            onChange={e => setNewsTags(e.target.value)}
                        ></textarea>
                    </div>

                    {/* IMAGE */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Featured Image</h3>
                        <input type="file" onChange={(e) => setNewsFile(e.target.files?.[0] || null)} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    </div>

                </div>
            </div>

            {/* LIST TABLE */}
            <div className="mt-12">
                <h3 className="font-bold text-gray-800 text-xl mb-6">All Posts</h3>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Title</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {newsList.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 group">
                                    <td className="p-4 font-bold text-gray-900">{item.title}</td>
                                    <td className="p-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">{item.category}</span></td>
                                    <td className="p-4 text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => loadForEdit(item)} className="text-blue-600 font-bold text-sm mr-4 hover:underline">Edit</button>
                                        <button onClick={() => deleteItem('news', item.id, fetchNews)} className="text-red-500 font-bold text-sm hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

          </div>
        )}

        {/* --- TAB 3: EBOOKS MANAGER (NEW) --- */}
        {activeTab === 'ebooks' && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">📚 Manage Library</h2>
            
            {/* UPLOAD FORM WITH RICH EDITOR */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Add New eBook Details</h3>
                <div className="grid grid-cols-1 gap-4">
                    {/* Basic Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input className="bg-gray-50 border p-3 rounded-lg font-bold" placeholder="Book Title" id="eb-title" />
                        <input className="bg-gray-50 border p-3 rounded-lg" placeholder="Author Name" id="eb-author" />
                        <select className="bg-gray-50 border p-3 rounded-lg" id="eb-category">
                            <option value="SSC">SSC</option>
                            <option value="HSC">HSC</option>
                            <option value="Admission">Admission</option>
                            <option value="Job Prep">Job Prep</option>
                            <option value="General">General</option>
                        </select>
                    </div>

                    {/* Rich Text Description */}
                    <div className="border rounded-lg overflow-hidden">
                        <SunEditor 
                            setContents={ebDescription}
                            onChange={setEbDescription}
                            height="300px"
                            placeholder="Write book description, summary, or table of contents here..."
                            setOptions={{
                                buttonList: [
                                    ['bold', 'underline', 'italic', 'list', 'align', 'table', 'link', 'image'],
                                    ['font', 'fontSize', 'formatBlock', 'fontColor', 'hiliteColor'],
                                    ['fullScreen', 'codeView']
                                ]
                            }}
                        />
                    </div>

                     {/* Tags */}
                     <input 
                        className="bg-gray-50 border p-3 rounded-lg text-sm" 
                        placeholder="Tags (comma separated, e.g. Physics, Chapter 5, Important)" 
                        value={ebTags}
                        onChange={e => setEbTags(e.target.value)}
                    />

                    {/* Files */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-dashed border-gray-300 p-3 rounded-lg flex items-center bg-gray-50">
                            <span className="text-sm font-bold mr-2 text-red-500">📕 PDF File (Required):</span>
                            <input type="file" className="text-xs" id="eb-file" accept="application/pdf" />
                        </div>
                        <div className="border border-dashed border-gray-300 p-3 rounded-lg flex items-center bg-gray-50">
                            <span className="text-sm font-bold mr-2 text-blue-500">🖼️ Cover Image:</span>
                            <input type="file" className="text-xs" id="eb-cover" accept="image/*" />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        disabled={submitting}
                        onClick={async () => {
                            const title = (document.getElementById('eb-title') as HTMLInputElement).value;
                            const author = (document.getElementById('eb-author') as HTMLInputElement).value;
                            const category = (document.getElementById('eb-category') as HTMLSelectElement).value;
                            const pdfFile = (document.getElementById('eb-file') as HTMLInputElement).files?.[0];
                            const coverFile = (document.getElementById('eb-cover') as HTMLInputElement).files?.[0];

                            if(!title || !pdfFile) return alert("Title and PDF are required!");
                            setSubmitting(true);
                            
                            // 1. Upload PDF
                            const pdfName = `pdf-${Date.now()}-${pdfFile.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
                            await supabase.storage.from('materials').upload(pdfName, pdfFile);
                            const pdfUrl = supabase.storage.from('materials').getPublicUrl(pdfName).data.publicUrl;

                            // 2. Upload Cover
                            let coverUrl = null;
                            if(coverFile) {
                                const coverName = `cover-${Date.now()}-${coverFile.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
                                await supabase.storage.from('covers').upload(coverName, coverFile);
                                coverUrl = supabase.storage.from('covers').getPublicUrl(coverName).data.publicUrl;
                            }

                            // 3. Process Tags
                            const tagsArray = ebTags.split(',').map(tag => tag.trim()).filter(tag => tag !== "");

                            // 4. Save to DB
                            const { error } = await supabase.from('ebooks').insert([{ 
                                title, author, category, 
                                pdf_url: pdfUrl, 
                                cover_url: coverUrl,
                                description: ebDescription, 
                                tags: tagsArray 
                            }]);

                            if(error) {
                                alert("Error uploading: " + error.message);
                            } else {
                                alert("eBook Uploaded Successfully!");
                                (document.getElementById('eb-title') as HTMLInputElement).value = "";
                                setEbDescription(""); setEbTags("");
                            }
                            setSubmitting(false);
                        }}
                        className="bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center text-lg shadow-md"
                    >
                        {submitting ? "Uploading... Please wait." : "Upload eBook To Library"}
                    </button>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}