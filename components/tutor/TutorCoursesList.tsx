"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Edit, Trash2, Eye, Layout, Plus, Loader2 } from "lucide-react";
import ContentEditor from "@/components/admin/sections/ContentEditor";

export default function TutorCoursesList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorMode, setEditorMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Dropdowns
  const [segments, setSegments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Editor Data State
  const [formData, setFormData] = useState<any>({
      title: "", slug: "", content: "", type: "course", category: "",
      link: "", imageMethod: "upload", imageLink: "",
      instructor: "", price: "", discountPrice: "", duration: "",
      seoTitle: "", seoDesc: "", tags: "",
      selectedSegment: ""
  });

  // --- FETCHING ---
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from('courses').select('*').eq('tutor_id', user.id).order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCourses();
    const loadDrops = async () => {
        const { data: s } = await supabase.from('segments').select('*');
        const { data: c } = await supabase.from('categories').select('*');
        setSegments(s || []);
        setCategories(c || []);
    };
    loadDrops();
  }, [fetchCourses]);

  // --- ACTIONS ---
  const handleAddNew = () => {
      setEditingId(null);
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
      setFormData({
          title: item.title,
          slug: item.slug || "",
          content: item.description || "",
          type: "course",
          category: item.category || "",
          link: item.enrollment_link || "",
          imageMethod: item.thumbnail_url ? 'link' : 'upload',
          imageLink: item.thumbnail_url || "",
          instructor: item.instructor || "",
          price: item.price || "",
          discountPrice: item.discount_price || "",
          duration: item.duration || "",
          seoTitle: item.seo_title || "",
          seoDesc: item.seo_description || "",
          tags: item.tags?.join(", ") || "",
          selectedSegment: "" // Load if needed, or leave blank to keep existing
      });
      setEditorMode(true);
  };

  const handleSave = async () => {
      await fetchCourses();
      setEditorMode(false);
  };

  const handleDelete = async (id: string) => {
      if (!confirm("Delete course?")) return;
      await supabase.from('courses').delete().eq('id', id);
      setItems(prev => prev.filter(i => i.id !== id));
  };

  if (editorMode) {
      return (
          <ContentEditor
              activeTab="courses"
              isDirty={!!formData.title}
              setEditorMode={setEditorMode}
              handleSave={handleSave}
              editingId={editingId}
              
              // Mapping Props
              title={formData.title} setTitle={(v:any) => setFormData({...formData, title: v})}
              slug={formData.slug} setSlug={(v:any) => setFormData({...formData, slug: v})}
              content={formData.content} setContent={(v:any) => setFormData({...formData, content: v})}
              type="course" setType={()=>{}} // Fixed type
              category={formData.category} setCategory={(v:any) => setFormData({...formData, category: v})}
              link={formData.link} setLink={(v:any) => setFormData({...formData, link: v})}
              
              imageMethod={formData.imageMethod} setImageMethod={(v:any) => setFormData({...formData, imageMethod: v})}
              imageLink={formData.imageLink} setImageLink={(v:any) => setFormData({...formData, imageLink: v})}
              
              instructor={formData.instructor} setInstructor={(v:any) => setFormData({...formData, instructor: v})}
              price={formData.price} setPrice={(v:any) => setFormData({...formData, price: v})}
              discountPrice={formData.discountPrice} setDiscountPrice={(v:any) => setFormData({...formData, discountPrice: v})}
              duration={formData.duration} setDuration={(v:any) => setFormData({...formData, duration: v})}
              
              seoTitle={formData.seoTitle} setSeoTitle={(v:any) => setFormData({...formData, seoTitle: v})}
              seoDesc={formData.seoDesc} setSeoDesc={(v:any) => setFormData({...formData, seoDesc: v})}
              tags={formData.tags} setTags={(v:any) => setFormData({...formData, tags: v})}
              
              segments={segments} 
              selectedSegment={formData.selectedSegment} 
              handleSegmentClick={(v:any) => setFormData({...formData, selectedSegment: v})}
              
              categories={categories}
              groups={[]} subjects={[]} // Optional for courses
              handleGroupClick={()=>{}} handleSubjectClick={()=>{}}
              
              generateSlug={() => setFormData({...formData, slug: formData.title.toLowerCase().replace(/ /g, '-')})}
              markDirty={()=>{}}
              confirmAction={(msg: string, cb: any) => { if(window.confirm(msg)) cb(); }}
          />
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Layout className="w-6 h-6 text-emerald-600"/> My Courses
            </h2>
            <p className="text-xs text-slate-500">Manage your published courses.</p>
        </div>
        <button onClick={handleAddNew} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-100">
            <Plus className="w-4 h-4"/> New Course
        </button>
      </div>

      {loading ? <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500"/></div> : 
       items.length === 0 ? <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">No courses yet.</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                      <div className="h-40 bg-slate-100 relative">
                          {item.thumbnail_url ? <img src={item.thumbnail_url} className="w-full h-full object-cover"/> : <Layout className="w-12 h-12 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>}
                      </div>
                      <div className="p-5">
                          <h3 className="font-bold text-slate-900 truncate">{item.title}</h3>
                          <div className="flex justify-between mt-4">
                              <button onClick={() => handleEdit(item)} className="flex-1 text-center py-2 bg-slate-50 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100">Edit</button>
                              <button onClick={() => handleDelete(item.id)} className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
}