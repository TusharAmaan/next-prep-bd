"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // --- INTELLIGENT SEARCH LOGIC ---
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm(""); // Clear input after search
    }
  };

  return (
    <div className="space-y-8">
      
      {/* 1. SEARCH WIDGET */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">Search</h3>
        <form onSubmit={handleSearch} className="relative">
            <input 
                type="text" 
                placeholder="Search topics..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
                type="submit" 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition"
            >
                🔍
            </button>
        </form>
      </div>

      {/* 2. COMMUNITY WIDGET */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <h3 className="font-bold text-xl mb-2 relative z-10">Join our Community</h3>
        <p className="text-blue-100 text-sm mb-6 relative z-10">Get daily updates, notes, and exam tips on our Facebook page.</p>
        <a 
            href="https://facebook.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full bg-white text-blue-700 text-center font-bold py-3 rounded-xl shadow hover:bg-gray-50 transition relative z-10"
        >
            Follow Page
        </a>
      </div>

      {/* 3. QUICK LINKS / CATEGORIES */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">Explore</h3>
        <div className="flex flex-col gap-2">
            <Link href="/resources/ssc" className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-blue-600 transition group">
                <span className="font-medium text-sm">SSC Preparation</span>
                <span className="text-gray-300 group-hover:text-blue-500">→</span>
            </Link>
            <Link href="/resources/hsc" className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-blue-600 transition group">
                <span className="font-medium text-sm">HSC Preparation</span>
                <span className="text-gray-300 group-hover:text-blue-500">→</span>
            </Link>
            <Link href="/resources/university-admission" className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 text-gray-600 hover:text-blue-600 transition group">
                <span className="font-medium text-sm">Admission Test</span>
                <span className="text-gray-300 group-hover:text-blue-500">→</span>
            </Link>
        </div>
      </div>

    </div>
  );
}