import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { 
  Clock, 
  CheckCircle, 
  Eye, 
  Banknote, 
  Rocket, 
  FileText,
  XCircle,
  AlertTriangle 
} from 'lucide-react';
import ProfileProgress from '@/components/dashboard/ProfileProgress';

export default async function TutorDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null; 

  // 1. FETCH COURSES
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('tutor_id', user.id)
    .order('created_at', { ascending: false });

  // 2. FETCH PROFILE (For Completion Widget)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // 3. CALCULATE STATS
  const totalCourses = courses?.length || 0;
  const approved = courses?.filter(c => c.status === 'approved').length || 0;
  const pending = courses?.filter(c => c.status === 'pending').length || 0;
  const rejected = courses?.filter(c => c.status === 'rejected').length || 0;

  return (
    <div>
      {/* NEW: PROFILE PROGRESS WIDGET */}
      <ProfileProgress profile={profile} />

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          label="Pending Review" 
          value={pending} 
          color="bg-yellow-50 text-yellow-600" 
          icon={<Clock size={24} />}
        />
        <StatsCard 
          label="Live Content" 
          value={approved} 
          color="bg-green-50 text-green-600" 
          icon={<CheckCircle size={24} />} 
        />
        <StatsCard 
          label="Needs Attention" 
          value={rejected} 
          color="bg-red-50 text-red-600" 
          icon={<AlertTriangle size={24} />} 
        />
        <StatsCard 
          label="Est. Earnings" 
          value="৳0.00" 
          color="bg-purple-50 text-purple-600" 
          icon={<Banknote size={24} />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RECENT CONTENT TABLE */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <h3 className="font-bold text-gray-800">Recent Content Submissions</h3>
            <Link href="/tutor/dashboard/courses" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View All</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 font-medium">Title</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {courses?.slice(0, 5).map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                      <FileText size={16} className="text-gray-400" />
                      <span className="line-clamp-1">{course.title}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">Course</td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(course.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {/* SMART STATUS BADGE */}
                      <StatusBadge status={course.status} feedback={course.admin_feedback} />
                    </td>
                  </tr>
                ))}
                {(!courses || courses.length === 0) && (
                   <tr>
                     <td colSpan={4} className="text-center py-12 text-gray-400">
                        No content submitted yet.
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CREATE CARD */}
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl p-8 flex flex-col items-center justify-center text-center border border-indigo-100 shadow-sm">
          <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-indigo-600">
            <Rocket size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to create?</h3>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            Submit courses, blogs, or quizzes. All content is reviewed by admins before going live.
          </p>
          <Link href="/tutor/dashboard/create" className="w-full">
            <button className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition shadow-indigo-200 shadow-lg flex items-center justify-center gap-2">
              <FileText size={18} />
              Create Content
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// 4. NEW COMPONENT: Status Badge with Feedback Tooltip
function StatusBadge({ status, feedback }: { status: string, feedback?: string }) {
  const styles: any = {
    draft: "bg-gray-100 text-gray-600 border-gray-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    approved: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200 cursor-help"
  };

  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Draft';

  if (status === 'rejected' && feedback) {
    return (
      <div className="group relative flex flex-col items-start">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
          {label}
        </span>
        {/* Tooltip for Feedback */}
        <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
          <strong>Admin Feedback:</strong><br/>
          {feedback}
        </div>
      </div>
    );
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.draft}`}>
      {label}
    </span>
  );
}

function StatsCard({ label, value, color, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wide">{label}</p>
        <h4 className="text-2xl font-bold text-gray-900 mt-1">{value}</h4>
      </div>
    </div>
  );
}