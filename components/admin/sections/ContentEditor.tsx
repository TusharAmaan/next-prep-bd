"use client";

import { ArrowLeft, Save, Loader2, Link as LinkIcon, FileText, Image as ImageIcon } from "lucide-react";
import RichTextEditor from "./RichTextEditor"; // <--- Import the new editor
import SeoInputSection from "../shared/SeoInputSection";
import ImageInput from "../shared/ImageInput";
import CategorySelector from "../shared/CategorySelector";

// We define 'any' here to match the massive props passed from ContentManager
// In a stricter codebase, you would define an interface for all those props
export default function ContentEditor(props: any) {
  const {
    activeTab,
    isDirty,
    setEditorMode,
    handleSave,
    submitting,
    
    // Form Values
    title, setTitle,
    content, setContent,
    link, setLink,
    type, setType,
    
    // Hierarchy Props
    segments, selectedSegment, handleSegmentClick,
    groups, selectedGroup, handleGroupClick,
    subjects, selectedSubject, handleSubjectClick,
    
    // Other Helpers
    imageMethod, setImageMethod,
    imageFile, setImageFile,
    imageLink, setImageLink,
    categories, category, setCategory, openCategoryModal
  } = props;

  // Helper to determine if we need the Rich Editor
  const showRichEditor = 
    (activeTab === 'materials' && type === 'blog') || 
    (activeTab === 'materials' && type === 'question') || 
    activeTab === 'news' || 
    activeTab === 'ebooks' || 
    activeTab === 'courses' ||
    (activeTab === 'updates' && type === 'routine');

  return (
    <div className="space-y-6 pb-20">
      {/* --- TOP BAR --- */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 -mx-4 px-4 py-4 flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setEditorMode(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="font-bold text-slate-800 text-lg leading-tight">
              {props.editingId ? 'Edit Content' : 'New Content'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="uppercase font-bold tracking-wider">{activeTab}</span>
              {isDirty && <span className="text-amber-600 font-medium">• Unsaved Changes</span>}
            </div>
          </div>
        </div>
        <button 
          onClick={handleSave} 
          disabled={submitting}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-200"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN (MAIN CONTENT) --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-lg font-bold px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
              placeholder="Enter an engaging title..."
            />
          </div>

          {/* 2. Type Selector (Materials/Updates only) */}
          {(activeTab === 'materials' || activeTab === 'updates') && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase w-full mb-1">Content Type</span>
              {activeTab === 'materials' ? (
                 <>
                   {['pdf', 'blog', 'video', 'question'].map((t) => (
                     <button key={t} onClick={() => setType(t)} className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${type === t ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:bg-white/50'}`}>{t}</button>
                   ))}
                 </>
              ) : (
                <>
                   {['routine', 'syllabus', 'exam_result'].map((t) => (
                     <button key={t} onClick={() => setType(t)} className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${type === t ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:bg-white/50'}`}>{t.replace('_', ' ')}</button>
                   ))}
                </>
              )}
            </div>
          )}

          {/* 3. The Editor OR Link Input */}
          {showRichEditor ? (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Body Content</label>
              <RichTextEditor initialContent={content} onChange={setContent} />
            </div>
          ) : (
            <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-blue-800 font-bold">
                 <LinkIcon className="w-4 h-4" /> <span>External Resource Link</span>
              </div>
              <input 
                type="url" 
                value={link} 
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:outline-none focus:border-blue-500 bg-white"
              />
              {/* Optional File Upload Logic could go here too if you handle direct uploads */}
            </div>
          )}

          {/* 4. Course Specifics */}
          {activeTab === 'courses' && (
             <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-slate-500">Instructor</label><input type="text" value={props.instructor} onChange={e => props.setInstructor(e.target.value)} className="w-full p-2 border rounded-lg mt-1" /></div>
                <div><label className="text-xs font-bold text-slate-500">Duration</label><input type="text" value={props.duration} onChange={e => props.setDuration(e.target.value)} className="w-full p-2 border rounded-lg mt-1" /></div>
                <div><label className="text-xs font-bold text-slate-500">Price</label><input type="number" value={props.price} onChange={e => props.setPrice(e.target.value)} className="w-full p-2 border rounded-lg mt-1" /></div>
                <div><label className="text-xs font-bold text-slate-500">Discount</label><input type="number" value={props.discountPrice} onChange={e => props.setDiscountPrice(e.target.value)} className="w-full p-2 border rounded-lg mt-1" /></div>
             </div>
          )}
        </div>

        {/* --- RIGHT COLUMN (SIDEBAR) --- */}
        <div className="space-y-6">
           
           {/* 1. Hierarchy Selectors */}
           {['materials', 'courses', 'updates'].includes(activeTab) && (
             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><FileText className="w-4 h-4"/> Classification</h3>
                
                <div className="space-y-1">
                   <label className="text-xs font-bold text-slate-400">Segment</label>
                   <select value={selectedSegment} onChange={(e) => handleSegmentClick(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                      <option value="">Select Segment...</option>
                      {segments?.map((s:any) => <option key={s.id} value={s.id}>{s.title}</option>)}
                   </select>
                </div>

                {selectedSegment && (
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-400">Group</label>
                     <select value={selectedGroup} onChange={(e) => handleGroupClick(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                        <option value="">Select Group...</option>
                        {groups?.map((g:any) => <option key={g.id} value={g.id}>{g.title}</option>)}
                     </select>
                  </div>
                )}

                {selectedGroup && (
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-400">Subject</label>
                     <select value={selectedSubject} onChange={(e) => handleSubjectClick(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                        <option value="">Select Subject...</option>
                        {subjects?.map((s:any) => <option key={s.id} value={s.id}>{s.title}</option>)}
                     </select>
                  </div>
                )}
             </div>
           )}

           {/* 2. Category */}
           {['ebooks', 'news', 'materials', 'courses'].includes(activeTab) && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                 <CategorySelector 
                    selected={category} 
                    onChange={setCategory} 
                    categories={categories} 
                    onAddNew={openCategoryModal} 
                 />
              </div>
           )}

           {/* 3. Image Input */}
           <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><ImageIcon className="w-4 h-4"/> {activeTab === 'ebooks' ? 'Cover Image' : 'Featured Image'}</h3>
              <ImageInput 
                 method={imageMethod} 
                 setMethod={setImageMethod}
                 file={imageFile}
                 setFile={setImageFile}
                 link={imageLink}
                 setLink={setImageLink}
              />
           </div>

           {/* 4. SEO */}
           <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <SeoInputSection 
                 seoTitle={props.seoTitle} 
                 setSeoTitle={props.setSeoTitle}
                 seoDesc={props.seoDesc}
                 setSeoDesc={props.setSeoDesc}
                 tags={props.tags}
                 setTags={props.setTags}
              />
           </div>

        </div>
      </div>
    </div>
  );
}