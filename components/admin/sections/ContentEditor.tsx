"use client";
import { Editor } from "@tinymce/tinymce-react";
import { 
  ChevronLeft, Save, Upload, Link as LinkIcon, 
  Image as ImageIcon, FileText, X 
} from "lucide-react";

export default function ContentEditor({
  activeTab,
  isDirty, setEditorMode, handleSave, submitting, confirmAction,
  title, setTitle, content, setContent, link, setLink, type, setType, category, setCategory,
  imageMethod, setImageMethod, imageFile, setImageFile, imageLink, setImageLink, file, setFile,
  author, setAuthor, instructor, setInstructor, price, setPrice, discountPrice, setDiscountPrice, duration, setDuration,
  seoTitle, setSeoTitle, seoDesc, setSeoDesc, tags, setTags, markDirty,
  categories, openCategoryModal,
  segments, selectedSegment, handleSegmentClick,
  groups, selectedGroup, handleGroupClick,
  subjects, selectedSubject, handleSubjectClick
}: any) {

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
       
       {/* HEADER */}
       <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-4">
              <button 
                  onClick={() => isDirty ? confirmAction("Discard unsaved changes?", () => setEditorMode(false)) : setEditorMode(false)} 
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors"
              >
                  <ChevronLeft className="w-4 h-4"/> Back to List
              </button>
              {isDirty && <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded">Unsaved Changes</span>}
          </div>
          <button 
              onClick={handleSave} 
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
              {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Save className="w-4 h-4"/>}
              Save Content
          </button>
       </div>

       {/* BODY */}
       <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: MAIN EDITOR */}
          <div className="lg:col-span-2 space-y-6">
              
              {/* Title Input */}
              <div className="space-y-2">
                  <input 
                      className="w-full text-3xl font-black text-slate-800 placeholder:text-slate-300 outline-none border-b border-transparent focus:border-indigo-100 pb-2 transition-all" 
                      placeholder="Type your title here..." 
                      value={title}
                      onChange={e => { setTitle(e.target.value); markDirty(); }}
                  />
              </div>

              {/* RICH TEXT EDITOR (Full Functionality) */}
              <div className="rounded-xl border border-slate-200 overflow-hidden min-h-[500px] shadow-inner">
                  <Editor
                      apiKey="koqq37jhe68hq8n77emqg0hbl97ivgtwz2fvvvnvtwapuur1"
                      value={content}
                      onEditorChange={(c) => { setContent(c); markDirty(); }}
                      init={{
                          height: 500,
                          menubar: true, // Show the File/Edit/View menu bar
                          // Comprehensive Plugin List
                          plugins: [
                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
                            'autosave', 'codesample', 'directionality', 'visualchars'
                          ],
                          // Professional Toolbar layout
                          toolbar: 'undo redo | blocks fontfamily fontsize | ' +
                            'bold italic underline strikethrough forecolor backcolor | ' +
                            'alignleft aligncenter alignright alignjustify | ' +
                            'bullist numlist outdent indent | ' +
                            'link image media table charmap codesample | ' +
                            'superscript subscript | removeformat | fullscreen preview code',
                          content_style: `
                            body { font-family:Inter,sans-serif; font-size:16px; line-height:1.6; color: #334155; }
                            img { max-width: 100%; height: auto; border-radius: 8px; }
                          `,
                          branding: false, // Hides "Powered by Tiny"
                          placeholder: 'Write your content here... Use $$ LaTeX $$ for math equations.',
                          // Math / Code Sample config
                          codesample_languages: [
                            { text: 'HTML/XML', value: 'markup' },
                            { text: 'JavaScript', value: 'javascript' },
                            { text: 'CSS', value: 'css' },
                            { text: 'LaTeX', value: 'latex' }
                          ]
                      }}
                  />
              </div>

              {/* SEO SETTINGS */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span> SEO Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Meta Title</label>
                          <input className="w-full p-2 bg-white border border-slate-200 rounded text-sm outline-none focus:border-indigo-500" value={seoTitle} onChange={e => {setSeoTitle(e.target.value); markDirty()}} />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Tags</label>
                          <input className="w-full p-2 bg-white border border-slate-200 rounded text-sm outline-none focus:border-indigo-500" placeholder="comma, separated" value={tags} onChange={e => {setTags(e.target.value); markDirty()}} />
                      </div>
                      <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-1">Meta Description</label>
                          <textarea className="w-full p-2 bg-white border border-slate-200 rounded text-sm h-20 resize-none outline-none focus:border-indigo-500" value={seoDesc} onChange={e => {setSeoDesc(e.target.value); markDirty()}} />
                      </div>
                  </div>
              </div>
          </div>

          {/* RIGHT COLUMN: CONFIGURATION */}
          <div className="space-y-6">
              
              {/* 1. CONFIG CARD */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                  <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2">Configuration</h3>
                  
                  {/* CONTENT TYPE SELECTOR */}
                  <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Content Type</label>
                      <select 
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-indigo-500 capitalize"
                          value={type}
                          onChange={e => { setType(e.target.value); markDirty(); }}
                      >
                          {activeTab === 'materials' && (
                              <>
                                  <option value="pdf">📄 PDF Document</option>
                                  <option value="blog">✍️ Blog / Article</option>
                                  <option value="video">🎬 Video Lesson</option>
                                  <option value="question">❓ Question Bank</option>
                              </>
                          )}
                          {activeTab === 'segment_updates' && (
                              <>
                                  <option value="routine">📅 Exam Routine</option>
                                  <option value="syllabus">📝 Syllabus</option>
                                  <option value="exam_result">🏆 Exam Result</option>
                              </>
                          )}
                          {activeTab === 'news' && <option value="news">📰 News Article</option>}
                          {activeTab === 'ebooks' && <option value="pdf">📖 eBook (PDF)</option>}
                      </select>
                  </div>

                  {/* 2. TARGET SEGMENT */}
                  {['materials', 'segment_updates', 'courses'].includes(activeTab) && (
                      <div>
                          <label className="block text-xs font-bold text-slate-700 mb-2">
                              Target Segment <span className="text-red-500">*</span>
                          </label>
                          <select 
                              className="w-full p-2.5 bg-white border-2 border-indigo-50 rounded-lg text-sm font-medium focus:border-indigo-500 outline-none"
                              value={selectedSegment}
                              onChange={e => { handleSegmentClick(e.target.value); markDirty(); }}
                          >
                              <option value="">Select Segment...</option>
                              {segments.map((s:any) => <option key={s.id} value={s.id}>{s.title}</option>)}
                          </select>
                      </div>
                  )}

                  {/* 3. FILE UPLOAD */}
                  {(['pdf', 'routine', 'syllabus', 'exam_result'].includes(type) || activeTab === 'ebooks') && (
                      <div>
                          <label className="block text-xs font-bold text-slate-700 mb-2">
                              {activeTab === 'ebooks' ? 'Upload eBook PDF' : 'Attachment (File/Image)'}
                          </label>
                          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors relative group">
                              <input 
                                  type="file" 
                                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                  onChange={e => { 
                                      if(e.target.files?.[0]) { setFile(e.target.files[0]); markDirty(); }
                                  }}
                              />
                              {file ? (
                                  <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold text-sm">
                                      <FileText className="w-4 h-4"/> {file.name}
                                  </div>
                              ) : (
                                  <div className="space-y-1">
                                      <Upload className="w-6 h-6 text-slate-300 mx-auto group-hover:text-indigo-400 transition-colors"/>
                                      <p className="text-xs text-slate-400 font-bold">Click to upload file</p>
                                  </div>
                              )}
                          </div>
                          {/* Fallback Link Input */}
                          <div className="mt-2 flex items-center gap-2">
                             <div className="h-px bg-slate-100 flex-1"></div>
                             <span className="text-[10px] text-slate-400 font-bold">OR LINK</span>
                             <div className="h-px bg-slate-100 flex-1"></div>
                          </div>
                          <input 
                             placeholder="Paste external file URL..." 
                             className="w-full mt-2 p-2 bg-slate-50 border border-slate-200 rounded text-xs outline-none focus:border-indigo-300"
                             value={link}
                             onChange={e => { setLink(e.target.value); markDirty(); }}
                          />
                      </div>
                  )}

                  {/* VIDEO URL INPUT */}
                  {type === 'video' && (
                      <div>
                          <label className="block text-xs font-bold text-slate-700 mb-2">Video URL (YouTube/Vimeo)</label>
                          <input 
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                              placeholder="https://..."
                              value={link}
                              onChange={e => { setLink(e.target.value); markDirty(); }}
                          />
                      </div>
                  )}
              </div>

              {/* HIERARCHY SUB-LEVELS (Materials Only) */}
              {activeTab === 'materials' && selectedSegment && (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filters</h3>
                      <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:border-indigo-500" value={selectedGroup} onChange={e => { handleGroupClick(e.target.value); markDirty(); }}>
                          <option value="">Select Group...</option>
                          {groups.map((g:any) => <option key={g.id} value={g.id}>{g.title}</option>)}
                      </select>
                      {selectedGroup && (
                          <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:border-indigo-500" value={selectedSubject} onChange={e => { handleSubjectClick(e.target.value); markDirty(); }}>
                              <option value="">Select Subject...</option>
                              {subjects.map((s:any) => <option key={s.id} value={s.id}>{s.title}</option>)}
                          </select>
                      )}
                  </div>
              )}

              {/* 3. CATEGORY CARD (For eBooks, News, Blogs, Questions) */}
              {(['ebooks', 'news'].includes(activeTab) || type === 'blog' || type === 'question') && (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</h3>
                          <button onClick={openCategoryModal} className="text-[10px] font-bold text-indigo-600 hover:underline">+ New</button>
                      </div>
                      <select 
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-indigo-500"
                          value={category}
                          onChange={e => { setCategory(e.target.value); markDirty(); }}
                      >
                          <option value="">Select Category...</option>
                          {categories.map((c:any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                  </div>
              )}

              {/* 4. COVER IMAGE (Optional for most) */}
              {activeTab !== 'segment_updates' && type !== 'question' && (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cover Image</h3>
                      {/* Tabs */}
                      <div className="flex bg-slate-100 p-1 rounded-lg">
                          <button onClick={() => setImageMethod('upload')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${imageMethod==='upload' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Upload</button>
                          <button onClick={() => setImageMethod('link')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${imageMethod==='link' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Link</button>
                      </div>

                      {imageMethod === 'upload' ? (
                          <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors relative">
                             <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => { if(e.target.files?.[0]) { setImageFile(e.target.files[0]); markDirty(); } }} />
                             {imageFile ? <p className="text-xs font-bold text-indigo-600 truncate">{imageFile.name}</p> : <ImageIcon className="w-6 h-6 text-slate-300 mx-auto"/>}
                          </div>
                      ) : (
                          <input className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs outline-none focus:border-indigo-500" placeholder="https://..." value={imageLink} onChange={e => { setImageLink(e.target.value); markDirty(); }} />
                      )}
                  </div>
              )}

          </div>
       </div>
    </div>
  );
}