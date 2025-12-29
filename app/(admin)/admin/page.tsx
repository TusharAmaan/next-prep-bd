"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

import 'suneditor/dist/css/suneditor.min.css'; 
import katex from 'katex'; 
import 'katex/dist/katex.min.css'; 

const SunEditor = dynamic(() => import("suneditor-react"), { ssr: false });

const editorOptions: any = {
    minHeight: "400px", height: "auto", placeholder: "Start writing...",
    buttonList: [
        ['undo', 'redo'], ['save', 'print', 'template'], ['font', 'fontSize', 'formatBlock'],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'], ['removeFormat'],
        ['fontColor', 'hiliteColor', 'textStyle'], ['outdent', 'indent'],
        ['align', 'horizontalRule', 'list', 'lineHeight'], ['table', 'link', 'image', 'video', 'math'], 
        ['fullScreen', 'showBlocks', 'codeView', 'preview']
    ],
    mode: "classic", attributesWhitelist: { all: "style" },
    defaultStyle: "font-family: 'Inter', sans-serif; font-size: 16px; line-height: 1.6;",
    resizingBar: true, showPathLabel: true, katex: katex 
};

const PAGE_SIZE = 20;

type ModalState = { isOpen: boolean; type: 'success' | 'confirm' | 'error'; message: string; onConfirm?: () => void; };

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("materials"); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const editorRef = useRef<any>(null);
  const getSunEditorInstance = (sunEditor: any) => { editorRef.current = sunEditor; };

  // --- STATE ---
  const [modal, setModal] = useState<ModalState>({ isOpen: false, type: 'success', message: '' });
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]); // Global Categories State

  // Lists
  const [resources, setResources] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [ebooksList, setEbooksList] = useState<any[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [segmentUpdates, setSegmentUpdates] = useState<any[]>([]);

  // Search & Page
  const [resPage, setResPage] = useState(0); const [resSearch, setResSearch] = useState("");
  const [newsPage, setNewsPage] = useState(0); const [newsSearch, setNewsSearch] = useState("");
  const [ebPage, setEbPage] = useState(0); const [ebSearch, setEbSearch] = useState("");
  const [updatePage, setUpdatePage] = useState(0); const [updateSearch, setUpdateSearch] = useState("");

  // Hierarchy Selection
  const [selectedSegment, setSelectedSegment] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Shared UI
  const [submitting, setSubmitting] = useState(false);
  const [isBlogEditorOpen, setIsBlogEditorOpen] = useState(false);
  const [isManageCatsOpen, setIsManageCatsOpen] = useState(false); // New Category Modal
  const [activeCatContext, setActiveCatContext] = useState("news"); // Track which category type we are editing

  // SEO
  const [commonTags, setCommonTags] = useState(""); 
  const [commonSeoTitle, setCommonSeoTitle] = useState("");
  const [commonSeoDesc, setCommonSeoDesc] = useState("");

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
  const [blogImageMethod, setBlogImageMethod] = useState<'upload' | 'link'>('upload');
  const [blogImageFile, setBlogImageFile] = useState<File | null>(null);
  const [blogImageLink, setBlogImageLink] = useState("");
  const [blogTags, setBlogTags] = useState("");
  const [blogCategory, setBlogCategory] = useState(""); // NEW

  // News Form
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState(""); 
  const [newsCategory, setNewsCategory] = useState("");
  const [newsFile, setNewsFile] = useState<File | null>(null);
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);

  // eBook Form
  const [ebTitle, setEbTitle] = useState("");
  const [ebAuthor, setEbAuthor] = useState("");
  const [ebCategory, setEbCategory] = useState("");
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
  const [cCategory, setCCategory] = useState(""); // NEW
  const [cImage, setCImage] = useState<File | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);

  // Update Form
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateType, setUpdateType] = useState("routine"); // Now acts as Category
  const [updateSegmentId, setUpdateSegmentId] = useState("");
  const [updateContent, setUpdateContent] = useState("");
  const [updateFile, setUpdateFile] = useState<File | null>(null);
  const [editingUpdateId, setEditingUpdateId] = useState<number | null>(null);

  // --- INIT ---
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { setIsAuthenticated(true); loadInitialData(); } else { router.push("/login"); }
      setIsLoading(false);
    };
    init();
  }, [router]);

  const loadInitialData = () => {
    fetchSegments(); fetchCategories(); 
    fetchResources(selectedSegment, selectedGroup, selectedSubject);
    fetchNews(); fetchEbooks(); fetchCourses(); fetchSegmentUpdates();
  };

  // --- HELPERS ---
  const showSuccess = (msg: string) => setModal({ isOpen: true, type: 'success', message: msg });
  const showError = (msg: string) => setModal({ isOpen: true, type: 'error', message: msg });
  const confirmAction = (msg: string, action: () => void) => setModal({ isOpen: true, type: 'confirm', message: msg, onConfirm: action });
  const closeModal = () => setModal({ ...modal, isOpen: false });
  const clearSeoFields = () => { setCommonTags(""); setCommonSeoTitle(""); setCommonSeoDesc(""); };

  // --- FETCHERS ---
  const fetchSegments = async () => { const {data} = await supabase.from("segments").select("*").order('id'); setSegments(data||[]); };
  const fetchGroups = async (segId: string) => { const {data} = await supabase.from("groups").select("*").eq("segment_id", segId).order('id'); setGroups(data||[]); };
  const fetchSubjects = async (grpId: string) => { const {data} = await supabase.from("subjects").select("*").eq("group_id", grpId).order('id'); setSubjects(data||[]); };
  const fetchCategories = async () => { const {data} = await supabase.from("categories").select("*").order('name'); setCategories(data||[]); };

  const fetchResources = async (segId: string | null, grpId: string | null, subId: string | null) => { 
      let query = supabase.from("resources").select("*").order('created_at',{ascending:false});
      if (subId) query = query.eq("subject_id", subId); else if (grpId) query = query.eq("group_id", grpId); else if (segId) query = query.eq("segment_id", segId); else if (!resSearch) { setResources([]); return; }
      if (resSearch) query = query.ilike('title', `%${resSearch}%`);
      query = query.range(resPage * PAGE_SIZE, (resPage + 1) * PAGE_SIZE - 1);
      const {data} = await query; setResources(data||[]); 
  };
  useEffect(() => { if(activeTab === 'materials' || activeTab === 'class-blogs') fetchResources(selectedSegment, selectedGroup, selectedSubject); }, [resPage, resSearch]);

  const fetchNews = async () => { let q = supabase.from("news").select("*").order('created_at',{ascending:false}); if(newsSearch) q = q.ilike('title', `%${newsSearch}%`); q=q.range(newsPage*PAGE_SIZE,(newsPage+1)*PAGE_SIZE-1); const {data}=await q; setNewsList(data||[]); };
  useEffect(() => { if(activeTab === 'news') fetchNews(); }, [newsPage, newsSearch, activeTab]);

  const fetchEbooks = async () => { let q = supabase.from("ebooks").select("*").order('created_at',{ascending:false}); if(ebSearch) q=q.ilike('title',`%${ebSearch}%`); q=q.range(ebPage*PAGE_SIZE,(ebPage+1)*PAGE_SIZE-1); const {data}=await q; setEbooksList(data||[]); };
  useEffect(() => { if(activeTab === 'ebooks') fetchEbooks(); }, [ebPage, ebSearch, activeTab]);

  const fetchCourses = async () => { const {data} = await supabase.from("courses").select("*").order('created_at',{ascending:false}); setCoursesList(data||[]); };
  const fetchSegmentUpdates = async () => { let q=supabase.from("segment_updates").select("*, segments(title)").order('created_at',{ascending:false}); if(updateSearch) q=q.ilike('title',`%${updateSearch}%`); q=q.range(updatePage*PAGE_SIZE,(updatePage+1)*PAGE_SIZE-1); const {data}=await q; setSegmentUpdates(data||[]); };
  useEffect(() => { if(activeTab === 'updates') fetchSegmentUpdates(); }, [updatePage, updateSearch, activeTab]);

  const deleteItem = (table: string, id: number, refresh: () => void) => { confirmAction("Delete this item?", async () => { await supabase.from(table).delete().eq("id", id); refresh(); showSuccess("Deleted."); }); };
  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  // --- HIERARCHY ---
  const handleSegmentClick = (id: string) => { setSelectedSegment(id); setSelectedGroup(""); setSelectedSubject(""); setGroups([]); setSubjects([]); fetchGroups(id); fetchResources(id, null, null); };
  const handleGroupClick = (id: string) => { setSelectedGroup(id); setSelectedSubject(""); setSubjects([]); fetchSubjects(id); fetchResources(selectedSegment, id, null); };
  const handleSubjectClick = (id: string) => { setSelectedSubject(id); fetchResources(selectedSegment, selectedGroup, id); };
  const handleSegmentSubmit = async () => { if(newSegment) { await supabase.from('segments').insert([{title:newSegment, slug:newSegment.toLowerCase().replace(/\s+/g,'-')}]); setNewSegment(""); fetchSegments(); }};
  const handleGroupSubmit = async () => { if(newGroup && selectedSegment) { await supabase.from('groups').insert([{title:newGroup, slug:newGroup.toLowerCase().replace(/\s+/g,'-'), segment_id: Number(selectedSegment)}]); setNewGroup(""); fetchGroups(selectedSegment); }};
  const handleSubjectSubmit = async () => { if(newSubject && selectedGroup) { await supabase.from('subjects').insert([{title:newSubject, slug:newSubject.toLowerCase().replace(/\s+/g,'-'), group_id: Number(selectedGroup), segment_id: Number(selectedSegment)}]); setNewSubject(""); fetchSubjects(selectedGroup); }};

  // --- NEW CATEGORY MANAGER ---
  const CategoryManager = ({ label, value, onChange, context }: { label: string, value: string, onChange: (val: string) => void, context: string }) => {
      // Filter categories by context type (or 'general' if mixed)
      const contextCats = categories.filter(c => c.type === context || c.type === 'general' || !c.type);
      return (
          <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-1">{label}</label>
              <div className="flex gap-2">
                  <select className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold outline-none" value={value} onChange={e=>onChange(e.target.value)}>
                      <option value="">Select Category</option>
                      {contextCats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <button onClick={() => { setActiveCatContext(context); setIsManageCatsOpen(true); }} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 rounded-xl text-lg" title="Manage Categories">⚙️</button>
              </div>
          </div>
      );
  };

  // --- RESOURCE LOGIC ---
  const resetResourceForm = () => { 
      setEditingResourceId(null); setResTitle(""); setResLink(""); setResFile(null); setRichContent(""); setQuestionContent(""); 
      setSeoTitle(""); setSeoDescription(""); setBlogImageFile(null); setBlogImageLink(""); setBlogImageMethod('upload'); 
      setBlogTags(""); setBlogCategory(""); setResType("pdf"); setIsBlogEditorOpen(false); clearSeoFields();
  };
  const loadResourceForEdit = (r: any) => {
      setEditingResourceId(r.id); setResTitle(r.title); setResType(r.type); setResLink(r.content_url||""); 
      setRichContent(r.content_body || ""); setQuestionContent(r.content_body || "");
      setCommonTags(r.tags?.join(", ") || ""); setCommonSeoTitle(r.seo_title || ""); setCommonSeoDesc(r.seo_description || "");
      if(r.type==='blog') {
          setIsBlogEditorOpen(true);
          setBlogCategory(r.category || ""); // Load Category
          if(r.content_url) { setBlogImageLink(r.content_url); setBlogImageMethod('link'); } else { setBlogImageLink(""); setBlogImageMethod('upload'); }
      }
  };
  const uploadResource = async (typeOverride?: string) => {
      const type = typeOverride || resType;
      if(!resTitle) return showError("Title is required!");
      if(type !== 'blog' && !selectedSegment) return showError("Select a Segment.");
      
      let finalContent = richContent;
      if(type === 'blog' && editorRef.current) finalContent = editorRef.current.getContents();
      else if (type === 'question') finalContent = questionContent; 
      if (type === 'blog' && (!finalContent || finalContent.trim() === '')) return showError("Content empty.");

      setSubmitting(true);
      let url: string | null = resLink;
      
      if (type === 'blog') {
          url = null;
          if (blogImageMethod === 'upload' && blogImageFile) {
              const name = `blog-cover-${Date.now()}-${blogImageFile.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
              await supabase.storage.from('materials').upload(name, blogImageFile);
              url = supabase.storage.from('materials').getPublicUrl(name).data.publicUrl;
          } else if (blogImageMethod === 'link' && blogImageLink) { url = blogImageLink; }
      } else if (type === 'pdf' && resFile) {
          const name = `pdf-${Date.now()}-${resFile.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
          await supabase.storage.from('materials').upload(name, resFile);
          url = supabase.storage.from('materials').getPublicUrl(name).data.publicUrl;
      }

      const payload: any = { 
          title: resTitle, type, seo_title: commonSeoTitle || resTitle, seo_description: commonSeoDesc,
          tags: commonTags.split(',').map(t=>t.trim()).filter(t=>t), 
      };
      if(selectedSegment) payload.segment_id = Number(selectedSegment);
      if(selectedGroup) payload.group_id = Number(selectedGroup);
      if(selectedSubject) payload.subject_id = Number(selectedSubject);

      if(type==='pdf' || type==='video') payload.content_url = url;
      else if(type==='question') { payload.content_body = finalContent; payload.seo_title = seoTitle || resTitle; payload.seo_description = seoDescription; }
      else if(type==='blog') { payload.content_body = finalContent; payload.content_url = url; payload.tags = blogTags.split(',').map(t=>t.trim()); payload.category = blogCategory; }

      const { error } = editingResourceId 
          ? await supabase.from('resources').update(payload).eq('id', editingResourceId)
          : await supabase.from('resources').insert([payload]);

      setSubmitting(false);
      if (error) showError("Failed: " + error.message); 
      else {
          fetchResources(selectedSegment, selectedGroup, selectedSubject);
          if(type === 'blog') { setIsBlogEditorOpen(false); showSuccess("Blog published!"); } else { resetResourceForm(); showSuccess("Uploaded!"); }
      }
  };

  // --- UPDATES LOGIC ---
  const handleUpdateSubmit = async () => {
    if(!updateTitle || !updateSegmentId) return showError("Title and Segment required");
    setSubmitting(true);
    let url = null;
    if(updateFile) {
        const name = `update-${Date.now()}-${updateFile.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
        await supabase.storage.from('materials').upload(name, updateFile);
        url = supabase.storage.from('materials').getPublicUrl(name).data.publicUrl;
    }
    const payload: any = {
        title: updateTitle, type: updateType, segment_id: Number(updateSegmentId), content_body: updateContent,
        seo_title: commonSeoTitle || updateTitle, seo_description: commonSeoDesc, tags: commonTags.split(',').map(t=>t.trim()).filter(t=>t)
    };
    if(url) payload.attachment_url = url;
    const { error } = editingUpdateId ? await supabase.from('segment_updates').update(payload).eq('id', editingUpdateId) : await supabase.from('segment_updates').insert([payload]);
    setSubmitting(false);
    if(error) showError(error.message); else { setEditingUpdateId(null); setUpdateTitle(""); setUpdateContent(""); setUpdateFile(null); clearSeoFields(); fetchSegmentUpdates(); showSuccess("Published!"); }
  };
  const loadUpdateForEdit = (u: any) => { setEditingUpdateId(u.id); setUpdateTitle(u.title); setUpdateType(u.type); setUpdateSegmentId(u.segment_id); setUpdateContent(u.content_body||""); setCommonTags(u.tags?.join(", ")||""); window.scrollTo({top:0,behavior:'smooth'}); };

  // --- EBOOK LOGIC ---
  const handleEbookSubmit = async () => {
    if (!ebTitle) return showError("Title required");
    setSubmitting(true);
    const cover = (document.getElementById('eb-cover') as HTMLInputElement)?.files?.[0];
    let cUrl = null;
    if (cover) { const n = `cover-${Date.now()}`; await supabase.storage.from('covers').upload(n, cover); cUrl = supabase.storage.from('covers').getPublicUrl(n).data.publicUrl; }
    const payload: any = { title: ebTitle, author: ebAuthor, category: ebCategory, description: ebDescription, pdf_url: ebLink, seo_title: commonSeoTitle||ebTitle, seo_description: commonSeoDesc, tags: commonTags.split(',').map(t=>t.trim()).filter(t=>t) };
    if (cUrl) payload.cover_url = cUrl;
    const { error } = editingEbookId ? await supabase.from('ebooks').update(payload).eq('id', editingEbookId) : await supabase.from('ebooks').insert([payload]);
    setSubmitting(false);
    if (error) showError(error.message); else { setEditingEbookId(null); setEbTitle(""); setEbAuthor(""); setEbCategory(""); setEbDescription(""); setEbLink(""); clearSeoFields(); fetchEbooks(); showSuccess("Saved!"); }
  };
  const loadEbookForEdit = (b: any) => { setEditingEbookId(b.id); setEbTitle(b.title); setEbAuthor(b.author); setEbCategory(b.category); setEbDescription(b.description||""); setEbLink(b.pdf_url||""); setCommonTags(b.tags?.join(", ")||""); window.scrollTo({top:0,behavior:'smooth'}); };

  // --- COURSE LOGIC ---
  const handleCourseSubmit = async () => {
      if(!cTitle) return showError("Title required");
      setSubmitting(true);
      let thumb = null;
      if(cImage) { const n = `course-${Date.now()}`; await supabase.storage.from('materials').upload(n, cImage); thumb = supabase.storage.from('materials').getPublicUrl(n).data.publicUrl; }
      const payload: any = { title: cTitle, instructor: cInstructor, price: cPrice, discount_price: cDiscountPrice, duration: cDuration, enrollment_link: cLink, description: cDesc, category: cCategory, seo_title: commonSeoTitle||cTitle, seo_description: commonSeoDesc, tags: commonTags.split(',').map(t=>t.trim()).filter(t=>t) };
      if(thumb) payload.thumbnail_url = thumb;
      if(editingCourseId) await supabase.from('courses').update(payload).eq('id', editingCourseId);
      else { if(!thumb) {showError("Thumbnail required"); setSubmitting(false); return;} payload.thumbnail_url = thumb; await supabase.from('courses').insert([payload]); }
      setSubmitting(false); setEditingCourseId(null); setCTitle(""); setCInstructor(""); setCPrice(""); setCDiscountPrice(""); setCDuration(""); setCLink(""); setCDesc(""); setCCategory(""); setCImage(null); clearSeoFields(); fetchCourses(); showSuccess("Saved!");
  };
  const loadCourseForEdit = (c:any) => { setEditingCourseId(c.id); setCTitle(c.title); setCInstructor(c.instructor); setCPrice(c.price); setCDiscountPrice(c.discount_price); setCDuration(c.duration); setCLink(c.enrollment_link); setCDesc(c.description||""); setCCategory(c.category||""); setCommonTags(c.tags?.join(", ")||""); window.scrollTo({top:0,behavior:'smooth'}); };

  // --- NEWS LOGIC ---
  const handleNewsSubmit = async () => {
      if(!newsTitle) return showError("Headline required");
      setSubmitting(true);
      let url = null;
      if(newsFile) { const n = `news-${Date.now()}`; await supabase.storage.from('materials').upload(n, newsFile); url = supabase.storage.from('materials').getPublicUrl(n).data.publicUrl; }
      const payload: any = { title: newsTitle, content: newsContent, category: newsCategory, seo_title: commonSeoTitle||newsTitle, seo_description: commonSeoDesc, tags: commonTags.split(',').map(t=>t.trim()).filter(t=>t) };
      if(url) payload.image_url = url;
      if(editingNewsId) await supabase.from('news').update(payload).eq('id', editingNewsId); else await supabase.from('news').insert([payload]);
      setSubmitting(false); setEditingNewsId(null); setNewsTitle(""); setNewsContent(""); setNewsCategory(""); setNewsFile(null); clearSeoFields(); fetchNews(); showSuccess("Published!");
  };
  const loadNewsForEdit = (n:any) => { setEditingNewsId(n.id); setNewsTitle(n.title); setNewsContent(n.content||""); setNewsCategory(n.category); setCommonTags(n.tags?.join(", ")||""); window.scrollTo({top:0,behavior:'smooth'}); };

  // --- REUSABLES ---
  const SeoInputSection = () => (
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 mt-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><span>🚀</span> SEO & Search</h4>
          <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">SEO Title</label><input className="w-full bg-white border p-2 rounded text-sm outline-none" value={commonSeoTitle} onChange={e=>setCommonSeoTitle(e.target.value)} /></div>
              <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tags</label><input className="w-full bg-white border p-2 rounded text-sm outline-none" value={commonTags} onChange={e=>setCommonTags(e.target.value)} /></div>
          </div>
          <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Description</label><textarea className="w-full bg-white border p-2 rounded text-sm outline-none h-16 resize-none" value={commonSeoDesc} onChange={e=>setCommonSeoDesc(e.target.value)} /></div>
      </div>
  );
  const PaginationControls = ({ page, setPage, hasMore }: any) => (
      <div className="flex justify-between px-4 py-3 bg-white border-t border-slate-100"><button onClick={()=>setPage(Math.max(0,page-1))} disabled={page===0} className="text-xs font-bold text-slate-500 disabled:opacity-30">← Prev</button><span className="text-xs font-bold text-slate-400">Page {page+1}</span><button onClick={()=>setPage(page+1)} disabled={!hasMore} className="text-xs font-bold text-slate-500 disabled:opacity-30">Next →</button></div>
  );
  const SearchHeader = ({ title, value, onChange }: any) => (<div className="p-4 border-b bg-slate-50/50 space-y-3"><h4 className="text-sm font-bold text-slate-500 uppercase">{title}</h4><input type="text" placeholder="Search..." className="w-full text-xs p-2 rounded border focus:ring-2 outline-none" value={value} onChange={e=>onChange(e.target.value)} /></div>);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-bold">Loading...</div>;
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* CATEGORY MANAGER MODAL */}
      {isManageCatsOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-96 max-h-[80vh] flex flex-col">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b">
                      <h3 className="font-bold text-lg">Manage {activeCatContext.toUpperCase()} Categories</h3>
                      <button onClick={()=>setIsManageCatsOpen(false)} className="text-slate-400 hover:text-black">✕</button>
                  </div>
                  <div className="flex gap-2 mb-4">
                      <input id="newCatInput" className="flex-1 bg-slate-50 border p-2 rounded text-sm outline-none" placeholder="New category name..." />
                      <button onClick={async ()=>{
                          const input = document.getElementById('newCatInput') as HTMLInputElement;
                          if(input.value) { await supabase.from('categories').insert([{name: input.value, type: activeCatContext}]); input.value=""; fetchCategories(); }
                      }} className="bg-black text-white px-4 rounded font-bold text-sm">+</button>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                      {categories.filter(c => c.type === activeCatContext || c.type === 'general').map(c => (
                          <div key={c.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded group">
                              <span className="text-sm font-medium">{c.name}</span>
                              <button onClick={()=>deleteItem('categories', c.id, fetchCategories)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition">🗑️</button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* CONFIRMATION MODAL */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
                <h3 className="text-xl font-bold text-center mb-2">{modal.type}</h3>
                <p className="text-slate-500 text-center text-sm mb-6">{modal.message}</p>
                <div className="flex gap-3 justify-center">
                    {modal.type === 'confirm' ? <><button onClick={closeModal} className="px-5 py-2 border rounded-xl font-bold">Cancel</button><button onClick={()=>{modal.onConfirm?.();closeModal()}} className="px-5 py-2 bg-black text-white rounded-xl font-bold">Confirm</button></> : <button onClick={closeModal} className="px-8 py-2 bg-black text-white rounded-xl font-bold">Okay</button>}
                </div>
            </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed top-20 bottom-0 z-20 hidden md:flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-100"><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Command Center</p></div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {[{ id: 'materials', label: 'Study Materials', icon: '📂' }, { id: 'updates', label: 'Segment Updates', icon: '📢' }, { id: 'class-blogs', label: 'Class Blogs', icon: '✍️' }, { id: 'ebooks', label: 'Manage eBooks', icon: '📚' }, { id: 'courses', label: 'Manage Courses', icon: '🎓' }, { id: 'news', label: 'News CMS', icon: '📰' }].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}><span className="text-lg">{tab.icon}</span> {tab.label}</button>
            ))}
        </nav>
        <div className="p-4 border-t border-slate-100"><button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl">Sign Out</button></div>
      </aside>

      <main className="flex-1 md:ml-64 p-8 pt-28 overflow-x-hidden min-h-screen">
        <div className="max-w-[1600px] mx-auto w-full">
            {/* MOBILE NAV */}
            <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">{['materials','updates','class-blogs','ebooks','courses','news'].map(t => <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-full text-xs font-bold border whitespace-nowrap ${activeTab===t?'bg-blue-600 text-white':'bg-white text-slate-600'}`}>{t.toUpperCase()}</button>)}</div>

            {/* TAB: MATERIALS */}
            {activeTab === 'materials' && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* HIERARCHY SELECTORS */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-80 flex flex-col"><div className="p-4 border-b bg-slate-50/50 font-bold text-xs text-slate-500 uppercase">1. Segments</div><div className="flex-1 overflow-y-auto p-2">{segments.map(s=><div key={s.id} onClick={()=>handleSegmentClick(s.id)} className={`p-3 rounded-lg cursor-pointer text-sm font-bold flex justify-between ${selectedSegment===s.id?'bg-blue-600 text-white':'hover:bg-slate-50'}`}><span>{s.title}</span><button onClick={(e)=>{e.stopPropagation();deleteItem('segments',s.id,fetchSegments)}} className="px-2">×</button></div>)}</div><div className="p-2 border-t flex gap-2"><input className="border p-1 w-full rounded text-sm" value={newSegment} onChange={e=>setNewSegment(e.target.value)} placeholder="New..." /><button onClick={handleSegmentSubmit} className="bg-blue-600 text-white px-2 rounded font-bold">+</button></div></div>
                    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 h-80 flex flex-col ${!selectedSegment&&'opacity-50'}`}><div className="p-4 border-b bg-slate-50/50 font-bold text-xs text-slate-500 uppercase">2. Groups</div><div className="flex-1 overflow-y-auto p-2">{groups.map(g=><div key={g.id} onClick={()=>handleGroupClick(g.id)} className={`p-3 rounded-lg cursor-pointer text-sm font-bold flex justify-between ${selectedGroup===g.id?'bg-green-600 text-white':'hover:bg-slate-50'}`}><span>{g.title}</span><button onClick={(e)=>{e.stopPropagation();deleteItem('groups',g.id,()=>fetchGroups(selectedSegment))}} className="px-2">×</button></div>)}</div><div className="p-2 border-t flex gap-2"><input className="border p-1 w-full rounded text-sm" value={newGroup} onChange={e=>setNewGroup(e.target.value)} placeholder="New..." /><button onClick={handleGroupSubmit} className="bg-green-600 text-white px-2 rounded font-bold">+</button></div></div>
                    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 h-80 flex flex-col ${!selectedGroup&&'opacity-50'}`}><div className="p-4 border-b bg-slate-50/50 font-bold text-xs text-slate-500 uppercase">3. Subjects</div><div className="flex-1 overflow-y-auto p-2">{subjects.map(s=><div key={s.id} onClick={()=>handleSubjectClick(s.id)} className={`p-3 rounded-lg cursor-pointer text-sm font-bold flex justify-between ${selectedSubject===s.id?'bg-purple-600 text-white':'hover:bg-slate-50'}`}><span>{s.title}</span><button onClick={(e)=>{e.stopPropagation();deleteItem('subjects',s.id,()=>fetchSubjects(selectedGroup))}} className="px-2">×</button></div>)}</div><div className="p-2 border-t flex gap-2"><input className="border p-1 w-full rounded text-sm" value={newSubject} onChange={e=>setNewSubject(e.target.value)} placeholder="New..." /><button onClick={handleSubjectSubmit} className="bg-purple-600 text-white px-2 rounded font-bold">+</button></div></div>
                </div>
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${!selectedSegment ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                    <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-lg">Add Resource</h3>{editingResourceId&&<button onClick={resetResourceForm} className="text-red-500 font-bold text-xs bg-red-50 px-3 py-1 rounded">Cancel Edit</button>}</div>
                        <div className="space-y-5">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1"><label className="text-xs font-bold text-slate-400 uppercase block mb-1">Type</label><select className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold" value={resType} onChange={e=>setResType(e.target.value)}><option value="pdf">📄 PDF</option><option value="video">🎬 Video</option><option value="question">❓ Question</option><option value="blog">✍️ Blog</option></select></div>
                                <div className="col-span-2"><label className="text-xs font-bold text-slate-400 uppercase block mb-1">Title</label><input className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-medium" value={resTitle} onChange={e=>setResTitle(e.target.value)} placeholder="Title..." /></div>
                            </div>
                            {resType==='pdf' && <div className="border-2 border-dashed p-8 text-center rounded-xl relative hover:bg-blue-50"><input type="file" onChange={e=>setResFile(e.target.files?.[0]||null)} className="absolute inset-0 opacity-0 cursor-pointer"/><span className="text-2xl">📂</span><p className="text-sm font-bold text-slate-500">{resFile?resFile.name:"Upload PDF"}</p></div>}
                            {resType==='video' && <input className="w-full bg-slate-50 border p-3 rounded-xl text-sm" value={resLink} onChange={e=>setResLink(e.target.value)} placeholder="YouTube Embed Link..." />}
                            {resType==='question' && <div className="space-y-3"><div className="border rounded-xl overflow-hidden"><SunEditor key={editingResourceId||'nq'} setContents={questionContent} onChange={setQuestionContent} setOptions={{...editorOptions,katex:katex}}/></div><input className="w-full bg-slate-50 border p-3 rounded-xl text-xs" value={seoTitle} onChange={e=>setSeoTitle(e.target.value)} placeholder="SEO Title"/></div>}
                            {resType==='blog' && <div className="p-6 bg-blue-50 text-blue-700 text-sm rounded-xl border border-blue-100 flex items-center gap-4"><span>✍️</span><p>Go to <strong>"Class Blogs"</strong> tab to write articles.</p></div>}
                            {resType!=='blog' && <><SeoInputSection/><button onClick={()=>uploadResource()} disabled={submitting} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl mt-4">{submitting?"Saving...":editingResourceId?"Update":"Upload"}</button></>}
                        </div>
                    </div>
                    <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 h-[600px] flex flex-col">
                        <SearchHeader title="Library" value={resSearch} onChange={(val: string)=>{setResSearch(val);setResPage(0)}}/>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">{resources.map(r=><div key={r.id} className="bg-white p-3 rounded-xl border flex justify-between group hover:border-blue-300"><div className="flex gap-2 items-center"><span className="text-lg">{r.type==='pdf'?'📄':r.type==='video'?'▶':'❓'}</span><span className="text-xs font-bold truncate w-32">{r.title}</span></div><div className="opacity-0 group-hover:opacity-100 flex gap-1"><button onClick={()=>loadResourceForEdit(r)}>✏️</button><button onClick={()=>deleteItem('resources',r.id,()=>fetchResources(selectedSegment,selectedGroup,selectedSubject))}>🗑️</button></div></div>)}</div>
                        <PaginationControls page={resPage} setPage={setResPage} hasMore={resources.length===PAGE_SIZE}/>
                    </div>
                </div>
              </div>
            )}

            {/* TAB: UPDATES */}
            {activeTab === 'updates' && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <div className="xl:col-span-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1">Segment</label><select className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold" value={updateSegmentId} onChange={e=>setUpdateSegmentId(e.target.value)}><option value="">Select Segment</option>{segments.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></div>
                            
                            {/* REVERTED TO FIXED SELECT */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Update Type</label>
                                <select className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none" value={updateType} onChange={e=>setUpdateType(e.target.value)}>
                                    <option value="routine">📅 Routine</option>
                                    <option value="syllabus">📝 Syllabus</option>
                                    <option value="exam_result">🏆 Exam Result</option>
                                </select>
                            </div>

                          </div>
                          <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1">Title</label><input className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold" placeholder="Title..." value={updateTitle} onChange={e=>setUpdateTitle(e.target.value)} /></div>
                          <div className="border rounded-xl overflow-hidden"><SunEditor key={editingUpdateId||'up'} setContents={updateContent} onChange={setUpdateContent} setOptions={{...editorOptions,callBackSave:handleUpdateSubmit}}/></div>
                          <div className="border-2 border-dashed p-4 text-center rounded-xl relative hover:bg-blue-50"><input type="file" onChange={e=>setUpdateFile(e.target.files?.[0]||null)} className="absolute inset-0 opacity-0 cursor-pointer"/><span className="text-lg">📎</span> <span className="text-sm font-bold text-slate-500">{updateFile?updateFile.name:"Attach File"}</span></div>
                          <SeoInputSection /><button onClick={handleUpdateSubmit} disabled={submitting} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl">{submitting?"Saving...":"Publish"}</button>
                    </div>
                    <div className="xl:col-span-4 bg-white rounded-xl border border-slate-200 h-[600px] flex flex-col"><SearchHeader title="Updates" value={updateSearch} onChange={(val:string)=>{setUpdateSearch(val);setUpdatePage(0)}}/><div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">{segmentUpdates.map(u=><div key={u.id} className="p-3 border rounded-lg hover:bg-slate-50 group flex justify-between"><div><span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-bold uppercase">{u.type}</span><h5 className="font-bold text-sm mt-1">{u.title}</h5></div><div className="opacity-0 group-hover:opacity-100 flex gap-2"><button onClick={()=>loadUpdateForEdit(u)} className="text-xs font-bold text-blue-600">Edit</button><button onClick={()=>deleteItem('segment_updates',u.id,fetchSegmentUpdates)} className="text-xs font-bold text-red-600">Del</button></div></div>)}</div><PaginationControls page={updatePage} setPage={setUpdatePage} hasMore={segmentUpdates.length===PAGE_SIZE}/></div>
                </div>
              </div>
            )}

            {/* TAB: EBOOKS */}
            {activeTab === 'ebooks' && (
              <div className="space-y-8 animate-fade-in">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-lg mb-6 border-b pb-4">{editingEbookId?"Edit eBook":"Add eBook"}</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-4 space-y-6">
                            <div className="space-y-4">
                                <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1">Title</label><input className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold" value={ebTitle} onChange={e=>setEbTitle(e.target.value)} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1">Author</label><input className="w-full bg-slate-50 border p-3 rounded-xl text-sm" value={ebAuthor} onChange={e=>setEbAuthor(e.target.value)} /></div>
                                    <CategoryManager label="Category" value={ebCategory} onChange={setEbCategory} context="ebook" />
                                </div>
                            </div>
                            <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl space-y-4">
                                <div><label className="text-xs font-bold text-blue-600 uppercase block mb-1">PDF Link</label><input className="w-full bg-white border border-blue-200 text-blue-800 p-3 rounded-xl text-sm" value={ebLink} onChange={e=>setEbLink(e.target.value)} /></div>
                                <div className="relative group cursor-pointer border-2 border-dashed border-slate-300 bg-white p-3 rounded-xl flex items-center gap-3"><input type="file" id="eb-cover" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*"/><span className="text-xl">🖼️</span><span className="text-xs font-bold text-slate-500">Cover Image</span></div>
                            </div>
                            <SeoInputSection />
                        </div>
                        <div className="lg:col-span-8 flex flex-col"><label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Description</label><div className="border rounded-xl overflow-hidden flex-1"><SunEditor key={editingEbookId||'neb'} setContents={ebDescription} onChange={setEbDescription} setOptions={{...editorOptions,minHeight:"350px",callBackSave:handleEbookSubmit}}/></div></div>
                    </div>
                    <div className="mt-8 flex justify-end"><button onClick={handleEbookSubmit} disabled={submitting} className="bg-slate-900 text-white font-bold py-3 px-8 rounded-xl shadow-lg">{submitting?"Saving...":"Save eBook"}</button></div>
                </div>
                <div className="bg-white p-4 rounded-2xl border shadow-sm"><SearchHeader title="eBooks" value={ebSearch} onChange={(val:string)=>{setEbSearch(val);setEbPage(0)}}/><div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4">{ebooksList.map(b=><div key={b.id} className="bg-white p-4 rounded-xl border shadow-sm flex gap-4 group hover:border-blue-400"><div className="w-16 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">{b.cover_url&&<img src={b.cover_url} className="w-full h-full object-cover"/>}</div><div className="flex-1 flex flex-col"><span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded w-fit mb-2 font-bold">{b.category}</span><h4 className="font-bold text-sm line-clamp-2">{b.title}</h4><div className="flex gap-2 mt-3"><button onClick={()=>loadEbookForEdit(b)} className="flex-1 bg-slate-100 text-xs font-bold py-1.5 rounded">Edit</button><button onClick={()=>deleteItem('ebooks',b.id,fetchEbooks)} className="flex-1 bg-red-50 text-red-600 text-xs font-bold py-1.5 rounded">Del</button></div></div></div>)}</div><PaginationControls page={ebPage} setPage={setEbPage} hasMore={ebooksList.length===PAGE_SIZE}/></div>
              </div>
            )}

            {/* TAB: BLOGS */}
            {activeTab === 'class-blogs' && (
              <div className="animate-fade-in">
                {!isBlogEditorOpen ? (
                    <div>
                        <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Class Blogs</h2><button onClick={()=>{resetResourceForm();setIsBlogEditorOpen(true);setResType('blog')}} className="bg-black text-white px-6 py-2 rounded-lg font-bold shadow-lg">+ New Post</button></div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 mb-6">
                            <select className="w-full bg-slate-50 border p-3 rounded-lg font-bold text-sm" value={selectedSegment} onChange={e=>handleSegmentClick(e.target.value)}><option value="">Filter Segment</option>{segments.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                            <select className="w-full bg-slate-50 border p-3 rounded-lg font-bold text-sm" value={selectedGroup} onChange={e=>handleGroupClick(e.target.value)} disabled={!selectedSegment}><option value="">Filter Group</option>{groups.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select>
                            <select className="w-full bg-slate-50 border p-3 rounded-lg font-bold text-sm" value={selectedSubject} onChange={e=>handleSubjectClick(e.target.value)} disabled={!selectedGroup}><option value="">Filter Subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{resources.filter(r=>r.type==='blog').map(b=><div key={b.id} className="bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-lg group relative"><div className="h-40 bg-slate-100 relative">{b.content_url?<img src={b.content_url} className="w-full h-full object-cover"/>:<div className="w-full h-full bg-gradient-to-br from-blue-600 to-cyan-500 p-4 flex items-center justify-center text-center"><h4 className="text-white font-bold text-xs">{b.title}</h4></div>}<div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition"><button onClick={()=>loadResourceForEdit(b)} className="bg-white p-1.5 rounded shadow text-xs">✏️</button><button onClick={()=>deleteItem('resources',b.id,()=>fetchResources(selectedSegment,selectedGroup,selectedSubject))} className="bg-white p-1.5 rounded shadow text-xs">🗑️</button></div></div><div className="p-4"><span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded mb-2 inline-block">{b.category || 'General'}</span><h3 className="font-bold text-sm line-clamp-2">{b.title}</h3></div></div>)}</div>
                        <PaginationControls page={resPage} setPage={setResPage} hasMore={resources.length===PAGE_SIZE}/>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg border min-h-screen flex flex-col relative">
                        <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl sticky top-0 z-10"><button onClick={()=>setIsBlogEditorOpen(false)} className="font-bold text-slate-500">← Cancel</button><button onClick={()=>uploadResource('blog')} disabled={submitting} className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold shadow-lg">{submitting?"Publishing...":"Publish"}</button></div>
                        <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
                            <input className="text-5xl font-black w-full outline-none placeholder-slate-300 bg-transparent" placeholder="Title..." value={resTitle} onChange={e=>setResTitle(e.target.value)} />
                            
                            {/* --- NEW CATEGORY FOR BLOG --- */}
                            <div className="max-w-xs">
                                <CategoryManager label="Blog Category (Optional)" value={blogCategory} onChange={setBlogCategory} context="blog" />
                            </div>

                            <div className="min-h-[500px] border rounded-lg overflow-hidden shadow-sm"><SunEditor key={editingResourceId||'nb'} getSunEditorInstance={getSunEditorInstance} setContents={richContent} onChange={setRichContent} setOptions={{...editorOptions,callBackSave:()=>uploadResource('blog')}}/></div>
                            <div className="grid grid-cols-2 gap-6 pt-6 border-t">
                                <div className="space-y-4"><h4 className="text-xs font-bold text-slate-500 uppercase">Cover Image</h4><div className="bg-slate-50 p-1 rounded-lg inline-flex border"><button onClick={()=>setBlogImageMethod('upload')} className={`px-4 py-1.5 text-xs font-bold rounded-md ${blogImageMethod==='upload'?'bg-white shadow-sm':'text-slate-500'}`}>Upload</button><button onClick={()=>setBlogImageMethod('link')} className={`px-4 py-1.5 text-xs font-bold rounded-md ${blogImageMethod==='link'?'bg-white shadow-sm':'text-slate-500'}`}>Link</button></div>{blogImageMethod==='upload'?<div className="border-2 border-dashed p-6 rounded-lg text-center relative hover:bg-slate-50"><input type="file" onChange={e=>setBlogImageFile(e.target.files?.[0]||null)} className="absolute inset-0 opacity-0 cursor-pointer"/><span className="text-2xl">📤</span><p className="text-xs font-bold text-slate-400 mt-2">{blogImageFile?blogImageFile.name:"Click to Upload"}</p></div>:<input className="w-full bg-white border p-3 rounded-lg text-sm" placeholder="Paste link..." value={blogImageLink} onChange={e=>setBlogImageLink(e.target.value)} />}</div>
                                <SeoInputSection />
                            </div>
                        </div>
                    </div>
                )}
              </div>
            )}

            {/* TAB: COURSES */}
            {activeTab === 'courses' && (
              <div className="space-y-8 animate-fade-in">
                <h2 className="text-2xl font-bold">Manage Courses</h2>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-lg mb-6 border-b pb-4">{editingCourseId?"Edit Course":"Create New Course"}</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-4 space-y-5">
                            <div><label className="text-xs font-bold text-slate-400 uppercase block mb-1">Title</label><input className="w-full bg-slate-50 border p-3.5 rounded-xl text-sm font-bold" value={cTitle} onChange={e=>setCTitle(e.target.value)} /></div>
                            <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-slate-400 uppercase block mb-1">Price</label><input className="w-full bg-slate-50 border p-3.5 rounded-xl text-sm" value={cPrice} onChange={e=>setCPrice(e.target.value)} /></div><div><label className="text-xs font-bold text-green-600 uppercase block mb-1">Discount</label><input className="w-full bg-green-50 border p-3.5 rounded-xl text-sm" value={cDiscountPrice} onChange={e=>setCDiscountPrice(e.target.value)} /></div></div>
                            <CategoryManager label="Category" value={cCategory} onChange={setCCategory} context="course" />
                            <div className="grid grid-cols-2 gap-4"><input className="w-full bg-slate-50 border p-3.5 rounded-xl text-sm" value={cDuration} onChange={e=>setCDuration(e.target.value)} placeholder="Duration" /><input className="w-full bg-slate-50 border p-3.5 rounded-xl text-sm text-blue-600" value={cLink} onChange={e=>setCLink(e.target.value)} placeholder="Link" /></div>
                            <SeoInputSection />
                        </div>
                        <div className="lg:col-span-8 flex flex-col"><label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Details</label><div className="border rounded-xl overflow-hidden flex-1 mb-4"><SunEditor key={editingCourseId||'nc'} setContents={cDesc} onChange={setCDesc} setOptions={{...editorOptions,minHeight:"350px",callBackSave:handleCourseSubmit}}/></div><div className="p-4 border-2 border-dashed rounded-xl text-center cursor-pointer hover:bg-slate-50 relative"><span className="text-xl">📸</span> <span className="text-xs font-bold text-slate-400">Thumbnail</span><input type="file" onChange={e=>setCImage(e.target.files?.[0]||null)} className="absolute inset-0 opacity-0 cursor-pointer"/></div></div>
                    </div>
                    <div className="mt-8 flex justify-end gap-4">{editingCourseId&&<button onClick={()=>setEditingCourseId(null)} className="text-red-500 font-bold px-6 border rounded-xl">Cancel</button>}<button onClick={handleCourseSubmit} disabled={submitting} className="bg-slate-900 text-white font-bold py-3 px-8 rounded-xl shadow-lg">{submitting?"Saving...":"Launch"}</button></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{coursesList.map(c=><div key={c.id} className="bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-xl group relative"><div className="h-40 bg-gray-200 relative">{c.thumbnail_url&&<img src={c.thumbnail_url} className="w-full h-full object-cover"/>}<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 backdrop-blur-sm"><button onClick={()=>loadCourseForEdit(c)} className="bg-white text-black px-4 py-2 rounded font-bold">Edit</button><button onClick={()=>deleteItem('courses',c.id,fetchCourses)} className="bg-red-600 text-white px-4 py-2 rounded font-bold">Del</button></div></div><div className="p-5"><span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold mb-1 inline-block">{c.category}</span><h4 className="font-bold text-lg mb-1">{c.title}</h4></div></div>)}</div>
              </div>
            )}

            {/* TAB: NEWS */}
            {activeTab === 'news' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Newsroom</h2>{editingNewsId&&<button onClick={()=>{setEditingNewsId(null);setNewsTitle("");setNewsContent("")}} className="text-red-500 font-bold border px-3 py-1 rounded">Cancel Edit</button>}</div>
                 <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <div className="xl:col-span-8 space-y-4"><input className="text-4xl font-black w-full bg-transparent border-b pb-2 outline-none" placeholder="Headline..." value={newsTitle} onChange={e=>setNewsTitle(e.target.value)} /><div className="bg-white rounded-xl shadow-sm border overflow-hidden"><SunEditor key={editingNewsId||'nn'} setContents={newsContent} onChange={setNewsContent} setOptions={{...editorOptions,callBackSave:handleNewsSubmit}}/></div></div>
                    <div className="xl:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                            <button onClick={handleNewsSubmit} disabled={submitting} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 shadow-lg mb-6">{submitting?"Publishing...":"Publish"}</button>
                            <div className="space-y-4">
                                <CategoryManager label="News Category" value={newsCategory} onChange={setNewsCategory} context="news" />
                                <div className="p-4 border-2 border-dashed rounded-lg text-center relative hover:bg-slate-50"><span className="text-xl">📸</span> <span className="text-xs font-bold text-slate-400">Cover</span><input type="file" onChange={e=>setNewsFile(e.target.files?.[0]||null)} className="absolute inset-0 opacity-0 cursor-pointer"/></div>
                                <SeoInputSection />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border h-[600px] flex flex-col"><SearchHeader title="News" value={newsSearch} onChange={(val:string)=>{setNewsSearch(val);setNewsPage(0)}}/><div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">{newsList.map(n=><div key={n.id} className="p-3 border-b hover:bg-gray-50 flex justify-between items-center group"><span className="font-bold text-xs truncate w-2/3">{n.title}</span><div className="flex gap-2 opacity-0 group-hover:opacity-100"><button onClick={()=>loadNewsForEdit(n)} className="text-blue-600 text-xs font-bold">Edit</button><button onClick={()=>deleteItem('news',n.id,fetchNews)} className="text-red-600 text-xs font-bold">Del</button></div></div>)}</div><PaginationControls page={newsPage} setPage={setNewsPage} hasMore={newsList.length===PAGE_SIZE}/></div>
                    </div>
                 </div>
              </div>
            )}

        </div>
      </main>
      <style jsx global>{` .custom-scrollbar::-webkit-scrollbar { width: 5px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; } .animate-fade-in { animation: fadeIn 0.3s ease-out; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } `}</style>
    </div>
  );
}