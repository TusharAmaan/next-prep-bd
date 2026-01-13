'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Layers, Edit, Eye, Trash2, Video, BookOpen, HelpCircle } from 'lucide-react';

export default function ContentTabs({ courses, resources }: { courses: any[], resources: any[] }) {
  const [activeTab, setActiveTab] = useState<'courses' | 'resources'>('courses');

  return (
    <div>
      {/* TAB SWITCHER */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-3 px-2 flex items-center gap-2 font-medium transition-colors text-sm ${
            activeTab === 'courses' 
              ? 'border-b-2 border-indigo-600 text-indigo-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layers size={18} />
          My Courses ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`pb-3 px-2 flex items-center gap-2 font-medium transition-colors text-sm ${
            activeTab === 'resources' 
              ? 'border-b-2 border-indigo-600 text-indigo-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={18} />
          Single Resources ({resources.length})
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {activeTab === 'courses' ? (
          <CoursesTable data={courses} />
        ) : (
          <ResourcesTable data={resources} />
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENT: Courses Table
// ----------------------------------------------------------------------
function CoursesTable({ data }: { data: any[] }) {
  if (data.length === 0) return <EmptyState type="course" />;

  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-gray-50 text-gray-500 border-b">
        <tr>
          <th className="px-6 py-4 font-medium">Course Title</th>
          <th className="px-6 py-4 font-medium">Price</th>
          <th className="px-6 py-4 font-medium">Status</th>
          <th className="px-6 py-4 font-medium text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {data.map((course) => (
          <tr key={course.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 font-medium text-gray-900">{course.title}</td>
            <td className="px-6 py-4 text-gray-600">{course.price || 'Free'}</td>
            <td className="px-6 py-4">
              <StatusBadge status={course.status} />
            </td>
            <td className="px-6 py-4 text-right flex justify-end gap-3">
              <Link href={`/tutor/dashboard/course/${course.id}`} className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1">
                <Edit size={16} /> Edit
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENT: Resources Table
// ----------------------------------------------------------------------
function ResourcesTable({ data }: { data: any[] }) {
  if (data.length === 0) return <EmptyState type="resource" />;

  const getIcon = (type: string) => {
    switch(type) {
      case 'video': return <Video size={16} className="text-blue-500" />;
      case 'pdf': return <FileText size={16} className="text-red-500" />;
      case 'question': return <HelpCircle size={16} className="text-orange-500" />;
      default: return <BookOpen size={16} className="text-green-500" />;
    }
  };

  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-gray-50 text-gray-500 border-b">
        <tr>
          <th className="px-6 py-4 font-medium">Title</th>
          <th className="px-6 py-4 font-medium">Type</th>
          <th className="px-6 py-4 font-medium">Subject</th>
          <th className="px-6 py-4 font-medium">Status</th>
          <th className="px-6 py-4 font-medium text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {data.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">{item.title}</td>
            <td className="px-6 py-4 capitalize flex items-center gap-2">
              {getIcon(item.type)} {item.type}
            </td>
            <td className="px-6 py-4 text-gray-500">
              {item.subjects?.title || 'General'}
            </td>
            <td className="px-6 py-4">
               <StatusBadge status={item.status} />
            </td>
            <td className="px-6 py-4 text-right flex justify-end gap-3">
              {/* You can add a specific Edit page for resources later */}
              <button className="text-gray-400 hover:text-gray-600 cursor-not-allowed" title="Edit coming soon">
                <Edit size={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Helper: Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    rejected: "bg-red-100 text-red-700",
    draft: "bg-gray-100 text-gray-600"
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
      {status || 'Draft'}
    </span>
  );
}

// Helper: Empty State
function EmptyState({ type }: { type: string }) {
  return (
    <div className="p-12 text-center text-gray-500">
      <p className="mb-4">No {type}s found.</p>
      <Link href="/tutor/dashboard/create" className="text-indigo-600 hover:underline">
        Create your first {type}
      </Link>
    </div>
  );
}