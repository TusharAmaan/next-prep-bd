'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { createFullCourse, createResource } from '@/app/actions/tutor';
import { 
  Loader2, FileText, Layers, Plus, Trash2, GripVertical, 
  Video, File, AlertCircle 
} from 'lucide-react';
import RichTextEditor from '@/components/shared/RichTextEditor';

export default function CreateContentPage() {
  const [activeTab, setActiveTab] = useState<'resource' | 'course'>('resource');
  
  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Content</h1>

      {/* TABS SWITCHER */}
      <div className="flex gap-4 border-b mb-8">
        <button
          onClick={() => setActiveTab('resource')}
          className={`pb-3 px-4 flex items-center gap-2 font-medium transition-colors ${
            activeTab === 'resource' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={18} /> Single Resource
        </button>
        <button
          onClick={() => setActiveTab('course')}
          className={`pb-3 px-4 flex items-center gap-2 font-medium transition-colors ${
            activeTab === 'course' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layers size={18} /> Full Course
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        {activeTab === 'resource' ? <ResourceForm /> : <ComprehensiveCourseForm />}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// SUB-COMPONENT 1: RESOURCE FORM
// ------------------------------------------------------------------
function ResourceForm() {
  const supabase = createClient();
  
  // Data State
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  // Selection State
  const [selectedSegment, setSelectedSegment] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [editorContent, setEditorContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Load Segments
  useEffect(() => {
    supabase.from('segments').select('id, title').then(({ data }: { data: any }) => {
      if (data) setSegments(data);
    });
  }, []);

  // 2. Load Groups
  useEffect(() => {
    if (!selectedSegment) return;
    setGroups([]); 
    setSubjects([]);
    supabase.from('groups').select('id, title').eq('segment_id', selectedSegment)
      .then(({ data }: { data: any }) => {
         if (data) setGroups(data);
      });
  }, [selectedSegment]);

  // 3. Load Subjects
  useEffect(() => {
    if (!selectedGroup) return;
    supabase.from('subjects').select('id, title').eq('group_id', selectedGroup)
      .then(({ data }: { data: any }) => {
         if (data) setSubjects(data);
      });
  }, [selectedGroup]);

  // 4. Handle Submit
  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setErrorMsg('');
    
    // Append the TinyMCE content manually
    formData.append('content', editorContent);
    formData.append('segment_id', selectedSegment);

    const result = await createResource(formData);
    
    if (result?.error) {
      setErrorMsg(result.error);
      setIsLoading(false);
    }
    // If success, server action handles redirect
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg flex gap-2 items-center text-sm">
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
          <select name="type" className="w-full border p-2 rounded-lg" required>
            <option value="blog">Class Blog / Article</option>
            <option value="pdf">PDF Note</option>
            <option value="video">Video Lesson</option>
            <option value="question">Question Bank</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input name="title" type="text" className="w-full border p-2 rounded-lg" placeholder="e.g. Introduction to Physics" required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
        <div>
          <label className="text-xs font-bold uppercase text-gray-500">Segment</label>
          <select 
            className="w-full border p-2 rounded mt-1" 
            onChange={(e) => setSelectedSegment(e.target.value)}
            required
          >
            <option value="">Select Segment...</option>
            {segments.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>
        
        <div>
          <label className="text-xs font-bold uppercase text-gray-500">Group</label>
          <select 
            className="w-full border p-2 rounded mt-1"
            onChange={(e) => setSelectedGroup(e.target.value)}
            disabled={!selectedSegment}
          >
            <option value="">Select Group...</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-gray-500">Subject</label>
          <select 
            name="subject_id" 
            className="w-full border p-2 rounded mt-1"
            disabled={!selectedGroup}
            required
          >
            <option value="">Select Subject...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Content Body</label>
        <RichTextEditor 
          initialValue="" 
          onChange={(html) => setEditorContent(html)} 
        />
        <p className="text-xs text-gray-500 mt-1">
          For Videos: Paste the YouTube embed code or link here. 
          For PDFs: Add a download link using the link tool.
        </p>
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 flex justify-center items-center gap-2"
      >
        {isLoading && <Loader2 className="animate-spin" size={20} />}
        Submit for Review
      </button>
    </form>
  );
}

// ------------------------------------------------------------------
// SUB-COMPONENT 2: COMPREHENSIVE COURSE FORM (All-in-One)
// ------------------------------------------------------------------
function ComprehensiveCourseForm() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  // --- 1. BASIC INFO STATE ---
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  
  // Dropdowns
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSegment, setSelectedSegment] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  // --- 2. CURRICULUM STATE ---
  const [modules, setModules] = useState<any[]>([
    { title: 'Introduction', lessons: [] }
  ]);

  // --- DROPDOWN FETCHING ---
  useEffect(() => {
    supabase.from('segments').select('id, title').then(({ data }: { data: any }) => { if (data) setSegments(data); });
  }, []);
  useEffect(() => {
    if (!selectedSegment) return;
    supabase.from('groups').select('id, title').eq('segment_id', selectedSegment).then(({ data }: { data: any }) => { if (data) setGroups(data); });
  }, [selectedSegment]);
  useEffect(() => {
    if (!selectedGroup) return;
    supabase.from('subjects').select('id, title').eq('group_id', selectedGroup).then(({ data }: { data: any }) => { if (data) setSubjects(data); });
  }, [selectedGroup]);

  // --- CURRICULUM HANDLERS ---
  const addModule = () => {
    setModules([...modules, { title: 'New Module', lessons: [] }]);
  };

  const updateModuleTitle = (index: number, val: string) => {
    const newMods = [...modules];
    newMods[index].title = val;
    setModules(newMods);
  };

  const removeModule = (index: number) => {
    const newMods = [...modules];
    newMods.splice(index, 1);
    setModules(newMods);
  };

  const addLesson = (moduleIndex: number) => {
    const newMods = [...modules];
    newMods[moduleIndex].lessons.push({ title: 'New Lesson', type: 'video', content: '', isFree: false });
    setModules(newMods);
  };

  const updateLesson = (modIndex: number, lessonIndex: number, field: string, val: any) => {
    const newMods = [...modules];
    newMods[modIndex].lessons[lessonIndex][field] = val;
    setModules(newMods);
  };

  const removeLesson = (modIndex: number, lessonIndex: number) => {
    const newMods = [...modules];
    newMods[modIndex].lessons.splice(lessonIndex, 1);
    setModules(newMods);
  };

  // --- SUBMIT HANDLER ---
  const handleSubmit = async () => {
    if (!title) return alert("Please enter a course title");
    setIsLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', desc);
    formData.append('price', price);
    formData.append('thumbnail_url', thumbnail);
    formData.append('segment_id', selectedSegment);
    formData.append('group_id', selectedGroup);
    formData.append('subject_id', selectedSubject);
    
    // CRITICAL: Send the entire curriculum structure as a JSON string
    formData.append('modules', JSON.stringify(modules));

    const result = await createFullCourse(formData);

    if (result?.error) {
      alert(result.error);
      setIsLoading(false);
    } else {
      alert("Course created successfully and sent for review!");
      router.push('/tutor/dashboard/courses'); // Redirect to list
    }
  };

  return (
    <div className="space-y-8">
      
      {/* SECTION 1: BASIC DETAILS */}
      <div className="space-y-6">
         <h3 className="text-lg font-bold text-gray-800 border-b pb-2">1. Course Details</h3>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Course Title</label>
               <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border p-2 rounded-lg" placeholder="e.g. Complete Biology 2026" />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Price (Leave empty for Free)</label>
               <input value={price} onChange={e=>setPrice(e.target.value)} className="w-full border p-2 rounded-lg" placeholder="e.g. 1500" />
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
             <select className="border p-2 rounded" onChange={e=>setSelectedSegment(e.target.value)}><option value="">Select Segment...</option>{segments.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
             <select className="border p-2 rounded" onChange={e=>setSelectedGroup(e.target.value)} disabled={!selectedSegment}><option value="">Select Group...</option>{groups.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select>
             <select className="border p-2 rounded" onChange={e=>setSelectedSubject(e.target.value)} disabled={!selectedGroup}><option value="">Select Subject...</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
         </div>

         <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
             <RichTextEditor initialValue="" onChange={setDesc} />
         </div>
      </div>

      {/* SECTION 2: CURRICULUM BUILDER */}
      <div className="space-y-6">
         <div className="flex justify-between items-end border-b pb-2">
            <h3 className="text-lg font-bold text-gray-800">2. Curriculum Builder</h3>
            <button onClick={addModule} className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:bg-indigo-50 px-3 py-1 rounded transition">
               <Plus size={16}/> Add Module
            </button>
         </div>

         <div className="space-y-4">
            {modules.map((mod, mIndex) => (
               <div key={mIndex} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                  {/* MODULE HEADER */}
                  <div className="bg-gray-100 p-4 flex items-center gap-3">
                     <GripVertical size={20} className="text-gray-400 cursor-move"/>
                     <input 
                        value={mod.title} 
                        onChange={(e) => updateModuleTitle(mIndex, e.target.value)}
                        className="flex-1 bg-transparent font-bold text-gray-800 outline-none placeholder:text-gray-400"
                        placeholder="Module Title (e.g. Thermodynamics)"
                     />
                     <button onClick={() => removeModule(mIndex)} className="text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>
                  </div>

                  {/* LESSONS LIST */}
                  <div className="p-4 space-y-3 bg-white">
                     {mod.lessons.map((lesson: any, lIndex: number) => (
                        <div key={lIndex} className="flex gap-3 items-start pl-4 border-l-2 border-indigo-100">
                           <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2">
                              {/* Lesson Title */}
                              <div className="md:col-span-4">
                                 <input 
                                    value={lesson.title} 
                                    onChange={(e) => updateLesson(mIndex, lIndex, 'title', e.target.value)}
                                    className="w-full text-sm border p-2 rounded" 
                                    placeholder="Lesson Title"
                                 />
                              </div>
                              {/* Type */}
                              <div className="md:col-span-2">
                                 <select 
                                    value={lesson.type}
                                    onChange={(e) => updateLesson(mIndex, lIndex, 'type', e.target.value)}
                                    className="w-full text-sm border p-2 rounded"
                                 >
                                    <option value="video">Video</option>
                                    <option value="pdf">PDF</option>
                                    <option value="text">Text</option>
                                 </select>
                              </div>
                              {/* Content Link */}
                              <div className="md:col-span-6">
                                 <input 
                                    value={lesson.content} 
                                    onChange={(e) => updateLesson(mIndex, lIndex, 'content', e.target.value)}
                                    className="w-full text-sm border p-2 rounded" 
                                    placeholder={lesson.type === 'video' ? 'YouTube URL...' : 'File Link / Text...'}
                                 />
                              </div>
                           </div>
                           <button onClick={() => removeLesson(mIndex, lIndex)} className="mt-2 text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                        </div>
                     ))}
                     
                     <button onClick={() => addLesson(mIndex)} className="text-xs font-bold text-indigo-500 flex items-center gap-1 mt-2 hover:underline ml-4">
                        <Plus size={14}/> Add Lesson
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* SECTION 3: SUBMIT */}
      <div className="pt-6 border-t">
         <button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
         >
            {isLoading && <Loader2 className="animate-spin" />}
            {isLoading ? "Creating Course..." : "Create Full Course & Submit"}
         </button>
      </div>

    </div>
  );
}