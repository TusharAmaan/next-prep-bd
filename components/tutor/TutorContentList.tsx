"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Edit, Trash2, Eye, FileText, CheckCircle, AlertCircle, Clock, 
  Search, Filter, MoreVertical, Loader2 
} from "lucide-react";
import Link from "next/link";

export default function TutorContentList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, approved, pending, rejected
  const [showMenu, setShowMenu] = useState<string | null>(null); // For mobile actions

  const supabase = createClient();

  // --- FETCH DATA ---
  const fetchContent = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch ONLY content authored by this user (RLS enforced)
    const { data, error } = await supabase
      .from('resources')
      .select('id, title, slug, type, status, created_at, admin_feedback')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
        console.error("Error fetching content:", error);
    } else {
        setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // --- DELETE ACTION ---
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) return;
    
    const { error } = await supabase.from('resources').delete().eq('id', id);
    
    if (error) {
        alert("Error deleting: " + error.message);
    } else {
        // Optimistic update
        setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // --- FILTERING LOGIC ---
  const filteredItems = items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || item.status === filter;
      return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600"/> My Content Library
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <input 
                    className="w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="Search your posts..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <select 
                    className="w-full sm:w-40 pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none cursor-pointer hover:bg-slate-100 transition-all appearance-none text-slate-600"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="approved">Published</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            <Link href="/tutor/dashboard/create" className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                <Edit className="w-4 h-4"/> Create New
            </Link>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="hidden sm:table-cell px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="hidden md:table-cell px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-400"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500"/>Loading your library...</td></tr>
            ) : filteredItems.length === 0 ? (
                <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 flex flex-col items-center">
                        <FileText className="w-10 h-10 mb-3 opacity-20"/>
                        <p className="font-bold">No content found.</p>
                        <p className="text-xs">Try adjusting your search or filters.</p>
                    </td>
                </tr>
            ) : (
                filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* Title Column */}
                        <td className="px-6 py-4 relative">
                            <p className="font-bold text-slate-800 max-w-[200px] sm:max-w-xs truncate" title={item.title}>
                                {item.title}
                            </p>
                            {/* Mobile Type Label */}
                            <span className="sm:hidden text-[10px] text-slate-400 font-medium uppercase mt-1 block">{item.type}</span>
                        </td>

                        {/* Type Column (Desktop) */}
                        <td className="hidden sm:table-cell px-6 py-4">
                            <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wide">
                                {item.type}
                            </span>
                        </td>

                        {/* Status Column with Tooltip */}
                        <td className="px-6 py-4">
                            <div className="relative group/tooltip">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize cursor-default ${
                                    item.status === 'approved' ? 'bg-green-50 text-green-700 border border-green-100' :
                                    item.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                                    'bg-amber-50 text-amber-700 border border-amber-100'
                                }`}>
                                    {item.status === 'approved' && <CheckCircle className="w-3.5 h-3.5"/>}
                                    {item.status === 'rejected' && <AlertCircle className="w-3.5 h-3.5"/>}
                                    {item.status === 'pending' && <Clock className="w-3.5 h-3.5"/>}
                                    {item.status}
                                </span>
                                
                                {/* Admin Feedback Tooltip (Only if rejected) */}
                                {item.status === 'rejected' && item.admin_feedback && (
                                    <div className="absolute left-0 bottom-full mb-2 w-64 bg-slate-800 text-white text-xs p-3 rounded-xl shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10">
                                        <div className="font-bold mb-1 text-red-300 uppercase text-[10px]">Admin Feedback:</div>
                                        {item.admin_feedback}
                                        <div className="absolute left-4 -bottom-1 w-2 h-2 bg-slate-800 rotate-45"></div>
                                    </div>
                                )}
                            </div>
                        </td>

                        {/* Date Column */}
                        <td className="hidden md:table-cell px-6 py-4 text-slate-500 font-medium">
                            {new Date(item.created_at).toLocaleDateString()}
                        </td>

                        {/* Actions Column */}
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <Link 
                                    href={`/resources/${item.slug}`} 
                                    target="_blank" 
                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
                                    title="View Live"
                                >
                                    <Eye className="w-4 h-4"/>
                                </Link>
                                
                                {/* Edit Button (Links to Editor page with ID) */}
                                <Link 
                                    href={`/tutor/dashboard/content/${item.id}`}
                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    title="Edit Content"
                                >
                                    <Edit className="w-4 h-4"/>
                                </Link>

                                <button 
                                    onClick={() => handleDelete(item.id)} 
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                    title="Delete Post"
                                >
                                    <Trash2 className="w-4 h-4"/>
                                </button>
                            </div>
                        </td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}