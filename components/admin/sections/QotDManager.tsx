"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Calendar, 
  Search, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Filter,
  Layers,
  ChevronRight,
  ChevronLeft,
  X
} from "lucide-react";

export default function QotDManager({ darkMode = false }: { darkMode?: boolean }) {
  const supabase = createClient();
  const [scheduled, setScheduled] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Selection State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchScheduled = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('question_of_the_day')
      .select('*, question:question_id(id, question_text, topic_tag)')
      .order('scheduled_date', { ascending: false });
    if (data) setScheduled(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchScheduled();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery) return;
    setSearchLoading(true);
    const { data } = await supabase
      .from('question_bank')
      .select('id, question_text, topic_tag')
      .ilike('question_text', `%${searchQuery}%`)
      .limit(10);
    if (data) setSearchResults(data);
    setSearchLoading(false);
  };

  const scheduleQuestion = async (questionId: string) => {
    const { error } = await supabase
      .from('question_of_the_day')
      .insert({
        question_id: questionId,
        scheduled_date: selectedDate
      });
    
    if (error) {
      alert(error.message);
    } else {
      setIsSearchOpen(false);
      fetchScheduled();
    }
  };

  const removeScheduled = async (id: number) => {
    if (!confirm("Remove this question from the schedule?")) return;
    await supabase.from('question_of_the_day').delete().eq('id', id);
    fetchScheduled();
  };

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Calendar className="w-8 h-8 text-amber-500" />
            Daily Engagement Console
          </h2>
          <p className="text-slate-500 font-bold mt-1">Schedule 'Question of the Day' for students.</p>
        </div>
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="bg-amber-500 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-amber-100 dark:shadow-none hover:bg-amber-600 transition-all flex items-center gap-3 active:scale-95"
        >
          <Plus size={20} /> SCHEDULE NEW
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">Upcoming</p>
          <p className="text-4xl font-black text-slate-900 dark:text-white">
            {scheduled.filter(s => new Date(s.scheduled_date) >= new Date()).length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">Streak</p>
          <p className="text-4xl font-black text-amber-500">14 Days</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">Total Served</p>
          <p className="text-4xl font-black text-slate-900 dark:text-white">{scheduled.length}</p>
        </div>
      </div>

      {/* Main Schedule List */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-24 flex flex-col items-center">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
            <p className="font-bold text-slate-500">Retrieving master schedule...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b dark:border-slate-700">
                <tr>
                  <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Question Text</th>
                  <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {scheduled.map((item) => {
                  const isPast = new Date(item.scheduled_date) < new Date(new Date().setHours(0,0,0,0));
                  return (
                    <tr key={item.id} className={`${isPast ? 'opacity-50 grayscale-[0.5]' : ''} hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all`}>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center ${isPast ? 'bg-slate-100' : 'bg-amber-100 text-amber-700'} font-black`}>
                            <span className="text-[10px] uppercase">{new Date(item.scheduled_date).toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-lg leading-none">{new Date(item.scheduled_date).getDate()}</span>
                          </div>
                          <div>
                            <p className="font-black text-slate-800 dark:text-white">
                              {new Date(item.scheduled_date).toLocaleDateString(undefined, { weekday: 'long' })}
                            </p>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{isPast ? 'HISTORY' : 'UPCOMING'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 max-w-xl">
                        <p className="font-bold text-slate-700 dark:text-slate-300 line-clamp-2">
                          {item.question?.question_text || "Question description mission / deleted."}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                            {item.question?.topic_tag || 'GENERAL'}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        {!isPast && (
                          <button 
                            onClick={() => removeScheduled(item.id)}
                            className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Scheduler Dialog */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl animate-in zoom-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden border border-white/20">
            <div className="p-12">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">Schedule QotD</h3>
                <button onClick={() => setIsSearchOpen(false)} className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 transition-all">
                  <X size={28} />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Target Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" size={20} />
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-800 dark:text-white outline-none focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Find MCQ in Bank</label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        type="text" 
                        placeholder="Search by keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-14 pr-6 font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <button 
                      onClick={handleSearch}
                      disabled={searchLoading}
                      className="bg-indigo-600 px-6 rounded-2xl text-white font-black hover:bg-indigo-700 transition-all"
                    >
                      {searchLoading ? <Loader2 size={24} className="animate-spin" /> : <ChevronRight size={24} />}
                    </button>
                  </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto space-y-3 custom-scrollbar">
                  {searchResults.map((q) => (
                    <button 
                      key={q.id}
                      onClick={() => scheduleQuestion(q.id)}
                      className="w-full text-left p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-transparent hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all group"
                    >
                      <p className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-amber-700 dark:group-hover:text-amber-400 mb-2">
                        {q.question_text}
                      </p>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-800 px-2 py-1 rounded">
                        {q.topic_tag || 'General'}
                      </span>
                    </button>
                  ))}
                  {searchResults.length === 0 && !searchLoading && searchQuery && (
                    <div className="text-center py-10">
                      <p className="text-slate-400 font-bold italic">No matching questions found.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
