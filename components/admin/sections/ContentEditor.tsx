"use client";
import { useState, memo } from "react";
import dynamic from 'next/dynamic';
import 'suneditor/dist/css/suneditor.min.css';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import SeoInputSection from "../shared/SeoInputSection";
import ImageInput from "../shared/ImageInput";
import CategorySelector from "../shared/CategorySelector";

// Load SunEditor dynamically to avoid SSR issues
const SunEditor = dynamic(() => import("suneditor-react"), { ssr: false });

const editorOptions: any = {
    minHeight: "600px", height: "auto", placeholder: "Start content creation...",
    buttonList: [
        ['undo', 'redo'], ['save', 'template'], ['font', 'fontSize', 'formatBlock'],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'], ['removeFormat'],
        ['fontColor', 'hiliteColor', 'textStyle'], ['outdent', 'indent'],
        ['align', 'horizontalRule', 'list', 'lineHeight'], ['table', 'link', 'image', 'video', 'math'],
        ['fullScreen', 'showBlocks', 'codeView', 'preview']
    ],
    mode: "classic", attributesWhitelist: { all: "style" },
    defaultStyle: "font-family: 'Inter', sans-serif; font-size: 16px; line-height: 1.6; color: #334155;",
    resizingBar: true, showPathLabel: true, katex: katex
};

const MemoizedSunEditor = memo(({ content, onChange }: { content: string, onChange: (c: string) => void }) => {
    return <SunEditor setContents={content} onChange={onChange} setOptions={editorOptions} />;
});
MemoizedSunEditor.displayName = "MemoizedSunEditor";

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
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-slide-up">
            {/* TOOLBAR */}
            <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                <button onClick={() => isDirty ? confirmAction("Discard changes?", () => setEditorMode(false)) : setEditorMode(false)} className="text-slate-500 hover:text-slate-800 font-bold text-sm flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200/50 transition-colors">← Back to List</button>
                <div className="flex gap-3 items-center">
                    {isDirty && <span className="text-xs font-bold text-orange-500 uppercase tracking-wide animate-pulse">Unsaved Changes</span>}
                    <button onClick={handleSave} disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all transform active:scale-95">{submitting ? "Saving..." : "Save Content"}</button>
                </div>
            </div>

            <div className="p-10 w-full max-w-[1800px] mx-auto">
                <div className="flex flex-col lg:flex-row gap-10 w-full">
                    {/* LEFT: MAIN CONTENT */}
                    <div className="w-full lg:w-[75%] space-y-8">
                        <input className="text-5xl font-black w-full bg-transparent border-b-2 border-gray-100 pb-6 outline-none placeholder-gray-300 text-slate-800 focus:border-indigo-500 transition-colors" placeholder="Type your title here..." value={title} onChange={e => { setTitle(e.target.value); markDirty(); }} />

                        {/* Conditional Editors */}
                        {['blog', 'question', 'ebook', 'course', 'update', 'news'].includes(activeTab === 'materials' ? type : (activeTab === 'updates' ? 'update' : (activeTab === 'courses' ? 'course' : (activeTab === 'ebooks' ? 'ebook' : (activeTab === 'news' ? 'news' : ''))))) && (
                            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm"><MemoizedSunEditor content={content} onChange={(c: string) => { setContent(c); markDirty(); }} /></div>
                        )}

                        {/* File Inputs for PDF/Video */}
                        {activeTab === 'materials' && (type === 'pdf' || type === 'video') && (
                            <div className="bg-gray-50/50 p-8 rounded-2xl border border-dashed border-gray-300 hover:border-indigo-300 transition-colors">
                                <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-widest">Source Material</h4>
                                {type === 'pdf' && <div className="p-10 text-center relative cursor-pointer group"><input type="file" onChange={e => { setFile(e.target.files?.[0] || null); markDirty(); }} className="absolute inset-0 opacity-0 cursor-pointer" /><span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">📂</span><p className="text-sm font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">{file ? file.name : "Click to Upload PDF Document"}</p></div>}
                                {type === 'video' && <input className="w-full bg-white border border-gray-200 p-4 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" value={link} onChange={e => { setLink(e.target.value); markDirty(); }} placeholder="Paste YouTube Embed Link..." />}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: SIDEBAR SETTINGS */}
                    <div className="w-full lg:w-[25%] space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                            <h4 className="text-xs font-black uppercase text-indigo-900 tracking-widest border-b border-gray-100 pb-4">Configuration</h4>

                            {/* Type Selector */}
                            {activeTab === 'materials' && <div><label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Content Type</label><select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500" value={type} onChange={e => { setType(e.target.value); markDirty(); }}><option value="pdf">📄 PDF Document</option><option value="video">🎬 Video Lecture</option><option value="question">❓ Question Bank</option><option value="blog">✍️ Class Blog</option></select></div>}
                            {activeTab === 'updates' && <div><label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Update Type</label><select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500" value={type} onChange={e => { setType(e.target.value); markDirty(); }}><option value="routine">📅 Routine</option><option value="syllabus">📝 Syllabus</option><option value="exam_result">🏆 Exam Result</option></select></div>}

                            {/* Question Category */}
                            {activeTab === 'materials' && type === 'question' && (
                                <div className="mt-4 animate-fade-in">
                                    <CategorySelector label="Question Category" value={category} onChange={setCategory} context="question" categories={categories} openModal={openCategoryModal} markDirty={markDirty} />
                                </div>
                            )}

                            {/* Hierarchy */}
                            {['materials', 'updates', 'courses'].includes(activeTab) && (
                                <div className="space-y-4">
                                    <div><label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Hierarchy</label><select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold text-slate-700 mb-2 outline-none focus:ring-2 focus:ring-indigo-500" value={selectedSegment} onChange={e => { handleSegmentClick(e.target.value); markDirty(); }}><option value="">Select Segment</option>{segments.map((s:any) => <option key={s.id} value={s.id}>{s.title}</option>)}</select>
                                        {activeTab !== 'updates' && (
                                            <>
                                                <select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold text-slate-700 mb-2 outline-none focus:ring-2 focus:ring-indigo-500" value={selectedGroup} onChange={e => { handleGroupClick(e.target.value); markDirty(); }} disabled={!selectedSegment}><option value="">Select Group</option>{groups.map((g:any) => <option key={g.id} value={g.id}>{g.title}</option>)}</select>
                                                <select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={selectedSubject} onChange={e => { handleSubjectClick(e.target.value); markDirty(); }} disabled={!selectedGroup}><option value="">Select Subject</option>{subjects.map((s:any) => <option key={s.id} value={s.id}>{s.title}</option>)}</select>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Category Selectors */}
                            {(activeTab === 'news' || activeTab === 'ebooks' || (activeTab === 'materials' && type === 'blog') || activeTab === 'courses') && (
                                <CategorySelector label="Category" value={category} onChange={setCategory} context={activeTab === 'materials' ? 'blog' : activeTab === 'courses' ? 'course' : activeTab === 'ebooks' ? 'ebook' : 'news'} categories={categories} openModal={openCategoryModal} markDirty={markDirty} />
                            )}

                            {/* Extra Fields */}
                            {activeTab === 'ebooks' && (<div className="space-y-4"><div><label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Author</label><input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={author} onChange={e => { setAuthor(e.target.value); markDirty(); }} /></div><div><label className="text-xs font-bold text-slate-500 block mb-2 uppercase">PDF Direct Link</label><input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={link} onChange={e => { setLink(e.target.value); markDirty(); }} /></div></div>)}
                            {activeTab === 'courses' && (
                                <div className="space-y-4">
                                    <div><label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Instructor Name</label><input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={instructor} onChange={e => { setInstructor(e.target.value); markDirty(); }} /></div>
                                    <div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Price (BDT)</label><input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={price} onChange={e => { setPrice(e.target.value); markDirty(); }} /></div><div><label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Discount</label><input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={discountPrice} onChange={e => { setDiscountPrice(e.target.value); markDirty(); }} /></div></div>
                                    <div><label className="text-xs font-bold text-slate-500 block mb-2 uppercase">Enrollment Link</label><input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" value={link} onChange={e => { setLink(e.target.value); markDirty(); }} /></div>
                                </div>
                            )}
                        </div>

                        {/* Cover Image */}
                        {(activeTab === 'news' || activeTab === 'ebooks' || activeTab === 'courses' || (activeTab === 'materials' && type === 'blog')) && (
                            <ImageInput label={activeTab === 'courses' ? "Thumbnail" : "Cover Image"} method={imageMethod} setMethod={setImageMethod} file={imageFile} setFile={setImageFile} link={imageLink} setLink={setImageLink} markDirty={markDirty} optional={activeTab === 'courses'} />
                        )}

                        <SeoInputSection title={seoTitle} setTitle={setSeoTitle} tags={tags} setTags={setTags} desc={seoDesc} setDesc={setSeoDesc} markDirty={markDirty} />
                    </div>
                </div>
            </div>
        </div>
    );
}