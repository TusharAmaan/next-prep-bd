"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Trash2, Tag, Plus, Filter, RefreshCw, X, 
  FileText, Calendar, ChevronLeft, ChevronRight, Loader2, ExternalLink,
  BookOpen, Briefcase, Bell
} from "lucide-react";

export default function CategoryManager({ 
  categories = [], 
  search, setSearch, 
  fetchCategories 
}: any) {
  
  // --- 1. STATE ---
  const [activeFilter, setActiveFilter] = useState("all");
  
  // Creation / Deletion
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState("resource"); // Changed default to 'resource' (most common)
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Counts & Real-time Data
  const [localCounts, setLocalCounts] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState(false);

  // Viewing Posts (The Popup)
  const [viewingCategory, setViewingCategory] = useState<any | null>(null);
  const [linkedPosts, setLinkedPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postPage, setPostPage] = useState(0);
  const [totalLinked, setTotalLinked] = useState(0);
  const POSTS_PER_PAGE = 5;

  // --- HELPER: GET TABLE NAME ---
  const getTableForType = (type: string) => {
      const t = (type || 'general').toLowerCase();
      if (t === 'ebook') return 'ebooks';
      if (t === 'course') return 'courses';
      if (t === 'news') return 'news';
      return 'resources'; // Default for blog, question, pdf, general, resource
  };

  // --- 2. FETCH COUNTS ---
  const fetchCounts = useCallback(async () => {
    if (categories.length === 0) return;
    setLoadingCounts(true);
    const newCounts: Record<string, number> = {};

    await Promise.all(categories.map(async (cat: any) => {
        const table = getTableForType(cat.type);
        
        const { count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
            .eq('category', cat.name); 
        
        newCounts[cat.id] = count || 0;
    }));

    setLocalCounts(newCounts);
    setLoadingCounts(false);
  }, [categories]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);


  // --- 3. FETCH LINKED POSTS ---
  const fetchLinkedPosts = async (category: any, page: number) => {
    setPostsLoading(true);
    const start = page * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE - 1;
    const table = getTableForType(category.type);

    const { data, count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .eq('category', category.name)
        .range(start, end)
        .order('created_at', { ascending: false });

    if (!error) {
        setLinkedPosts(data || []);
        setTotalLinked(count || 0);
    }
    setPostsLoading(false);
  };

  const openCategoryDetails = (cat: any) => {
    setViewingCategory(cat);
    setPostPage(0);
    fetchLinkedPosts(cat, 0);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 0) return;
    setPostPage(newPage);
    if (viewingCategory) fetchLinkedPosts(viewingCategory, newPage);
  };


  // --- 4. ACTIONS (Create/Delete) ---
  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); 
    if (!confirm("Delete this category? Items linked to it might lose their tag.")) return;
    setIsDeleting(id);
    const { error } = await supabase.from('categories').delete().eq('id', id);
    setIsDeleting(null);
    if (!error) {
        fetchCategories();
    }
  };

  const handleAdd = async () => {
    if (!newCatName.trim()) return alert("Name required");
    
    // Ensure we are saving the correct type string
    // This fixes the issue where categories might get saved with a generic type 
    // and then filter out of specific dropdowns.
    const { error } = await supabase
      .from('categories')
      .insert([{ name: newCatName.trim(), type: newCatType }]);

    if (!error) {
        setNewCatName("");
        setIsCreateModalOpen(false);
        fetchCategories();
    } else {
        alert(error.message);
    }
  };

  // Filtering Logic
  const filteredList = categories.filter((c: any) => {
      const categoryType = (c.type || 'general').toLowerCase().trim();
      const currentFilter = activeFilter.toLowerCase().trim();
      const categoryName = (c.name || '').toLowerCase();
      const searchTerm = (search || '').toLowerCase();
      
      // Match type exactly unless filter is 'all'
      // Note: 'general' often overlaps with 'resource', so check your DB schema
      const matchesType = currentFilter === 'all' || categoryType === currentFilter;
      const matchesSearch = categoryName.includes(searchTerm);
      return matchesType && matchesSearch;
  });

  // Updated Tabs list to match your likely DB schema for types
  const tabs = ['all', 'resource', 'news', 'ebook', 'course'];

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* HEADER TOOLBAR */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col xl:flex-row items-center gap-6 justify-between">
         
         {/* Search & Filter */}
         <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
            <div className="relative w-full md:w-64">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <input 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-indigo-500 transition-colors"
                    placeholder="Search categories..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto hide-scrollbar border-b md:border-b-0 border-slate-100">
                {tabs.map(t => (
                    <button 
                        key={t}
                        onClick={() => setActiveFilter(t)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-all border ${activeFilter === t ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}
                    >
                        {t === 'resource' ? 'Study Materials' : t}
                    </button>
                ))}
            </div>
         </div>

         {/* Actions */}
         <div className="flex gap-2 w-full md:w-auto">
             <button onClick={() => { fetchCategories(); fetchCounts(); }} className="p-2.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors" title="Refresh Data">
                <RefreshCw className={`w-4 h-4 ${loadingCounts ? 'animate-spin' : ''}`} />
             </button>
             <button onClick={() => setIsCreateModalOpen(true)} className="flex-1 md:flex-none bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95">
                <Plus className="w-4 h-4" /> New Category
             </button>
         </div>
      </div>

      {/* CATEGORY GRID */}
      {filteredList.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No categories found for this type.</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
             {filteredList.map((cat: any) => (
                <div 
                    key={cat.id} 
                    onClick={() => openCategoryDetails(cat)} 
                    className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group relative flex flex-col justify-between h-32 cursor-pointer"
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${
                            (cat.type || 'general') === 'news' ? 'bg-blue-50 text-blue-600' :
                            (cat.type || 'general') === 'ebook' ? 'bg-orange-50 text-orange-600' :
                            (cat.type || 'general') === 'resource' ? 'bg-purple-50 text-purple-600' :
                            (cat.type || 'general') === 'course' ? 'bg-emerald-50 text-emerald-600' :
                            'bg-slate-100 text-slate-500'
                        }`}>
                            {cat.type === 'resource' ? 'Study' : cat.type || 'General'}
                        </span>
                        <button 
                            onClick={(e) => handleDelete(e, cat.id)} 
                            disabled={isDeleting === cat.id}
                            className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                        >
                            {isDeleting === cat.id ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4" />}
                        </button>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-800 text-lg truncate" title={cat.name}>{cat.name}</h3>
                        <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {loadingCounts ? '...' : (localCounts[cat.id] || 0)} items linked
                        </p>
                    </div>
                </div>
             ))}
          </div>
      )}

      {/* --- MODAL: CREATE CATEGORY --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="p-5 border-b bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900">Add Category</h3>
                    <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Category Type</label>
                        <select 
                            className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 transition-all" 
                            value={newCatType} 
                            onChange={e => setNewCatType(e.target.value)}
                        >
                            <option value="resource">Study Materials (Blog/PDF/Video)</option>
                            <option value="ebook">eBook</option>
                            <option value="course">Course</option>
                            <option value="news">News</option>
                        </select>
                        <p className="text-[10px] text-slate-400 mt-1">This ensures the category appears in the correct editor dropdown.</p>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Name</label>
                        <input 
                            className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 transition-all" 
                            placeholder="e.g. Mathematics" 
                            value={newCatName} 
                            onChange={e => setNewCatName(e.target.value)} 
                        />
                    </div>
                    <button onClick={handleAdd} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-colors">
                        Create Category
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL: CATEGORY DETAILS & POSTS (Popup Logic Unchanged) --- */}
      {viewingCategory && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
                
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded">{viewingCategory.type}</span>
                            <span className="text-xs text-slate-400 font-bold">ID: {viewingCategory.id}</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800">{viewingCategory.name}</h3>
                    </div>
                    <button onClick={() => setViewingCategory(null)} className="p-2 bg-white rounded-full border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors">
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-700 flex items-center gap-2">
                            Linked Content <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">{totalLinked}</span>
                        </h4>
                    </div>

                    {postsLoading ? (
                        <div className="py-12 flex justify-center text-slate-400"><Loader2 className="w-8 h-8 animate-spin"/></div>
                    ) : linkedPosts.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2"/>
                            <p className="text-slate-500 font-medium">No posts linked to this category yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {linkedPosts.map((post) => (
                                <div key={post.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-indigo-200 transition-colors">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                        post.type === 'video' ? 'bg-red-50 text-red-500' : 
                                        post.type === 'pdf' ? 'bg-blue-50 text-blue-500' : 
                                        viewingCategory.type === 'course' ? 'bg-emerald-50 text-emerald-600' :
                                        viewingCategory.type === 'ebook' ? 'bg-orange-50 text-orange-600' :
                                        'bg-slate-100 text-slate-500'
                                    }`}>
                                        {viewingCategory.type === 'course' ? <Briefcase className="w-5 h-5"/> : 
                                         viewingCategory.type === 'ebook' ? <BookOpen className="w-5 h-5"/> : 
                                         viewingCategory.type === 'news' ? <Bell className="w-5 h-5"/> :
                                         <FileText className="w-5 h-5"/>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-bold text-slate-800 truncate">{post.title || "Untitled"}</h5>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-medium">
                                            <span className="uppercase">{viewingCategory.type === 'general' ? post.type : viewingCategory.type}</span>
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(post.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    {(post.content_url || post.pdf_url || post.enrollment_link) && (
                                        <a href={post.content_url || post.pdf_url || post.enrollment_link} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-indigo-600">
                                            <ExternalLink className="w-4 h-4"/>
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center">
                    <button 
                        disabled={postPage === 0}
                        onClick={() => handlePageChange(postPage - 1)}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-bold text-sm disabled:opacity-50 hover:bg-slate-50"
                    >
                        <ChevronLeft className="w-4 h-4"/> Prev
                    </button>
                    <span className="text-xs font-bold text-slate-400">
                        Page {postPage + 1} of {Math.max(1, Math.ceil(totalLinked / POSTS_PER_PAGE))}
                    </span>
                    <button 
                        disabled={(postPage + 1) * POSTS_PER_PAGE >= totalLinked}
                        onClick={() => handlePageChange(postPage + 1)}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-bold text-sm disabled:opacity-50 hover:bg-slate-50"
                    >
                        Next <ChevronRight className="w-4 h-4"/>
                    </button>
                </div>

            </div>
        </div>
      )}

    </div>
  );
}