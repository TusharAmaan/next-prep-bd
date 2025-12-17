"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

// Import SunEditor CSS
import 'suneditor/dist/css/suneditor.min.css'; 

const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
});

// --- EDITOR CONFIG (Standardized) ---
const editorOptions = {
    minHeight: "250px",
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

  // --- DATA ---
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [ebooksList, setEbooksList] = useState<any[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);

  // --- SELECTION STATE ---
  const [selectedSegment, setSelectedSegment] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // --- UI FLAGS ---
  const [submitting, setSubmitting] = useState(false);
  const [isBlogEditorOpen, setIsBlogEditorOpen] = useState(false);

  // --- FORM INPUTS ---
  // Structure
  const [newSegment, setNewSegment] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newSubject, setNewSubject] = useState("");
  
  // Resources
  const [resTitle, setResTitle] = useState("");
  const [resLink, setResLink] = useState("");
  const [resFile, setResFile] = useState<File | null>(null);
  const [resType, setResType] = useState("pdf");
  const [richContent, setRichContent] = useState(""); // Shared content
  const [questionContent, setQuestionContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);
  
  // Blog Specifics
  const [blogImageFile, setBlogImageFile] = useState<File | null>(null);
  const [blogTags, setBlogTags] = useState("");

  // News
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState(""); 
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [newCategoryInput, setNewCategoryInput] = useState(""); 
  const [newsTags, setNewsTags] = useState(""); 
  const [newsFile, setNewsFile] = useState<File | null>(null);
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);

  // eBooks
  const [ebTitle, setEbTitle] = useState("");
  const [ebAuthor, setEbAuthor] = useState("");
  const [ebCategory, setEbCategory] = useState("SSC");
  const [ebDescription, setEbDescription] = useState(""); 
  const [ebTags, setEbTags] = useState("");
  const [editingEbookId, setEditingEbookId] = useState<number | null>(null);

  // Courses
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

  // --- DATA FETCHERS ---
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
  
  const handleSegmentClick = (id: string) => { setSelectedSegment(id); setSelectedGroup(""); setSelectedSubject(""); setGroups([]); setSubjects([]); setResources([]); fetchGroups(id); };
  const handleGroupClick = (id: string) => { setSelectedGroup(id); setSelectedSubject(""); setSubjects([]); setResources([]); fetchGroups(selectedSegment); fetchSubjects(id); };
  const handleSubjectClick = (id: string) => { setSelectedSubject(id); fetchResources(id); };

  const deleteItem = async (table: string, id: number, refresh: () => void) => {
    if(!confirm("Are you sure you want to delete this?")) return;
    await supabase.from(table).delete().eq("id", id);
    refresh();
  };

  // --- SUBMIT HANDLERS ---
  const handleSegmentSubmit = async () => { if(!newSegment) return; await supabase.from('segments').insert([{title:newSegment, slug:newSegment.toLowerCase().replace(/\s+/g,'-')}]); setNewSegment(""); fetchSegments(); };
  const handleGroupSubmit = async () => { if(!newGroup || !selectedSegment) return; await supabase.from('groups').insert([{title:newGroup, slug:newGroup.toLowerCase().replace(/\s+/g,'-'), segment_id: Number(selectedSegment)}]); setNewGroup(""); fetchGroups(selectedSegment); };
  const handleSubjectSubmit = async () => { if(!newSubject || !selectedGroup) return; await supabase.from('subjects').insert([{title:newSubject, slug:newSubject.toLowerCase().replace(/\s+/g,'-'), group_id: Number(selectedGroup), segment_id: Number(selectedSegment)}]); setNewSubject(""); fetchSubjects(selectedGroup); };

  // Resource Logic
  const resetResourceForm = () => { setEditingResourceId(null); setResTitle(""); setResLink(""); setResFile(null); setRichContent(""); setQuestionContent(""); setSeoTitle(""); setSeoDescription(""); setBlogImageFile(null); setBlogTags(""); setResType("pdf"); setIsBlogEditorOpen(false); };
  const loadResourceForEdit = (r: any) => {
      setEditingResourceId(r.id); setResTitle(r.title); setResType(r.type);
      setResLink(r.content_url||""); setRichContent(r.content_body||""); setQuestionContent(r.content_body||""); 
      setSeoTitle(r.seo_title||""); setSeoDescription(r.seo_description||""); setBlogTags(r.tags?.join(", ")||"");
      if(r.type==='blog') setIsBlogEditorOpen(true);
      window.scrollTo({top:0, behavior:'smooth'});
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
      if(type !== 'blog') resetResourceForm(); else alert("Blog Published!");
      setSubmitting(false);
  };

  // Ebook Logic
  const handleEbookSubmit = async () => {
      if(!ebTitle) return alert("Title required");
      setSubmitting(true);
      const pdf = (document.getElementById('eb-file') as HTMLInputElement)?.files?.[0];
      const cover = (document.getElementById('eb-cover') as HTMLInputElement)?.files?.[0];
      let pUrl = null, cUrl = null;

      if(pdf) { const n = `pdf-${Date.now()}`; await supabase.storage.from('materials').upload(n, pdf); pUrl = supabase.storage.from('materials').getPublicUrl(n).data.publicUrl; }
      if(cover) { const n = `cover-${Date.now()}`; await supabase.storage.from('covers').upload(n, cover); cUrl = supabase.storage.from('covers').getPublicUrl(n).data.publicUrl; }

      const payload: any = { title: ebTitle, author: ebAuthor, category: ebCategory, description: ebDescription, tags: ebTags.split(',').map(t=>t.trim()) };
      if(pUrl) payload.pdf_url = pUrl;
      if(cUrl) payload.cover_url = cUrl;

      if(editingEbookId) await supabase.from('ebooks').update(payload).eq('id', editingEbookId);
      else { if(!pUrl) {alert("PDF Required"); setSubmitting(false); return;} payload.pdf_url = pUrl; await supabase.from('ebooks').insert([payload]); }
      
      setSubmitting(false); setEditingEbookId(null); setEbTitle(""); setEbAuthor(""); setEbDescription(""); setEbTags(""); fetchEbooks();
  };
  const loadEbookForEdit = (b:any) => { setEditingEbookId(b.id); setEbTitle(b.title); setEbAuthor(b.author); setEbCategory(b.category); setEbDescription(b.description); setEbTags(b.tags?.join(", ")); };

  // Course Logic
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

  // News Logic
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


  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-bold">Initializing Dashboard...</div>;
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-800">
      
      {/* SIDEBAR (Modern & Clean) */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed top-20 bottom-0 z-20 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Management</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {[
                { id: 'materials', label: 'Study Content', icon: '🗂️' },
                { id: 'class-blogs', label: 'Class Blogs', icon: '✍️' },
                { id: 'ebooks', label: 'eBooks Library', icon: '📚' },
                { id: 'courses', label: 'Courses', icon: '🎓' },
                { id: 'news', label: 'News & Notices', icon: '📢' },
            ].map((tab) => (
                <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id)} 
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                    <span className="text-lg">{tab.icon}</span> {tab.label}
                </button>
            ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition">Sign Out</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 p-6 pt-28 overflow-x-hidden min-h-screen">
        <div className="max-w-[1600px] mx-auto w-full">
            
            {/* MOBILE TABS */}
            <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {['materials','class-blogs','ebooks','courses','news'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-full text-xs font-bold border whitespace-nowrap ${activeTab===t?'bg-slate-900 text-white':'bg-white text-slate-600'}`}>{t.toUpperCase()}</button>
                ))}
            </div>

            {/* === TAB 1: STUDY MATERIALS === */}
            {activeTab === 'materials' && (
              <div className="space-y-8 animate-fade-in">
                
                {/* HIERARCHY SELECTOR (Improved UI) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Segment */}
                    <div className="card">
                        <div className="card-header"><h3 className="card-title">1. Segment</h3></div>
                        <div className="p-4">
                            <div className="flex gap-2 mb-4"><input className="input-field" value={newSegment} onChange={e=>setNewSegment(e.target.value)} placeholder="New Segment..." /><button onClick={handleSegmentSubmit} className="btn-icon">+</button></div>
                            <ul className="list-container">
                                {segments.map(s => <li key={s.id} onClick={()=>handleSegmentClick(s.id)} className={`list-item ${selectedSegment===s.id?'active':''}`}><span>{s.title}</span><button className="delete-btn" onClick={(e)=>{e.stopPropagation();deleteItem('segments',s.id,fetchSegments)}}>×</button></li>)}
                            </ul>
                        </div>
                    </div>
                    {/* Group */}
                    <div className={`card ${!selectedSegment && 'opacity-50 pointer-events-none'}`}>
                        <div className="card-header"><h3 className="card-title">2. Group</h3></div>
                        <div className="p-4">
                            <div className="flex gap-2 mb-4"><input className="input-field" value={newGroup} onChange={e=>setNewGroup(e.target.value)} placeholder="New Group..." /><button onClick={handleGroupSubmit} className="btn-icon">+</button></div>
                            <ul className="list-container">
                                {groups.map(g => <li key={g.id} onClick={()=>handleGroupClick(g.id)} className={`list-item ${selectedGroup===g.id?'active':''}`}><span>{g.title}</span><button className="delete-btn" onClick={(e)=>{e.stopPropagation();deleteItem('groups',g.id,()=>fetchGroups(selectedSegment))}}>×</button></li>)}
                            </ul>
                        </div>
                    </div>
                    {/* Subject */}
                    <div className={`card ${!selectedGroup && 'opacity-50 pointer-events-none'}`}>
                        <div className="card-header"><h3 className="card-title">3. Subject</h3></div>
                        <div className="p-4">
                            <div className="flex gap-2 mb-4"><input className="input-field" value={newSubject} onChange={e=>setNewSubject(e.target.value)} placeholder="New Subject..." /><button onClick={handleSubjectSubmit} className="btn-icon">+</button></div>
                            <ul className="list-container">
                                {subjects.map(s => <li key={s.id} onClick={()=>handleSubjectClick(s.id)} className={`list-item ${selectedSubject===s.id?'active':''}`}><span>{s.title}</span><button className="delete-btn" onClick={(e)=>{e.stopPropagation();deleteItem('subjects',s.id,()=>fetchSubjects(selectedGroup))}}>×</button></li>)}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* RESOURCE MANAGER */}
                <div className={`card ${!selectedSubject && 'opacity-50 pointer-events-none'}`}>
                    <div className="card-header flex justify-between items-center">
                        <h3 className="card-title">4. Manage Content <span className="font-normal text-slate-400 text-xs ml-2">(Subject ID: {selectedSubject})</span></h3>
                        {editingResourceId && <button onClick={resetResourceForm} className="text-xs text-red-500 font-bold px-3 py-1 bg-red-50 rounded-full">Cancel Editing</button>}
                    </div>
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* FORM */}
                        <div className="space-y-5">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <label className="label">Type</label>
                                    <select className="input-field" value={resType} onChange={e=>setResType(e.target.value)}>
                                        <option value="pdf">📄 PDF</option>
                                        <option value="video">🎬 Video</option>
                                        <option value="question">❓ Question</option>
                                        <option value="blog">✍️ Blog</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="label">Title</label>
                                    <input className="input-field" value={resTitle} onChange={e=>setResTitle(e.target.value)} placeholder="e.g. Chapter 1 Notes" />
                                </div>
                            </div>

                            {resType === 'pdf' && (
                                <div className="dropzone">
                                    <span className="text-2xl mb-2">📂</span>
                                    <p className="text-sm font-bold text-slate-500">Click to upload PDF document</p>
                                    <input type="file" onChange={e => setResFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" accept="application/pdf" />
                                    {resFile && <p className="text-xs text-blue-600 mt-2 font-bold">{resFile.name}</p>}
                                </div>
                            )}

                            {resType === 'video' && (
                                <div><label className="label">YouTube Embed URL</label><input className="input-field" value={resLink} onChange={e=>setResLink(e.target.value)} placeholder="https://youtube.com/..." /></div>
                            )}

                            {resType === 'question' && (
                                <div className="space-y-4">
                                    <div><label className="label">Question Body</label><div className="border rounded-lg overflow-hidden"><SunEditor setContents={questionContent} onChange={setQuestionContent} setOptions={editorOptions}/></div></div>
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200"><label className="label">SEO Meta</label><input className="input-field mb-2" value={seoTitle} onChange={e=>setSeoTitle(e.target.value)} placeholder="SEO Title"/><textarea className="input-field" value={seoDescription} onChange={e=>setSeoDescription(e.target.value)} placeholder="Description..."></textarea></div>
                                </div>
                            )}

                            {resType === 'blog' ? (
                                <div className="p-4 bg-yellow-50 text-yellow-700 text-sm rounded-lg border border-yellow-200">
                                    <strong>Note:</strong> To write a full blog post, please use the <strong>"Class Blogs"</strong> tab from the sidebar for a better writing experience.
                                </div>
                            ) : (
                                <button onClick={() => uploadResource()} disabled={submitting} className="btn-primary w-full py-3">{submitting ? "Saving..." : editingResourceId ? "Update Resource" : "Add Resource"}</button>
                            )}
                        </div>

                        {/* LIST */}
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col h-[500px]">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Existing Content</h4>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                {resources.length === 0 && <div className="text-center text-slate-400 text-sm mt-20">No content found.</div>}
                                {resources.map(r => (
                                    <div key={r.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center group hover:border-blue-300 transition">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{r.type === 'pdf' ? '📄' : r.type === 'video' ? '🎬' : '❓'}</span>
                                            <span className="text-sm font-bold text-slate-700 line-clamp-1 w-48">{r.title}</span>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                            <button onClick={() => loadResourceForEdit(r)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">Edit</button>
                                            <button onClick={() => deleteItem('resources', r.id, () => fetchResources(selectedSubject))} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded font-bold">Del</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            )}

            {/* === TAB 2: EBOOKS (REDESIGNED) === */}
            {activeTab === 'ebooks' && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex justify-between items-end">
                    <h2 className="text-3xl font-black text-slate-900">Digital Library</h2>
                    {editingEbookId && <button onClick={cancelEbookEdit} className="text-red-500 font-bold underline text-sm">Cancel Editing</button>}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* LEFT: FORM (4 cols) */}
                    <div className="xl:col-span-4">
                        <div className="card p-6 sticky top-28">
                            <h3 className="card-title mb-6">{editingEbookId ? "Edit eBook Details" : "Add New eBook"}</h3>
                            <div className="space-y-5">
                                <div><label className="label">Book Title</label><input className="input-field font-bold" value={ebTitle} onChange={e=>setEbTitle(e.target.value)} placeholder="e.g. Physics First Paper" /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="label">Author</label><input className="input-field" value={ebAuthor} onChange={e=>setEbAuthor(e.target.value)} placeholder="Dr. Shahjahan Tapan" /></div>
                                    <div><label className="label">Category</label><select className="input-field" value={ebCategory} onChange={e=>setEbCategory(e.target.value)}><option>SSC</option><option>HSC</option><option>Admission</option></select></div>
                                </div>
                                <div><label className="label">Description</label><div className="border rounded-lg overflow-hidden"><SunEditor setContents={ebDescription} onChange={setEbDescription} setOptions={{...editorOptions, minHeight:"150px"}}/></div></div>
                                <div><label className="label">Tags</label><input className="input-field" value={ebTags} onChange={e=>setEbTags(e.target.value)} placeholder="physics, hsc, vector..." /></div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="dropzone small">
                                        <span className="text-red-500 text-xl">📄</span>
                                        <span className="text-[10px] font-bold text-slate-500 mt-1">Upload PDF</span>
                                        <input type="file" id="eb-file" className="absolute inset-0 opacity-0 cursor-pointer" accept="application/pdf"/>
                                    </div>
                                    <div className="dropzone small">
                                        <span className="text-blue-500 text-xl">🖼️</span>
                                        <span className="text-[10px] font-bold text-slate-500 mt-1">Cover Image</span>
                                        <input type="file" id="eb-cover" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*"/>
                                    </div>
                                </div>

                                <button onClick={handleEbookSubmit} disabled={submitting} className="btn-primary w-full py-3 text-lg shadow-xl shadow-blue-500/20">{submitting ? "Processing..." : "Save to Library"}</button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: LIST (8 cols) */}
                    <div className="xl:col-span-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {ebooksList.map(book => (
                                <div key={book.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex gap-4 group relative overflow-hidden">
                                    <div className="w-20 h-28 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden shadow-inner relative">
                                        {book.cover_url ? <img src={book.cover_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No Cover</div>}
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mb-2">{book.category}</span>
                                        <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1 line-clamp-2">{book.title}</h4>
                                        <p className="text-xs text-slate-500 mb-auto">{book.author}</p>
                                        
                                        <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                                            <button onClick={() => loadEbookForEdit(book)} className="flex-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-xs font-bold py-1.5 rounded-lg transition">Edit</button>
                                            <button onClick={() => deleteItem('ebooks', book.id, fetchEbooks)} className="flex-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-xs font-bold py-1.5 rounded-lg transition">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
              </div>
            )}

            {/* === TAB 3: CLASS BLOGS (Full Page Editor) === */}
            {activeTab === 'class-blogs' && (
              <div className="animate-fade-in">
                {!isBlogEditorOpen ? (
                    <div>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-black text-slate-900">Class Blogs</h2>
                            <button onClick={()=>{resetResourceForm();setIsBlogEditorOpen(true);setResType('blog')}} className="btn-black px-6 py-3 shadow-lg">+ New Post</button>
                        </div>
                        {/* Filters */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 mb-8">
                            <select className="input-field" value={selectedSegment} onChange={e=>handleSegmentClick(e.target.value)}><option value="">Select Segment</option>{segments.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                            <select className="input-field" value={selectedGroup} onChange={e=>handleGroupClick(e.target.value)} disabled={!selectedSegment}><option value="">Select Group</option>{groups.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select>
                            <select className="input-field" value={selectedSubject} onChange={e=>handleSubjectClick(e.target.value)} disabled={!selectedGroup}><option value="">Select Subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                        </div>
                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {resources.filter(r=>r.type==='blog').length === 0 && <div className="col-span-full text-center py-20 text-slate-400">No blogs found. Select a subject to view.</div>}
                            {resources.filter(r=>r.type==='blog').map(b=>(
                                <div key={b.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                                    <div className="h-40 bg-slate-100 relative">
                                        {b.content_url && <img src={b.content_url} className="w-full h-full object-cover"/>}
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            <button onClick={()=>loadResourceForEdit(b)} className="bg-white/90 p-2 rounded-lg shadow-sm text-xs font-bold hover:bg-blue-50 text-blue-600 backdrop-blur-sm">Edit</button>
                                            <button onClick={()=>deleteItem('resources',b.id,()=>fetchResources(selectedSubject))} className="bg-white/90 p-2 rounded-lg shadow-sm text-xs font-bold hover:bg-red-50 text-red-600 backdrop-blur-sm">Del</button>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-slate-800 leading-snug line-clamp-2 mb-2">{b.title}</h3>
                                        <span className="text-xs text-slate-400">{new Date(b.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 min-h-[80vh] flex flex-col relative">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10 rounded-t-2xl">
                            <button onClick={()=>setIsBlogEditorOpen(false)} className="text-slate-500 font-bold hover:text-black transition">← Back to List</button>
                            <button onClick={()=>uploadResource('blog')} disabled={submitting} className="btn-success px-8 py-2 text-sm shadow-lg shadow-green-500/20">{submitting?"Publishing...":"Publish Post"}</button>
                        </div>
                        <div className="p-10 max-w-4xl mx-auto w-full space-y-8">
                            <input className="text-5xl font-black w-full outline-none placeholder-slate-300 text-slate-900" placeholder="Blog Title..." value={resTitle} onChange={e=>setResTitle(e.target.value)} />
                            <div className="min-h-[500px]"><SunEditor setContents={richContent} onChange={setRichContent} setOptions={{...editorOptions, minHeight:"500px"}} /></div>
                            <div className="grid grid-cols-2 gap-8 pt-10 border-t border-slate-100">
                                <div className="dropzone"><span className="text-4xl mb-2">🖼️</span><p className="font-bold text-slate-500">Feature Image</p><input type="file" onChange={e=>setBlogImageFile(e.target.files?.[0]||null)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />{blogImageFile && <p className="text-sm text-blue-600 mt-2 font-bold">{blogImageFile.name}</p>}</div>
                                <div><label className="label">Tags</label><textarea className="input-field h-32 resize-none" placeholder="Physics, Chapter 1, Notes..." value={blogTags} onChange={e=>setBlogTags(e.target.value)}></textarea></div>
                            </div>
                        </div>
                    </div>
                )}
              </div>
            )}

            {/* === TAB 4: COURSES (Fully Implemented) === */}
            {activeTab === 'courses' && (
              <div className="space-y-8 animate-fade-in">
                <h2 className="text-3xl font-black text-slate-900">Courses Manager</h2>
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* FORM */}
                    <div className="xl:col-span-4">
                        <div className="card p-6 sticky top-28">
                            <h3 className="card-title mb-6">{editingCourseId?"Edit Course":"Launch New Course"}</h3>
                            <div className="space-y-4">
                                <div><label className="label">Course Title</label><input className="input-field font-bold" value={cTitle} onChange={e=>setCTitle(e.target.value)} placeholder="e.g. Complete Web Dev" /></div>
                                <div><label className="label">Instructor</label><input className="input-field" value={cInstructor} onChange={e=>setCInstructor(e.target.value)} placeholder="John Doe" /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="label">Price</label><input className="input-field" value={cPrice} onChange={e=>setCPrice(e.target.value)} placeholder="5000" /></div>
                                    <div><label className="label text-green-600">Discount</label><input className="input-field border-green-200 text-green-700 bg-green-50" value={cDiscountPrice} onChange={e=>setCDiscountPrice(e.target.value)} placeholder="3500" /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="label">Duration</label><input className="input-field" value={cDuration} onChange={e=>setCDuration(e.target.value)} placeholder="3 Months" /></div>
                                    <div><label className="label text-blue-600">Form Link</label><input className="input-field" value={cLink} onChange={e=>setCLink(e.target.value)} placeholder="Google Form..." /></div>
                                </div>
                                <div><label className="label">Description</label><div className="border rounded-lg overflow-hidden"><SunEditor setContents={cDesc} onChange={setCDesc} setOptions={{...editorOptions, minHeight:"150px"}}/></div></div>
                                <div className="dropzone small"><span className="text-xl">📸</span><span className="text-xs font-bold text-slate-500 mt-1">Thumbnail</span><input type="file" onChange={e=>setCImage(e.target.files?.[0]||null)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*"/></div>
                                
                                <button onClick={handleCourseSubmit} disabled={submitting} className="btn-black w-full py-3 text-lg">{submitting?"Processing...":editingCourseId?"Update":"Launch"}</button>
                                {editingCourseId && <button onClick={()=>setEditingCourseId(null)} className="w-full text-red-500 text-xs font-bold py-2">Cancel</button>}
                            </div>
                        </div>
                    </div>
                    {/* LIST */}
                    <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {coursesList.map(c => (
                            <div key={c.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group relative">
                                <div className="h-48 bg-slate-200 relative">
                                    {c.thumbnail_url && <img src={c.thumbnail_url} className="w-full h-full object-cover"/>}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                                        <button onClick={()=>loadCourseForEdit(c)} className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:scale-105 transition">Edit</button>
                                        <button onClick={()=>deleteItem('courses',c.id,fetchCourses)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:scale-105 transition">Delete</button>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-slate-900 mb-1">{c.title}</h3>
                                    <p className="text-sm text-slate-500 mb-4">{c.instructor}</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl font-bold text-green-600">{c.discount_price || c.price}</span>
                                        {c.discount_price && <span className="text-sm text-slate-400 line-through decoration-2">{c.price}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            )}

            {/* === TAB 5: NEWS CMS (Fully Implemented) === */}
            {activeTab === 'news' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="flex justify-between items-center"><h2 className="text-3xl font-black text-slate-900">Newsroom</h2>{editingNewsId && <button onClick={cancelNewsEdit} className="text-red-500 font-bold border px-4 py-2 rounded-lg bg-white">Cancel Edit</button>}</div>
                 <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* EDITOR (8 cols) */}
                    <div className="xl:col-span-8 space-y-6">
                        <input className="text-4xl font-black w-full bg-transparent border-b border-slate-300 pb-4 outline-none placeholder-slate-300 focus:border-black transition" placeholder="Headline..." value={newsTitle} onChange={e=>setNewsTitle(e.target.value)} />
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]"><SunEditor setContents={newsContent} onChange={setNewsContent} setOptions={{...editorOptions, minHeight:"500px"}} /></div>
                    </div>
                    {/* SETTINGS (4 cols) */}
                    <div className="xl:col-span-4 space-y-6">
                        <div className="card p-6">
                            <h3 className="card-title mb-4">Publishing</h3>
                            <button onClick={handleNewsSubmit} disabled={submitting} className="btn-primary w-full py-3 mb-6 shadow-lg shadow-blue-500/20">{submitting?"Publishing...":editingNewsId?"Update":"Publish Now"}</button>
                            <div className="space-y-4">
                                <div>
                                    <label className="label">Category</label>
                                    <select className="input-field mb-2" value={selectedCategory} onChange={e=>setSelectedCategory(e.target.value)}><option>General</option>{categoryList.map(c=><option key={c.id}>{c.name}</option>)}</select>
                                    <div className="flex gap-2"><input className="input-field py-2 text-xs" placeholder="New Category" value={newCategoryInput} onChange={e=>setNewCategoryInput(e.target.value)} /><button onClick={createCategory} className="btn-black py-1 px-3 text-xs">Add</button></div>
                                </div>
                                <div className="dropzone small"><span className="text-xl">📸</span><span className="text-xs font-bold text-slate-500 mt-1">Cover Image</span><input type="file" onChange={e=>setNewsFile(e.target.files?.[0]||null)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*"/></div>
                                <div><label className="label">Tags</label><textarea className="input-field h-24 resize-none" placeholder="Tags..." value={newsTags} onChange={e=>setNewsTags(e.target.value)}></textarea></div>
                            </div>
                        </div>
                        {/* RECENT LIST */}
                        <div className="card p-0 overflow-hidden">
                            <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-500 uppercase tracking-wider">Recent Articles</div>
                            <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                {newsList.map(n => (
                                    <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer flex justify-between items-center group transition">
                                        <span className="font-bold text-sm text-slate-700 truncate w-2/3">{n.title}</span>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                            <button onClick={()=>loadNewsForEdit(n)} className="text-blue-600 text-xs font-bold">Edit</button>
                                            <button onClick={()=>deleteItem('news',n.id,fetchNews)} className="text-red-600 text-xs font-bold">Del</button>
                                        </div>
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

      {/* --- GLOBAL STYLES (Tailwind Utilities) --- */}
      <style jsx global>{`
        .card { @apply bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden; }
        .card-header { @apply p-4 border-b border-slate-100 bg-slate-50/50; }
        .card-title { @apply font-bold text-slate-800 text-sm uppercase tracking-wide; }
        .label { @apply block text-xs font-bold text-slate-400 uppercase mb-1.5; }
        .input-field { @apply w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition shadow-sm; }
        .btn-primary { @apply bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 py-2 transition transform active:scale-95; }
        .btn-success { @apply bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl px-6 py-2 transition transform active:scale-95; }
        .btn-black { @apply bg-slate-900 hover:bg-black text-white font-bold rounded-xl px-6 py-2 transition transform active:scale-95; }
        .btn-icon { @apply bg-slate-900 text-white w-10 rounded-xl flex items-center justify-center font-bold hover:bg-black transition; }
        .list-container { @apply space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar; }
        .list-item { @apply p-3 rounded-xl flex justify-between items-center text-sm font-bold bg-white border border-slate-100 hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition shadow-sm; }
        .list-item.active { @apply bg-slate-900 text-white border-slate-900; }
        .delete-btn { @apply text-slate-300 hover:text-red-500 font-bold px-2 transition; }
        .dropzone { @apply relative border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition cursor-pointer bg-white; }
        .dropzone.small { @apply p-4; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}