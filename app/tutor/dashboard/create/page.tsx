"use client";
import { useState, useEffect } from "react";
import ContentEditor from "@/components/admin/sections/ContentEditor";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CreateContentPage() {
  const router = useRouter();
  
  // FIXED: Added <any[]> type definition so TypeScript knows these arrays will hold data
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Form State Handlers
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("pdf");
  
  // Additional state required by ContentEditor
  const [link, setLink] = useState("");
  const [category, setCategory] = useState("");
  const [imageMethod, setImageMethod] = useState<'upload'|'link'>('upload');
  const [imageFile, setImageFile] = useState<File|null>(null);
  const [imageLink, setImageLink] = useState("");
  const [file, setFile] = useState<File|null>(null);
  const [instructor, setInstructor] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [tags, setTags] = useState("");
  
  // Hierarchy State
  const [selectedSegment, setSelectedSegment] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // FIXED: Renamed function from 'fetch data' to 'fetchDropdowns'
  useEffect(() => {
    const fetchDropdowns = async () => {
        const { data: segs } = await supabase.from('segments').select('*');
        const { data: cats } = await supabase.from('categories').select('*');
        if(segs) setSegments(segs);
        if(cats) setCategories(cats);
    };
    fetchDropdowns();
  }, []);

  // Helper to fetch cascaded dropdowns
  const handleSegmentClick = async (segId: string) => {
      setSelectedSegment(segId);
      const { data } = await supabase.from('groups').select('*').eq('segment_id', segId);
      setGroups(data || []);
  };

  const handleGroupClick = async (grpId: string) => {
      setSelectedGroup(grpId);
      const { data } = await supabase.from('subjects').select('*').eq('group_id', grpId);
      setSubjects(data || []);
  };

  const handleSubjectClick = (subId: string) => {
      setSelectedSubject(subId);
  };

  const handleSave = async () => {
      // The actual saving logic is inside ContentEditor (via parentSave prop or internal),
      // This wrapper just handles the redirect after success.
      router.push('/tutor/dashboard/content');
  };

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-black text-slate-800">Create New Content</h1>
            <p className="text-slate-500">Share your knowledge. All posts are reviewed before publishing.</p>
        </div>

        <ContentEditor 
            activeTab="materials" 
            isDirty={!!title}
            setEditorMode={() => router.back()}
            handleSave={handleSave}
            confirmAction={(msg: string, cb: any) => { if(window.confirm(msg)) cb(); }}
            
            // State Props
            title={title} setTitle={setTitle}
            slug={slug} setSlug={setSlug} generateSlug={() => setSlug(title.toLowerCase().replace(/ /g, '-'))}
            content={content} setContent={setContent}
            type={type} setType={setType}
            link={link} setLink={setLink}
            category={category} setCategory={setCategory}
            
            imageMethod={imageMethod} setImageMethod={setImageMethod}
            imageFile={imageFile} setImageFile={setImageFile}
            imageLink={imageLink} setImageLink={setImageLink}
            file={file} setFile={setFile}
            
            instructor={instructor} setInstructor={setInstructor}
            price={price} setPrice={setPrice}
            discountPrice={discountPrice} setDiscountPrice={setDiscountPrice}
            duration={duration} setDuration={setDuration}
            
            seoTitle={seoTitle} setSeoTitle={setSeoTitle}
            seoDesc={seoDesc} setSeoDesc={setSeoDesc}
            tags={tags} setTags={setTags}
            markDirty={() => {}} // Simple placeholder

            // Dropdown Data
            categories={categories}
            segments={segments}
            groups={groups}
            subjects={subjects}
            
            // Hierarchy Selection State
            selectedSegment={selectedSegment}
            selectedGroup={selectedGroup}
            selectedSubject={selectedSubject}
            
            // Handlers
            handleSegmentClick={handleSegmentClick}
            handleGroupClick={handleGroupClick}
            handleSubjectClick={handleSubjectClick}
            
            openCategoryModal={() => alert("Contact admin to add new categories.")}
        />
    </div>
  );
}