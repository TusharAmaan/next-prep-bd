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
    minHeight: "400px", height: "auto", placeholder: "Start content creation...",
    buttonList: [
        ['undo', 'redo'], ['save', 'template'], ['font', 'fontSize', 'formatBlock'],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'], ['removeFormat'],
        ['fontColor', 'hiliteColor', 'textStyle'], ['outdent', 'indent'],
        ['align', 'horizontalRule', 'list', 'lineHeight'], ['table', 'link', 'image', 'video', 'math'], 
        ['fullScreen', 'showBlocks', 'codeView', 'preview']
    ],
    mode: "classic", attributesWhitelist: { all: "style" },
    defaultStyle: "font-family: 'Inter', sans-serif; font-size: 16px; line-height: 1.6;",
    resizingBar: true, showPathLabel: true, katex: katex 
};

const PAGE_SIZE = 15;

type ModalState = { isOpen: boolean; type: 'success' | 'confirm' | 'error'; message: string; onConfirm?: () => void; };

// --- COMPONENTS ---

// 1. SEO SECTION (External to fix focus bug)
const SeoInputSection = ({ 
  title, setTitle, tags, setTags, desc, setDesc 
}: {
  title: string, setTitle: (v: string) => void,
  tags: string, setTags: (v: string) => void,
  desc: string, setDesc: (v: string) => void
}) => (
  <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2"><span>🚀</span> SEO Metadata</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Meta Title</label>
            <input className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Google search title..." />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Tags (Comma Separated)</label>
            <input className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={tags} onChange={e=>setTags(e.target.value)} placeholder="physics, math, algebra..." />
          </div>
      </div>
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Meta Description</label>
        <textarea className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none transition-all" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Brief summary for search results..." />
      </div>
  </div>
);

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("materials"); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editorMode, setEditorMode] = useState(false); // Controls View (List vs Editor)
  const editorRef = useRef<any>(null);
  const getSunEditorInstance = (sunEditor: any) => { editorRef.current = sunEditor; };

  // --- STATE ---
  const [modal, setModal] = useState<ModalState>({ isOpen: false, type: 'success', message: '' });
  
  // Hierarchy Data
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

  // Search & Page
  const [resPage, setResPage] = useState(0); const [resSearch, setResSearch] = useState("");
  const [newsPage, setNewsPage] = useState(0); const [newsSearch, setNewsSearch] = useState("");
  const [ebPage, setEbPage] = useState(0); const [ebSearch, setEbSearch] = useState("");
  const [updatePage, setUpdatePage] = useState(0); const [updateSearch, setUpdateSearch] = useState("");

  // Hierarchy Selection
  const [selectedSegment, setSelectedSegment] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Shared UI State
  const [submitting, setSubmitting] = useState(false);
  
  // --- CATEGORY MODAL ---
  const [isManageCatsOpen, setIsManageCatsOpen] = useState(false); 
  const [activeCatContext, setActiveCatContext] = useState("news"); 
  const [catModalSegment, setCatModalSegment] = useState("");
  const [catModalGroup, setCatModalGroup] = useState("");
  const [catModalSubject, setCatModalSubject] = useState("");
  const [catModalGroupsList, setCatModalGroupsList] = useState<any[]>([]);
  const [catModalSubjectsList, setCatModalSubjectsList] = useState<any[]>([]);

  // SEO (Common)
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
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);
  const [blogImageMethod, setBlogImageMethod] = useState<'upload' | 'link'>('upload');
  const [blogImageFile, setBlogImageFile] = useState<File | null>(null);
  const [blogImageLink, setBlogImageLink] = useState("");
  const [blogCategory, setBlogCategory] = useState("");

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
  const [cCategory, setCCategory] = useState(""); 
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
      if (session) { setIsAuthenticated(true); loadInitialData(); } else { router.push("/login"); }
      setIsLoading(false);
    };
    init();
  }, [router]);

  // Cleanup & Fetch on Tab Change
  useEffect(() => {
      setEditorMode(false); // Always go back to list view on tab switch
      clearAllForms();
      // Refetch data for the active tab to ensure freshness
      if(activeTab === 'materials' || activeTab === 'class-blogs') fetchResources(selectedSegment, selectedGroup, selectedSubject);
      if(activeTab === 'news') fetchNews();
      if(activeTab === 'ebooks') fetchEbooks();
      if(activeTab === 'courses') fetchCourses();
      if(activeTab === 'updates') fetchSegmentUpdates();
  }, [activeTab]);

  const clearAllForms = () => {
      resetResourceForm();
      setNewsTitle(""); setNewsContent(""); setNewsCategory(""); setNewsFile(null); setEditingNewsId(null);
      setEbTitle(""); setEbAuthor(""); setEbCategory(""); setEbDescription(""); setEbLink(""); setEditingEbookId(null);
      setCTitle(""); setCInstructor(""); setCPrice(""); setCDesc(""); setCCategory(""); setEditingCourseId(null);
      setUpdateTitle(""); setUpdateContent(""); setEditingUpdateId(null);
      clearSeoFields();
  };

  const loadInitialData = () => {
    fetchSegments(); fetchCategories(); 
    fetchResources(selectedSegment, selectedGroup, selectedSubject);
    fetchNews(); fetchEbooks(); fetchCourses(); fetchSegmentUpdates();
  };

  const showSuccess = (msg: string) => setModal({ isOpen: true, type: 'success', message: msg });
  const showError = (msg: string) => setModal({ isOpen: true, type: 'error', message: msg });
  const confirmAction = (msg: string, action: () => void) => setModal({ isOpen: true, type: 'confirm', message: msg, onConfirm: action });
  const closeModal = () => setModal({ ...modal, isOpen: false });
  const clearSeoFields = () => { setCommonTags(""); setCommonSeoTitle(""); setCommonSeoDesc(""); };

  // --- FETCHERS ---
  const fetchSegments = async () => { const {data} = await supabase.from("segments").select("*").order('id'); setSegments(data||[]); };
  const fetchGroups = async (segId: string) => { const {data} = await supabase.from("groups").select("*").eq("segment_id", segId).order('id'); setGroups(data||[]); };
  const fetchSubjects = async (grpId: string) => { const {data} = await supabase.from("subjects").select("*").eq("group_id", grpId).order('id'); setSubjects(data||[]); };
  const fetchCategories = async () => { const {data} = await supabase.from("categories").select("id, name, type, segment_id, group_id, subject_id").order('name'); setCategories(data||[]); };
  const fetchModalGroups = async (segId: string) => { const {data} = await supabase.from("groups").select("*").eq("segment_id", segId).order('id'); setCatModalGroupsList(data||[]); };
  const fetchModalSubjects = async (grpId: string) => { const {data} = await supabase.from("subjects").select("*").eq("group_id", grpId).order('id'); setCatModalSubjectsList(data||[]); };

  const fetchResources = async (segId: string | null, grpId: string | null, subId: string | null) => { 
      let query = supabase.from("resources").select("*").order('created_at',{ascending:false});
      if (subId) query = query.eq("subject_id", subId); else if (grpId) query = query.eq("group_id", grpId); else if (segId) query = query.eq("segment_id", segId);
      
      if(activeTab === 'class-blogs') query = query.eq("type", "blog");
      else if(activeTab === 'materials') query = query.neq("type", "blog"); // Materials tab excludes blogs now

      if (resSearch) query = query.ilike('title', `%${resSearch}%`);
      query = query.range(resPage * PAGE_SIZE, (resPage + 1) * PAGE_SIZE - 1);
      const {data} = await query; setResources(data||[]); 
  };
  useEffect(() => { if(activeTab === 'materials' || activeTab === 'class-blogs') fetchResources(selectedSegment, selectedGroup, selectedSubject); }, [resPage, resSearch]);
  
  // Other fetchers
  const fetchNews = async () => { let q = supabase.from("news").select("*").order('created_at',{ascending:false}); if(newsSearch) q = q.ilike('title', `%${newsSearch}%`); q=q.range(newsPage*PAGE_SIZE,(newsPage+1)*PAGE_SIZE-1); const {data}=await q; setNewsList(data||[]); };
  useEffect(() => { if(activeTab === 'news') fetchNews(); }, [newsPage, newsSearch, activeTab]);
  const fetchEbooks = async () => { let q = supabase.from("ebooks").select("*").order('created_at',{ascending:false}); if(ebSearch) q=q.ilike('title',`%${ebSearch}%`); q=q.range(ebPage*PAGE_SIZE,(ebPage+1)*PAGE_SIZE-1); const {data}=await q; setEbooksList(data||[]); };
  useEffect(() => { if(activeTab === 'ebooks') fetchEbooks(); }, [ebPage, ebSearch, activeTab]);
  const fetchCourses = async () => { const {data} = await supabase.from("courses").select("*").order('created_at',{ascending:false}); setCoursesList(data||[]); };
  const fetchSegmentUpdates = async () => { let q=supabase.from("segment_updates").select("*, segments(title)").order('created_at',{ascending:false}); if(updateSearch) q=q.ilike('title',`%${updateSearch}%`); q=q.range(updatePage*PAGE_SIZE,(updatePage+1)*PAGE_SIZE-1); const {data}=await q; setSegmentUpdates(data||[]); };
  useEffect(() => { if(activeTab === 'updates') fetchSegmentUpdates(); }, [updatePage, updateSearch, activeTab]);

  const deleteItem = (table: string, id: number, refresh: () => void) => { confirmAction("Are you sure you want to delete this item?", async () => { await supabase.from(table).delete().eq("id", id); refresh(); showSuccess("Item Deleted Successfully!"); }); };
  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  // --- HIERARCHY HANDLERS ---
  const handleSegmentClick = (id: string) => { setSelectedSegment(id); setSelectedGroup(""); setSelectedSubject(""); setGroups([]); setSubjects([]); fetchGroups(id); fetchResources(id, null, null); };
  const handleGroupClick = (id: string) => { setSelectedGroup(id); setSelectedSubject(""); setSubjects([]); fetchSubjects(id); fetchResources(selectedSegment, id, null); };
  const handleSubjectClick = (id: string) => { setSelectedSubject(id); fetchResources(selectedSegment, selectedGroup, id); };
  
  const handleSegmentSubmit = async () => { if(newSegment) { await supabase.from('segments').insert([{title:newSegment, slug:newSegment.toLowerCase().replace(/\s+/g,'-')}]); setNewSegment(""); fetchSegments(); }};
  const handleGroupSubmit = async () => { if(newGroup && selectedSegment) { await supabase.from('groups').insert([{title:newGroup, slug:newGroup.toLowerCase().replace(/\s+/g,'-'), segment_id: Number(selectedSegment)}]); setNewGroup(""); fetchGroups(selectedSegment); }};
  const handleSubjectSubmit = async () => { if(newSubject && selectedGroup) { await supabase.from('subjects').insert([{title:newSubject, slug:newSubject.toLowerCase().replace(/\s+/g,'-'), group_id: Number(selectedGroup), segment_id: Number(selectedSegment)}]); setNewSubject(""); fetchSubjects(selectedGroup); }};

  // --- SMART CATEGORY MANAGER ---
  const CategoryManager = ({ label, value, onChange, context, filterSegmentId, filterGroupId, filterSubjectId }: { label: string, value: string, onChange: (val: string) => void, context: string, filterSegmentId?: string, filterGroupId?: string, filterSubjectId?: string }) => {
      const filteredCats = categories.filter(c => {
          const typeMatch = c.type === context || c.type === 'general' || !c.type;
          if (!typeMatch) return false;
          const isGlobal = !c.segment_id && !c.group_id && !c.subject_id;
          if (isGlobal) return true;
          let matchesHierarchy = false;
          if (c.subject_id && filterSubjectId && c.subject_id === Number(filterSubjectId)) matchesHierarchy = true;
          else if (c.group_id && !c.subject_id && filterGroupId && c.group_id === Number(filterGroupId)) matchesHierarchy = true;
          else if (c.segment_id && !c.group_id && !c.subject_id && filterSegmentId && c.segment_id === Number(filterSegmentId)) matchesHierarchy = true;
          return matchesHierarchy;
      });
      return (
          <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-1">{label}</label>
              <div className="flex gap-2">
                  <select className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold outline-none cursor-pointer hover:border-slate-300 transition-colors" value={value} onChange={e=>onChange(e.target.value)}>
                      <option value="">Select Category</option>
                      {filteredCats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <button onClick={() => { setActiveCatContext(context); setCatModalSegment(filterSegmentId || ""); if(filterSegmentId) fetchModalGroups(filterSegmentId); setCatModalGroup(filterGroupId || ""); if(filterGroupId) fetchModalSubjects(filterGroupId); setCatModalSubject(filterSubjectId || ""); setIsManageCatsOpen(true); }} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 rounded-xl text-lg transition-colors">⚙️</button>
              </div>
          </div>
      );
  };

  // --- RESOURCE LOGIC ---
  const resetResourceForm = () => { 
      setEditingResourceId(null); setResTitle(""); setResLink(""); setResFile(null); setRichContent(""); setQuestionContent(""); 
      setBlogImageFile(null); setBlogImageLink(""); setBlogImageMethod('upload'); setBlogCategory(""); 
      setResType(activeTab === 'class-blogs' ? 'blog' : 'pdf'); 
      setEditorMode(false); clearSeoFields();
  };
  const openResourceEditor = (r?: any) => {
      clearSeoFields();
      if(r) {
          setEditingResourceId(r.id); setResTitle(r.title); setResType(r.type); setResLink(r.content_url||""); 
          setRichContent(r.content_body || ""); setQuestionContent(r.content_body || "");
          setCommonTags(r.tags ? r.tags.join(", ") : ""); setCommonSeoTitle(r.seo_title || ""); setCommonSeoDesc(r.seo_description || "");
          setBlogCategory(r.category || "");
          if(r.type==='blog') {
               if(r.content_url) { setBlogImageLink(r.content_url); setBlogImageMethod('link'); } 
               else { setBlogImageLink(""); setBlogImageMethod('upload'); }
          }
          if(r.segment_id) { setSelectedSegment(String(r.segment_id)); fetchGroups(String(r.segment_id)); }
          if(r.group_id) { setSelectedGroup(String(r.group_id)); fetchSubjects(String(r.group_id)); }
          if(r.subject_id) setSelectedSubject(String(r.subject_id));
      } else {
          resetResourceForm();
      }
      setEditorMode(true);
  };

  const uploadResource = async () => {
      if(!resTitle) return showError("Title is required!");
      if(resType !== 'blog' && !selectedSegment) return showError("Select a Segment.");
      
      let finalContent = richContent;
      if(resType === 'blog' && editorRef.current) finalContent = editorRef.current.getContents();
      else if (resType === 'question') finalContent = questionContent; 
      
      setSubmitting(true);
      let url: string | null = resLink;
      
      if (resType === 'blog') {
          url = null;
          if (blogImageMethod === 'upload' && blogImageFile) {
              const name = `blog-${Date.now()}-${blogImageFile.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
              await supabase.storage.from('materials').upload(name, blogImageFile);
              url = supabase.storage.from('materials').getPublicUrl(name).data.publicUrl;
          } else if (blogImageMethod === 'link' && blogImageLink) url = blogImageLink;
      } else if ((resType === 'pdf' || resType === 'video') && resFile) { 
           if(resFile) {
              const name = `file-${Date.now()}-${resFile.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
              await supabase.storage.from('materials').upload(name, resFile);
              url = supabase.storage.from('materials').getPublicUrl(name).data.publicUrl;
           }
      }

      const payload: any = { 
          title: resTitle, type: resType, seo_title: commonSeoTitle || resTitle, seo_description: commonSeoDesc,
          tags: commonTags.split(',').map(t=>t.trim()).filter(t=>t.length > 0), 
      };
      if(selectedSegment) payload.segment_id = Number(selectedSegment);
      if(selectedGroup) payload.group_id = Number(selectedGroup);
      if(selectedSubject) payload.subject_id = Number(selectedSubject);

      if(resType==='pdf' || resType==='video') payload.content_url = url;
      else if(resType==='question') { payload.content_body = finalContent; }
      else if(resType==='blog') { payload.content_body = finalContent; payload.content_url = url; payload.category = blogCategory; }

      const { error } = editingResourceId 
          ? await supabase.from('resources').update(payload).eq('id', editingResourceId)
          : await supabase.from('resources').insert([payload]);

      setSubmitting(false);
      if (error) showError("Failed: " + error.message); 
      else {
          fetchResources(selectedSegment, selectedGroup, selectedSubject);
          setEditorMode(false);
          resetResourceForm();
          showSuccess("Saved successfully!");
      }
  };

  const handleUpdateSubmit = async () => { 
      if(!updateTitle || !updateSegmentId) return showError("Required fields missing");
      setSubmitting(true);
      let url = null; if(updateFile) { const n=`update-${Date.now()}`; await supabase.storage.from('materials').upload(n, updateFile); url=supabase.storage.from('materials').getPublicUrl(n).data.publicUrl; }
      const p = { title: updateTitle, type: updateType, segment_id: Number(updateSegmentId), content_body: updateContent, seo_title: commonSeoTitle, seo_description: commonSeoDesc, tags: commonTags.split(',').filter(Boolean) };
      if(url) (p as any).attachment_url = url;
      const { error } = editingUpdateId ? await supabase.from('segment_updates').update(p).eq('id', editingUpdateId) : await supabase.from('segment_updates').insert([p]);
      setSubmitting(false);
      if(error) showError(error.message); else { setEditorMode(false); resetResourceForm(); fetchSegmentUpdates(); showSuccess("Update Saved"); }
  };
  const loadUpdateForEdit = (u: any) => { 
      clearSeoFields();
      setEditingUpdateId(u.id); setUpdateTitle(u.title); setUpdateType(u.type); setUpdateSegmentId(u.segment_id); setUpdateContent(u.content_body||""); setCommonTags(u.tags?.join(", ")||""); window.scrollTo({top:0,behavior:'smooth'}); setEditorMode(true);
  };

  const handleEbookSubmit = async () => { 
     if(!ebTitle) return showError("Title required"); setSubmitting(true);
     let cUrl = null; const cover=(document.getElementById('eb-cover') as HTMLInputElement)?.files?.[0];
     if(cover){ const n=`cover-${Date.now()}`; await supabase.storage.from('covers').upload(n,cover); cUrl=supabase.storage.from('covers').getPublicUrl(n).data.publicUrl; }
     const p={title:ebTitle, author:ebAuthor, category:ebCategory, description:ebDescription, pdf_url:ebLink, seo_title:commonSeoTitle, seo_description:commonSeoDesc, tags:commonTags.split(',').filter(Boolean)};
     if(cUrl) (p as any).cover_url=cUrl;
     const {error} = editingEbookId ? await supabase.from('ebooks').update(p).eq('id', editingEbookId) : await supabase.from('ebooks').insert([p]);
     setSubmitting(false); if(error) showError(error.message); else { setEditorMode(false); resetResourceForm(); fetchEbooks(); showSuccess("Ebook Saved"); }
  };
  const loadEbookForEdit = (b: any) => { 
      clearSeoFields();
      setEditingEbookId(b.id); setEbTitle(b.title); setEbAuthor(b.author); 
      setEbCategory(b.category); 
      setEbDescription(b.description||""); setEbLink(b.pdf_url||""); setCommonTags(b.tags?.join(", ")||""); window.scrollTo({top:0,behavior:'smooth'}); setEditorMode(true);
  };

  const handleCourseSubmit = async () => { 
     if(!cTitle) return showError("Title required"); setSubmitting(true);
     let thumb=null; if(cImage){ const n=`course-${Date.now()}`; await supabase.storage.from('materials').upload(n,cImage); thumb=supabase.storage.from('materials').getPublicUrl(n).data.publicUrl; }
     const p={title:cTitle, instructor:cInstructor, price:cPrice, discount_price:cDiscountPrice, duration:cDuration, enrollment_link:cLink, description:cDesc, category:cCategory, seo_title:commonSeoTitle, seo_description:commonSeoDesc, tags:commonTags.split(',').filter(Boolean)};
     if(thumb) (p as any).thumbnail_url=thumb;
     if(editingCourseId) await supabase.from('courses').update(p).eq('id', editingCourseId); else { if(!thumb) {showError("Thumb req");setSubmitting(false);return;} (p as any).thumbnail_url=thumb; await supabase.from('courses').insert([p]); }
     setSubmitting(false); setEditorMode(false); resetResourceForm(); fetchCourses(); showSuccess("Course Saved");
  };
  const loadCourseForEdit = (c:any) => { 
      clearSeoFields();
      setEditingCourseId(c.id); setCTitle(c.title); setCInstructor(c.instructor); setCPrice(c.price); setCDiscountPrice(c.discount_price); setCDuration(c.duration); setCLink(c.enrollment_link); setCDesc(c.description||""); setCCategory(c.category||""); setCommonTags(c.tags?.join(", ")||""); window.scrollTo({top:0,behavior:'smooth'}); setEditorMode(true);
  };

  const handleNewsSubmit = async () => { 
     if(!newsTitle) return showError("Headline required"); setSubmitting(true);
     let url=null; if(newsFile){ const n=`news-${Date.now()}`; await supabase.storage.from('materials').upload(n,newsFile); url=supabase.storage.from('materials').getPublicUrl(n).data.publicUrl; }
     const p={title:newsTitle, content:newsContent, category:newsCategory, seo_title:commonSeoTitle, seo_description:commonSeoDesc, tags:commonTags.split(',').filter(Boolean)};
     if(url) (p as any).image_url=url;
     if(editingNewsId) await supabase.from('news').update(p).eq('id', editingNewsId); else await supabase.from('news').insert([p]);
     setSubmitting(false); setEditorMode(false); resetResourceForm(); fetchNews(); showSuccess("News Saved");
  };
  const loadNewsForEdit = (n:any) => { 
      clearSeoFields();
      setEditingNewsId(n.id); setNewsTitle(n.title); setNewsContent(n.content||""); setNewsCategory(n.category); setCommonTags(n.tags?.join(", ")||""); window.scrollTo({top:0,behavior:'smooth'}); setEditorMode(true);
  };

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
              <button onClick={()=>{setEditorMode(false); resetResourceForm();}} className="text-slate-500 hover:text-black font-bold text-sm flex items-center gap-1">← Back to List</button>
              <div className="flex gap-2 items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase hidden md:block">Unsaved Changes</span>
                  <button onClick={onSave} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md transition-all">
                      {submitting ? "Saving..." : "Save Content"}
                  </button>
              </div>
          </div>
          <div className="p-8 max-w-5xl mx-auto space-y-8">
              <h2 className="text-3xl font-black text-slate-900">{title}</h2>
              {children}
          </div>
      </div>
  );

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-bold">Loading Panel...</div>;
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* GLOBAL MODALS (Category & Confirm) */}
      {isManageCatsOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
             {/* ... Same Category Modal Code as before ... */}
              <div className="bg-white rounded-2xl shadow-2xl w-[500px] max-h-[85vh] flex flex-col overflow-hidden animate-slide-up">
                  <div className="p-5 border-b flex justify-between items-center bg-slate-50">
                      <div><h3 className="font-bold text-lg text-slate-900">Manage Categories</h3><p className="text-xs text-slate-500 font-bold uppercase">Context: {activeCatContext}</p></div>
                      <button onClick={()=>setIsManageCatsOpen(false)} className="bg-white p-2 rounded-full shadow hover:bg-red-50 text-slate-400 hover:text-red-500">✕</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6 space-y-3">
                          <input id="newCatInput" className="w-full bg-white border p-3 rounded-xl text-sm outline-none shadow-sm" placeholder="New Category Name..." />
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
      
      {modal.isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-pop-in text-center">
                <h3 className="text-xl font-black mb-2 capitalize">{modal.type}!</h3>
                <p className="text-slate-500 text-sm mb-6">{modal.message}</p>
                <div className="flex gap-3 justify-center">{modal.type === 'confirm' ? <><button onClick={closeModal} className="px-5 py-2 border rounded-xl font-bold">Cancel</button><button onClick={()=>{modal.onConfirm?.();closeModal()}} className="px-5 py-2 bg-red-600 text-white rounded-xl font-bold">Confirm</button></> : <button onClick={closeModal} className="px-8 py-2 bg-black text-white rounded-xl font-bold">Okay</button>}</div>
            </div>
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed top-0 bottom-0 z-20 hidden md:flex flex-col shadow-sm">
        <div className="p-8 border-b border-slate-100"><h1 className="text-2xl font-black tracking-tight">NextPrep<span className="text-blue-600">.</span></h1><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Admin Panel</p></div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {[{ id: 'materials', label: 'Study Materials', icon: '📂' }, { id: 'updates', label: 'Updates & Notices', icon: '📢' }, { id: 'class-blogs', label: 'Class Blogs', icon: '✍️' }, { id: 'ebooks', label: 'eBook Library', icon: '📚' }, { id: 'courses', label: 'Courses', icon: '🎓' }, { id: 'news', label: 'Newsroom', icon: '📰' }].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:bg-slate-50'}`}><span className="text-lg">{tab.icon}</span> {tab.label}</button>
            ))}
        </nav>
        <div className="p-4 border-t"><button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl">Sign Out</button></div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 p-8 overflow-x-hidden min-h-screen">
        <div className="max-w-[1600px] mx-auto w-full">
            
            {/* MOBILE NAV (Hidden on Desktop) */}
            <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2">{['materials','updates','class-blogs','ebooks','courses','news'].map(t => <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-full text-xs font-bold border whitespace-nowrap ${activeTab===t?'bg-black text-white':'bg-white'}`}>{t}</button>)}</div>

            {/* === 1. STUDY MATERIALS TAB === */}
            {activeTab === 'materials' && (
              !editorMode ? (
                  // LIST VIEW
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                      {/* Sidebar Filter (Hierarchy) */}
                      <div className="lg:col-span-3 space-y-6">
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                              <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Filter By Hierarchy</h3>
                              <div className="space-y-4">
                                  <div><label className="text-xs font-bold text-slate-700 block mb-1">Segment</label><select className="w-full bg-slate-50 border p-2.5 rounded-lg text-sm font-bold" value={selectedSegment} onChange={e=>handleSegmentClick(e.target.value)}><option value="">Select Segment</option>{segments.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></div>
                                  <div className={!selectedSegment?'opacity-50 pointer-events-none':''}><label className="text-xs font-bold text-slate-700 block mb-1">Group</label><select className="w-full bg-slate-50 border p-2.5 rounded-lg text-sm font-bold" value={selectedGroup} onChange={e=>handleGroupClick(e.target.value)}><option value="">Select Group</option>{groups.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select></div>
                                  <div className={!selectedGroup?'opacity-50 pointer-events-none':''}><label className="text-xs font-bold text-slate-700 block mb-1">Subject</label><select className="w-full bg-slate-50 border p-2.5 rounded-lg text-sm font-bold" value={selectedSubject} onChange={e=>handleSubjectClick(e.target.value)}><option value="">Select Subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></div>
                              </div>
                              <div className="mt-6 pt-6 border-t border-slate-100">
                                  <p className="text-[10px] text-slate-400 mb-2">Manage Structure:</p>
                                  <div className="flex gap-2"><input className="w-full border p-1 rounded text-xs" placeholder="New..." value={newSegment} onChange={e=>setNewSegment(e.target.value)} /><button onClick={handleSegmentSubmit} className="bg-black text-white px-2 rounded text-xs">+</button></div>
                                  {/* Add Group/Subject inputs similarly if needed */}
                              </div>
                          </div>
                      </div>

                      {/* Content Table */}
                      <div className="lg:col-span-9">
                          <ListHeader title="Study Materials Library" onAdd={()=>openResourceEditor()} onSearch={(v:string)=>{setResSearch(v);setResPage(0)}} searchVal={resSearch} />
                          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                              <table className="w-full text-left text-sm text-slate-600">
                                  <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b">
                                      <tr><th className="px-6 py-4">Title</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Date</th><th className="px-6 py-4 text-right">Actions</th></tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                      {resources.map(r=>(
                                          <tr key={r.id} className="hover:bg-slate-50 transition">
                                              <td className="px-6 py-4 font-bold text-slate-800">{r.title}</td>
                                              <td className="px-6 py-4"><span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${r.type==='pdf'?'bg-red-100 text-red-600':r.type==='video'?'bg-blue-100 text-blue-600':'bg-yellow-100 text-yellow-600'}`}>{r.type}</span></td>
                                              <td className="px-6 py-4 text-xs font-mono">{new Date(r.created_at).toLocaleDateString()}</td>
                                              <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                  <button onClick={()=>openResourceEditor(r)} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded font-bold text-xs">Edit</button>
                                                  <button onClick={()=>deleteItem('resources',r.id,()=>fetchResources(selectedSegment,selectedGroup,selectedSubject))} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded font-bold text-xs">Delete</button>
                                              </td>
                                          </tr>
                                      ))}
                                      {resources.length===0 && <tr><td colSpan={4} className="p-8 text-center text-slate-400 italic">No materials found. Select a hierarchy or search.</td></tr>}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  </div>
              ) : (
                  // EDITOR VIEW (Overlay)
                  <EditorLayout title={editingResourceId ? "Edit Resource" : "Create New Resource"} onSave={uploadResource}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="md:col-span-2 space-y-4">
                              <div><label className="text-sm font-bold block mb-1">Title</label><input className="w-full border p-3 rounded-xl font-bold" value={resTitle} onChange={e=>setResTitle(e.target.value)} /></div>
                              {/* Conditional Content Inputs based on Type */}
                              {resType === 'pdf' && <div className="border-2 border-dashed p-8 text-center rounded-xl relative hover:bg-slate-50"><input type="file" onChange={e=>setResFile(e.target.files?.[0]||null)} className="absolute inset-0 opacity-0 cursor-pointer"/><span className="text-2xl">📂</span><p className="text-sm font-bold text-slate-500 mt-2">{resFile?resFile.name:"Upload PDF File"}</p></div>}
                              {resType === 'video' && <div><label className="text-sm font-bold block mb-1">YouTube Embed Link</label><input className="w-full border p-3 rounded-xl" value={resLink} onChange={e=>setResLink(e.target.value)} /></div>}
                              {resType === 'question' && <div className="border rounded-xl overflow-hidden"><SunEditor key={editingResourceId||'nq'} setContents={questionContent} onChange={setQuestionContent} setOptions={editorOptions}/></div>}
                          </div>
                          <div className="space-y-6">
                              <div><label className="text-sm font-bold block mb-1">Type</label><select className="w-full border p-3 rounded-xl font-bold" value={resType} onChange={e=>setResType(e.target.value)}><option value="pdf">📄 PDF Document</option><option value="video">🎬 Video Class</option><option value="question">❓ Question Bank</option></select></div>
                              <div className="p-4 bg-slate-50 rounded-xl border space-y-4">
                                  <h4 className="text-xs font-bold uppercase text-slate-400">Hierarchy</h4>
                                  <select className="w-full border p-2 rounded text-xs font-bold" value={selectedSegment} onChange={e=>handleSegmentClick(e.target.value)}><option value="">Select Segment</option>{segments.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                                  <select className="w-full border p-2 rounded text-xs font-bold" value={selectedGroup} onChange={e=>handleGroupClick(e.target.value)} disabled={!selectedSegment}><option value="">Select Group</option>{groups.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select>
                                  <select className="w-full border p-2 rounded text-xs font-bold" value={selectedSubject} onChange={e=>handleSubjectClick(e.target.value)} disabled={!selectedGroup}><option value="">Select Subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                              </div>
                          </div>
                      </div>
                      <SeoInputSection title={commonSeoTitle} setTitle={setCommonSeoTitle} tags={commonTags} setTags={setCommonTags} desc={commonSeoDesc} setDesc={setCommonSeoDesc} />
                  </EditorLayout>
              )
            )}

            {/* === 2. CLASS BLOGS TAB === */}
            {activeTab === 'class-blogs' && (
               !editorMode ? (
                   <div className="animate-fade-in">
                       <ListHeader title="Class Blogs" onAdd={()=>openResourceEditor({type: 'blog'})} onSearch={(v:string)=>{setResSearch(v);setResPage(0)}} searchVal={resSearch} />
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                           {resources.map(b=>(
                               <div key={b.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden group hover:shadow-xl transition-all relative">
                                   <div className="h-40 bg-slate-100 relative">
                                       {b.content_url ? <img src={b.content_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-white font-bold text-xs p-4 text-center">{b.title}</div>}
                                       <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition"><button onClick={()=>openResourceEditor(b)} className="bg-white p-1.5 rounded shadow text-xs">✏️</button><button onClick={()=>deleteItem('resources',b.id,()=>fetchResources(selectedSegment,selectedGroup,selectedSubject))} className="bg-white p-1.5 rounded shadow text-xs">🗑️</button></div>
                                   </div>
                                   <div className="p-4"><h3 className="font-bold text-sm line-clamp-2 mb-1">{b.title}</h3><p className="text-[10px] text-slate-400">{new Date(b.created_at).toLocaleDateString()}</p></div>
                               </div>
                           ))}
                       </div>
                   </div>
               ) : (
                   <EditorLayout title="Blog Editor" onSave={uploadResource}>
                       <input className="text-4xl font-black w-full border-b pb-4 outline-none placeholder-slate-300" placeholder="Blog Title..." value={resTitle} onChange={e=>setResTitle(e.target.value)} />
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                           <div className="md:col-span-2 min-h-[500px] border rounded-xl overflow-hidden"><SunEditor key={editingResourceId||'nb'} setContents={richContent} onChange={setRichContent} setOptions={editorOptions}/></div>
                           <div className="space-y-6">
                               <div className="p-4 bg-slate-50 rounded-xl border space-y-4">
                                   <h4 className="text-xs font-bold uppercase text-slate-400">Settings</h4>
                                   <CategoryManager label="Category" value={blogCategory} onChange={setBlogCategory} context="blog" filterSegmentId={selectedSegment} filterGroupId={selectedGroup} filterSubjectId={selectedSubject} />
                                   <div><label className="text-xs font-bold block mb-1">Cover Image</label><div className="flex gap-2 mb-2"><button onClick={()=>setBlogImageMethod('upload')} className={`flex-1 text-xs py-1 rounded border ${blogImageMethod==='upload'?'bg-white font-bold':''}`}>Upload</button><button onClick={()=>setBlogImageMethod('link')} className={`flex-1 text-xs py-1 rounded border ${blogImageMethod==='link'?'bg-white font-bold':''}`}>Link</button></div>{blogImageMethod==='upload'?<input type="file" onChange={e=>setBlogImageFile(e.target.files?.[0]||null)} className="text-xs w-full"/>:<input className="w-full border p-1 rounded text-xs" placeholder="URL..." value={blogImageLink} onChange={e=>setBlogImageLink(e.target.value)}/>}</div>
                               </div>
                               <SeoInputSection title={commonSeoTitle} setTitle={setCommonSeoTitle} tags={commonTags} setTags={setCommonTags} desc={commonSeoDesc} setDesc={setCommonSeoDesc} />
                           </div>
                       </div>
                   </EditorLayout>
               )
            )}
            
            {/* === 3. UPDATES TAB === */}
            {activeTab === 'updates' && (
                !editorMode ? (
                    <div className="animate-fade-in">
                        <ListHeader title="Segment Updates" onAdd={()=>{setEditorMode(true); setUpdateType('routine');}} onSearch={(v:string)=>{setUpdateSearch(v);setUpdatePage(0)}} searchVal={updateSearch} />
                        <div className="space-y-2">
                             {segmentUpdates.map(u=><div key={u.id} className="bg-white p-4 rounded-xl border flex justify-between items-center group hover:shadow-md transition"><div className="flex items-center gap-4"><span className={`text-[10px] font-bold px-2 py-1 rounded uppercase bg-slate-100`}>{u.type}</span><span className="font-bold text-slate-700">{u.title}</span></div><div className="flex gap-2 opacity-0 group-hover:opacity-100"><button onClick={()=>{loadUpdateForEdit(u); setEditorMode(true)}} className="text-xs font-bold text-blue-600">Edit</button><button onClick={()=>deleteItem('segment_updates',u.id,fetchSegmentUpdates)} className="text-xs font-bold text-red-600">Del</button></div></div>)}
                        </div>
                    </div>
                ) : (
                    <EditorLayout title="Update Editor" onSave={handleUpdateSubmit}>
                        <div className="grid grid-cols-2 gap-6">
                            <div><label className="text-sm font-bold block mb-1">Title</label><input className="w-full border p-3 rounded-xl" value={updateTitle} onChange={e=>setUpdateTitle(e.target.value)} /></div>
                            <div><label className="text-sm font-bold block mb-1">Type</label><select className="w-full border p-3 rounded-xl" value={updateType} onChange={e=>setUpdateType(e.target.value)}><option value="routine">📅 Routine</option><option value="syllabus">📝 Syllabus</option><option value="exam_result">🏆 Result</option></select></div>
                        </div>
                        <div><label className="text-sm font-bold block mb-1">Segment</label><select className="w-full border p-3 rounded-xl" value={updateSegmentId} onChange={e=>setUpdateSegmentId(e.target.value)}><option value="">Select Segment</option>{segments.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></div>
                        <div className="border rounded-xl overflow-hidden"><SunEditor key={editingUpdateId||'up'} setContents={updateContent} onChange={setUpdateContent} setOptions={editorOptions}/></div>
                        <SeoInputSection title={commonSeoTitle} setTitle={setCommonSeoTitle} tags={commonTags} setTags={setCommonTags} desc={commonSeoDesc} setDesc={setCommonSeoDesc} />
                    </EditorLayout>
                )
            )}

            {/* === 4. EBOOKS TAB === */}
            {activeTab === 'ebooks' && (
                !editorMode ? (
                    <div className="animate-fade-in">
                        <ListHeader title="eBooks Library" onAdd={()=>{setEditorMode(true); resetResourceForm();}} onSearch={(v:string)=>{setEbSearch(v);setEbPage(0)}} searchVal={ebSearch} />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {ebooksList.map(b=>(<div key={b.id} className="bg-white p-4 rounded-xl border shadow-sm group hover:shadow-md transition"><div className="flex gap-4"><div className="w-12 h-16 bg-slate-100 rounded overflow-hidden flex-shrink-0">{b.cover_url && <img src={b.cover_url} className="w-full h-full object-cover"/>}</div><div><h4 className="font-bold text-sm line-clamp-2">{b.title}</h4><p className="text-xs text-slate-500">{b.author}</p></div></div><div className="mt-3 flex justify-end gap-2 opacity-0 group-hover:opacity-100"><button onClick={()=>{loadEbookForEdit(b); setEditorMode(true);}} className="text-xs font-bold text-blue-600">Edit</button><button onClick={()=>deleteItem('ebooks',b.id,fetchEbooks)} className="text-xs font-bold text-red-600">Del</button></div></div>))}
                        </div>
                    </div>
                ) : (
                    <EditorLayout title="eBook Editor" onSave={handleEbookSubmit}>
                        <div className="grid grid-cols-2 gap-6">
                            <div><label className="text-sm font-bold block mb-1">Title</label><input className="w-full border p-3 rounded-xl" value={ebTitle} onChange={e=>setEbTitle(e.target.value)} /></div>
                            <div><label className="text-sm font-bold block mb-1">Author</label><input className="w-full border p-3 rounded-xl" value={ebAuthor} onChange={e=>setEbAuthor(e.target.value)} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                           <div><label className="text-sm font-bold block mb-1">Category</label><CategoryManager label="" value={ebCategory} onChange={setEbCategory} context="ebook" /></div>
                           <div><label className="text-sm font-bold block mb-1">PDF Link</label><input className="w-full border p-3 rounded-xl" value={ebLink} onChange={e=>setEbLink(e.target.value)} /></div>
                        </div>
                        <div className="border rounded-xl overflow-hidden"><SunEditor key={editingEbookId||'neb'} setContents={ebDescription} onChange={setEbDescription} setOptions={editorOptions}/></div>
                        <SeoInputSection title={commonSeoTitle} setTitle={setCommonSeoTitle} tags={commonTags} setTags={setCommonTags} desc={commonSeoDesc} setDesc={setCommonSeoDesc} />
                    </EditorLayout>
                )
            )}

            {/* === 5. COURSES TAB === */}
            {activeTab === 'courses' && (
                !editorMode ? (
                    <div className="animate-fade-in">
                        <ListHeader title="Courses" onAdd={()=>{setEditorMode(true); resetResourceForm();}} onSearch={()=>{}} searchVal="" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {coursesList.map(c=>(<div key={c.id} className="bg-white p-4 rounded-xl border group hover:shadow-md transition"><div className="flex gap-4 items-center mb-3"><div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden">{c.thumbnail_url && <img src={c.thumbnail_url} className="w-full h-full object-cover"/>}</div><div><h4 className="font-bold text-sm line-clamp-1">{c.title}</h4><span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{c.category}</span></div></div><div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100"><button onClick={()=>{loadCourseForEdit(c); setEditorMode(true);}} className="text-xs text-blue-600 font-bold">Edit</button><button onClick={()=>deleteItem('courses',c.id,fetchCourses)} className="text-xs text-red-600 font-bold">Del</button></div></div>))}
                        </div>
                    </div>
                ) : (
                    <EditorLayout title="Course Editor" onSave={handleCourseSubmit}>
                        <div className="grid grid-cols-2 gap-6">
                            <div><label className="text-sm font-bold block mb-1">Title</label><input className="w-full border p-3 rounded-xl" value={cTitle} onChange={e=>setCTitle(e.target.value)} /></div>
                            <div><label className="text-sm font-bold block mb-1">Instructor</label><input className="w-full border p-3 rounded-xl" value={cInstructor} onChange={e=>setCInstructor(e.target.value)} /></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div><label className="text-sm font-bold block mb-1">Price</label><input className="w-full border p-3 rounded-xl" value={cPrice} onChange={e=>setCPrice(e.target.value)} /></div>
                            <div><label className="text-sm font-bold block mb-1">Discount</label><input className="w-full border p-3 rounded-xl" value={cDiscountPrice} onChange={e=>setCDiscountPrice(e.target.value)} /></div>
                            <div><label className="text-sm font-bold block mb-1">Duration</label><input className="w-full border p-3 rounded-xl" value={cDuration} onChange={e=>setCDuration(e.target.value)} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                             <div><label className="text-sm font-bold block mb-1">Link</label><input className="w-full border p-3 rounded-xl" value={cLink} onChange={e=>setCLink(e.target.value)} /></div>
                             <CategoryManager label="Category" value={cCategory} onChange={setCCategory} context="course" />
                        </div>
                        <div className="border rounded-xl overflow-hidden"><SunEditor key={editingCourseId||'nc'} setContents={cDesc} onChange={setCDesc} setOptions={editorOptions}/></div>
                        <SeoInputSection title={commonSeoTitle} setTitle={setCommonSeoTitle} tags={commonTags} setTags={setCommonTags} desc={commonSeoDesc} setDesc={setCommonSeoDesc} />
                    </EditorLayout>
                )
            )}

            {/* === 6. NEWS TAB === */}
            {activeTab === 'news' && (
                !editorMode ? (
                    <div className="animate-fade-in">
                        <ListHeader title="Newsroom" onAdd={()=>{setEditorMode(true); resetResourceForm();}} onSearch={(v:string)=>{setNewsSearch(v);setNewsPage(0)}} searchVal={newsSearch} />
                        <div className="space-y-2">
                             {newsList.map(n=>(<div key={n.id} className="bg-white p-4 rounded-xl border flex justify-between items-center group hover:shadow-md transition"><span className="font-bold text-slate-700">{n.title}</span><div className="flex gap-2 opacity-0 group-hover:opacity-100"><button onClick={()=>{loadNewsForEdit(n); setEditorMode(true);}} className="text-xs font-bold text-blue-600">Edit</button><button onClick={()=>deleteItem('news',n.id,fetchNews)} className="text-xs font-bold text-red-600">Del</button></div></div>))}
                        </div>
                    </div>
                ) : (
                    <EditorLayout title="News Editor" onSave={handleNewsSubmit}>
                        <input className="text-4xl font-black w-full border-b pb-4 outline-none placeholder-slate-300" placeholder="Headline..." value={newsTitle} onChange={e=>setNewsTitle(e.target.value)} />
                        <CategoryManager label="Category" value={newsCategory} onChange={setNewsCategory} context="news" />
                        <div className="border rounded-xl overflow-hidden"><SunEditor key={editingNewsId||'nn'} setContents={newsContent} onChange={setNewsContent} setOptions={editorOptions}/></div>
                        <SeoInputSection title={commonSeoTitle} setTitle={setCommonSeoTitle} tags={commonTags} setTags={setCommonTags} desc={commonSeoDesc} setDesc={setCommonSeoDesc} />
                    </EditorLayout>
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