"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Editor } from "@tinymce/tinymce-react";
import { 
  Layout, Save, Image as ImageIcon, Loader2, 
  DollarSign, Clock, User, ChevronLeft, AlertCircle 
} from "lucide-react";

export default function CourseEditor({ existingCourse }: { existingCourse?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- FORM STATE ---
  const [title, setTitle] = useState(existingCourse?.title || "");
  const [slug, setSlug] = useState(existingCourse?.slug || "");
  const [instructor, setInstructor] = useState(existingCourse?.instructor || "");
  const [duration, setDuration] = useState(existingCourse?.duration || "");
  const [price, setPrice] = useState(existingCourse?.price || "");
  const [discountPrice, setDiscountPrice] = useState(existingCourse?.discount_price || "");
  const [category, setCategory] = useState(existingCourse?.category || "");
  const [description, setDescription] = useState(existingCourse?.description || "");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(existingCourse?.thumbnail_url || "");

  // Dropdowns
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const loadCats = async () => {
      const { data } = await supabase.from('categories').select('*').eq('type', 'course');
      setCategories(data || []);
    };
    loadCats();
  }, []);

  // --- ACTIONS ---
  const generateSlug = () => {
    setSlug(title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
      setThumbnailPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    if (!title) return setError("Course Title is required.");
    if (!instructor) return setError("Instructor Name is required.");
    setLoading(true);
    setError(null);

    try {
      // 1. Get User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You are not logged in.");

      // 2. Upload Thumbnail (if changed)
      let finalThumbnailUrl = existingCourse?.thumbnail_url || null;
      if (thumbnailFile) {
        const name = `thumb-${Date.now()}-${thumbnailFile.name.replace(/[^a-z0-9.]/gi, '_')}`;
        const { data, error: uploadErr } = await supabase.storage.from('materials').upload(name, thumbnailFile);
        if (uploadErr) throw uploadErr;
        const { data: publicUrl } = supabase.storage.from('materials').getPublicUrl(name);
        finalThumbnailUrl = publicUrl.publicUrl;
      }

      // 3. Prepare Payload
      const payload = {
        title,
        slug: slug || title.toLowerCase().replace(/ /g, '-'),
        tutor_id: user.id,
        instructor,
        duration,
        price: price ? parseFloat(price) : 0,
        discount_price: discountPrice ? parseFloat(discountPrice) : 0,
        category,
        description,
        thumbnail_url: finalThumbnailUrl,
        status: 'pending', // FORCE PENDING
        created_at: new Date(),
      };

      // 4. Insert or Update
      let result;
      if (existingCourse?.id) {
        result = await supabase.from('courses').update(payload).eq('id', existingCourse.id);
      } else {
        result = await supabase.from('courses').insert([payload]);
      }

      if (result.error) throw result.error;

      // 5. Success
      alert("Course submitted for review!");
      router.push('/tutor/dashboard/courses'); // Redirect ONLY after success

    } catch (err: any) {
      console.error("Course Save Error:", err);
      setError(err.message || "Failed to save course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <button onClick={() => router.back()} className="text-xs font-bold text-slate-400 flex items-center gap-1 hover:text-slate-600 mb-1">
            <ChevronLeft className="w-3 h-3"/> Cancel
          </button>
          <h1 className="text-2xl font-black text-slate-800">
            {existingCourse ? 'Edit Course' : 'Create New Course'}
          </h1>
        </div>
        <button 
          onClick={handleSave} 
          disabled={loading}
          className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>}
          Save Course
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 font-bold text-sm border border-red-100">
          <AlertCircle className="w-5 h-5"/> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Course Title</label>
              <input 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg outline-none focus:border-emerald-500"
                placeholder="e.g. Complete Web Development Bootcamp"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={generateSlug}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Slug (URL)</label>
              <input 
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-500 font-mono"
                value={slug}
                onChange={e => setSlug(e.target.value)}
              />
            </div>
          </div>

          {/* Rich Text Description */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">Course Description</div>
            <Editor
              apiKey="koqq37jhe68hq8n77emqg0hbl97ivgtwz2fvvvnvtwapuur1"
              value={description}
              onEditorChange={(c) => setDescription(c)}
              init={{
                height: 400,
                menubar: false,
                plugins: ['lists', 'link', 'image', 'code'],
                toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter | bullist numlist | link',
                content_style: 'body { font-family:Inter,sans-serif; font-size:14px }'
              }}
            />
          </div>
        </div>

        {/* RIGHT: SETTINGS */}
        <div className="space-y-6">
          
          {/* Thumbnail */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Course Thumbnail</label>
            <div className="relative group cursor-pointer border-2 border-dashed border-slate-200 rounded-xl overflow-hidden h-40 bg-slate-50 flex items-center justify-center hover:border-emerald-400 transition-colors">
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 z-10 cursor-pointer" onChange={handleThumbnailChange} />
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover"/>
              ) : (
                <div className="text-slate-400 flex flex-col items-center gap-2">
                  <ImageIcon className="w-8 h-8"/>
                  <span className="text-xs font-bold">Upload Image</span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-2">Course Details</h3>
            
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Instructor Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <input className="w-full pl-9 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" value={instructor} onChange={e => setInstructor(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Duration</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <input className="w-full pl-9 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" placeholder="e.g. 20 Hours" value={duration} onChange={e => setDuration(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Category</label>
              <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Select Category...</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-2">Pricing</h3>
            
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Regular Price (৳)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <input type="number" className="w-full pl-9 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Discount Price (৳)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <input type="number" className="w-full pl-9 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" placeholder="0.00" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}