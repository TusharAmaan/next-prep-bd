import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText, Layers, MoreVertical, Edit, Eye, Trash2 } from 'lucide-react';
import ContentTabs from '@/components/dashboard/ContentTabs'; // We will create this next

export default async function MyContentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // 1. Fetch COURSES (The Series/Containers)
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('tutor_id', user.id)
    .order('created_at', { ascending: false });

  // 2. Fetch RESOURCES (The Single Items: Blogs, PDFs, etc.)
  const { data: resources } = await supabase
    .from('resources')
    .select('*, subjects(title), segments(title)') // Join to get readable names
    .eq('author_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-500">Manage your courses and standalone resources.</p>
        </div>
        <Link 
          href="/tutor/dashboard/create" 
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
        >
          + Create New
        </Link>
      </div>

      {/* 3. Pass data to the Client Component for Tab Logic */}
      <ContentTabs 
        courses={courses || []} 
        resources={resources || []} 
      />
    </div>
  );
}