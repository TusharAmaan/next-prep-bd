"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Search, FileText, Printer, Trash2, 
  Calendar, Clock, Edit3, Loader2, Plus 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyExamsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<any[]>([]);
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

  const handleDelete = async (id: number) => {
      if(!confirm("Are you sure? This exam will be lost.")) return;
      const { error } = await supabase.from('exam_papers').delete().eq('id', id);
      if(!error) fetchExams();
  };

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen bg-slate-50">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
              <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-indigo-600"/> My Exam Papers
              </h1>
              <p className="text-slate-500 text-sm">Manage, edit, and print your saved question papers.</p>
          </div>
          <Link href="/tutor/dashboard/question-builder" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg flex items-center gap-2 transition-all">
              <Plus className="w-4 h-4"/> Create New Exam
          </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400"/>
              <input 
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="Search by exam title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchExams()}
              />
          </div>
          <button onClick={fetchExams} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">
              Refresh
          </button>
      </div>

      {/* Grid */}
      {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500"/></div>
      ) : exams.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-300"/>
              </div>
              <h3 className="text-slate-900 font-bold">No exams created yet</h3>
              <p className="text-slate-500 text-sm mt-1">Go to the builder to create your first paper.</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                  <div key={exam.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                          <div className="bg-indigo-50 text-indigo-700 p-2 rounded-lg">
                              <FileText className="w-6 h-6"/>
                          </div>
                          <div className="text-right">
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200 uppercase">
                                  {exam.questions?.length || 0} Questions
                              </span>
                          </div>
                      </div>
                      
                      <h3 className="font-bold text-slate-800 text-lg mb-1 truncate" title={exam.title}>{exam.title}</h3>
                      <p className="text-xs text-slate-500 mb-4 flex items-center gap-2">
                          <Calendar className="w-3 h-3"/> {new Date(exam.created_at).toLocaleDateString()}
                          <span className="text-slate-300">|</span>
                          <Clock className="w-3 h-3"/> {exam.duration}
                      </p>

                      <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
                          <Link href={`/tutor/dashboard/my-exams/${exam.id}`} className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-black transition-colors">
                              <Printer className="w-3.5 h-3.5"/> View / Print
                          </Link>
                          {/* Edit Feature */}
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit3 className="w-4 h-4"/></button>
                          <button onClick={() => handleDelete(exam.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4"/>
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
}