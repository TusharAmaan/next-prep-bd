"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  FileText, Calendar, Clock, 
  Trash2, Search, ArrowRight, Loader2, Plus 
} from "lucide-react";
import Link from "next/link";

export default function MyExamsPage() {
  const supabase = createClient();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        let query = supabase
            .from('exam_papers')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (search) query = query.ilike('title', `%${search}%`);
        
        const { data } = await query;
        if (data) setExams(data);
    }
    setLoading(false);
  };

  const deleteExam = async (id: number) => {
      if(!confirm("Are you sure you want to delete this saved exam?")) return;
      await supabase.from('exam_papers').delete().eq('id', id);
      fetchExams();
  };

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen bg-slate-50">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
              <h1 className="text-2xl font-black text-slate-800">My Saved Exams</h1>
              <p className="text-slate-500 text-sm">Your library of generated question papers.</p>
          </div>
          <Link href="/tutor/dashboard/question-builder" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 flex items-center gap-2 transition-all">
              <Plus className="w-4 h-4"/> Create New
          </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <Search className="w-5 h-5 text-slate-400 ml-3"/>
          <input 
              className="w-full p-2 outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
              placeholder="Search by exam title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchExams()}
          />
      </div>

      {/* Exam List (Grid View) */}
      {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600"/></div>
      ) : exams.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-400 font-bold">No saved exams yet.</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                  <div key={exam.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:border-indigo-200 transition-all group flex flex-col">
                      
                      <div className="flex justify-between items-start mb-4">
                          <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
                              <FileText className="w-6 h-6"/>
                          </div>
                          <button onClick={() => deleteExam(exam.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4"/>
                          </button>
                      </div>

                      <h3 className="font-bold text-slate-800 text-lg mb-1 truncate">{exam.title}</h3>
                      
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-6">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(exam.created_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {exam.duration}</span>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                          <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                              {exam.questions?.length || 0} Questions
                          </span>
                          <Link href={`/tutor/dashboard/my-exams/${exam.id}`} className="flex items-center gap-1 text-sm font-bold text-indigo-600 group-hover:underline">
                              View & Print <ArrowRight className="w-4 h-4"/>
                          </Link>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
}