import { User } from 'lucide-react';

interface AuthorProfileProps {
  authorName?: string;
  authorTitle?: string;
  authorBio?: string;
  authorImage?: string;
  publishDate: string;
}

export default function AuthorProfile({
  authorName = 'Editorial Team',
  authorTitle = 'Content Creator',
  authorBio = 'Publishing quality content to help you learn and grow.',
  authorImage,
  publishDate,
}: AuthorProfileProps) {
  return (
    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          {authorImage ? (
            <img
              src={authorImage}
              alt={authorName}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center text-blue-600">
              <User className="w-8 h-8" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 text-lg">{authorName}</h4>
          <p className="text-sm text-blue-600 font-semibold mb-2">{authorTitle}</p>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">{authorBio}</p>
          <p className="text-xs text-gray-600">
            Published on {new Date(publishDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
