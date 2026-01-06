import { User, FileText, Clock, ChevronRight } from "lucide-react";

// Helper for time
const timeAgo = (date: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

interface ActivityFeedProps {
    activities: any[];
    onViewAll: () => void; // <--- NEW PROP
}

export default function ActivityFeed({ activities, onViewAll }: ActivityFeedProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-800">Recent Activity</h3>
        <button 
            onClick={onViewAll} 
            className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
        >
            View All
        </button>
      </div>
      
      <div className="space-y-6 relative flex-1 overflow-hidden">
        <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-slate-100"></div>

        {activities.slice(0, 5).map((item, i) => (
          <div key={i} className="flex gap-4 relative group">
            <div className={`w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 shrink-0 ${item.type === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {item.type === 'user' ? <User className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div className="pt-1">
              <p className="text-sm font-bold text-slate-700 line-clamp-1">
                {item.title} 
              </p>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                 <span className="font-medium text-slate-500">{item.action}</span> • <Clock className="w-3 h-3" /> {timeAgo(item.created_at)}
              </p>
            </div>
          </div>
        ))}
        {activities.length === 0 && <div className="text-center text-slate-400 text-sm py-4">No recent activity.</div>}
      </div>
    </div>
  );
}