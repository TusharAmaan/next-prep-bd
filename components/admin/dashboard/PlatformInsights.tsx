"use client";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useTheme } from "@/components/shared/ThemeProvider";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from "recharts";
import {
  TrendingUp, FileText, Users, BookOpen, Database,
  HelpCircle, GraduationCap, Newspaper, ArrowUpRight,
  Plus, Eye, MessageSquare, Zap, BarChart3
} from "lucide-react";

const COLORS = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface InsightData {
  distribution: { name: string; value: number; color: string }[];
  topContent: { id: string; title: string; type: string; likes: number }[];
  recentGrowth: { users: number; content: number; questions: number };
}

export default function PlatformInsights() {
  const { isDark } = useTheme();
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"distribution" | "top">("distribution");

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

        const [
          { count: resourceCount },
          { count: questionCount },
          { count: ebookCount },
          { count: courseCount },
          { count: newsCount },
          { count: newUsers },
          { count: newContent },
          { count: newQuestions },
          topRes
        ] = await Promise.all([
          supabase.from("resources").select("*", { count: "exact", head: true }),
          supabase.from("question_bank").select("*", { count: "exact", head: true }),
          supabase.from("ebooks").select("*", { count: "exact", head: true }),
          supabase.from("courses").select("*", { count: "exact", head: true }),
          supabase.from("news").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
          supabase.from("resources").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
          supabase.from("question_bank").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
          supabase.from("resources").select("id, title, type, like_count").order("like_count", { ascending: false }).limit(5),
        ]);

        setData({
          distribution: [
            { name: "Materials", value: resourceCount || 0, color: COLORS[0] },
            { name: "Questions", value: questionCount || 0, color: COLORS[1] },
            { name: "eBooks", value: ebookCount || 0, color: COLORS[2] },
            { name: "Courses", value: courseCount || 0, color: COLORS[3] },
            { name: "News", value: newsCount || 0, color: COLORS[4] },
          ],
          topContent: (topRes.data || []).map((r: any) => ({
            id: r.id,
            title: r.title,
            type: r.type || "blog",
            likes: r.like_count || 0,
          })),
          recentGrowth: {
            users: newUsers || 0,
            content: newContent || 0,
            questions: newQuestions || 0,
          },
        });
      } catch (err) {
        console.error("PlatformInsights Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const total = useMemo(() => data?.distribution.reduce((a, b) => a + b.value, 0) || 0, [data]);

  if (loading) {
    return (
      <div className={`rounded-2xl p-6 border h-full flex items-center justify-center ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>Loading insights...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const typeIcon = (type: string) => {
    switch (type) {
      case "blog": return <FileText className="w-3.5 h-3.5" />;
      case "question": return <HelpCircle className="w-3.5 h-3.5" />;
      case "pdf": return <FileText className="w-3.5 h-3.5" />;
      case "video": return <Eye className="w-3.5 h-3.5" />;
      default: return <FileText className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className={`rounded-2xl border overflow-hidden min-h-[450px] lg:h-full flex flex-col transition-colors mb-4 lg:mb-0 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
      
      {/* Header */}
      <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-slate-50/50"}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isDark ? "bg-indigo-900/30 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-800"}`}>Platform Insights</h3>
            <p className={`text-[10px] font-medium uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>Real-Time Analytics</p>
          </div>
        </div>
        <div className={`flex p-1 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
          <button onClick={() => setActiveView("distribution")} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${activeView === "distribution" ? (isDark ? "bg-slate-700 text-white" : "bg-white text-indigo-600 shadow-sm") : (isDark ? "text-slate-400" : "text-slate-500")}`}>
            Overview
          </button>
          <button onClick={() => setActiveView("top")} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${activeView === "top" ? (isDark ? "bg-slate-700 text-white" : "bg-white text-indigo-600 shadow-sm") : (isDark ? "text-slate-400" : "text-slate-500")}`}>
            Top Content
          </button>
        </div>
      </div>

      {/* Growth Metrics Row */}
      <div className={`grid grid-cols-3 gap-0 border-b ${isDark ? "border-slate-800" : "border-slate-100"}`}>
        {[
          { label: "New Users", value: data.recentGrowth.users, icon: Users, color: "text-indigo-500" },
          { label: "Materials", value: data.recentGrowth.content, icon: FileText, color: "text-emerald-500" },
          { label: "Questions", value: data.recentGrowth.questions, icon: Database, color: "text-amber-500" },
        ].map((metric, i) => (
          <div key={i} className={`px-4 py-3 flex items-center gap-3 ${i < 2 ? (isDark ? "border-r border-slate-800" : "border-r border-slate-100") : ""}`}>
            <metric.icon className={`w-4 h-4 ${metric.color} shrink-0`} />
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>{metric.label}</p>
              <p className={`text-lg font-black ${isDark ? "text-white" : "text-slate-800"}`}>
                +{metric.value}
                <span className={`text-[9px] ml-1 font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>7d</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {activeView === "distribution" ? (
          <div className="flex items-center gap-4 h-full">
            {/* Donut Chart */}
            <div className="w-[140px] h-[140px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.distribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number | undefined) => [value ?? 0, "Items"]}
                    contentStyle={{
                      background: isDark ? "#1e293b" : "#fff",
                      border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: isDark ? "#f1f5f9" : "#1e293b",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend + Stats */}
            <div className="flex-1 space-y-2">
              <p className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-800"}`}>
                {total.toLocaleString()}
                <span className={`text-xs font-medium ml-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>total items</span>
              </p>
              <div className="space-y-1.5">
                {data.distribution.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }}></div>
                      <span className={`text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>{item.name}</span>
                    </div>
                    <span className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 h-full">
            <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Most Liked Content
            </p>
            {data.topContent.length > 0 ? data.topContent.map((item, i) => (
              <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50"}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${isDark ? "text-slate-200" : "text-slate-700"}`}>{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      {typeIcon(item.type)} {item.type}
                    </span>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${isDark ? "text-rose-400" : "text-rose-500"}`}>
                  <ArrowUpRight className="w-3 h-3" /> {item.likes}
                </div>
              </div>
            )) : (
              <div className={`text-center py-8 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>No liked content yet</div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions Footer */}
      <div className={`px-4 py-3 border-t grid grid-cols-3 gap-2 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
        {[
          { label: "Material", icon: Plus, href: "materials" },
          { label: "Question", icon: Database, href: "question_bank" },
          { label: "Feedback", icon: MessageSquare, href: "feedbacks" },
        ].map((action, i) => (
          <button
            key={i}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-95 ${
              isDark
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                : "bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
            }`}
          >
            <action.icon className="w-3.5 h-3.5" />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
