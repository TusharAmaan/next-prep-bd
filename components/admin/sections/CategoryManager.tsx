"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Trash2, Tag, Plus, Filter, RefreshCw } from "lucide-react";

export default function CategoryManager({ 
  categories = [], 
  categoryCounts = {}, 
  search, setSearch, 
  fetchCategories 
}: any) {
  
  // 1. INTERNAL STATE (Fixes the switching issue)
  const [activeFilter, setActiveFilter] = useState("all");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState("general");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // 2. ROBUST FILTERING LOGIC
  const filteredList = categories.filter((c: any) => {
      // Normalize data: Handle nulls ('general'), whitespace, and capitalization
      const categoryType = (c.type || 'general').toLowerCase().trim();
      const currentFilter = activeFilter.toLowerCase().trim();
      const categoryName = (c.name || '').toLowerCase();
      const searchTerm = (search || '').toLowerCase();

      // Logic: Match Type AND Match Search
      const matchesType = currentFilter === 'all' || categoryType === currentFilter;
      const matchesSearch = categoryName.includes(searchTerm);

      return matchesType && matchesSearch;
  });

  // 3. ACTIONS
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category? Items linked to it might lose their tag.")) return;
    setIsDeleting(id);
    const { error } = await supabase.from('categories').delete().eq('id', id);
    setIsDeleting(null);
    if (!error) fetchCategories();
  };

  const handleAdd = async () => {
    if (!newCatName.trim()) return alert("Name required");
    
    const { error } = await supabase
      .from('categories')
      .insert([{ 
          name: newCatName.trim(), 
          type: newCatType 
      }]);

    if (!error) {
        setNewCatName("");
        setIsModalOpen(false);
        fetchCategories();
    } else {
        alert(error.message);
    }
  };

  // Tabs Configuration
  const tabs = ['all', 'general', 'news', 'ebook', 'blog', 'course', 'question'];

  

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* HEADER TOOLBAR */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col xl:flex-row items-center gap-6 justify-between">
         
         {/* Search & Filter Area */}
         <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
            
            {/* Search Input */}
            <div className="relative w-full md:w-64">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <input 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-indigo-500 transition-colors"
                    placeholder="Search categories..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Filter Tabs (Now uses setActiveFilter) */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto hide-scrollbar border-b md:border-b-0 border-slate-100">
                {tabs.map(t => (
                    <button 
                        key={t}
                        onClick={() => setActiveFilter(t)}
                        className={`
                            px-4 py-2 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-all border
                            ${activeFilter === t 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                            }
                        `}
                    >
                        {t}
                    </button>
                ))}
            </div>
         </div>

         {/* Actions */}
         <div className="flex gap-2 w-full md:w-auto">
             <button onClick={fetchCategories} className="p-2.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors" title="Refresh Data">
                <RefreshCw className="w-4 h-4" />
             </button>
             <button onClick={() => setIsModalOpen(true)} className="flex-1 md:flex-none bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95">
                <Plus className="w-4 h-4" /> New Category
             </button>
         </div>
      </div>

      {/* GRID */}
      {filteredList.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No categories found for "{activeFilter}".</p>
              <button onClick={() => setActiveFilter('all')} className="mt-2 text-indigo-600 font-bold text-sm hover:underline">Clear Filters</button>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
             {filteredList.map((cat: any) => (
                <div key={cat.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group relative flex flex-col justify-between h-32">
                    
                    <div className="flex justify-between items-start">
                        {/* Type Badge */}
                        <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${
                            (cat.type || 'general') === 'news' ? 'bg-blue-50 text-blue-600' :
                            (cat.type || 'general') === 'ebook' ? 'bg-orange-50 text-orange-600' :
                            (cat.type || 'general') === 'blog' ? 'bg-purple-50 text-purple-600' :
                            (cat.type || 'general') === 'course' ? 'bg-emerald-50 text-emerald-600' :
                            (cat.type || 'general') === 'question' ? 'bg-rose-50 text-rose-600' :
                            'bg-slate-100 text-slate-500' // General
                        }`}>
                            {cat.type || 'General'}
                        </span>

                        {/* Delete Button */}
                        <button 
                            onClick={() => handleDelete(cat.id)} 
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
                            {categoryCounts[cat.id] || 0} items linked
                        </p>
                    </div>
                </div>
             ))}
          </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="p-5 border-b bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900">Add Category</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Type</label>
                        <div className="relative">
                            <select 
                                className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 appearance-none" 
                                value={newCatType} 
                                onChange={e => setNewCatType(e.target.value)}
                            >
                                <option value="general">General</option>
                                <option value="news">News</option>
                                <option value="ebook">eBook</option>
                                <option value="blog">Blog</option>
                                <option value="course">Course</option>
                                <option value="question">Question</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">▼</div>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Name</label>
                        <input 
                            className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:border-indigo-500" 
                            placeholder="e.g. Mathematics" 
                            value={newCatName} 
                            onChange={e => setNewCatName(e.target.value)} 
                        />
                    </div>
                    <button onClick={handleAdd} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-95">
                        Create Category
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}