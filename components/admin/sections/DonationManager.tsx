"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Heart, CheckCircle2, XCircle, Clock, ExternalLink, Search, Filter, MoreVertical, DollarSign, Calendar } from "lucide-react";

export default function DonationManager({ darkMode }: { darkMode?: boolean }) {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDonations();
  }, []);

  async function fetchDonations() {
    setLoading(true);
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error) setDonations(data || []);
    setLoading(false);
  }

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase
      .from("donations")
      .update({ status })
      .eq("id", id);
    
    if (!error) {
      setDonations(donations.map(d => d.id === id ? { ...d, status } : d));
    }
  };

  const filteredDonations = donations.filter(d => {
    const matchesFilter = filter === "all" || d.status === filter;
    const matchesSearch = d.donor_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.transaction_id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Donation Management</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Review and verify community contributions.</p>
         </div>
         
         <div className="flex items-center gap-3">
            <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600" />
               <input 
                 type="text" 
                 placeholder="Search donor or TrxID..." 
                 className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 w-64 transition-all"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <select 
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
               <option value="all">All Status</option>
               <option value="pending">Pending</option>
               <option value="approved">Approved</option>
               <option value="rejected">Rejected</option>
            </select>
         </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                     <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Donor Details</th>
                     <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount & Method</th>
                     <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction ID</th>
                     <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                     <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                     <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={6} className="px-6 py-20 text-center"><div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto"></div></td></tr>
                  ) : filteredDonations.length > 0 ? filteredDonations.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50 transition-colors group">
                       <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                                {d.donor_name?.charAt(0)}
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-900">{d.donor_name}</p>
                                <p className="text-[10px] font-bold text-slate-400">{d.donor_email || 'No Email'}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-5">
                          <div>
                             <p className="text-sm font-black text-slate-900 flex items-center gap-1">৳{d.amount}</p>
                             <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mt-1">{d.payment_method}</p>
                          </div>
                       </td>
                       <td className="px-6 py-5">
                          <code className="text-[11px] font-black bg-slate-100 text-slate-600 px-2 py-1 rounded-md uppercase tracking-wider">{d.transaction_id}</code>
                       </td>
                       <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            d.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 
                            d.status === 'rejected' ? 'bg-rose-50 text-rose-600' : 
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {d.status}
                          </span>
                       </td>
                       <td className="px-6 py-5">
                          <div className="text-slate-500 flex items-center gap-2">
                             <Calendar className="w-3.5 h-3.5" />
                             <span className="text-[11px] font-bold">{new Date(d.created_at).toLocaleDateString()}</span>
                          </div>
                       </td>
                       <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             {d.status === 'pending' && (
                               <>
                                 <button 
                                   onClick={() => handleStatusChange(d.id, 'approved')}
                                   className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                   title="Approve"
                                 >
                                    <CheckCircle2 className="w-4 h-4" />
                                 </button>
                                 <button 
                                   onClick={() => handleStatusChange(d.id, 'rejected')}
                                   className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                   title="Reject"
                                 >
                                    <XCircle className="w-4 h-4" />
                                 </button>
                               </>
                             )}
                             <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                                <MoreVertical className="w-4 h-4" />
                             </button>
                          </div>
                       </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="px-6 py-20 text-center font-medium text-slate-400 italic">No donations found matching criteria.</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
}
