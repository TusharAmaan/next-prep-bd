"use client";

import { useState, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface LikeButtonProps {
  resourceId: string;
}

export default function LikeButton({ resourceId }: LikeButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false); // For click action
  const [initialLoading, setInitialLoading] = useState(true); // For fetching data
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    fetchLikeData();
  }, [resourceId]);

  const fetchLikeData = async () => {
    try {
      // 1. ALWAYS Fetch Total Count (Public)
      const { count: totalLikes, error: countError } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true }) // 'head' means don't download data, just count
        .eq('resource_id', resourceId);

      if (totalLikes !== null) setCount(totalLikes);

      // 2. ONLY Check "Liked Status" if Logged In
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userLike } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('resource_id', resourceId)
          .single();

        if (userLike) setLiked(true);
      }
    } catch (error) {
      console.error("Error fetching likes:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleToggleLike = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // If anonymous user clicks, send to login
      router.push("/login"); 
      return;
    }

    setLoading(true);
    
    // Optimistic UI Update (Instant feedback)
    const previousLiked = liked;
    const previousCount = count;
    
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);

    try {
      if (previousLiked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('resource_id', resourceId);
      } else {
        // Like
        await supabase
          .from('likes')
          .insert([{ user_id: user.id, resource_id: resourceId }]);
      }
    } catch (error) {
      // Revert on error
      setLiked(previousLiked);
      setCount(previousCount);
      console.error("Error toggling like:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <button
      onClick={handleToggleLike}
      disabled={loading || initialLoading}
      className={`
        group flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all duration-300 border shadow-sm
        ${liked 
          ? "bg-rose-50 border-rose-200 text-rose-600 shadow-rose-100" 
          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"
        }
      `}
    >
      <div className={`transition-transform duration-300 ${liked ? "scale-110" : "group-hover:scale-110"}`}>
        {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        ) : (
            <Heart className={`w-5 h-5 ${liked ? "fill-current" : "fill-transparent"}`} />
        )}
      </div>
      <span className="text-sm">
        {liked ? "Liked" : "Like"}
        <span className="ml-1 opacity-60">
            {initialLoading ? "..." : `(${count})`}
        </span>
      </span>
    </button>
  );
}