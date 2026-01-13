import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FolderOpen, 
  PlusCircle, 
  User, 
  Settings, 
  Search, 
  LogOut 
} from 'lucide-react';

export default async function TutorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* 1. FIXED SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white tracking-wider flex items-center gap-2">
            NextPrepBD
          </h2>
        </div>
        
        <nav className="mt-6 space-y-2 px-4 flex-1">
          <SidebarItem href="/tutor/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <SidebarItem href="/tutor/dashboard/courses" icon={<FolderOpen size={20} />} label="My Content" />
          <SidebarItem href="/tutor/dashboard/create" icon={<PlusCircle size={20} />} label="Create New" />
          <SidebarItem href="/profile" icon={<User size={20} />} label="Profile" />
          <SidebarItem href="/settings" icon={<Settings size={20} />} label="Settings" />
        </nav>

        <div className="p-6">
           <Link href="/tutor/dashboard/create">
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2">
              <PlusCircle size={18} />
              <span>Create Content</span>
            </button>
           </Link>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
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

// Helper Component
function SidebarItem({ href, icon, label }: any) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group"
    >
      <span className="group-hover:text-white transition-colors">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}