"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import TutorContentEditor from '@/components/dashboard/TutorContentEditor';
import { toast } from 'sonner'; // or your preferred alert method

export default function ResourceEditorWrapper({ initialData, segments, groups, subjects }: any) {
  const supabase = createClient();
  const router = useRouter();
  
  // --- STATE MANAGEMENT ---
  const [isDirty, setIsDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fields (Initialize with DB data)
  const [title, setTitle] = useState(initialData.title || '');
  const [slug, setSlug] = useState(initialData.slug || '');
  const [content, setContent] = useState(initialData.content_body || '');
  const [type, setType] = useState(initialData.type || 'blog');
  const [selectedSegment, setSelectedSegment] = useState(initialData.segment_id?.toString() || '');
  const [selectedGroup, setSelectedGroup] = useState(initialData.group_id?.toString() || '');
  const [selectedSubject, setSelectedSubject] = useState(initialData.subject_id?.toString() || '');
  
  // Media & External Links
  const [imageMethod, setImageMethod] = useState<'upload'|'link'>('link');
  const [imageFile, setImageFile] = useState<File|null>(null);
  const [imageLink, setImageLink] = useState(initialData.thumbnail_url || '');
  const [link, setLink] = useState(initialData.video_url || initialData.pdf_url || ''); // For external Video/PDF
  const [file, setFile] = useState<File|null>(null); // For direct PDF upload

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialData.seo_title || '');
  const [seoDesc, setSeoDesc] = useState(initialData.seo_description || '');

  // --- ACTIONS ---
  const markDirty = () => setIsDirty(true);

  const generateSlug = () => {
    const s = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setSlug(s);
    markDirty();
  };

  const handleSave = async () => {
    setSubmitting(true);

    try {
      let finalThumbnailUrl = imageLink;
      let finalContentUrl = link;

      // 1. Upload Thumbnail if needed
      if (imageMethod === 'upload' && imageFile) {
         const fileName = `${Date.now()}-${imageFile.name}`;
         const { data, error } = await supabase.storage.from('thumbnails').upload(fileName, imageFile);
         if (error) throw error;
         const { data: { publicUrl } } = supabase.storage.from('thumbnails').getPublicUrl(fileName);
         finalThumbnailUrl = publicUrl;
      }

      // 2. Upload PDF if needed
      if (type === 'pdf' && file) {
         const fileName = `${Date.now()}-${file.name}`;
         const { data, error } = await supabase.storage.from('resources').upload(fileName, file);
         if (error) throw error;
         const { data: { publicUrl } } = supabase.storage.from('resources').getPublicUrl(fileName);
         finalContentUrl = publicUrl;
      }

      // 3. Update Database
      const { error } = await supabase
        .from('resources')
        .update({
          title,
          slug,
          content_body: content,
          type,
          segment_id: selectedSegment ? Number(selectedSegment) : null,
          group_id: selectedGroup ? Number(selectedGroup) : null,
          subject_id: selectedSubject ? Number(selectedSubject) : null,
          thumbnail_url: finalThumbnailUrl,
          // Store specific URL based on type
          video_url: type === 'video' ? link : null,
          pdf_url: type === 'pdf' ? finalContentUrl : null,
          
          seo_title: seoTitle,
          seo_description: seoDesc,
          status: 'pending', // Re-trigger review on edit
          updated_at: new Date().toISOString()
        })
        .eq('id', initialData.id);

      if (error) throw error;

      setIsDirty(false);
      alert('Content updated successfully! It is now pending review.');
      router.refresh();
      
    } catch (err: any) {
      alert('Error saving content: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TutorContentEditor 
      mode="resource"
      isDirty={isDirty}
      submitting={submitting}
      onSave={handleSave}
      onCancel={() => router.back()}
      markDirty={markDirty}

      // Data Props
      title={title} setTitle={setTitle}
      slug={slug} setSlug={setSlug} generateSlug={generateSlug}
      content={content} setContent={setContent}
      type={type} setType={setType}
      
      // Hierarchy
      segments={segments} selectedSegment={selectedSegment} handleSegmentClick={setSelectedSegment}
      groups={groups} selectedGroup={selectedGroup} handleGroupClick={setSelectedGroup}
      subjects={subjects} selectedSubject={selectedSubject} handleSubjectClick={setSelectedSubject}

      // Media
      imageMethod={imageMethod} setImageMethod={setImageMethod}
      imageFile={imageFile} setImageFile={setImageFile}
      imageLink={imageLink} setImageLink={setImageLink}
      
      // External/File
      link={link} setLink={setLink}
      file={file} setFile={setFile}

      // SEO
      seoTitle={seoTitle} setSeoTitle={setSeoTitle}
      seoDesc={seoDesc} setSeoDesc={setSeoDesc}
      tags="" setTags={() => {}} // Not using tags for now
    />
  );
}