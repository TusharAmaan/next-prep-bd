import { Sun, Calendar } from "lucide-react";

export default function QuickStats() {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: 'long', day: 'numeric', month: 'short' });
  const timeStr = today.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
      
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <h4 className="text-indigo-300 font-bold text-xs uppercase tracking-widest mb-1">Today</h4>
          <h2 className="text-2xl font-black">{dateStr}</h2>
          <p className="text-slate-400 text-sm font-medium mt-1">{timeStr}</p>
        </div>
        <Sun className="w-10 h-10 text-amber-400 animate-pulse-slow" />
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">8</div>
              <span className="text-sm font-medium text-slate-300">Active Admins</span>
           </div>
           <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
        </div>
        {/* Add more mini-rows here if needed */}
      </div>
    </div>
  );
}