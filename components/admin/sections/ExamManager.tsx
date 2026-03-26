"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  FileBox, 
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
  X,
  Calendar,
  Send,
  Eye,
  FileText
} from "lucide-react";

export default function ExamManager({ 
    segments, groups, subjects, darkMode = false 
}: { 
    segments: any[], 
    groups: any[], 
    subjects: any[], 
    darkMode?: boolean 
}) {
  const supabase = createClient();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string>("all");
  
  // Create/Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    exam_type: "topic",
    duration_minutes: 30,
    total_marks: 100,
    segment_id: "",
    group_id: "",
    subject_id: "",
    status: "draft",
    start_time: "",
    end_time: "",
    questions: []
  });

  const fetchExams = async () => {
    setLoading(true);
    let query = supabase.from('exams').select('*').order('created_at', { ascending: false });
    
    if (activeStatus !== "all") {
        query = query.eq('status', activeStatus);
    }

    const { data } = await query;
    if (data) setExams(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchExams();
  }, [activeStatus]);

  const handleSave = async () => {
    if (!formData.title || !formData.segment_id) return alert("Title and Segment are required");

    const payload = {
      ...formData,
      segment_id: Number(formData.segment_id),
      group_id: formData.group_id ? Number(formData.group_id) : null,
      subject_id: formData.subject_id ? Number(formData.subject_id) : null,
      start_time: formData.start_time || null,
      end_time: formData.end_time || null,
    };

    let error;
    if (editingExam) {
      const { error: err } = await supabase.from('exams').update(payload).eq('id', editingExam.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('exams').insert([payload]);
      error = err;
    }

    if (error) alert(error.message);
    else {
      setIsModalOpen(false);
      setEditingExam(null);
      fetchExams();
    }
  };

  const deleteExam = async (id: number) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;
    await supabase.from('exams').delete().eq('id', id);
    fetchExams();
  };

  const openEdit = (exam: any) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title || "",
      exam_type: exam.exam_type || "topic",
      duration_minutes: exam.duration_minutes || 30,
      total_marks: exam.total_marks || 100,
      segment_id: String(exam.segment_id || ""),
      group_id: String(exam.group_id || ""),
      subject_id: String(exam.subject_id || ""),
      status: exam.status || "draft",
      start_time: exam.start_time ? new Date(exam.start_time).toISOString().slice(0, 16) : "",
      end_time: exam.end_time ? new Date(exam.end_time).toISOString().slice(0, 16) : "",
      questions: exam.questions || []
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingExam(null);
    setFormData({
      title: "",
      exam_type: "topic",
      duration_minutes: 30,
      total_marks: 100,
      segment_id: "",
      group_id: "",
      subject_id: "",
      status: "draft",
      start_time: "",
      end_time: "",
      questions: []
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Calendar className="w-8 h-8 text-indigo-500" />
            Exam Management Center
          </h2>
          <p className="text-slate-500 font-bold mt-1">Create, schedule and publish live exams for students.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-3 active:scale-95"
        >
          <Plus size={20} /> CREATE NEW EXAM
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'draft', 'published', 'scheduled', 'unpublished'].map(status => (
            <button 
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    activeStatus === status 
                    ? "bg-indigo-600 text-white" 
                    : "bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800"
                }`}
            >
                {status}
            </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-24 flex flex-col items-center">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
            <p className="font-bold text-slate-500">Retrieving exams...</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="p-24 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="font-bold text-slate-500">No exams found in this category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b dark:border-slate-700">
                <tr>
                  <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Exam Details</th>
                  <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Type & Category</th>
                  <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                    <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 dark:text-white">{exam.title}</h4>
                                <p className="text-xs text-slate-500 font-bold">{exam.duration_minutes} min • {exam.total_marks} marks</p>
                            </div>
                        </div>
                    </td>
                    <td className="px-10 py-8">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-black uppercase text-indigo-600">{exam.exam_type.replace('_', ' ')}</span>
                            <span className="text-[10px] text-slate-400 font-bold">
                                {segments.find(s => s.id === exam.segment_id)?.title || 'No Segment'} 
                                {exam.subject_id ? ` > ${subjects.find(s => s.id === exam.subject_id)?.title}` : ''}
                            </span>
                        </div>
                    </td>
                    <td className="px-10 py-8">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            exam.status === 'published' ? 'bg-green-100 text-green-700' :
                            exam.status === 'scheduled' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-600'
                        }`}>
                            {exam.status}
                        </span>
                        {exam.status === 'scheduled' && exam.start_time && (
                            <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">
                                Starts: {new Date(exam.start_time).toLocaleString()}
                            </p>
                        )}
                    </td>
                    <td className="px-10 py-8 text-right space-x-2">
                        <button onClick={() => openEdit(exam)} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                            <Eye size={18} />
                        </button>
                        <button onClick={() => deleteExam(exam.id)} className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                            <Trash2 size={18} />
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[40px] shadow-3xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{editingExam ? 'Edit' : 'Create'} Professional Exam</h3>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white dark:bg-slate-800 rounded-xl text-slate-400 hover:text-rose-500"><X size={24} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Exam Title</label>
                                <input 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                                    placeholder="e.g. Higher Math 1st Paper Final Model Test"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Type</label>
                                    <select 
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                                        value={formData.exam_type}
                                        onChange={e => setFormData({...formData, exam_type: e.target.value})}
                                    >
                                        <option value="topic">Topic Test</option>
                                        <option value="subject">Subject Test</option>
                                        <option value="model_test">Model Test</option>
                                        <option value="past_question">Past Question</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Status</label>
                                    <select 
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                                        value={formData.status}
                                        onChange={e => setFormData({...formData, status: e.target.value})}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="unpublished">Unpublished</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Duration (min)</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                                        value={formData.duration_minutes}
                                        onChange={e => setFormData({...formData, duration_minutes: Number(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Total Marks</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                                        value={formData.total_marks}
                                        onChange={e => setFormData({...formData, total_marks: Number(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Segment</label>
                                    <select 
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                                        value={formData.segment_id}
                                        onChange={e => setFormData({...formData, segment_id: e.target.value, group_id: "", subject_id: ""})}
                                    >
                                        <option value="">Select Segment</option>
                                        {segments.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Subject</label>
                                    <select 
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                                        value={formData.subject_id}
                                        onChange={e => setFormData({...formData, subject_id: e.target.value})}
                                    >
                                        <option value="">General (No Subject)</option>
                                        {subjects.filter(s => s.segment_id === Number(formData.segment_id)).map(s => (
                                            <option key={s.id} value={s.id}>{s.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {formData.status === 'scheduled' && (
                        <div className="p-8 bg-amber-50 dark:bg-amber-900/10 rounded-[32px] border-2 border-amber-100 dark:border-amber-900/30 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-2 block">Window Starts</label>
                                <input 
                                    type="datetime-local" 
                                    className="w-full bg-white dark:bg-slate-800 border-2 border-amber-200 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-800 dark:text-white outline-none focus:border-amber-500"
                                    value={formData.start_time}
                                    onChange={e => setFormData({...formData, start_time: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-2 block">Window Ends</label>
                                <input 
                                    type="datetime-local" 
                                    className="w-full bg-white dark:bg-slate-800 border-2 border-amber-200 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-800 dark:text-white outline-none focus:border-amber-500"
                                    value={formData.end_time}
                                    onChange={e => setFormData({...formData, end_time: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-black text-slate-900 dark:text-white">Exam Questions</h4>
                            <span className="text-xs font-bold text-slate-500">{formData.questions?.length || 0} Questions Added</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
                            <p className="text-slate-400 font-bold mb-4 italic text-sm">Question linking module will be available in the next version.</p>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Saved exams use JSON format internally</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-all">Cancel</button>
                    <button onClick={handleSave} className="bg-indigo-600 text-white px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all active:scale-95">Save Changes</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
