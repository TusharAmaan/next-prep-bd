"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Trash2, CheckCircle, Mail, Clock, Loader2, MessageSquare } from "lucide-react";

export default function FeedbackManager({ onUpdate, darkMode = false }: { onUpdate?: () => void, darkMode?: boolean }) {
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
        <section className="section space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="font-display font-bold text-[16px]">User feedback</h2>
                    <p className="text-[12px] text-ink-3 mt-0.5">Manage support tickets and user inquiries</p>
                </div>
                <div className="flex bg-surf-2 border border-line rounded-lg p-0.5 text-[12px]">
                    {['all', 'new', 'read'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-md font-medium capitalize transition-colors ${filter === f ? 'bg-surf-1 text-ink-1 border border-line shadow-sm' : 'text-ink-2 hover:bg-surf-1/50 border border-transparent'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-surf-1 border border-line rounded-xl divide-y divide-line overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-ink-3 flex flex-col items-center">
                        <Loader2 className="w-6 h-6 animate-spin mb-2 text-indigo-500" />
                        <span className="text-[12px] font-medium">Loading messages...</span>
                    </div>
                ) : filteredFeedbacks.length === 0 ? (
                    <div className="p-12 text-center text-ink-3 flex flex-col items-center bg-surf-2/30">
                        <Mail className="w-8 h-8 mb-3 opacity-30" />
                        <p className="text-[12px] font-medium">No feedback found.</p>
                    </div>
                ) : (
                    filteredFeedbacks.map((item) => {
                        const displayName = item.profiles?.full_name || item.full_name || "Anonymous";
                        const displayEmail = item.profiles?.email || item.email || "No email";
                        const isNew = item.status !== 'read';

                        return (
                            <div 
                                key={item.id} 
                                className={`p-4 flex gap-4 transition-colors ${isNew ? 'bg-indigo-600/5 hover:bg-indigo-600/10' : 'hover:bg-surf-2'}`}
                            >
                                <div className="mt-1 shrink-0">
                                    {isNew ? (
                                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" title="New"></div>
                                    ) : (
                                        <div className="w-2.5 h-2.5 rounded-full bg-surf-2 border border-line" title="Read"></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-2">
                                        <div>
                                            <h4 className="font-bold text-[13px] text-ink-1 flex items-center flex-wrap gap-2">
                                                {item.category && <span className="uppercase text-[9px] bg-surf-2 border border-line text-ink-3 px-1.5 py-0.5 rounded">{item.category}</span>}
                                                {item.subject || "Feedback Message"}
                                            </h4>
                                            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-ink-3">
                                                <span className="font-bold text-indigo-400">{displayName}</span>
                                                <span>·</span>
                                                <span className="truncate">{displayEmail}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-ink-3 bg-surf-2 px-2 py-1 rounded-md border border-line shrink-0">
                                            <Clock className="w-3 h-3" />
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <p className="text-[12.5px] text-ink-2 leading-relaxed bg-surf-2/50 p-3 rounded-lg border border-line/50 whitespace-pre-wrap">
                                        {item.message}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1.5 shrink-0 ml-2">
                                    {isNew && (
                                        <button 
                                            onClick={() => markAsRead(item.id)}
                                            className="icon-btn w-8 h-8 rounded-lg flex items-center justify-center text-indigo-400 bg-indigo-600/10 hover:bg-indigo-600 hover:text-white transition-colors"
                                            title="Mark as Read"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => deleteFeedback(item.id)}
                                        className="icon-btn w-8 h-8 rounded-lg flex items-center justify-center text-ink-3 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </section>
    );

}

