"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Search, Mail, Trash2, Calendar, UserCheck, ShieldOff } from "lucide-react";

export default function NewsletterManager({ darkMode }: { darkMode?: boolean }) {
    const supabase = createClient();
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchSubscribers = async () => {
        setLoading(true);
        const { data } = await supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false });
        setSubscribers(data || []);
        setLoading(false);
    };

    useEffect(() => { fetchSubscribers(); }, []);

    const deleteSubscriber = async (id: string) => {
        if (!confirm("Are you sure you want to remove this subscriber?")) return;
        const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
        if (!error) fetchSubscribers();
    };

    const filtered = subscribers.filter(s => s.email.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`p-8 rounded-[2.5rem] border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h2 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Newsletter Subscribers</h2>
                        <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Manage platform audience ({subscribers.length})</p>
                    </div>
                    <div className="relative">
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                        <input 
                            type="text" 
                            placeholder="Search emails..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`pl-12 pr-6 py-4 rounded-2xl w-full md:w-80 text-sm font-medium outline-none transition-all ${
                                darkMode ? 'bg-slate-800 border-transparent text-white focus:bg-slate-700' : 'bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-indigo-50'
                            }`}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className={`text-[10px] font-black uppercase tracking-widest border-b ${darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-50 text-slate-400'}`}>
                                <th className="px-6 py-4 text-left">Email Address</th>
                                <th className="px-6 py-4 text-left">Joined Date</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {filtered.map((sub) => (
                                <tr key={sub.id} className={`group ${darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/50'} transition-colors`}>
                                    <td className="px-6 py-6 font-bold text-sm text-slate-900 dark:text-slate-200">
                                       <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center"><Mail className="w-4 h-4"/></div>
                                          {sub.email}
                                       </div>
                                    </td>
                                    <td className="px-6 py-6 text-xs text-slate-500 font-medium">
                                       <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(sub.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-6">
                                       <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2 w-fit">
                                          <UserCheck className="w-3 h-3" /> Active
                                       </span>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                       <button 
                                          onClick={() => deleteSubscriber(sub.id)}
                                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all shadow-sm"
                                       >
                                          <ShieldOff className="w-5 h-5" />
                                       </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!loading && filtered.length === 0 && (
                        <div className="py-20 text-center flex flex-col items-center gap-4">
                           <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-600"><Search className="w-8 h-8"/></div>
                           <p className="text-slate-400 text-sm font-medium">No subscribers found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
