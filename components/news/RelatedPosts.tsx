import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { ArrowRight, BookOpen } from 'lucide-react';

interface RelatedPostsProps {
  currentPostId: number | string;
  category: string;
  limit?: number;
}

export default async function RelatedPosts({
  currentPostId,
  category,
  limit = 3,
}: RelatedPostsProps) {
  try {
    const { data: posts } = await supabase
      .from('news')
      .select('id, title, image_url, created_at, seo_description, category')
      .eq('category', category)
      .neq('id', currentPostId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!posts || posts.length === 0) return null;

    const getReadTime = (text: string) => {
      const wpm = 200;
      const words = text ? text.split(/\s+/).length : 0;
      const time = Math.ceil(words / wpm);
      return `${time} min read`;
    };

    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/news/${post.id}`}
              className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300 border border-gray-200"
            >
              <div className="relative h-40 overflow-hidden bg-gray-200">
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <BookOpen className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {post.category}
                </span>
                <h4 className="text-sm font-bold text-gray-900 mt-3 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                  {post.title}
                </h4>
                <p className="text-xs text-gray-600 line-clamp-2 mb-4">
                  {post.seo_description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  <span className="text-blue-600 font-bold group-hover:underline flex items-center gap-1">
                    Read <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return null;
  }
}
