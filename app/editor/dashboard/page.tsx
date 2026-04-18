"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, BookOpen, Users, Layers } from "lucide-react";

export default function EditorDashboard() {
  const router = useRouter();

  // Placeholder quick stats
  const stats = {
    edits: 0,
    pendingReviews: 0,
    recentChanges: [] as { title: string; date: string }[],
  };

  return (
    <div className="min-h-screen bg-[#0f111a] text-white pt-28 pb-20 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none z-0" />
      <div className="absolute top-0 right-0 w-[1000px] h-[700px] bg-gradient-to-bl from-indigo-200/40 via-purple-200/20 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Header */}
        <header className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold">Editor Dashboard</h1>
          <button
            onClick={() => router.push("/editor/dashboard")}
            className="px-4 py-2 bg-white text-indigo-900 rounded-xl hover:bg-slate-100 transition"
          >
            Refresh
          </button>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 flex flex-col items-center">
            <LayoutDashboard className="w-8 h-8 text-indigo-300 mb-2" />
            <p className="text-sm uppercase opacity-70">Edits Made</p>
            <p className="text-2xl font-bold">{stats.edits}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 flex flex-col items-center">
            <Layers className="w-8 h-8 text-purple-300 mb-2" />
            <p className="text-sm uppercase opacity-70">Pending Reviews</p>
            <p className="text-2xl font-bold">{stats.pendingReviews}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 flex flex-col items-center">
            <BookOpen className="w-8 h-8 text-emerald-300 mb-2" />
            <p className="text-sm uppercase opacity-70">Recent Changes</p>
            <p className="text-2xl font-bold">{stats.recentChanges.length}</p>
          </div>
        </section>

        {/* Placeholder content */}
        <section className="bg-white/5 backdrop-blur-xl rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <p className="text-sm opacity-80">
            This area will host editor‑specific tools such as content approval, version control, and analytics.
          </p>
        </section>
      </div>
    </div>
  );
}