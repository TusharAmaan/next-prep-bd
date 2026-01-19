"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Edit, Trash2, Eye, FileText, CheckCircle, AlertCircle, Clock, 
  Search, Filter, Plus, Loader2 
} from "lucide-react";
import Link from "next/link";
import ContentEditor from "@/components/admin/sections/ContentEditor"; // Reusing your robust Admin Editor

export default function TutorContentList() {
  // --- STATE ---
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  
  // Editor State
  const [editorMode, setEditorMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Dropdown Data (Fetched once)
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Form State for Editor
  const [formData, setFormData] = useState<any>({
      title: "", slug: "", content: "", type: "pdf", category: "",
      link: "", imageMethod: "upload", imageFile: null, imageLink: "", file: null,
      seoTitle: "", seoDesc: "", tags: "",
      selectedSegment: "", selectedGroup: "", selectedSubject: ""
  });

  // --- FETCH DATA ---
  const fetchDropdowns = useCallback(async () => {
      const [seg, cat] = await Promise.all([
          supabase.from('segments').select('*'),
          supabase.from('categories').select('*')
      ]);
      if(seg.data) setSegments(seg.data);
      if(cat.data) setCategories(cat.data);
  }, []);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });
      
    if (!error) setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchContent();
    fetchDropdowns();
  }, [fetchContent, fetchDropdowns]);

  // --- HANDLERS ---
  const handleAddNew = () => {
      setEditingId(null);
      setFormData({
          title: "", slug: "", content: "", type: "pdf", category: "",
          link: "", imageMethod: "upload", imageLink: "",
          seoTitle: "", seoDesc: "", tags: "",
          selectedSegment: "", selectedGroup: "", selectedSubject: ""
      });
      setEditorMode(true);
  };

  const handleEdit = async (item: any) => {
      setEditingId(item.id);
      
      // Fetch Hierarchy Context if needed
      if(item.segment_id) {
          const { data: grps } = await supabase.from('groups').select('*').eq('segment_id', item.segment_id);
          setGroups(grps || []);
      }
      if(item.group_id) {
          const { data: subs } = await supabase.from('subjects').select('*').eq('group_id', item.group_id);
          setSubjects(subs || []);
      }

      setFormData({
          title: item.title,
          slug: item.slug || "",
          content: item.content_body || "",
          type: item.type,
          category: item.category || "",
          link: item.content_url || "",
          imageMethod: item.cover_url ? 'link' : 'upload',
          imageLink: item.cover_url || "",
          seoTitle: item.seo_title || "",
          seoDesc: item.seo_description || "",
          tags: item.tags?.join(", ") || "",
          selectedSegment: item.segment_id || "",
          selectedGroup: item.group_id || "",
          selectedSubject: item.subject_id || ""
      });
      setEditorMode(true);
  };

  const handleSave = async () => {
      // The logic inside ContentEditor handles the DB save.
      // We just need to refresh the list and close the modal.
      await fetchContent();
      setEditorMode(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (!error) setItems(prev => prev.filter(item => item.id !== id));
  };

  // --- HIERARCHY HELPERS ---
  const handleSegmentClick = async (id: string) => {
      setFormData((prev:any) => ({ ...prev, selectedSegment: id, selectedGroup: "", selectedSubject: "" }));
      const { data } = await supabase.from('groups').select('*').eq('segment_id', id);
      setGroups(data || []);
  };
  const handleGroupClick = async (id: string) => {
      setFormData((prev:any) => ({ ...prev, selectedGroup: id, selectedSubject: "" }));
      const { data } = await supabase.from('subjects').select('*').eq('group_id', id);
      setSubjects(data || []);
  };

  // --- FILTERING ---
  const filteredItems = items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || item.status === filter;
      return matchesSearch && matchesFilter;
  });

  // --- RENDER EDITOR MODE ---
  if (editorMode) {
      return (
          <ContentEditor
              activeTab="materials"
              isDirty={!!formData.title}
              setEditorMode={setEditorMode}
              handleSave={handleSave} // Pass the refresher
              editingId={editingId}   // Pass ID so Editor knows to UPDATE instead of INSERT
              
              // Map State
              title={formData.title} setTitle={(v:any) => setFormData({...formData, title: v})}
              slug={formData.slug} setSlug={(v:any) => setFormData({...formData, slug: v})}
              content={formData.content} setContent={(v:any) => setFormData({...formData, content: v})}
              type={formData.type} setType={(v:any) => setFormData({...formData, type: v})}
              category={formData.category} setCategory={(v:any) => setFormData({...formData, category: v})}
              link={formData.link} setLink={(v:any) => setFormData({...formData, link: v})}
              
              imageMethod={formData.imageMethod} setImageMethod={(v:any) => setFormData({...formData, imageMethod: v})}
              imageFile={formData.imageFile} setImageFile={(v:any) => setFormData({...formData, imageFile: v})}
              imageLink={formData.imageLink} setImageLink={(v:any) => setFormData({...formData, imageLink: v})}
              file={formData.file} setFile={(v:any) => setFormData({...formData, file: v})}
              
              seoTitle={formData.seoTitle} setSeoTitle={(v:any) => setFormData({...formData, seoTitle: v})}
              seoDesc={formData.seoDesc} setSeoDesc={(v:any) => setFormData({...formData, seoDesc: v})}
              tags={formData.tags} setTags={(v:any) => setFormData({...formData, tags: v})}
              
              // Map Hierarchy
              segments={segments} selectedSegment={formData.selectedSegment} handleSegmentClick={handleSegmentClick}
              groups={groups} selectedGroup={formData.selectedGroup} handleGroupClick={handleGroupClick}
              subjects={subjects} selectedSubject={formData.selectedSubject} handleSubjectClick={(v:any) => setFormData({...formData, selectedSubject: v})}
              
              categories={categories}
              openCategoryModal={() => alert("Contact Admin to add categories.")}
              
              // Pass ID for Question Linking
              resourceId={editingId}
              
              // Dummy/Unused props for materials
              price="" setPrice={()=>{}} 
              discountPrice="" setDiscountPrice={()=>{}} 
              duration="" setDuration={()=>{}} 
              instructor="" setInstructor={()=>{}}
              generateSlug={() => setFormData({...formData, slug: formData.title.toLowerCase().replace(/ /g, '-')})}
              markDirty={()=>{}}
              confirmAction={(msg: string, cb: any) => { if(window.confirm(msg)) cb(); }}
          />
      );
  }

  // --- RENDER LIST MODE ---
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600"/> Resource Library
        </h2>
        <div className="flex gap-3">
            <input 
                className="pl-4 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 ring-indigo-100"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
            <button onClick={handleAddNew} className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 flex items-center gap-2">
                <Plus className="w-4 h-4"/> Create New
            </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan={3} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></td></tr> : 
             filteredItems.length === 0 ? <tr><td colSpan={3} className="p-8 text-center text-slate-400">No content found.</td></tr> :
             filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{item.title}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${
                            item.status === 'approved' ? 'bg-green-100 text-green-700' : 
                            item.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                            {item.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => handleEdit(item)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit className="w-4 h-4"/></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                    </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}