"use client";

import { Editor } from "@tinymce/tinymce-react";
import { 
  ChevronLeft, Save, Upload, Link as LinkIcon, 
  Image as ImageIcon, FileText, Globe, Clock, User,
  HelpCircle, Video, BookOpen, File
} from "lucide-react";

// Define the interface for props to ensure type safety
interface TutorEditorProps {
  // Mode
  mode: 'course' | 'resource'; 
  isDirty: boolean;
  submitting: boolean;
  onSave: () => void;
  onCancel: () => void;

  // Content Fields
  title: string; setTitle: (v: string) => void;
  slug: string; setSlug: (v: string) => void;
  generateSlug: () => void;
  content: string; setContent: (v: string) => void;
  
  // Resource Specifics
  type?: string; setType?: (v: string) => void; // blog, video, pdf, question
  link?: string; setLink?: (v: string) => void; // For external video/pdf links
  file?: File | null; setFile?: (f: File | null) => void; // For uploading PDFs directly
  
  // Hierarchy Data
  segments: any[]; selectedSegment: string; handleSegmentClick: (id: string) => void;
  groups: any[]; selectedGroup: string; handleGroupClick: (id: string) => void;
  subjects: any[]; selectedSubject: string; handleSubjectClick: (id: string) => void;

  // Course Specifics
  price?: string; setPrice?: (v: string) => void;
  discountPrice?: string; setDiscountPrice?: (v: string) => void;
  duration?: string; setDuration?: (v: string) => void;
  instructor?: string; setInstructor?: (v: string) => void;

  // Media (Thumbnail)
  imageMethod: 'upload' | 'link'; setImageMethod: (v: 'upload' | 'link') => void;
  imageFile: File | null; setImageFile: (f: File | null) => void;
  imageLink: string; setImageLink: (v: string) => void;

  // SEO
  seoTitle: string; setSeoTitle: (v: string) => void;
  seoDesc: string; setSeoDesc: (v: string) => void;
  tags: string; setTags: (v: string) => void;
  markDirty: () => void;
}

export default function TutorContentEditor({
  mode, isDirty, submitting, onSave, onCancel,
  title, setTitle, slug, setSlug, generateSlug, content, setContent,
  type, setType, link, setLink, file, setFile,
  segments, selectedSegment, handleSegmentClick,
  groups, selectedGroup, handleGroupClick,
  subjects, selectedSubject, handleSubjectClick,
  price, setPrice, discountPrice, setDiscountPrice, duration, setDuration, instructor, setInstructor,
  imageMethod, setImageMethod, imageFile, setImageFile, imageLink, setImageLink,
  seoTitle, setSeoTitle, seoDesc, setSeoDesc, tags, setTags, markDirty
}: TutorEditorProps) {

  // --- HELPER: Dynamic URL Prefix Display ---
  const getUrlPrefix = () => {
    if (mode === 'course') return 'courses/';
    if (type === 'question') return 'question/';
    return 'resources/';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
       
       {/* HEADER */}
       <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-4">
              <button 
                  onClick={onCancel} 
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors"
              >
                  <ChevronLeft className="w-4 h-4"/> Back
              </button>
              {isDirty && (
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 animate-pulse">
                  Unsaved Changes
                </span>
              )}
          </div>
          <button 
              onClick={onSave} 
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
              {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Save className="w-4 h-4"/>}
              {mode === 'course' ? 'Create Course' : 'Submit Resource'}
          </button>
       </div>

       {/* BODY */}
       <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: EDITOR & MAIN INFO */}
          <div className="lg:col-span-2 space-y-6">
              
              {/* Title Input */}
              <div className="space-y-4">
                  <input 
                      className="w-full text-3xl font-black text-slate-800 placeholder:text-slate-300 outline-none border-b border-transparent focus:border-indigo-100 pb-2 transition-all" 
                      placeholder={mode === 'course' ? "e.g. Complete HSC Physics Mastery" : "e.g. Chapter 5: Vector Dynamics Note"}
                      value={title}
                      onChange={e => { setTitle(e.target.value); markDirty(); }}
                      onBlur={() => { if(!slug) generateSlug(); }} 
                  />
                  
                  {/* Slug / Permalink */}
                  <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
                      <div className="flex items-center pl-3 pr-2 py-2.5 bg-slate-100 border-r border-slate-200">
                          <Globe className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0"/>
                          <span className="text-xs font-bold text-slate-500 whitespace-nowrap select-none">
                              nextprepbd.com/{getUrlPrefix()}
                          </span>
                      </div>
                      <input 
                          className="flex-1 bg-transparent text-sm font-bold text-slate-700 px-3 py-2 outline-none placeholder:text-slate-300 min-w-0"
                          placeholder="url-slug"
                          value={slug}
                          onChange={e => { setSlug(e.target.value); markDirty(); }}
                      />
                      <button 
                          onClick={generateSlug} 
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-2.5 border-l border-slate-200 transition-colors whitespace-nowrap"
                      >
                          Generate
                      </button>
                  </div>
              </div>

              {/* TinyMCE Editor */}
              <div className="rounded-xl border border-slate-200 overflow-hidden min-h-[500px] shadow-sm hover:shadow-md transition-shadow">
                  <Editor
                      apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "koqq37jhe68hq8n77emqg0hbl97ivgtwz2fvvvnvtwapuur1"}
                      value={content}
                      onEditorChange={(c) => { setContent(c); markDirty(); }}
                      init={{
                          height: 500,
                          menubar: true,
                          plugins: [
                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
                            'autosave', 'codesample', 'directionality', 'visualchars'
                          ],
                          toolbar: 'undo redo | blocks fontfamily fontsize | ' +
                            'bold italic underline strikethrough forecolor backcolor | ' +
                            'insertMath | ' + 
                            'alignleft aligncenter alignright alignjustify | ' +
                            'bullist numlist outdent indent | ' +
                            'link image media table charmap codesample | ' +
                            'superscript subscript | removeformat | fullscreen preview code',
                          content_style: `body { font-family:Inter,sans-serif; font-size:16px; line-height:1.6; color: #334155; } img { max-width: 100%; height: auto; border-radius: 8px; } .math-tex { background: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-family: monospace; color: #6366f1; }`,
                          branding: false,
                          placeholder: 'Write full content details... Use the Σ Math button for equations.',
                          setup: (editor: any) => {
                            editor.ui.registry.addButton('insertMath', {
                              text: 'Σ Inline',
                              tooltip: 'Insert Inline Math',
                              onAction: () => editor.insertContent('<span class="math-tex">\\( x = y^2 \\)</span>&nbsp;')
                            });
                          }
                      }}
                  />
                  <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex gap-2">
                    <span className="font-bold">💡 Tip:</span> 
                    <span>Use <b>Σ Inline</b> for math. {mode === 'resource' && type === 'video' && 'For videos, provide the description here and paste the link on the right.'}</span>
                  </div>
              </div>

              {/* SEO Settings (Collapsed visually for Tutors) */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Search Engine Optimization</h3>
                  <div className="grid grid-cols-1 gap-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">SEO Title (Optional)</label>
                          <input className="w-full p-2 bg-white border border-slate-200 rounded text-sm outline-none focus:border-indigo-500" value={seoTitle} onChange={e => {setSeoTitle(e.target.value); markDirty()}} placeholder={title} />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Meta Description</label>
                          <textarea className="w-full p-2 bg-white border border-slate-200 rounded text-sm h-20 resize-none outline-none focus:border-indigo-500" value={seoDesc} onChange={e => {setSeoDesc(e.target.value); markDirty()}} placeholder="Brief summary of this content..." />
                      </div>
                  </div>
              </div>
          </div>

          {/* RIGHT COLUMN: CONFIGURATION */}
          <div className="space-y-6">
              
              {/* 1. CLASSIFICATION (Segment/Group/Subject) */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2">
                    Classify Content
                  </h3>

                  {/* Resource Type Selector (Only for Resources) */}
                  {mode === 'resource' && setType && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Content Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'blog', label: 'Article', icon: FileText },
                          { id: 'video', label: 'Video', icon: Video },
                          { id: 'pdf', label: 'PDF Note', icon: BookOpen },
                          { id: 'question', label: 'Quiz/Q&A', icon: HelpCircle },
                        ].map((t) => (
                           <button 
                             key={t.id}
                             onClick={() => { setType(t.id); markDirty(); }}
                             className={`flex items-center justify-center gap-2 p-2 rounded-lg border text-xs font-bold transition-all ${
                               type === t.id 
                               ? 'bg-indigo-600 border-indigo-600 text-white' 
                               : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                             }`}
                           >
                              <t.icon size={14} /> {t.label}
                           </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Segment/Subject Logic */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Segment <span className="text-red-500">*</span></label>
                    <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500" value={selectedSegment} onChange={e => { handleSegmentClick(e.target.value); markDirty(); }}>
                        <option value="">Select Segment...</option>
                        {segments.map((s:any) => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                  </div>

                  {selectedSegment && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                       <div>
                          <label className="block text-xs font-bold text-slate-700 mb-2">Group (Optional)</label>
                          <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500" value={selectedGroup} onChange={e => { handleGroupClick(e.target.value); markDirty(); }}>
                              <option value="">No specific group</option>
                              {groups.map((g:any) => <option key={g.id} value={g.id}>{g.title}</option>)}
                          </select>
                       </div>
                       {selectedGroup && (
                         <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2">Subject (Optional)</label>
                            <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500" value={selectedSubject} onChange={e => { handleSubjectClick(e.target.value); markDirty(); }}>
                                <option value="">No specific subject</option>
                                {subjects.map((s:any) => <option key={s.id} value={s.id}>{s.title}</option>)}
                            </select>
                         </div>
                       )}
                    </div>
                  )}
              </div>

              {/* 2. FILE / LINK UPLOAD (For Video or PDF) */}
              {mode === 'resource' && (type === 'pdf' || type === 'video') && (
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2">
                       {type === 'pdf' ? 'Upload Document' : 'Video Source'}
                    </h3>
                    
                    {type === 'pdf' && setFile && (
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors relative">
                             <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => { if(e.target.files?.[0]) { setFile(e.target.files[0]); markDirty(); } }} />
                             {file ? (
                                 <div className="flex flex-col items-center gap-2">
                                     <File className="w-8 h-8 text-red-500"/>
                                     <span className="text-sm font-bold text-slate-700 truncate max-w-full px-2">{file.name}</span>
                                     <span className="text-xs text-green-600 font-bold">Ready to upload</span>
                                 </div>
                             ) : (
                                 <div className="space-y-1">
                                     <Upload className="w-8 h-8 text-slate-300 mx-auto"/>
                                     <p className="text-xs text-slate-400 font-bold">Click to upload PDF</p>
                                 </div>
                             )}
                        </div>
                    )}

                    {type === 'video' && setLink && (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2">YouTube / Vimeo Link</label>
                            <input className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium" placeholder="https://youtube.com/watch?v=..." value={link} onChange={e => { setLink(e.target.value); markDirty(); }} />
                        </div>
                    )}
                 </div>
              )}

              {/* 3. COURSE SPECIFICS (Only for Course Mode) */}
              {mode === 'course' && (
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2">
                       Course Details
                    </h3>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Duration</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                            <input className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none" placeholder="e.g. 12 Hours" value={duration} onChange={e => {setDuration?.(e.target.value); markDirty()}} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Price (৳)</label>
                            <input className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none" placeholder="0" value={price} onChange={e => {setPrice?.(e.target.value); markDirty()}} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Discount (৳)</label>
                            <input className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none" placeholder="0" value={discountPrice} onChange={e => {setDiscountPrice?.(e.target.value); markDirty()}} />
                        </div>
                    </div>

                    <div>
                         <label className="block text-xs font-bold text-slate-500 mb-1">Instructor Name</label>
                         <div className="relative">
                             <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                             <input className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none" placeholder="Your Name" value={instructor} onChange={e => {setInstructor?.(e.target.value); markDirty()}} />
                         </div>
                    </div>
                 </div>
              )}

              {/* 4. COVER IMAGE */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {mode === 'course' ? 'Course Thumbnail' : 'Cover Image'}
                  </h3>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                      <button onClick={() => { setImageMethod('upload'); markDirty(); }} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${imageMethod==='upload' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Upload</button>
                      <button onClick={() => { setImageMethod('link'); markDirty(); }} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${imageMethod==='link' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Link</button>
                  </div>
                  {imageMethod === 'upload' ? (
                      <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors relative group">
                          <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => { if(e.target.files?.[0]) { setImageFile(e.target.files[0]); markDirty(); } }} />
                          {imageFile ? (
                             <div className="relative z-10">
                                <p className="text-xs font-bold text-indigo-600 truncate">{imageFile.name}</p>
                                <p className="text-[10px] text-green-500">Image selected</p>
                             </div>
                          ) : (
                             <div className="relative z-10">
                               <ImageIcon className="w-6 h-6 text-slate-300 mx-auto mb-2 group-hover:text-indigo-400 transition-colors"/>
                               <p className="text-xs text-slate-400 font-bold">Click to upload image</p>
                             </div>
                          )}
                      </div>
                  ) : (
                      <input className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs" placeholder="https://image-url.com..." value={imageLink} onChange={e => { setImageLink(e.target.value); markDirty(); }} />
                  )}
              </div>

          </div>
       </div>
    </div>
  );
}