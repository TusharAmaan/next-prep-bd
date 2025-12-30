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

// 1. FULLY FEATURED EDITOR OPTIONS
const editorOptions: any = {
    minHeight: "600px", height: "auto", placeholder: "Start crafting your content...",
    buttonList: [
        ['undo', 'redo'],
        ['font', 'fontSize', 'formatBlock'],
        ['paragraphStyle', 'blockquote'],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['fontColor', 'hiliteColor', 'textStyle'],
        ['removeFormat'],
        ['outdent', 'indent'],
        ['align', 'horizontalRule', 'list', 'lineHeight'],
        ['table', 'link', 'image', 'video', 'audio', 'math'], 
        ['fullScreen', 'showBlocks', 'codeView'],
        ['preview', 'print', 'save', 'template']
    ],
    mode: "classic",
    defaultStyle: "font-family: 'Inter', sans-serif; font-size: 16px; line-height: 1.6; color: #334155;",
    resizingBar: true, showPathLabel: true, katex: katex 
};

type ModalState = { isOpen: boolean; type: 'success' | 'confirm' | 'error'; message: string; onConfirm?: () => void; };

// --- MEMOIZED UI COMPONENTS ---

const SeoInputSection = memo(({ title, setTitle, tags, setTags, desc, setDesc, markDirty }: any) => (
  <div className="bg-white/80 backdrop-blur-sm border border-indigo-50 p-6 rounded-2xl shadow-lg shadow-indigo-100/50 mt-8">
      <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2">
              <span className="text-xl">🚀</span> SEO Metadata
          </h4>
      </div>
      <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Meta Title</label><input className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={title} onChange={e=>{setTitle(e.target.value); markDirty();}} /></div>
            <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tags</label><input className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={tags} onChange={e=>{setTags(e.target.value); markDirty();}} placeholder="comma, separated" /></div>
          </div>
          <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Description</label><textarea className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none transition-all" value={desc} onChange={e=>{setDesc(e.target.value); markDirty();}} /></div>
      </div>
  </div>
));
SeoInputSection.displayName = "SeoInputSection";

const ListHeader = memo(({ title, onAdd, onSearch, searchVal }: any) => (
    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-white shadow-lg shadow-slate-200/50">
        <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight capitalize bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">{title}</h2>
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1">Management Console</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto items-center">
            <div className="relative group w-full md:w-72">
                <input 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm group-hover:shadow-md" 
                    placeholder="Type to search..." 
                    value={searchVal} 
                    onChange={e => onSearch(e.target.value)} 
                />
                <span className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors">🔍</span>
            </div>
            <button onClick={onAdd} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 whitespace-nowrap">
                <span>✨</span> Add New
            </button>
        </div>
    </div>
));
ListHeader.displayName = "ListHeader";

const UniversalFilterBar = memo(({ 
    segments, groups, subjects, 
    selSeg, setSelSeg, 
    selGrp, setSelGrp, 
    selSub, setSelSub,
    onFetchGroups, onFetchSubjects,
    categories, catFilter, setCatFilter,
    dateFilter, setDateFilter, // restored
    startDate, setStartDate, endDate, setEndDate,
    typeFilter, setTypeFilter, typeOptions = [],
    showHierarchy = false,
    showSegmentOnly = false,
    showCategory = false,
    showType = false
}: any) => (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm mb-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-violet-600"></div>
        
        <div className="flex flex-col xl:flex-row gap-6 justify-between">
            {/* LEFT: CONTENT FILTERS */}
            <div className="flex-1 space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">🔍 Refine Content</h3>
                <div className="flex flex-wrap gap-3">
                    {/* Date Dropdown */}
                    <div className="min-w-[140px]">
                        <select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={dateFilter} onChange={e=>setDateFilter(e.target.value)}>
                            <option value="all">📅 Any Time</option>
                            <option value="this_month">This Month</option>
                            <option value="last_6_months">Last 6 Months</option>
                            <option value="this_year">This Year</option>
                        </select>
                    </div>

                    {/* HIERARCHY: SEGMENT */}
                    {(showHierarchy || showSegmentOnly) && (
                        <div className="min-w-[140px] flex-1">
                            <select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={selSeg} onChange={e=>{setSelSeg(e.target.value); onFetchGroups(e.target.value);}}>
                                <option value="">All Segments</option>
                                {segments.map((s:any)=><option key={s.id} value={s.id}>{s.title}</option>)}
                            </select>
                        </div>
                    )}

                    {/* HIERARCHY: GROUP & SUBJECT */}
                    {showHierarchy && (
                        <>
                            <div className="min-w-[140px] flex-1">
                                <select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={selGrp} onChange={e=>{setSelGrp(e.target.value); onFetchSubjects(e.target.value);}} disabled={!selSeg}>
                                    <option value="">All Groups</option>
                                    {groups.map((g:any)=><option key={g.id} value={g.id}>{g.title}</option>)}
                                </select>
                            </div>
                            <div className="min-w-[140px] flex-1">
                                <select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={selSub} onChange={e=>setSelSub(e.target.value)} disabled={!selGrp}>
                                    <option value="">All Subjects</option>
                                    {subjects.map((s:any)=><option key={s.id} value={s.id}>{s.title}</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    {/* CATEGORY */}
                    {showCategory && (
                        <div className="min-w-[180px] flex-1">
                            <select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={catFilter} onChange={e=>setCatFilter(e.target.value)}>
                                <option value="all">All Categories</option>
                                {categories.map((c:any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                    )}

                    {/* CONTENT TYPE */}
                    {showType && (
                        <div className="min-w-[160px] flex-1">
                            <select className="w-full bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl text-xs font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500" value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
                                <option value="all">All Content Types</option>
                                {typeOptions.map((opt: any) => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: DATE RANGE FILTER */}
            <div className="w-full xl:w-auto space-y-4 border-t xl:border-t-0 xl:border-l border-slate-100 pt-4 xl:pt-0 xl:pl-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">📅 Custom Range</h3>
                <div className="flex gap-2 items-center">
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">From</p>
                        <input type="date" className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={startDate} onChange={e=>setStartDate(e.target.value)} />
                    </div>
                    <span className="text-slate-300 mt-4">—</span>
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">To</p>
                        <input type="date" className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={endDate} onChange={e=>setEndDate(e.target.value)} />
                    </div>
                </div>
            </div>
        </div>
    </div>
));
UniversalFilterBar.displayName = "UniversalFilterBar";

const ImageInput = memo(({ label, method, setMethod, file, setFile, link, setLink, markDirty, optional = false }: any) => (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-all">
        <div className="flex justify-between items-center"><h4 className="text-xs font-bold uppercase text-slate-500">{label} {optional && <span className="text-slate-300 font-normal">(Optional)</span>}</h4><div className="flex bg-slate-100 rounded-lg p-0.5"><button onClick={()=>{setMethod('upload'); markDirty();}} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${method==='upload'?'bg-white shadow text-indigo-600':'text-slate-400'}`}>Upload</button><button onClick={()=>{setMethod('link'); markDirty();}} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${method==='link'?'bg-white shadow text-indigo-600':'text-slate-400'}`}>Link</button></div></div>
        {method === 'upload' ? (<div className="border-2 border-dashed border-slate-200 p-6 rounded-xl text-center relative hover:bg-indigo-50/50 hover:border-indigo-300 transition-all cursor-pointer group"><input type="file" accept="image/*" onChange={e=>{setFile(e.target.files?.[0]||null); markDirty();}} className="absolute inset-0 opacity-0 cursor-pointer"/><span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">📸</span><p className="text-xs font-bold text-slate-400 group-hover:text-indigo-600">{file ? file.name : "Click to Upload"}</p></div>) : (<input className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://..." value={link} onChange={e=>{setLink(e.target.value); markDirty();}} />)}
    </div>
));
ImageInput.displayName = "ImageInput";

const CategoryManager = memo(({ label, value, onChange, context, categories, openModal, markDirty }: any) => {
    const filtered = categories.filter((c:any) => c.type === context || c.type === 'general' || !c.type);
    return (
        <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 block uppercase ml-1">{label}</label><div className="flex gap-2"><select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm font-bold text-slate-700 outline-none cursor-pointer hover:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all" value={value} onChange={e=>{onChange(e.target.value); markDirty();}}><option value="">Select Category</option>{filtered.map((c:any) => <option key={c.id} value={c.name}>{c.name}</option>)}</select><button onClick={() => openModal(context)} className="bg-white border border-slate-200 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 px-3 rounded-xl text-lg shadow-sm transition-all">⚙️</button></div></div>
    );
});
CategoryManager.displayName = "CategoryManager";

const SortableHeader = ({ label, sortKey, currentSort, setSort }: any) => (
    <th className="px-6 py-4 cursor-pointer hover:bg-indigo-50/50 transition-colors select-none group border-b border-slate-100" onClick={() => setSort({ key: sortKey, direction: currentSort.key === sortKey && currentSort.direction === 'asc' ? 'desc' : 'asc' })}>
        <div className="flex items-center gap-1.5"><span className="text-xs font-extrabold text-slate-500 tracking-wider group-hover:text-indigo-600 transition-colors">{label}</span><span className={`text-[8px] flex flex-col leading-[3px] ${currentSort.key === sortKey ? 'opacity-100' : 'opacity-20 group-hover:opacity-100'}`}><span className={currentSort.key===sortKey && currentSort.direction==='asc' ? 'text-indigo-600' : 'text-slate-400'}>▲</span><span className={currentSort.key===sortKey && currentSort.direction==='desc' ? 'text-indigo-600' : 'text-slate-400'}>▼</span></span></div>
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
  
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  
  // Filters
  const [dateFilter, setDateFilter] = useState("all"); // RE-ADDED
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); 
  const [updateTypeFilter, setUpdateTypeFilter] = useState("all"); 
  const [catFilter, setCatFilter] = useState("all"); 
  
  // Hierarchy
  const [selectedSegment, setSelectedSegment] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Data
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

  // Inputs
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); 
  const [extraContent, setExtraContent] = useState(""); 
  const [link, setLink] = useState("");
  const [type, setType] = useState("pdf"); 
  const [category, setCategory] = useState("");
  
  const [imageMethod, setImageMethod] = useState<'upload' | 'link'>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageLink, setImageLink] = useState("");
  const [file, setFile] = useState<File | null>(null); 

  const [author, setAuthor] = useState("");
  const [instructor, setInstructor] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [duration, setDuration] = useState("");
  
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

  // --- API ---
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

      // 1. Hierarchy Filters (Materials & Courses)
      if (['materials', 'courses'].includes(activeTab)) {
          if (selectedSubject) query = query.eq("subject_id", selectedSubject);
          else if (selectedGroup) query = query.eq("group_id", selectedGroup);
          else if (selectedSegment) query = query.eq("segment_id", selectedSegment);
      }
      
      // 2. Segment Only (Updates)
      if (activeTab === 'updates' && selectedSegment) {
          query = query.eq("segment_id", selectedSegment);
      }

      // 3. Type/Category Filters
      if (activeTab === 'materials' && typeFilter !== 'all') query = query.eq("type", typeFilter);
      if (activeTab === 'updates' && updateTypeFilter !== 'all') query = query.eq("type", updateTypeFilter);
      if ((activeTab === 'ebooks' || activeTab === 'news') && catFilter !== 'all') query = query.eq("category", catFilter);

      // 4. Search
      if (searchTerm) query = query.ilike("title", `%${searchTerm}%`);

      // 5. Date Filter (Dropdown OR Custom Range)
      const now = new Date();
      if (startDate && endDate) {
         // Custom Range takes priority
         query = query.gte('created_at', new Date(startDate).toISOString());
         query = query.lte('created_at', new Date(endDate).toISOString());
      } else if (dateFilter !== 'all') {
          let d;
          if(dateFilter === 'this_month') d = new Date(now.getFullYear(), now.getMonth(), 1);
          else if(dateFilter === 'last_6_months') d = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          else if(dateFilter === 'this_year') d = new Date(now.getFullYear(), 0, 1);
          if(d) query = query.gte('created_at', d.toISOString());
      }

      // 6. Pagination & Sort
      const from = currentPage * itemsPerPage;
      const to = from + itemsPerPage - 1;
      const { data, count, error } = await query.range(from, to).order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });

      if (!error && data) {
          setDataList(data);
          if (count !== null) setTotalCount(count);
      }
  }, [activeTab, selectedSegment, selectedGroup, selectedSubject, searchTerm, typeFilter, updateTypeFilter, catFilter, dateFilter, startDate, endDate, sortConfig, currentPage, itemsPerPage, editorMode, isLoading]);

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
          fetchContent();
          showSuccess("Deleted!"); 
      }); 
  };
  
  const handleDelete = (id: number) => {
      let table = activeTab === 'materials' ? 'resources' : activeTab === 'updates' ? 'segment_updates' : activeTab;
      deleteItem(table, id);
  };

  const handleSave = async () => {
      if (!title) return showError("Title is required");
      setSubmitting(true);

      let url: string | null = link;
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

  const Pagination = () => (
      <div className="flex justify-between items-center px-6 py-4 bg-white border-t border-gray-100">
          <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Rows:</span>
              <select className="bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold py-1.5 px-2 outline-none cursor-pointer" value={itemsPerPage} onChange={e=>{setItemsPerPage(Number(e.target.value)); setCurrentPage(0);}}>
                  <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
              </select>
          </div>
          <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400">Page {currentPage+1}</span>
              <div className="flex gap-1">
                  <button onClick={()=>setCurrentPage(Math.max(0,currentPage-1))} disabled={currentPage===0} className="p-2 rounded-lg border border-gray-200 text-slate-500 hover:bg-indigo-50 disabled:opacity-30">←</button>
                  <button onClick={()=>setCurrentPage(currentPage+1)} disabled={(currentPage+1)*itemsPerPage >= totalCount} className="p-2 rounded-lg border border-gray-200 text-slate-500 hover:bg-indigo-50 disabled:opacity-30">→</button>
              </div>
          </div>
      </div>
  );

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold bg-[#F8FAFC]">Loading Dashboard...</div>;
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pt-32">
        {/* Modals */}
        {isManageCatsOpen && (<div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"><div className="bg-white rounded-2xl shadow-2xl w-[500px] max-h-[85vh] flex flex-col overflow-hidden animate-slide-up"><div className="p-5 border-b flex justify-between items-center bg-gray-50"><div><h3 className="font-bold text-lg text-slate-900">Manage Categories</h3><p className="text-xs text-slate-500 font-bold uppercase">Context: {activeCatContext}</p></div><button onClick={()=>setIsManageCatsOpen(false)} className="bg-white p-2 rounded-full shadow hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">✕</button></div><div className="flex-1 overflow-y-auto p-5 custom-scrollbar"><div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mb-6 space-y-3"><input id="newCatInput" className="w-full bg-white border border-indigo-100 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="New Category Name..." /><button onClick={async ()=>{ const input = document.getElementById('newCatInput') as HTMLInputElement; if(input.value) { await supabase.from('categories').insert([{name:input.value, type: activeCatContext}]); input.value=""; fetchDropdowns(); } }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-bold text-sm shadow-md transition-all">+ Add Category</button></div><div className="space-y-2">{categories.filter(c => c.type === activeCatContext || c.type === 'general' || !c.type).map(c => (<div key={c.id} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl hover:border-indigo-200 transition-colors"><span className="text-sm font-bold text-slate-700">{c.name}</span><button onClick={()=>deleteItem('categories', c.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-all">🗑️</button></div>))}</div></div></div></div>)}
        
        {modal.isOpen && <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"><div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-pop-in text-center"><h3 className="text-xl font-black mb-2 capitalize text-slate-900">{modal.type}!</h3><p className="text-slate-500 text-sm mb-6 leading-relaxed">{modal.message}</p><div className="flex gap-3 justify-center">{modal.type === 'confirm' ? <><button onClick={closeModal} className="px-6 py-2.5 border border-gray-200 rounded-xl font-bold text-slate-600 hover:bg-gray-50">Cancel</button><button onClick={()=>{modal.onConfirm?.();closeModal()}} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200">Confirm</button></> : <button onClick={closeModal} className="px-8 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-lg">Okay</button>}</div></div></div>}

        <aside className="w-64 bg-[#0F172A] border-r border-slate-800 fixed top-0 bottom-0 z-20 hidden md:flex flex-col shadow-2xl pt-28">
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                {[{ id: 'materials', label: 'Study Materials', icon: '📚' }, { id: 'updates', label: 'Updates', icon: '📢' }, { id: 'ebooks', label: 'eBooks', icon: '📖' }, { id: 'courses', label: 'Courses', icon: '🎓' }, { id: 'news', label: 'Newsroom', icon: '📰' }].map((tab) => (
                    <button key={tab.id} onClick={() => handleTabSwitch(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><span className="text-lg opacity-80">{tab.icon}</span> {tab.label}</button>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-800"><button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all">Sign Out</button></div>
        </aside>

        <main className="flex-1 md:ml-64 p-8 overflow-x-hidden min-h-screen">
            <div className="max-w-[1800px] mx-auto w-full">
                {!editorMode && <ListHeader title={activeTab.replace('-', ' ').toUpperCase()} onAdd={handleAddNew} onSearch={(v:string)=>setSearchTerm(v)} searchVal={searchTerm} />}

                {/* LIST VIEW */}
                {!editorMode && (
                    <div className="animate-fade-in space-y-6">
                        <UniversalFilterBar 
                            segments={segments} groups={groups} subjects={subjects} 
                            selSeg={selectedSegment} setSelSeg={setSelectedSegment} selGrp={selectedGroup} setSelGrp={setSelectedGroup} selSub={selectedSubject} setSelSub={setSelectedSubject} 
                            onFetchGroups={fetchGroups} onFetchSubjects={fetchSubjects} 
                            dateFilter={dateFilter} setDateFilter={setDateFilter} // Correctly passed now
                            startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate}
                            showHierarchy={['materials','courses'].includes(activeTab)} 
                            showSegmentOnly={activeTab==='updates'}
                            showType={activeTab==='materials' || activeTab==='updates'}
                            typeFilter={activeTab==='materials'?typeFilter:updateTypeFilter} setTypeFilter={activeTab==='materials'?setTypeFilter:setUpdateTypeFilter} 
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
                                                    {(activeTab === 'news' || activeTab === 'ebooks' || (activeTab==='materials' && item.type==='blog')) && item.image_url && <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0"><img src={item.image_url || item.cover_url} className="w-full h-full object-cover"/></div>}
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
                                            <CategoryManager label="Category" value={category} onChange={setCategory} context={activeTab === 'materials' ? 'blog' : activeTab === 'courses' ? 'course' : activeTab === 'ebooks' ? 'ebook' : 'news'} categories={categories} openModal={openCategoryModal} markDirty={markDirty} />
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