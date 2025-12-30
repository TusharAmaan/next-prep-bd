"use client";
import { useState, useEffect, useCallback, useRef, memo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import 'suneditor/dist/css/suneditor.min.css'; 
import katex from 'katex'; 
import 'katex/dist/katex.min.css'; 

// Load SunEditor dynamically
const SunEditor = dynamic(() => import("suneditor-react"), { ssr: false });

const editorOptions: any = {
    minHeight: "500px", height: "auto", placeholder: "Start content creation...",
    buttonList: [
        ['undo', 'redo'], ['save', 'template'], ['font', 'fontSize', 'formatBlock'],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'], ['removeFormat'],
        ['fontColor', 'hiliteColor', 'textStyle'], ['outdent', 'indent'],
        ['align', 'horizontalRule', 'list', 'lineHeight'], ['table', 'link', 'image', 'video', 'math'], 
        ['fullScreen', 'showBlocks', 'codeView', 'preview']
    ],
    mode: "classic", attributesWhitelist: { all: "style" },
    defaultStyle: "font-family: 'Inter', sans-serif; font-size: 16px; line-height: 1.6; color: #334155;",
    resizingBar: true, showPathLabel: true, katex: katex 
};

const PAGE_SIZE = 15;

type ModalState = { isOpen: boolean; type: 'success' | 'confirm' | 'error'; message: string; onConfirm?: () => void; };

// --- 1. EXTERNAL COMPONENTS (Prevents Re-render/Focus Loss) ---

const SeoInputSection = memo(({ 
  title, setTitle, tags, setTags, desc, setDesc, markDirty 
}: {
  title: string, setTitle: (v: string) => void,
  tags: string, setTags: (v: string) => void,
  desc: string, setDesc: (v: string) => void,
  markDirty: () => void
}) => (
  <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm mt-6">
      <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-slate-500 uppercase flex items-center gap-2"><span>🔍</span> SEO Metadata</h4>
      </div>
      <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1.5">Meta Title</label>
            <input className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={title} onChange={e=>{setTitle(e.target.value); markDirty();}} placeholder="SEO Title..." />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1.5">Tags (Comma Separated)</label>
            <input className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={tags} onChange={e=>{setTags(e.target.value); markDirty();}} placeholder="math, physics, exam..." />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1.5">Meta Description</label>
            <textarea className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none transition-all" value={desc} onChange={e=>{setDesc(e.target.value); markDirty();}} placeholder="Summary..." />
          </div>
      </div>
  </div>
));
SeoInputSection.displayName = "SeoInputSection";

const FilterBar = memo(({ 
    segments, groups, subjects, 
    selSeg, setSelSeg, 
    selGrp, setSelGrp, 
    selSub, setSelSub,
    onFetchGroups, onFetchSubjects,
    newSeg, setNewSeg,
    newGrp, setNewGrp,
    newSub, setNewSub,
    onAddSegment, onAddGroup, onAddSubject
}: any) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Filter Segment</label>
            <select className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" value={selSeg} onChange={e=>{setSelSeg(e.target.value); onFetchGroups(e.target.value);}}>
                <option value="">All Segments</option>
                {segments.map((s:any)=><option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
            <div className="flex gap-2">
                <input className="w-full border p-1.5 rounded text-xs outline-none" placeholder="+ New Segment" value={newSeg} onChange={e=>setNewSeg(e.target.value)} />
                <button onClick={onAddSegment} className="bg-black text-white px-2 rounded text-xs font-bold">+</button>
            </div>
        </div>
        <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Filter Group</label>
            <select className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" value={selGrp} onChange={e=>{setSelGrp(e.target.value); onFetchSubjects(e.target.value);}} disabled={!selSeg}>
                <option value="">All Groups</option>
                {groups.map((g:any)=><option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
            <div className="flex gap-2">
                <input className="w-full border p-1.5 rounded text-xs outline-none" placeholder="+ New Group" value={newGrp} onChange={e=>setNewGrp(e.target.value)} disabled={!selSeg} />
                <button onClick={onAddGroup} disabled={!selSeg} className="bg-black text-white px-2 rounded text-xs font-bold disabled:opacity-50">+</button>
            </div>
        </div>
        <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Filter Subject</label>
            <select className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" value={selSub} onChange={e=>setSelSub(e.target.value)} disabled={!selGrp}>
                <option value="">All Subjects</option>
                {subjects.map((s:any)=><option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
            <div className="flex gap-2">
                <input className="w-full border p-1.5 rounded text-xs outline-none" placeholder="+ New Subject" value={newSub} onChange={e=>setNewSub(e.target.value)} disabled={!selGrp} />
                <button onClick={onAddSubject} disabled={!selGrp} className="bg-black text-white px-2 rounded text-xs font-bold disabled:opacity-50">+</button>
            </div>
        </div>
    </div>
));
FilterBar.displayName = "FilterBar";

// --- MAIN PAGE COMPONENT ---

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("materials"); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editorMode, setEditorMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false); 
  const editorRef = useRef<any>(null);
  const getSunEditorInstance = (sunEditor: any) => { editorRef.current = sunEditor; };

  // --- STATE ---
  const [modal, setModal] = useState<ModalState>({ isOpen: false, type: 'success', message: '' });
  
  // Data
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Lists
  const [resources, setResources] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [ebooksList, setEbooksList] = useState<any[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [segmentUpdates, setSegmentUpdates] = useState<any[]>([]);

  // Search & Pagination
  const [resPage, setResPage] = useState(0); const [resSearch, setResSearch] = useState("");
  const [newsPage, setNewsPage] = useState(0); const [newsSearch, setNewsSearch] = useState("");
  const [ebPage, setEbPage] = useState(0); const [ebSearch, setEbSearch] = useState("");
  const [updatePage, setUpdatePage] = useState(0); const [updateSearch, setUpdateSearch] = useState("");

  // Filtering (Shared)
  const [selectedSegment, setSelectedSegment] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Hierarchy Management Inputs
  const [newSegment, setNewSegment] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newSubject, setNewSubject] = useState("");

  // Submitting
  const [submitting, setSubmitting] = useState(false);
  
  // Category Modal
  const [isManageCatsOpen, setIsManageCatsOpen] = useState(false); 
  const [activeCatContext, setActiveCatContext] = useState("news"); 
  const [catModalSegment, setCatModalSegment] = useState("");
  const [catModalGroup, setCatModalGroup] = useState("");
  const [catModalSubject, setCatModalSubject] = useState("");
  const [catModalGroupsList, setCatModalGroupsList] = useState<any[]>([]);
  const [catModalSubjectsList, setCatModalSubjectsList] = useState<any[]>([]);

  // Form Fields (Common)
  const [commonTags, setCommonTags] = useState(""); 
  const [commonSeoTitle, setCommonSeoTitle] = useState("");
  const [commonSeoDesc, setCommonSeoDesc] = useState("");
  
  // Resource Form
  const [resTitle, setResTitle] = useState("");
  const [resLink, setResLink] = useState("");
  const [resFile, setResFile] = useState<File | null>(null);
  const [resType, setResType] = useState("pdf");
  const [richContent, setRichContent] = useState(""); 
  const [questionContent, setQuestionContent] = useState(""); 
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);
  const [blogImageMethod, setBlogImageMethod] = useState<'upload' | 'link'>('upload');
  const [blogImageFile, setBlogImageFile] = useState<File | null>(null);
  const [blogImageLink, setBlogImageLink] = useState("");
  const [blogCategory, setBlogCategory] = useState("");

  // Specific Forms
  const [newsTitle, setNewsTitle] = useState(""); const [newsContent, setNewsContent] = useState(""); const [newsCategory, setNewsCategory] = useState(""); const [newsFile, setNewsFile] = useState<File | null>(null); const [editingNewsId, setEditingNewsId] = useState<number | null>(null);
  const [ebTitle, setEbTitle] = useState(""); const [ebAuthor, setEbAuthor] = useState(""); const [ebCategory, setEbCategory] = useState(""); const [ebDescription, setEbDescription] = useState(""); const [ebLink, setEbLink] = useState(""); const [editingEbookId, setEditingEbookId] = useState<number | null>(null);
  const [cTitle, setCTitle] = useState(""); const [cInstructor, setCInstructor] = useState(""); const [cPrice, setCPrice] = useState(""); const [cDiscountPrice, setCDiscountPrice] = useState(""); const [cDuration, setCDuration] = useState(""); const [cLink, setCLink] = useState(""); const [cDesc, setCDesc] = useState(""); const [cCategory, setCCategory] = useState(""); const [cImage, setCImage] = useState<File | null>(null); const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [updateTitle, setUpdateTitle] = useState(""); const [updateType, setUpdateType] = useState("routine"); const [updateSegmentId, setUpdateSegmentId] = useState(""); const [updateContent, setUpdateContent] = useState(""); const [updateFile, setUpdateFile] = useState<File | null>(null); const [editingUpdateId, setEditingUpdateId] = useState<number | null>(null);

  // --- HELPER FUNCTIONS (DEFINED FIRST TO AVOID ERRORS) ---
  const showSuccess = (msg: string) => setModal({ isOpen: true, type: 'success', message: msg });
  const showError = (msg: string) => setModal({ isOpen: true, type: 'error', message: msg });
  const confirmAction = (msg: string, action: () => void) => setModal({ isOpen: true, type: 'confirm', message: msg, onConfirm: action });
  const closeModal = () => setModal({ ...modal, isOpen: false });
  const markDirty = () => setIsDirty(true);
  
  const clearSeoFields = () => { setCommonTags(""); setCommonSeoTitle(""); setCommonSeoDesc(""); };

  // This function MUST be defined before it is called by clearAllForms
  const resetResourceForm = () => { 
      setEditingResourceId(null); setResTitle(""); setResLink(""); setResFile(null); setRichContent(""); setQuestionContent(""); 
      setBlogImageFile(null); setBlogImageLink(""); setBlogImageMethod('upload'); setBlogCategory(""); setResType("pdf"); 
      // Do NOT setEditorMode(false) here, as this function is used for clearing state only
      clearSeoFields();
  };

  const clearAllForms = () => {
      resetResourceForm(); // Now this is safe
      setNewsTitle(""); setNewsContent(""); setNewsCategory(""); setNewsFile(null); setEditingNewsId(null);
      setEbTitle(""); setEbAuthor(""); setEbCategory(""); setEbDescription(""); setEbLink(""); setEditingEbookId(null);
      setCTitle(""); setCInstructor(""); setCPrice(""); setCDesc(""); setCCategory(""); setEditingCourseId(null);
      setUpdateTitle(""); setUpdateContent(""); setEditingUpdateId(null);
      setCommonTags(""); setCommonSeoTitle(""); setCommonSeoDesc("");
      setIsDirty(false);
  };

  // --- NAVIGATION SAFEGUARDS ---
  const handleTabSwitch = (newTab: string) => {
      if(isDirty) {
          confirmAction("You have unsaved changes. Discard them?", () => {
              setIsDirty(false);
              setEditorMode(false);
              clearAllForms();
              setActiveTab(newTab);
          });
      } else {
          setEditorMode(false);
          clearAllForms();
          setActiveTab(newTab);
      }
  };

  const handleBackToList = () => {
      if(isDirty) {
          confirmAction("Discard unsaved changes?", () => {
              setIsDirty(false);
              setEditorMode(false);
              clearAllForms();
          });
      } else {
          setEditorMode(false);
          clearAllForms();
      }
  };

  // --- INIT ---
  const loadInitialData = useCallback(() => {
    const fSeg = async () => { const {data} = await supabase.from("segments").select("*").order('id'); setSegments(data||[]); };
    const fCat = async () => { const {data} = await supabase.from("categories").select("*").order('name'); setCategories(data||[]); };
    fSeg(); fCat();
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { setIsAuthenticated(true); loadInitialData(); } else { router.push("/login"); }
      setIsLoading(false);
    };
    init();
  }, [router, loadInitialData]);

  // --- FETCHERS ---
  const fetchGroups = async (segId: string) => { const {data} = await supabase.from("groups").select("*").eq("segment_id", segId).order('id'); setGroups(data||[]); };
  const fetchSubjects = async (grpId: string) => { const {data} = await supabase.from("subjects").select("*").eq("group_id", grpId).order('id'); setSubjects(data||[]); };
  const fetchCategories = async () => { const {data} = await supabase.from("categories").select("id, name, type, segment_id, group_id, subject_id").order('name'); setCategories(data||[]); };
  
  const fetchModalGroups = async (segId: string) => { const {data} = await supabase.from("groups").select("*").eq("segment_id", segId).order('id'); setCatModalGroupsList(data||[]); };
  const fetchModalSubjects = async (grpId: string) => { const {data} = await supabase.from("subjects").select("*").eq("group_id", grpId).order('id'); setCatModalSubjectsList(data||[]); };

  const fetchResources = async (segId: string | null, grpId: string | null, subId: string | null) => { 
      let query = supabase.from("resources").select("*").order('created_at',{ascending:false});
      if (subId) query = query.eq("subject_id", subId); else if (grpId) query = query.eq("group_id", grpId); else if (segId) query = query.eq("segment_id", segId);
      
      if(activeTab === 'class-blogs') query = query.eq("type", "blog");
      else if(activeTab === 'materials') query = query.neq("type", "blog"); 

      if (resSearch) query = query.ilike('title', `%${resSearch}%`);
      query = query.range(resPage * PAGE_SIZE, (resPage + 1) * PAGE_SIZE - 1);
      const {data} = await query; setResources(data||[]); 
  };

  const fetchSegmentUpdates = async () => { 
      let q=supabase.from("segment_updates").select("*, segments(title)").order('created_at',{ascending:false});
      if(selectedSegment) q = q.eq('segment_id', selectedSegment);
      if(updateSearch) q=q.ilike('title',`%${updateSearch}%`); 
      q=q.range(updatePage*PAGE_SIZE,(updatePage+1)*PAGE_SIZE-1); 
      const {data}=await q; setSegmentUpdates(data||[]); 
  };

  const fetchNews = async () => { let q = supabase.from("news").select("*").order('created_at',{ascending:false}); if(newsSearch) q = q.ilike('title', `%${newsSearch}%`); q=q.range(newsPage*PAGE_SIZE,(newsPage+1)*PAGE_SIZE-1); const {data}=await q; setNewsList(data||[]); };
  const fetchEbooks = async () => { let q = supabase.from("ebooks").select("*").order('created_at',{ascending:false}); if(ebSearch) q=q.ilike('title',`%${ebSearch}%`); q=q.range(ebPage*PAGE_SIZE,(ebPage+1)*PAGE_SIZE-1); const {data}=await q; setEbooksList(data||[]); };
  const fetchCourses = async () => { const {data} = await supabase.from("courses").select("*").order('created_at',{ascending:false}); setCoursesList(data||[]); };

  // Trigger Fetch on Tab/Filter Change
  useEffect(() => {
      if(!editorMode && !isLoading) {
          if(activeTab === 'materials' || activeTab === 'class-blogs') fetchResources(selectedSegment, selectedGroup, selectedSubject);
          if(activeTab === 'news') fetchNews();
          if(activeTab === 'ebooks') fetchEbooks();
          if(activeTab === 'courses') fetchCourses();
          if(activeTab === 'updates') fetchSegmentUpdates();
      }
  }, [activeTab, selectedSegment, selectedGroup, selectedSubject, resPage, newsPage, ebPage, updatePage, editorMode, isLoading]);

  const deleteItem = (table: string, id: number, refresh: () => void) => { confirmAction("Permanently delete this item?", async () => { await supabase.from(table).delete().eq("id", id); refresh(); showSuccess("Deleted!"); }); };
  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  // --- HIERARCHY HANDLERS ---
  const handleSegmentClick = (id: string) => { setSelectedSegment(id); setSelectedGroup(""); setSelectedSubject(""); setGroups([]); setSubjects([]); fetchGroups(id); fetchResources(id, null, null); };
  const handleGroupClick = (id: string) => { setSelectedGroup(id); setSelectedSubject(""); setSubjects([]); fetchSubjects(id); fetchResources(selectedSegment, id, null); };
  const handleSubjectClick = (id: string) => { setSelectedSubject(id); fetchResources(selectedSegment, selectedGroup, id); };
  
  const handleSegmentSubmit = async () => { if(newSegment) { await supabase.from('segments').insert([{title:newSegment, slug:newSegment.toLowerCase().replace(/\s+/g,'-')}]); setNewSegment(""); const {data}=await supabase.from('segments').select('*'); setSegments(data||[]); }};
  const handleGroupSubmit = async () => { if(newGroup && selectedSegment) { await supabase.from('groups').insert([{title:newGroup, slug:newGroup.toLowerCase().replace(/\s+/g,'-'), segment_id: Number(selectedSegment)}]); setNewGroup(""); fetchGroups(selectedSegment); }};
  const handleSubjectSubmit = async () => { if(newSubject && selectedGroup) { await supabase.from('subjects').insert([{title:newSubject, slug:newSubject.toLowerCase().replace(/\s+/g,'-'), group_id: Number(selectedGroup), segment_id: Number(selectedSegment)}]); setNewSubject(""); fetchSubjects(selectedGroup); }};

  // --- INTERNAL COMPONENT: Category Manager (Stateful wrapper) ---
  const CategoryManager = ({ label, value, onChange, context }: any) => {
      const filteredCats = categories.filter(c => c.type === context || c.type === 'general' || !c.type);
      return (
          <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block uppercase">{label}</label>
              <div className="flex gap-2">
                  <select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm outline-none cursor-pointer hover:border-slate-300 transition-colors" value={value} onChange={e=>{onChange(e.target.value); markDirty();}}>
                      <option value="">Select Category</option>
                      {filteredCats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <button onClick={() => { setActiveCatContext(context); setIsManageCatsOpen(true); }} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 rounded-lg text-lg transition-colors">⚙️</button>
              </div>
          </div>
      );
  };

  // --- SUBMIT HANDLERS ---
  const uploadResource = async () => {
      if(!resTitle) return showError("Title is required!");
      if(resType !== 'blog' && !selectedSegment) return showError("Select a Segment.");
      setSubmitting(true);
      
      let finalContent = richContent;
      if(resType === 'blog' && editorRef.current) finalContent = editorRef.current.getContents();
      else if (resType === 'question') finalContent = questionContent; 
      
      let url: string | null = resLink;
      if (resType === 'blog' && blogImageMethod === 'upload' && blogImageFile) {
          const name = `blog-${Date.now()}`; await supabase.storage.from('materials').upload(name, blogImageFile);
          url = supabase.storage.from('materials').getPublicUrl(name).data.publicUrl;
      } else if (resType !== 'blog' && resType !== 'question' && resFile) {
          const name = `file-${Date.now()}`; await supabase.storage.from('materials').upload(name, resFile);
          url = supabase.storage.from('materials').getPublicUrl(name).data.publicUrl;
      }

      const payload: any = { 
          title: resTitle, type: resType, seo_title: commonSeoTitle||resTitle, seo_description: commonSeoDesc,
          tags: commonTags.split(',').map(t=>t.trim()).filter(Boolean)
      };
      if(selectedSegment) payload.segment_id = Number(selectedSegment);
      if(selectedGroup) payload.group_id = Number(selectedGroup);
      if(selectedSubject) payload.subject_id = Number(selectedSubject);

      if(resType==='pdf' || resType==='video') payload.content_url = url;
      else if(resType==='question') { payload.content_body = finalContent; }
      else if(resType==='blog') { payload.content_body = finalContent; payload.content_url = url; payload.category = blogCategory; }

      const { error } = editingResourceId ? await supabase.from('resources').update(payload).eq('id', editingResourceId) : await supabase.from('resources').insert([payload]);
      setSubmitting(false);
      if (error) showError(error.message); else { fetchResources(selectedSegment,selectedGroup,selectedSubject); setEditorMode(false); resetResourceForm(); showSuccess("Saved!"); }
  };

  const handleEbookSubmit = async () => {
     if(!ebTitle) return showError("Title required"); setSubmitting(true);
     let cUrl = null; const cover=(document.getElementById('eb-cover') as HTMLInputElement)?.files?.[0];
     if(cover){ const n=`cover-${Date.now()}`; await supabase.storage.from('covers').upload(n,cover); cUrl=supabase.storage.from('covers').getPublicUrl(n).data.publicUrl; }
     let finalDesc = ebDescription; if(editorRef.current) finalDesc = editorRef.current.getContents();
     const p={title:ebTitle, author:ebAuthor, category:ebCategory, description:finalDesc, pdf_url:ebLink, seo_title:commonSeoTitle, seo_description:commonSeoDesc, tags:commonTags.split(',').filter(Boolean)};
     if(cUrl) (p as any).cover_url=cUrl;
     const {error} = editingEbookId ? await supabase.from('ebooks').update(p).eq('id', editingEbookId) : await supabase.from('ebooks').insert([p]);
     setSubmitting(false); if(error) showError(error.message); else { setEditorMode(false); resetResourceForm(); fetchEbooks(); showSuccess("Ebook Saved"); }
  };

  const handleUpdateSubmit = async () => {
      if(!updateTitle || !updateSegmentId) return showError("Segment & Title Required"); setSubmitting(true);
      let url=null; if(updateFile){const n=`up-${Date.now()}`; await supabase.storage.from('materials').upload(n,updateFile); url=supabase.storage.from('materials').getPublicUrl(n).data.publicUrl;}
      let finalContent = updateContent; if(editorRef.current) finalContent = editorRef.current.getContents();
      const p={title:updateTitle, type:updateType, segment_id:Number(updateSegmentId), content_body:finalContent, seo_title:commonSeoTitle, seo_description:commonSeoDesc, tags:commonTags.split(',').filter(Boolean)};
      if(url) (p as any).attachment_url = url;
      const {error}=editingUpdateId?await supabase.from('segment_updates').update(p).eq('id',editingUpdateId):await supabase.from('segment_updates').insert([p]);
      setSubmitting(false); if(error) showError(error.message); else { setEditorMode(false); resetResourceForm(); fetchSegmentUpdates(); showSuccess("Update Posted"); }
  };

  const handleNewsSubmit = async () => { 
     if(!newsTitle) return showError("Headline required"); setSubmitting(true);
     let url=null; if(newsFile){ const n=`news-${Date.now()}`; await supabase.storage.from('materials').upload(n,newsFile); url=supabase.storage.from('materials').getPublicUrl(n).data.publicUrl; }
     let finalContent = newsContent; if(editorRef.current) finalContent = editorRef.current.getContents();
     const p={title:newsTitle, content:finalContent, category:newsCategory, seo_title:commonSeoTitle, seo_description:commonSeoDesc, tags:commonTags.split(',').filter(Boolean)};
     if(url) (p as any).image_url=url;
     if(editingNewsId) await supabase.from('news').update(p).eq('id', editingNewsId); else await supabase.from('news').insert([p]);
     setSubmitting(false); setEditorMode(false); resetResourceForm(); showSuccess("News Saved");
  };

  const handleCourseSubmit = async () => { 
     if(!cTitle) return showError("Title required"); setSubmitting(true);
     let thumb=null; if(cImage){ const n=`course-${Date.now()}`; await supabase.storage.from('materials').upload(n,cImage); thumb=supabase.storage.from('materials').getPublicUrl(n).data.publicUrl; }
     let finalDesc = cDesc; if(editorRef.current) finalDesc = editorRef.current.getContents();
     const p={title:cTitle, instructor:cInstructor, price:cPrice, discount_price:cDiscountPrice, duration:cDuration, enrollment_link:cLink, description:finalDesc, category:cCategory, seo_title:commonSeoTitle, seo_description:commonSeoDesc, tags:commonTags.split(',').filter(Boolean)};
     if(thumb) (p as any).thumbnail_url=thumb;
     if(editingCourseId) await supabase.from('courses').update(p).eq('id', editingCourseId); else { if(!thumb) {showError("Thumb req");setSubmitting(false);return;} (p as any).thumbnail_url=thumb; await supabase.from('courses').insert([p]); }
     setSubmitting(false); setEditorMode(false); resetResourceForm(); fetchCourses(); showSuccess("Course Saved");
  };

  // --- REUSABLE EDIT LOADERS (Fix for missing names) ---
  const handleAddNew = (type: string) => {
      clearAllForms();
      if(type === 'resource') { setResType('pdf'); } 
      else if(type === 'blog') { setResType('blog'); }
      // The rest use default cleared state
      setEditorMode(true);
      markDirty();
  };

  const openEditor = (item: any, context: string) => {
      clearAllForms();
      setCommonTags(item?.tags?.join(", ") || ""); setCommonSeoTitle(item?.seo_title || ""); setCommonSeoDesc(item?.seo_description || "");
      if(context === 'resource' || context === 'blog') {
          setEditingResourceId(item.id); setResTitle(item.title); setResType(item.type); setResLink(item.content_url||""); 
          setRichContent(item.content_body||""); setQuestionContent(item.content_body||""); setBlogCategory(item.category||"");
          if(item.content_url) { setBlogImageLink(item.content_url); setBlogImageMethod('link'); }
          if(item.segment_id) { setSelectedSegment(String(item.segment_id)); fetchGroups(String(item.segment_id)); }
          if(item.group_id) { setSelectedGroup(String(item.group_id)); fetchSubjects(String(item.group_id)); }
          if(item.subject_id) setSelectedSubject(String(item.subject_id));
      } 
      else if (context === 'update') { setEditingUpdateId(item.id); setUpdateTitle(item.title); setUpdateType(item.type); setUpdateSegmentId(String(item.segment_id)); setUpdateContent(item.content_body||""); }
      else if (context === 'ebook') { setEditingEbookId(item.id); setEbTitle(item.title); setEbAuthor(item.author); setEbCategory(item.category); setEbDescription(item.description||""); setEbLink(item.pdf_url||""); }
      else if (context === 'news') { setEditingNewsId(item.id); setNewsTitle(item.title); setNewsContent(item.content||""); setNewsCategory(item.category); }
      else if (context === 'course') { setEditingCourseId(item.id); setCTitle(item.title); setCInstructor(item.instructor); setCPrice(item.price); setCDiscountPrice(item.discount_price); setCDuration(item.duration); setCLink(item.enrollment_link); setCDesc(item.description||""); setCCategory(item.category); }
      setEditorMode(true); markDirty();
  };
  const loadUpdateForEdit = (u: any) => openEditor(u, 'update');
  const loadNewsForEdit = (n: any) => openEditor(n, 'news');
  const loadEbookForEdit = (b: any) => openEditor(b, 'ebook');
  const loadCourseForEdit = (c: any) => openEditor(c, 'course');

  // --- UI COMPONENTS ---
  const ListHeader = ({ title, onAdd, onSearch, searchVal }: any) => (
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                  <input className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Search..." value={searchVal} onChange={e=>onSearch(e.target.value)} />
                  <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
              </div>
              <button onClick={onAdd} className="bg-black hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg transition-all">+ Add New</button>
          </div>
      </div>
  );

  const EditorLayout = ({ title, onSave, children }: any) => (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-slide-up">
          <div className="bg-slate-50 p-4 border-b flex justify-between items-center sticky top-0 z-10">
              <button onClick={handleBackToList} className="text-slate-500 hover:text-black font-bold text-sm flex items-center gap-1">← Back to List</button>
              <div className="flex gap-2 items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase hidden md:block">Unsaved Changes</span>
                  <button onClick={onSave} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md transition-all">
                      {submitting ? "Saving..." : "Save Content"}
                  </button>
              </div>
          </div>
          <div className="p-8 max-w-7xl mx-auto space-y-8">
              <h2 className="text-3xl font-black text-slate-900">{title}</h2>
              {children}
          </div>
      </div>
  );

  const PaginationControls = ({ page, setPage, hasMore }: any) => (
      <div className="flex justify-between px-4 py-3 bg-white border-t border-slate-100"><button onClick={()=>setPage(Math.max(0,page-1))} disabled={page===0} className="text-xs font-bold text-slate-500 disabled:opacity-30">← Prev</button><span className="text-xs font-bold text-slate-400">Page {page+1}</span><button onClick={()=>setPage(page+1)} disabled={!hasMore} className="text-xs font-bold text-slate-500 disabled:opacity-30">Next →</button></div>
  );

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-bold">Loading Panel...</div>;
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pt-32">
      
      {/* --- CATEGORY MODAL --- */}
      {isManageCatsOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-[500px] max-h-[85vh] flex flex-col overflow-hidden animate-slide-up">
                  <div className="p-5 border-b flex justify-between items-center bg-slate-50">
                      <div><h3 className="font-bold text-lg text-slate-900">Manage Categories</h3><p className="text-xs text-slate-500 font-bold uppercase">Context: {activeCatContext}</p></div>
                      <button onClick={()=>setIsManageCatsOpen(false)} className="bg-white p-2 rounded-full shadow hover:bg-red-50 text-slate-400 hover:text-red-500">✕</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 space-y-3">
                          <input id="newCatInput" className="w-full bg-white border p-3 rounded-xl text-sm outline-none" placeholder="New Category Name..." />
                          <div className="grid grid-cols-3 gap-2">
                              <select className="bg-white border p-2 rounded-lg text-xs" value={catModalSegment} onChange={e => { setCatModalSegment(e.target.value); fetchModalGroups(e.target.value); }}><option value="">Global</option>{segments.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                              <select className="bg-white border p-2 rounded-lg text-xs" value={catModalGroup} onChange={e => { setCatModalGroup(e.target.value); fetchModalSubjects(e.target.value); }} disabled={!catModalSegment}><option value="">All Groups</option>{catModalGroupsList.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select>
                              <select className="bg-white border p-2 rounded-lg text-xs" value={catModalSubject} onChange={e => setCatModalSubject(e.target.value)} disabled={!catModalGroup}><option value="">All Subjects</option>{catModalSubjectsList.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                          </div>
                          <button onClick={async ()=>{ const input = document.getElementById('newCatInput') as HTMLInputElement; if(input.value) { const payload: any = { name: input.value, type: activeCatContext }; if(catModalSegment) payload.segment_id = Number(catModalSegment); if(catModalGroup) payload.group_id = Number(catModalGroup); if(catModalSubject) payload.subject_id = Number(catModalSubject); await supabase.from('categories').insert([payload]); input.value=""; fetchCategories(); } }} className="w-full bg-black text-white py-2 rounded-lg font-bold text-sm">+ Add</button>
                      </div>
                      <div className="space-y-2">{categories.filter(c => c.type === activeCatContext || c.type === 'general' || !c.type).map(c => (<div key={c.id} className="flex justify-between items-center p-3 bg-white border rounded-xl"><span className="text-sm font-bold">{c.name}</span><button onClick={()=>deleteItem('categories', c.id, fetchCategories)} className="text-red-400 hover:text-red-600">🗑️</button></div>))}</div>
                  </div>
              </div>
          </div>
      )}
      
      {/* --- CONFIRMATION MODAL --- */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-pop-in text-center">
                <h3 className="text-xl font-black mb-2 capitalize">{modal.type}!</h3>
                <p className="text-slate-500 text-sm mb-6">{modal.message}</p>
                <div className="flex gap-3 justify-center">{modal.type === 'confirm' ? <><button onClick={closeModal} className="px-5 py-2 border rounded-xl font-bold">Cancel</button><button onClick={()=>{modal.onConfirm?.();closeModal()}} className="px-5 py-2 bg-red-600 text-white rounded-xl font-bold">Confirm</button></> : <button onClick={closeModal} className="px-8 py-2 bg-black text-white rounded-xl font-bold">Okay</button>}</div>
            </div>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed top-0 bottom-0 z-20 hidden md:flex flex-col shadow-sm pt-20">
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {[{ id: 'materials', label: 'Study Materials', icon: '📂' }, { id: 'updates', label: 'Updates & Notices', icon: '📢' }, { id: 'class-blogs', label: 'Class Blogs', icon: '✍️' }, { id: 'ebooks', label: 'eBook Library', icon: '📚' }, { id: 'courses', label: 'Courses', icon: '🎓' }, { id: 'news', label: 'Newsroom', icon: '📰' }].map((tab) => (
                <button key={tab.id} onClick={() => handleTabSwitch(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:bg-slate-50'}`}><span className="text-lg">{tab.icon}</span> {tab.label}</button>
            ))}
        </nav>
        <div className="p-4 border-t"><button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl">Sign Out</button></div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 md:ml-64 p-8 overflow-x-hidden min-h-screen">
        <div className="max-w-[1600px] mx-auto w-full">
            
            {/* MOBILE NAV */}
            <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2">{['materials','updates','class-blogs','ebooks','courses','news'].map(t => <button key={t} onClick={() => handleTabSwitch(t)} className={`px-4 py-2 rounded-full text-xs font-bold border whitespace-nowrap ${activeTab===t?'bg-black text-white':'bg-white'}`}>{t}</button>)}</div>

            {/* HEADER FOR LIST VIEW */}
            {!editorMode && (
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 capitalize">{activeTab.replace('-', ' ')}</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase mt-1">Management Console</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <input className="w-full md:w-64 bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-4 py-2.5 text-sm outline-none" placeholder="Search..." onChange={e=>setResSearch(e.target.value)} />
                        <button onClick={() => {
                            if(activeTab === 'materials' || activeTab === 'class-blogs') handleAddNew(activeTab === 'class-blogs' ? 'blog' : 'resource');
                            else if(activeTab === 'updates') handleAddNew('update');
                            else if(activeTab === 'ebooks') handleAddNew('ebook');
                            else if(activeTab === 'courses') handleAddNew('course');
                            else if(activeTab === 'news') handleAddNew('news');
                        }} className="bg-black hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-all whitespace-nowrap">+ Add New</button>
                    </div>
                </div>
            )}

            {/* --- 1. STUDY MATERIALS & BLOGS --- */}
            {(activeTab === 'materials' || activeTab === 'class-blogs') && (
              !editorMode ? (
                  <div className="animate-fade-in space-y-6">
                      <FilterBar segments={segments} groups={groups} subjects={subjects} selSeg={selectedSegment} setSelSeg={setSelectedSegment} selGrp={selectedGroup} setSelGrp={setSelectedGroup} selSub={selectedSubject} setSelSub={setSelectedSubject} onFetchGroups={fetchGroups} onFetchSubjects={fetchSubjects} newSeg={newSegment} setNewSeg={setNewSegment} newGrp={newGroup} setNewGrp={setNewGroup} newSub={newSubject} setNewSub={setNewSubject} onAddSegment={handleSegmentSubmit} onAddGroup={handleGroupSubmit} onAddSubject={handleSubjectSubmit} />
                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                          <table className="w-full text-left text-sm text-slate-600">
                              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b"><tr><th className="px-6 py-4">Title</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Date</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
                              <tbody className="divide-y divide-slate-100">
                                  {resources.map(r=>(<tr key={r.id} className="hover:bg-slate-50 transition"><td className="px-6 py-4 font-bold text-slate-800">{r.title}</td><td className="px-6 py-4"><span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${r.type==='pdf'?'bg-red-100 text-red-600':r.type==='video'?'bg-blue-100 text-blue-600':'bg-yellow-100 text-yellow-600'}`}>{r.type}</span></td><td className="px-6 py-4 text-xs font-mono">{new Date(r.created_at).toLocaleDateString()}</td><td className="px-6 py-4 text-right flex justify-end gap-2"><button onClick={()=>openEditor(r, activeTab === 'class-blogs' ? 'blog' : 'resource')} className="text-blue-600 font-bold text-xs">Edit</button><button onClick={()=>deleteItem('resources',r.id,()=>fetchResources(selectedSegment,selectedGroup,selectedSubject))} className="text-red-600 font-bold text-xs">Del</button></td></tr>))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              ) : (
                  // EDITOR LAYOUT (75% / 25%)
                  <div className="flex flex-col lg:flex-row gap-8 animate-slide-up">
                      <div className="lg:w-3/4 space-y-6">
                          <input className="text-4xl font-black w-full bg-transparent border-b pb-4 outline-none placeholder-slate-300" placeholder="Post Title..." value={resTitle} onChange={e=>{setResTitle(e.target.value); markDirty();}} />
                          {resType === 'question' ? <div className="border rounded-xl overflow-hidden"><SunEditor getSunEditorInstance={getSunEditorInstance} setContents={questionContent} onChange={(c:string)=>{setQuestionContent(c); markDirty();}} setOptions={editorOptions}/></div> 
                          : resType === 'blog' ? <div className="min-h-[600px] border rounded-xl overflow-hidden"><SunEditor getSunEditorInstance={getSunEditorInstance} setContents={richContent} onChange={(c:string)=>{setRichContent(c); markDirty();}} setOptions={editorOptions}/></div>
                          : null}
                          
                          {/* File/Link Inputs for PDF/Video */}
                          {(resType === 'pdf' || resType === 'video') && (
                              <div className="bg-white p-6 rounded-xl border border-slate-200">
                                  <h4 className="text-sm font-bold mb-4">Content Source</h4>
                                  {resType === 'pdf' && <div className="border-2 border-dashed p-8 text-center rounded-xl relative hover:bg-slate-50"><input type="file" onChange={e=>{setResFile(e.target.files?.[0]||null); markDirty();}} className="absolute inset-0 opacity-0 cursor-pointer"/><span className="text-2xl">📂</span><p className="text-sm font-bold text-slate-500 mt-2">{resFile?resFile.name:"Upload PDF File"}</p></div>}
                                  {resType === 'video' && <input className="w-full border p-3 rounded-xl text-sm" value={resLink} onChange={e=>{setResLink(e.target.value); markDirty();}} placeholder="YouTube Embed Link..." />}
                              </div>
                          )}
                      </div>
                      <div className="lg:w-1/4 space-y-6">
                          {/* ACTION BOX */}
                          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                              <h4 className="text-xs font-bold uppercase text-slate-400">Publishing</h4>
                              <div className="flex gap-2">
                                  <button onClick={handleBackToList} className="flex-1 py-2 border rounded-lg text-xs font-bold text-slate-600">Cancel</button>
                                  <button onClick={uploadResource} disabled={submitting} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">{submitting?"Saving...":"Publish"}</button>
                              </div>
                          </div>
                          {/* METADATA BOX */}
                          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                              <h4 className="text-xs font-bold uppercase text-slate-400">Settings</h4>
                              <div><label className="text-xs font-bold block mb-1">Type</label><select className="w-full border p-2 rounded-lg text-xs font-bold" value={resType} onChange={e=>{setResType(e.target.value); markDirty();}}><option value="pdf">📄 PDF</option><option value="video">🎬 Video</option><option value="question">❓ Question</option><option value="blog">✍️ Blog</option></select></div>
                              <div><label className="text-xs font-bold block mb-1">Hierarchy</label><div className="space-y-2"><select className="w-full border p-2 rounded text-xs" value={selectedSegment} onChange={e=>{handleSegmentClick(e.target.value); markDirty();}}><option value="">Segment</option>{segments.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select><select className="w-full border p-2 rounded text-xs" value={selectedGroup} onChange={e=>{handleGroupClick(e.target.value); markDirty();}} disabled={!selectedSegment}><option value="">Group</option>{groups.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select><select className="w-full border p-2 rounded text-xs" value={selectedSubject} onChange={e=>{handleSubjectClick(e.target.value); markDirty();}} disabled={!selectedGroup}><option value="">Subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></div></div>
                              {resType === 'blog' && <CategoryManager label="Category" value={blogCategory} onChange={setBlogCategory} context="blog" />}
                          </div>
                          {resType === 'blog' && (
                              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                  <h4 className="text-xs font-bold uppercase text-slate-400">Featured Image</h4>
                                  <div className="flex gap-2 mb-2"><button onClick={()=>setBlogImageMethod('upload')} className={`flex-1 text-xs py-1 rounded border ${blogImageMethod==='upload'?'bg-slate-100 font-bold':''}`}>Upload</button><button onClick={()=>setBlogImageMethod('link')} className={`flex-1 text-xs py-1 rounded border ${blogImageMethod==='link'?'bg-slate-100 font-bold':''}`}>Link</button></div>{blogImageMethod==='upload'?<input type="file" onChange={e=>{setBlogImageFile(e.target.files?.[0]||null); markDirty();}} className="text-xs w-full"/>:<input className="w-full border p-1 rounded text-xs" placeholder="URL..." value={blogImageLink} onChange={e=>{setBlogImageLink(e.target.value); markDirty();}}/>}
                              </div>
                          )}
                          <SeoInputSection title={commonSeoTitle} setTitle={setCommonSeoTitle} tags={commonTags} setTags={setCommonTags} desc={commonSeoDesc} setDesc={setCommonSeoDesc} markDirty={markDirty} />
                      </div>
                  </div>
              )
            )}

            {/* --- 2. UPDATES TAB --- */}
            {activeTab === 'updates' && (
                !editorMode ? (
                    <div className="animate-fade-in space-y-6">
                        <FilterBar segments={segments} groups={groups} subjects={subjects} selSeg={selectedSegment} setSelSeg={setSelectedSegment} selGrp={selectedGroup} setSelGrp={setSelectedGroup} selSub={selectedSubject} setSelSub={setSelectedSubject} onFetchGroups={fetchGroups} onFetchSubjects={fetchSubjects} newSeg={newSegment} setNewSeg={setNewSegment} newGrp={newGroup} setNewGrp={setNewGroup} newSub={newSubject} setNewSub={setNewSubject} onAddSegment={handleSegmentSubmit} onAddGroup={handleGroupSubmit} onAddSubject={handleSubjectSubmit} />
                        <div className="space-y-2">{segmentUpdates.map(u=><div key={u.id} className="bg-white p-4 rounded-xl border flex justify-between items-center group hover:shadow-md transition"><div className="flex items-center gap-4"><span className={`text-[10px] font-bold px-2 py-1 rounded uppercase bg-slate-100`}>{u.type}</span><span className="font-bold text-slate-700">{u.title}</span></div><div className="flex gap-2 opacity-0 group-hover:opacity-100"><button onClick={()=>{loadUpdateForEdit(u); setEditorMode(true)}} className="text-xs font-bold text-blue-600">Edit</button><button onClick={()=>deleteItem('segment_updates',u.id,fetchSegmentUpdates)} className="text-xs font-bold text-red-600">Del</button></div></div>)}</div>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8 animate-slide-up">
                        <div className="lg:w-3/4 space-y-6">
                            <input className="text-4xl font-black w-full bg-transparent border-b pb-4 outline-none placeholder-slate-300" placeholder="Update Title..." value={updateTitle} onChange={e=>{setUpdateTitle(e.target.value); markDirty();}} />
                            <div className="border rounded-xl overflow-hidden"><SunEditor getSunEditorInstance={getSunEditorInstance} setContents={updateContent} onChange={(c:string)=>{setUpdateContent(c); markDirty();}} setOptions={editorOptions}/></div>
                            <div className="border-2 border-dashed p-4 text-center rounded-xl relative hover:bg-blue-50"><input type="file" onChange={e=>{setUpdateFile(e.target.files?.[0]||null); markDirty();}} className="absolute inset-0 opacity-0 cursor-pointer"/><span className="text-lg">📎</span> <span className="text-sm font-bold text-slate-500">{updateFile?updateFile.name:"Attach File"}</span></div>
                        </div>
                        <div className="lg:w-1/4 space-y-6">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <h4 className="text-xs font-bold uppercase text-slate-400">Publishing</h4>
                                <div className="flex gap-2"><button onClick={handleBackToList} className="flex-1 py-2 border rounded-lg text-xs font-bold text-slate-600">Cancel</button><button onClick={handleUpdateSubmit} disabled={submitting} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">{submitting?"...":"Publish"}</button></div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <h4 className="text-xs font-bold uppercase text-slate-400">Settings</h4>
                                <div><label className="text-xs font-bold block mb-1">Type</label><select className="w-full border p-2 rounded-lg text-xs font-bold" value={updateType} onChange={e=>{setUpdateType(e.target.value); markDirty();}}><option value="routine">📅 Routine</option><option value="syllabus">📝 Syllabus</option><option value="exam_result">🏆 Result</option></select></div>
                                <div><label className="text-xs font-bold block mb-1">Segment</label><select className="w-full border p-2 rounded-lg text-xs" value={updateSegmentId} onChange={e=>{setUpdateSegmentId(e.target.value); markDirty();}}><option value="">Select Segment</option>{segments.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></div>
                            </div>
                            <SeoInputSection title={commonSeoTitle} setTitle={setCommonSeoTitle} tags={commonTags} setTags={setCommonTags} desc={commonSeoDesc} setDesc={setCommonSeoDesc} markDirty={markDirty} />
                        </div>
                    </div>
                )
            )}

            {/* --- 3. EBOOKS TAB --- */}
            {activeTab === 'ebooks' && (
                !editorMode ? (
                    <div className="animate-fade-in space-y-6">
                        <FilterBar segments={segments} groups={groups} subjects={subjects} selSeg={selectedSegment} setSelSeg={setSelectedSegment} selGrp={selectedGroup} setSelGrp={setSelectedGroup} selSub={selectedSubject} setSelSub={setSelectedSubject} onFetchGroups={fetchGroups} onFetchSubjects={fetchSubjects} newSeg={newSegment} setNewSeg={setNewSegment} newGrp={newGroup} setNewGrp={setNewGroup} newSub={newSubject} setNewSub={setNewSubject} onAddSegment={handleSegmentSubmit} onAddGroup={handleGroupSubmit} onAddSubject={handleSubjectSubmit} />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{ebooksList.map(b=>(<div key={b.id} className="bg-white p-4 rounded-xl border shadow-sm group hover:shadow-md transition"><div className="flex gap-4"><div className="w-12 h-16 bg-slate-100 rounded overflow-hidden flex-shrink-0">{b.cover_url && <img src={b.cover_url} className="w-full h-full object-cover"/>}</div><div><h4 className="font-bold text-sm line-clamp-2">{b.title}</h4><p className="text-xs text-slate-500">{b.author}</p></div></div><div className="mt-3 flex justify-end gap-2 opacity-0 group-hover:opacity-100"><button onClick={()=>loadEbookForEdit(b)} className="text-xs font-bold text-blue-600">Edit</button><button onClick={()=>deleteItem('ebooks',b.id,fetchEbooks)} className="text-xs font-bold text-red-600">Del</button></div></div>))}</div>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8 animate-slide-up">
                        <div className="lg:w-3/4 space-y-6">
                            <input className="text-4xl font-black w-full bg-transparent border-b pb-4 outline-none placeholder-slate-300" placeholder="eBook Title..." value={ebTitle} onChange={e=>{setEbTitle(e.target.value); markDirty();}} />
                            <div className="border rounded-xl overflow-hidden"><SunEditor getSunEditorInstance={getSunEditorInstance} setContents={ebDescription} onChange={(c:string)=>{setEbDescription(c); markDirty();}} setOptions={editorOptions}/></div>
                        </div>
                        <div className="lg:w-1/4 space-y-6">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <h4 className="text-xs font-bold uppercase text-slate-400">Publishing</h4>
                                <div className="flex gap-2"><button onClick={handleBackToList} className="flex-1 py-2 border rounded-lg text-xs font-bold text-slate-600">Cancel</button><button onClick={handleEbookSubmit} disabled={submitting} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">{submitting?"...":"Save"}</button></div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <h4 className="text-xs font-bold uppercase text-slate-400">Meta</h4>
                                <div><label className="text-xs font-bold block mb-1">Author</label><input className="w-full border p-2 rounded-lg" value={ebAuthor} onChange={e=>{setEbAuthor(e.target.value); markDirty();}} /></div>
                                {/* FIXED: Ebook Context */}
                                <CategoryManager label="Category" value={ebCategory} onChange={setEbCategory} context="ebook" />
                                <div><label className="text-xs font-bold block mb-1">PDF URL</label><input className="w-full border p-2 rounded-lg" value={ebLink} onChange={e=>{setEbLink(e.target.value); markDirty();}} /></div>
                                <div className="relative group cursor-pointer border-2 border-dashed border-slate-300 bg-white p-3 rounded-xl flex items-center gap-3"><input type="file" id="eb-cover" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*"/><span className="text-xl">🖼️</span><span className="text-xs font-bold text-slate-500">Cover</span></div>
                            </div>
                            <SeoInputSection title={commonSeoTitle} setTitle={setCommonSeoTitle} tags={commonTags} setTags={setCommonTags} desc={commonSeoDesc} setDesc={setCommonSeoDesc} markDirty={markDirty} />
                        </div>
                    </div>
                )
            )}

            {/* --- 4. NEWS TAB --- */}
            {activeTab === 'news' && (
                !editorMode ? (
                    <div className="animate-fade-in space-y-6">
                        <FilterBar segments={segments} groups={groups} subjects={subjects} selSeg={selectedSegment} setSelSeg={setSelectedSegment} selGrp={selectedGroup} setSelGrp={setSelectedGroup} selSub={selectedSubject} setSelSub={setSelectedSubject} onFetchGroups={fetchGroups} onFetchSubjects={fetchSubjects} newSeg={newSegment} setNewSeg={setNewSegment} newGrp={newGroup} setNewGrp={setNewGroup} newSub={newSubject} setNewSub={setNewSubject} onAddSegment={handleSegmentSubmit} onAddGroup={handleGroupSubmit} onAddSubject={handleSubjectSubmit} />
                        <div className="space-y-2">{newsList.map(n=>(<div key={n.id} className="bg-white p-4 rounded-xl border flex justify-between items-center group hover:shadow-md transition"><span className="font-bold text-slate-700">{n.title}</span><div className="flex gap-2 opacity-0 group-hover:opacity-100"><button onClick={()=>loadNewsForEdit(n)} className="text-xs font-bold text-blue-600">Edit</button><button onClick={()=>deleteItem('news',n.id,fetchNews)} className="text-xs font-bold text-red-600">Del</button></div></div>))}</div>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8 animate-slide-up">
                        <div className="lg:w-3/4 space-y-6">
                            <input className="text-4xl font-black w-full bg-transparent border-b pb-4 outline-none placeholder-slate-300" placeholder="News Headline..." value={newsTitle} onChange={e=>{setNewsTitle(e.target.value); markDirty();}} />
                            <div className="border rounded-xl overflow-hidden"><SunEditor getSunEditorInstance={getSunEditorInstance} setContents={newsContent} onChange={(c:string)=>{setNewsContent(c); markDirty();}} setOptions={editorOptions}/></div>
                        </div>
                        <div className="lg:w-1/4 space-y-6">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <h4 className="text-xs font-bold uppercase text-slate-400">Publishing</h4>
                                <div className="flex gap-2"><button onClick={handleBackToList} className="flex-1 py-2 border rounded-lg text-xs font-bold text-slate-600">Cancel</button><button onClick={handleNewsSubmit} disabled={submitting} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">{submitting?"...":"Publish"}</button></div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <h4 className="text-xs font-bold uppercase text-slate-400">Settings</h4>
                                <CategoryManager label="Category" value={newsCategory} onChange={setNewsCategory} context="news" />
                                <div className="p-4 border-2 border-dashed rounded-lg text-center relative hover:bg-slate-50"><span className="text-xl">📸</span> <span className="text-xs font-bold text-slate-400">Cover</span><input type="file" onChange={e=>{setNewsFile(e.target.files?.[0]||null); markDirty();}} className="absolute inset-0 opacity-0 cursor-pointer"/></div>
                            </div>
                            <SeoInputSection title={commonSeoTitle} setTitle={setCommonSeoTitle} tags={commonTags} setTags={setCommonTags} desc={commonSeoDesc} setDesc={setCommonSeoDesc} markDirty={markDirty} />
                        </div>
                    </div>
                )
            )}

            {/* --- 5. COURSES TAB --- */}
            {activeTab === 'courses' && (
                !editorMode ? (
                    <div className="animate-fade-in space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{coursesList.map(c=>(<div key={c.id} className="bg-white p-4 rounded-xl border group hover:shadow-md transition"><div className="flex gap-4 items-center mb-3"><div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden">{c.thumbnail_url && <img src={c.thumbnail_url} className="w-full h-full object-cover"/>}</div><div><h4 className="font-bold text-sm line-clamp-1">{c.title}</h4><span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{c.category}</span></div></div><div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100"><button onClick={()=>loadCourseForEdit(c)} className="text-xs text-blue-600 font-bold">Edit</button><button onClick={()=>deleteItem('courses',c.id,fetchCourses)} className="text-xs text-red-600 font-bold">Del</button></div></div>))}</div>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8 animate-slide-up">
                        <div className="lg:w-3/4 space-y-6">
                            <input className="text-4xl font-black w-full bg-transparent border-b pb-4 outline-none placeholder-slate-300" placeholder="Course Title..." value={cTitle} onChange={e=>{setCTitle(e.target.value); markDirty();}} />
                            <div className="border rounded-xl overflow-hidden"><SunEditor getSunEditorInstance={getSunEditorInstance} setContents={cDesc} onChange={(c:string)=>{setCDesc(c); markDirty();}} setOptions={editorOptions}/></div>
                        </div>
                        <div className="lg:w-1/4 space-y-6">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <h4 className="text-xs font-bold uppercase text-slate-400">Publishing</h4>
                                <div className="flex gap-2"><button onClick={handleBackToList} className="flex-1 py-2 border rounded-lg text-xs font-bold text-slate-600">Cancel</button><button onClick={handleCourseSubmit} disabled={submitting} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">{submitting?"...":"Launch"}</button></div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <h4 className="text-xs font-bold uppercase text-slate-400">Course Data</h4>
                                <div><label className="text-xs font-bold block mb-1">Instructor</label><input className="w-full border p-2 rounded-lg" value={cInstructor} onChange={e=>{setCInstructor(e.target.value); markDirty();}} /></div>
                                <div className="grid grid-cols-2 gap-2"><div><label className="text-xs font-bold block mb-1">Price</label><input className="w-full border p-2 rounded-lg" value={cPrice} onChange={e=>{setCPrice(e.target.value); markDirty();}} /></div><div><label className="text-xs font-bold block mb-1">Discount</label><input className="w-full border p-2 rounded-lg" value={cDiscountPrice} onChange={e=>{setCDiscountPrice(e.target.value); markDirty();}} /></div></div>
                                <div><label className="text-xs font-bold block mb-1">Duration</label><input className="w-full border p-2 rounded-lg" value={cDuration} onChange={e=>{setCDuration(e.target.value); markDirty();}} /></div>
                                <div><label className="text-xs font-bold block mb-1">Enroll Link</label><input className="w-full border p-2 rounded-lg" value={cLink} onChange={e=>{setCLink(e.target.value); markDirty();}} /></div>
                                <CategoryManager label="Category" value={cCategory} onChange={setCCategory} context="course" />
                                <div className="p-4 border-2 border-dashed rounded-lg text-center relative hover:bg-slate-50"><span className="text-xl">📸</span> <span className="text-xs font-bold text-slate-400">Thumbnail</span><input type="file" onChange={e=>{setCImage(e.target.files?.[0]||null); markDirty();}} className="absolute inset-0 opacity-0 cursor-pointer"/></div>
                            </div>
                            <SeoInputSection title={commonSeoTitle} setTitle={setCommonSeoTitle} tags={commonTags} setTags={setCommonTags} desc={commonSeoDesc} setDesc={setCommonSeoDesc} markDirty={markDirty} />
                        </div>
                    </div>
                )
            )}

        </div>
      </main>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); scale: 0.98; } to { opacity: 1; transform: translateY(0); scale: 1; } }
      `}</style>
    </div>
  );
}