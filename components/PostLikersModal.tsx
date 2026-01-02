"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { X, User, Search, GraduationCap, BookOpen, Shield } from "lucide-react";

interface PostLikersModalProps {
  resourceId: string;
  resourceTitle: string;
  onClose: () => void;
}

export default function PostLikersModal({ resourceId, resourceTitle, onClose }: PostLikersModalProps) {
  const [likers, setLikers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikers = async () => {
      // We join 'likes' with 'profiles' to get names/emails
      const { data, error } = await supabase
        .from('likes')
        .select(`
          created_at,
          profiles (
            id, full_name, email, role, institution
          )
        `)
        .eq('resource_id', resourceId)
        .order('created_at', { ascending: false });

      if (data) setLikers(data);
      setLoading(false);
    };

    fetchLikers();
  }, [resourceId]);

  // Helper for badges
  const getRoleBadge = (role: string) => {
    switch (role) {
        case 'student': return <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><GraduationCap className="w-3 h-3"/> Student</span>;
        case 'tutor': return <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><BookOpen className="w-3 h-3"/> Tutor</span>;
        case 'admin': return <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><Shield className="w-3 h-3"/> Admin</span>;
        default: return <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">User</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in slide-in-from-bottom-4">
        
        {/* Header */}
        <div className="bg-white p-4 border-b border-slate-100 flex justify-between items-center">
            <div>
                <h3 className="font-bold text-slate-800">People who liked</h3>
                <p className="text-xs text-slate-500 truncate max-w-[200px]">{resourceTitle}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
                <div className="p-8 text-center text-slate-400 text-sm">Loading users...</div>
            ) : likers.length === 0 ? (
                <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <User className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">No likes yet.</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {likers.map((item: any, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                                {item.profiles?.full_name?.[0] || "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-slate-800 text-sm truncate">
                                        {item.profiles?.full_name || "Unknown User"}
                                    </h4>
                                    {getRoleBadge(item.profiles?.role)}
                                </div>
                                <p className="text-xs text-slate-500 truncate">{item.profiles?.institution || item.profiles?.email}</p>
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                {new Date(item.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}