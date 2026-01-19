"use client";
import { useState, useEffect } from "react";
import ContentEditor from "@/components/admin/sections/ContentEditor";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CreateContentPage() {
  const router = useRouter();
  
  // --- 1. DROPDOWN DATA ---
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // --- 2. FORM STATE ---
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("pdf"); // Default
  const [link, setLink] = useState("");
  const [category, setCategory] = useState("");
  
  // Images/Files
  const [imageMethod, setImageMethod] = useState<'upload'|'link'>('upload');
  const [imageFile, setImageFile] = useState<File|null>(null);
  const [imageLink, setImageLink] = useState("");
  const [file, setFile] = useState<File|null>(null);
  
  // Course Specifics
  const [instructor, setInstructor] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [duration, setDuration] = useState("");
  
  // SEO
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [tags, setTags] = useState("");
  
  // Hierarchy
  const [selectedSegment, setSelectedSegment] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // --- 3. FETCH INITIAL DATA ---
  useEffect(() => {
    const fetchData = async () => {
        const { data: segs } = await supabase.from('segments').select('id, title, slug');
        const { data: cats } = await supabase.from('categories').select('*');
        if(segs) setSegments(segs);
        if(cats) setCategories(cats);
    };
    fetchData();
  }, []);

  // --- 4. HIERARCHY HANDLERS ---
  const handleSegmentClick = async (segId: string) => {
      setSelectedSegment(segId);
      const { data } = await supabase.from('groups').select('*').eq('segment_id', segId);
      setGroups(data || []);
      setSelectedGroup(""); setSelectedSubject(""); // Reset children
  };

  const handleGroupClick = async (grpId: string) => {
      setSelectedGroup(grpId);
      const { data } = await supabase.from('subjects').select('*').eq('group_id', grpId);
      setSubjects(data || []);
      setSelectedSubject("");
  };

  const handleSubjectClick = (subId: string) => {
      setSelectedSubject(subId);
  };

  // --- 5. THE MISSING PIECE: ACTUAL SAVE LOGIC ---
  const handleSave = async () => {
      // A. Get Current User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in.");

      // B. Handle File Uploads (If any)
      let contentUrl = link;
      let coverUrl = imageMethod === 'link' ? imageLink : null;

      // Upload Cover Image
      if (imageMethod === 'upload' && imageFile) {
          const name = `cover-${Date.now()}-${imageFile.name.replace(/[^a-z0-9.]/gi, '_')}`;
          const { data, error } = await supabase.storage.from('materials').upload(name, imageFile);
          if (error) throw error;
          const { data: publicUrl } = supabase.storage.from('materials').getPublicUrl(name);
          coverUrl = publicUrl.publicUrl;
      }

      // Upload File (PDF/Doc)
      if (file) {
          const name = `file-${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
          const { data, error } = await supabase.storage.from('materials').upload(name, file);
          if (error) throw error;
          const { data: publicUrl } = supabase.storage.from('materials').getPublicUrl(name);
          contentUrl = publicUrl.publicUrl;
      }

      // C. Construct Payload
      const commonPayload = {
          title,
          slug: slug || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
          status: 'pending', // ALWAYS PENDING for Tutors
          created_at: new Date(),
          segment_id: selectedSegment ? parseInt(selectedSegment) : null,
          group_id: selectedGroup ? parseInt(selectedGroup) : null,
          subject_id: selectedSubject ? parseInt(selectedSubject) : null,
          category,
          seo_title: seoTitle || title,
          seo_description: seoDesc,
          tags: tags ? tags.split(',').map(t => t.trim()) : [],
      };

      let table = 'resources';
      let finalPayload: any = {};

      if (type === 'course') { // Logic for Courses (if you switch to 'courses' tab)
          table = 'courses';
          finalPayload = {
              ...commonPayload,
              tutor_id: user.id, // Linked to Tutor
              description: content,
              thumbnail_url: coverUrl,
              instructor,
              price: price ? parseFloat(price) : 0,
              discount_price: discountPrice ? parseFloat(discountPrice) : 0,
              duration,
              enrollment_link: contentUrl
          };
      } else { // Logic for Resources
          table = 'resources';
          finalPayload = {
              ...commonPayload,
              author_id: user.id, // Linked to Tutor
              type,
              content_body: content, // HTML Content
              content_url: contentUrl, // File/Video Link
              pdf_url: type === 'pdf' ? contentUrl : null,
              video_url: type === 'video' ? contentUrl : null,
              cover_url: coverUrl
          };
      }

      // D. Insert into Database
      console.log(`Inserting into ${table}:`, finalPayload); // Debug Log
      const { error } = await supabase.from(table).insert([finalPayload]);

      if (error) {
          console.error("Supabase Insert Error:", error);
          throw error; // Pass to ContentEditor's error handler
      }

      // E. Success Redirect
      setTimeout(() => {
          if (table === 'courses') router.push('/tutor/dashboard/courses');
          else router.push('/tutor/dashboard/content');
      }, 1000);
  };

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-black text-slate-800">Create New Content</h1>
            <p className="text-slate-500">Share your knowledge. All posts are reviewed before publishing.</p>
        </div>

        <ContentEditor 
            activeTab="materials" // Default view
            isDirty={!!title}
            setEditorMode={() => router.back()}
            handleSave={handleSave} // Now points to the REAL logic above
            
            // --- State Passing ---
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
            markDirty={() => {}} 

            // --- Data Passing ---
            categories={categories}
            segments={segments}
            groups={groups}
            subjects={subjects}
            
            selectedSegment={selectedSegment}
            selectedGroup={selectedGroup}
            selectedSubject={selectedSubject}
            
            handleSegmentClick={handleSegmentClick}
            handleGroupClick={handleGroupClick}
            handleSubjectClick={handleSubjectClick}
            
            openCategoryModal={() => alert("Please contact admin to request new categories.")}
        />
    </div>
  );
}