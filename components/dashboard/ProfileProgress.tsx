import Link from 'next/link';
import { User, AlertCircle, ArrowRight } from 'lucide-react';

export default function ProfileProgress({ profile }: { profile: any }) {
  // 1. Define what counts as "Complete"
  const fields = [
    { key: 'full_name', label: 'Full Name' },
    { key: 'bio', label: 'Bio / About Me' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'city', label: 'City' },
    { key: 'institution', label: 'Institution' },
    // Add logic for avatar if you have it in profile
  ];

  // 2. Calculate Score
  const filledFields = fields.filter(f => profile?.[f.key] && profile[f.key].length > 0);
  const score = Math.round((filledFields.length / fields.length) * 100);

  // 3. Find missing fields for the "Next Step" prompt
  const missing = fields.find(f => !profile?.[f.key] || profile[f.key].length === 0);

  if (score === 100) return null; // Hide if perfect

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <User size={20} className="text-indigo-600" />
          Complete your profile
        </h3>
        <span className="text-sm font-bold text-indigo-600">{score}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000" 
          style={{ width: `${score}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {missing 
            ? <span>Add <strong>{missing.label}</strong> to increase visibility.</span>
            : <span>You are almost there!</span>
          }
        </p>
        <Link href="/profile" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
          Update Profile <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}