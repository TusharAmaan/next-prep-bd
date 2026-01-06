import { User, FileText, Clock } from "lucide-react";

// Helper to time-ago format
const timeAgo = (date: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m";
  return "now";
};

export default function ActivityFeed({ activities }: { activities: any[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-800">Recent Activity</h3>
        <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">View All</span>
      </div>
      
      <div className="space-y-6 relative">
        {/* Vertical Line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-slate-100"></div>

        {activities.map((item, i) => (
          <div key={i} className="flex gap-4 relative group">
            <div className={`w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 shrink-0 ${item.type === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {item.type === 'user' ? <User className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div className="pt-1">
              <p className="text-sm font-bold text-slate-700">
                {item.title} <span className="font-normal text-slate-500">{item.action}</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {timeAgo(item.created_at)}
              </p>
            </div>
          </div>
        ))}
        {activities.length === 0 && <div className="text-center text-slate-400 text-sm py-4">No recent activity.</div>}
      </div>
    </div>
  );
}