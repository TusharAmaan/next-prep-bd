"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Trash2, CheckCircle, Mail, Clock, Loader2, MessageSquare } from "lucide-react";

export default function FeedbackManager({ onUpdate }: { onUpdate?: () => void }) {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'new', 'read'

  // FETCH FEEDBACKS
  const fetchFeedbacks = async () => {
    setLoading(true);
    
    // We select all columns from feedbacks.
    // We also attempt to fetch related profile data.
    // If user_id is null, profiles will just be null, which is fine.
    const { data, error } = await supabase
      .from("feedbacks")
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching feedbacks:", error);
    } else {
      setFeedbacks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // ACTIONS
  const markAsRead = async (id: string) => {
    // Optimistic update
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: "read" } : f));
    
    const { error } = await supabase.from("feedbacks").update({ status: "read" }).eq("id", id);
    if (error) {
        console.error("Error marking as read:", error);
        // Revert if error (optional, but good practice)
    } else {
      if (onUpdate) onUpdate(); // Refresh global notification counts
    }
  };

  const deleteFeedback = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    
    // Optimistic update
    setFeedbacks(prev => prev.filter(f => f.id !== id));

    const { error } = await supabase.from("feedbacks").delete().eq("id", id);
    if (error) {
        console.error("Error deleting feedback:", error);
        // Fetch again to revert state if delete failed
        fetchFeedbacks();
    } else {
      if (onUpdate) onUpdate();
    }
  };

  // FILTERING
  const filteredFeedbacks = feedbacks.filter(f => {
    if (filter === "new") return f.status !== "read";
    if (filter === "read") return f.status === "read";
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600"/> User Feedback
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage support tickets and user inquiries.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {['all', 'new', 'read'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                filter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                Loading messages...
            </div>
        ) : filteredFeedbacks.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                <Mail className="w-10 h-10 mb-3 opacity-20" />
                <p>No feedback found.</p>
            </div>
        ) : (
            <div className="divide-y divide-slate-100">
                {filteredFeedbacks.map((item) => {
                    // RESOLVE USER DETAILS:
                    // Priority 1: Linked Profile Data
                    // Priority 2: Direct columns on feedback table (full_name, email) - standard fallback
                    // Priority 3: "Anonymous" / "No email"
                    const displayName = item.profiles?.full_name || item.full_name || "Anonymous";
                    const displayEmail = item.profiles?.email || item.email || "No email";

                    return (
                    <div 
                        key={item.id} 
                        className={`p-6 transition-colors hover:bg-slate-50 flex flex-col md:flex-row gap-4 ${item.status !== 'read' ? 'bg-indigo-50/30' : ''}`}
                    >
                        {/* Status Dot */}
                        <div className="pt-2">
                            {item.status !== 'read' ? (
                                <div className="w-3 h-3 bg-indigo-600 rounded-full shadow-sm shadow-indigo-300" title="New"></div>
                            ) : (
                                <div className="w-3 h-3 bg-slate-200 rounded-full" title="Read"></div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap justify-between items-start gap-2">
                                <div>
                                    {/* Subject / Category display */}
                                    <h4 className="font-bold text-slate-900 text-base">
                                        {item.category ? <span className="uppercase text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded mr-2">{item.category}</span> : null}
                                        {/* If you have a 'subject' column, use it. Otherwise, show preview of message */}
                                        {item.subject || "Feedback Message"}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                        <span className="font-bold text-indigo-600">
                                            {displayName}
                                        </span>
                                        <span>•</span>
                                        <span>{displayEmail}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-white border border-slate-100 px-2 py-1 rounded-md shadow-sm">
                                    <Clock className="w-3 h-3" />
                                    {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>

                            <p className="text-slate-600 text-sm leading-relaxed bg-white/50 p-3 rounded-lg border border-slate-100/50 whitespace-pre-wrap">
                                {item.message}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col gap-2 pt-1">
                            {item.status !== 'read' && (
                                <button 
                                    onClick={() => markAsRead(item.id)}
                                    className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors flex items-center justify-center gap-2 md:w-10"
                                    title="Mark as Read"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                </button>
                            )}
                            <button 
                                onClick={() => deleteFeedback(item.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2 md:w-10"
                                title="Delete"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )})}
            </div>
        )}
      </div>
    </div>
  );
}