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

type ModalState = { isOpen: boolean; type: 'success' | 'confirm' | 'error'; message: string; onConfirm?: () => void; };

// --- 1. EXTERNAL COMPONENTS ---

const SeoInputSection = memo(({ title, setTitle, tags, setTags, desc, setDesc, markDirty }: any) => (
  <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm mt-6">
      <div className="flex items-center justify-between"><h4 className="text-xs font-extrabold text-slate-500 uppercase flex items-center gap-2"><span>🔍</span> SEO Settings</h4></div>
      <div className="space-y-4">
          <div><label className="text-xs font-bold text-slate-600 block mb-1.5">Meta Title</label><input className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" value={title} onChange={e=>{setTitle(e.target.value); markDirty();}} /></div>
          <div><label className="text-xs font-bold text-slate-600 block mb-1.5">Tags</label><input className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" value={tags} onChange={e=>{setTags(e.target.value); markDirty();}} placeholder="comma, separated" /></div>
          <div><label className="text-xs font-bold text-slate-600 block mb-1.5">Description</label><textarea className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none" value={desc} onChange={e=>{setDesc(e.target.value); markDirty();}} /></div>
      </div>
  </div>
));
SeoInputSection.displayName = "SeoInputSection";

const UniversalFilterBar = memo(({ 
    segments, groups, subjects, 
    selSeg, setSelSeg, 
    selGrp, setSelGrp, 
    selSub, setSelSub,
    onFetchGroups, onFetchSubjects,
    dateFilter, setDateFilter,
    typeFilter, setTypeFilter,
    showHierarchy = true,
    showType = false,
    typeOptions = []
}: any) => (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filter Content</h3>
            <div className="flex flex-wrap gap-2">
                <select className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-3 py-2 text-slate-700 outline-none" value={dateFilter} onChange={e=>setDateFilter(e.target.value)}>
                    <option value="all">📅 Any Time</option>
                    <option value="this_month">This Month</option>
                    <option value="last_6_months">Last 6 Months</option>
                    <option value="this_year">This Year</option>
                </select>
                {showType && (
                    <select className="bg-blue-50 border border-blue-100 text-xs font-bold rounded-lg px-3 py-2 text-blue-700 outline-none" value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
                        <option value="all">All Types</option>
                        {typeOptions.map((opt: any) => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
                    </select>
                )}
            </div>
        </div>
        {showHierarchy && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Segment</label><select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm font-bold outline-none" value={selSeg} onChange={e=>{setSelSeg(e.target.value); onFetchGroups(e.target.value);}}><option value="">All Segments</option>{segments.map((s:any)=><option key={s.id} value={s.id}>{s.title}</option>)}</select></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Group</label><select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm font-bold outline-none" value={selGrp} onChange={e=>{setSelGrp(e.target.value); onFetchSubjects(e.target.value);}} disabled={!selSeg}><option value="">All Groups</option>{groups.map((g:any)=><option key={g.id} value={g.id}>{g.title}</option>)}</select></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Subject</label><select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm font-bold outline-none" value={selSub} onChange={e=>setSelSub(e.target.value)} disabled={!selGrp}><option value="">All Subjects</option>{subjects.map((s:any)=><option key={s.id} value={s.id}>{s.title}</option>)}</select></div>
            </div>
        )}
    </div>
));
UniversalFilterBar.displayName = "UniversalFilterBar";

const ImageInput = memo(({ label, method, setMethod, file, setFile, link, setLink, markDirty, optional = false }: any) => (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center"><h4 className="text-xs font-bold uppercase text-slate-400">{label} {optional && <span className="text-slate-300">(Optional)</span>}</h4><div className="flex bg-slate-100 rounded-lg p-0.5"><button onClick={()=>{setMethod('upload'); markDirty();}} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${method==='upload'?'bg-white shadow text-black':'text-slate-400'}`}>Upload</button><button onClick={()=>{setMethod('link'); markDirty();}} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${method==='link'?'bg-white shadow text-black':'text-slate-400'}`}>Link</button></div></div>
        {method === 'upload' ? (<div className="border-2 border-dashed p-6 rounded-lg text-center relative hover:bg-slate-50 transition cursor-pointer"><input type="file" accept="image/*" onChange={e=>{setFile(e.target.files?.[0]||null); markDirty();}} className="absolute inset-0 opacity-0 cursor-pointer"/><span className="text-2xl block mb-2">📸</span><p className="text-xs font-bold text-slate-400">{file ? file.name : "Click to Upload"}</p></div>) : (<input className="w-full border p-2.5 rounded-lg text-xs font-medium" placeholder="https://..." value={link} onChange={e=>{setLink(e.target.value); markDirty();}} />)}
    </div>
));
ImageInput.displayName = "ImageInput";

const CategoryManager = memo(({ label, value, onChange, context, categories, openModal, markDirty }: any) => {
    const filtered = categories.filter((c:any) => c.type === context || c.type === 'general' || !c.type);
    return (
        <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600 block uppercase">{label}</label><div className="flex gap-2"><select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm outline-none cursor-pointer hover:border-slate-300 transition-colors" value={value} onChange={e=>{onChange(e.target.value); markDirty();}}><option value="">Select Category</option>{filtered.map((c:any) => <option key={c.id} value={c.name}>{c.name}</option>)}</select><button onClick={() => openModal(context)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 rounded-lg text-lg">⚙️</button></div></div>
    );
});
CategoryManager.displayName = "CategoryManager";

const SortableHeader = ({ label, sortKey, currentSort, setSort }: any) => (
    <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition select-none group" onClick={() => setSort({ key: sortKey, direction: currentSort.key === sortKey && currentSort.direction === 'asc' ? 'desc' : 'asc' })}>
        <div className="flex items-center gap-1">{label}<span className={`text-[10px] text-slate-400 flex flex-col leading-[6px] ${currentSort.key === sortKey ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}><span className={currentSort.key===sortKey && currentSort.direction==='asc' ? 'text-blue-600' : ''}>▲</span><span className={currentSort.key===sortKey && currentSort.direction==='desc' ? 'text-blue-600' : ''}>▼</span></span></div>
    </th>
);

const MemoizedSunEditor = memo(({ content, onChange }: { content: string, onChange: (c: string) => void }) => {
    return <SunEditor setContents={content} onChange={onChange} setOptions={editorOptions} />;
});
MemoizedSunEditor.displayName = "MemoizedSunEditor";

// --- MAIN PAGE ---

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("materials"); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editorMode, setEditorMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false); 
  const editorRef = useRef<any>(null);
  
  // --- UNIFIED STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  
  // Filters
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all"); 
  const [updateTypeFilter, setUpdateTypeFilter] = useState("all"); // ADDED THIS STATE
  const [catFilter, setCatFilter] = useState("all"); 
  
  // Hierarchy Selection
  const [selectedSegment, setSelectedSegment] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Data Arrays
  const [dataList, setDataList] = useState<any[]>([]); 
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Modal
  const [modal, setModal] = useState<ModalState>({ isOpen: false, type: 'success', message: '' });
  const [isManageCatsOpen, setIsManageCatsOpen] = useState(false);
  const [activeCatContext, setActiveCatContext] = useState("news");
  const [catModalSegment, setCatModalSegment] = useState("");
  const [catModalGroup, setCatModalGroup] = useState("");
  const [catModalSubject, setCatModalSubject] = useState("");
  const [catModalGroupsList, setCatModalGroupsList] = useState<any[]>([]);
  const [catModalSubjectsList, setCatModalSubjectsList] = useState<any[]>([]);

  // --- FORM INPUTS ---
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Content Inputs
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); 
  const [extraContent, setExtraContent] = useState(""); 
  const [link, setLink] = useState("");
  const [type, setType] = useState("pdf"); 
  const [category, setCategory] = useState("");
  
  // Media
  const [imageMethod, setImageMethod] = useState<'upload' | 'link'>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageLink, setImageLink] = useState("");
  const [file, setFile] = useState<File | null>(null); 

  // Extra Fields
  const [author, setAuthor] = useState("");
  const [instructor, setInstructor] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [duration, setDuration] = useState("");
  
  // SEO
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [tags, setTags] = useState("");

  // --- HELPER FUNCTIONS ---
  const markDirty = () => setIsDirty(true);
  const showSuccess = (msg: string) => setModal({ isOpen: true, type: 'success', message: msg });
  const showError = (msg: string) => setModal({ isOpen: true, type: 'error', message: msg });
  const confirmAction = (msg: string, action: () => void) => setModal({ isOpen: true, type: 'confirm', message: msg, onConfirm: action });
  const closeModal = () => setModal({ ...modal, isOpen: false });

  const resetForms = () => {
      setEditingId(null); setTitle(""); setContent(""); setExtraContent(""); setLink(""); setType("pdf"); setCategory("");
      setImageMethod('upload'); setImageFile(null); setImageLink(""); setFile(null);
      setAuthor(""); setInstructor(""); setPrice(""); setDiscountPrice(""); setDuration("");
      setSeoTitle(""); setSeoDesc(""); setTags("");
      setIsDirty(false);
  };

  const getHierarchyLabel = (item: any) => {
      const seg = segments.find((s:any) => s.id === item.segment_id)?.title;
      const grp = groups.find((g:any) => g.id === item.group_id)?.title;
      const sub = subjects.find((s:any) => s.id === item.subject_id)?.title;
      if (sub) return `${seg || ''} > ${grp || ''} > ${sub}`;
      if (grp) return `${seg || ''} > ${grp}`;
      if (seg) return seg || "Global";
      return "Global";
  };

  // --- API FETCHERS ---
  const fetchDropdowns = useCallback(async () => {
      const { data: s } = await supabase.from("segments").select("*").order('id'); setSegments(s || []);
      const { data: c } = await supabase.from("categories").select("*").order('name'); setCategories(c || []);
  }, []);

  const fetchGroups = async (segId: string) => { const { data } = await supabase.from("groups").select("*").eq("segment_id", segId).order('id'); setGroups(data || []); };
  const fetchSubjects = async (grpId: string) => { const { data } = await supabase.from("subjects").select("*").eq("group_id", grpId).order('id'); setSubjects(data || []); };
  const fetchModalGroups = async (segId: string) => { const { data } = await supabase.from("groups").select("*").eq("segment_id", segId).order('id'); setCatModalGroupsList(data || []); };
  const fetchModalSubjects = async (grpId: string) => { const { data } = await supabase.from("subjects").select("*").eq("group_id", grpId).order('id'); setCatModalSubjectsList(data || []); };

  const fetchContent = useCallback(async () => {
      if (editorMode || isLoading) return;
      
      let tableName = "";
      if (activeTab === 'materials') tableName = "resources";
      else if (activeTab === 'news') tableName = "news";
      else if (activeTab === 'ebooks') tableName = "ebooks";
      else if (activeTab === 'courses') tableName = "courses";
      else if (activeTab === 'updates') tableName = "segment_updates";

      let query = supabase.from(tableName).select("*", { count: 'exact' });

      // 1. Hierarchy Filters (Materials, Updates, Courses)
      if (['materials', 'updates', 'courses'].includes(activeTab)) {
          if (selectedSubject) query = query.eq("subject_id", selectedSubject);
          else if (selectedGroup) query = query.eq("group_id", selectedGroup);
          else if (selectedSegment) query = query.eq("segment_id", selectedSegment);
      }

      // 2. Type/Category Filters
      if (activeTab === 'materials' && typeFilter !== 'all') query = query.eq("type", typeFilter);
      if (activeTab === 'updates' && updateTypeFilter !== 'all') query = query.eq("type", updateTypeFilter);
      if ((activeTab === 'ebooks' || activeTab === 'news') && catFilter !== 'all') query = query.eq("category", catFilter);

      // 3. Search
      if (searchTerm) query = query.ilike("title", `%${searchTerm}%`);

      // 4. Date Filter
      if (dateFilter !== 'all') {
          const now = new Date();
          let startDate;
          if(dateFilter === 'this_month') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          else if(dateFilter === 'last_6_months') startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          else if(dateFilter === 'this_year') startDate = new Date(now.getFullYear(), 0, 1);
          if(startDate) query = query.gte('created_at', startDate.toISOString());
      }

      // 5. Pagination & Sort
      const from = currentPage * itemsPerPage;
      const to = from + itemsPerPage - 1;
      const { data, count, error } = await query.range(from, to).order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });

      if (!error && data) {
          setDataList(data);
          if (count !== null) setTotalCount(count);
      }
  }, [activeTab, selectedSegment, selectedGroup, selectedSubject, searchTerm, typeFilter, updateTypeFilter, catFilter, dateFilter, sortConfig, currentPage, itemsPerPage, editorMode, isLoading]);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { setIsAuthenticated(true); fetchDropdowns(); } 
      else { router.push("/login"); }
      setIsLoading(false);
    };
    init();
  }, [router, fetchDropdowns]);

  // --- HANDLERS ---
  const handleSegmentClick = (id: string) => { setSelectedSegment(id); setSelectedGroup(""); setSelectedSubject(""); setGroups([]); setSubjects([]); fetchGroups(id); };
  const handleGroupClick = (id: string) => { setSelectedGroup(id); setSelectedSubject(""); setSubjects([]); fetchSubjects(id); };
  const handleSubjectClick = (id: string) => { setSelectedSubject(id); };

  const handleTabSwitch = (newTab: string) => {
      if (isDirty) confirmAction("Unsaved changes! Discard?", () => { setIsDirty(false); setEditorMode(false); resetForms(); setActiveTab(newTab); setCurrentPage(0); });
      else { setEditorMode(false); resetForms(); setActiveTab(newTab); setCurrentPage(0); }
  };

  const handleAddNew = () => {
      resetForms();
      if (activeTab === 'materials') setType('pdf');
      else if (activeTab === 'updates') setType('routine');
      setEditorMode(true);
      setTimeout(() => setIsDirty(false), 100);
  };

  const handleEdit = (item: any) => {
      resetForms();
      setEditingId(item.id); setTitle(item.title);
      setSeoTitle(item.seo_title || ""); setSeoDesc(item.seo_description || ""); setTags(item.tags?.join(", ") || "");
      
      if (activeTab === 'materials') {
          setType(item.type); setLink(item.content_url || "");
          if(item.type === 'blog' || item.type === 'question') setContent(item.content_body || "");
          if(item.category) setCategory(item.category);
          if(item.content_url && item.type === 'blog') { setImageLink(item.content_url); setImageMethod('link'); }
      } else if (activeTab === 'news') {
          setContent(item.content || ""); setCategory(item.category);
          if(item.image_url) { setImageLink(item.image_url); setImageMethod('link'); }
      } else if (activeTab === 'ebooks') {
          setAuthor(item.author); setCategory(item.category); setContent(item.description || ""); setLink(item.pdf_url || "");
          if(item.cover_url) { setImageLink(item.cover_url); setImageMethod('link'); }
      } else if (activeTab === 'courses') {
          setInstructor(item.instructor); setPrice(item.price); setDiscountPrice(item.discount_price); setDuration(item.duration); setLink(item.enrollment_link); setContent(item.description || ""); setCategory(item.category);
          if(item.thumbnail_url) { setImageLink(item.thumbnail_url); setImageMethod('link'); }
      } else if (activeTab === 'updates') {
          setType(item.type); setContent(item.content_body || "");
      }

      // Hierarchy
      if (item.segment_id) { setSelectedSegment(String(item.segment_id)); fetchGroups(String(item.segment_id)); }
      if (item.group_id) { setSelectedGroup(String(item.group_id)); fetchSubjects(String(item.group_id)); }
      if (item.subject_id) setSelectedSubject(String(item.subject_id));

      setEditorMode(true);
      setTimeout(() => setIsDirty(false), 100);
  };

  const handleDelete = (id: number) => {
      let table = activeTab === 'materials' ? 'resources' : activeTab === 'updates' ? 'segment_updates' : activeTab;
      confirmAction("Delete this item permanently?", async () => {
          await supabase.from(table).delete().eq("id", id);
          fetchContent();
          showSuccess("Deleted successfully");
      });
  };
  
  // Re-added deleteItem for Categories Modal usage
  const deleteItem = (table: string, id: number) => {
      confirmAction("Permanently delete?", async () => { 
          await supabase.from(table).delete().eq("id", id); 
          // If deleting category, refresh dropdowns
          if(table === 'categories') fetchDropdowns();
          showSuccess("Deleted!"); 
      }); 
  };

  const handleSave = async () => {
      if (!title) return showError("Title is required");
      setSubmitting(true);

      let url: string | null = link;
      // Handle Image/File Uploads
      if (imageMethod === 'upload' && imageFile) {
          const name = `img-${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
          const { data } = await supabase.storage.from('materials').upload(name, imageFile);
          if(data) url = supabase.storage.from('materials').getPublicUrl(name).data.publicUrl;
      }
      if (file) {
          const name = `file-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
          const { data } = await supabase.storage.from('materials').upload(name, file);
          if(data) url = supabase.storage.from('materials').getPublicUrl(name).data.publicUrl;
      }

      // Construct Payload
      const payload: any = {
          title, 
          seo_title: seoTitle || title, 
          seo_description: seoDesc, 
          tags: tags.split(',').map(t=>t.trim()).filter(Boolean)
      };

      if (activeTab === 'materials') {
          payload.type = type;
          payload.segment_id = selectedSegment ? Number(selectedSegment) : null;
          payload.group_id = selectedGroup ? Number(selectedGroup) : null;
          payload.subject_id = selectedSubject ? Number(selectedSubject) : null;
          if (type === 'blog') { payload.content_body = content; payload.content_url = url; payload.category = category; }
          else if (type === 'question') { payload.content_body = content; }
          else { payload.content_url = url; }
      } else if (activeTab === 'news') {
          payload.content = content; payload.category = category; payload.image_url = url;
      } else if (activeTab === 'ebooks') {
          payload.author = author; payload.category = category; payload.description = content; payload.pdf_url = link; payload.cover_url = url;
      } else if (activeTab === 'courses') {
          payload.instructor = instructor; payload.price = price; payload.discount_price = discountPrice; payload.duration = duration; payload.enrollment_link = link; payload.description = content; payload.category = category; payload.thumbnail_url = url;
      } else if (activeTab === 'updates') {
          payload.type = type; payload.content_body = content; payload.attachment_url = url;
          payload.segment_id = selectedSegment ? Number(selectedSegment) : null;
      }

      const table = activeTab === 'materials' ? 'resources' : activeTab === 'updates' ? 'segment_updates' : activeTab;
      let error;
      
      if (editingId) {
          const res = await supabase.from(table).update(payload).eq('id', editingId);
          error = res.error;
      } else {
          const res = await supabase.from(table).insert([payload]);
          error = res.error;
      }

      setSubmitting(false);
      if (error) showError(error.message);
      else {
          setIsDirty(false);
          setEditorMode(false);
          fetchContent();
          showSuccess("Saved Successfully!");
      }
  };

  const openCategoryModal = (context: string) => { setActiveCatContext(context); setIsManageCatsOpen(true); };

  // --- UI RENDER HELPERS ---
  const ListHeader = () => (
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 uppercase">{activeTab.replace('-', ' ')}</h2>
          <div className="flex gap-3 w-full md:w-auto">
              <input className="w-full md:w-64 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Search..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
              <button onClick={handleAddNew} className="bg-black hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg transition-all">+ Add New</button>
          </div>
      </div>
  );

  const Pagination = () => (
      <div className="flex justify-between items-center px-4 py-3 bg-white border-t border-slate-100">
          <div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-400">Rows:</span><select className="border rounded text-xs p-1" value={itemsPerPage} onChange={e=>{setItemsPerPage(Number(e.target.value)); setCurrentPage(0);}}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option></select></div>
          <div className="flex gap-2"><button onClick={()=>setCurrentPage(Math.max(0,currentPage-1))} disabled={currentPage===0} className="text-xs font-bold text-slate-500 disabled:opacity-30">← Prev</button><span className="text-xs font-bold text-slate-400">Page {currentPage+1}</span><button onClick={()=>setCurrentPage(currentPage+1)} disabled={(currentPage+1)*itemsPerPage >= totalCount} className="text-xs font-bold text-slate-500 disabled:opacity-30">Next →</button></div>
      </div>
  );

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-bold">Loading...</div>;
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pt-32">
        {/* Modals */}
        {isManageCatsOpen && (<div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm"><div className="bg-white rounded-2xl shadow-2xl w-[500px] max-h-[85vh] flex flex-col overflow-hidden animate-slide-up"><div className="p-5 border-b flex justify-between items-center bg-slate-50"><div><h3 className="font-bold text-lg text-slate-900">Manage Categories</h3><p className="text-xs text-slate-500 font-bold uppercase">Context: {activeCatContext}</p></div><button onClick={()=>setIsManageCatsOpen(false)} className="bg-white p-2 rounded-full shadow hover:bg-red-50 text-slate-400 hover:text-red-500">✕</button></div><div className="flex-1 overflow-y-auto p-5 custom-scrollbar"><div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 space-y-3"><input id="newCatInput" className="w-full bg-white border p-3 rounded-xl text-sm outline-none" placeholder="New Category Name..." /><button onClick={async ()=>{ const input = document.getElementById('newCatInput') as HTMLInputElement; if(input.value) { await supabase.from('categories').insert([{name:input.value, type: activeCatContext}]); input.value=""; fetchDropdowns(); } }} className="w-full bg-black text-white py-2 rounded-lg font-bold text-sm">+ Add</button></div><div className="space-y-2">{categories.filter(c => c.type === activeCatContext || c.type === 'general' || !c.type).map(c => (<div key={c.id} className="flex justify-between items-center p-3 bg-white border rounded-xl"><span className="text-sm font-bold">{c.name}</span><button onClick={()=>deleteItem('categories', c.id)} className="text-red-400 hover:text-red-600">🗑️</button></div>))}</div></div></div></div>)}
        {modal.isOpen && <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm"><div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-pop-in text-center"><h3 className="text-xl font-black mb-2 capitalize">{modal.type}!</h3><p className="text-slate-500 text-sm mb-6">{modal.message}</p><div className="flex gap-3 justify-center">{modal.type === 'confirm' ? <><button onClick={closeModal} className="px-5 py-2 border rounded-xl font-bold">Cancel</button><button onClick={()=>{modal.onConfirm?.();closeModal()}} className="px-5 py-2 bg-red-600 text-white rounded-xl font-bold">Confirm</button></> : <button onClick={closeModal} className="px-8 py-2 bg-black text-white rounded-xl font-bold">Okay</button>}</div></div></div>}

        <aside className="w-64 bg-white border-r border-slate-200 fixed top-0 bottom-0 z-20 hidden md:flex flex-col shadow-sm pt-28">
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {[{ id: 'materials', label: 'Study Materials', icon: '📚' }, { id: 'updates', label: 'Updates', icon: '📢' }, { id: 'ebooks', label: 'eBooks', icon: '📖' }, { id: 'courses', label: 'Courses', icon: '🎓' }, { id: 'news', label: 'Newsroom', icon: '📰' }].map((tab) => (
                    <button key={tab.id} onClick={() => handleTabSwitch(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}><span className="text-lg">{tab.icon}</span> {tab.label}</button>
                ))}
            </nav>
            <div className="p-4 border-t"><button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl">Sign Out</button></div>
        </aside>

        <main className="flex-1 md:ml-64 p-8 overflow-x-hidden min-h-screen">
            <div className="max-w-[1800px] mx-auto w-full">
                {!editorMode && <ListHeader />}

                {/* LIST VIEW */}
                {!editorMode && (
                    <div className="animate-fade-in space-y-6">
                        {/* Dynamic Filter Bar */}
                        {['materials', 'updates', 'courses'].includes(activeTab) ? (
                            <UniversalFilterBar segments={segments} groups={groups} subjects={subjects} selSeg={selectedSegment} setSelSeg={setSelectedSegment} selGrp={selectedGroup} setSelGrp={setSelectedGroup} selSub={selectedSubject} setSelSub={setSelectedSubject} onFetchGroups={fetchGroups} onFetchSubjects={fetchSubjects} dateFilter={dateFilter} setDateFilter={setDateFilter} showHierarchy={true} showType={activeTab!=='courses'} typeFilter={activeTab==='materials'?typeFilter:activeTab==='updates'?updateTypeFilter:'all'} setTypeFilter={activeTab==='materials'?setTypeFilter:setUpdateTypeFilter} typeOptions={activeTab==='materials'?[{val:'blog',label:'✍️ Blogs'},{val:'pdf',label:'📄 PDFs'},{val:'video',label:'🎬 Videos'},{val:'question',label:'❓ Questions'}]:[{val:'routine',label:'📅 Routine'},{val:'syllabus',label:'📝 Syllabus'},{val:'exam_result',label:'🏆 Result'}]} />
                        ) : (
                            <UniversalFilterBar dateFilter={dateFilter} setDateFilter={setDateFilter} showHierarchy={false} showType={activeTab==='ebooks'||activeTab==='news'} typeFilter={catFilter} setTypeFilter={setCatFilter} typeOptions={categories.filter((c:any)=>c.type===activeTab||!c.type).map((c:any)=>({val:c.name, label:c.name}))} />
                        )}

                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-xs uppercase font-extrabold text-slate-500 border-b tracking-wider">
                                    <tr>
                                        <SortableHeader label="TITLE" sortKey="title" currentSort={sortConfig} setSort={setSortConfig} />
                                        {['materials','updates','courses'].includes(activeTab) && <th className="px-6 py-4">Context</th>}
                                        {activeTab === 'materials' && <SortableHeader label="TYPE" sortKey="type" currentSort={sortConfig} setSort={setSortConfig} />}
                                        <SortableHeader label="DATE" sortKey="created_at" currentSort={sortConfig} setSort={setSortConfig} />
                                        <th className="px-6 py-4 text-right">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {dataList.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition group">
                                            <td className="px-6 py-4 font-bold text-slate-800">{item.title}</td>
                                            {['materials','updates','courses'].includes(activeTab) && <td className="px-6 py-4 text-xs text-slate-500 font-mono">{getHierarchyLabel(item)}</td>}
                                            {activeTab === 'materials' && <td className="px-6 py-4"><span className={`text-[10px] font-bold px-2 py-1 rounded uppercase bg-slate-100`}>{item.type}</span></td>}
                                            <td className="px-6 py-4 text-xs font-mono text-slate-500">{new Date(item.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <button onClick={()=>handleEdit(item)} className="text-blue-600 font-bold text-xs opacity-0 group-hover:opacity-100 transition">Edit</button>
                                                <button onClick={()=>handleDelete(item.id)} className="text-red-600 font-bold text-xs opacity-0 group-hover:opacity-100 transition">Del</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Pagination />
                        </div>
                    </div>
                )}

                {/* EDITOR VIEW */}
                {editorMode && (
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-slide-up">
                        <div className="bg-slate-50 p-4 border-b flex justify-between items-center sticky top-0 z-10">
                            <button onClick={()=>isDirty?confirmAction("Discard changes?", ()=>setEditorMode(false)):setEditorMode(false)} className="text-slate-500 hover:text-black font-bold text-sm">← Back</button>
                            <div className="flex gap-2 items-center">
                                {isDirty && <span className="text-xs font-bold text-red-500 uppercase animate-pulse hidden md:block">Unsaved Changes</span>}
                                <button onClick={handleSave} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md transition-all">{submitting ? "Saving..." : "Save Content"}</button>
                            </div>
                        </div>
                        <div className="p-8 max-w-[1800px] mx-auto w-full">
                            <div className="flex flex-col lg:flex-row gap-8 w-full">
                                {/* LEFT: MAIN CONTENT */}
                                <div className="w-full lg:w-[75%] space-y-6">
                                    <input className="text-4xl font-black w-full bg-transparent border-b pb-4 outline-none placeholder-slate-300" placeholder="Title..." value={title} onChange={e=>{setTitle(e.target.value); markDirty();}} />
                                    
                                    {/* Conditional Editors */}
                                    {['blog', 'question', 'ebook', 'course', 'update', 'news'].includes(activeTab === 'materials' ? type : (activeTab === 'updates' ? 'update' : (activeTab === 'courses' ? 'course' : (activeTab === 'ebooks' ? 'ebook' : (activeTab === 'news' ? 'news' : ''))))) && (
                                        <MemoizedSunEditor content={content} onChange={(c:string)=>{setContent(c); markDirty();}} />
                                    )}

                                    {/* File Inputs for PDF/Video */}
                                    {activeTab === 'materials' && (type === 'pdf' || type === 'video') && (
                                        <div className="bg-white p-6 rounded-xl border border-slate-200">
                                            <h4 className="text-sm font-bold mb-4">Content Source</h4>
                                            {type === 'pdf' && <div className="border-2 border-dashed p-8 text-center rounded-xl relative hover:bg-slate-50"><input type="file" onChange={e=>{setFile(e.target.files?.[0]||null); markDirty();}} className="absolute inset-0 opacity-0 cursor-pointer"/><span className="text-2xl">📂</span><p className="text-sm font-bold text-slate-500 mt-2">{file ? file.name : "Upload PDF File"}</p></div>}
                                            {type === 'video' && <input className="w-full border p-3 rounded-xl text-sm" value={link} onChange={e=>{setLink(e.target.value); markDirty();}} placeholder="YouTube Embed Link..." />}
                                        </div>
                                    )}
                                </div>

                                {/* RIGHT: SIDEBAR SETTINGS */}
                                <div className="w-full lg:w-[25%] space-y-6">
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                        <h4 className="text-xs font-bold uppercase text-slate-400">Configuration</h4>
                                        
                                        {/* Type Selector (Materials & Updates) */}
                                        {activeTab === 'materials' && <div><label className="text-xs font-bold block mb-1">Type</label><select className="w-full border p-2 rounded-lg text-xs font-bold" value={type} onChange={e=>{setType(e.target.value); markDirty();}}><option value="pdf">📄 PDF</option><option value="video">🎬 Video</option><option value="question">❓ Question</option><option value="blog">✍️ Blog</option></select></div>}
                                        {activeTab === 'updates' && <div><label className="text-xs font-bold block mb-1">Type</label><select className="w-full border p-2 rounded-lg text-xs font-bold" value={type} onChange={e=>{setType(e.target.value); markDirty();}}><option value="routine">📅 Routine</option><option value="syllabus">📝 Syllabus</option><option value="exam_result">🏆 Result</option></select></div>}

                                        {/* Hierarchy Selectors */}
                                        {['materials', 'updates', 'courses'].includes(activeTab) && (
                                            <div><label className="text-xs font-bold block mb-1">Hierarchy</label><div className="space-y-2"><select className="w-full border p-2 rounded text-xs" value={selectedSegment} onChange={e=>{handleSegmentClick(e.target.value); markDirty();}}><option value="">Segment</option>{segments.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select><select className="w-full border p-2 rounded text-xs" value={selectedGroup} onChange={e=>{handleGroupClick(e.target.value); markDirty();}} disabled={!selectedSegment}><option value="">Group</option>{groups.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select><select className="w-full border p-2 rounded text-xs" value={selectedSubject} onChange={e=>{handleSubjectClick(e.target.value); markDirty();}} disabled={!selectedGroup}><option value="">Subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></div></div>
                                        )}

                                        {/* Category Selectors */}
                                        {(activeTab === 'news' || activeTab === 'ebooks' || (activeTab === 'materials' && type === 'blog') || activeTab === 'courses') && (
                                            <CategoryManager label="Category" value={category} onChange={setCategory} context={activeTab === 'materials' ? 'blog' : activeTab === 'courses' ? 'course' : activeTab === 'ebooks' ? 'ebook' : 'news'} categories={categories} openModal={openCategoryModal} markDirty={markDirty} />
                                        )}

                                        {/* Extra Fields based on Tab */}
                                        {activeTab === 'ebooks' && (<div><label className="text-xs font-bold block mb-1">Author</label><input className="w-full border p-2 rounded-lg" value={author} onChange={e=>{setAuthor(e.target.value); markDirty();}} /></div>)}
                                        {activeTab === 'ebooks' && (<div><label className="text-xs font-bold block mb-1">PDF Link</label><input className="w-full border p-2 rounded-lg" value={link} onChange={e=>{setLink(e.target.value); markDirty();}} /></div>)}
                                        
                                        {activeTab === 'courses' && (
                                            <div className="space-y-2">
                                                <div><label className="text-xs font-bold block">Instructor</label><input className="w-full border p-2 rounded-lg" value={instructor} onChange={e=>{setInstructor(e.target.value); markDirty();}} /></div>
                                                <div className="grid grid-cols-2 gap-2"><div><label className="text-xs font-bold block">Price</label><input className="w-full border p-2 rounded-lg" value={price} onChange={e=>{setPrice(e.target.value); markDirty();}} /></div><div><label className="text-xs font-bold block">Discount</label><input className="w-full border p-2 rounded-lg" value={discountPrice} onChange={e=>{setDiscountPrice(e.target.value); markDirty();}} /></div></div>
                                                <div><label className="text-xs font-bold block">Enroll Link</label><input className="w-full border p-2 rounded-lg" value={link} onChange={e=>{setLink(e.target.value); markDirty();}} /></div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Cover Image */}
                                    {(activeTab === 'news' || activeTab === 'ebooks' || activeTab === 'courses' || (activeTab === 'materials' && type === 'blog')) && (
                                        <ImageInput label={activeTab==='courses'?"Thumbnail":"Cover Image"} method={imageMethod} setMethod={setImageMethod} file={imageFile} setFile={setImageFile} link={imageLink} setLink={setImageLink} markDirty={markDirty} optional={activeTab==='courses'} />
                                    )}

                                    <SeoInputSection title={seoTitle} setTitle={setSeoTitle} tags={tags} setTags={setTags} desc={seoDesc} setDesc={setSeoDesc} markDirty={markDirty} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    </div>
  );
}