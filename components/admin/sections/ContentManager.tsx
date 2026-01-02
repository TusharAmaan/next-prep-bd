"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import ListHeader from "../shared/ListHeader";
import ContentFilterBar from "../shared/ContentFilterBar";
import ContentEditor from "./ContentEditor";
import PostLikersModal from "@/components/PostLikersModal"; // <--- 1. IMPORT MODAL

// Helper for sortable headers
const SortableHeader = ({ label, sortKey, currentSort, setSort }: any) => (
    <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition select-none group" onClick={() => setSort({ key: sortKey, direction: currentSort.key === sortKey && currentSort.direction === 'asc' ? 'desc' : 'asc' })}>
        <div className="flex items-center gap-1">{label}<span className={`text-[10px] text-slate-400 flex flex-col leading-[6px] ${currentSort.key === sortKey ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}><span className={currentSort.key === sortKey && currentSort.direction === 'asc' ? 'text-blue-600' : ''}>▲</span><span className={currentSort.key === sortKey && currentSort.direction === 'desc' ? 'text-blue-600' : ''}>▼</span></span></div>
    </th>
);

export default function ContentManager({
    activeTab, 
    segments, groups, subjects, categories,
    fetchGroups, fetchSubjects, 
    showSuccess, showError, confirmAction,
    openCategoryModal
}: any) {
    
    // --- LOCAL STATE ---
    const [dataList, setDataList] = useState<any[]>([]);
    const [editorMode, setEditorMode] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [totalCount, setTotalCount] = useState(0);
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    
    const [dateFilter, setDateFilter] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [updateTypeFilter, setUpdateTypeFilter] = useState("all");
    const [catFilter, setCatFilter] = useState("all");
    
    // Hierarchy Filters
    const [selSeg, setSelSeg] = useState("");
    const [selGrp, setSelGrp] = useState("");
    const [selSub, setSelSub] = useState("");

    // --- FORM STATE ---
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [link, setLink] = useState("");
    const [type, setType] = useState("pdf");
    const [category, setCategory] = useState("");
    const [imageMethod, setImageMethod] = useState<'upload'|'link'>('upload');
    const [imageFile, setImageFile] = useState<File|null>(null);
    const [imageLink, setImageLink] = useState("");
    const [file, setFile] = useState<File|null>(null);
    const [author, setAuthor] = useState("");
    const [instructor, setInstructor] = useState("");
    const [price, setPrice] = useState("");
    const [discountPrice, setDiscountPrice] = useState("");
    const [duration, setDuration] = useState("");
    const [seoTitle, setSeoTitle] = useState("");
    const [seoDesc, setSeoDesc] = useState("");
    const [tags, setTags] = useState("");

    // Use these for the EDITOR selection (separate from filters)
    const [editSeg, setEditSeg] = useState("");
    const [editGrp, setEditGrp] = useState("");
    const [editSub, setEditSub] = useState("");
    
    // This state was already here, now we will use it!
    const [showLikers, setShowLikers] = useState<{id: string, title: string} | null>(null);
    
    const markDirty = () => setIsDirty(true);

    const resetForms = () => {
        setEditingId(null); setTitle(""); setContent(""); setLink(""); setType(activeTab === 'updates' ? 'routine' : 'pdf'); setCategory("");
        setImageMethod('upload'); setImageFile(null); setImageLink(""); setFile(null);
        setAuthor(""); setInstructor(""); setPrice(""); setDiscountPrice(""); setDuration("");
        setSeoTitle(""); setSeoDesc(""); setTags("");
        setEditSeg(""); setEditGrp(""); setEditSub("");
        setIsDirty(false);
    };

    // --- FETCH DATA ---
    const fetchContent = useCallback(async () => {
        let tableName = "";
        if (activeTab === 'materials') tableName = "resources";
        else if (activeTab === 'news') tableName = "news";
        else if (activeTab === 'ebooks') tableName = "ebooks";
        else if (activeTab === 'courses') tableName = "courses";
        else if (activeTab === 'updates') tableName = "segment_updates";

        let query = supabase.from(tableName).select("*", { count: 'exact' });

        if (['materials', 'updates', 'courses'].includes(activeTab)) {
            if (selSub) query = query.eq("subject_id", selSub);
            else if (selGrp) query = query.eq("group_id", selGrp);
            else if (selSeg) query = query.eq("segment_id", selSeg);
        }

        if (activeTab === 'updates' && selSeg) { query = query.eq("segment_id", selSeg); }

        if (activeTab === 'materials' && typeFilter !== 'all') query = query.eq("type", typeFilter);
        if (activeTab === 'updates' && updateTypeFilter !== 'all') query = query.eq("type", updateTypeFilter);
        if ((activeTab === 'ebooks' || activeTab === 'news') && catFilter !== 'all') query = query.eq("category", catFilter);
        if (search) query = query.ilike("title", `%${search}%`);

        const from = page * itemsPerPage;
        const to = from + itemsPerPage - 1;
        const { data, count, error } = await query.range(from, to).order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });

        if (!error && data) {
            setDataList(data);
            if (count !== null) setTotalCount(count);
        }
    }, [activeTab, selSeg, selGrp, selSub, search, typeFilter, updateTypeFilter, catFilter, page, itemsPerPage, sortConfig]);

    useEffect(() => { 
        setPage(0); 
        fetchContent(); 
    }, [activeTab, fetchContent]);

    // --- ACTIONS ---
    const handleAddNew = () => {
        resetForms();
        if (activeTab === 'materials') setType('pdf');
        else if (activeTab === 'updates') setType('routine');
        setEditorMode(true);
    };

    const handleEdit = (item: any) => {
        resetForms();
        setEditingId(item.id); setTitle(item.title);
        setSeoTitle(item.seo_title || ""); setSeoDesc(item.seo_description || ""); setTags(item.tags?.join(", ") || "");

        if (activeTab === 'materials') {
            setType(item.type); setLink(item.content_url || "");
            if (item.type === 'blog' || item.type === 'question') setContent(item.content_body || "");
            if (item.category) setCategory(item.category);
            if (item.content_url && item.type === 'blog') { setImageLink(item.content_url); setImageMethod('link'); }
        } else if (activeTab === 'news') {
            setContent(item.content || ""); setCategory(item.category);
            if (item.image_url) { setImageLink(item.image_url); setImageMethod('link'); }
        } else if (activeTab === 'ebooks') {
            setAuthor(item.author); setCategory(item.category); setContent(item.description || ""); setLink(item.pdf_url || "");
            if (item.cover_url) { setImageLink(item.cover_url); setImageMethod('link'); }
        } else if (activeTab === 'courses') {
            setInstructor(item.instructor); setPrice(item.price); setDiscountPrice(item.discount_price); setDuration(item.duration); setLink(item.enrollment_link); setContent(item.description || ""); setCategory(item.category);
            if (item.thumbnail_url) { setImageLink(item.thumbnail_url); setImageMethod('link'); }
        } else if (activeTab === 'updates') {
            setType(item.type); setContent(item.content_body || "");
        }

        // Set Hierarchy Selectors
        if (item.segment_id) { setEditSeg(String(item.segment_id)); fetchGroups(String(item.segment_id)); }
        if (item.group_id) { setEditGrp(String(item.group_id)); fetchSubjects(String(item.group_id)); }
        if (item.subject_id) setEditSub(String(item.subject_id));

        setEditorMode(true);
    };

    const handleDelete = (id: number) => {
        let table = activeTab === 'materials' ? 'resources' : activeTab === 'updates' ? 'segment_updates' : activeTab;
        confirmAction("Delete this item?", async () => {
            await supabase.from(table).delete().eq("id", id);
            fetchContent();
            showSuccess("Deleted!");
        });
    };

    const handleSave = async () => {
        if (!title) return showError("Title is required");
        setSubmitting(true);

        let payload: any = {
            title,
            seo_title: seoTitle || title,
            seo_description: seoDesc,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean)
        };

        let contentUrl: string | null = link; 
        let coverUrl: string | null = null; 

        // 1. Upload Cover Image
        if (imageMethod === 'upload' && imageFile) {
            const name = `img-${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
            const { data } = await supabase.storage.from('materials').upload(name, imageFile);
            if (data) {
                const publicUrl = supabase.storage.from('materials').getPublicUrl(name).data.publicUrl;
                coverUrl = publicUrl;
                if (activeTab === 'materials' && type === 'blog') contentUrl = publicUrl;
                if (activeTab === 'news') payload.image_url = publicUrl;
            }
        } else if (imageMethod === 'link' && imageLink) {
            coverUrl = imageLink;
            if (activeTab === 'materials' && type === 'blog') contentUrl = imageLink;
        }

        // 2. Upload Content File
        if (file) {
            const name = `file-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
            const { data } = await supabase.storage.from('materials').upload(name, file);
            if (data) contentUrl = supabase.storage.from('materials').getPublicUrl(name).data.publicUrl;
        }

        if (activeTab === 'materials') {
            payload.type = type;
            payload.segment_id = editSeg ? Number(editSeg) : null;
            payload.group_id = editGrp ? Number(editGrp) : null;
            payload.subject_id = editSub ? Number(editSub) : null;
            if (type === 'blog') { payload.content_body = content; payload.content_url = contentUrl; payload.category = category; }
            else if (type === 'question') { payload.content_body = content; payload.category = category; }
            else { payload.content_url = contentUrl; }
        } else if (activeTab === 'news') {
            payload.content = content; payload.category = category;
            if (coverUrl) payload.image_url = coverUrl;
        } else if (activeTab === 'ebooks') {
            payload.author = author; payload.category = category; payload.description = content;
            payload.pdf_url = contentUrl; 
            if (coverUrl) payload.cover_url = coverUrl;
        } else if (activeTab === 'courses') {
            payload.instructor = instructor; payload.price = price; payload.discount_price = discountPrice; payload.duration = duration; payload.enrollment_link = link; payload.description = content; payload.category = category;
            if (coverUrl) payload.thumbnail_url = coverUrl;
        } else if (activeTab === 'updates') {
            payload.type = type; payload.content_body = content;
            if (contentUrl) payload.attachment_url = contentUrl;
            payload.segment_id = editSeg ? Number(editSeg) : null;
        }

        const table = activeTab === 'materials' ? 'resources' : activeTab === 'updates' ? 'segment_updates' : activeTab;
        let error;

        if (editingId) {
            const res = await supabase.from(table).update(payload).eq('id', editingId);
            error = res.error;
        } else {
            const res = await supabase.from(table).insert([payload]);
            error = res.error;
        }

        setSubmitting(false);
        if (error) showError(error.message);
        else {
            setIsDirty(false);
            setEditorMode(false);
            fetchContent();
            showSuccess("Saved Successfully!");
        }
    };

    if (editorMode) {
        return (
            <ContentEditor 
                activeTab={activeTab}
                isDirty={isDirty} setEditorMode={setEditorMode} handleSave={handleSave} submitting={submitting} confirmAction={confirmAction}
                title={title} setTitle={setTitle} content={content} setContent={setContent} link={link} setLink={setLink} type={type} setType={setType} category={category} setCategory={setCategory}
                imageMethod={imageMethod} setImageMethod={setImageMethod} imageFile={imageFile} setImageFile={setImageFile} imageLink={imageLink} setImageLink={setImageLink} file={file} setFile={setFile}
                author={author} setAuthor={setAuthor} instructor={instructor} setInstructor={setInstructor} price={price} setPrice={setPrice} discountPrice={discountPrice} setDiscountPrice={setDiscountPrice} duration={duration} setDuration={setDuration}
                seoTitle={seoTitle} setSeoTitle={setSeoTitle} seoDesc={seoDesc} setSeoDesc={setSeoDesc} tags={tags} setTags={setTags} markDirty={markDirty}
                categories={categories} openCategoryModal={openCategoryModal}
                segments={segments} selectedSegment={editSeg} 
                handleSegmentClick={(id: string) => { setEditSeg(id); setEditGrp(""); setEditSub(""); fetchGroups(id); }}
                groups={groups} selectedGroup={editGrp} 
                handleGroupClick={(id: string) => { setEditGrp(id); setEditSub(""); fetchSubjects(id); }}
                subjects={subjects} selectedSubject={editSub} 
                handleSubjectClick={setEditSub}
            />
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            <ListHeader title={activeTab.toUpperCase()} onAdd={handleAddNew} onSearch={setSearch} searchVal={search} />
            
            <ContentFilterBar 
                activeTab={activeTab}
                segments={segments} groups={groups} subjects={subjects}
                selSeg={selSeg} setSelSeg={setSelSeg} selGrp={selGrp} setSelGrp={setSelGrp} selSub={selSub} setSelSub={setSelSub}
                onFetchGroups={fetchGroups} onFetchSubjects={fetchSubjects}
                dateFilter={dateFilter} setDateFilter={setDateFilter}
                startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate}
                typeFilter={typeFilter} setTypeFilter={setTypeFilter}
                updateTypeFilter={updateTypeFilter} setUpdateTypeFilter={setUpdateTypeFilter}
                catFilter={catFilter} setCatFilter={setCatFilter} categories={categories}
                showHierarchy={['materials', 'courses'].includes(activeTab)}
                showSegmentOnly={activeTab === 'updates'}
                showType={activeTab === 'materials'}
                showUpdateType={activeTab === 'updates'}
                showCategory={activeTab === 'ebooks' || activeTab === 'news'}
                typeOptions={activeTab === 'materials' ? [{ val: 'blog', label: '✍️ Blogs' }, { val: 'pdf', label: '📄 PDFs' }, { val: 'video', label: '🎬 Videos' }, { val: 'question', label: '❓ Questions' }] : [{ val: 'routine', label: '📅 Routine' }, { val: 'syllabus', label: '📝 Syllabus' }, { val: 'exam_result', label: '🏆 Result' }]}
            />

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-gray-50/50 text-xs uppercase font-extrabold text-slate-400 border-b border-gray-100 tracking-wider">
                        <tr>
                            <SortableHeader label="TITLE" sortKey="title" currentSort={sortConfig} setSort={setSortConfig} />
                            {(activeTab === 'materials' || activeTab === 'updates') && <SortableHeader label="TYPE" sortKey="type" currentSort={sortConfig} setSort={setSortConfig} />}
                            <SortableHeader label="DATE" sortKey="created_at" currentSort={sortConfig} setSort={setSortConfig} />
                            <th className="px-6 py-4 text-right font-extrabold text-slate-400">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {dataList.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-800">{item.title}</td>
                                {(activeTab === 'materials' || activeTab === 'updates') && <td className="px-6 py-4"><span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold uppercase">{item.type}</span></td>}
                                <td className="px-6 py-4 text-xs font-medium text-slate-500">{new Date(item.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    {/* 2. ADDED LIKES BUTTON (Only for materials) */}
                                    {activeTab === 'materials' && (
                                        <button 
                                            onClick={() => setShowLikers({ id: String(item.id), title: item.title })}
                                            className="text-rose-600 font-bold text-xs bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-100"
                                        >
                                            Likes
                                        </button>
                                    )}
                                    <button onClick={() => handleEdit(item)} className="text-indigo-600 font-bold text-xs bg-indigo-50 px-3 py-1.5 rounded-lg">Edit</button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 font-bold text-xs bg-red-50 px-3 py-1.5 rounded-lg">Del</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 3. RENDER MODAL */}
            {showLikers && (
                <PostLikersModal 
                    resourceId={showLikers.id} 
                    resourceTitle={showLikers.title} 
                    onClose={() => setShowLikers(null)} 
                />
            )}
        </div>
    );
}