'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client'; // Client-side for fetching dropdowns
import { createResource, createCourse } from '@/app/actions/tutor';
import { Loader2, FileText, Layers, AlertCircle } from 'lucide-react';
import RichTextEditor from '@/components/shared/RichTextEditor'; // Your existing component

export default function CreateContentPage() {
  const [activeTab, setActiveTab] = useState<'resource' | 'course'>('resource');
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Content</h1>

      {/* TABS SWITCHER */}
      <div className="flex gap-4 border-b mb-8">
        <button
          onClick={() => setActiveTab('resource')}
          className={`pb-3 px-4 flex items-center gap-2 font-medium transition-colors ${
            activeTab === 'resource' 
              ? 'border-b-2 border-indigo-600 text-indigo-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={18} />
          Single Resource (Blog/PDF/Video)
        </button>
        <button
          onClick={() => setActiveTab('course')}
          className={`pb-3 px-4 flex items-center gap-2 font-medium transition-colors ${
            activeTab === 'course' 
              ? 'border-b-2 border-indigo-600 text-indigo-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layers size={18} />
          Full Course Series
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        {activeTab === 'resource' ? <ResourceForm /> : <CourseForm />}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// SUB-COMPONENT 1: Resource Form (Complex Dropdowns + TinyMCE)
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
    supabase.from('segments').select('id, title').then(({ data }: { data: any }) => { // <--- Added type here
      if (data) setSegments(data);
    });
  }, []);

  // 2. Load Groups
  useEffect(() => {
    if (!selectedSegment) return;
    setGroups([]); 
    setSubjects([]);
    supabase.from('groups').select('id, title').eq('segment_id', selectedSegment)
      .then(({ data }: { data: any }) => { // <--- Added type here
         if (data) setGroups(data);
      });
  }, [selectedSegment]);

  // 3. Load Subjects
  useEffect(() => {
    if (!selectedGroup) return;
    supabase.from('subjects').select('id, title').eq('group_id', selectedGroup)
      .then(({ data }: { data: any }) => { // <--- Added type here
         if (data) setSubjects(data);
      });
  }, [selectedGroup]);

  // 4. Handle Submit
  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setErrorMsg('');
    
    // Append the TinyMCE content manually since it's state, not an input
    formData.append('content', editorContent);
    formData.append('segment_id', selectedSegment);

    // Call Server Action
    const result = await createResource(formData);
    
    if (result?.error) {
      setErrorMsg(result.error);
      setIsLoading(false);
    }
    // If success, the server action redirects automatically
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

      {/* Cascading Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
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

      {/* TinyMCE Editor */}
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
// SUB-COMPONENT 2: Course Form (Simple Start)
// ------------------------------------------------------------------
function CourseForm() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleCourseSubmit(formData: FormData) {
    setIsLoading(true);
    const result = await createCourse(formData);
    if (result?.error) {
      alert(result.error);
      setIsLoading(false);
    }
  }

  return (
    <form action={handleCourseSubmit} className="space-y-6">
      <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm mb-4">
        <strong>Note:</strong> Creating a course here only sets up the "Container". You will add modules, lessons, and quizzes in the next step.
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
        <input name="title" type="text" className="w-full border p-2 rounded-lg" required />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
        <textarea name="description" className="w-full border p-2 rounded-lg h-24" required />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Price (Leave empty for Free)</label>
        <input name="price" type="text" className="w-full border p-2 rounded-lg" placeholder="e.g. ৳500" />
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 flex justify-center items-center gap-2"
      >
        {isLoading && <Loader2 className="animate-spin" size={20} />}
        Create Course & Add Lessons
      </button>
    </form>
  );
}