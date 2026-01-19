"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Edit, Trash2, Eye, Layout, Plus, Loader2, 
  CheckCircle, AlertCircle, Clock, Search 
} from "lucide-react";
import Link from "next/link";
import ContentEditor from "@/components/admin/sections/ContentEditor";

export default function CourseManagerPage() {
  // --- 1. STATE ---
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Editor State
  const [editorMode, setEditorMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Dropdowns (Fetched once)
  const [segments, setSegments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Form State (Specific to Courses)
  const [formData, setFormData] = useState<any>({
      title: "", slug: "", content: "", type: "course", category: "",
      link: "", imageMethod: "upload", imageLink: "", 
      instructor: "", price: "", discountPrice: "", duration: "",
      seoTitle: "", seoDesc: "", tags: "",
      selectedSegment: ""
  });

  // --- 2. FETCH DATA ---
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch ONLY courses by this tutor
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('tutor_id', user.id)
      .order('created_at', { ascending: false });
      
    if (!error) setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCourses();
    // Load dropdowns for the editor
    const loadDrops = async () => {
        const { data: s } = await supabase.from('segments').select('id, title');
        const { data: c } = await supabase.from('categories').select('*');
        setSegments(s || []);
        setCategories(c || []);
    };
    loadDrops();
  }, [fetchCourses]);

  // --- 3. ACTIONS ---
  
  const handleAddNew = () => {
      setEditingId(null);
      // Reset form for a fresh course
      setFormData({
          title: "", slug: "", content: "", type: "course", category: "",
          link: "", imageMethod: "upload", imageLink: "",
          instructor: "", price: "", discountPrice: "", duration: "",
          seoTitle: "", seoDesc: "", tags: "", selectedSegment: ""
      });
      setEditorMode(true);
  };

  const handleEdit = (item: any) => {
      setEditingId(item.id);
      // Pre-fill form with existing course data
      setFormData({
          title: item.title,
          slug: item.slug || "",
          content: item.description || "", // Course description maps to 'content'
          type: "course",
          category: item.category || "",
          link: item.enrollment_link || "",
          imageMethod: item.thumbnail_url ? 'link' : 'upload', // Auto-detect method
          imageLink: item.thumbnail_url || "",
          instructor: item.instructor || "",
          price: item.price || "",
          discountPrice: item.discount_price || "",
          duration: item.duration || "",
          seoTitle: item.seo_title || "",
          seoDesc: item.seo_description || "",
          tags: item.tags?.join(", ") || "",
          selectedSegment: "" // Load if stored, otherwise blank
      });
      setEditorMode(true);
  };

  const handleSave = async () => {
      // The Editor component handles the DB update.
      // We just need to refresh the list and close the editor.
      await fetchCourses();
      setEditorMode(false);
  };

  const handleDelete = async (id: string) => {
      if (!confirm("Are you sure? This will permanently delete the course.")) return;
      
      const { error } = await supabase.from('courses').delete().eq('id', id);
      
      if (error) {
          alert("Error deleting: " + error.message);
      } else {
          setItems(prev => prev.filter(i => i.id !== id));
      }
  };

  // --- 4. RENDER EDITOR ---
  if (editorMode) {
      return (
          <ContentEditor
              activeTab="courses"  // This tells Editor to show Course fields (Price, Duration, etc.)
              isDirty={!!formData.title}
              setEditorMode={setEditorMode}
              handleSave={handleSave}
              editingId={editingId}
              
              // Map State Handlers
              title={formData.title} setTitle={(v:any) => setFormData({...formData, title: v})}
              slug={formData.slug} setSlug={(v:any) => setFormData({...formData, slug: v})}
              content={formData.content} setContent={(v:any) => setFormData({...formData, content: v})}
              type="course" setType={()=>{}} // Lock type to course
              
              category={formData.category} setCategory={(v:any) => setFormData({...formData, category: v})}
              link={formData.link} setLink={(v:any) => setFormData({...formData, link: v})}
              
              imageMethod={formData.imageMethod} setImageMethod={(v:any) => setFormData({...formData, imageMethod: v})}
              imageLink={formData.imageLink} setImageLink={(v:any) => setFormData({...formData, imageLink: v})}
              // imageFile/file handled internally by editor or you can add state if needed
              
              instructor={formData.instructor} setInstructor={(v:any) => setFormData({...formData, instructor: v})}
              price={formData.price} setPrice={(v:any) => setFormData({...formData, price: v})}
              discountPrice={formData.discountPrice} setDiscountPrice={(v:any) => setFormData({...formData, discountPrice: v})}
              duration={formData.duration} setDuration={(v:any) => setFormData({...formData, duration: v})}
              
              seoTitle={formData.seoTitle} setSeoTitle={(v:any) => setFormData({...formData, seoTitle: v})}
              seoDesc={formData.seoDesc} setSeoDesc={(v:any) => setFormData({...formData, seoDesc: v})}
              tags={formData.tags} setTags={(v:any) => setFormData({...formData, tags: v})}
              
              // Dropdowns
              segments={segments} 
              categories={categories}
              groups={[]} subjects={[]} 
              selectedSegment={formData.selectedSegment}
              handleSegmentClick={(v:any) => setFormData({...formData, selectedSegment: v})}
              handleGroupClick={()=>{}} handleSubjectClick={()=>{}}
              
              generateSlug={() => setFormData({...formData, slug: formData.title.toLowerCase().replace(/ /g, '-')})}
              markDirty={()=>{}}
              confirmAction={(msg: string, cb: any) => { if(window.confirm(msg)) cb(); }}
              
              openCategoryModal={() => alert("Please ask an Admin to create new categories.")}
              resourceId={editingId}
          />
      );
  }

  // --- 5. RENDER LIST VIEW ---
  const filteredItems = items.filter(item => item.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <Layout className="w-6 h-6 text-emerald-600"/> My Courses
            </h2>
            <p className="text-slate-500 text-sm mt-1">Manage your curriculum and pricing.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <input 
                    className="w-full md:w-64 pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    placeholder="Search courses..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <button 
                onClick={handleAddNew} 
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
                <Plus className="w-4 h-4"/> New Course
            </button>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
          <div className="py-20 flex justify-center text-slate-400"><Loader2 className="w-8 h-8 animate-spin"/></div>
      ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <Layout className="w-12 h-12 text-slate-300 mx-auto mb-3"/>
              <p className="font-bold text-slate-500">No courses found.</p>
              <p className="text-sm text-slate-400">Click "New Course" to get started.</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
                      {/* Thumbnail */}
                      <div className="h-48 bg-slate-100 relative overflow-hidden">
                          {item.thumbnail_url ? (
                              <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400"><Layout className="w-12 h-12 opacity-20"/></div>
                          )}
                          
                          {/* Status Badge */}
                          <div className="absolute top-3 right-3">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm border ${
                                  item.status === 'approved' ? 'bg-white text-green-700 border-white' :
                                  item.status === 'rejected' ? 'bg-white text-red-700 border-white' :
                                  'bg-white text-amber-700 border-white'
                              }`}>
                                  {item.status === 'approved' && <CheckCircle className="w-3 h-3"/>}
                                  {item.status === 'pending' && <Clock className="w-3 h-3"/>}
                                  {item.status === 'rejected' && <AlertCircle className="w-3 h-3"/>}
                                  {item.status}
                              </span>
                          </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-5 flex-1 flex flex-col">
                          <h3 className="font-bold text-slate-900 text-lg line-clamp-1 mb-1" title={item.title}>{item.title}</h3>
                          
                          <div className="flex justify-between items-center text-xs text-slate-500 mb-4 font-medium">
                              <span>{item.duration || "0h"} Duration</span>
                              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">৳{item.price}</span>
                          </div>

                          {/* Admin Feedback (Conditional) */}
                          {item.status === 'rejected' && item.admin_feedback && (
                              <div className="bg-red-50 p-3 rounded-lg text-xs text-red-600 mb-4 border border-red-100">
                                  <span className="font-bold block mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Needed Fixes:</span>
                                  {item.admin_feedback}
                              </div>
                          )}

                          <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
                              <button 
                                  onClick={() => handleEdit(item)}
                                  className="flex-1 py-2 text-center text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                              >
                                  <Edit className="w-3 h-3"/> Edit Course
                              </button>
                              <button 
                                  onClick={() => handleDelete(item.id)} 
                                  className="px-3 py-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                                  title="Delete Course"
                              >
                                  <Trash2 className="w-4 h-4"/>
                              </button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
}