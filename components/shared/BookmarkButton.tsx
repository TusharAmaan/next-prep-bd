'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";

interface BookmarkButtonProps {
  itemType: 'course' | 'post' | 'lecture_sheet' | 'question' | 'ebook';
  itemId: string | number;
  metadata?: {
    title: string;
    thumbnail_url?: string;
  };
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({ itemType, itemId, metadata }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkBookmark = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUser(user);

      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_type', itemType)
        .eq('item_id', itemId.toString())
        .single();

      if (data) setIsBookmarked(true);
      setLoading(false);
    };

    checkBookmark();
  }, [itemType, itemId]);

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert("Please login to save items.");
      return;
    }

    if (isBookmarked) {
      const { error } = await supabase
        .from('user_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('item_type', itemType)
        .eq('item_id', itemId.toString());

      if (!error) setIsBookmarked(false);
    } else {
      const { error } = await supabase
        .from('user_bookmarks')
        .insert([{
          user_id: user.id,
          item_type: itemType,
          item_id: itemId.toString(),
          metadata: metadata || {}
        }]);

      if (!error) setIsBookmarked(true);
    }
  };

  if (loading) return <div className="w-5 h-5 animate-pulse bg-slate-100 rounded-full" />;

  return (
    <button 
      onClick={toggleBookmark}
      className={`p-2 rounded-full transition-all duration-300 ${
        isBookmarked 
          ? 'bg-indigo-600 text-white shadow-lg' 
          : 'bg-white/80 backdrop-blur-sm text-slate-400 hover:text-indigo-600 border border-slate-100'
      }`}
      title={isBookmarked ? "Remove from Library" : "Save to Library"}
    >
      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-white' : ''}`} />
    </button>
  );
};

export default BookmarkButton;
