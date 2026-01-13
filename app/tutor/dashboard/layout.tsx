import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Search } from 'lucide-react';
import TutorSidebar from '@/components/tutor/TutorSidebar'; // Import the dedicated sidebar

export default async function TutorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* 1. USE THE DEDICATED COMPONENT */}
      <TutorSidebar />

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden lg:ml-64"> 
        {/* ^ Added lg:ml-64 to push content right because Sidebar is fixed */}
        
        {/* Top Header */}
        <header className="bg-white border-b h-16 flex items-center justify-between px-8 shadow-sm">
          <h1 className="text-xl font-bold text-gray-800">Tutor Dashboard</h1>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block text-gray-400 focus-within:text-indigo-600">
              <Search className="absolute left-3 top-2.5" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-3 pl-4 border-l">
              <div className="h-9 w-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                {user.email?.[0].toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-700 leading-none">{user.email?.split('@')[0]}</p>
                <p className="text-xs text-gray-500 mt-1">Instructor</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}