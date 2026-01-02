"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface LikeButtonProps {
  resourceId: string;
  initialLikeCount?: number;
}

export default function LikeButton({ resourceId, initialLikeCount = 0 }: LikeButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 1. Check if current user has liked this post
  useEffect(() => {
    setMounted(true);
    const checkLikeStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Ensure your table name is correct (e.g. 'likes' or 'resource_likes')
      const { data } = await supabase
        .from('likes') 
        .select('id')
        .eq('user_id', user.id)
        .eq('resource_id', resourceId)
        .single();

      if (data) setLiked(true);
      
      // Optional: Fetch fresh count
      const { count: freshCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('resource_id', resourceId);
        
      if (freshCount !== null) setCount(freshCount);
    };
    
    checkLikeStatus();
  }, [resourceId]);

  // 2. Handle Click
  const handleToggleLike = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // If not logged in, redirect to login
      router.push("/login"); 
      return;
    }

    // Optimistic UI update (update screen before server responds)
    const previousLiked = liked;
    const previousCount = count;
    
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);

    try {
      if (previousLiked) {
        // Unlike: Remove row
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('resource_id', resourceId);
      } else {
        // Like: Insert row
        await supabase
          .from('likes')
          .insert([{ user_id: user.id, resource_id: resourceId }]);
      }
    } catch (error) {
      // Revert if error
      setLiked(previousLiked);
      setCount(previousCount);
      console.error("Error toggling like:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <button
      onClick={handleToggleLike}
      disabled={loading}
      className={`
        group flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all duration-300 border shadow-sm
        ${liked 
          ? "bg-rose-50 border-rose-200 text-rose-600 shadow-rose-100" 
          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"
        }
      `}
    >
      <div className={`transition-transform duration-300 ${liked ? "scale-110" : "group-hover:scale-110"}`}>
        <Heart 
          className={`w-5 h-5 ${liked ? "fill-current" : "fill-transparent"}`} 
        />
      </div>
      <span className="text-sm">
        {liked ? "Liked" : "Like"}
        <span className="ml-1 opacity-60">({count})</span>
      </span>
    </button>
  );
}