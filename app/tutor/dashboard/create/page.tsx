"use client";
import { useState, useEffect } from "react";
import ContentEditor from "@/components/admin/sections/ContentEditor";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CreateResourcePage() {
  const router = useRouter();
  
  // State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("pdf"); 
  const [category, setCategory] = useState("");
  const [link, setLink] = useState(""); // For external links
  const [file, setFile] = useState<File|null>(null); // For PDF upload
  
  // Dropdowns
  const [segments, setSegments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Hierarchy
  const [selectedSegment, setSelectedSegment] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        const { data: segs } = await supabase.from('segments').select('*');
        const { data: cats } = await supabase.from('categories').select('*').neq('type', 'course'); // Exclude course cats
        if(segs) setSegments(segs);
        if(cats) setCategories(cats);
    };
    fetchData();
  }, []);

  const handleSegmentClick = async (id: string) => {
      setSelectedSegment(id);
      const { data } = await supabase.from('groups').select('*').eq('segment_id', id);
      setGroups(data || []);
  };
  const handleGroupClick = async (id: string) => {
      setSelectedGroup(id);
      const { data } = await supabase.from('subjects').select('*').eq('group_id', id);
      setSubjects(data || []);
  };

  // --- ROBUST SAVE LOGIC ---
  const handleSave = async () => {
      if(!title) return alert("Title is required");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert("Session expired.");

      let contentUrl = link;

      // Upload File if present
      if (file) {
          const name = `file-${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
          const { data, error } = await supabase.storage.from('materials').upload(name, file);
          if (error) {
              console.error("Upload Error", error);
              return alert("File upload failed: " + error.message);
          }
          const { data: publicUrl } = supabase.storage.from('materials').getPublicUrl(name);
          contentUrl = publicUrl.publicUrl;
      }

      const payload = {
          title,
          slug: slug || title.toLowerCase().replace(/ /g, '-'),
          author_id: user.id,
          type,
          category,
          status: 'pending', // Always pending
          content_body: type === 'blog' ? content : null,
          content_url: contentUrl,
          pdf_url: type === 'pdf' ? contentUrl : null,
          video_url: type === 'video' ? contentUrl : null,
          segment_id: selectedSegment ? parseInt(selectedSegment) : null,
          group_id: selectedGroup ? parseInt(selectedGroup) : null,
          subject_id: selectedSubject ? parseInt(selectedSubject) : null,
          created_at: new Date()
      };

      console.log("Saving Resource:", payload);

      const { error } = await supabase.from('resources').insert([payload]);

      if (error) {
          alert("Database Error: " + error.message);
      } else {
          alert("Success! Your post is pending review.");
          router.push('/tutor/dashboard/content');
      }
  };

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-black text-slate-800">Post Study Material</h1>
            <p className="text-slate-500">Upload notes, videos, or blogs.</p>
        </div>

        <ContentEditor 
            activeTab="materials"
            isDirty={!!title}
            setEditorMode={() => router.back()}
            handleSave={handleSave}
            
            title={title} setTitle={setTitle}
            slug={slug} setSlug={setSlug} generateSlug={() => setSlug(title.toLowerCase().replace(/ /g, '-'))}
            content={content} setContent={setContent}
            type={type} setType={setType}
            category={category} setCategory={setCategory}
            link={link} setLink={setLink}
            file={file} setFile={setFile}
            
            segments={segments} categories={categories} groups={groups} subjects={subjects}
            selectedSegment={selectedSegment} handleSegmentClick={handleSegmentClick}
            selectedGroup={selectedGroup} handleGroupClick={handleGroupClick}
            selectedSubject={selectedSubject} handleSubjectClick={setSelectedSubject}
            
            // Dummy props for unused features in this mode
            imageMethod="upload" setImageMethod={()=>{}} imageFile={null} setImageFile={()=>{}} imageLink="" setImageLink={()=>{}}
            instructor="" setInstructor={()=>{}} price="" setPrice={()=>{}} discountPrice="" setDiscountPrice={()=>{}} duration="" setDuration={()=>{}}
            seoTitle="" setSeoTitle={()=>{}} seoDesc="" setSeoDesc={()=>{}} tags="" setTags={()=>{}}
            markDirty={()=>{}} confirmAction={()=>{}} openCategoryModal={()=>{}}
        />
    </div>
  );
}