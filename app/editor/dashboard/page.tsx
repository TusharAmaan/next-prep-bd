"use client";

import { 
  FileText, Newspaper, MessageSquare, 
  TrendingUp, Users, Clock, ArrowUpRight, 
  ExternalLink, Calendar, CheckSquare
} from "lucide-react";

export default function EditorDashboard() {
  
  const stats = [
    { label: "Total Articles", value: "128", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending Reviews", value: "14", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Live Newsposts", value: "42", icon: Newspaper, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "User Feedback", value: "8", icon: MessageSquare, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  const recentActivity = [
    { title: "SSC 2026 Batch Update", type: "Blog", date: "2 hours ago", status: "Published", author: "Tushar" },
    { title: "New Medical Admission Circular", type: "News", date: "5 hours ago", status: "Draft", author: "Amaan" },
    { title: "University Admission Roadmap", type: "Article", date: "Yesterday", status: "In Review", author: "Editor-1" },
    { title: "IBA Preparation Guide", type: "Blog", date: "2 days ago", status: "Published", author: "Tushar" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* --- WELCOME SECTION --- */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">Editorial Hub</h1>
            <p className="text-slate-400 font-bold text-sm tracking-wide">Managing the future of NextPrepBD Education.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
            <button className="px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-95">Daily Overview</button>
            <button className="px-5 py-2.5 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-all">Analytics</button>
        </div>
      </section>

      {/* --- STATS GRID --- */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                        <stat.icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
                        <ArrowUpRight className="w-3 h-3" />
                        <span>12%</span>
                    </div>
                </div>
                <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-1">{stat.value}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
            </div>
        ))}
      </section>

      {/* --- MAIN DASHBOARD CONTENT --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* RECENT CONTENT TABLE */}
        <section className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500" /> Recent Content Flow
                </h3>
                <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All Articles</button>
            </div>
            
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Title</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentActivity.map((item, i) => (
                                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <p className="font-black text-slate-900 text-xs mb-1 group-hover:text-indigo-600 transition-colors">{item.title}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-2">
                                            {item.date} <span className="w-1 h-1 bg-slate-200 rounded-full"/> by {item.author}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6 italic">
                                        <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{item.type}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Published' ? 'bg-emerald-500' : (item.status === 'Draft' ? 'bg-slate-400' : 'bg-amber-500')}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{item.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition-all">
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        {/* SIDEBAR WIDGETS */}
        <section className="space-y-8">
            
            {/* QUICK ACTIONS */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 opacity-40 group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="relative z-10">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-400" /> Operational Launchpad
                    </h3>
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl transition-all active:scale-95 text-xs font-bold group/btn">
                            Create Blog Post <ArrowUpRight className="w-4 h-4 text-white group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl transition-all active:scale-95 text-xs font-bold group/btn">
                            Broadcast News <ArrowUpRight className="w-4 h-4 text-white group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl transition-all active:scale-95 text-xs font-bold group/btn">
                            Manage Attachments <ArrowUpRight className="w-4 h-4 text-white group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* EDITORIAL CALENDAR WIDGET */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-500" /> Key Dates
                    </h3>
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                </div>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black text-[10px] uppercase">
                            Apr 24
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-800">SSC Batch Launch</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase">Major Deployment</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-[10px] uppercase">
                            May 02
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-800">New Syllabus Sync</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase">Content Update</p>
                        </div>
                    </div>
                </div>
            </div>

        </section>

      </div>

    </div>
  );
}