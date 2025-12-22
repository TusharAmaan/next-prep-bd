"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

// Import SunEditor CSS
import 'suneditor/dist/css/suneditor.min.css'; 

// Import Katex & CSS
import katex from 'katex'; 
import 'katex/dist/katex.min.css'; 

// Dynamic Import for Editor
const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
});

// --- PRO EDITOR CONFIG (FIXED TYPES) ---
// We add ': any' here to stop TypeScript from complaining about "classic" vs string
const editorOptions: any = {
    minHeight: "400px", 
    height: "auto",
    placeholder: "Start writing your content here...",
    
    // 1. "Google Docs" Style Toolbar
    buttonList: [
        ['undo', 'redo'],
        ['save', 'print', 'template'],
        ['font', 'fontSize', 'formatBlock'],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['removeFormat'],
        ['fontColor', 'hiliteColor', 'textStyle'],
        ['outdent', 'indent'],
        ['align', 'horizontalRule', 'list', 'lineHeight'],
        ['table', 'link', 'image', 'video', 'math'], 
        ['fullScreen', 'showBlocks', 'codeView', 'preview']
    ],
    
    // 2. FIX STYLE STRIPPING
    mode: "classic", 
    attributesWhitelist: {
        all: "style", // IMPORTANT: Allows inline CSS like <span style="color:red">
    },
    defaultStyle: "font-family: 'Inter', sans-serif; font-size: 16px; line-height: 1.6;",
    
    // 3. ADVANCED TABLE HANDLING
    resizingBar: true,
    showPathLabel: true,
    katex: katex 
};

type ModalState = {
    isOpen: boolean;
    type: 'success' | 'confirm' | 'error';
    message: string;
    onConfirm?: () => void;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("materials"); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- REFS ---
  const editorRef = useRef<any>(null);
  const getSunEditorInstance = (sunEditor: any) => {
      editorRef.current = sunEditor;
  };

  // --- MODAL STATE ---
  const [modal, setModal] = useState<ModalState>({ isOpen: false, type: 'success', message: '' });

  // --- DATA STATE ---
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [ebooksList, setEbooksList] = useState<any[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [segmentUpdates, setSegmentUpdates] = useState<any[]>([]);

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
  
  // Resource & Blog Form
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
  const [ebLink, setEbLink] = useState(""); 
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

  // Update Form
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateType, setUpdateType] = useState("routine");
  const [updateSegmentId, setUpdateSegmentId] = useState("");
  const [updateContent, setUpdateContent] = useState("");
  const [updateFile, setUpdateFile] = useState<File | null>(null);
  const [editingUpdateId, setEditingUpdateId] = useState<number | null>(null);


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
    fetchSegments(); fetchNews(); fetchCategories(); fetchEbooks(); fetchCourses(); fetchSegmentUpdates();
  }, []);

  const showSuccess = (msg: string) => setModal({ isOpen: true, type: 'success', message: msg });
  const showError = (msg: string) => setModal({ isOpen: true, type: 'error', message: msg });
  const confirmAction = (msg: string, action: () => void) => setModal({ isOpen: true, type: 'confirm', message: msg, onConfirm: action });
  const closeModal = () => setModal({ ...modal, isOpen: false });

  // --- FETCHERS ---
  const fetchSegments = async () => { const {data} = await supabase.from("segments").select("*").order('id'); setSegments(data||[]); };
  const fetchGroups = async (segId: string) => { const {data} = await supabase.from("groups").select("*").eq("segment_id", segId).order('id'); setGroups(data||[]); };
  const fetchSubjects = async (grpId: string) => { const {data} = await supabase.from("subjects").select("*").eq("group_id", grpId).order('id'); setSubjects(data||[]); };
  
  const fetchResources = async (segId: string | null, grpId: string | null, subId: string | null) => { 
      let query = supabase.from("resources").select("*").order('created_at',{ascending:false});
      if (subId) { query = query.eq("subject_id", subId); } 
      else if (grpId) { query = query.eq("group_id", grpId).is("subject_id", null); } 
      else if (segId) { query = query.eq("segment_id", segId).is("group_id", null).is("subject_id", null); } 
      else { setResources([]); return; }
      const {data} = await query; 
      setResources(data||[]); 
  };

  const fetchNews = async () => { const {data} = await supabase.from("news").select("*").order('created_at',{ascending:false}); setNewsList(data||[]); };
  const fetchCategories = async () => { const {data} = await supabase.from("categories").select("*").order('name'); setCategoryList(data||[]); };
  const fetchEbooks = async () => { const {data} = await supabase.from("ebooks").select("*").order('created_at',{ascending:false}); setEbooksList(data||[]); };
  const fetchCourses = async () => { const {data} = await supabase.from("courses").select("*").order('created_at',{ascending:false}); setCoursesList(data||[]); };
  const fetchSegmentUpdates = async () => { const {data} = await supabase.from("segment_updates").select("*, segments(title)").order('created_at',{ascending:false}); setSegmentUpdates(data||[]); };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };
  
  const deleteItem = (table: string, id: number, refresh: () => void) => {
    confirmAction("Are you sure you want to delete this item?", async () => {
        await supabase.from(table).delete().eq("id", id);
        refresh();
        showSuccess("Item deleted successfully.");
    });
  };

  const handleSegmentClick = (id: string) => { setSelectedSegment(id); setSelectedGroup(""); setSelectedSubject(""); setGroups([]); setSubjects([]); fetchGroups(id); fetchResources(id, null, null); };
  const handleGroupClick = (id: string) => { setSelectedGroup(id); setSelectedSubject(""); setSubjects([]); fetchSubjects(id); fetchResources(selectedSegment, id, null); };
  const handleSubjectClick = (id: string) => { setSelectedSubject(id); fetchResources(selectedSegment, selectedGroup, id); };

  const handleSegmentSubmit = async () => { if(!newSegment) return; await supabase.from('segments').insert([{title:newSegment, slug:newSegment.toLowerCase().replace(/\s+/g,'-')}]); setNewSegment(""); fetchSegments(); };
  const handleGroupSubmit = async () => { if(!newGroup || !selectedSegment) return; await supabase.from('groups').insert([{title:newGroup, slug:newGroup.toLowerCase().replace(/\s+/g,'-'), segment_id: Number(selectedSegment)}]); setNewGroup(""); fetchGroups(selectedSegment); };
  const handleSubjectSubmit = async () => { if(!newSubject || !selectedGroup) return; await supabase.from('subjects').insert([{title:newSubject, slug:newSubject.toLowerCase().replace(/\s+/g,'-'), group_id: Number(selectedGroup), segment_id: Number(selectedSegment)}]); setNewSubject(""); fetchSubjects(selectedGroup); };

  const resetResourceForm = () => { setEditingResourceId(null); setResTitle(""); setResLink(""); setResFile(null); setRichContent(""); setQuestionContent(""); setSeoTitle(""); setSeoDescription(""); setBlogImageFile(null); setBlogTags(""); setResType("pdf"); setIsBlogEditorOpen(false); };
  const loadResourceForEdit = (r: any) => { setEditingResourceId(r.id); setResTitle(r.title); setResType(r.type); setResLink(r.content_url||""); setRichContent(r.content_body || ""); setQuestionContent(r.content_body || ""); setSeoTitle(r.seo_title||""); setSeoDescription(r.seo_description||""); setBlogTags(r.tags?.join(", ")||""); if(r.type==='blog') setIsBlogEditorOpen(true); };
  
  const uploadResource = async (typeOverride?: string) => {
      const type = typeOverride || resType;
      if(!resTitle) return showError("Title is required!");
      if(type !== 'blog' && !selectedSegment) return showError("Please select at least a Segment.");
      
      let finalContent = richContent;
      if(type === 'blog' && editorRef.current) finalContent = editorRef.current.getContents();
      else if (type === 'question') finalContent = questionContent; 

      if (type === 'blog' && (!finalContent || finalContent.trim() === '')) return showError("Blog content cannot be empty.");

      setSubmitting(true);
      let url = resLink;
      let file = (type==='pdf') ? resFile : (type==='blog') ? blogImageFile : null;
      if(file) {
          const name = `${type}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
          await supabase.storage.from('materials').upload(name, file);
          url = supabase.storage.from('materials').getPublicUrl(name).data.publicUrl;
      }

      const payload: any = { title: resTitle, type };
      if(selectedSegment) payload.segment_id = Number(selectedSegment);
      if(selectedGroup) payload.group_id = Number(selectedGroup);
      if(selectedSubject) payload.subject_id = Number(selectedSubject);

      if(type==='pdf' || type==='video') payload.content_url = url;
      else if(type==='question') { payload.content_body = finalContent; payload.seo_title = seoTitle || resTitle; payload.seo_description = seoDescription; }
      else if(type==='blog') { payload.content_body = finalContent; if(url) payload.content_url = url; payload.tags = blogTags.split(',').map(t=>t.trim()); }

      const { error } = editingResourceId ? await supabase.from('resources').update(payload).eq('id', editingResourceId) : await supabase.from('resources').insert([payload]);
      setSubmitting(false);
      if (error) { showError("Failed to save: " + error.message); } 
      else {
          fetchResources(selectedSegment, selectedGroup, selectedSubject);
          if(type === 'blog') { setIsBlogEditorOpen(false); showSuccess("Blog post published!"); } 
          else { resetResourceForm(); showSuccess("Resource uploaded!"); }
      }
  };

  const handleUpdateSubmit = async () => {
    if(!updateTitle) return showError("Title is required");
    if(!updateSegmentId) return showError("Please select a segment");
    setSubmitting(true);
    let url = null;
    if(updateFile) {
        const name = `update-${Date.now()}-${updateFile.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
        await supabase.storage.from('materials').upload(name, updateFile);
        url = supabase.storage.from('materials').getPublicUrl(name).data.publicUrl;
    }
    const payload: any = { title: updateTitle, type: updateType, segment_id: Number(updateSegmentId), content_body: updateContent };
    if(url) payload.attachment_url = url;
    const { error } = editingUpdateId ? await supabase.from('segment_updates').update(payload).eq('id', editingUpdateId) : await supabase.from('segment_updates').insert([payload]);
    setSubmitting(false);
    if(error) showError("Error: " + error.message); else { setEditingUpdateId(null); setUpdateTitle(""); setUpdateContent(""); setUpdateFile(null); fetchSegmentUpdates(); showSuccess("Update published!"); }
  };
  const loadUpdateForEdit = (u: any) => { setEditingUpdateId(u.id); setUpdateTitle(u.title); setUpdateType(u.type); setUpdateSegmentId(u.segment_id); setUpdateContent(u.content_body || ""); window.scrollTo({top:0, behavior:'smooth'}); };
  const cancelUpdateEdit = () => { setEditingUpdateId(null); setUpdateTitle(""); setUpdateContent(""); setUpdateFile(null); };

  const handleEbookSubmit = async () => {
    if (!ebTitle) return showError("Title is required");
    setSubmitting(true);
    const cover = (document.getElementById('eb-cover') as HTMLInputElement)?.files?.[0];
    let cUrl = null;
    if (cover) { const n = `cover-${Date.now()}`; await supabase.storage.from('covers').upload(n, cover); cUrl = supabase.storage.from('covers').getPublicUrl(n).data.publicUrl; }
    const payload: any = { title: ebTitle, author: ebAuthor, category: ebCategory, description: ebDescription, tags: ebTags.split(',').map(t => t.trim()), pdf_url: ebLink };
    if (cUrl) payload.cover_url = cUrl;
    const { error } = editingEbookId ? await supabase.from('ebooks').update(payload).eq('id', editingEbookId) : await supabase.from('ebooks').insert([payload]);
    setSubmitting(false); if (error) showError("Error: " + error.message); else { setEditingEbookId(null); setEbTitle(""); setEbAuthor(""); setEbDescription(""); setEbTags(""); setEbLink(""); fetchEbooks(); showSuccess("eBook saved!"); }
  };
  const loadEbookForEdit = (b: any) => { setEditingEbookId(b.id); setEbTitle(b.title); setEbAuthor(b.author); setEbCategory(b.category); setEbDescription(b.description || ""); setEbTags(b.tags?.join(", ")); setEbLink(b.pdf_url || ""); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const cancelEbookEdit = () => { setEditingEbookId(null); setEbTitle(""); setEbAuthor(""); setEbDescription(""); setEbTags(""); };

  const handleCourseSubmit = async () => {
      if(!cTitle) return showError("Course Title is required");
      setSubmitting(true);
      let thumb = null;
      if(cImage) { const n = `course-${Date.now()}`; await supabase.storage.from('materials').upload(n, cImage); thumb = supabase.storage.from('materials').getPublicUrl(n).data.publicUrl; }
      const payload: any = { title: cTitle, instructor: cInstructor, price: cPrice, discount_price: cDiscountPrice, duration: cDuration, enrollment_link: cLink, description: cDesc };
      if(thumb) payload.thumbnail_url = thumb;
      if(editingCourseId) await supabase.from('courses').update(payload).eq('id', editingCourseId); else { if(!thumb) {showError("Thumbnail is required"); setSubmitting(false); return;} payload.thumbnail_url = thumb; await supabase.from('courses').insert([payload]); }
      setSubmitting(false); setEditingCourseId(null); setCTitle(""); setCInstructor(""); setCPrice(""); setCDiscountPrice(""); setCDuration(""); setCLink(""); setCDesc(""); setCImage(null); fetchCourses(); showSuccess("Course saved!");
  };
  const loadCourseForEdit = (c:any) => { setEditingCourseId(c.id); setCTitle(c.title); setCInstructor(c.instructor); setCPrice(c.price); setCDiscountPrice(c.discount_price); setCDuration(c.duration); setCLink(c.enrollment_link); setCDesc(c.description || ""); window.scrollTo({top:0, behavior:'smooth'}); };

  const createCategory = async () => { if(newCategoryInput) { await supabase.from('categories').insert([{name:newCategoryInput}]); setNewCategoryInput(""); fetchCategories(); }};
  const handleNewsSubmit = async () => {
      if(!newsTitle) return showError("Headline is required");
      setSubmitting(true);
      let url = null;
      if(newsFile) { const n = `news-${Date.now()}`; await supabase.storage.from('materials').upload(n, newsFile); url = supabase.storage.from('materials').getPublicUrl(n).data.publicUrl; }
      const payload: any = { title: newsTitle, content: newsContent, category: selectedCategory, tags: newsTags.split(',').map(t=>t.trim()) };
      if(url) payload.image_url = url;
      if(editingNewsId) await supabase.from('news').update(payload).eq('id', editingNewsId); else await supabase.from('news').insert([payload]);
      setSubmitting(false); setEditingNewsId(null); setNewsTitle(""); setNewsContent(""); setNewsFile(null); fetchNews(); showSuccess("News published!");
  };
  const loadNewsForEdit = (n:any) => { setEditingNewsId(n.id); setNewsTitle(n.title); setNewsContent(n.content || ""); setSelectedCategory(n.category); setNewsTags(n.tags?.join(", ")); window.scrollTo({top:0, behavior:'smooth'}); };
  const cancelNewsEdit = () => { setEditingNewsId(null); setNewsTitle(""); setNewsContent(""); setNewsTags(""); };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-bold">Admin Panel Loading...</div>;
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* MODAL */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full transform transition-all scale-100">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${modal.type === 'success' ? 'bg-green-100 text-green-600' : modal.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    <span className="text-3xl">{modal.type === 'success' ? '✓' : modal.type === 'error' ? '✕' : '?'}</span>
                </div>
                <h3 className="text-xl font-bold text-center mb-2 capitalize">{modal.type === 'confirm' ? 'Are you sure?' : modal.type}</h3>
                <p className="text-slate-500 text-center text-sm mb-6">{modal.message}</p>
                <div className="flex gap-3 justify-center">
                    {modal.type === 'confirm' ? (
                        <>
                            <button onClick={closeModal} className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                            <button onClick={() => { modal.onConfirm && modal.onConfirm(); closeModal(); }} className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-black">Confirm</button>
                        </>
                    ) : (
                        <button onClick={closeModal} className="px-8 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-black">Okay</button>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed top-20 bottom-0 z-20 hidden md:flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Command Center</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {[
                { id: 'materials', label: 'Study Materials', icon: '📂' },
                { id: 'updates', label: 'Segment Updates', icon: '📢' }, 
                { id: 'class-blogs', label: 'Class Blogs', icon: '✍️' },
                { id: 'ebooks', label: 'Manage eBooks', icon: '📚' },
                { id: 'courses', label: 'Manage Courses', icon: '🎓' },
                { id: 'news', label: 'News CMS', icon: '📰' },
            ].map((tab) => (
                <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id)} 
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                    <span className="text-lg">{tab.icon}</span> {tab.label}
                </button>
            ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">Sign Out</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 p-8 pt-28 overflow-x-hidden min-h-screen">
        <div className="max-w-[1600px] mx-auto w-full">
            
            {/* MOBILE NAV */}
            <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {['materials','updates','class-blogs','ebooks','courses','news'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-full text-xs font-bold border whitespace-nowrap ${activeTab===t?'bg-blue-600 text-white':'bg-white text-slate-600'}`}>{t.toUpperCase()}</button>
                ))}
            </div>

            {/* === TAB: STUDY MATERIALS === */}
            {activeTab === 'materials' && (
              <div className="space-y-8 animate-fade-in">
                {/* 1. HIERARCHY SELECTOR */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* SEGMENTS */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-80">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center"><span className="text-xs font-bold text-slate-500 uppercase tracking-wider">1. Segments</span><span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{segments.length}</span></div>
                        <div className="p-3 border-b border-slate-100 flex gap-2"><input className="w-full text-sm p-2 bg-white border rounded-lg focus:ring-2 ring-blue-100 outline-none" placeholder="New Segment..." value={newSegment} onChange={e=>setNewSegment(e.target.value)} /><button onClick={handleSegmentSubmit} className="bg-blue-600 text-white w-8 rounded-lg font-bold hover:bg-blue-700">+</button></div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">{segments.map(s => (<div key={s.id} onClick={()=>handleSegmentClick(s.id)} className={`flex justify-between items-center p-3 rounded-lg cursor-pointer text-sm font-bold transition-all ${selectedSegment===s.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}><span>{s.title}</span><button onClick={(e)=>{e.stopPropagation();deleteItem('segments',s.id,fetchSegments)}} className={`px-2 ${selectedSegment===s.id?'text-white/70 hover:text-white':'text-slate-300 hover:text-red-500'}`}>×</button></div>))}</div>
                    </div>
                    {/* GROUPS */}
                    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-80 ${!selectedSegment ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center"><span className="text-xs font-bold text-slate-500 uppercase tracking-wider">2. Groups</span><span className="text-xs font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full">{groups.length}</span></div>
                        <div className="p-3 border-b border-slate-100 flex gap-2"><input className="w-full text-sm p-2 bg-white border rounded-lg focus:ring-2 ring-green-100 outline-none" placeholder="New Group..." value={newGroup} onChange={e=>setNewGroup(e.target.value)} /><button onClick={handleGroupSubmit} className="bg-green-600 text-white w-8 rounded-lg font-bold hover:bg-green-700">+</button></div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">{groups.map(g => (<div key={g.id} onClick={()=>handleGroupClick(g.id)} className={`flex justify-between items-center p-3 rounded-lg cursor-pointer text-sm font-bold transition-all ${selectedGroup===g.id ? 'bg-green-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}><span>{g.title}</span><button onClick={(e)=>{e.stopPropagation();deleteItem('groups',g.id,()=>fetchGroups(selectedSegment))}} className={`px-2 ${selectedGroup===g.id?'text-white/70 hover:text-white':'text-slate-300 hover:text-red-500'}`}>×</button></div>))}</div>
                    </div>
                    {/* SUBJECTS */}
                    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-80 ${!selectedGroup ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center"><span className="text-xs font-bold text-slate-500 uppercase tracking-wider">3. Subjects</span><span className="text-xs font-bold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">{subjects.length}</span></div>
                        <div className="p-3 border-b border-slate-100 flex gap-2"><input className="w-full text-sm p-2 bg-white border rounded-lg focus:ring-2 ring-purple-100 outline-none" placeholder="New Subject..." value={newSubject} onChange={e=>setNewSubject(e.target.value)} /><button onClick={handleSubjectSubmit} className="bg-purple-600 text-white w-8 rounded-lg font-bold hover:bg-purple-700">+</button></div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">{subjects.map(s => (<div key={s.id} onClick={()=>handleSubjectClick(s.id)} className={`flex justify-between items-center p-3 rounded-lg cursor-pointer text-sm font-bold transition-all ${selectedSubject===s.id ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}><span>{s.title}</span><button onClick={(e)=>{e.stopPropagation();deleteItem('subjects',s.id,()=>fetchSubjects(selectedGroup))}} className={`px-2 ${selectedSubject===s.id?'text-white/70 hover:text-white':'text-slate-300 hover:text-red-500'}`}>×</button></div>))}</div>
                    </div>
                </div>

                {/* 2. CONTENT MANAGER */}
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${!selectedSegment ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                    <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-800">4. Add New Resource</h3>
                            {editingResourceId && <button onClick={resetResourceForm} className="text-xs text-red-500 font-bold bg-red-50 px-3 py-1 rounded-full">Cancel Editing</button>}
                        </div>
                        <div className="space-y-5">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Type</label>
                                    <select className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold outline-none" value={resType} onChange={e=>setResType(e.target.value)}>
                                        <option value="pdf">📄 PDF Document</option>
                                        <option value="video">🎬 Video Class</option>
                                        <option value="question">❓ Question</option>
                                        <option value="blog">✍️ Blog Post</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Title</label>
                                    <input className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none font-medium" value={resTitle} onChange={e=>setResTitle(e.target.value)} placeholder="Resource Title..." />
                                </div>
                            </div>
                            
                            {/* Current Context Display */}
                            <div className="text-xs font-bold bg-slate-100 p-2 rounded text-slate-500">
                                Posting to: <span className="text-blue-600">{segments.find(s=>s.id.toString()===selectedSegment)?.title}</span>
                                {selectedGroup && <span> › <span className="text-green-600">{groups.find(g=>g.id.toString()===selectedGroup)?.title}</span></span>}
                                {selectedSubject && <span> › <span className="text-purple-600">{subjects.find(s=>s.id.toString()===selectedSubject)?.title}</span></span>}
                            </div>

                            {/* Dynamic Inputs */}
                            {resType === 'pdf' && (
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition relative group">
                                    <input type="file" onChange={e => setResFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="application/pdf" />
                                    <span className="text-4xl block mb-2 transition-transform group-hover:scale-110">📂</span>
                                    <p className="text-sm font-bold text-slate-600">{resFile ? resFile.name : "Drop PDF Here or Click to Browse"}</p>
                                </div>
                            )}
                            {resType === 'video' && (<input className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none" value={resLink} onChange={e=>setResLink(e.target.value)} placeholder="YouTube Embed Link..." />)}
                            {resType === 'question' && (
                                <div className="space-y-3">
                                    <div className="border rounded-xl overflow-hidden"><SunEditor key={editingResourceId || 'new-question'} setContents={questionContent} onChange={(content) => setQuestionContent(content)} setOptions={{...editorOptions, katex:katex}} /></div>
                                    <input className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs" value={seoTitle} onChange={e=>setSeoTitle(e.target.value)} placeholder="SEO Title" />
                                </div>
                            )}
                            {resType === 'blog' && (<div className="p-6 bg-blue-50 text-blue-700 text-sm rounded-xl border border-blue-100 flex items-center gap-4"><span className="text-2xl">✍️</span><p>Please switch to the <strong>"Class Blogs"</strong> tab to write full articles with the dedicated editor.</p></div>)}

                            {resType !== 'blog' && (
                                <button onClick={()=>uploadResource()} disabled={submitting} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition shadow-lg shadow-slate-200">
                                    {submitting ? "Uploading..." : editingResourceId ? "Update Resource" : "Upload Now"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: LIBRARY LIST */}
                    <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[500px] lg:h-auto">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50"><h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Library ({resources.length})</h4></div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            {resources.length === 0 && <div className="text-center text-slate-400 text-sm mt-10">No resources found for this level.</div>}
                            {resources.map(r => (
                                <div key={r.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center group hover:border-blue-300 transition">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${r.type==='pdf'?'bg-red-50 text-red-500':r.type==='video'?'bg-blue-50 text-blue-500':'bg-yellow-50 text-yellow-600'}`}>{r.type==='pdf'?'📄':r.type==='video'?'▶':'❓'}</div>
                                        <div className="min-w-0"><h5 className="text-xs font-bold text-slate-700 truncate w-32">{r.title}</h5><span className="text-[10px] text-slate-400 uppercase">{new Date(r.created_at).toLocaleDateString()}</span></div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition"><button onClick={()=>loadResourceForEdit(r)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600">✏️</button><button onClick={()=>deleteItem('resources',r.id,()=>fetchResources(selectedSegment, selectedGroup, selectedSubject))} className="p-1.5 hover:bg-red-50 rounded text-red-600">🗑️</button></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
              </div>
            )}

            {/* === TAB: SEGMENT UPDATES === */}
            {activeTab === 'updates' && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-slate-800">Segment Updates (Admin)</h2>{editingUpdateId && <button onClick={cancelUpdateEdit} className="text-red-500 font-bold border px-3 py-1 rounded">Cancel Edit</button>}</div>
                
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <div className="xl:col-span-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Target Segment</label>
                                <select className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold" value={updateSegmentId} onChange={e=>setUpdateSegmentId(e.target.value)}>
                                    <option value="">Select Segment...</option>
                                    {segments.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Update Type</label>
                                <select className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold" value={updateType} onChange={e=>setUpdateType(e.target.value)}>
                                    <option value="routine">📅 Routine</option>
                                    <option value="syllabus">📝 Syllabus</option>
                                    <option value="exam_result">🏆 Exam Result</option>
                                </select>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Update Title</label>
                            <input className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none" placeholder="e.g. HSC 2026 Revised Routine" value={updateTitle} onChange={e=>setUpdateTitle(e.target.value)} />
                          </div>
                          <div className="border rounded-xl overflow-hidden">
                            {/* Updated Editor with Callback */}
                            <SunEditor key={editingUpdateId || 'update-editor'} setContents={updateContent} onChange={(content) => setUpdateContent(content)} setOptions={{...editorOptions, callBackSave: handleUpdateSubmit}} />
                          </div>
                          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:bg-blue-50 relative">
                             <input type="file" onChange={e => setUpdateFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                             <span className="text-2xl">📎</span> <span className="text-sm font-bold text-slate-600">{updateFile ? updateFile.name : "Attach PDF/Image (Optional)"}</span>
                          </div>
                          <button onClick={handleUpdateSubmit} disabled={submitting} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg">{submitting ? "Publishing..." : "Publish Update"}</button>
                    </div>

                    <div className="xl:col-span-4 space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                             <h4 className="font-bold text-slate-500 uppercase text-xs mb-4">Recent Updates</h4>
                             <div className="space-y-3">
                                {segmentUpdates.map(u => (
                                    <div key={u.id} className="p-3 border rounded-lg hover:bg-slate-50 group relative">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${u.type==='routine'?'bg-blue-100 text-blue-600':u.type==='syllabus'?'bg-green-100 text-green-600':'bg-purple-100 text-purple-600'}`}>{u.type.replace('_', ' ')}</span>
                                                <h5 className="font-bold text-sm text-slate-800 mt-1">{u.title}</h5>
                                                <p className="text-xs text-slate-500">{u.segments?.title} • {new Date(u.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                                <button onClick={()=>loadUpdateForEdit(u)} className="text-blue-600 text-xs font-bold">Edit</button>
                                                <button onClick={()=>deleteItem('segment_updates',u.id,fetchSegmentUpdates)} className="text-red-600 text-xs font-bold">Del</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
              </div>
            )}

            {/* === TAB: EBOOKS === */}
            {activeTab === 'ebooks' && (
              <div className="space-y-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-slate-800">Manage eBooks</h2>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-lg text-slate-800 mb-6 border-b border-slate-100 pb-4">{editingEbookId?"Edit eBook Details":"Add New eBook"}</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-4 space-y-6">
                            <div className="space-y-4">
                                <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Book Title</label><input className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm font-bold outline-none" value={ebTitle} onChange={e=>setEbTitle(e.target.value)} placeholder="e.g. Physics First Paper" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Author</label><input className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm outline-none" value={ebAuthor} onChange={e=>setEbAuthor(e.target.value)} placeholder="Author" /></div>
                                    <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Category</label><select className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm outline-none cursor-pointer font-bold text-slate-700" value={ebCategory} onChange={e=>setEbCategory(e.target.value)}><option value="">Select Category</option>{segments.map(seg => (<option key={seg.id} value={seg.title}>{seg.title}</option>))}</select></div>
                                </div>
                                <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Tags</label><input className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm outline-none" value={ebTags} onChange={e=>setEbTags(e.target.value)} placeholder="Tags..." /></div>
                            </div>
                            <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl space-y-4">
                                <div><label className="text-xs font-bold text-blue-600 uppercase block mb-1.5 flex items-center gap-1"><span>🔗</span> Google Drive / PDF Link</label><input className="w-full bg-white border border-blue-200 text-blue-800 p-3.5 rounded-xl text-sm outline-none font-medium focus:ring-2 focus:ring-blue-500 transition shadow-sm" value={ebLink} onChange={e => setEbLink(e.target.value)} placeholder="https://drive.google.com/..." /></div>
                                <div><label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Cover Image</label><div className="relative group cursor-pointer"><input type="file" id="eb-cover" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*"/><div className="bg-white border-2 border-dashed border-slate-300 group-hover:border-blue-400 group-hover:bg-blue-50 transition-all rounded-xl p-3 flex items-center gap-3"><div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-xl group-hover:bg-white transition">🖼️</div><div className="flex-1"><p className="text-xs font-bold text-slate-600 group-hover:text-blue-600">Click to Upload Cover</p><p className="text-[10px] text-slate-400">JPG, PNG (Max 2MB)</p></div></div></div></div>
                            </div>
                        </div>
                        <div className="lg:col-span-8 flex flex-col"><label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Description & Links</label><div className="border border-slate-200 rounded-xl overflow-hidden flex-1 shadow-inner"><SunEditor key={editingEbookId || 'new-ebook'} setContents={ebDescription} onChange={(content) => setEbDescription(content)} setOptions={{...editorOptions, minHeight:"350px", callBackSave: handleEbookSubmit}} /></div></div>
                    </div>
                    <div className="mt-8 flex justify-end"><button onClick={handleEbookSubmit} disabled={submitting} className="bg-slate-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-black transition shadow-lg transform active:scale-95">{submitting?"Saving...":"Save eBook to Library"}</button></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {ebooksList.map(book => (
                        <div key={book.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4 group hover:border-blue-400 transition hover:shadow-md">
                            <div className="w-16 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 shadow-inner relative">{book.cover_url ? <img src={book.cover_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-bold">No Cover</div>}</div>
                            <div className="flex-1 flex flex-col"><span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full w-fit mb-2">{book.category}</span><h4 className="font-bold text-sm text-slate-800 leading-tight mb-1 line-clamp-2">{book.title}</h4><p className="text-xs text-slate-500 mb-auto line-clamp-1">{book.author}</p><div className="flex gap-2 mt-3"><button onClick={() => loadEbookForEdit(book)} className="flex-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 text-xs font-bold py-1.5 rounded-lg transition">Edit</button><button onClick={() => deleteItem('ebooks', book.id, fetchEbooks)} className="flex-1 bg-slate-100 hover:bg-red-600 hover:text-white text-slate-600 text-xs font-bold py-1.5 rounded-lg transition">Del</button></div></div>
                        </div>
                    ))}
                </div>
              </div>
            )}

            {/* === TAB: CLASS BLOGS === */}
            {activeTab === 'class-blogs' && (
              <div className="animate-fade-in">
                {!isBlogEditorOpen ? (
                    <div>
                        <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-slate-800">Class Blogs</h2><button onClick={()=>{resetResourceForm();setIsBlogEditorOpen(true);setResType('blog')}} className="bg-black text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-slate-800 transition">+ New Post</button></div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 mb-6">
                            <select className="w-full bg-slate-50 border p-3 rounded-lg font-bold text-sm outline-none" value={selectedSegment} onChange={e=>handleSegmentClick(e.target.value)}><option value="">Filter Segment</option>{segments.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                            <select className="w-full bg-slate-50 border p-3 rounded-lg font-bold text-sm outline-none" value={selectedGroup} onChange={e=>handleGroupClick(e.target.value)} disabled={!selectedSegment}><option value="">Filter Group</option>{groups.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select>
                            <select className="w-full bg-slate-50 border p-3 rounded-lg font-bold text-sm outline-none" value={selectedSubject} onChange={e=>handleSubjectClick(e.target.value)} disabled={!selectedGroup}><option value="">Filter Subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {resources.filter(r=>r.type==='blog').map(b=>(
                                <div key={b.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition group">
                                    <div className="h-40 bg-slate-100 relative">{b.content_url && <img src={b.content_url} className="w-full h-full object-cover"/>}<div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition"><button onClick={()=>loadResourceForEdit(b)} className="bg-white p-1.5 rounded shadow text-xs hover:text-blue-600">✏️</button><button onClick={()=>deleteItem('resources',b.id,()=>fetchResources(selectedSegment, selectedGroup, selectedSubject))} className="bg-white p-1.5 rounded shadow text-xs hover:text-red-500">🗑️</button></div></div>
                                    <div className="p-4"><h3 className="font-bold text-sm text-slate-800 line-clamp-2">{b.title}</h3></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 min-h-screen flex flex-col relative">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl sticky top-0 z-10">
                            <button onClick={()=>setIsBlogEditorOpen(false)} className="font-bold text-slate-500 hover:text-black flex items-center gap-2">← Cancel</button>
                            <button onClick={()=>uploadResource('blog')} disabled={submitting} className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-green-700 shadow-lg shadow-green-200">{submitting?"Publishing...":"Publish Post"}</button>
                        </div>
                        <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
                            <input className="text-5xl font-black w-full outline-none placeholder-slate-300 text-slate-900 bg-transparent" placeholder="Blog Title..." value={resTitle} onChange={e=>setResTitle(e.target.value)} />
                            <div className="min-h-[500px] border rounded-lg overflow-hidden shadow-sm">
                                {/* Pro Editor with Save Callback */}
                                <SunEditor 
                                    key={editingResourceId || 'new-blog'} 
                                    getSunEditorInstance={getSunEditorInstance} 
                                    setContents={richContent} 
                                    onChange={(content) => setRichContent(content)} 
                                    setOptions={{...editorOptions, callBackSave: () => uploadResource('blog')}} 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                                <div className="border-2 border-dashed p-6 rounded-lg text-center relative hover:bg-slate-50"><input type="file" onChange={e=>setBlogImageFile(e.target.files?.[0]||null)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*"/><span className="text-2xl">🖼️</span><p className="font-bold text-slate-400 text-xs mt-2">Cover Image</p>{blogImageFile && <p className="text-xs text-green-600 font-bold mt-1">{blogImageFile.name}</p>}</div>
                                <textarea className="w-full bg-slate-50 border p-4 rounded-lg text-sm resize-none outline-none" placeholder="Tags (comma separated)..." value={blogTags} onChange={e=>setBlogTags(e.target.value)}></textarea>
                            </div>
                        </div>
                    </div>
                )}
              </div>
            )}

            {/* === TAB: COURSES === */}
            {activeTab === 'courses' && (
              <div className="space-y-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-slate-800">Manage Courses</h2>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-lg text-slate-800 mb-6 border-b border-slate-100 pb-4">{editingCourseId?"Edit Course":"Create New Course"}</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-4 space-y-5">
                            <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Course Title</label><input className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm font-bold outline-none" value={cTitle} onChange={e=>setCTitle(e.target.value)} placeholder="e.g. Complete Web Dev" /></div>
                            <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Instructor</label><input className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm outline-none" value={cInstructor} onChange={e=>setCInstructor(e.target.value)} placeholder="Name" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Price</label><input className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm outline-none" value={cPrice} onChange={e=>setCPrice(e.target.value)} placeholder="5000" /></div>
                                <div><label className="text-xs font-bold text-green-600 uppercase block mb-1.5">Discount</label><input className="w-full bg-green-50 border border-green-200 text-green-700 p-3.5 rounded-xl text-sm outline-none" value={cDiscountPrice} onChange={e=>setCDiscountPrice(e.target.value)} placeholder="3500" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm outline-none" value={cDuration} onChange={e=>setCDuration(e.target.value)} placeholder="Duration" />
                                <input className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm outline-none text-blue-600" value={cLink} onChange={e=>setCLink(e.target.value)} placeholder="Form Link" />
                            </div>
                        </div>
                        <div className="lg:col-span-8 flex flex-col">
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Details & Visuals</label>
                            <div className="border border-slate-200 rounded-xl overflow-hidden flex-1 mb-4 shadow-inner"><SunEditor key={editingCourseId || 'new-course'} setContents={cDesc} onChange={(content) => setCDesc(content)} setOptions={{...editorOptions, minHeight:"350px", callBackSave: handleCourseSubmit}} /></div>
                            <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center cursor-pointer hover:bg-slate-50 relative"><span className="block text-xl">📸</span><span className="text-xs font-bold text-slate-400">Upload Thumbnail</span><input type="file" onChange={e=>setCImage(e.target.files?.[0]||null)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*"/></div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-4">
                        {editingCourseId && <button onClick={()=>setEditingCourseId(null)} className="text-red-500 font-bold px-6 py-3 border border-red-100 rounded-xl hover:bg-red-50">Cancel</button>}
                        <button onClick={handleCourseSubmit} disabled={submitting} className="bg-slate-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-black transition shadow-lg">{submitting?"Saving...":"Launch Course"}</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coursesList.map(c => (
                        <div key={c.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group relative">
                            <div className="h-40 bg-gray-200 relative">{c.thumbnail_url && <img src={c.thumbnail_url} className="w-full h-full object-cover"/>}<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center gap-3 backdrop-blur-sm"><button onClick={()=>loadCourseForEdit(c)} className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:scale-105 transition">Edit</button><button onClick={()=>deleteItem('courses',c.id,fetchCourses)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:scale-105 transition">Delete</button></div></div>
                            <div className="p-5"><h4 className="font-bold text-lg text-slate-900 mb-1">{c.title}</h4><p className="text-sm text-slate-500 mb-3 font-medium">{c.instructor}</p><div className="flex items-center gap-3"><span className="text-xl font-bold text-green-600">৳{c.discount_price || c.price}</span>{c.discount_price && <span className="text-sm text-slate-400 line-through decoration-2">৳{c.price}</span>}</div></div>
                        </div>
                    ))}
                </div>
              </div>
            )}

            {/* === TAB: NEWS === */}
            {activeTab === 'news' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-slate-800">Newsroom</h2>{editingNewsId && <button onClick={cancelNewsEdit} className="text-red-500 font-bold border px-3 py-1 rounded">Cancel Edit</button>}</div>
                 <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <div className="xl:col-span-8 space-y-4">
                        <input className="text-4xl font-black w-full bg-transparent border-b border-slate-300 pb-2 outline-none placeholder-slate-300" placeholder="Headline..." value={newsTitle} onChange={e=>setNewsTitle(e.target.value)} />
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <SunEditor key={editingNewsId || 'new-news'} setContents={newsContent} onChange={(content) => setNewsContent(content)} setOptions={{...editorOptions, callBackSave: handleNewsSubmit}} />
                        </div>
                    </div>
                    <div className="xl:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <button onClick={handleNewsSubmit} disabled={submitting} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition mb-6 shadow-lg shadow-blue-200">{submitting?"Publishing...":"Publish Now"}</button>
                            <div className="space-y-4">
                                <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1">Category</label><select className="w-full bg-slate-50 border p-2 rounded text-sm font-bold outline-none" value={selectedCategory} onChange={e=>setSelectedCategory(e.target.value)}><option>General</option>{categoryList.map(c=><option key={c.id}>{c.name}</option>)}</select><div className="flex gap-2 mt-2"><input className="w-full bg-slate-50 border p-2 rounded text-xs outline-none" placeholder="New..." value={newCategoryInput} onChange={e=>setNewCategoryInput(e.target.value)} /><button onClick={createCategory} className="bg-black text-white px-3 rounded text-xs font-bold">+</button></div></div>
                                <div className="p-4 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-slate-50 relative"><span className="block text-xl">📸</span><span className="text-xs font-bold text-slate-400">Cover Image</span><input type="file" onChange={e=>setNewsFile(e.target.files?.[0]||null)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*"/></div>
                                <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1">Tags</label><textarea className="w-full bg-slate-50 border p-2 rounded text-sm resize-none outline-none h-24" placeholder="Tags..." value={newsTags} onChange={e=>setNewsTags(e.target.value)}></textarea></div>
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