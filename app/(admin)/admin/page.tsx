"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

// Import SunEditor CSS
import 'suneditor/dist/css/suneditor.min.css'; 

// Dynamic Import for Editor
const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
});

// --- GLOBAL EDITOR CONFIGURATION ---
const fullToolbarOptions = {
    minHeight: "400px",
    buttonList: [
        ['undo', 'redo'],
        ['font', 'fontSize', 'formatBlock'],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['removeFormat'],
        ['fontColor', 'hiliteColor'],
        ['outdent', 'indent'],
        ['align', 'horizontalRule', 'list', 'lineHeight'],
        ['table', 'link', 'image', 'video'],
        ['fullScreen', 'showBlocks', 'codeView'],
        ['preview', 'print']
    ],
    defaultTag: "div",
    showPathLabel: false,
};

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("materials"); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. DATA STATE ---
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [ebooksList, setEbooksList] = useState<any[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);

  // --- 2. SELECTIONS ---
  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  // --- 3. UI STATES ---
  const [submitting, setSubmitting] = useState(false);
  const [isBlogEditorOpen, setIsBlogEditorOpen] = useState(false);

  // --- 4. INPUTS: STRUCTURE ---
  const [newSegment, setNewSegment] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newSubject, setNewSubject] = useState("");

  // --- 5. INPUTS: RESOURCES & BLOGS ---
  const [resTitle, setResTitle] = useState("");
  const [resLink, setResLink] = useState("");
  const [resFile, setResFile] = useState<File | null>(null);
  const [resType, setResType] = useState("pdf");
  
  // Content & SEO
  const [richContent, setRichContent] = useState(""); 
  const [questionContent, setQuestionContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [blogImageFile, setBlogImageFile] = useState<File | null>(null);
  const [blogTags, setBlogTags] = useState("");
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);

  // --- 6. INPUTS: NEWS ---
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState(""); 
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [newCategoryInput, setNewCategoryInput] = useState(""); 
  const [newsTags, setNewsTags] = useState(""); 
  const [newsFile, setNewsFile] = useState<File | null>(null);
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);

  // --- 7. INPUTS: EBOOKS ---
  const [ebTitle, setEbTitle] = useState("");
  const [ebAuthor, setEbAuthor] = useState("");
  const [ebCategory, setEbCategory] = useState("SSC");
  const [ebDescription, setEbDescription] = useState(""); 
  const [ebTags, setEbTags] = useState("");
  const [editingEbookId, setEditingEbookId] = useState<number | null>(null);

  // --- 8. INPUTS: COURSES ---
  const [cTitle, setCTitle] = useState("");
  const [cInstructor, setCInstructor] = useState("");
  const [cPrice, setCPrice] = useState("");
  const [cDiscountPrice, setCDiscountPrice] = useState("");
  const [cDuration, setCDuration] = useState("");
  const [cLink, setCLink] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [cImage, setCImage] = useState<File | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { setIsAuthenticated(true); loadAllData(); } 
      else { router.push("/login"); }
      setIsLoading(false);
    };
    checkSession();
  }, [router]);

  const loadAllData = useCallback(() => {
    fetchSegments(); fetchNews(); fetchCategories(); fetchEbooks(); fetchCourses();
  }, []);

  // --- FETCHERS ---
  async function fetchSegments() { const { data } = await supabase.from("segments").select("*").order('id'); setSegments(data || []); }
  async function fetchGroups(segmentId: string) { const { data } = await supabase.from("groups").select("*").eq("segment_id", segmentId).order('id'); setGroups(data || []); }
  async function fetchSubjects(groupId: string) { const { data } = await supabase.from("subjects").select("*").eq("group_id", groupId).order('id'); setSubjects(data || []); }
  async function fetchResources(subjectId: string) { const { data } = await supabase.from("resources").select("*").eq("subject_id", subjectId).order('created_at', { ascending: false }); setResources(data || []); }
  async function fetchNews() { const { data } = await supabase.from("news").select("*").order('created_at', { ascending: false }); setNewsList(data || []); }
  async function fetchCategories() { const { data } = await supabase.from("categories").select("*").order('name'); setCategoryList(data || []); }
  async function fetchEbooks() { const { data } = await supabase.from("ebooks").select("*").order('created_at', { ascending: false }); setEbooksList(data || []); }
  async function fetchCourses() { const { data } = await supabase.from("courses").select("*").order('created_at', { ascending: false }); setCoursesList(data || []); }

  // --- HANDLERS ---
  const handleSegmentClick = (id: string) => {
    setSelectedSegment(id); setSelectedGroup(""); setSelectedSubject(""); 
    setGroups([]); setSubjects([]); setResources([]);
    fetchGroups(id);
  };
  
  const handleGroupClick = (id: string) => {
    setSelectedGroup(id); setSelectedSubject(""); 
    setSubjects([]); setResources([]);
    fetchGroups(selectedSegment); fetchSubjects(id);
  };
  
  const handleSubjectClick = (id: string) => {
    setSelectedSubject(id);
    fetchResources(id);
  };

  async function handleLogout() { await supabase.auth.signOut(); router.push("/login"); }
  
  async function deleteItem(table: string, id: number, refreshCallback: () => void) {
    if(!confirm("Are you sure? This cannot be undone.")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if(error) alert("Delete Failed: " + error.message); else refreshCallback();
  }

  // --- STRUCTURE SUBMIT ---
  async function handleSegmentSubmit() {
    if(!newSegment) return alert("Title Required");
    await supabase.from('segments').insert([{ title: newSegment, slug: newSegment.toLowerCase().replace(/\s+/g, '-') }]);
    setNewSegment(""); fetchSegments();
  }
  async function handleGroupSubmit() {
    if(!newGroup || !selectedSegment) return alert("Group & Segment Required");
    await supabase.from('groups').insert([{ title: newGroup, slug: newGroup.toLowerCase().replace(/\s+/g, '-'), segment_id: Number(selectedSegment) }]);
    setNewGroup(""); fetchGroups(selectedSegment);
  }
  async function handleSubjectSubmit() {
    if(!newSubject || !selectedGroup) return alert("Subject & Group Required");
    await supabase.from('subjects').insert([{ title: newSubject, slug: newSubject.toLowerCase().replace(/\s+/g, '-'), group_id: Number(selectedGroup), segment_id: Number(selectedSegment) }]);
    setNewSubject(""); fetchSubjects(selectedGroup);
  }

  // --- RESOURCE LOGIC ---
  function resetResourceForm() {
      setEditingResourceId(null); setResTitle(""); setResLink(""); setResFile(null); 
      setRichContent(""); setQuestionContent(""); setSeoTitle(""); setSeoDescription(""); 
      setBlogImageFile(null); setBlogTags(""); setResType("pdf");
      setIsBlogEditorOpen(false); 
  }

  function loadResourceForEdit(r: any) {
      setEditingResourceId(r.id); setResTitle(r.title); setResType(r.type);
      setResLink(""); setRichContent(""); setQuestionContent(""); setSeoTitle(""); setSeoDescription(""); setBlogTags("");
      
      if (r.type === 'video' || r.type === 'pdf') setResLink(r.content_url || "");
      if (r.type === 'question') { setQuestionContent(r.content_body || ""); setSeoTitle(r.seo_title || ""); setSeoDescription(r.seo_description || ""); }
      if (r.type === 'blog') { 
          setRichContent(r.content_body || ""); 
          setBlogTags(r.tags ? r.tags.join(", ") : ""); 
          setIsBlogEditorOpen(true);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function uploadResource(typeOverride?: string) {
    const finalType = typeOverride || resType;
    if (!resTitle || !selectedSubject) return alert("Title and Subject Required");
    
    if (finalType === 'question' && !questionContent) return alert("Question content is required");
    if (finalType === 'blog' && !richContent) return alert("Blog content is required");

    setSubmitting(true);
    let finalUrl = resLink;
    let fileToUpload = null; 
    if (finalType === 'pdf') fileToUpload = resFile; 
    if (finalType === 'blog') fileToUpload = blogImageFile;

    if (fileToUpload) {
        const fileName = `${finalType}-${Date.now()}-${fileToUpload.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
        await supabase.storage.from('materials').upload(fileName, fileToUpload);
        finalUrl = supabase.storage.from('materials').getPublicUrl(fileName).data.publicUrl;
    }

    const payload: any = { subject_id: Number(selectedSubject), title: resTitle, type: finalType };
    
    if (finalType === 'pdf' || finalType === 'video') {
        payload.content_url = finalUrl;
    } else if (finalType === 'question') {
        payload.content_body = questionContent; 
        payload.seo_title = seoTitle || resTitle; 
        payload.seo_description = seoDescription;
    } else if (finalType === 'blog') {
        payload.content_body = richContent;
        if(finalUrl) payload.content_url = finalUrl; 
        payload.tags = blogTags.split(',').map(t=>t.trim()).filter(t=>t!=="");
    }

    if (editingResourceId) await supabase.from('resources').update(payload).eq('id', editingResourceId);
    else await supabase.from('resources').insert([payload]);
    
    fetchResources(selectedSubject);
    if(finalType !== 'blog') resetResourceForm(); 
    else alert("Blog Published!");
    
    setSubmitting(false);
  }

  // --- NEWS LOGIC ---
  async function createCategory() {
    if (!newCategoryInput) return;
    await supabase.from('categories').insert([{ name: newCategoryInput }]);
    setNewCategoryInput(""); fetchCategories(); setSelectedCategory(newCategoryInput);
  }

  function loadNewsForEdit(item: any) { 
      setNewsTitle(item.title); setNewsContent(item.content); 
      setSelectedCategory(item.category || "General"); 
      setNewsTags(item.tags ? item.tags.join(", ") : ""); 
      setEditingNewsId(item.id); window.scrollTo({ top: 0, behavior: 'smooth' }); 
  }
  
  function cancelNewsEdit() { 
      setNewsTitle(""); setNewsContent(""); setSelectedCategory("General"); 
      setNewsTags(""); setEditingNewsId(null); 
  }

  async function handleNewsSubmit() {
    if (!newsTitle) return alert("Title required"); setSubmitting(true);
    let imageUrl = null;
    if (newsFile) {
        const n = `news-${Date.now()}-${newsFile.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
        await supabase.storage.from('materials').upload(n, newsFile);
        imageUrl = supabase.storage.from('materials').getPublicUrl(n).data.publicUrl;
    }
    const tags = newsTags.split(',').map(t => t.trim()).filter(t => t !== "");
    const p: any = { title: newsTitle, content: newsContent, category: selectedCategory, tags: tags };
    if (imageUrl) p.image_url = imageUrl;
    if (editingNewsId) await supabase.from('news').update(p).eq('id', editingNewsId); else await supabase.from('news').insert([p]);
    fetchNews(); cancelNewsEdit(); setSubmitting(false);
  }

  // --- EBOOK LOGIC ---
  function loadEbookForEdit(b:any) { 
      setEbTitle(b.title); setEbAuthor(b.author||""); setEbCategory(b.category||"SSC"); 
      setEbDescription(b.description||""); setEbTags(b.tags?b.tags.join(", "):""); 
      setEditingEbookId(b.id); window.scrollTo({top:0,behavior:'smooth'}); 
  }
  
  function cancelEbookEdit() { 
      setEbTitle(""); setEbAuthor(""); setEbCategory("SSC"); 
      setEbDescription(""); setEbTags(""); setEditingEbookId(null); 
  }

  async function handleEbookSubmit() { 
      if(!ebTitle) return alert("Title Required"); setSubmitting(true); 
      const pdf=(document.getElementById('eb-file')as HTMLInputElement)?.files?.[0]; 
      const cover=(document.getElementById('eb-cover')as HTMLInputElement)?.files?.[0]; 
      let pdfUrl=null; let coverUrl=null; 
      if(pdf){ const n=`pdf-${Date.now()}`; await supabase.storage.from('materials').upload(n,pdf); pdfUrl=supabase.storage.from('materials').getPublicUrl(n).data.publicUrl; } 
      if(cover){ const n=`cover-${Date.now()}`; await supabase.storage.from('covers').upload(n,cover); coverUrl=supabase.storage.from('covers').getPublicUrl(n).data.publicUrl; } 
      const tags=ebTags.split(',').map(t=>t.trim()).filter(t=>t!==""); 
      const p:any={title:ebTitle,author:ebAuthor,category:ebCategory,description:ebDescription,tags}; 
      if(pdfUrl) p.pdf_url=pdfUrl; if(coverUrl) p.cover_url=coverUrl; 
      if(editingEbookId){ await supabase.from('ebooks').update(p).eq('id',editingEbookId); alert("Updated"); cancelEbookEdit(); fetchEbooks(); } 
      else { if(!pdfUrl) {alert("PDF Required"); setSubmitting(false); return;} p.pdf_url=pdfUrl; await supabase.from('ebooks').insert([p]); alert("Created"); cancelEbookEdit(); fetchEbooks(); } 
      setSubmitting(false); 
  }

  // --- COURSE LOGIC ---
  function loadCourseForEdit(c:any) { 
      setEditingCourseId(c.id); setCTitle(c.title); setCInstructor(c.instructor); 
      setCPrice(c.price); setCDiscountPrice(c.discount_price||""); 
      setCDuration(c.duration); setCLink(c.enrollment_link); setCDesc(c.description); 
      window.scrollTo({top:0,behavior:'smooth'}); 
  }

  async function handleCourseSubmit() { 
      if(!cTitle) return alert("Title Required"); setSubmitting(true); 
      let thumb=null; 
      if(cImage){ const n=`course-${Date.now()}`; await supabase.storage.from('materials').upload(n,cImage); thumb=supabase.storage.from('materials').getPublicUrl(n).data.publicUrl; } 
      const p:any={title:cTitle,instructor:cInstructor,price:cPrice,discount_price:cDiscountPrice,duration:cDuration,enrollment_link:cLink,description:cDesc}; 
      if(thumb) p.thumbnail_url=thumb; 
      if(editingCourseId){ await supabase.from('courses').update(p).eq('id',editingCourseId); alert("Updated"); } 
      else { if(!thumb){ alert("Thumb Required"); setSubmitting(false); return; } p.thumbnail_url=thumb; await supabase.from('courses').insert([p]); alert("Created"); } 
      setSubmitting(false); setEditingCourseId(null); 
      setCTitle(""); setCInstructor(""); setCPrice(""); setCDiscountPrice(""); 
      setCDuration(""); setCLink(""); setCDesc(""); setCImage(null); 
      fetchCourses(); 
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-bold">Loading Dashboard...</div>;
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans text-gray-900">
      
      {/* SIDEBAR (FIXED OVERLAP ISSUE) */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed top-20 bottom-0 z-10 hidden md:flex flex-col shadow-lg overflow-y-auto">
        <div className="p-8 border-b border-gray-100">
            {/* Removed the large logo from sidebar to avoid redundancy with Top Navbar */}
            <p className="text-xs text-gray-400 font-bold tracking-wider uppercase">Admin Command Center</p>
        </div>
        <nav className="flex-1 p-6 space-y-2">
            {[
                { id: 'materials', label: '🗂 Study Materials' },
                { id: 'class-blogs', label: '✍️ Class Blogs' },
                { id: 'ebooks', label: '📚 Manage eBooks' },
                { id: 'courses', label: '🎓 Manage Courses' },
                { id: 'news', label: '📰 News CMS' },
            ].map((tab) => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)} 
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all duration-200 text-sm ${
                        activeTab === tab.id 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </nav>
        <div className="p-6 border-t border-gray-100">
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
                <span>🚪</span> Sign Out
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER (FIXED OVERLAP ISSUE) */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 lg:p-10 pt-28 overflow-x-hidden">
        
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-8">
            <h1 className="text-xl font-extrabold text-blue-900">Admin Panel</h1>
            <button onClick={handleLogout} className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-lg">Sign Out</button>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
             {['materials','class-blogs','ebooks','courses','news'].map(t => (
                 <button key={t} onClick={() => setActiveTab(t)} className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap ${activeTab === t ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>{t.toUpperCase()}</button>
             ))}
        </div>

        {/* ========================== */}
        {/* TAB 1: STUDY MATERIALS     */}
        {/* ========================== */}
        {activeTab === 'materials' && (
          <div className="animate-fade-in-up">
            
            {/* 1. SELECTION GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                {/* SEGMENTS */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">1. Segments</h3>
                    <div className="flex gap-2 mb-4">
                        <input className="bg-gray-50 border border-gray-200 p-3 rounded-lg w-full text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" value={newSegment} onChange={e=>setNewSegment(e.target.value)} placeholder="Title (e.g. SSC)" />
                        <button onClick={handleSegmentSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg font-bold text-lg shadow-blue-200 shadow-lg">+</button>
                    </div>
                    <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {segments.map(s => (
                            <li key={s.id} onClick={() => handleSegmentClick(s.id)} className={`p-3 rounded-lg cursor-pointer flex justify-between items-center text-sm font-bold transition-all ${selectedSegment === s.id ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                                <span>{s.title}</span>
                                <button onClick={(e) => {e.stopPropagation(); deleteItem('segments', s.id, fetchSegments)}} className="text-gray-300 hover:text-red-500 px-2">✕</button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* GROUPS */}
                <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${!selectedSegment ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">2. Groups</h3>
                    <div className="flex gap-2 mb-4">
                        <input className="bg-gray-50 border border-gray-200 p-3 rounded-lg w-full text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none" value={newGroup} onChange={e=>setNewGroup(e.target.value)} placeholder="Title (e.g. Science)" />
                        <button onClick={handleGroupSubmit} className="bg-green-600 hover:bg-green-700 text-white px-4 rounded-lg font-bold text-lg shadow-green-200 shadow-lg">+</button>
                    </div>
                    <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {groups.map(g => (
                            <li key={g.id} onClick={() => handleGroupClick(g.id)} className={`p-3 rounded-lg cursor-pointer flex justify-between items-center text-sm font-bold transition-all ${selectedGroup === g.id ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                                <span>{g.title}</span>
                                <button onClick={(e) => {e.stopPropagation(); deleteItem('groups', g.id, () => fetchGroups(selectedSegment))}} className="text-gray-300 hover:text-red-500 px-2">✕</button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* SUBJECTS */}
                <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${!selectedGroup ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">3. Subjects</h3>
                    <div className="flex gap-2 mb-4">
                        <input className="bg-gray-50 border border-gray-200 p-3 rounded-lg w-full text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none" value={newSubject} onChange={e=>setNewSubject(e.target.value)} placeholder="Title (e.g. Physics)" />
                        <button onClick={handleSubjectSubmit} className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-lg font-bold text-lg shadow-purple-200 shadow-lg">+</button>
                    </div>
                    <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {subjects.map(s => (
                            <li key={s.id} onClick={() => handleSubjectClick(s.id)} className={`p-3 rounded-lg cursor-pointer flex justify-between items-center text-sm font-bold transition-all ${selectedSubject === s.id ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                                <span>{s.title}</span>
                                <button onClick={(e) => {e.stopPropagation(); deleteItem('subjects', s.id, () => fetchSubjects(selectedGroup))}} className="text-gray-300 hover:text-red-500 px-2">✕</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* 2. RESOURCE UPLOADER & LIST */}
            <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${!selectedSubject ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                        Upload Content for Subject ID: {selectedSubject}
                    </h3>
                    {editingResourceId && (
                        <button onClick={resetResourceForm} className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-100 hover:bg-red-100 transition">
                            Cancel Editing
                        </button>
                    )}
                </div>
                
                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                    
                    {/* LEFT: FORM */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Content Type</label>
                                <select 
                                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={resType} 
                                    onChange={(e)=>setResType(e.target.value)}
                                >
                                    <option value="pdf">📄 PDF Document</option>
                                    <option value="video">🎬 Video Class</option>
                                    <option value="question">❓ Board Question</option>
                                    <option value="blog">✍️ Subject Blog</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Content Title</label>
                                <input 
                                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={resTitle} 
                                    onChange={e=>setResTitle(e.target.value)} 
                                    placeholder="e.g. Chapter 1 Notes" 
                                />
                            </div>
                        </div>

                        {/* TYPE SPECIFIC INPUTS */}
                        {resType === 'pdf' && (
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition bg-white">
                                <span className="block text-2xl mb-2">📂</span>
                                <label className="text-sm font-bold text-blue-600 cursor-pointer hover:underline">
                                    Click to Upload PDF
                                    <input type="file" onChange={(e) => setResFile(e.target.files?.[0] || null)} className="hidden" accept="application/pdf"/>
                                </label>
                                <p className="text-xs text-gray-400 mt-1">{resFile ? resFile.name : "No file selected"}</p>
                            </div>
                        )}

                        {resType === 'video' && (
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">YouTube Link</label>
                                <input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl" value={resLink} onChange={e=>setResLink(e.target.value)} placeholder="https://youtube.com/..." />
                            </div>
                        )}

                        {resType === 'question' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    <SunEditor 
                                        setContents={questionContent}
                                        onChange={setQuestionContent} 
                                        setOptions={fullToolbarOptions}
                                        placeholder="Type the question content here..."
                                    />
                                </div>
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">SEO Optimization</h4>
                                    <input className="w-full bg-white border border-blue-200 p-2 rounded-lg text-sm mb-2" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="Meta Title (Optional)" />
                                    <textarea className="w-full bg-white border border-blue-200 p-2 rounded-lg text-sm" rows={2} value={seoDescription} onChange={e => setSeoDescription(e.target.value)} placeholder="Meta Description (Optional)"></textarea>
                                </div>
                            </div>
                        )}

                        {resType === 'blog' && (
                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-sm text-yellow-800 font-medium">
                                💡 To write a full blog post, please switch to the <strong>"✍️ Class Blogs"</strong> tab on the left sidebar for the dedicated editor.
                            </div>
                        )}

                        {resType !== 'blog' && (
                            <button 
                                onClick={() => uploadResource()} 
                                disabled={submitting}
                                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-transform transform active:scale-95 flex items-center justify-center gap-2 ${editingResourceId ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                            >
                                {submitting ? "Processing..." : (editingResourceId ? "Update Resource" : "Save Resource")}
                            </button>
                        )}
                    </div>

                    {/* RIGHT: LIST */}
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex flex-col h-[500px]">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Library Content</h4>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                            {resources.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <span className="text-4xl mb-2">📭</span>
                                    <p className="text-sm">No resources yet.</p>
                                </div>
                            )}
                            {resources.map(r => (
                                <div key={r.id} className={`bg-white p-4 rounded-xl border transition-all flex justify-between items-center group ${editingResourceId === r.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100 hover:border-blue-300 hover:shadow-sm'}`}>
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${r.type === 'pdf' ? 'bg-red-100 text-red-600' : r.type === 'video' ? 'bg-red-600 text-white' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {r.type === 'pdf' ? '📄' : r.type === 'video' ? '▶' : '❓'}
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-gray-800 text-sm truncate w-40">{r.title}</h5>
                                            <span className="text-xs text-gray-400 capitalize">{r.type}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => loadResourceForEdit(r)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">✏️</button>
                                        <button onClick={() => deleteItem('resources', r.id, () => fetchResources(selectedSubject))} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
          </div>
        )}

        {/* ========================== */}
        {/* TAB 2: CLASS BLOGS (NEW UI)*/}
        {/* ========================== */}
        {activeTab === 'class-blogs' && (
          <div className="animate-fade-in-up h-full">
            
            {/* VIEW 1: LIST VIEW */}
            {!isBlogEditorOpen && (
                <div>
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-900">Class Blogs</h2>
                            <p className="text-gray-500 mt-1">Manage educational articles for specific subjects.</p>
                        </div>
                        <button 
                            onClick={() => { resetResourceForm(); setIsBlogEditorOpen(true); setResType('blog'); }}
                            className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                        >
                            <span>+</span> Write New Blog
                        </button>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-8">
                        <select className="p-3 bg-gray-50 border-transparent rounded-lg font-bold text-gray-600 focus:bg-white focus:ring-2 focus:ring-black transition" value={selectedSegment} onChange={(e) => handleSegmentClick(e.target.value)}>
                            <option value="">1. Filter by Segment</option>
                            {segments.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                        </select>
                        <select className="p-3 bg-gray-50 border-transparent rounded-lg font-bold text-gray-600 focus:bg-white focus:ring-2 focus:ring-black transition" value={selectedGroup} onChange={(e) => handleGroupClick(e.target.value)} disabled={!selectedSegment}>
                            <option value="">2. Filter by Group</option>
                            {groups.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                        </select>
                        <select className="p-3 bg-gray-50 border-transparent rounded-lg font-bold text-gray-600 focus:bg-white focus:ring-2 focus:ring-black transition" value={selectedSubject} onChange={(e) => handleSubjectClick(e.target.value)} disabled={!selectedGroup}>
                            <option value="">3. Filter by Subject</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                        </select>
                    </div>

                    {/* Blog Grid */}
                    {!selectedSubject ? (
                        <div className="text-center py-32 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50">
                            <div className="text-6xl mb-4">👈</div>
                            <h3 className="text-xl font-bold text-gray-400">Select a Subject to view blogs</h3>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {resources.filter(r => r.type === 'blog').length === 0 && (
                                <div className="col-span-full text-center py-20 text-gray-400">No blogs found for this subject.</div>
                            )}
                            {resources.filter(r => r.type === 'blog').map(blog => (
                                <div key={blog.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col">
                                    <div className="h-40 bg-gray-100 relative">
                                        {blog.content_url ? (
                                            <img src={blog.content_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">No Image</div>
                                        )}
                                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => loadResourceForEdit(blog)} className="bg-white p-2 rounded-lg shadow text-blue-600 hover:text-blue-700">✏️</button>
                                            <button onClick={(e) => { e.stopPropagation(); deleteItem('resources', blog.id, () => fetchResources(selectedSubject)); }} className="bg-white p-2 rounded-lg shadow text-red-600 hover:text-red-700">🗑️</button>
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-lg text-gray-800 leading-tight mb-2 line-clamp-2">{blog.title}</h3>
                                        <div className="mt-auto text-xs text-gray-400 font-medium">
                                            {new Date(blog.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* VIEW 2: FULL EDITOR VIEW */}
            {isBlogEditorOpen && (
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden min-h-screen flex flex-col">
                    <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <button onClick={() => setIsBlogEditorOpen(false)} className="text-sm font-bold text-gray-500 hover:text-black flex items-center gap-2">
                            ← Back to List
                        </button>
                        <div className="flex gap-4">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest self-center">
                                {editingResourceId ? 'Editing Post' : 'New Draft'}
                            </span>
                            <button 
                                onClick={() => uploadResource('blog')} 
                                disabled={submitting}
                                className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-green-200 transition-transform active:scale-95"
                            >
                                {submitting ? "Publishing..." : "Publish Blog Post"}
                            </button>
                        </div>
                    </div>

                    <div className="p-10 max-w-5xl mx-auto w-full space-y-8">
                        {/* Title */}
                        <input 
                            className="w-full text-4xl font-black text-gray-900 placeholder-gray-300 border-none focus:ring-0 outline-none p-0 bg-transparent" 
                            placeholder="Enter your blog title here..." 
                            value={resTitle} 
                            onChange={e => setResTitle(e.target.value)} 
                        />
                        
                        {/* Editor */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-inner min-h-[500px]">
                            <SunEditor 
                                setContents={richContent} 
                                onChange={setRichContent} 
                                setOptions={{ ...fullToolbarOptions, minHeight: "500px" }} 
                            />
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Featured Image</label>
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer">
                                    <input type="file" onChange={(e) => setBlogImageFile(e.target.files?.[0] || null)} className="hidden" id="blog-img" accept="image/*" />
                                    <label htmlFor="blog-img" className="cursor-pointer">
                                        <span className="text-3xl block mb-2">🖼️</span>
                                        <span className="text-sm font-bold text-gray-500">Click to upload cover</span>
                                        {blogImageFile && <p className="text-xs text-green-600 mt-2 font-bold">{blogImageFile.name}</p>}
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Tags & Keywords</label>
                                <textarea 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                                    placeholder="e.g. Physics, Motion, HSC 2025 (Comma separated)"
                                    value={blogTags}
                                    onChange={e => setBlogTags(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            )}
          </div>
        )}

        {/* ========================== */}
        {/* TAB 3: eBOOKS MANAGER      */}
        {/* ========================== */}
        {activeTab === 'ebooks' && (
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Digital Library</h2>
            
            <div className="flex flex-col xl:flex-row gap-8">
                {/* Form */}
                <div className="xl:w-1/3 bg-white p-8 rounded-3xl shadow-lg border border-gray-100 h-fit">
                    <h3 className="font-bold text-gray-800 mb-6 flex justify-between items-center">
                        {editingEbookId ? "Edit eBook" : "Add New eBook"}
                        {editingEbookId && <button onClick={cancelEbookEdit} className="text-xs text-red-500">Cancel</button>}
                    </h3>
                    <div className="space-y-5">
                        <input className="w-full p-3 bg-gray-50 border rounded-xl font-bold" placeholder="Book Title" value={ebTitle} onChange={e=>setEbTitle(e.target.value)} />
                        <div className="grid grid-cols-2 gap-4">
                            <input className="w-full p-3 bg-gray-50 border rounded-xl text-sm" placeholder="Author" value={ebAuthor} onChange={e=>setEbAuthor(e.target.value)} />
                            <select className="w-full p-3 bg-gray-50 border rounded-xl text-sm" value={ebCategory} onChange={e=>setEbCategory(e.target.value)}><option>SSC</option><option>HSC</option><option>Admission</option></select>
                        </div>
                        <div className="border rounded-xl overflow-hidden">
                            <SunEditor setContents={ebDescription} onChange={setEbDescription} setOptions={{...fullToolbarOptions, minHeight: "150px", buttonList: [['bold', 'italic', 'list']]}} />
                        </div>
                        <input className="w-full p-3 bg-gray-50 border rounded-xl text-sm" placeholder="Tags..." value={ebTags} onChange={e=>setEbTags(e.target.value)} />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="border border-dashed p-3 rounded-xl text-center"><span className="block text-xs font-bold text-red-500 mb-1">PDF File</span><input type="file" id="eb-file" className="w-full text-[10px]" accept="application/pdf"/></div>
                            <div className="border border-dashed p-3 rounded-xl text-center"><span className="block text-xs font-bold text-blue-500 mb-1">Cover Image</span><input type="file" id="eb-cover" className="w-full text-[10px]" accept="image/*"/></div>
                        </div>

                        <button onClick={handleEbookSubmit} disabled={submitting} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition">{submitting ? "Processing..." : "Save eBook"}</button>
                    </div>
                </div>

                {/* List */}
                <div className="xl:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {ebooksList.map(book => (
                        <div key={book.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition">
                            <div className="w-20 h-28 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                                {book.cover_url ? <img src={book.cover_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-xs">No Cover</div>}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 line-clamp-1">{book.title}</h4>
                                <p className="text-xs text-gray-500 mb-2">{book.author}</p>
                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase">{book.category}</span>
                                <div className="mt-4 flex gap-3">
                                    <button onClick={() => loadEbookForEdit(book)} className="text-xs font-bold text-blue-600 border border-blue-100 px-3 py-1 rounded-lg hover:bg-blue-50">Edit</button>
                                    <button onClick={() => deleteItem('ebooks', book.id, fetchEbooks)} className="text-xs font-bold text-red-600 border border-red-100 px-3 py-1 rounded-lg hover:bg-red-50">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}

        {/* ========================== */}
        {/* TAB 4: COURSES MANAGER     */}
        {/* ========================== */}
        {activeTab === 'courses' && (
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Course Management</h2>
            
            {/* Editor Card */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mb-10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">{editingCourseId ? "Editing Course" : "Create New Course"}</h3>
                    {editingCourseId && <button onClick={() => setEditingCourseId(null)} className="text-red-500 font-bold text-sm">Cancel</button>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                        <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-lg" placeholder="Course Title" value={cTitle} onChange={e=>setCTitle(e.target.value)} />
                        <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl" placeholder="Instructor Name" value={cInstructor} onChange={e=>setCInstructor(e.target.value)} />
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs font-bold text-gray-400 uppercase">Regular Price</label><input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono" placeholder="5000" value={cPrice} onChange={e=>setCPrice(e.target.value)} /></div>
                            <div><label className="text-xs font-bold text-green-600 uppercase">Discount Price</label><input className="w-full p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl font-mono font-bold" placeholder="3500" value={cDiscountPrice} onChange={e=>setCDiscountPrice(e.target.value)} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" placeholder="Duration (e.g. 3 Months)" value={cDuration} onChange={e=>setCDuration(e.target.value)} />
                            <input className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700" placeholder="Google Form Link" value={cLink} onChange={e=>setCLink(e.target.value)} />
                        </div>
                        <div className="border border-dashed border-gray-300 p-4 rounded-xl bg-gray-50">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Course Thumbnail</label>
                            <input type="file" onChange={e => setCImage(e.target.files?.[0] || null)} className="w-full text-sm" accept="image/*" />
                        </div>
                    </div>
                    
                    {/* Rich Text Description */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-inner h-full min-h-[400px]">
                        <SunEditor setContents={cDesc} onChange={setCDesc} setOptions={{ ...fullToolbarOptions, minHeight: "400px" }} placeholder="Detailed Course Description..." />
                    </div>
                </div>

                <button onClick={handleCourseSubmit} disabled={submitting} className="w-full bg-black hover:bg-gray-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition">{submitting ? "Saving..." : (editingCourseId ? "Update Course" : "Launch Course")}</button>
            </div>

            {/* Course List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {coursesList.map(c => (
                    <div key={c.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                        <div className="h-48 bg-gray-200 relative">
                            {c.thumbnail_url && <img src={c.thumbnail_url} className="w-full h-full object-cover" />}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                <button onClick={()=>loadCourseForEdit(c)} className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm">Edit</button>
                                <button onClick={()=>deleteItem('courses', c.id, fetchCourses)} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm">Delete</button>
                            </div>
                        </div>
                        <div className="p-5">
                            <h4 className="font-bold text-lg text-gray-900 mb-1">{c.title}</h4>
                            <p className="text-sm text-gray-500 mb-4">{c.instructor}</p>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-green-600 text-lg">{c.discount_price || c.price}</span>
                                {c.discount_price && <span className="text-sm text-gray-400 line-through">{c.price}</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================== */}
        {/* TAB 5: NEWS CMS            */}
        {/* ========================== */}
        {activeTab === 'news' && (
          <div className="animate-fade-in-up">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900">Newsroom</h2>
                {editingNewsId && <button onClick={cancelNewsEdit} className="text-red-500 font-bold border px-4 py-2 rounded-lg">Cancel Edit</button>}
             </div>

             <div className="flex flex-col xl:flex-row gap-8">
                {/* Editor */}
                <div className="xl:w-2/3 space-y-6">
                    <input className="w-full text-4xl font-black bg-transparent border-b border-gray-200 pb-4 outline-none placeholder-gray-300" placeholder="Headline..." value={newsTitle} onChange={e=>setNewsTitle(e.target.value)} />
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <SunEditor setContents={newsContent} onChange={setNewsContent} setOptions={{ ...fullToolbarOptions, minHeight: "500px" }} />
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="xl:w-1/3 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <button onClick={handleNewsSubmit} disabled={submitting} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-blue-200 shadow-lg hover:bg-blue-700 transition mb-6">{submitting ? "Publishing..." : (editingNewsId ? "Update News" : "Publish Now")}</button>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Category</label>
                                <select className="w-full bg-gray-50 border rounded-lg p-3 font-bold" value={selectedCategory} onChange={e=>setSelectedCategory(e.target.value)}>
                                    <option value="General">General</option>
                                    {categoryList.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                                <div className="flex gap-2 mt-2">
                                    <input className="flex-1 bg-gray-50 border rounded-lg p-2 text-sm" placeholder="New Category" value={newCategoryInput} onChange={e=>setNewCategoryInput(e.target.value)} />
                                    <button onClick={createCategory} className="bg-black text-white px-3 rounded-lg text-sm font-bold">Add</button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Featured Image</label>
                                <input type="file" onChange={e=>setNewsFile(e.target.files?.[0]||null)} className="w-full text-xs" accept="image/*" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Tags</label>
                                <textarea className="w-full bg-gray-50 border rounded-lg p-3 text-sm h-24 resize-none" placeholder="Tags..." value={newsTags} onChange={e=>setNewsTags(e.target.value)}></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Mini List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b font-bold text-gray-500 text-sm">Recent Articles</div>
                        <div className="max-h-[400px] overflow-y-auto">
                            {newsList.map(n => (
                                <div key={n.id} className="p-4 border-b hover:bg-blue-50 cursor-pointer group flex justify-between items-center">
                                    <span className="font-medium text-sm truncate w-48">{n.title}</span>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                                        <button onClick={()=>loadNewsForEdit(n)} className="text-blue-600 text-xs font-bold">Edit</button>
                                        <button onClick={()=>deleteItem('news', n.id, fetchNews)} className="text-red-600 text-xs font-bold">Del</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
             </div>
          </div>
        )}

      </main>
    </div>
  );
}