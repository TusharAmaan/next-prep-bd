"use client";

import { 
  User, FileText, Clock, BookOpen, 
  HelpCircle, Video, Newspaper, GraduationCap, File
} from "lucide-react";
import { useTheme } from "@/components/shared/ThemeProvider";

const timeAgo = (date: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const getActivityStyle = (type: string) => {
  switch (type) {
    case 'user':
      return { icon: <User className="w-4 h-4" />, bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' };
    case 'blog':
      return { icon: <FileText className="w-4 h-4" />, bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' };
    case 'question':
      return { icon: <HelpCircle className="w-4 h-4" />, bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' };
    case 'course':
      return { icon: <GraduationCap className="w-4 h-4" />, bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' };
    case 'ebook':
    case 'pdf':
      return { icon: <BookOpen className="w-4 h-4" />, bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' };
    case 'video':
      return { icon: <Video className="w-4 h-4" />, bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-600 dark:text-rose-400' };
    case 'news':
      return { icon: <Newspaper className="w-4 h-4" />, bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-600 dark:text-sky-400' };
    default:
      return { icon: <File className="w-4 h-4" />, bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' };
  }
};

interface ActivityFeedProps {
    activities: any[];
    onViewAll: () => void;
}

export default function ActivityFeed({ activities, onViewAll }: ActivityFeedProps) {
  const { isDark } = useTheme();

  return (
    <div className={`rounded-2xl border p-6 h-full flex flex-col transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Recent Activity</h3>
        <button 
            onClick={onViewAll} 
            className={`text-xs font-bold px-2 py-1 rounded transition-colors ${isDark ? 'text-indigo-400 hover:bg-indigo-900/20' : 'text-indigo-600 hover:bg-indigo-50'}`}
        >
            View All
        </button>
      </div>
      
      <div className="space-y-6 relative flex-1 overflow-hidden overflow-y-auto pr-2 custom-scrollbar">
        {/* Vertical Line */}
        <div className={`absolute left-[19px] top-2 bottom-2 w-[2px] ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}></div>

        {activities.map((item, i) => {
          const style = getActivityStyle(item.type);
          return (
            <div key={i} className="flex gap-4 relative group">
              <div className={`w-10 h-10 rounded-full border-4 shadow-sm flex items-center justify-center z-10 shrink-0 ${style.bg} ${style.text} ${isDark ? 'border-slate-900' : 'border-white'}`}>
                {style.icon}
              </div>
              <div className="pt-1">
                <p className={`text-sm font-bold line-clamp-1 ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
                  {item.title || "Untitled Item"} 
                </p>
                <p className={`text-xs mt-0.5 flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                   <span className={`font-bold uppercase tracking-wide text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.action}</span> 
                   <span>•</span>
                   <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(item.created_at)}</span>
                </p>
              </div>
            </div>
          );
        })}
        {activities.length === 0 && <div className={`text-center text-sm py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No recent activity found.</div>}
      </div>
    </div>
  );
}