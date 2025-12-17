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

// --- EDITOR CONFIG ---
const editorOptions = {
    minHeight: "300px",
    buttonList: [
        ['undo', 'redo'],
        ['font', 'fontSize', 'formatBlock'],
        ['bold', 'underline', 'italic', 'list', 'align'],
        ['table', 'link', 'image', 'video'],
        ['codeView', 'fullScreen']
    ],
    defaultTag: "div",
    showPathLabel: false,
};

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
  const [selectedSegment, setSelectedSegment] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // --- UI FLAGS ---
  const [submitting, setSubmitting] = useState(false);
  const [isBlogEditorOpen, setIsBlogEditorOpen] = useState(false);

  // --- FORM INPUTS ---
  const [newSegment, setNewSegment] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newSubject, setNewSubject] = useState("");
  
  // Resource Form
  const [resTitle, setResTitle] = useState("");
  const [resLink, setResLink] = useState("");
  const [resFile, setResFile] = useState<File | null>(null);
  const [resType, setResType] = useState("pdf");
  const [richContent, setRichContent] = useState(""); 
  const [questionContent, setQuestionContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);
  const [blogImageFile, setBlogImageFile] = useState<File | null>(null);
  const [blogTags, setBlogTags] = useState("");

  // News Form
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState(""); 
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [newCategoryInput, setNewCategoryInput] = useState(""); 
  const [newsTags, setNewsTags] = useState(""); 
  const [newsFile, setNewsFile] = useState<File | null>(null);
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);

  // eBook Form
  const [ebTitle, setEbTitle] = useState("");
  const [ebAuthor, setEbAuthor] = useState("");
  const [ebCategory, setEbCategory] = useState("SSC");
  const [ebDescription, setEbDescription] = useState(""); 
  const [ebTags, setEbTags] = useState("");
  const [editingEbookId, setEditingEbookId] = useState<number | null>(null);

  // Course Form
  const [cTitle, setCTitle] = useState("");
  const [cInstructor, setCInstructor] = useState("");
  const [cPrice, setCPrice] = useState("");
  const [cDiscountPrice, setCDiscountPrice] = useState("");
  const [cDuration, setCDuration] = useState("");
  const [cLink, setCLink] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [cImage, setCImage] = useState<File | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);

  // --- INIT ---
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { setIsAuthenticated(true); loadAllData(); } 
      else { router.push("/login"); }
      setIsLoading(false);
    };
    init();
  }, [router]);

  const loadAllData = useCallback(() => {
    fetchSegments(); fetchNews(); fetchCategories(); fetchEbooks(); fetchCourses();
  }, []);

  // --- FETCHERS ---
  const fetchSegments = async () => { const {data} = await supabase.from("segments").select("*").order('id'); setSegments(data||[]); };
  const fetchGroups = async (segId: string) => { const {data} = await supabase.from("groups").select("*").eq("segment_id", segId).order('id'); setGroups(data||[]); };
  const fetchSubjects = async (grpId: string) => { const {data} = await supabase.from("subjects").select("*").eq("group_id", grpId).order('id'); setSubjects(data||[]); };
  const fetchResources = async (subId: string) => { const {data} = await supabase.from("resources").select("*").eq("subject_id", subId).order('created_at',{ascending:false}); setResources(data||[]); };
  const fetchNews = async () => { const {data} = await supabase.from("news").select("*").order('created_at',{ascending:false}); setNewsList(data||[]); };
  const fetchCategories = async () => { const {data} = await supabase.from("categories").select("*").order('name'); setCategoryList(data||[]); };
  const fetchEbooks = async () => { const {data} = await supabase.from("ebooks").select("*").order('created_at',{ascending:false}); setEbooksList(data||[]); };
  const fetchCourses = async () => { const {data} = await supabase.from("courses").select("*").order('created_at',{ascending:false}); setCoursesList(data||[]); };

  // --- ACTIONS ---
  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };
  
  const deleteItem = async (table: string, id: number, refresh: () => void) => {
    if(!confirm("Delete this item? This cannot be undone.")) return;
    await supabase.from(table).delete().eq("id", id);
    refresh();
  };

  // --- HIERARCHY LOGIC ---
  const handleSegmentClick = (id: string) => { setSelectedSegment(id); setSelectedGroup(""); setSelectedSubject(""); setGroups([]); setSubjects([]); setResources([]); fetchGroups(id); };
  const handleGroupClick = (id: string) => { setSelectedGroup(id); setSelectedSubject(""); setSubjects([]); setResources([]); fetchGroups(selectedSegment); fetchSubjects(id); };
  const handleSubjectClick = (id: string) => { setSelectedSubject(id); fetchResources(id); };

  const handleSegmentSubmit = async () => { if(!newSegment) return; await supabase.from('segments').insert([{title:newSegment, slug:newSegment.toLowerCase().replace(/\s+/g,'-')}]); setNewSegment(""); fetchSegments(); };
  const handleGroupSubmit = async () => { if(!newGroup || !selectedSegment) return; await supabase.from('groups').insert([{title:newGroup, slug:newGroup.toLowerCase().replace(/\s+/g,'-'), segment_id: Number(selectedSegment)}]); setNewGroup(""); fetchGroups(selectedSegment); };
  const handleSubjectSubmit = async () => { if(!newSubject || !selectedGroup) return; await supabase.from('subjects').insert([{title:newSubject, slug:newSubject.toLowerCase().replace(/\s+/g,'-'), group_id: Number(selectedGroup), segment_id: Number(selectedSegment)}]); setNewSubject(""); fetchSubjects(selectedGroup); };

  // --- RESOURCE LOGIC ---
  const resetResourceForm = () => { setEditingResourceId(null); setResTitle(""); setResLink(""); setResFile(null); setRichContent(""); setQuestionContent(""); setSeoTitle(""); setSeoDescription(""); setBlogImageFile(null); setBlogTags(""); setResType("pdf"); setIsBlogEditorOpen(false); };
  const loadResourceForEdit = (r: any) => {
      setEditingResourceId(r.id); setResTitle(r.title); setResType(r.type);
      setResLink(r.content_url||""); setRichContent(r.content_body||""); setQuestionContent(r.content_body||""); 
      setSeoTitle(r.seo_title||""); setSeoDescription(r.seo_description||""); setBlogTags(r.tags?.join(", ")||"");
      if(r.type==='blog') setIsBlogEditorOpen(true);
      window.scrollTo({top: 800, behavior: 'smooth'}); // Scroll to editor at bottom
  };
  const uploadResource = async (typeOverride?: string) => {
      const type = typeOverride || resType;
      if(!resTitle || !selectedSubject) return alert("Title & Subject required!");
      setSubmitting(true);
      
      let url = resLink;
      let file = (type==='pdf') ? resFile : (type==='blog') ? blogImageFile : null;
      if(file) {
          const name = `${type}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
          await supabase.storage.from('materials').upload(name, file);
          url = supabase.storage.from('materials').getPublicUrl(name).data.publicUrl;
      }

      const payload: any = { subject_id: Number(selectedSubject), title: resTitle, type };
      if(type==='pdf' || type==='video') payload.content_url = url;
      else if(type==='question') { payload.content_body = questionContent; payload.seo_title = seoTitle || resTitle; payload.seo_description = seoDescription; }
      else if(type==='blog') { payload.content_body = richContent; if(url) payload.content_url = url; payload.tags = blogTags.split(',').map(t=>t.trim()); }

      if(editingResourceId) await supabase.from('resources').update(payload).eq('id', editingResourceId);
      else await supabase.from('resources').insert([payload]);

      fetchResources(selectedSubject);
      if(type !== 'blog') resetResourceForm(); else alert("Success!");
      setSubmitting(false);
  };

  // --- EBOOK LOGIC ---
  const handleEbookSubmit = async () => {
      if(!ebTitle) return alert("Title required");
      setSubmitting(true);
      const pdf = (document.getElementById('eb-file') as HTMLInputElement)?.files?.[0];
      const cover = (document.getElementById('eb-cover') as HTMLInputElement)?.files?.[0];
      let pUrl = null, cUrl = null;
      if(pdf) { const n = `pdf-${Date.now()}`; await supabase.storage.from('materials').upload(n, pdf); pUrl = supabase.storage.from('materials').getPublicUrl(n).data.publicUrl; }
      if(cover) { const n = `cover-${Date.now()}`; await supabase.storage.from('covers').upload(n, cover); cUrl = supabase.storage.from('covers').getPublicUrl(n).data.publicUrl; }

      const payload: any = { title: ebTitle, author: ebAuthor, category: ebCategory, description: ebDescription, tags: ebTags.split(',').map(t=>t.trim()) };
      if(pUrl) payload.pdf_url = pUrl; if(cUrl) payload.cover_url = cUrl;

      if(editingEbookId) await supabase.from('ebooks').update(payload).eq('id', editingEbookId);
      else { if(!pUrl) {alert("PDF Required"); setSubmitting(false); return;} payload.pdf_url = pUrl; await supabase.from('ebooks').insert([payload]); }
      setSubmitting(false); setEditingEbookId(null); setEbTitle(""); setEbAuthor(""); setEbDescription(""); setEbTags(""); fetchEbooks();
  };
  const loadEbookForEdit = (b:any) => { setEditingEbookId(b.id); setEbTitle(b.title); setEbAuthor(b.author); setEbCategory(b.category); setEbDescription(b.description); setEbTags(b.tags?.join(", ")); };
  const cancelEbookEdit = () => { setEditingEbookId(null); setEbTitle(""); setEbAuthor(""); setEbDescription(""); setEbTags(""); };

  // --- COURSE LOGIC ---
  const handleCourseSubmit = async () => {
      if(!cTitle) return alert("Title required");
      setSubmitting(true);
      let thumb = null;
      if(cImage) { const n = `course-${Date.now()}`; await supabase.storage.from('materials').upload(n, cImage); thumb = supabase.storage.from('materials').getPublicUrl(n).data.publicUrl; }
      const payload: any = { title: cTitle, instructor: cInstructor, price: cPrice, discount_price: cDiscountPrice, duration: cDuration, enrollment_link: cLink, description: cDesc };
      if(thumb) payload.thumbnail_url = thumb;

      if(editingCourseId) await supabase.from('courses').update(payload).eq('id', editingCourseId);
      else { if(!thumb) {alert("Thumbnail Required"); setSubmitting(false); return;} payload.thumbnail_url = thumb; await supabase.from('courses').insert([payload]); }
      setSubmitting(false); setEditingCourseId(null); setCTitle(""); setCInstructor(""); setCPrice(""); setCDiscountPrice(""); setCDuration(""); setCLink(""); setCDesc(""); setCImage(null); fetchCourses();
  };
  const loadCourseForEdit = (c:any) => { setEditingCourseId(c.id); setCTitle(c.title); setCInstructor(c.instructor); setCPrice(c.price); setCDiscountPrice(c.discount_price); setCDuration(c.duration); setCLink(c.enrollment_link); setCDesc(c.description); };

  // --- NEWS LOGIC ---
  const createCategory = async () => { if(newCategoryInput) { await supabase.from('categories').insert([{name:newCategoryInput}]); setNewCategoryInput(""); fetchCategories(); }};
  const handleNewsSubmit = async () => {
      if(!newsTitle) return alert("Title required");
      setSubmitting(true);
      let url = null;
      if(newsFile) { const n = `news-${Date.now()}`; await supabase.storage.from('materials').upload(n, newsFile); url = supabase.storage.from('materials').getPublicUrl(n).data.publicUrl; }
      const payload: any = { title: newsTitle, content: newsContent, category: selectedCategory, tags: newsTags.split(',').map(t=>t.trim()) };
      if(url) payload.image_url = url;

      if(editingNewsId) await supabase.from('news').update(payload).eq('id', editingNewsId);
      else await supabase.from('news').insert([payload]);
      setSubmitting(false); setEditingNewsId(null); setNewsTitle(""); setNewsContent(""); setNewsFile(null); fetchNews();
  };
  const loadNewsForEdit = (n:any) => { setEditingNewsId(n.id); setNewsTitle(n.title); setNewsContent(n.content); setSelectedCategory(n.category); setNewsTags(n.tags?.join(", ")); };
  const cancelNewsEdit = () => { setEditingNewsId(null); setNewsTitle(""); setNewsContent(""); setNewsTags(""); };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-bold">Admin Panel Loading...</div>;
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[#F3F4F6] font-sans text-gray-800">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed top-20 bottom-0 z-20 hidden md:flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">NextPrep Command</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {[
                { id: 'materials', label: 'Study Materials', icon: '📂' },
                { id: 'class-blogs', label: 'Class Blogs', icon: '✍️' },
                { id: 'ebooks', label: 'Manage eBooks', icon: '📚' },
                { id: 'courses', label: 'Manage Courses', icon: '🎓' },
                { id: 'news', label: 'News CMS', icon: '📰' },
            ].map((tab) => (
                <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id)} 
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                    <span className="text-lg">{tab.icon}</span> {tab.label}
                </button>
            ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition">Sign Out</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 p-8 pt-28 overflow-x-hidden min-h-screen">
        <div className="max-w-[1600px] mx-auto w-full">
            
            {/* MOBILE NAV */}
            <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {['materials','class-blogs','ebooks','courses','news'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-full text-xs font-bold border whitespace-nowrap ${activeTab===t?'bg-blue-600 text-white':'bg-white text-gray-600'}`}>{t.toUpperCase()}</button>
                ))}
            </div>

            {/* === TAB 1: STUDY MATERIALS === */}
            {activeTab === 'materials' && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📂</span>
                    <h2 className="text-2xl font-bold text-gray-800">Manage Content</h2>
                </div>

                {/* 1. HIERARCHY SELECTOR (3 COLUMNS) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* SEGMENTS */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-96">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase">1. Segments</span>
                            <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{segments.length}</span>
                        </div>
                        <div className="p-3 border-b border-gray-100 flex gap-2">
                            <input className="w-full text-sm p-2 border rounded-lg" placeholder="New Segment..." value={newSegment} onChange={e=>setNewSegment(e.target.value)} />
                            <button onClick={handleSegmentSubmit} className="bg-blue-600 text-white w-8 rounded-lg font-bold">+</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {segments.map(s => (
                                <div key={s.id} onClick={()=>handleSegmentClick(s.id)} className={`flex justify-between items-center p-3 rounded-lg cursor-pointer text-sm font-bold transition-all ${selectedSegment===s.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
                                    <span>{s.title}</span>
                                    <button onClick={(e)=>{e.stopPropagation();deleteItem('segments',s.id,fetchSegments)}} className={`hover:text-red-300 px-2 ${selectedSegment===s.id?'text-white':'text-gray-300 hover:text-red-500'}`}>×</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* GROUPS */}
                    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-96 ${!selectedSegment ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase">2. Groups</span>
                            <span className="text-xs font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full">{groups.length}</span>
                        </div>
                        <div className="p-3 border-b border-gray-100 flex gap-2">
                            <input className="w-full text-sm p-2 border rounded-lg" placeholder="New Group..." value={newGroup} onChange={e=>setNewGroup(e.target.value)} />
                            <button onClick={handleGroupSubmit} className="bg-green-600 text-white w-8 rounded-lg font-bold">+</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {groups.map(g => (
                                <div key={g.id} onClick={()=>handleGroupClick(g.id)} className={`flex justify-between items-center p-3 rounded-lg cursor-pointer text-sm font-bold transition-all ${selectedGroup===g.id ? 'bg-green-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
                                    <span>{g.title}</span>
                                    <button onClick={(e)=>{e.stopPropagation();deleteItem('groups',g.id,()=>fetchGroups(selectedSegment))}} className={`hover:text-red-300 px-2 ${selectedGroup===g.id?'text-white':'text-gray-300 hover:text-red-500'}`}>×</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SUBJECTS */}
                    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-96 ${!selectedGroup ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase">3. Subjects</span>
                            <span className="text-xs font-bold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">{subjects.length}</span>
                        </div>
                        <div className="p-3 border-b border-gray-100 flex gap-2">
                            <input className="w-full text-sm p-2 border rounded-lg" placeholder="New Subject..." value={newSubject} onChange={e=>setNewSubject(e.target.value)} />
                            <button onClick={handleSubjectSubmit} className="bg-purple-600 text-white w-8 rounded-lg font-bold">+</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {subjects.map(s => (
                                <div key={s.id} onClick={()=>handleSubjectClick(s.id)} className={`flex justify-between items-center p-3 rounded-lg cursor-pointer text-sm font-bold transition-all ${selectedSubject===s.id ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
                                    <span>{s.title}</span>
                                    <button onClick={(e)=>{e.stopPropagation();deleteItem('subjects',s.id,()=>fetchSubjects(selectedGroup))}} className={`hover:text-red-300 px-2 ${selectedSubject===s.id?'text-white':'text-gray-300 hover:text-red-500'}`}>×</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. CONTENT MANAGER (FULL WIDTH BOTTOM) */}
                <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${!selectedSubject ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <span className="bg-gray-800 text-white w-6 h-6 flex items-center justify-center rounded text-xs">4</span>
                            Uploads & Content Library
                        </h3>
                        {selectedSubject && <span className="text-xs font-mono text-gray-400">Subject ID: {selectedSubject}</span>}
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* LEFT: UPLOAD FORM */}
                        <div className="lg:col-span-4 space-y-5 border-r border-gray-100 pr-6">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Add New Resource</h4>
                            
                            <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">Type</label>
                                <select className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm font-bold outline-none" value={resType} onChange={e=>setResType(e.target.value)}>
                                    <option value="pdf">📄 PDF Document</option>
                                    <option value="video">🎬 Video Class</option>
                                    <option value="question">❓ Question</option>
                                    <option value="blog">✍️ Blog Post</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">Title</label>
                                <input className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm outline-none" value={resTitle} onChange={e=>setResTitle(e.target.value)} placeholder="Resource Title..." />
                            </div>

                            {/* Dynamic Inputs */}
                            {resType === 'pdf' && (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition relative">
                                    <input type="file" onChange={e => setResFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" accept="application/pdf" />
                                    <span className="text-2xl block mb-1">📂</span>
                                    <p className="text-xs font-bold text-gray-500">{resFile ? resFile.name : "Click to Upload PDF"}</p>
                                </div>
                            )}
                            {resType === 'video' && (
                                <input className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm outline-none" value={resLink} onChange={e=>setResLink(e.target.value)} placeholder="YouTube Embed Link..." />
                            )}
                            {resType === 'question' && (
                                <div className="space-y-2">
                                    <div className="border rounded overflow-hidden"><SunEditor setContents={questionContent} onChange={setQuestionContent} setOptions={{buttonList:[['bold','italic','list']], minHeight:"150px"}}/></div>
                                    <input className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-xs" value={seoTitle} onChange={e=>setSeoTitle(e.target.value)} placeholder="SEO Title" />
                                </div>
                            )}
                            {resType === 'blog' && (
                                <div className="p-3 bg-yellow-50 text-yellow-700 text-xs rounded border border-yellow-200">
                                    Switch to <strong>"Class Blogs"</strong> tab for the full blog editor.
                                </div>
                            )}

                            {resType !== 'blog' && (
                                <button onClick={()=>uploadResource()} disabled={submitting} className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition shadow-lg">
                                    {submitting ? "Uploading..." : editingResourceId ? "Update Resource" : "Upload Now"}
                                </button>
                            )}
                            {editingResourceId && <button onClick={resetResourceForm} className="w-full text-red-500 text-xs font-bold mt-2">Cancel Edit</button>}
                        </div>

                        {/* RIGHT: LIBRARY LIST */}
                        <div className="lg:col-span-8 flex flex-col h-[500px]">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Existing Library ({resources.length})</h4>
                            <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 p-4 overflow-y-auto custom-scrollbar space-y-2">
                                {resources.length === 0 && <div className="text-center text-gray-400 text-sm mt-20">No resources found for this subject.</div>}
                                {resources.map(r => (
                                    <div key={r.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex justify-between items-center group hover:border-blue-300 transition">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded flex items-center justify-center text-lg ${r.type==='pdf'?'bg-red-50 text-red-500':r.type==='video'?'bg-blue-50 text-blue-500':'bg-yellow-50 text-yellow-600'}`}>
                                                {r.type==='pdf'?'📄':r.type==='video'?'▶':'❓'}
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-bold text-gray-800 line-clamp-1">{r.title}</h5>
                                                <span className="text-[10px] text-gray-400 uppercase">{new Date(r.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                            <button onClick={()=>loadResourceForEdit(r)} className="px-3 py-1 bg-gray-100 hover:bg-blue-600 hover:text-white text-xs font-bold rounded">Edit</button>
                                            <button onClick={()=>deleteItem('resources',r.id,()=>fetchResources(selectedSubject))} className="px-3 py-1 bg-gray-100 hover:bg-red-600 hover:text-white text-xs font-bold rounded">Del</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            )}

            {/* === TAB 2: EBOOKS (Clean Cards) === */}
            {activeTab === 'ebooks' && (
              <div className="space-y-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800">Manage eBooks</h2>
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Form */}
                    <div className="xl:col-span-4">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-gray-700 mb-4">{editingEbookId?"Edit eBook":"Add New eBook"}</h3>
                            <div className="space-y-4">
                                <input className="w-full bg-gray-50 border p-3 rounded-lg text-sm font-bold outline-none" value={ebTitle} onChange={e=>setEbTitle(e.target.value)} placeholder="Book Title" />
                                <div className="grid grid-cols-2 gap-2">
                                    <input className="w-full bg-gray-50 border p-3 rounded-lg text-sm outline-none" value={ebAuthor} onChange={e=>setEbAuthor(e.target.value)} placeholder="Author" />
                                    <select className="w-full bg-gray-50 border p-3 rounded-lg text-sm outline-none" value={ebCategory} onChange={e=>setEbCategory(e.target.value)}><option>SSC</option><option>HSC</option><option>Admission</option></select>
                                </div>
                                <div className="border rounded overflow-hidden"><SunEditor setContents={ebDescription} onChange={setEbDescription} setOptions={{buttonList:[['bold','italic','list']], minHeight:"150px"}}/></div>
                                <input className="w-full bg-gray-50 border p-3 rounded-lg text-sm outline-none" value={ebTags} onChange={e=>setEbTags(e.target.value)} placeholder="Tags..." />
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-4 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-50 relative"><span className="block text-red-500">📄</span><span className="text-xs font-bold text-gray-400">PDF</span><input type="file" id="eb-file" className="absolute inset-0 opacity-0 cursor-pointer" accept="application/pdf"/></div>
                                    <div className="p-4 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-50 relative"><span className="block text-blue-500">🖼️</span><span className="text-xs font-bold text-gray-400">Cover</span><input type="file" id="eb-cover" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*"/></div>
                                </div>
                                <button onClick={handleEbookSubmit} disabled={submitting} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">{submitting?"Saving...":"Save eBook"}</button>
                                {editingEbookId && <button onClick={cancelEbookEdit} className="w-full text-red-500 text-xs font-bold py-2">Cancel</button>}
                            </div>
                        </div>
                    </div>
                    {/* List */}
                    <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ebooksList.map(book => (
                            <div key={book.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-3 group hover:border-blue-300 transition">
                                <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                    {book.cover_url ? <img src={book.cover_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-xs">No Cover</div>}
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div><h4 className="font-bold text-sm text-gray-800 line-clamp-2">{book.title}</h4><p className="text-xs text-gray-500">{book.author}</p></div>
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={()=>loadEbookForEdit(book)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">Edit</button>
                                        <button onClick={()=>deleteItem('ebooks',book.id,fetchEbooks)} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded font-bold">Del</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            )}

            {/* === TAB 3: CLASS BLOGS === */}
            {activeTab === 'class-blogs' && (
              <div className="animate-fade-in">
                {!isBlogEditorOpen ? (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Class Blogs</h2>
                            <button onClick={()=>{resetResourceForm();setIsBlogEditorOpen(true);setResType('blog')}} className="bg-black text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-gray-800 transition">+ Write New</button>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4 mb-6">
                            <select className="w-full bg-gray-50 border p-2 rounded-lg font-bold text-sm outline-none" value={selectedSegment} onChange={e=>handleSegmentClick(e.target.value)}><option value="">Filter Segment</option>{segments.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                            <select className="w-full bg-gray-50 border p-2 rounded-lg font-bold text-sm outline-none" value={selectedGroup} onChange={e=>handleGroupClick(e.target.value)} disabled={!selectedSegment}><option value="">Filter Group</option>{groups.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select>
                            <select className="w-full bg-gray-50 border p-2 rounded-lg font-bold text-sm outline-none" value={selectedSubject} onChange={e=>handleSubjectClick(e.target.value)} disabled={!selectedGroup}><option value="">Filter Subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {resources.filter(r=>r.type==='blog').length===0 && <div className="col-span-full py-20 text-center text-gray-400">No blogs found. Use the filters above.</div>}
                            {resources.filter(r=>r.type==='blog').map(b=>(
                                <div key={b.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition group">
                                    <div className="h-32 bg-gray-100 relative">
                                        {b.content_url && <img src={b.content_url} className="w-full h-full object-cover"/>}
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                            <button onClick={()=>loadResourceForEdit(b)} className="bg-white p-1 rounded shadow text-xs">✏️</button>
                                            <button onClick={()=>deleteItem('resources',b.id,()=>fetchResources(selectedSubject))} className="bg-white p-1 rounded shadow text-xs text-red-500">🗑️</button>
                                        </div>
                                    </div>
                                    <div className="p-3"><h3 className="font-bold text-sm text-gray-800 line-clamp-2">{b.title}</h3></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 min-h-screen flex flex-col relative">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <button onClick={()=>setIsBlogEditorOpen(false)} className="font-bold text-gray-500 hover:text-black">← Back</button>
                            <button onClick={()=>uploadResource('blog')} disabled={submitting} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700">{submitting?"Publishing...":"Publish Post"}</button>
                        </div>
                        <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
                            <input className="text-4xl font-black w-full outline-none placeholder-gray-300" placeholder="Blog Title..." value={resTitle} onChange={e=>setResTitle(e.target.value)} />
                            <div className="min-h-[500px] border rounded-lg overflow-hidden"><SunEditor setContents={richContent} onChange={setRichContent} setOptions={{...editorOptions, minHeight:"500px"}} /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="border-2 border-dashed p-6 rounded-lg text-center relative hover:bg-gray-50"><input type="file" onChange={e=>setBlogImageFile(e.target.files?.[0]||null)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*"/><span className="text-2xl">🖼️</span><p className="font-bold text-gray-400 text-xs">Cover Image</p>{blogImageFile && <p className="text-xs text-green-600 font-bold">{blogImageFile.name}</p>}</div>
                                <textarea className="w-full bg-gray-50 border p-4 rounded-lg text-sm resize-none outline-none" placeholder="Tags (comma separated)..." value={blogTags} onChange={e=>setBlogTags(e.target.value)}></textarea>
                            </div>
                        </div>
                    </div>
                )}
              </div>
            )}

            {/* === TAB 4: COURSES === */}
            {activeTab === 'courses' && (
              <div className="space-y-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800">Manage Courses</h2>
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <div className="xl:col-span-4">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-gray-700 mb-4">{editingCourseId?"Edit Course":"Create Course"}</h3>
                            <div className="space-y-4">
                                <input className="w-full bg-gray-50 border p-3 rounded-lg text-sm font-bold outline-none" value={cTitle} onChange={e=>setCTitle(e.target.value)} placeholder="Course Title" />
                                <input className="w-full bg-gray-50 border p-3 rounded-lg text-sm outline-none" value={cInstructor} onChange={e=>setCInstructor(e.target.value)} placeholder="Instructor" />
                                <div className="grid grid-cols-2 gap-2"><input className="w-full bg-gray-50 border p-3 rounded-lg text-sm outline-none" value={cPrice} onChange={e=>setCPrice(e.target.value)} placeholder="Price" /><input className="w-full bg-gray-50 border p-3 rounded-lg text-sm outline-none text-green-600" value={cDiscountPrice} onChange={e=>setCDiscountPrice(e.target.value)} placeholder="Discount Price" /></div>
                                <div className="grid grid-cols-2 gap-2"><input className="w-full bg-gray-50 border p-3 rounded-lg text-sm outline-none" value={cDuration} onChange={e=>setCDuration(e.target.value)} placeholder="Duration" /><input className="w-full bg-gray-50 border p-3 rounded-lg text-sm outline-none text-blue-600" value={cLink} onChange={e=>setCLink(e.target.value)} placeholder="Form Link" /></div>
                                <div className="border rounded overflow-hidden"><SunEditor setContents={cDesc} onChange={setCDesc} setOptions={{buttonList:[['bold','italic','list']], minHeight:"150px"}}/></div>
                                <div className="p-4 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-50 relative"><span className="block text-xl">📸</span><span className="text-xs font-bold text-gray-400">Thumbnail</span><input type="file" onChange={e=>setCImage(e.target.files?.[0]||null)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*"/></div>
                                <button onClick={handleCourseSubmit} disabled={submitting} className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition">{submitting?"Saving...":"Launch Course"}</button>
                                {editingCourseId && <button onClick={()=>setEditingCourseId(null)} className="w-full text-red-500 text-xs font-bold py-2">Cancel</button>}
                            </div>
                        </div>
                    </div>
                    <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {coursesList.map(c => (
                            <div key={c.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition group">
                                <div className="h-40 bg-gray-200 relative">
                                    {c.thumbnail_url && <img src={c.thumbnail_url} className="w-full h-full object-cover"/>}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition">
                                        <button onClick={()=>loadCourseForEdit(c)} className="bg-white px-3 py-1 rounded font-bold text-xs">Edit</button>
                                        <button onClick={()=>deleteItem('courses',c.id,fetchCourses)} className="bg-red-600 text-white px-3 py-1 rounded font-bold text-xs">Del</button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h4 className="font-bold text-gray-800 mb-1">{c.title}</h4>
                                    <div className="flex gap-2 text-sm"><span className="font-bold text-green-600">{c.discount_price || c.price}</span>{c.discount_price && <span className="line-through text-gray-400">{c.price}</span>}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            )}

            {/* === TAB 5: NEWS === */}
            {activeTab === 'news' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-gray-800">Newsroom</h2>{editingNewsId && <button onClick={cancelNewsEdit} className="text-red-500 font-bold border px-3 py-1 rounded">Cancel Edit</button>}</div>
                 <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <div className="xl:col-span-8 space-y-4">
                        <input className="text-4xl font-black w-full bg-transparent border-b border-gray-300 pb-2 outline-none placeholder-gray-300" placeholder="Headline..." value={newsTitle} onChange={e=>setNewsTitle(e.target.value)} />
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><SunEditor setContents={newsContent} onChange={setNewsContent} setOptions={{...editorOptions, minHeight:"500px"}} /></div>
                    </div>
                    <div className="xl:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <button onClick={handleNewsSubmit} disabled={submitting} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition mb-6">{submitting?"Publishing...":"Publish Now"}</button>
                            <div className="space-y-4">
                                <div><label className="text-xs font-bold text-gray-400 uppercase block mb-1">Category</label><select className="w-full bg-gray-50 border p-2 rounded text-sm font-bold outline-none" value={selectedCategory} onChange={e=>setSelectedCategory(e.target.value)}><option>General</option>{categoryList.map(c=><option key={c.id}>{c.name}</option>)}</select><div className="flex gap-2 mt-2"><input className="w-full bg-gray-50 border p-2 rounded text-xs outline-none" placeholder="New..." value={newCategoryInput} onChange={e=>setNewCategoryInput(e.target.value)} /><button onClick={createCategory} className="bg-black text-white px-3 rounded text-xs font-bold">+</button></div></div>
                                <div className="p-4 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-50 relative"><span className="block text-xl">📸</span><span className="text-xs font-bold text-gray-400">Cover Image</span><input type="file" onChange={e=>setNewsFile(e.target.files?.[0]||null)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*"/></div>
                                <div><label className="text-xs font-bold text-gray-400 uppercase block mb-1">Tags</label><textarea className="w-full bg-gray-50 border p-2 rounded text-sm resize-none outline-none h-24" placeholder="Tags..." value={newsTags} onChange={e=>setNewsTags(e.target.value)}></textarea></div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 font-bold text-xs text-gray-400 uppercase">Recent News</div>
                            <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                {newsList.map(n => (
                                    <div key={n.id} className="p-3 border-b hover:bg-gray-50 flex justify-between items-center group cursor-pointer">
                                        <span className="font-bold text-xs text-gray-700 truncate w-2/3">{n.title}</span>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100"><button onClick={()=>loadNewsForEdit(n)} className="text-blue-600 text-xs font-bold">Edit</button><button onClick={()=>deleteItem('news',n.id,fetchNews)} className="text-red-600 text-xs font-bold">Del</button></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                 </div>
              </div>
            )}

        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}