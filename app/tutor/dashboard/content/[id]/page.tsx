import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ResourceEditorWrapper from '@/components/dashboard/ResourceEditorWrapper';

export default async function EditContentPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // 1. Fetch Resource & Check Ownership
  const { data: resource, error } = await supabase
    .from('resources')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !resource) return <div className="p-10">Resource not found</div>;
  if (resource.author_id !== user.id) return <div className="p-10 text-red-500">Unauthorized</div>;

  // 2. Fetch Dropdown Data (Segments, Groups, Subjects)
  // We fetch all because the user might want to change the category
  const { data: segments } = await supabase.from('segments').select('id, title');
  const { data: groups } = await supabase.from('groups').select('id, title');
  const { data: subjects } = await supabase.from('subjects').select('id, title');

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Edit Resource</h1>
        <p className="text-sm text-slate-500">Update content details. Saving will trigger a new review.</p>
      </div>
      
      {/* The Wrapper handles all client-side logic & the Editor UI */}
      <ResourceEditorWrapper 
        initialData={resource}
        segments={segments || []}
        groups={groups || []}
        subjects={subjects || []}
      />
    </div>
  );
}