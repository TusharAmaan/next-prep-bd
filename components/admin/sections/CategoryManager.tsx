"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Trash2, Tag, Plus } from "lucide-react";

export default function CategoryManager({ 
  categories, categoryCounts, 
  filter, setFilter, 
  search, setSearch, 
  fetchCategories 
}: any) {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState("general");

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    await supabase.from('categories').delete().eq('id', id);
    fetchCategories();
  };

  const handleAdd = async () => {
    if (!newCatName) return alert("Name required");
    await supabase.from('categories').insert([{ name: newCatName, type: newCatType }]);
    setNewCatName("");
    setIsModalOpen(false);
    fetchCategories();
  };

  // Filter Logic handled in parent or here? 
  // Let's filter locally for UI speed since categories are usually few (<100)
  const filteredList = categories.filter((c: any) => {
      const matchesType = filter === 'all' || c.type === filter || (!c.type && filter === 'general');
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
  });

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* HEADER TOOLBAR */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col xl:flex-row items-center gap-6 justify-between">
         <div className="flex items-center gap-4 w-full xl:w-auto">
            <div className="relative flex-1 xl:w-64">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <input 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-indigo-500"
                    placeholder="Search categories..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 xl:pb-0 hide-scrollbar">
                {['all', 'news', 'ebook', 'blog', 'course', 'question'].map(t => (
                    <button 
                        key={t}
                        onClick={() => setFilter(t)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-all border ${filter === t ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        {t}
                    </button>
                ))}
            </div>
         </div>
         <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2 transition-all">
            <Plus className="w-4 h-4" /> New Category
         </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
         {filteredList.map((cat: any) => (
            <div key={cat.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group relative flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${
                        cat.type === 'news' ? 'bg-blue-50 text-blue-600' :
                        cat.type === 'ebook' ? 'bg-orange-50 text-orange-600' :
                        cat.type === 'blog' ? 'bg-purple-50 text-purple-600' :
                        'bg-slate-100 text-slate-500'
                    }`}>
                        {cat.type || 'General'}
                    </span>
                    <button onClick={() => handleDelete(cat.id)} className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-lg truncate" title={cat.name}>{cat.name}</h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">{categoryCounts[cat.id] || 0} items linked</p>
                </div>
            </div>
         ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up overflow-hidden">
                <div className="p-5 border-b bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900">Add Category</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Type</label>
                        <select className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl text-sm font-bold outline-none" value={newCatType} onChange={e => setNewCatType(e.target.value)}>
                            <option value="general">General</option>
                            <option value="news">News</option>
                            <option value="ebook">eBook</option>
                            <option value="blog">Blog</option>
                            <option value="course">Course</option>
                            <option value="question">Question</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Name</label>
                        <input className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl text-sm font-bold outline-none" placeholder="Category Name" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                    </div>
                    <button onClick={handleAdd} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all">Create</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}