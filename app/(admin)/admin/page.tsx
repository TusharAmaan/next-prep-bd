"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Import SunEditor CSS
import 'suneditor/dist/css/suneditor.min.css'; 

// Dynamic Import for Editor
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
  const [ebooksList, setEbooksList] = useState<any[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);

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
  
  // Blog Post Inputs (Materials Tab)
  const [blogContent, setBlogContent] = useState("");
  const [blogImageFile, setBlogImageFile] = useState<File | null>(null);
  const [blogTags, setBlogTags] = useState("");
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);

  // --- NEWS INPUTS ---
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState(""); 
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [newCategoryInput, setNewCategoryInput] = useState(""); 
  const [newsTags, setNewsTags] = useState(""); 
  const [newsFile, setNewsFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // --- EBOOK INPUTS ---
  const [ebTitle, setEbTitle] = useState("");
  const [ebAuthor, setEbAuthor] = useState("");
  const [ebCategory, setEbCategory] = useState("SSC");
  const [ebDescription, setEbDescription] = useState(""); 
  const [ebTags, setEbTags] = useState("");
  const [editingEbookId, setEditingEbookId] = useState<number | null>(null);

  // --- COURSE INPUTS ---
  const [cTitle, setCTitle] = useState("");
  const [cInstructor, setCInstructor] = useState("");
  const [cPrice, setCPrice] = useState("");
  const [cDuration, setCDuration] = useState("");
  const [cLink, setCLink] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [cImage, setCImage] = useState<File | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);

  // --- AUTH ---
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        loadAllData();
      } else {
        router.push("/login");
      }
      setIsLoading(false);
    };
    checkSession();
  }, [router]);

  // --- FETCHERS ---
  const loadAllData = useCallback(() => {
    fetchSegments();
    fetchNews();
    fetchCategories();
    fetchEbooks();
    fetchCourses();
  }, []);

  async function fetchSegments() {
    const { data } = await supabase.from("segments").select("*").order('id');
    setSegments(data || []);
  }
  async function fetchNews() {
    const { data } = await supabase.from("news").select("*").order('created_at', { ascending: false });
    setNewsList(data || []);
  }
  async function fetchCategories() {
    const { data } = await supabase.from("categories").select("*").order('name');
    setCategoryList(data || []);
  }
  async function fetchEbooks() {
    const { data } = await supabase.from("ebooks").select("*").order('created_at', { ascending: false });
    setEbooksList(data || []);
  }
  async function fetchCourses() {
    const { data } = await supabase.from("courses").select("*").order('created_at', { ascending: false });
    setCoursesList(data || []);
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
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  // --- SHARED ACTIONS ---
  async function addItem(table: string, payload: any, refresh: () => void) {
    await supabase.from(table).insert([payload]);
    refresh();
  }
  
  async function deleteItem(table: string, id: number, refresh: () => void) {
    if(!confirm("Are you sure you want to delete this? This cannot be undone.")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if(error) {
        alert("Delete failed: " + error.message);
    } else {
        refresh();
    }
  }

  // --- MATERIAL UPLOAD ---
  async function uploadResource() {
    if (!resTitle || !selectedSubject) return alert("Title and Subject are required");
    
    setSubmitting(true);
    let finalUrl = resLink;

    // Handle Upload for PDF or Question type
    let fileToUpload = (resType === 'pdf' || resType === 'question') ? resFile : null;
    
    if (fileToUpload) {
        const fileName = `${resType}-${Date.now()}-${fileToUpload.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
        const { error } = await supabase.storage.from('materials').upload(fileName, fileToUpload);
        if (error) { alert("File Upload Failed: " + error.message); setSubmitting(false); return; }
        const { data } = supabase.storage.from('materials').getPublicUrl(fileName);
        finalUrl = data.publicUrl;
    }

    const payload: any = {
        subject_id: Number(selectedSubject),
        title: resTitle,
        type: resType,
        content_url: finalUrl
    };

    const { error } = await supabase.from('resources').insert([payload]);
    
    if (error) alert("Error saving resource: " + error.message);
    else {
        fetchResources(selectedSubject);
        setResTitle(""); setResLink(""); setResFile(null); 
    }
    setSubmitting(false);
  }

  // --- NEWS ACTIONS ---
  async function createCategory() {
    if (!newCategoryInput) return;
    const { error } = await supabase.from('categories').insert([{ name: newCategoryInput }]);
    if (!error) {
        setNewCategoryInput("");
        fetchCategories();
        setSelectedCategory(newCategoryInput); 
    }
  }

  async function handleNewsSubmit() {
    if (!newsTitle) return alert("Title required");
    setSubmitting(true);
    let imageUrl = null;
    if (newsFile) {
        const fileName = `news-${Date.now()}-${newsFile.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
        const { error } = await supabase.storage.from('materials').upload(fileName, newsFile);
        if (!error) {
             const { data } = supabase.storage.from('materials').getPublicUrl(fileName);
             imageUrl = data.publicUrl;
        }
    }
    const tagsArray = newsTags.split(',').map(tag => tag.trim()).filter(tag => tag !== "");
    const payload: any = { title: newsTitle, content: newsContent, category: selectedCategory, tags: tagsArray };
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

  // --- EBOOK ACTIONS ---
  function loadEbookForEdit(book: any) {
    setEbTitle(book.title);
    setEbAuthor(book.author || "");
    setEbCategory(book.category || "SSC");
    setEbDescription(book.description || "");
    setEbTags(book.tags ? book.tags.join(", ") : "");
    setEditingEbookId(book.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEbookEdit() {
    setEbTitle(""); setEbAuthor(""); setEbCategory("SSC"); setEbDescription(""); setEbTags(""); setEditingEbookId(null);
  }

  async function handleEbookSubmit() {
      if(!ebTitle) return alert("Title is required!");
      setSubmitting(true);

      const pdfFile = (document.getElementById('eb-file') as HTMLInputElement)?.files?.[0];
      const coverFile = (document.getElementById('eb-cover') as HTMLInputElement)?.files?.[0];
      
      let pdfUrl = null;
      let coverUrl = null;

      if (pdfFile) {
        const pdfName = `pdf-${Date.now()}-${pdfFile.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
        const { error } = await supabase.storage.from('materials').upload(pdfName, pdfFile);
        if (error) { alert("PDF Upload Failed: "+ error.message); setSubmitting(false); return; }
        pdfUrl = supabase.storage.from('materials').getPublicUrl(pdfName).data.publicUrl;
      }
      if (coverFile) {
        const coverName = `cover-${Date.now()}-${coverFile.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
        const { error } = await supabase.storage.from('covers').upload(coverName, coverFile);
        if (error) { alert("Cover Upload Failed: "+ error.message); setSubmitting(false); return; }
        coverUrl = supabase.storage.from('covers').getPublicUrl(coverName).data.publicUrl;
      }

      const tagsArray = ebTags.split(',').map(tag => tag.trim()).filter(tag => tag !== "");
      const payload: any = { 
          title: ebTitle, author: ebAuthor, category: ebCategory, description: ebDescription, tags: tagsArray 
      };
      if (pdfUrl) payload.pdf_url = pdfUrl;
      if (coverUrl) payload.cover_url = coverUrl;

      if (editingEbookId) {
          const { data, error } = await supabase.from('ebooks').update(payload).eq('id', editingEbookId).select();
          if (error || !data) alert("Update Failed: " + (error?.message || "Unknown error"));
          else { alert("eBook Updated!"); cancelEbookEdit(); fetchEbooks(); }
      } else {
          if (!pdfUrl) { alert("PDF is required for new books!"); setSubmitting(false); return; }
          payload.pdf_url = pdfUrl;
          await supabase.from('ebooks').insert([payload]);
          alert("eBook Created!"); cancelEbookEdit(); fetchEbooks();
          (document.getElementById('eb-file') as HTMLInputElement).value = "";
          (document.getElementById('eb-cover') as HTMLInputElement).value = "";
      }
      setSubmitting(false);
  }

  // --- COURSE ACTIONS ---
  async function handleCourseSubmit() {
    if(!cTitle) return alert("Course Title is required!");
    setSubmitting(true);
    
    let thumbUrl = null;
    if (cImage) {
        const fileName = `course-${Date.now()}-${cImage.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
        const { error } = await supabase.storage.from('materials').upload(fileName, cImage);
        if (!error) {
            thumbUrl = supabase.storage.from('materials').getPublicUrl(fileName).data.publicUrl;
        }
    }

    const payload: any = {
        title: cTitle, instructor: cInstructor, price: cPrice, 
        duration: cDuration, enrollment_link: cLink, description: cDesc
    };
    if (thumbUrl) payload.thumbnail_url = thumbUrl;

    if (editingCourseId) {
        const { error } = await supabase.from('courses').update(payload).eq('id', editingCourseId);
        if (error) alert("Error updating course: " + error.message);
        else alert("Course Updated Successfully!");
    } else {
        if(!thumbUrl) { alert("Thumbnail is required for new courses!"); setSubmitting(false); return; }
        payload.thumbnail_url = thumbUrl;
        const { error } = await supabase.from('courses').insert([payload]);
        if (error) alert("Error creating course: " + error.message);
        else alert("Course Created Successfully!");
    }

    setSubmitting(false);
    setEditingCourseId(null);
    setCTitle(""); setCInstructor(""); setCPrice(""); setCDuration(""); setCLink(""); setCDesc(""); setCImage(null);
    fetchCourses();
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
            <button onClick={() => setActiveTab('class-blogs')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'class-blogs' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>✍️ Class Blogs</button>
            <button onClick={() => setActiveTab('ebooks')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'ebooks' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>📖 Manage eBooks</button>
            <button onClick={() => setActiveTab('courses')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === 'courses' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>🎓 Manage Courses</button>
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
        <div className="md:hidden flex gap-2 mb-6 overflow-x-auto">
             <button onClick={() => setActiveTab('materials')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${activeTab === 'materials' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Materials</button>
             <button onClick={() => setActiveTab('class-blogs')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${activeTab === 'class-blogs' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Blogs</button>
             <button onClick={() => setActiveTab('ebooks')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${activeTab === 'ebooks' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>eBooks</button>
             <button onClick={() => setActiveTab('courses')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${activeTab === 'courses' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Courses</button>
             <button onClick={() => setActiveTab('news')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${activeTab === 'news' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>News</button>
        </div>

        {/* --- TAB 1: STUDY MATERIALS --- */}
        {activeTab === 'materials' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">🗂 Manage Content</h2>
            
            {/* TOP ROW: SELECTION GRID (3 COLUMNS) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
            </div>

            {/* BOTTOM ROW: UPLOADS (FULL WIDTH) */}
            <div className={`max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-md border border-gray-100 ${!selectedSubject ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wider mb-6 border-b pb-4 flex items-center gap-2">
                    <span>4. Upload Content</span>
                    {selectedSubject && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Selected: Subject ID {selectedSubject}</span>}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* LEFT SIDE: INPUTS */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Resource Type</label>
                            <select className="w-full bg-gray-50 border p-3 rounded-lg text-sm font-bold text-gray-700" value={resType} onChange={(e)=>setResType(e.target.value)}>
                                <option value="pdf">📄 PDF File</option>
                                <option value="video">🎬 Video Link</option>
                                <option value="question">❓ Previous Year Question</option>
                                <option value="blog">✍️ Blog Post</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Title</label>
                            <input className="w-full bg-gray-50 border p-3 rounded-lg text-sm font-bold" value={resTitle} onChange={e=>setResTitle(e.target.value)} placeholder={resType === 'question' ? "e.g. Dhaka Board 2023" : "e.g. Chapter 1 Lecture Note"} />
                        </div>
                        
                        {/* Conditional Inputs */}
                        {(resType === 'pdf' || resType === 'question') && (
                            <div className="border border-dashed border-gray-300 p-4 rounded-lg bg-gray-50">
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Upload PDF</label>
                                <input type="file" onChange={(e) => setResFile(e.target.files?.[0] || null)} className="w-full text-xs" accept="application/pdf"/>
                            </div>
                        )}
                        {resType === 'video' && (
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Video Link</label>
                                <input className="w-full bg-gray-50 border p-3 rounded-lg text-sm" value={resLink} onChange={e=>setResLink(e.target.value)} placeholder="https://youtube.com/..." />
                            </div>
                        )}
                        
                        {resType === 'blog' && (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                                <strong>Note:</strong> For Blog Posts, please use the <strong>"✍️ Class Blogs"</strong> tab in the sidebar for the full editor experience.
                            </div>
                        )}

                        {resType !== 'blog' && (
                            <button onClick={uploadResource} disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition shadow-lg mt-4">
                                {submitting ? "Uploading..." : "Save Resource"}
                            </button>
                        )}
                    </div>

                    {/* RIGHT SIDE: EXISTING FILES LIST */}
                    <div className="border-l pl-8 border-gray-100">
                         <h4 className="text-sm font-bold text-gray-700 mb-4">Existing Resources for this Subject</h4>
                         <div className="bg-gray-50 rounded-xl p-4 h-[300px] overflow-y-auto border border-gray-200">
                            {resources.length === 0 ? (
                                <p className="text-gray-400 text-xs text-center mt-10">No resources uploaded yet.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {resources.map(r => (
                                        <li key={r.id} className="flex justify-between items-center text-sm bg-white p-3 rounded shadow-sm border border-gray-100 group hover:border-blue-200 transition">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <span className="text-xl bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full">
                                                    {r.type === 'pdf' ? '📄' : r.type === 'video' ? '🎬' : r.type === 'question' ? '❓' : '✍️'}
                                                </span>
                                                <span className="truncate font-medium text-gray-700">{r.title}</span>
                                            </div>
                                            <button onClick={() => deleteItem('resources', r.id, () => fetchResources(selectedSubject))} className="text-red-400 hover:text-red-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-red-50 px-2 py-1 rounded">Delete</button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                         </div>
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: CLASS BLOGS --- */}
        {activeTab === 'class-blogs' && (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">✍️ Manage Class Blogs</h2>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4">
                <select className="p-3 border rounded-lg bg-gray-50 flex-1 font-bold text-gray-700" value={selectedSegment} onChange={(e) => handleSegmentClick(e.target.value)}>
                    <option value="">1. Select Class/Segment...</option>
                    {segments.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
                <select className="p-3 border rounded-lg bg-gray-50 flex-1 font-bold text-gray-700" value={selectedGroup} onChange={(e) => handleGroupClick(e.target.value)} disabled={!selectedSegment}>
                    <option value="">2. Select Group...</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                </select>
                <select className="p-3 border rounded-lg bg-gray-50 flex-1 font-bold text-gray-700" value={selectedSubject} onChange={(e) => handleSubjectClick(e.target.value)} disabled={!selectedGroup}>
                    <option value="">3. Select Subject...</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
            </div>

            {!selectedSubject ? (
                <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed"><p className="text-xl font-bold">Please select a Subject above to manage its blogs.</p></div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/3 space-y-4">
                        <div className="flex justify-between items-center"><h3 className="font-bold text-gray-700">Existing Blogs</h3><button onClick={() => { setEditingResourceId(null); setResTitle(""); setBlogContent(""); setBlogTags(""); setBlogImageFile(null); }} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold hover:bg-blue-200">+ New</button></div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-h-[600px] overflow-y-auto">
                            {resources.filter(r => r.type === 'blog').length === 0 && <p className="p-4 text-gray-400 text-sm">No blogs for this subject yet.</p>}
                            {resources.filter(r => r.type === 'blog').map(blog => (
                                <div key={blog.id} onClick={() => { setEditingResourceId(blog.id); setResTitle(blog.title); setBlogContent(blog.content_body || ""); setBlogTags(blog.tags ? blog.tags.join(", ") : ""); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`p-4 border-b hover:bg-gray-50 cursor-pointer group ${editingResourceId === blog.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}>
                                    <h4 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2">{blog.title}</h4>
                                    <div className="flex justify-between items-center mt-2"><span className="text-xs text-gray-400">{new Date(blog.created_at).toLocaleDateString()}</span><button onClick={(e) => { e.stopPropagation(); deleteItem('resources', blog.id, () => fetchResources(selectedSubject)); }} className="text-red-400 hover:text-red-600 text-xs font-bold px-2 py-1 rounded bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity">Delete</button></div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:w-2/3">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">{editingResourceId ? `Editing Blog ID: ${editingResourceId}` : "Write New Blog Post"}{editingResourceId && <button onClick={() => setEditingResourceId(null)} className="text-xs text-red-500">Cancel</button>}</h3>
                            <div className="space-y-4">
                                <input className="w-full text-xl font-bold p-3 bg-gray-50 border rounded-lg" placeholder="Blog Title" value={resTitle} onChange={e => setResTitle(e.target.value)} />
                                <div className="border rounded-lg overflow-hidden"><SunEditor setContents={blogContent} onChange={setBlogContent} height="400px" setOptions={{ buttonList: [['bold', 'underline', 'italic', 'list', 'align', 'link', 'image', 'video'], ['font', 'fontSize', 'formatBlock', 'fontColor'], ['fullScreen', 'codeView']] }} /></div>
                                <input className="w-full p-3 bg-gray-50 border rounded-lg text-sm" placeholder="Tags (Comma separated)" value={blogTags} onChange={e => setBlogTags(e.target.value)} />
                                <input type="file" onChange={(e) => setBlogImageFile(e.target.files?.[0] || null)} className="w-full text-xs text-gray-500 mt-1" accept="image/*" />
                                <button disabled={submitting} onClick={async () => {
                                        if(!resTitle || !blogContent) return alert("Title and Content are required!");
                                        setSubmitting(true);
                                        let finalUrl = resLink;
                                        if (blogImageFile) {
                                            const fileName = `blog-${Date.now()}-${blogImageFile.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
                                            await supabase.storage.from('materials').upload(fileName, blogImageFile);
                                            finalUrl = supabase.storage.from('materials').getPublicUrl(fileName).data.publicUrl;
                                        }
                                        const tagsArray = blogTags.split(',').map(tag => tag.trim()).filter(t => t !== "");
                                        const payload: any = { subject_id: Number(selectedSubject), title: resTitle, type: 'blog', content_body: blogContent, tags: tagsArray, content_url: finalUrl };
                                        if(editingResourceId) await supabase.from('resources').update(payload).eq('id', editingResourceId);
                                        else await supabase.from('resources').insert([payload]);
                                        fetchResources(selectedSubject); setResTitle(""); setBlogContent(""); setBlogTags(""); setBlogImageFile(null); setEditingResourceId(null); setSubmitting(false);
                                    }} className={`w-full py-3 rounded-lg text-white font-bold shadow-md transition ${editingResourceId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{submitting ? "Processing..." : (editingResourceId ? "Update Blog Post" : "Publish Blog Post")}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
          </div>
        )}

        {/* --- TAB 3: EBOOKS MANAGER --- */}
        {activeTab === 'ebooks' && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">📚 Manage Library</h2>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <div className="flex justify-between items-center mb-4 border-b pb-2"><h3 className="font-bold text-gray-700">{editingEbookId ? `Editing eBook ID: ${editingEbookId}` : "Add New eBook"}</h3>{editingEbookId && <button onClick={cancelEbookEdit} className="text-xs text-red-500 font-bold border border-red-200 px-2 py-1 rounded bg-red-50 hover:bg-red-100">Cancel Edit</button>}</div>
                <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><input className="bg-gray-50 border p-3 rounded-lg font-bold" placeholder="Book Title" value={ebTitle} onChange={e => setEbTitle(e.target.value)} /><input className="bg-gray-50 border p-3 rounded-lg" placeholder="Author Name" value={ebAuthor} onChange={e => setEbAuthor(e.target.value)} /><select className="bg-gray-50 border p-3 rounded-lg" value={ebCategory} onChange={e => setEbCategory(e.target.value)}><option value="SSC">SSC</option><option value="HSC">HSC</option><option value="Admission">Admission</option><option value="Job Prep">Job Prep</option><option value="General">General</option></select></div>
                    <div className="border rounded-lg overflow-hidden"><SunEditor setContents={ebDescription} onChange={setEbDescription} height="300px" placeholder="Book description..." setOptions={{ buttonList: [['bold', 'underline', 'italic', 'list', 'align', 'table', 'link'], ['font', 'fontSize', 'fontColor'], ['fullScreen', 'codeView']] }} /></div>
                     <input className="bg-gray-50 border p-3 rounded-lg text-sm" placeholder="Tags (comma separated)" value={ebTags} onChange={e => setEbTags(e.target.value)} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-dashed border-gray-300 p-3 rounded-lg flex items-center bg-gray-50"><span className="text-sm font-bold mr-2 text-red-500">📕 PDF {editingEbookId ? "(Optional)" : "(Required)"}:</span><input type="file" className="text-xs" id="eb-file" accept="application/pdf" /></div>
                        <div className="border border-dashed border-gray-300 p-3 rounded-lg flex items-center bg-gray-50"><span className="text-sm font-bold mr-2 text-blue-500">🖼️ Cover (Optional):</span><input type="file" className="text-xs" id="eb-cover" accept="image/*" /></div>
                    </div>
                    <button disabled={submitting} onClick={handleEbookSubmit} className={`font-bold py-4 rounded-lg transition shadow-md flex items-center justify-center text-lg ${editingEbookId ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>{submitting ? "Processing..." : (editingEbookId ? "Update eBook Details" : "Upload eBook To Library")}</button>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><table className="w-full text-left"><thead className="bg-gray-50 border-b"><tr><th className="p-4 text-xs font-bold text-gray-500">Cover</th><th className="p-4 text-xs font-bold text-gray-500">Title</th><th className="p-4 text-xs font-bold text-gray-500">Category</th><th className="p-4 text-xs font-bold text-gray-500 text-right">Actions</th></tr></thead><tbody className="divide-y">{ebooksList.map(book => (<tr key={book.id}><td className="p-4">{book.cover_url ? <img src={book.cover_url} alt="" className="h-12 w-9 object-cover rounded shadow-sm"/> : <div className="h-12 w-9 bg-gray-100 rounded"></div>}</td><td className="p-4 font-bold">{book.title}</td><td className="p-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">{book.category}</span></td><td className="p-4 text-right"><button onClick={() => loadEbookForEdit(book)} className="text-blue-600 font-bold text-sm mr-4 hover:underline">Edit</button><button onClick={() => deleteItem('ebooks', book.id, fetchEbooks)} className="text-red-500 font-bold text-sm hover:underline">Delete</button></td></tr>))}</tbody></table></div>
          </div>
        )}

        {/* --- TAB 4: COURSES MANAGER --- */}
        {activeTab === 'courses' && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">🎓 Manage Courses</h2>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <h3 className="font-bold text-gray-700 mb-4 pb-2 border-b flex justify-between">{editingCourseId ? `Editing Course ID: ${editingCourseId}` : "Add New Course"}{editingCourseId && <button onClick={() => setEditingCourseId(null)} className="text-red-500 text-xs">Cancel Edit</button>}</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input className="p-3 bg-gray-50 border rounded-lg font-bold" placeholder="Course Title" value={cTitle} onChange={e => setCTitle(e.target.value)} /><input className="p-3 bg-gray-50 border rounded-lg" placeholder="Instructor Name" value={cInstructor} onChange={e => setCInstructor(e.target.value)} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><input className="p-3 bg-gray-50 border rounded-lg" placeholder="Price (e.g. 500 BDT)" value={cPrice} onChange={e => setCPrice(e.target.value)} /><input className="p-3 bg-gray-50 border rounded-lg" placeholder="Duration (e.g. 3 Months)" value={cDuration} onChange={e => setCDuration(e.target.value)} /><input className="p-3 bg-gray-50 border rounded-lg text-blue-600" placeholder="Enrollment Link (Google Form)" value={cLink} onChange={e => setCLink(e.target.value)} /></div>
                    <div className="border rounded-lg overflow-hidden"><SunEditor setContents={cDesc} onChange={setCDesc} height="200px" placeholder="Course details..." setOptions={{ buttonList: [['bold', 'underline', 'list', 'align', 'link'], ['font', 'fontSize', 'fontColor']] }} /></div>
                    <div className="border border-dashed border-gray-300 p-3 rounded-lg flex items-center bg-gray-50"><span className="text-sm font-bold mr-2 text-blue-500">🖼️ Thumbnail:</span><input type="file" onChange={e => setCImage(e.target.files?.[0] || null)} className="text-xs" accept="image/*" /></div>
                    <button onClick={handleCourseSubmit} disabled={submitting} className={`w-full py-3 rounded-lg text-white font-bold shadow-md transition ${editingCourseId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{submitting ? "Processing..." : (editingCourseId ? "Update Course" : "Launch Course")}</button>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><table className="w-full text-left"><thead className="bg-gray-50 border-b"><tr><th className="p-4 text-xs font-bold text-gray-500">Thumbnail</th><th className="p-4 text-xs font-bold text-gray-500">Title</th><th className="p-4 text-xs font-bold text-gray-500">Price</th><th className="p-4 text-xs font-bold text-gray-500 text-right">Actions</th></tr></thead><tbody className="divide-y">{coursesList.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-400">No courses found.</td></tr>}{coursesList.map(course => (<tr key={course.id}><td className="p-4">{course.thumbnail_url && <img src={course.thumbnail_url} className="w-16 h-10 object-cover rounded" />}</td><td className="p-4 font-bold">{course.title}</td><td className="p-4 text-sm text-green-600 font-bold">{course.price}</td><td className="p-4 text-right"><button onClick={() => { setEditingCourseId(course.id); setCTitle(course.title); setCInstructor(course.instructor); setCPrice(course.price); setCDuration(course.duration); setCLink(course.enrollment_link); setCDesc(course.description); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-blue-600 font-bold text-sm mr-4">Edit</button><button onClick={() => deleteItem('courses', course.id, fetchCourses)} className="text-red-500 font-bold text-sm">Delete</button></td></tr>))}</tbody></table></div>
          </div>
        )}

        {/* --- TAB 5: NEWS CMS --- */}
        {activeTab === 'news' && (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">📰 News CMS</h2>
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-[70%] space-y-4"><input className="w-full text-3xl font-bold p-4 bg-white border border-gray-200 rounded-lg outline-none placeholder-gray-300 focus:border-blue-500 transition" placeholder="Add Title" value={newsTitle} onChange={e => setNewsTitle(e.target.value)}/><div className="bg-white rounded-lg border border-gray-200 overflow-hidden"><SunEditor setContents={newsContent} onChange={setNewsContent} height="450px" setOptions={{ buttonList: [['undo', 'redo'], ['font', 'fontSize', 'formatBlock'], ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'], ['removeFormat'], ['fontColor', 'hiliteColor'], ['outdent', 'indent'], ['align', 'horizontalRule', 'list', 'lineHeight'], ['table', 'link', 'image', 'video'], ['fullScreen', 'showBlocks', 'codeView']] }} /></div></div>
                <div className="lg:w-[30%] space-y-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200"><h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Publish</h3>{editingId && <div className="mb-4 p-2 bg-yellow-50 text-yellow-800 text-sm rounded font-bold">Editing ID: {editingId}</div>}<div className="flex gap-2">{editingId && <button onClick={cancelEdit} className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded">Cancel</button>}<button onClick={handleNewsSubmit} disabled={submitting} className={`flex-1 py-2 rounded text-white font-bold shadow-md transition ${editingId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{submitting ? "Saving..." : (editingId ? "Update" : "Publish")}</button></div></div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200"><h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Categories</h3><select className="w-full p-2 bg-gray-50 border rounded text-sm mb-3" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}><option value="General">General</option>{categoryList.map(cat => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}</select><div className="flex gap-2"><input className="flex-1 p-2 border rounded text-xs" placeholder="New Category" value={newCategoryInput} onChange={e => setNewCategoryInput(e.target.value)} /><button onClick={createCategory} className="bg-gray-100 px-3 py-1 rounded text-xs font-bold">Add</button></div></div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200"><h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Tags</h3><textarea className="w-full p-2 border rounded text-sm h-20" placeholder="Tags (comma separated)" value={newsTags} onChange={e => setNewsTags(e.target.value)}></textarea></div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200"><h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Featured Image</h3><input type="file" onChange={(e) => setNewsFile(e.target.files?.[0] || null)} className="w-full text-xs"/></div>
                </div>
            </div>
            <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><table className="w-full text-left"><thead className="bg-gray-50 border-b"><tr><th className="p-4 text-xs font-bold text-gray-500">Title</th><th className="p-4 text-xs font-bold text-gray-500">Category</th><th className="p-4 text-xs font-bold text-gray-500 text-right">Actions</th></tr></thead><tbody className="divide-y">{newsList.map(item => (<tr key={item.id}><td className="p-4 font-bold">{item.title}</td><td className="p-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">{item.category}</span></td><td className="p-4 text-right"><button onClick={() => loadForEdit(item)} className="text-blue-600 font-bold text-sm mr-4">Edit</button><button onClick={() => deleteItem('news', item.id, fetchNews)} className="text-red-500 font-bold text-sm">Delete</button></td></tr>))}</tbody></table></div>
          </div>
        )}
      </main>
    </div>
  );
}