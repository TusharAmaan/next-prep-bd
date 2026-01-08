"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import ListHeader from "../shared/ListHeader";
import ContentFilterBar from "../shared/ContentFilterBar";
import ContentEditor from "./ContentEditor";
import PostLikersModal from "@/components/PostLikersModal";

// --- UTILITY: Slugify ---
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-');     // Replace multiple - with single -
};

const SortableHeader = ({ label, sortKey, currentSort, setSort }: any) => (
    <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition select-none group" onClick={() => setSort({ key: sortKey, direction: currentSort.key === sortKey && currentSort.direction === 'asc' ? 'desc' : 'asc' })}>
        <div className="flex items-center gap-1">{label}<span className={`text-[10px] text-slate-400 flex flex-col leading-[6px] ${currentSort.key === sortKey ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}><span className={currentSort.key === sortKey && currentSort.direction === 'asc' ? 'text-blue-600' : ''}>▲</span><span className={currentSort.key === sortKey && currentSort.direction === 'desc' ? 'text-blue-600' : ''}>▼</span></span></div>
    </th>
);

export default function ContentManager({
    activeTab, 
    segments, groups, subjects, categories,
    fetchGroups, fetchSubjects, 
    showSuccess, showError, 
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
    
    const [selSeg, setSelSeg] = useState("");
    const [selGrp, setSelGrp] = useState("");
    const [selSub, setSelSub] = useState("");

    // Form State
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState(""); // <--- NEW SLUG STATE
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

    const [editSeg, setEditSeg] = useState("");
    const [editGrp, setEditGrp] = useState("");
    const [editSub, setEditSub] = useState("");
    
    const [showLikers, setShowLikers] = useState<{id: string, title: string} | null>(null);
    
    const markDirty = () => setIsDirty(true);

    const resetForms = () => {
        setEditingId(null); setTitle(""); setSlug(""); setContent(""); setLink(""); 
        setType(activeTab === 'segment_updates' ? 'routine' : 'pdf'); 
        setCategory("");
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
        else if (activeTab === 'segment_updates') tableName = "segment_updates";

        if (!tableName) return;

        let query = supabase.from(tableName).select("*", { count: 'exact' });

        // Hierarchy Filters
        if (['materials', 'segment_updates', 'courses'].includes(activeTab)) {
            if (selSub) query = query.eq("subject_id", selSub);
            else if (selGrp) query = query.eq("group_id", selGrp);
            else if (selSeg) query = query.eq("segment_id", selSeg);
        }

        // Type Filters
        if (activeTab === 'materials' && typeFilter !== 'all') query = query.ilike("type", typeFilter);
        if (activeTab === 'segment_updates' && updateTypeFilter !== 'all') query = query.ilike("type", updateTypeFilter);
        if ((activeTab === 'ebooks' || activeTab === 'news') && catFilter !== 'all') query = query.eq("category", catFilter);
        
        // Search
        if (search) query = query.ilike("title", `%${search}%`);

        // Date Filtering
        if (dateFilter === 'this_month') {
            const start = new Date(); start.setDate(1);
            query = query.gte("created_at", start.toISOString());
        } else if (dateFilter === 'last_6_months') {
            const start = new Date(); start.setMonth(start.getMonth() - 6);
            query = query.gte("created_at", start.toISOString());
        } else if (startDate && endDate) {
            query = query.gte("created_at", startDate).lte("created_at", endDate);
        }

        // Pagination & Sort
        const from = page * itemsPerPage;
        const to = from + itemsPerPage - 1;
        const { data, count, error } = await query.range(from, to).order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });

        if (!error && data) {
            setDataList(data);
            if (count !== null) setTotalCount(count);
        }
    }, [activeTab, selSeg, selGrp, selSub, search, typeFilter, updateTypeFilter, catFilter, page, itemsPerPage, sortConfig, dateFilter, startDate, endDate]);

    // Effects
    useEffect(() => { 
        setEditorMode(false); 
        resetForms();
        setSelSeg(""); setSelGrp(""); setSelSub(""); 
        setTypeFilter("all"); setUpdateTypeFilter("all"); setSearch("");
        setPage(0);
    }, [activeTab]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    // --- ACTIONS ---
    const handleAddNew = () => {
        resetForms();
        if (activeTab === 'materials') setType('pdf'); 
        else if (activeTab === 'segment_updates') setType('routine'); 
        setEditorMode(true);
    };

    const handleEdit = (item: any) => {
        resetForms();
        setEditingId(item.id); 
        setTitle(item.title);
        setSlug(item.slug || ""); // <--- LOAD SLUG
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
        } else if (activeTab === 'segment_updates') {
            setType(item.type); setContent(item.content_body || "");
             if (item.attachment_url) setLink(item.attachment_url);
        }

        if (item.segment_id) { setEditSeg(String(item.segment_id)); fetchGroups(String(item.segment_id)); }
        if (item.group_id) { setEditGrp(String(item.group_id)); fetchSubjects(String(item.group_id)); }
        if (item.subject_id) setEditSub(String(item.subject_id));

        setEditorMode(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this item? This cannot be undone.")) return;

        let table = activeTab === 'materials' ? 'resources' : activeTab === 'segment_updates' ? 'segment_updates' : activeTab;
        
        try {
            const { error } = await supabase.from(table).delete().eq("id", id);
            if (error) throw error;
            showSuccess("Deleted Successfully!");
            setDataList(prev => prev.filter(item => item.id !== id));
            fetchContent();
        } catch (error: any) {
            showError("Failed to delete: " + error.message);
        }
    };

    const handleSave = async () => {
        if (!title) return showError("Title is required");
        
        // Auto-generate slug if missing
        let finalSlug = slug.trim();
        if (!finalSlug) {
            finalSlug = slugify(title);
            setSlug(finalSlug);
        }

        setSubmitting(true);

        let payload: any = {
            title,
            slug: finalSlug, // <--- SAVE SLUG
            seo_title: seoTitle || title,
            seo_description: seoDesc,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean)
        };

        let contentUrl: string | null = link; 
        let coverUrl: string | null = null; 

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
            if (type === 'blog' || type === 'question') { payload.content_body = content; payload.content_url = contentUrl; payload.category = category; }
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
        } else if (activeTab === 'segment_updates') {
            payload.type = type; payload.content_body = content;
            if (contentUrl) payload.attachment_url = contentUrl;
            payload.segment_id = editSeg ? Number(editSeg) : null;
        }

        const table = activeTab === 'materials' ? 'resources' : activeTab === 'segment_updates' ? 'segment_updates' : activeTab;
        let error;

        if (editingId) {
            const res = await supabase.from(table).update(payload).eq('id', editingId);
            error = res.error;
        } else {
            const res = await supabase.from(table).insert([payload]);
            error = res.error;
        }

        setSubmitting(false);
        if (error) {
            // Check for duplicate slug error
            if (error.message.includes("duplicate key")) {
                showError("This Permalink (slug) is already taken. Please change it.");
            } else {
                showError(error.message);
            }
        } else {
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
                isDirty={isDirty} setEditorMode={setEditorMode} handleSave={handleSave} submitting={submitting} 
                confirmAction={(msg: string, cb: any) => { if(window.confirm(msg)) cb(); }} 
                title={title} setTitle={setTitle} 
                slug={slug} setSlug={setSlug} generateSlug={() => setSlug(slugify(title))} // <--- Pass Slug Props
                content={content} setContent={setContent} link={link} setLink={setLink} type={type} setType={setType} category={category} setCategory={setCategory}
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
            <ListHeader title={activeTab === 'segment_updates' ? 'UPDATES' : activeTab.toUpperCase()} onAdd={handleAddNew} onSearch={setSearch} searchVal={search} />
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
                showHierarchy={['materials', 'courses', 'segment_updates'].includes(activeTab)}
                showSegmentOnly={activeTab === 'segment_updates'}
                showType={activeTab === 'materials'}
                showUpdateType={activeTab === 'segment_updates'}
                showCategory={activeTab === 'ebooks' || activeTab === 'news'}
                typeOptions={activeTab === 'materials' ? [
                    { val: 'blog', label: '✍️ Blogs' }, 
                    { val: 'pdf', label: '📄 PDFs' }, 
                    { val: 'video', label: '🎬 Videos' }, 
                    { val: 'question', label: '❓ Questions' }
                ] : [
                    { val: 'routine', label: '📅 Routine' }, 
                    { val: 'syllabus', label: '📝 Syllabus' }, 
                    { val: 'exam_result', label: '🏆 Result' }
                ]}
            />
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-gray-50/50 text-xs uppercase font-extrabold text-slate-400 border-b border-gray-100 tracking-wider">
                        <tr>
                            <SortableHeader label="TITLE" sortKey="title" currentSort={sortConfig} setSort={setSortConfig} />
                            {(activeTab === 'materials' || activeTab === 'segment_updates') && <SortableHeader label="TYPE" sortKey="type" currentSort={sortConfig} setSort={setSortConfig} />}
                            <SortableHeader label="DATE" sortKey="created_at" currentSort={sortConfig} setSort={setSortConfig} />
                            <th className="px-6 py-4 text-right font-extrabold text-slate-400">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {dataList.length > 0 ? dataList.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800">{item.title}</div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">/{item.slug || '-'}</div>
                                </td>
                                {(activeTab === 'materials' || activeTab === 'segment_updates') && <td className="px-6 py-4"><span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold uppercase">{item.type}</span></td>}
                                <td className="px-6 py-4 text-xs font-medium text-slate-500">{new Date(item.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    {activeTab === 'materials' && (
                                        <button onClick={() => setShowLikers({ id: String(item.id), title: item.title })} className="text-rose-600 font-bold text-xs bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-100">Likes</button>
                                    )}
                                    <button onClick={() => handleEdit(item)} className="text-indigo-600 font-bold text-xs bg-indigo-50 px-3 py-1.5 rounded-lg">Edit</button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 font-bold text-xs bg-red-50 px-3 py-1.5 rounded-lg">Del</button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400">No items found matching your filters.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {showLikers && <PostLikersModal resourceId={showLikers.id} resourceTitle={showLikers.title} onClose={() => setShowLikers(null)} />}
        </div>
    );
}