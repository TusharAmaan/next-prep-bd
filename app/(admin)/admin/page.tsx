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

// --- EDITOR CONFIGURATION ---
const fullToolbarOptions = {
    minHeight: "300px",
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
  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  // --- UI STATES ---
  const [submitting, setSubmitting] = useState(false);
  const [isBlogEditorOpen, setIsBlogEditorOpen] = useState(false);

  // --- INPUTS: STRUCTURE ---
  const [newSegment, setNewSegment] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newSubject, setNewSubject] = useState("");

  // --- INPUTS: RESOURCES & BLOGS ---
  const [resTitle, setResTitle] = useState("");
  const [resLink, setResLink] = useState("");
  const [resFile, setResFile] = useState<File | null>(null);
  const [resType, setResType] = useState("pdf");
  const [richContent, setRichContent] = useState(""); 
  const [questionContent, setQuestionContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [blogImageFile, setBlogImageFile] = useState<File | null>(null);
  const [blogTags, setBlogTags] = useState("");
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);

  // --- INPUTS: NEWS ---
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState(""); 
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [newCategoryInput, setNewCategoryInput] = useState(""); 
  const [newsTags, setNewsTags] = useState(""); 
  const [newsFile, setNewsFile] = useState<File | null>(null);
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);

  // --- INPUTS: EBOOKS ---
  const [ebTitle, setEbTitle] = useState("");
  const [ebAuthor, setEbAuthor] = useState("");
  const [ebCategory, setEbCategory] = useState("SSC");
  const [ebDescription, setEbDescription] = useState(""); 
  const [ebTags, setEbTags] = useState("");
  const [editingEbookId, setEditingEbookId] = useState<number | null>(null);

  // --- INPUTS: COURSES ---
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
  const handleSegmentClick = (id: string) => { setSelectedSegment(id); setSelectedGroup(""); setSelectedSubject(""); setGroups([]); setSubjects([]); setResources([]); fetchGroups(id); };
  const handleGroupClick = (id: string) => { setSelectedGroup(id); setSelectedSubject(""); setSubjects([]); setResources([]); fetchGroups(selectedSegment); fetchSubjects(id); };
  const handleSubjectClick = (id: string) => { setSelectedSubject(id); fetchResources(id); };
  async function handleLogout() { await supabase.auth.signOut(); router.push("/login"); }
  
  async function deleteItem(table: string, id: number, refreshCallback: () => void) {
    if(!confirm("Are you sure?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if(error) alert("Error: " + error.message); else refreshCallback();
  }

  // --- STRUCTURE SUBMIT ---
  async function handleSegmentSubmit() {
    if(!newSegment) return alert("Title Required");
    await supabase.from('segments').insert([{ title: newSegment, slug: newSegment.toLowerCase().replace(/\s+/g, '-') }]);
    setNewSegment(""); fetchSegments();
  }
  async function handleGroupSubmit() {
    if(!newGroup || !selectedSegment) return alert("Select Segment");
    await supabase.from('groups').insert([{ title: newGroup, slug: newGroup.toLowerCase().replace(/\s+/g, '-'), segment_id: Number(selectedSegment) }]);
    setNewGroup(""); fetchGroups(selectedSegment);
  }
  async function handleSubjectSubmit() {
    if(!newSubject || !selectedGroup) return alert("Select Group");
    await supabase.from('subjects').insert([{ title: newSubject, slug: newSubject.toLowerCase().replace(/\s+/g, '-'), group_id: Number(selectedGroup), segment_id: Number(selectedSegment) }]);
    setNewSubject(""); fetchSubjects(selectedGroup);
  }

  // --- RESOURCE LOGIC ---
  function resetResourceForm() {
      setEditingResourceId(null); setResTitle(""); setResLink(""); setResFile(null); 
      setRichContent(""); setQuestionContent(""); setSeoTitle(""); setSeoDescription(""); 
      setBlogImageFile(null); setBlogTags(""); setResType("pdf"); setIsBlogEditorOpen(false); 
  }
  function loadResourceForEdit(r: any) {
      setEditingResourceId(r.id); setResTitle(r.title); setResType(r.type);
      setResLink(""); setRichContent(""); setQuestionContent(""); setSeoTitle(""); setSeoDescription(""); setBlogTags("");
      if (r.type === 'video' || r.type === 'pdf') setResLink(r.content_url || "");
      if (r.type === 'question') { setQuestionContent(r.content_body || ""); setSeoTitle(r.seo_title || ""); setSeoDescription(r.seo_description || ""); }
      if (r.type === 'blog') { setRichContent(r.content_body || ""); setBlogTags(r.tags ? r.tags.join(", ") : ""); setIsBlogEditorOpen(true); }
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function uploadResource(typeOverride?: string) {
    const finalType = typeOverride || resType;
    if (!resTitle || !selectedSubject) return alert("Title & Subject Required");
    setSubmitting(true);
    let finalUrl = resLink; let fileToUpload = null; 
    if (finalType === 'pdf') fileToUpload = resFile; if (finalType === 'blog') fileToUpload = blogImageFile;
    if (fileToUpload) {
        const n = `${finalType}-${Date.now()}-${fileToUpload.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
        await supabase.storage.from('materials').upload(n, fileToUpload);
        finalUrl = supabase.storage.from('materials').getPublicUrl(n).data.publicUrl;
    }
    const p: any = { subject_id: Number(selectedSubject), title: resTitle, type: finalType };
    if (finalType === 'pdf' || finalType === 'video') p.content_url = finalUrl;
    else if (finalType === 'question') { p.content_body = questionContent; p.seo_title = seoTitle || resTitle; p.seo_description = seoDescription; }
    else if (finalType === 'blog') { p.content_body = richContent; if(finalUrl) p.content_url = finalUrl; p.tags = blogTags.split(',').map(t=>t.trim()); }

    if (editingResourceId) await supabase.from('resources').update(p).eq('id', editingResourceId);
    else await supabase.from('resources').insert([p]);
    fetchResources(selectedSubject); if(finalType !== 'blog') resetResourceForm(); else alert("Saved!"); setSubmitting(false);
  }

  // --- NEWS LOGIC ---
  async function createCategory() { if(!newCategoryInput)return; await supabase.from('categories').insert([{ name: newCategoryInput }]); setNewCategoryInput(""); fetchCategories(); setSelectedCategory(newCategoryInput); }
  function loadNewsForEdit(i: any) { setNewsTitle(i.title); setNewsContent(i.content); setSelectedCategory(i.category || "General"); setNewsTags(i.tags?i.tags.join(", "):""); setEditingNewsId(i.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function cancelNewsEdit() { setNewsTitle(""); setNewsContent(""); setSelectedCategory("General"); setNewsTags(""); setEditingNewsId(null); }
  async function handleNewsSubmit() {
    if (!newsTitle) return alert("Title required"); setSubmitting(true);
    let u = null; if (newsFile) { const n = `news-${Date.now()}`; await supabase.storage.from('materials').upload(n, newsFile); u = supabase.storage.from('materials').getPublicUrl(n).data.publicUrl; }
    const p: any = { title: newsTitle, content: newsContent, category: selectedCategory, tags: newsTags.split(',') }; if(u) p.image_url=u;
    if (editingNewsId) await supabase.from('news').update(p).eq('id', editingNewsId); else await supabase.from('news').insert([p]);
    fetchNews(); cancelNewsEdit(); setSubmitting(false);
  }

  // --- EBOOK LOGIC ---
  function loadEbookForEdit(b:any) { setEbTitle(b.title); setEbAuthor(b.author||""); setEbCategory(b.category||"SSC"); setEbDescription(b.description||""); setEbTags(b.tags?b.tags.join(", "):""); setEditingEbookId(b.id); window.scrollTo({top:0,behavior:'smooth'}); }
  function cancelEbookEdit() { setEbTitle(""); setEbAuthor(""); setEbCategory("SSC"); setEbDescription(""); setEbTags(""); setEditingEbookId(null); }
  async function handleEbookSubmit() { 
      if(!ebTitle) return alert("Title Required"); setSubmitting(true); 
      const pdf=(document.getElementById('eb-file')as HTMLInputElement)?.files?.[0]; const cover=(document.getElementById('eb-cover')as HTMLInputElement)?.files?.[0]; 
      let pu=null; let cu=null; 
      if(pdf){ const n=`pdf-${Date.now()}`; await supabase.storage.from('materials').upload(n,pdf); pu=supabase.storage.from('materials').getPublicUrl(n).data.publicUrl; } 
      if(cover){ const n=`cover-${Date.now()}`; await supabase.storage.from('covers').upload(n,cover); cu=supabase.storage.from('covers').getPublicUrl(n).data.publicUrl; } 
      const p:any={title:ebTitle,author:ebAuthor,category:ebCategory,description:ebDescription,tags:ebTags.split(',')}; if(pu) p.pdf_url=pu; if(cu) p.cover_url=cu; 
      if(editingEbookId){ await supabase.from('ebooks').update(p).eq('id',editingEbookId); alert("Updated"); } else { if(!pu) {alert("PDF Required"); setSubmitting(false); return;} p.pdf_url=pu; await supabase.from('ebooks').insert([p]); alert("Created"); } 
      cancelEbookEdit(); fetchEbooks(); setSubmitting(false); 
  }

  // --- COURSE LOGIC ---
  function loadCourseForEdit(c:any) { setEditingCourseId(c.id); setCTitle(c.title); setCInstructor(c.instructor); setCPrice(c.price); setCDiscountPrice(c.discount_price||""); setCDuration(c.duration); setCLink(c.enrollment_link); setCDesc(c.description); window.scrollTo({top:0,behavior:'smooth'}); }
  async function handleCourseSubmit() { 
      if(!cTitle) return alert("Title Required"); setSubmitting(true); 
      let thumb=null; if(cImage){ const n=`course-${Date.now()}`; await supabase.storage.from('materials').upload(n,cImage); thumb=supabase.storage.from('materials').getPublicUrl(n).data.publicUrl; } 
      const p:any={title:cTitle,instructor:cInstructor,price:cPrice,discount_price:cDiscountPrice,duration:cDuration,enrollment_link:cLink,description:cDesc}; if(thumb) p.thumbnail_url=thumb; 
      if(editingCourseId) await supabase.from('courses').update(p).eq('id',editingCourseId); else { if(!thumb){ alert("Thumbnail Required"); setSubmitting(false); return; } p.thumbnail_url=thumb; await supabase.from('courses').insert([p]); } 
      setSubmitting(false); setEditingCourseId(null); setCTitle(""); setCInstructor(""); setCPrice(""); setCDiscountPrice(""); setCDuration(""); setCLink(""); setCDesc(""); setCImage(null); fetchCourses(); 
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-bold">Loading...</div>;
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-[#F3F4F6] font-sans text-gray-900">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed top-20 bottom-0 z-10 hidden md:flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100"><p className="text-xs text-gray-400 font-bold tracking-widest uppercase">Console</p></div>
        <nav className="flex-1 p-4 space-y-1">
            {[
                { id: 'materials', label: 'Study Materials', icon: '📂' },
                { id: 'class-blogs', label: 'Class Blogs', icon: '✍️' },
                { id: 'ebooks', label: 'eBooks Manager', icon: '📚' },
                { id: 'courses', label: 'Courses Manager', icon: '🎓' },
                { id: 'news', label: 'News CMS', icon: '📰' },
            ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                    <span>{tab.icon}</span>{tab.label}
                </button>
            ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">Sign Out</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA - FIXED LAYOUT */}
      <main className="flex-1 md:ml-64 p-6 pt-28 overflow-x-hidden min-h-screen">
        <div className="max-w-[1600px] mx-auto w-full">
            
            {/* MOBILE MENU */}
            <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2"><h1 className="text-xl font-bold mr-4">Admin</h1>{['materials','class-blogs','ebooks','courses','news'].map(t=><button key={t} onClick={()=>setActiveTab(t)} className={`px-4 py-1.5 rounded-full text-xs font-bold border ${activeTab===t?'bg-black text-white':'bg-white text-gray-600'}`}>{t}</button>)}</div>

            {/* TAB: STUDY MATERIALS */}
            {activeTab === 'materials' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* SEGMENTS */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">1. Segments</h3>
                        <div className="flex gap-2 mb-4"><input className="input-std" value={newSegment} onChange={e=>setNewSegment(e.target.value)} placeholder="Title..." /><button onClick={handleSegmentSubmit} className="btn-primary">+</button></div>
                        <ul className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">{segments.map(s=><li key={s.id} onClick={()=>handleSegmentClick(s.id)} className={`list-item-std ${selectedSegment===s.id?'active':''}`}><span>{s.title}</span><button onClick={(e)=>{e.stopPropagation();deleteItem('segments',s.id,fetchSegments)}}>✕</button></li>)}</ul>
                    </div>
                    {/* GROUPS */}
                    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-200 ${!selectedSegment?'opacity-50 pointer-events-none':''}`}>
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">2. Groups</h3>
                        <div className="flex gap-2 mb-4"><input className="input-std" value={newGroup} onChange={e=>setNewGroup(e.target.value)} placeholder="Title..." /><button onClick={handleGroupSubmit} className="btn-success">+</button></div>
                        <ul className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">{groups.map(g=><li key={g.id} onClick={()=>handleGroupClick(g.id)} className={`list-item-std ${selectedGroup===g.id?'active-green':''}`}><span>{g.title}</span><button onClick={(e)=>{e.stopPropagation();deleteItem('groups',g.id,()=>fetchGroups(selectedSegment))}}>✕</button></li>)}</ul>
                    </div>
                    {/* SUBJECTS */}
                    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-200 ${!selectedGroup?'opacity-50 pointer-events-none':''}`}>
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">3. Subjects</h3>
                        <div className="flex gap-2 mb-4"><input className="input-std" value={newSubject} onChange={e=>setNewSubject(e.target.value)} placeholder="Title..." /><button onClick={handleSubjectSubmit} className="btn-purple">+</button></div>
                        <ul className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">{subjects.map(s=><li key={s.id} onClick={()=>handleSubjectClick(s.id)} className={`list-item-std ${selectedSubject===s.id?'active-purple':''}`}><span>{s.title}</span><button onClick={(e)=>{e.stopPropagation();deleteItem('subjects',s.id,()=>fetchSubjects(selectedGroup))}}>✕</button></li>)}</ul>
                    </div>
                </div>

                {/* RESOURCE UPLOADER */}
                <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${!selectedSubject?'opacity-50 pointer-events-none':''}`}>
                    <div className="p-4 bg-gray-50 border-b flex justify-between items-center"><h3 className="font-bold text-gray-800 text-sm">Upload Content (Subject ID: {selectedSubject})</h3>{editingResourceId&&<button onClick={resetResourceForm} className="text-red-500 text-xs font-bold">Cancel Edit</button>}</div>
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <select className="input-std font-bold" value={resType} onChange={e=>setResType(e.target.value)}><option value="pdf">📄 PDF</option><option value="video">🎬 Video</option><option value="question">❓ Question</option><option value="blog">✍️ Blog</option></select>
                                <input className="input-std" value={resTitle} onChange={e=>setResTitle(e.target.value)} placeholder="Content Title" />
                            </div>
                            {resType==='pdf' && <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 cursor-pointer"><input type="file" onChange={e=>setResFile(e.target.files?.[0]||null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/></div>}
                            {resType==='video' && <input className="input-std" value={resLink} onChange={e=>setResLink(e.target.value)} placeholder="YouTube URL" />}
                            {resType==='question' && <div className="border rounded-xl overflow-hidden"><SunEditor setContents={questionContent} onChange={setQuestionContent} setOptions={{...fullToolbarOptions, minHeight:"200px"}}/></div>}
                            {resType !== 'blog' && <button onClick={()=>uploadResource()} disabled={submitting} className="w-full btn-primary py-3 text-lg">{submitting?"Saving...":"Save Resource"}</button>}
                            {resType === 'blog' && <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg">Go to "Class Blogs" tab to write blogs.</div>}
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 h-[400px] overflow-y-auto custom-scrollbar">
                            {resources.length===0?<p className="text-center text-gray-400 text-sm mt-10">No content found.</p>:resources.map(r=>(<div key={r.id} className="bg-white p-3 rounded-lg border border-gray-100 mb-2 flex justify-between items-center group"><span className="font-medium text-sm truncate w-2/3">{r.title}</span><div className="flex gap-2 opacity-0 group-hover:opacity-100"><button onClick={()=>loadResourceForEdit(r)}>✏️</button><button onClick={()=>deleteItem('resources',r.id,()=>fetchResources(selectedSubject))}>🗑️</button></div></div>))}
                        </div>
                    </div>
                </div>
              </div>
            )}

            {/* TAB: EBOOKS (REDESIGNED) */}
            {activeTab === 'ebooks' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Library Manager</h2>
                <div className="flex flex-col xl:flex-row gap-8">
                    {/* FORM */}
                    <div className="xl:w-1/3 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
                        <h3 className="font-bold text-gray-800 mb-4">{editingEbookId?"Edit eBook":"Add New eBook"}</h3>
                        <div className="space-y-4">
                            <input className="input-std font-bold" placeholder="Book Title" value={ebTitle} onChange={e=>setEbTitle(e.target.value)} />
                            <div className="grid grid-cols-2 gap-2"><input className="input-std" placeholder="Author" value={ebAuthor} onChange={e=>setEbAuthor(e.target.value)} /><select className="input-std" value={ebCategory} onChange={e=>setEbCategory(e.target.value)}><option>SSC</option><option>HSC</option><option>Admission</option></select></div>
                            <SunEditor setContents={ebDescription} onChange={setEbDescription} setOptions={{buttonList:[['bold','italic','list']], minHeight:"150px"}} />
                            <input className="input-std" placeholder="Tags..." value={ebTags} onChange={e=>setEbTags(e.target.value)} />
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-3 border rounded-lg bg-gray-50"><label className="text-xs font-bold text-red-500 block mb-1">PDF</label><input type="file" id="eb-file" className="text-xs w-full"/></div>
                                <div className="p-3 border rounded-lg bg-gray-50"><label className="text-xs font-bold text-blue-500 block mb-1">Cover</label><input type="file" id="eb-cover" className="text-xs w-full"/></div>
                            </div>
                            <button onClick={handleEbookSubmit} disabled={submitting} className="w-full btn-primary py-3">{submitting?"Saving...":editingEbookId?"Update":"Create eBook"}</button>
                            {editingEbookId && <button onClick={cancelEbookEdit} className="w-full text-red-500 text-xs font-bold py-2">Cancel</button>}
                        </div>
                    </div>
                    {/* LIST */}
                    <div className="xl:w-2/3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
                        {ebooksList.length === 0 && <div className="col-span-full text-center py-20 text-gray-400 bg-white rounded-2xl border border-dashed">No eBooks in library.</div>}
                        {ebooksList.map(book => (
                            <div key={book.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-3 hover:shadow-md transition">
                                <div className="w-16 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">{book.cover_url && <img src={book.cover_url} className="w-full h-full object-cover"/>}</div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div><h4 className="font-bold text-sm line-clamp-2">{book.title}</h4><p className="text-xs text-gray-500">{book.author}</p></div>
                                    <div className="flex gap-2 mt-2"><button onClick={()=>loadEbookForEdit(book)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">Edit</button><button onClick={()=>deleteItem('ebooks',book.id,fetchEbooks)} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded font-bold">Del</button></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            )}

            {/* TAB: CLASS BLOGS */}
            {activeTab === 'class-blogs' && (
              <div className="h-full">
                {!isBlogEditorOpen ? (
                    <div>
                        <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Class Blogs</h2><button onClick={()=>{resetResourceForm();setIsBlogEditorOpen(true);setResType('blog')}} className="btn-black py-2 px-6">+ Write New</button></div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4 mb-6">
                            <select className="input-std" value={selectedSegment} onChange={e=>handleSegmentClick(e.target.value)}><option value="">Filter Segment</option>{segments.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                            <select className="input-std" value={selectedGroup} onChange={e=>handleGroupClick(e.target.value)} disabled={!selectedSegment}><option value="">Filter Group</option>{groups.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select>
                            <select className="input-std" value={selectedSubject} onChange={e=>handleSubjectClick(e.target.value)} disabled={!selectedGroup}><option value="">Filter Subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {resources.filter(r=>r.type==='blog').map(b=>(<div key={b.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition"><div className="h-32 bg-gray-100 relative">{b.content_url && <img src={b.content_url} className="w-full h-full object-cover"/>}<div className="absolute top-2 right-2 flex gap-1"><button onClick={()=>loadResourceForEdit(b)} className="bg-white p-1 rounded shadow text-xs">✏️</button><button onClick={()=>deleteItem('resources',b.id,()=>fetchResources(selectedSubject))} className="bg-white p-1 rounded shadow text-xs text-red-500">🗑️</button></div></div><div className="p-4"><h3 className="font-bold text-sm line-clamp-2">{b.title}</h3></div></div>))}
                        </div>
                    </div>
                ):(
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 min-h-screen flex flex-col">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50"><button onClick={()=>setIsBlogEditorOpen(false)} className="font-bold text-gray-500">← Back</button><button onClick={()=>uploadResource('blog')} disabled={submitting} className="btn-success px-8">{submitting?"Publishing...":"Publish Post"}</button></div>
                        <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
                            <input className="text-4xl font-black w-full outline-none placeholder-gray-300" placeholder="Blog Title..." value={resTitle} onChange={e=>setResTitle(e.target.value)} />
                            <SunEditor setContents={richContent} onChange={setRichContent} setOptions={{...fullToolbarOptions, minHeight:"600px"}} />
                            <div className="grid grid-cols-2 gap-6 pt-6 border-t"><div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50"><input type="file" id="blog-cover" className="hidden" onChange={e=>setBlogImageFile(e.target.files?.[0]||null)} /><label htmlFor="blog-cover" className="cursor-pointer font-bold text-gray-500">Upload Cover Image</label>{blogImageFile && <p className="text-green-600 text-xs mt-2">{blogImageFile.name}</p>}</div><textarea className="input-std h-full resize-none" placeholder="Tags..." value={blogTags} onChange={e=>setBlogTags(e.target.value)}></textarea></div>
                        </div>
                    </div>
                )}
              </div>
            )}

            {/* TAB: COURSES MANAGER */}
            {activeTab === 'courses' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Courses Manager</h2>
                <div className="flex flex-col xl:flex-row gap-8">
                    {/* FORM */}
                    <div className="xl:w-1/3 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
                        <h3 className="font-bold text-gray-800 mb-4">{editingCourseId ? "Edit Course" : "Create Course"}</h3>
                        <div className="space-y-4">
                            <input className="input-std font-bold" placeholder="Course Title" value={cTitle} onChange={e=>setCTitle(e.target.value)} />
                            <input className="input-std" placeholder="Instructor Name" value={cInstructor} onChange={e=>setCInstructor(e.target.value)} />
                            <div className="grid grid-cols-2 gap-2">
                                <input className="input-std" placeholder="Price (5000)" value={cPrice} onChange={e=>setCPrice(e.target.value)} />
                                <input className="input-std text-green-600" placeholder="Discount (3500)" value={cDiscountPrice} onChange={e=>setCDiscountPrice(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input className="input-std" placeholder="Duration (3mo)" value={cDuration} onChange={e=>setCDuration(e.target.value)} />
                                <input className="input-std text-blue-600" placeholder="Enrollment Link" value={cLink} onChange={e=>setCLink(e.target.value)} />
                            </div>
                            <SunEditor setContents={cDesc} onChange={setCDesc} setOptions={{buttonList:[['bold','italic','list']], minHeight:"200px"}} placeholder="Description..." />
                            <div className="p-3 border rounded-lg bg-gray-50 text-center cursor-pointer relative"><label className="text-xs font-bold text-blue-500 block mb-1">Thumbnail</label><input type="file" onChange={e=>setCImage(e.target.files?.[0]||null)} className="text-xs w-full"/></div>
                            
                            <button onClick={handleCourseSubmit} disabled={submitting} className="w-full btn-black py-3">{submitting?"Saving...":editingCourseId?"Update":"Launch"}</button>
                            {editingCourseId && <button onClick={() => setEditingCourseId(null)} className="w-full text-red-500 text-xs font-bold py-2">Cancel</button>}
                        </div>
                    </div>
                    {/* LIST */}
                    <div className="xl:w-2/3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
                        {coursesList.map(c => (
                            <div key={c.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition group">
                                <div className="h-32 bg-gray-100 relative">
                                    {c.thumbnail_url && <img src={c.thumbnail_url} className="w-full h-full object-cover" />}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition">
                                        <button onClick={()=>loadCourseForEdit(c)} className="bg-white px-3 py-1 rounded text-xs font-bold">Edit</button>
                                        <button onClick={()=>deleteItem('courses',c.id,fetchCourses)} className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold">Del</button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h4 className="font-bold text-sm text-gray-900 mb-1">{c.title}</h4>
                                    <p className="text-xs text-gray-500 mb-2">{c.instructor}</p>
                                    <div className="flex gap-2 items-center">
                                        <span className="text-green-600 font-bold">{c.discount_price || c.price}</span>
                                        {c.discount_price && <span className="text-xs text-gray-400 line-through">{c.price}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            )}

            {/* TAB: NEWS CMS */}
            {activeTab === 'news' && (
              <div className="space-y-6">
                 <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Newsroom</h2>{editingNewsId && <button onClick={cancelNewsEdit} className="text-red-500 font-bold border px-4 py-2 rounded-lg">Cancel Edit</button>}</div>
                 <div className="flex flex-col xl:flex-row gap-8">
                    {/* EDITOR */}
                    <div className="xl:w-2/3 space-y-4">
                        <input className="text-4xl font-black w-full bg-transparent border-b border-gray-200 pb-4 outline-none placeholder-gray-300" placeholder="Headline..." value={newsTitle} onChange={e=>setNewsTitle(e.target.value)} />
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><SunEditor setContents={newsContent} onChange={setNewsContent} setOptions={{...fullToolbarOptions, minHeight:"500px"}} /></div>
                    </div>
                    {/* SIDEBAR & LIST */}
                    <div className="xl:w-1/3 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <button onClick={handleNewsSubmit} disabled={submitting} className="w-full btn-primary py-3 mb-6">{submitting?"Publishing...":editingNewsId?"Update":"Publish Now"}</button>
                            <div className="space-y-4">
                                <div><label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Category</label><select className="input-std" value={selectedCategory} onChange={e=>setSelectedCategory(e.target.value)}><option>General</option>{categoryList.map(c=><option key={c.id}>{c.name}</option>)}</select><div className="flex gap-2 mt-2"><input className="input-std py-2" placeholder="New..." value={newCategoryInput} onChange={e=>setNewCategoryInput(e.target.value)} /><button onClick={createCategory} className="btn-black py-1 px-3">+</button></div></div>
                                <div><label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Featured Image</label><input type="file" onChange={e=>setNewsFile(e.target.files?.[0]||null)} className="text-xs w-full"/></div>
                                <div><label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Tags</label><textarea className="input-std h-24 resize-none" placeholder="Tags..." value={newsTags} onChange={e=>setNewsTags(e.target.value)}></textarea></div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b font-bold text-gray-500 text-sm">Recent Articles</div>
                            <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                {newsList.map(n => (
                                    <div key={n.id} className="p-3 border-b hover:bg-gray-50 cursor-pointer flex justify-between items-center group">
                                        <span className="font-medium text-xs truncate w-2/3">{n.title}</span>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100"><button onClick={()=>loadNewsForEdit(n)} className="text-blue-600 text-xs">Edit</button><button onClick={()=>deleteItem('news',n.id,fetchNews)} className="text-red-600 text-xs">Del</button></div>
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

      {/* GLOBAL STYLES FOR ADMIN */}
      <style jsx global>{`
        .input-std { @apply w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition; }
        .btn-primary { @apply bg-blue-600 text-white font-bold rounded-lg px-4 py-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200; }
        .btn-success { @apply bg-green-600 text-white font-bold rounded-lg px-4 py-2 hover:bg-green-700 transition shadow-lg shadow-green-200; }
        .btn-purple { @apply bg-purple-600 text-white font-bold rounded-lg px-4 py-2 hover:bg-purple-700 transition shadow-lg shadow-purple-200; }
        .btn-black { @apply bg-black text-white font-bold rounded-lg px-4 py-2 hover:bg-gray-800 transition shadow-lg; }
        .list-item-std { @apply p-3 rounded-lg flex justify-between items-center text-sm font-bold bg-white border border-gray-100 hover:bg-gray-50 cursor-pointer transition; }
        .active { @apply bg-blue-50 border-blue-200 text-blue-700; }
        .active-green { @apply bg-green-50 border-green-200 text-green-700; }
        .active-purple { @apply bg-purple-50 border-purple-200 text-purple-700; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
      `}</style>
    </div>
  );
}