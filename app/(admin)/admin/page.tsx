"use client";
import { useState, useEffect, useCallback, useRef, memo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import 'suneditor/dist/css/suneditor.min.css'; 
import katex from 'katex'; 
import 'katex/dist/katex.min.css'; 

// --- TYPES ---
type ModalState = { isOpen: boolean; type: 'success' | 'confirm' | 'error'; message: string; onConfirm?: () => void; };

// Load SunEditor dynamically
const SunEditor = dynamic(() => import("suneditor-react"), { ssr: false });

const editorOptions: any = {
    minHeight: "600px", height: "auto", placeholder: "Start content creation...",
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

// --- MEMOIZED UI COMPONENTS ---

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

const FilterBar = memo(({ 
    segments, groups, subjects, 
    selSeg, setSelSeg, 
    selGrp, setSelGrp, 
    selSub, setSelSub,
    onFetchGroups, onFetchSubjects,
    dateFilter, setDateFilter,
    startDate, setStartDate, endDate, setEndDate,
    typeFilter, setTypeFilter, 
    updateTypeFilter, setUpdateTypeFilter,
    catFilter, setCatFilter, categories,
    showHierarchy = false, showSegmentOnly = false, showType = false, showUpdateType = false, showCategory = false,
    typeOptions = []
}: any) => (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filter Content</h3>
            <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <input type="date" className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700" value={startDate} onChange={e=>setStartDate(e.target.value)} />
                    <span className="text-xs text-slate-400">to</span>
                    <input type="date" className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700" value={endDate} onChange={e=>setEndDate(e.target.value)} />
                </div>
                <select className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-3 py-2 text-slate-700 outline-none" value={dateFilter} onChange={e=>setDateFilter(e.target.value)}>
                    <option value="all">📅 Any Time</option>
                    <option value="this_month">This Month</option>
                    <option value="last_6_months">Last 6 Months</option>
                    <option value="this_year">This Year</option>
                </select>
                {showType && (
                    <select className="bg-blue-50 border border-blue-100 text-xs font-bold rounded-lg px-3 py-2 text-blue-700 outline-none" value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
                        <option value="all">All Content Types</option>
                        {typeOptions.map((opt: any) => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
                    </select>
                )}
                {showUpdateType && (
                    <select className="bg-red-50 border border-red-100 text-xs font-bold rounded-lg px-3 py-2 text-red-700 outline-none" value={updateTypeFilter} onChange={e=>setUpdateTypeFilter(e.target.value)}>
                        <option value="all">All Updates</option>
                        {typeOptions.map((opt: any) => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
                    </select>
                )}
                 {showCategory && (
                    <select className="bg-purple-50 border border-purple-100 text-xs font-bold rounded-lg px-3 py-2 text-purple-700 outline-none" value={catFilter} onChange={e=>setCatFilter(e.target.value)}>
                        <option value="all">All Categories</option>
                        {categories.map((c:any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                )}
            </div>
        </div>
        {(showHierarchy || showSegmentOnly) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Segment</label><select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm font-bold outline-none" value={selSeg} onChange={e=>{setSelSeg(e.target.value); onFetchGroups(e.target.value);}}><option value="">All Segments</option>{segments.map((s:any)=><option key={s.id} value={s.id}>{s.title}</option>)}</select></div>
                {showHierarchy && (
                    <>
                        <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Group</label><select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm font-bold outline-none" value={selGrp} onChange={e=>{setSelGrp(e.target.value); onFetchSubjects(e.target.value);}} disabled={!selSeg}><option value="">All Groups</option>{groups.map((g:any)=><option key={g.id} value={g.id}>{g.title}</option>)}</select></div>
                        <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Subject</label><select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm font-bold outline-none" value={selSub} onChange={e=>setSelSub(e.target.value)} disabled={!selGrp}><option value="">All Subjects</option>{subjects.map((s:any)=><option key={s.id} value={s.id}>{s.title}</option>)}</select></div>
                    </>
                )}
            </div>
        )}
    </div>
));
FilterBar.displayName = "FilterBar";

const ImageInput = memo(({ label, method, setMethod, file, setFile, link, setLink, markDirty, optional = false }: any) => (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center"><h4 className="text-xs font-bold uppercase text-slate-400">{label} {optional && <span className="text-slate-300">(Optional)</span>}</h4><div className="flex bg-slate-100 rounded-lg p-0.5"><button onClick={()=>{setMethod('upload'); markDirty();}} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${method==='upload'?'bg-white shadow text-black':'text-slate-400'}`}>Upload</button><button onClick={()=>{setMethod('link'); markDirty();}} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${method==='link'?'bg-white shadow text-black':'text-slate-400'}`}>Link</button></div></div>
        {method === 'upload' ? (<div className="border-2 border-dashed p-6 rounded-lg text-center relative hover:bg-slate-50 transition cursor-pointer"><input type="file" accept="image/*" onChange={e=>{setFile(e.target.files?.[0]||null); markDirty();}} className="absolute inset-0 opacity-0 cursor-pointer"/><span className="text-2xl block mb-2">📸</span><p className="text-xs font-bold text-slate-400">{file ? file.name : "Click to Upload"}</p></div>) : (<input className="w-full border p-2.5 rounded-lg text-xs font-medium" placeholder="https://..." value={link} onChange={e=>{setLink(e.target.value); markDirty();}} />)}
    </div>
));
ImageInput.displayName = "ImageInput";

const CategoryManagerSelector = memo(({ label, value, onChange, context, categories, openModal, markDirty }: any) => {
    // Filter categories based on context (e.g. only show 'news' categories for News)
    const filtered = categories.filter((c:any) => c.type === context || c.type === 'general' || !c.type);
    return (
        <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600 block uppercase">{label}</label><div className="flex gap-2"><select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm outline-none cursor-pointer hover:border-slate-300 transition-colors" value={value} onChange={e=>{onChange(e.target.value); markDirty();}}><option value="">Select Category</option>{filtered.map((c:any) => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div></div>
    );
});
CategoryManagerSelector.displayName = "CategoryManagerSelector";

const SortableHeader = ({ label, sortKey, currentSort, setSort }: any) => (
    <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition select-none group" onClick={() => setSort({ key: sortKey, direction: currentSort.key === sortKey && currentSort.direction === 'asc' ? 'desc' : 'asc' })}>
        <div className="flex items-center gap-1">{label}<span className={`text-[10px] text-slate-400 flex flex-col leading-[6px] ${currentSort.key === sortKey ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}><span className={currentSort.key===sortKey && currentSort.direction==='asc' ? 'text-blue-600' : ''}>▲</span><span className={currentSort.key===sortKey && currentSort.direction==='desc' ? 'text-blue-600' : ''}>▼</span></span></div>
    </th>
);

const MemoizedSunEditor = memo(({ content, onChange }: { content: string, onChange: (c: string) => void }) => {
    return <SunEditor setContents={content} onChange={onChange} setOptions={editorOptions} />;
});
MemoizedSunEditor.displayName = "MemoizedSunEditor";

const ListHeader = memo(({ title, onAdd, onSearch, searchVal, showAdd = true }: any) => (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 uppercase">{title}</h2>
        <div className="flex gap-3 w-full md:w-auto">
            <input className="w-full md:w-64 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Search..." value={searchVal} onChange={e=>onSearch(e.target.value)} />
            {showAdd && <button onClick={onAdd} className="bg-black hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg transition-all">+ Add New</button>}
        </div>
    </div>
));
ListHeader.displayName = "ListHeader";


// --- MAIN PAGE ---

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("materials"); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editorMode, setEditorMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false); 
  
  // --- STATE ---
  const [resSearch, setResSearch] = useState("");
  const [newsSearch, setNewsSearch] = useState("");
  const [ebSearch, setEbSearch] = useState("");
  const [updateSearch, setUpdateSearch] = useState("");
  const [catSearch, setCatSearch] = useState(""); 

  const [resPage, setResPage] = useState(0);
  const [newsPage, setNewsPage] = useState(0);
  const [ebPage, setEbPage] = useState(0);
  const [updatePage, setUpdatePage] = useState(0);
  
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  
  // Filters
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); 
  const [updateTypeFilter, setUpdateTypeFilter] = useState("all"); 
  const [catFilter, setCatFilter] = useState("all");
  const [catManagerTypeFilter, setCatManagerTypeFilter] = useState("all");
  
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
  const [categoryCounts, setCategoryCounts] = useState<any>({}); 

  // Modal
  const [modal, setModal] = useState<ModalState>({ isOpen: false, type: 'success', message: '' });
  const [isAddCatOpen, setIsAddCatOpen] = useState(false); 
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState("news");

  // HIERARCHY MANAGER STATE
  const [newHierarchyName, setNewHierarchyName] = useState("");
  const [activeHierarchyLevel, setActiveHierarchyLevel] = useState<'segment'|'group'|'subject'>('segment');

  // --- FORM INPUTS ---
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Content Inputs
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); 
  const [link, setLink] = useState(""); // Content URL (PDF, Video Link)
  const [type, setType] = useState("pdf"); 
  const [category, setCategory] = useState("");
  
  // Media Inputs
  const [imageMethod, setImageMethod] = useState<'upload' | 'link'>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageLink, setImageLink] = useState("");
  const [file, setFile] = useState<File | null>(null); // Actual PDF File

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

  // --- HELPERS ---
  const markDirty = () => setIsDirty(true);
  const showSuccess = (msg: string) => setModal({ isOpen: true, type: 'success', message: msg });
  const showError = (msg: string) => setModal({ isOpen: true, type: 'error', message: msg });
  const confirmAction = (msg: string, action: () => void) => setModal({ isOpen: true, type: 'confirm', message: msg, onConfirm: action });
  const closeModal = () => setModal({ ...modal, isOpen: false });

  const resetForms = () => {
      setEditingId(null); setTitle(""); setContent(""); setLink(""); setType("pdf"); setCategory("");
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

  const fetchContent = useCallback(async () => {
      if (editorMode || isLoading) return;
      
      // HIERARCHY MANAGER DOES NOT USE THIS FETCH
      if (activeTab === 'hierarchy') return;

      if (activeTab === 'categories') {
          // Special Fetch for Categories Manager
          let query = supabase.from("categories").select("*", { count: 'exact' });
          if (catManagerTypeFilter !== 'all') query = query.eq("type", catManagerTypeFilter);
          if (catSearch) query = query.ilike("name", `%${catSearch}%`);
          
          const { data, count } = await query.order('name', { ascending: true });
          
          if (data) {
              const counts: any = {};
              for (const cat of data) {
                  let table = cat.type === 'ebook' ? 'ebooks' : cat.type === 'news' ? 'news' : cat.type === 'course' ? 'courses' : 'resources';
                  const { count } = await supabase.from(table).select('*', { count: 'exact', head: true }).eq('category', cat.name);
                  counts[cat.id] = count || 0;
              }
              setCategoryCounts(counts);
              setDataList(data);
              if (count !== null) setTotalCount(count);
          }
          return;
      }

      let tableName = "";
      let currentPage = 0;
      let searchTerm = "";

      if (activeTab === 'materials') { tableName = "resources"; currentPage = resPage; searchTerm = resSearch; }
      else if (activeTab === 'news') { tableName = "news"; currentPage = newsPage; searchTerm = newsSearch; }
      else if (activeTab === 'ebooks') { tableName = "ebooks"; currentPage = ebPage; searchTerm = ebSearch; }
      else if (activeTab === 'courses') { tableName = "courses"; currentPage = 0; }
      else if (activeTab === 'updates') { tableName = "segment_updates"; currentPage = updatePage; searchTerm = updateSearch; }

      let query = supabase.from(tableName).select("*", { count: 'exact' });

      // Filters
      if (['materials', 'updates', 'courses'].includes(activeTab)) {
          if (selectedSubject) query = query.eq("subject_id", selectedSubject);
          else if (selectedGroup) query = query.eq("group_id", selectedGroup);
          else if (selectedSegment) query = query.eq("segment_id", selectedSegment);
      }
      
      if (activeTab === 'updates' && selectedSegment) { query = query.eq("segment_id", selectedSegment); }

      if (activeTab === 'materials' && typeFilter !== 'all') query = query.eq("type", typeFilter);
      if (activeTab === 'updates' && updateTypeFilter !== 'all') query = query.eq("type", updateTypeFilter);
      if ((activeTab === 'ebooks' || activeTab === 'news') && catFilter !== 'all') query = query.eq("category", catFilter);

      if (searchTerm) query = query.ilike("title", `%${searchTerm}%`);

      if (startDate && endDate) {
         query = query.gte('created_at', new Date(startDate).toISOString());
         query = query.lte('created_at', new Date(endDate).toISOString());
      } else if (dateFilter !== 'all') {
          const now = new Date();
          let d;
          if(dateFilter === 'this_month') d = new Date(now.getFullYear(), now.getMonth(), 1);
          else if(dateFilter === 'last_6_months') d = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          else if(dateFilter === 'this_year') d = new Date(now.getFullYear(), 0, 1);
          if(d) query = query.gte('created_at', d.toISOString());
      }

      const from = currentPage * itemsPerPage;
      const to = from + itemsPerPage - 1;
      const { data, count, error } = await query.range(from, to).order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });

      if (!error && data) {
          setDataList(data);
          if (count !== null) setTotalCount(count);
      }
  }, [activeTab, selectedSegment, selectedGroup, selectedSubject, resSearch, newsSearch, ebSearch, updateSearch, catSearch, typeFilter, updateTypeFilter, catFilter, catManagerTypeFilter, dateFilter, startDate, endDate, sortConfig, resPage, newsPage, ebPage, updatePage, itemsPerPage, editorMode, isLoading]);

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
      const clearSearch = () => { setResSearch(""); setNewsSearch(""); setEbSearch(""); setUpdateSearch(""); setCatSearch(""); };
      if (isDirty) confirmAction("Unsaved changes! Discard?", () => { setIsDirty(false); setEditorMode(false); resetForms(); setActiveTab(newTab); setResPage(0); setNewsPage(0); setEbPage(0); setUpdatePage(0); clearSearch(); });
      else { setEditorMode(false); resetForms(); setActiveTab(newTab); setResPage(0); setNewsPage(0); setEbPage(0); setUpdatePage(0); clearSearch(); }
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

      if (item.segment_id) { setSelectedSegment(String(item.segment_id)); fetchGroups(String(item.segment_id)); }
      if (item.group_id) { setSelectedGroup(String(item.group_id)); fetchSubjects(String(item.group_id)); }
      if (item.subject_id) setSelectedSubject(String(item.subject_id));

      setEditorMode(true);
      setTimeout(() => setIsDirty(false), 100);
  };

  const deleteItem = (table: string, id: number) => { 
      confirmAction("Permanently delete?", async () => { 
          await supabase.from(table).delete().eq("id", id); 
          if(table === 'categories') fetchDropdowns();
          if(table === 'segments' || table === 'groups' || table === 'subjects') { 
              // Refresh hierarchy
              fetchDropdowns(); 
              if(selectedSegment) fetchGroups(selectedSegment);
              if(selectedGroup) fetchSubjects(selectedGroup);
          }
          fetchContent();
          showSuccess("Deleted!"); 
      }); 
  };
  
  const handleDelete = (id: number) => {
      let table = activeTab === 'materials' ? 'resources' : activeTab === 'updates' ? 'segment_updates' : activeTab === 'categories' ? 'categories' : activeTab;
      deleteItem(table, id);
  };

  const handleSave = async () => {
      if (!title) return showError("Title is required");
      setSubmitting(true);

      // DEFINE PAYLOAD FIRST
      let payload: any = {
          title, 
          seo_title: seoTitle || title, 
          seo_description: seoDesc, 
          tags: tags.split(',').map(t=>t.trim()).filter(Boolean)
      };

      let contentUrl: string | null = link; // Default for PDF/Video/Link
      let coverUrl: string | null = null; // Default for Covers

      // 1. Upload Cover Image (if exists)
      if (imageMethod === 'upload' && imageFile) {
          const name = `img-${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
          const { data } = await supabase.storage.from('materials').upload(name, imageFile);
          if(data) {
              const publicUrl = supabase.storage.from('materials').getPublicUrl(name).data.publicUrl;
              coverUrl = publicUrl; 
              // If type is BLOG, the cover is the content_url usually (or separate field)
              if (activeTab === 'materials' && type === 'blog') contentUrl = publicUrl; 
              if (activeTab === 'news') payload.image_url = publicUrl;
          }
      } else if (imageMethod === 'link' && imageLink) {
          coverUrl = imageLink;
          if (activeTab === 'materials' && type === 'blog') contentUrl = imageLink;
      }

      // 2. Upload Content File (PDF)
      if (file) {
          const name = `file-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
          const { data } = await supabase.storage.from('materials').upload(name, file);
          if(data) contentUrl = supabase.storage.from('materials').getPublicUrl(name).data.publicUrl;
      }

      if (activeTab === 'materials') {
          payload.type = type;
          payload.segment_id = selectedSegment ? Number(selectedSegment) : null;
          payload.group_id = selectedGroup ? Number(selectedGroup) : null;
          payload.subject_id = selectedSubject ? Number(selectedSubject) : null;
          if (type === 'blog') { payload.content_body = content; payload.content_url = contentUrl; payload.category = category; }
          else if (type === 'question') { payload.content_body = content; }
          else { payload.content_url = contentUrl; }
      } else if (activeTab === 'news') {
          payload.content = content; payload.category = category; 
          if(coverUrl) payload.image_url = coverUrl; // News uses image_url
      } else if (activeTab === 'ebooks') {
          payload.author = author; payload.category = category; payload.description = content; 
          payload.pdf_url = contentUrl; // Ebook PDF
          if(coverUrl) payload.cover_url = coverUrl; // Ebook Cover
      } else if (activeTab === 'courses') {
          payload.instructor = instructor; payload.price = price; payload.discount_price = discountPrice; payload.duration = duration; payload.enrollment_link = link; payload.description = content; payload.category = category; 
          if(coverUrl) payload.thumbnail_url = coverUrl;
      } else if (activeTab === 'updates') {
          payload.type = type; payload.content_body = content; 
          if(contentUrl) payload.attachment_url = contentUrl;
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

  const openCategoryModal = (context: string) => { setIsAddCatOpen(true); setNewCatType(context); };

  const handleAddCategory = async () => {
      if(!newCatName) return showError("Category name required");
      // Force context if selected
      const typeToSave = newCatType || 'general';
      await supabase.from('categories').insert([{ name: newCatName, type: typeToSave }]);
      setNewCatName("");
      setIsAddCatOpen(false);
      fetchDropdowns();
      if(activeTab === 'categories') fetchContent();
      showSuccess("Category Added");
  };

  // --- HIERARCHY MANAGEMENT HANDLER ---
  const handleHierarchyAdd = async () => {
      if(!newHierarchyName) return showError("Name required");
      const slug = newHierarchyName.toLowerCase().replace(/\s+/g, '-');
      
      if(activeHierarchyLevel === 'segment') {
          await supabase.from('segments').insert([{ title: newHierarchyName, slug }]);
      } else if (activeHierarchyLevel === 'group') {
          if(!selectedSegment) return showError("Select a Segment first");
          await supabase.from('groups').insert([{ title: newHierarchyName, slug, segment_id: Number(selectedSegment) }]);
      } else if (activeHierarchyLevel === 'subject') {
          if(!selectedGroup) return showError("Select a Group first");
          await supabase.from('subjects').insert([{ title: newHierarchyName, slug, group_id: Number(selectedGroup), segment_id: Number(selectedSegment) }]);
      }
      
      setNewHierarchyName("");
      fetchDropdowns();
      if(selectedSegment) fetchGroups(selectedSegment);
      if(selectedGroup) fetchSubjects(selectedGroup);
      showSuccess("Added Successfully");
  };

  // --- PAGINATION RENDERER (FIXED DYNAMIC SCOPE) ---
  const Pagination = () => {
      // Determine which page state to use
      const currentPage = activeTab === 'materials' ? resPage : 
                          activeTab === 'news' ? newsPage : 
                          activeTab === 'ebooks' ? ebPage : 
                          activeTab === 'updates' ? updatePage : 0;

      const setPage = (p: number) => {
          if (activeTab === 'materials') setResPage(p);
          else if (activeTab === 'news') setNewsPage(p);
          else if (activeTab === 'ebooks') setEbPage(p);
          else if (activeTab === 'updates') setUpdatePage(p);
      };

      return (
          <div className="flex justify-between items-center px-6 py-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Rows:</span>
                  <select className="bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold py-1.5 px-2 outline-none cursor-pointer" value={itemsPerPage} onChange={e=>{setItemsPerPage(Number(e.target.value)); setPage(0);}}>
                      <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                  </select>
              </div>
              <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400">Page {currentPage+1}</span>
                  <div className="flex gap-1">
                      <button onClick={()=>setPage(Math.max(0,currentPage-1))} disabled={currentPage===0} className="p-2 rounded-lg border border-gray-200 text-slate-500 hover:bg-indigo-50 disabled:opacity-30">←</button>
                      <button onClick={()=>setPage(currentPage+1)} disabled={(currentPage+1)*itemsPerPage >= totalCount} className="p-2 rounded-lg border border-gray-200 text-slate-500 hover:bg-indigo-50 disabled:opacity-30">→</button>
                  </div>
              </div>
          </div>
      );
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold bg-[#F8FAFC]">Loading Dashboard...</div>;
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pt-32">
        {/* Modals */}
{isAddCatOpen && (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-[400px] animate-slide-up overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                <div>
                    <h3 className="font-bold text-lg text-slate-900">New Category</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase">Create a tag for posts</p>
                </div>
                <button onClick={() => setIsAddCatOpen(false)} className="bg-white p-2 rounded-full shadow hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-5">
                <div>
                    <label className="text-xs font-bold text-slate-800 block mb-2 uppercase">1. Select Post Type</label>
                    <select 
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer" 
                        value={newCatType} 
                        onChange={e => setNewCatType(e.target.value)}
                    >
                        <option value="general">General (All)</option>
                        <option value="news">News Post</option>
                        <option value="ebook">eBook</option>
                        <option value="blog">Study Material (Blog)</option>
                        <option value="course">Course</option>
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">
                        This category will <strong>only</strong> appear when you are creating a <strong>{newCatType}</strong> post.
                    </p>
                </div>
                
                <div>
                    <label className="text-xs font-bold text-slate-800 block mb-2 uppercase">2. Category Name</label>
                    <input 
                        className="w-full bg-white border border-slate-200 p-3 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" 
                        placeholder="e.g. Scholarship, Physics, Fiction..." 
                        value={newCatName} 
                        onChange={e => setNewCatName(e.target.value)} 
                    />
                </div>

                <button 
                    onClick={handleAddCategory} 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all transform active:scale-95"
                >
                    Create Category
                </button>
            </div>
        </div>
    </div>
)}
        
        {modal.isOpen && <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"><div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-pop-in text-center"><h3 className="text-xl font-black mb-2 capitalize text-slate-900">{modal.type}!</h3><p className="text-slate-500 text-sm mb-6 leading-relaxed">{modal.message}</p><div className="flex gap-3 justify-center">{modal.type === 'confirm' ? <><button onClick={closeModal} className="px-6 py-2.5 border border-gray-200 rounded-xl font-bold text-slate-600 hover:bg-gray-50">Cancel</button><button onClick={()=>{modal.onConfirm?.();closeModal()}} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200">Confirm</button></> : <button onClick={closeModal} className="px-8 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-lg">Okay</button>}</div></div></div>}

        <aside className="w-64 bg-[#0F172A] border-r border-slate-800 fixed top-0 bottom-0 z-20 hidden md:flex flex-col shadow-2xl pt-28">
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                {[{ id: 'materials', label: 'Study Materials', icon: '📚' }, { id: 'updates', label: 'Updates', icon: '📢' }, { id: 'ebooks', label: 'eBooks', icon: '📖' }, { id: 'courses', label: 'Courses', icon: '🎓' }, { id: 'news', label: 'Newsroom', icon: '📰' }, { id: 'hierarchy', label: 'Hierarchy', icon: '🌳' }, { id: 'categories', label: 'Categories', icon: '🏷️' }].map((tab) => (
                    <button key={tab.id} onClick={() => handleTabSwitch(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><span className="text-lg opacity-80">{tab.icon}</span> {tab.label}</button>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-800"><button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all">Sign Out</button></div>
        </aside>

        <main className="flex-1 md:ml-64 p-8 overflow-x-hidden min-h-screen">
            <div className="max-w-[1800px] mx-auto w-full">
{!editorMode && activeTab !== 'hierarchy' && (
    <ListHeader 
        title={activeTab.replace('-', ' ').toUpperCase()} 
        onAdd={() => { 
            if(activeTab === 'categories') {
                // Smart Open: Default to the filter you are currently looking at
                const defaultContext = catManagerTypeFilter === 'all' ? 'general' : catManagerTypeFilter;
                openCategoryModal(defaultContext); 
            } else {
                handleAddNew(); 
            }
        }} 
        onSearch={(v:string) => { 
            if(activeTab==='materials') setResSearch(v); 
            else if(activeTab==='news') setNewsSearch(v); 
            else if(activeTab==='ebooks') setEbSearch(v); 
            else if(activeTab==='updates') setUpdateSearch(v); 
            else if(activeTab==='categories') setCatSearch(v); 
        }} 
        searchVal={
            activeTab==='materials' ? resSearch : 
            activeTab==='news' ? newsSearch : 
            activeTab==='ebooks' ? ebSearch : 
            activeTab==='updates' ? updateSearch : 
            catSearch
        } 
    />
)}

                {/* --- HIERARCHY MANAGER (MILLER COLUMNS) --- */}
                {activeTab === 'hierarchy' && (
                    <div className="animate-fade-in h-[calc(100vh-100px)] flex flex-col">
                        <div className="mb-6 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-slate-800">Hierarchy Manager</h2>
                            <div className="flex gap-2">
                                <input className="bg-white border p-2 rounded-lg text-sm outline-none w-64" placeholder={`New ${activeHierarchyLevel}...`} value={newHierarchyName} onChange={e=>setNewHierarchyName(e.target.value)} />
                                <button onClick={handleHierarchyAdd} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm">+ Add {activeHierarchyLevel}</button>
                            </div>
                        </div>
                        <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
                            {/* COL 1: SEGMENTS */}
                            <div className="bg-white border rounded-2xl flex flex-col overflow-hidden shadow-sm" onClick={()=>setActiveHierarchyLevel('segment')}>
                                <div className={`p-4 font-bold border-b bg-slate-50 ${activeHierarchyLevel==='segment'?'text-indigo-600':'text-slate-500'}`}>1. Segments</div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    {segments.map(s => (
                                        <div key={s.id} onClick={()=>handleSegmentClick(String(s.id))} className={`p-3 rounded-xl cursor-pointer flex justify-between items-center ${selectedSegment===String(s.id)?'bg-indigo-600 text-white':'hover:bg-slate-50 text-slate-700'}`}>
                                            <span className="font-medium text-sm">{s.title}</span>
                                            <button onClick={(e)=>{e.stopPropagation(); deleteItem('segments', s.id)}} className={`text-xs ${selectedSegment===String(s.id)?'text-indigo-200 hover:text-white':'text-slate-300 hover:text-red-500'}`}>🗑️</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* COL 2: GROUPS */}
                            <div className={`bg-white border rounded-2xl flex flex-col overflow-hidden shadow-sm transition-opacity ${selectedSegment ? 'opacity-100':'opacity-50 pointer-events-none'}`} onClick={()=>setActiveHierarchyLevel('group')}>
                                <div className={`p-4 font-bold border-b bg-slate-50 ${activeHierarchyLevel==='group'?'text-indigo-600':'text-slate-500'}`}>2. Groups</div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    {groups.map(g => (
                                        <div key={g.id} onClick={()=>handleGroupClick(String(g.id))} className={`p-3 rounded-xl cursor-pointer flex justify-between items-center ${selectedGroup===String(g.id)?'bg-indigo-600 text-white':'hover:bg-slate-50 text-slate-700'}`}>
                                            <span className="font-medium text-sm">{g.title}</span>
                                            <button onClick={(e)=>{e.stopPropagation(); deleteItem('groups', g.id)}} className={`text-xs ${selectedGroup===String(g.id)?'text-indigo-200 hover:text-white':'text-slate-300 hover:text-red-500'}`}>🗑️</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* COL 3: SUBJECTS */}
                            <div className={`bg-white border rounded-2xl flex flex-col overflow-hidden shadow-sm transition-opacity ${selectedGroup ? 'opacity-100':'opacity-50 pointer-events-none'}`} onClick={()=>setActiveHierarchyLevel('subject')}>
                                <div className={`p-4 font-bold border-b bg-slate-50 ${activeHierarchyLevel==='subject'?'text-indigo-600':'text-slate-500'}`}>3. Subjects</div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    {subjects.map(s => (
                                        <div key={s.id} className="p-3 rounded-xl flex justify-between items-center hover:bg-slate-50 text-slate-700">
                                            <span className="font-medium text-sm">{s.title}</span>
                                            <button onClick={()=>deleteItem('subjects', s.id)} className="text-slate-300 hover:text-red-500 text-xs">🗑️</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

{/* CATEGORIES MANAGEMENT VIEW */}
{activeTab === 'categories' && !editorMode && (
    <div className="animate-fade-in space-y-6">
        {/* Filter Bar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filter Context:</span>
                <div className="flex gap-2 flex-wrap">
                    {['all', 'news', 'ebook', 'blog', 'course', 'general'].map(t => (
                        <button 
                            key={t} 
                            onClick={() => setCatManagerTypeFilter(t)} 
                            className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all border ${catManagerTypeFilter === t ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>
            <div className="text-xs font-bold text-slate-400">
                Total: {dataList.length}
            </div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dataList.map((cat:any) => (
                <div key={cat.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group relative">
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${
                            cat.type === 'news' ? 'bg-blue-50 text-blue-600' : 
                            cat.type === 'ebook' ? 'bg-orange-50 text-orange-600' : 
                            cat.type === 'blog' ? 'bg-purple-50 text-purple-600' : 
                            cat.type === 'course' ? 'bg-emerald-50 text-emerald-600' : 
                            'bg-slate-100 text-slate-500'
                        }`}>
                            {cat.type || 'General'}
                        </span>
                        <button onClick={()=>handleDelete(cat.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                            🗑️
                        </button>
                    </div>
                    
                    <h3 className="font-bold text-slate-800 text-lg mb-1">{cat.name}</h3>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <span>Used in {categoryCounts[cat.id] || 0} posts</span>
                    </div>
                </div>
            ))}
        </div>
        
        {dataList.length === 0 && (
            <div className="text-center py-20 text-slate-400">
                <p>No categories found for this filter.</p>
            </div>
        )}
    </div>
)}

                {/* OTHER LIST VIEWS */}
                {activeTab !== 'categories' && activeTab !== 'hierarchy' && !editorMode && (
                    <div className="animate-fade-in space-y-6">
                        <FilterBar 
                            segments={segments} groups={groups} subjects={subjects} 
                            selSeg={selectedSegment} setSelSeg={setSelectedSegment} selGrp={selectedGroup} setSelGrp={setSelectedGroup} selSub={selectedSubject} setSelSub={setSelectedSubject} 
                            onFetchGroups={fetchGroups} onFetchSubjects={fetchSubjects} 
                            dateFilter={dateFilter} setDateFilter={setDateFilter} 
                            startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate}
                            showHierarchy={['materials','courses'].includes(activeTab)} 
                            showSegmentOnly={activeTab==='updates'}
                            showType={activeTab==='materials'} 
                            showUpdateType={activeTab==='updates'}
                            typeFilter={typeFilter} setTypeFilter={setTypeFilter} 
                            updateTypeFilter={updateTypeFilter} setUpdateTypeFilter={setUpdateTypeFilter}
                            typeOptions={activeTab==='materials'?[{val:'blog',label:'✍️ Blogs'},{val:'pdf',label:'📄 PDFs'},{val:'video',label:'🎬 Videos'},{val:'question',label:'❓ Questions'}]:[{val:'routine',label:'📅 Routine'},{val:'syllabus',label:'📝 Syllabus'},{val:'exam_result',label:'🏆 Result'}]} 
                            showCategory={activeTab==='ebooks'||activeTab==='news'} 
                            catFilter={catFilter} setCatFilter={setCatFilter} categories={categories} 
                        />

                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-gray-50/50 text-xs uppercase font-extrabold text-slate-400 border-b border-gray-100 tracking-wider">
                                    <tr>
                                        <SortableHeader label="TITLE" sortKey="title" currentSort={sortConfig} setSort={setSortConfig} />
                                        {['materials','updates','courses'].includes(activeTab) && <th className="px-6 py-4 font-extrabold text-slate-400">CONTEXT</th>}
                                        {(activeTab === 'materials' || activeTab === 'updates') && <SortableHeader label="TYPE" sortKey="type" currentSort={sortConfig} setSort={setSortConfig} />}
                                        <SortableHeader label="DATE" sortKey="created_at" currentSort={sortConfig} setSort={setSortConfig} />
                                        <th className="px-6 py-4 text-right font-extrabold text-slate-400">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {dataList.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {(activeTab === 'news' || activeTab === 'ebooks' || (activeTab==='materials' && item.type==='blog')) && (item.image_url || item.cover_url) && <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0"><img src={item.image_url || item.cover_url} className="w-full h-full object-cover"/></div>}
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-base">{item.title}</p>
                                                        {(activeTab === 'ebooks' || activeTab === 'courses') && <p className="text-[10px] text-slate-400 mt-0.5">{item.author || item.instructor}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            {['materials','updates','courses'].includes(activeTab) && <td className="px-6 py-4"><span className="inline-block px-2 py-1 rounded-md bg-gray-100 text-[10px] font-bold text-slate-500 uppercase tracking-wide">{getHierarchyLabel(item)}</span></td>}
                                            {(activeTab === 'materials' || activeTab === 'updates') && <td className="px-6 py-4"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${item.type==='blog'?'bg-purple-100 text-purple-700':item.type==='pdf'?'bg-red-100 text-red-700':item.type==='video'?'bg-blue-100 text-blue-700':'bg-orange-100 text-orange-700'}`}>{item.type}</span></td>}
                                            <td className="px-6 py-4 text-xs font-medium text-slate-500">{new Date(item.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <button onClick={()=>handleEdit(item)} className="text-indigo-600 font-bold text-xs bg-indigo-50 px-3 py-1.5 rounded-lg opacity-80 hover:opacity-100 transition-all">Edit</button>
                                                <button onClick={()=>handleDelete(item.id)} className="text-red-600 font-bold text-xs bg-red-50 px-3 py-1.5 rounded-lg opacity-80 hover:opacity-100 transition-all">Del</button>
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
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-slide-up">
                        <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                            <button onClick={()=>isDirty?confirmAction("Discard changes?", ()=>setEditorMode(false)):setEditorMode(false)} className="text-slate-500 hover:text-slate-800 font-bold text-sm flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200/50 transition-colors">← Back to List</button>
                            <div className="flex gap-3 items-center">
                                {isDirty && <span className="text-xs font-bold text-orange-500 uppercase tracking-wide animate-pulse">Unsaved Changes</span>}
                                <button onClick={handleSave} disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all transform active:scale-95">{submitting ? "Saving..." : "Save Content"}</button>
                            </div>
                        </div>
                        <div className="p-10 w-full max-w-[1800px] mx-auto">
                            <div className="flex flex-col lg:flex-row gap-10 w-full">
                                {/* LEFT: MAIN CONTENT */}
                                <div className="w-full lg:w-[75%] space-y-8">
                                    <input className="text-5xl font-black w-full bg-transparent border-b-2 border-gray-100 pb-6 outline-none placeholder-gray-300 text-slate-800 focus:border-indigo-500 transition-colors" placeholder="Type your title here..." value={title} onChange={e=>{setTitle(e.target.value); markDirty();}} />
                                    
                                    {/* Conditional Editors */}
                                    {['blog', 'question', 'ebook', 'course', 'update', 'news'].includes(activeTab === 'materials' ? type : (activeTab === 'updates' ? 'update' : (activeTab === 'courses' ? 'course' : (activeTab === 'ebooks' ? 'ebook' : (activeTab === 'news' ? 'news' : ''))))) && (
                                        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm"><MemoizedSunEditor content={content} onChange={(c:string)=>{setContent(c); markDirty();}} /></div>
                                    )}

                                    {/* File Inputs for PDF/Video */}
                                    {activeTab === 'materials' && (type === 'pdf' || type === 'video') && (
                                        <div className="bg-gray-50/50 p-8 rounded-2xl border border-dashed border-gray-300 hover:border-indigo-300 transition-colors">
                                            <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-widest">Source Material</h4>
                                            {type === 'pdf' && <div className="p-10 text-center relative cursor-pointer group"><input type="file" onChange={e=>{setFile(e.target.files?.[0]||null); markDirty();}} className="absolute inset-0 opacity-0 cursor-pointer"/><span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">📂</span><p className="text-sm font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">{file ? file.name : "Click to Upload PDF Document"}</p></div>}
                                            {type === 'video' && <input className="w-full bg-white border border-gray-200 p-4 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" value={link} onChange={e=>{setLink(e.target.value); markDirty();}} placeholder="Paste YouTube Embed Link..." />}
                                        </div>
                                    )}
                                </div>

                                {/* RIGHT: SIDEBAR SETTINGS */}
                                <div className="w-full lg:w-[25%] space-y-6">
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                                        <h4 className="text-xs font-black uppercase text-indigo-900 tracking-widest border-b border-gray-100 pb-4">Configuration</h4>
                                        
                                        {/* Type Selector (Materials & Updates) */}
                                        {activeTab === 'materials' && <div><label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Content Type</label><select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500" value={type} onChange={e=>{setType(e.target.value); markDirty();}}><option value="pdf">📄 PDF Document</option><option value="video">🎬 Video Lecture</option><option value="question">❓ Question Bank</option><option value="blog">✍️ Class Blog</option></select></div>}
                                        {activeTab === 'updates' && <div><label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Update Type</label><select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500" value={type} onChange={e=>{setType(e.target.value); markDirty();}}><option value="routine">📅 Routine</option><option value="syllabus">📝 Syllabus</option><option value="exam_result">🏆 Exam Result</option></select></div>}

                                        {/* Hierarchy Selectors */}
                                        {['materials', 'updates', 'courses'].includes(activeTab) && (
                                            <div className="space-y-4">
                                                <div><label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Hierarchy</label><select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold text-slate-700 mb-2 outline-none focus:ring-2 focus:ring-indigo-500" value={selectedSegment} onChange={e=>{handleSegmentClick(e.target.value); markDirty();}}><option value="">Select Segment</option>{segments.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                                                {activeTab !== 'updates' && (
                                                    <>
                                                        <select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold text-slate-700 mb-2 outline-none focus:ring-2 focus:ring-indigo-500" value={selectedGroup} onChange={e=>{handleGroupClick(e.target.value); markDirty();}} disabled={!selectedSegment}><option value="">Select Group</option>{groups.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select>
                                                        <select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={selectedSubject} onChange={e=>{handleSubjectClick(e.target.value); markDirty();}} disabled={!selectedGroup}><option value="">Select Subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                                                    </>
                                                )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Category Selectors */}
                                        {(activeTab === 'news' || activeTab === 'ebooks' || (activeTab === 'materials' && type === 'blog') || activeTab === 'courses') && (
                                            <CategoryManagerSelector label="Category" value={category} onChange={setCategory} context={activeTab === 'materials' ? 'blog' : activeTab === 'courses' ? 'course' : activeTab === 'ebooks' ? 'ebook' : 'news'} categories={categories} openModal={openCategoryModal} markDirty={markDirty} />
                                        )}

                                        {/* Extra Fields based on Tab */}
                                        {activeTab === 'ebooks' && (<div className="space-y-4"><div><label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Author</label><input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={author} onChange={e=>{setAuthor(e.target.value); markDirty();}} /></div><div><label className="text-xs font-bold text-slate-500 block mb-2 uppercase">PDF Direct Link</label><input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={link} onChange={e=>{setLink(e.target.value); markDirty();}} /></div></div>)}
                                        
                                        {activeTab === 'courses' && (
                                            <div className="space-y-4">
                                                <div><label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Instructor Name</label><input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={instructor} onChange={e=>{setInstructor(e.target.value); markDirty();}} /></div>
                                                <div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Price (BDT)</label><input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={price} onChange={e=>{setPrice(e.target.value); markDirty();}} /></div><div><label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Discount</label><input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={discountPrice} onChange={e=>{setDiscountPrice(e.target.value); markDirty();}} /></div></div>
                                                <div><label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Enrollment Link</label><input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={link} onChange={e=>{setLink(e.target.value); markDirty();}} /></div>
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