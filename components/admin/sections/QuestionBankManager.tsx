"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Plus, Trash2, Save, CheckCircle, 
  ChevronLeft, Edit3, Search, Filter, X, 
  BookOpen, HelpCircle, AlertCircle, 
  Tag, Layers, ArrowRight, Loader2, MoreHorizontal, FileUp, UploadCloud
} from "lucide-react";
import RichTextEditor from "@/components/shared/RichTextEditor";

// --- TYPES ---
type QuestionType = 'mcq' | 'descriptive' | 'passage';

interface Option {
  id?: string; 
  option_text: string;
  is_correct: boolean;
}

interface Question {
  id?: string;
  question_text: string;
  question_type: QuestionType;
  marks: number;
  explanation: string;
  options: Option[];
  parent_id?: string;
  topic_tag?: string; 
  segment_id?: number;
  group_id?: number;
  subject_id?: number;
  subjects?: { title: string };
}

// --- 1. STABLE EDITOR (Prevents Cursor Jumping) ---
const StableEditor = memo(({ initialContent, onChange, uniqueKey, darkMode }: { initialContent: string, onChange: (val: string) => void, uniqueKey: string, darkMode?: boolean }) => {
    return (
        <div className="prose-editor-wrapper min-h-[140px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-100 transition-shadow">
            <RichTextEditor 
                key={uniqueKey} 
                initialValue={initialContent} 
                onChange={onChange} 
                darkMode={darkMode}
            />
        </div>
    );
}, (prev, next) => prev.uniqueKey === next.uniqueKey && prev.darkMode === next.darkMode); 
StableEditor.displayName = "StableEditor";

// --- 2. MULTI TAG INPUT ---
const MultiTagInput = ({ value, onChange, suggestions }: { value: string, onChange: (val: string) => void, suggestions: string[] }) => {
    const [inputValue, setInputValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    
    const tags = useMemo(() => value ? value.split(',').map(t => t.trim()).filter(Boolean) : [], [value]);
    const filteredSuggestions = suggestions.filter(s => s.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(s));

    const addTag = (tag: string) => {
        if (!tags.includes(tag)) onChange([...tags, tag].join(', '));
        setInputValue("");
    };

    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter(tag => tag !== tagToRemove).join(', '));
    };

    return (
        <div className="relative group w-full">
            <div className={`flex flex-wrap items-center gap-2 border rounded-xl p-2.5 bg-white dark:bg-slate-900 transition-all ${isFocused ? 'ring-2 ring-indigo-100 border-indigo-300' : 'border-slate-200 dark:border-slate-700'}`}>
                <Tag size={16} className="text-slate-400 dark:text-slate-500 mr-1"/>
                {tags.map(tag => (
                    <span key={tag} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 border border-indigo-100">
                        {tag} <button onClick={() => removeTag(tag)} className="hover:text-indigo-900 rounded-full hover:bg-indigo-200 p-0.5"><X size={10}/></button>
                    </span>
                ))}
                <input 
                    className="flex-1 min-w-[100px] text-sm outline-none bg-transparent text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:text-slate-500"
                    placeholder={tags.length === 0 ? "Add tags..." : ""}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => { if(e.key === 'Enter' && inputValue) { e.preventDefault(); addTag(inputValue); } else if(e.key === 'Backspace' && !inputValue && tags.length > 0) removeTag(tags[tags.length-1]); }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                />
            </div>
            {isFocused && (filteredSuggestions.length > 0 || (inputValue && !tags.includes(inputValue))) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50 py-1">
                    {inputValue && !filteredSuggestions.includes(inputValue) && (
                        <button onMouseDown={(e) => { e.preventDefault(); addTag(inputValue); }} className="w-full text-left px-4 py-2 text-sm text-indigo-600 bg-indigo-50 font-bold hover:bg-indigo-100 flex items-center gap-2"><Plus size={14}/> Create "{inputValue}"</button>
                    )}
                    {filteredSuggestions.map(tag => (
                        <button key={tag} onMouseDown={(e) => { e.preventDefault(); addTag(tag); }} className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-800/50 transition-colors">{tag}</button>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- 3. CUSTOM MODAL ---
function CustomModal({ isOpen, type, message, onConfirm, onCancel }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-white/20">
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${type === 'success' ? 'bg-emerald-100 text-emerald-600' : type === 'error' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
           {type === 'success' ? <CheckCircle size={24} /> : type === 'error' ? <AlertCircle size={24} /> : <HelpCircle size={24}/>}
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Confirm'}</h3>
        <p className="text-slate-600 dark:text-slate-400 dark:text-slate-500 mb-6 text-sm">{message}</p>
        <div className="flex gap-3 justify-center">
          {type === 'confirm' ? (
            <>
              <button onClick={onCancel} className="px-4 py-2 border rounded-lg text-sm font-bold hover:bg-slate-50 dark:bg-slate-800/50">Cancel</button>
              <button onClick={onConfirm} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">Confirm</button>
            </>
          ) : (
            <button onClick={onCancel} className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold">Okay</button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function QuestionBankManager({ darkMode = false }: { darkMode?: boolean }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'list' | 'create' | 'reports'>('list');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // List State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ segment: "", group: "", subject: "", type: "all", topic: "" });
  const [pagination, setPagination] = useState({ page: 0, itemsPerPage: 20, total: 0 });

  // Modal
  const [modal, setModal] = useState<{ isOpen: boolean; type: any; message: string; onConfirm?: () => void }>({ isOpen: false, type: 'success', message: '' });
  const showModal = (type: any, message: string, onConfirm?: () => void) => setModal({ isOpen: true, type, message, onConfirm });
  const closeModal = () => setModal({ ...modal, isOpen: false });

  // Data
  const [dropdowns, setDropdowns] = useState<{ segments: any[], groups: any[], subjects: any[], tags: string[] }>({ segments: [], groups: [], subjects: [], tags: [] });
  // Dropdowns for Creation
  const [createDropdowns, setCreateDropdowns] = useState<{ groups: any[], subjects: any[] }>({ groups: [], subjects: [] });
  // Dropdowns for Filters
  const [filterGroupsList, setFilterGroupsList] = useState<any[]>([]);
  const [filterSubjectsList, setFilterSubjectsList] = useState<any[]>([]);

  // --- FORM STATES ---
  const [mainForm, setMainForm] = useState({
      segment: '', group: '', subject: '', tags: '',
      type: 'mcq' as QuestionType,
      text: '', 
      explanation: '',
      marks: 1
  });
  
  // MCQ Options for Main Question
  const [options, setOptions] = useState<Option[]>([{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }]);
  
  // PASSAGE STATE
  const [subQuestions, setSubQuestions] = useState<Question[]>([]);
  
  // Sub Question Form State
  const [subQForm, setSubQForm] = useState<{
      isOpen: boolean;
      editIndex: number | null; // Null means creating new
      type: QuestionType;
      text: string;
      marks: number;
      explanation: string;
      options: Option[];
  }>({
      isOpen: false, editIndex: null, type: 'mcq', text: '', marks: 1, explanation: '',
      options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }]
  });

  const hasMore = (pagination.page + 1) * pagination.itemsPerPage < pagination.total;

  // --- INIT ---
  useEffect(() => {
      const loadInit = async () => {
          const { data: segs } = await supabase.from('segments').select('id, title');
          const { data: tagsData } = await supabase.from('question_bank').select('topic_tag').not('topic_tag', 'is', null);
          const uniqueTags = Array.from(new Set((tagsData || []).flatMap(d => (d.topic_tag || '').split(',').map((t: string) => t.trim()).filter(Boolean))));
          setDropdowns(prev => ({ ...prev, segments: segs || [], tags: uniqueTags }));
      };
      loadInit();
  }, []);

  // --- FETCH QUESTIONS ---
  const fetchQuestions = useCallback(async () => {
      setLoading(true);
      let query = supabase.from('question_bank').select('*, subjects(title)', { count: 'exact' }).is('parent_id', null).order('created_at', { ascending: false });
      
      if (filters.segment) query = query.eq('segment_id', filters.segment);
      if (filters.group) query = query.eq('group_id', filters.group);
      if (filters.subject) query = query.eq('subject_id', filters.subject);
      if (filters.type !== 'all') query = query.eq('question_type', filters.type);
      if (filters.topic) query = query.ilike('topic_tag', `%${filters.topic}%`);
      if (searchQuery) query = query.or(`question_text.ilike.%${searchQuery}%,topic_tag.ilike.%${searchQuery}%`);

      const from = pagination.page * pagination.itemsPerPage;
      const to = from + pagination.itemsPerPage - 1;
      query = query.range(from, to);

      const { data, count } = await query;
      if (data) {
          setQuestions(data);
          setPagination(prev => ({ ...prev, total: count || 0 }));
      }
      setLoading(false);
  }, [filters, searchQuery, pagination.page, pagination.itemsPerPage]);

  const fetchReports = async () => {
      setLoading(true);
      const { data } = await supabase
          .from('user_question_reports')
          .select('*, profiles:user_id(full_name, email), question:question_id(question_text)')
          .order('created_at', { ascending: false });
      if (data) setReports(data);
      setLoading(false);
  };

  useEffect(() => { 
      if (view === 'list') fetchQuestions();
      else if (view === 'reports') fetchReports();
  }, [view, fetchQuestions]);

  const updateReportStatus = async (reportId: string, status: string) => {
      try {
          const { error } = await supabase
              .from('user_question_reports')
              .update({ status })
              .eq('id', reportId);
          if (error) throw error;
          fetchReports();
      } catch (err: any) {
          showModal('error', err.message);
      }
  };

  // --- DROPDOWN LOGIC ---
  const loadGroups = async (segId: string, isFilter: boolean) => {
      const { data } = await supabase.from('groups').select('id, title').eq('segment_id', segId);
      if(isFilter) setFilterGroupsList(data || []); else setCreateDropdowns(prev => ({ ...prev, groups: data || [] }));
  };
  const loadSubjects = async (grpId: string, isFilter: boolean) => {
      const { data } = await supabase.from('subjects').select('id, title').eq('group_id', grpId);
      if(isFilter) setFilterSubjectsList(data || []); else setCreateDropdowns(prev => ({ ...prev, subjects: data || [] }));
  };

  // --- FORM ACTIONS ---
  const handleReset = () => {
      setEditingId(null);
      setMainForm({ segment: '', group: '', subject: '', tags: '', type: 'mcq', text: '', explanation: '', marks: 1 });
      setOptions([{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }]);
      setSubQuestions([]);
      setSubQForm(p => ({ ...p, isOpen: false }));
  };

  const handleEdit = async (q: any) => {
      setEditingId(q.id);
      setLoading(true);
      if(q.segment_id) await loadGroups(String(q.segment_id), false);
      if(q.group_id) await loadSubjects(String(q.group_id), false);
      
      setMainForm({
          segment: String(q.segment_id || ''), group: String(q.group_id || ''), subject: String(q.subject_id || ''), 
          tags: q.topic_tag || '', type: q.question_type, text: q.question_text, 
          explanation: q.explanation || '', marks: q.marks
      });

      if(q.question_type === 'mcq') {
          const { data } = await supabase.from('question_options').select('*').eq('question_id', q.id).order('order_index');
          setOptions(data || []);
      } else if (q.question_type === 'passage') {
          const { data } = await supabase.from('question_bank').select(`*, options:question_options(*)`).eq('parent_id', q.id).order('created_at', { ascending: true });
          const formatted = (data || []).map((s:any) => ({ ...s, options: s.options || [] }));
          setSubQuestions(formatted);
      }
      setLoading(false);
      setView('create');
  };

  const handleDelete = (id: string) => {
      showModal('confirm', "Delete this question?", async () => {
          setLoading(true);
          await supabase.from('question_bank').delete().eq('id', id);
          setQuestions(prev => prev.filter(q => q.id !== id));
          setLoading(false);
          closeModal();
      });
  };

  const handleExportCSV = async () => {
      if (!questions.length) return showModal('error', 'No questions to export.');
      setLoading(true);
      try {
          // Fetch full data for passage questions (sub-questions and options)
          const fullQuestions = await Promise.all(questions.map(async (q) => {
              let opts: any[] = [];
              let subQs: any[] = [];
              
              if (q.question_type === 'mcq') {
                  const { data } = await supabase.from('question_options').select('*').eq('question_id', q.id).order('order_index');
                  opts = data || [];
              } else if (q.question_type === 'passage') {
                  const { data } = await supabase.from('question_bank').select(`*, options:question_options(*)`).eq('parent_id', q.id).order('created_at', { ascending: true });
                  subQs = (data || []).map((s: any) => ({ ...s, options: s.options || [] }));
              }
              return { ...q, options: opts, subQuestions: subQs };
          }));

          const headers = ["Type", "SegmentID", "GroupID", "SubjectID", "TopicTag", "QuestionText", "Marks", "Explanation", "OptionA", "OptionB", "OptionC", "OptionD", "Correct", "SubQuestions"];
          
          const csvRows = fullQuestions.map(q => {
              const row = [
                  q.question_type,
                  q.segment_id || "",
                  q.group_id || "",
                  q.subject_id || "",
                  `"${(q.topic_tag || "").replace(/"/g, '""')}"`,
                  `"${(q.question_text || "").replace(/"/g, '""')}"`,
                  q.marks || 0,
                  `"${(q.explanation || "").replace(/"/g, '""')}"`,
              ];

              if (q.question_type === 'mcq') {
                  const opts = q.options || [];
                  row.push(`"${(opts[0]?.option_text || "").replace(/"/g, '""')}"`);
                  row.push(`"${(opts[1]?.option_text || "").replace(/"/g, '""')}"`);
                  row.push(`"${(opts[2]?.option_text || "").replace(/"/g, '""')}"`);
                  row.push(`"${(opts[3]?.option_text || "").replace(/"/g, '""')}"`);
                  const correctIdx = opts.findIndex(o => o.is_correct);
                  row.push(correctIdx === 0 ? "A" : correctIdx === 1 ? "B" : correctIdx === 2 ? "C" : correctIdx === 3 ? "D" : "");
                  row.push(""); // No sub-questions for MCQ
              } else if (q.question_type === 'passage') {
                  row.push("", "", "", "", "", ""); // No direct options for passage
                  const subContent = (q.subQuestions || []).map((sq: any) => {
                      const sOpts = sq.options || [];
                      const sCorrect = sOpts.findIndex((so: any) => so.is_correct);
                      const sCorrectLetter = sCorrect === 0 ? "A" : sCorrect === 1 ? "B" : sCorrect === 2 ? "C" : sCorrect === 3 ? "D" : "";
                      return [
                          sq.question_type,
                          sq.question_text,
                          sq.marks,
                          sq.explanation || "",
                          sOpts[0]?.option_text || "",
                          sOpts[1]?.option_text || "",
                          sOpts[2]?.option_text || "",
                          sOpts[3]?.option_text || "",
                          sCorrectLetter
                      ].join('||');
                  }).join(';;;');
                  row.push(`"${subContent.replace(/"/g, '""')}"`);
              } else {
                  row.push("", "", "", "", "", ""); // Descriptive
              }

              return row.join(',');
          });

          const csvContent = "\uFEFF" + [headers.join(','), ...csvRows].join('\n');
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", `questions_export_${new Date().toISOString().split('T')[0]}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } catch (err) {
          console.error("Export error:", err);
          showModal('error', 'Failed to export questions.');
      } finally {
          setLoading(false);
      }
  };

  const handleDownloadSample = () => {
      const headers = ["Type", "SegmentID", "GroupID", "SubjectID", "TopicTag", "QuestionText", "Marks", "Explanation", "OptionA", "OptionB", "OptionC", "OptionD", "Correct", "SubQuestions"];
      const samples = [
          ['mcq', '1', '1', '1', 'Algebra', '"What is 2+2?"', '1', '"Basic math"', '4', '5', '6', '7', 'A', ''],
          ['descriptive', '1', '1', '1', 'History', '"Explain the French Revolution"', '5', '"World History"', '', '', '', '', '', ''],
          ['passage', '1', '1', '1', 'Literature', '"Read the following poem..."', '0', '"Analysis of poetry"', '', '', '', '', '', 'mcq||Question 1: Who wrote this?||1||Author name||Writer A||Writer B||Writer C||Writer D||A;;;descriptive||Question 2: What is the main theme?||2||Theme analysis||||||||']
      ];
      const csvContent = "\uFEFF" + [headers.join(','), ...samples.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "question_bank_sample.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setLoading(true);
      const reader = new FileReader();
      reader.onload = async (f) => {
          const content = f.target?.result as string;
          // Split by newline but handle cases where newline might be inside quotes
          const lines: string[] = [];
          let currentLine = "";
          let inQuotes = false;
          for (let i = 0; i < content.length; i++) {
              const char = content[i];
              if (char === '"') inQuotes = !inQuotes;
              if (char === '\n' && !inQuotes) {
                  lines.push(currentLine);
                  currentLine = "";
              } else if (char !== '\r') {
                  currentLine += char;
              }
          }
          if (currentLine) lines.push(currentLine);

          const csvSplit = (text: string) => {
              const result = [];
              let current = '';
              let inQuotes = false;
              for (let i = 0; i < text.length; i++) {
                  const char = text[i];
                  if (char === '"') {
                      if (inQuotes && text[i+1] === '"') {
                          current += '"'; // Escaped quote
                          i++;
                      } else {
                          inQuotes = !inQuotes;
                      }
                  } else if (char === ',' && !inQuotes) {
                      result.push(current.trim());
                      current = '';
                  } else current += char;
              }
              result.push(current.trim());
              return result;
          };

          let successCount = 0;
          let errorCount = 0;

          // Skip header
          for (let i = 1; i < lines.length; i++) {
              try {
                  const row = csvSplit(lines[i]);
                  if (row.length < 13) continue;

                  const [
                      type, segment_id, group_id, subject_id, topic_tag, 
                      question_text, marks, explanation, 
                      optA, optB, optC, optD, correct, sub_qs_raw
                  ] = row;

                  if (!question_text) continue;

                  const payload = {
                      question_type: (type || 'mcq').toLowerCase() as QuestionType,
                      segment_id: segment_id ? Number(segment_id) : null,
                      group_id: group_id ? Number(group_id) : null,
                      subject_id: subject_id ? Number(subject_id) : null,
                      topic_tag: topic_tag,
                      question_text: question_text,
                      marks: Number(marks) || 0,
                      explanation: explanation
                  };

                  const { data: q, error } = await supabase.from('question_bank').insert(payload).select().single();
                  if (error) throw error;

                  if (payload.question_type === 'mcq' && q) {
                      const opts = [
                          { text: optA, correct: correct === 'A' },
                          { text: optB, correct: correct === 'B' },
                          { text: optC, correct: correct === 'C' },
                          { text: optD, correct: correct === 'D' }
                      ].filter(o => o.text).map((o, idx) => ({
                          question_id: q.id,
                          option_text: o.text,
                          is_correct: o.correct,
                          order_index: idx
                      }));
                      if (opts.length) await supabase.from('question_options').insert(opts);
                  }

                  if (payload.question_type === 'passage' && q && sub_qs_raw) {
                      const subQs = sub_qs_raw.split(';;;');
                      for (const subStr of subQs) {
                          const subFields = subStr.split('||');
                          if (subFields.length < 2) continue;
                          
                          const [sType, sText, sMarks, sExp, sA, sB, sC, sD, sCorrect] = subFields;
                          const { data: sq } = await supabase.from('question_bank').insert({
                              parent_id: q.id,
                              question_type: (sType || 'mcq').toLowerCase() as QuestionType,
                              question_text: sText,
                              marks: Number(sMarks) || 0,
                              explanation: sExp,
                              segment_id: payload.segment_id, // Inherit Meta
                              group_id: payload.group_id,
                              subject_id: payload.subject_id
                          }).select().single();

                          if (sq && sq.question_type === 'mcq') {
                              const sOpts = [
                                  { text: sA, correct: sCorrect === 'A' },
                                  { text: sB, correct: sCorrect === 'B' },
                                  { text: sC, correct: sCorrect === 'C' },
                                  { text: sD, correct: sCorrect === 'D' }
                              ].filter(o => o.text).map((o, idx) => ({
                                  question_id: sq.id,
                                  option_text: o.text,
                                  is_correct: o.correct,
                                  order_index: idx
                              }));
                              if (sOpts.length) await supabase.from('question_options').insert(sOpts);
                          }
                      }
                  }
                  successCount++;
              } catch (err) {
                  console.error("Row error at line", i, ":", err);
                  errorCount++;
              }
          }

          setLoading(false);
          showModal('success', `Import complete: ${successCount} success, ${errorCount} errors`);
          fetchQuestions();
      };
      reader.readAsText(file);
  };

  // --- SUB QUESTION ACTIONS ---
  const openSubForm = (question?: Question, index?: number) => {
      if (question) {
          // Edit Mode
          setSubQForm({
              isOpen: true, editIndex: index !== undefined ? index : null,
              type: question.question_type, text: question.question_text,
              marks: question.marks, explanation: question.explanation,
              options: question.options && question.options.length ? question.options : [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }]
          });
      } else {
          // Create Mode
          setSubQForm({
              isOpen: true, editIndex: null,
              type: 'mcq', text: '', marks: 1, explanation: '',
              options: [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }]
          });
      }
  };

  const saveSubQuestion = () => {
      if(!subQForm.text) return;
      const newQ: Question = {
          question_text: subQForm.text,
          question_type: subQForm.type,
          marks: subQForm.marks,
          explanation: subQForm.explanation,
          options: subQForm.type === 'mcq' ? [...subQForm.options] : []
      };

      const updated = [...subQuestions];
      if (subQForm.editIndex !== null) {
          updated[subQForm.editIndex] = newQ;
      } else {
          updated.push(newQ);
      }
      setSubQuestions(updated);
      setSubQForm(p => ({ ...p, isOpen: false }));
  };

  // --- GLOBAL SAVE ---
  const handleSave = async () => {
      if(!mainForm.text) return showModal('error', 'Content text is required.');
      setLoading(true);
      try {
          const payload = {
              segment_id: mainForm.segment ? Number(mainForm.segment) : null,
              group_id: mainForm.group ? Number(mainForm.group) : null,
              subject_id: mainForm.subject ? Number(mainForm.subject) : null,
              topic_tag: mainForm.tags, // SAVING TAGS
              question_type: mainForm.type,
              question_text: mainForm.text,
              marks: mainForm.type === 'passage' ? 0 : mainForm.marks, 
              explanation: mainForm.explanation
          };

          let qId = editingId;
          if (qId) { await supabase.from('question_bank').update(payload).eq('id', qId); } 
          else { const { data } = await supabase.from('question_bank').insert(payload).select().single(); if(data) qId = data.id; }

          // --- SAVE MCQ OPTIONS (MAIN) ---
          if (mainForm.type === 'mcq' && qId) {
              if (editingId) await supabase.from('question_options').delete().eq('question_id', qId);
              const opts = options.map((o, i) => ({ question_id: qId, option_text: o.option_text, is_correct: o.is_correct, order_index: i }));
              await supabase.from('question_options').insert(opts);
          }

          // --- SAVE PASSAGE SUB-QUESTIONS ---
          if (mainForm.type === 'passage' && qId) {
              // Strategy: Delete old children, insert new (Simplest way to sync order/updates)
              if (editingId) {
                 const { data: old } = await supabase.from('question_bank').select('id').eq('parent_id', qId);
                 if(old?.length) {
                    // Delete options of children first
                    await supabase.from('question_options').delete().in('question_id', old.map(o=>o.id));
                    await supabase.from('question_bank').delete().in('id', old.map(o=>o.id));
                 }
              }
              
              for (const sub of subQuestions) {
                  const { data: subQ } = await supabase.from('question_bank').insert({
                      parent_id: qId,
                      question_text: sub.question_text,
                      question_type: sub.question_type,
                      marks: sub.marks,
                      explanation: sub.explanation,
                      segment_id: payload.segment_id, // Inherit Meta
                      group_id: payload.group_id,
                      subject_id: payload.subject_id
                  }).select().single();
                  
                  if(subQ && sub.question_type === 'mcq') {
                      const subOpts = sub.options.map((o, i) => ({ question_id: subQ.id, option_text: o.option_text, is_correct: o.is_correct, order_index: i }));
                      await supabase.from('question_options').insert(subOpts);
                  }
              }
          }

          showModal('success', 'Saved successfully!', () => {
              handleReset();
              setView('list');
              fetchQuestions();
              closeModal();
          });
      } catch (e: any) {
          showModal('error', e.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="flex flex-col h-full font-sans text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950">
       <CustomModal isOpen={modal.isOpen} type={modal.type} message={modal.message} onConfirm={modal.onConfirm} onCancel={closeModal} />

       {/* HEADER */}
       <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 px-4 sm:px-6 pt-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 pb-4 gap-4">
          <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">Question Manager</h2>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-medium mt-1">Create, edit, and organize question bank content.</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
               <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mr-2">
                   <button 
                       onClick={() => setView('list')}
                       className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-tighter rounded-lg transition-all ${view === 'list' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                   >
                       Repository
                   </button>
                   <button 
                       onClick={() => setView('reports')}
                       className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-tighter rounded-lg transition-all ${view === 'reports' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                   >
                       Reports {reports.filter(r => r.status === 'pending').length > 0 && <span className="ml-1 bg-rose-500 text-white text-[8px] px-1 rounded-full">{reports.filter(r => r.status === 'pending').length}</span>}
                   </button>
               </div>
              {view === 'list' && (
                  <div className="flex flex-wrap gap-2">
                      <button onClick={handleDownloadSample} className="flex items-center gap-2 px-3 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl text-[10px] font-bold transition-all">
                          <HelpCircle size={14} /> Sample CSV
                      </button>
                      <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all">
                          <UploadCloud size={18} /> Export CSV
                      </button>
                      <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold cursor-pointer hover:bg-slate-200 transition-all border border-slate-200 dark:border-slate-700">
                          <FileUp size={18} /> 
                          <span className="hidden sm:inline">Import CSV</span>
                          <input type="file" accept=".csv" hidden onChange={handleImportCSV} />
                      </label>
                      <button onClick={() => { handleReset(); setView('create'); }} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 flex items-center gap-2 transition-all">
                          <Plus size={18}/> New Question
                      </button>
                  </div>
              )}
              {view === 'create' && (
                  <button onClick={() => setView('list')} className="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold hover:text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1"><ChevronLeft size={16}/> Back to List</button>
              )}
          </div>
       </div>

        {/* === REPORTS VIEW === */}
        {view === 'reports' && (
            <div className="flex flex-col h-full overflow-hidden px-6 pb-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-full flex flex-col">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center p-20">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                            <CheckCircle className="w-12 h-12 text-slate-200 mb-4" />
                            <p className="font-bold text-slate-500 italic">No bug reports found. Everything is smooth!</p>
                        </div>
                    ) : (
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 border-b dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Student & Question</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Issue / Reason</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {reports.map((report) => (
                                        <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <td className="px-6 py-6 max-w-sm">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                                                        {(report.profiles?.full_name || 'U').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-800 dark:text-white">{report.profiles?.full_name || 'Unknown'}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold">{report.profiles?.email}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                                                    <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 line-clamp-2" dangerouslySetInnerHTML={{__html: report.question?.question_text}}></p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 italic">"{report.reason || 'No description provided'}"</p>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                                                    report.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 
                                                    report.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 text-right space-x-2">
                                                {report.status === 'pending' && (
                                                    <>
                                                        <button 
                                                            onClick={() => updateReportStatus(report.id, 'resolved')}
                                                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                            title="Mark Resolved"
                                                        >
                                                            <CheckCircle size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => updateReportStatus(report.id, 'rejected')}
                                                            className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                            title="Reject Report"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </>
                                                )}
                                                <button 
                                                    onClick={() => handleEdit({ id: report.question_id, ...report.question })} 
                                                    className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                    title="Edit Question"
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        )}

       {/* === CREATE / EDIT VIEW === */}
       {view === 'create' && (
           <div className="flex flex-col h-full overflow-hidden px-6 pb-6">
               
               {/* 1. METADATA HEADER */}
               <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                   <div className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Segment</label>
                       <select className="w-full border p-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" value={mainForm.segment} onChange={e => { setMainForm(p => ({...p, segment: e.target.value})); loadGroups(e.target.value, false); }}>
                           <option value="">Select...</option>{dropdowns.segments.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                       </select>
                   </div>
                   <div className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Group</label>
                       <select className="w-full border p-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" value={mainForm.group} onChange={e => { setMainForm(p => ({...p, group: e.target.value})); loadSubjects(e.target.value, false); }} disabled={!mainForm.segment}>
                           <option value="">Select...</option>{createDropdowns.groups.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                       </select>
                   </div>
                   <div className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Subject</label>
                       <select className="w-full border p-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" value={mainForm.subject} onChange={e => setMainForm(p => ({...p, subject: e.target.value}))} disabled={!mainForm.group}>
                           <option value="">Select...</option>{createDropdowns.subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                       </select>
                   </div>
                   <div className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Topic Tags</label>
                       <MultiTagInput value={mainForm.tags} onChange={val => setMainForm(p => ({...p, tags: val}))} suggestions={dropdowns.tags} />
                   </div>
               </div>

               {/* 2. EDITOR LAYOUT */}
               <div className={`flex flex-col md:flex-row gap-6 ${mainForm.type === 'passage' ? 'h-full overflow-hidden' : ''}`}>
                   
                   {/* LEFT COLUMN: MAIN CONTENT */}
                   <div className={`flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col ${mainForm.type === 'passage' ? 'md:w-1/2' : 'w-full'}`}>
                       <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50/50 rounded-t-2xl">
                           <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
                               {/* Only show 'Passage' button if not already in passage mode (to switch back) OR if editing */}
                               <button onClick={() => setMainForm(p => ({...p, type: 'mcq'}))} className={`px-4 py-1.5 text-xs font-bold rounded-md capitalize transition-all ${mainForm.type === 'mcq' ? 'bg-white dark:bg-slate-900 shadow text-indigo-700' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}>MCQ</button>
                               <button onClick={() => setMainForm(p => ({...p, type: 'descriptive'}))} className={`px-4 py-1.5 text-xs font-bold rounded-md capitalize transition-all ${mainForm.type === 'descriptive' ? 'bg-white dark:bg-slate-900 shadow text-indigo-700' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}>Descriptive</button>
                               <button onClick={() => setMainForm(p => ({...p, type: 'passage'}))} className={`px-4 py-1.5 text-xs font-bold rounded-md capitalize transition-all ${mainForm.type === 'passage' ? 'bg-purple-600 text-white' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}>Passage</button>
                           </div>
                           {mainForm.type !== 'passage' && (
                               <div className="flex items-center gap-2">
                                    <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">Marks</label>
                                    <input type="number" value={mainForm.marks} onChange={e => setMainForm(p => ({...p, marks: Number(e.target.value)}))} className="w-16 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg p-1.5 text-center font-bold text-sm outline-none focus:border-indigo-500"/>
                               </div>
                           )}
                       </div>

                       <div className="flex-1 p-6 overflow-y-auto space-y-6">
                           <div className="space-y-2">
                               <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                                   {mainForm.type === 'passage' ? 'Passage / Stem Content' : 'Question Content'}
                               </label>
                               <StableEditor uniqueKey={editingId || 'main'} initialContent={mainForm.text} onChange={(val) => setMainForm(p => ({...p, text: val}))} />
                           </div>

                           {mainForm.type === 'mcq' && (
                               <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                                   <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">Options</label>
                                   <div className="grid grid-cols-1 gap-3">
                                       {options.map((opt, i) => (
                                          <div key={i} className="flex gap-3 items-center bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm group focus-within:border-indigo-300 transition-colors">
                                             <button onClick={() => { const n = [...options]; n.forEach(o => o.is_correct = false); n[i].is_correct = true; setOptions(n); }} className={`p-2.5 rounded-lg border transition-all ${opt.is_correct ? 'bg-emerald-100 border-emerald-400 text-emerald-700' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-300 hover:border-slate-300 dark:border-slate-600'}`}>
                                                <CheckCircle size={18} />
                                             </button>
                                             <input className="flex-1 border-none outline-none bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 placeholder:text-slate-300" value={opt.option_text} onChange={e => { const n = [...options]; n[i].option_text = e.target.value; setOptions(n); }} placeholder={`Option ${i+1}`} />
                                             <button onClick={() => { const n = [...options]; n.splice(i,1); setOptions(n); }} className="text-slate-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                                          </div>
                                       ))}
                                   </div>
                                   <button onClick={() => setOptions([...options, {option_text:'', is_correct:false}])} className="text-xs font-bold text-indigo-600 flex items-center gap-1 mt-2 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors"><Plus size={14}/> Add Option</button>
                               </div>
                           )}

                           {mainForm.type !== 'passage' && (
                               <div className="space-y-2">
                                   <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">Explanation</label>
                                   <StableEditor uniqueKey="main-expl" initialContent={mainForm.explanation} onChange={(val) => setMainForm(p => ({...p, explanation: val}))} />
                               </div>
                           )}
                       </div>
                   </div>

                   {/* RIGHT: SUB-QUESTIONS (ONLY FOR PASSAGE) */}
                   {mainForm.type === 'passage' && (
                       <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner flex flex-col md:w-1/2 overflow-hidden">
                           <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-900">
                               <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Layers size={16}/> Questions ({subQuestions.length})</h3>
                               {!subQForm.isOpen && (
                                   <button onClick={() => openSubForm()} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1">
                                       <Plus size={14}/> Add Question
                                   </button>
                               )}
                           </div>

                           <div className="flex-1 overflow-y-auto p-4 space-y-4">
                               {/* List of Sub Questions */}
                               {!subQForm.isOpen && subQuestions.length === 0 && (
                                   <div className="text-center p-10 text-slate-400 dark:text-slate-500 italic text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">No sub-questions added yet.</div>
                               )}
                               
                               {!subQForm.isOpen && subQuestions.map((sq, i) => (
                                   <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-200 transition-all group relative">
                                       <div className="flex justify-between items-start mb-2">
                                           <span className="text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded">{sq.question_type} • {sq.marks} pts</span>
                                           <div className="flex flex-wrap gap-2">
                                               <button onClick={() => openSubForm(sq, i)} className="text-slate-400 dark:text-slate-500 hover:text-indigo-600"><Edit3 size={14}/></button>
                                               <button onClick={() => { const n = [...subQuestions]; n.splice(i, 1); setSubQuestions(n); }} className="text-slate-400 dark:text-slate-500 hover:text-red-600"><Trash2 size={14}/></button>
                                           </div>
                                       </div>
                                       <div className="text-sm text-slate-800 dark:text-slate-100 line-clamp-2" dangerouslySetInnerHTML={{__html: sq.question_text}}></div>
                                   </div>
                               ))}

                               {/* SUB FORM OVERLAY */}
                               {subQForm.isOpen && (
                                   <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border-2 border-indigo-100 shadow-lg animate-in slide-in-from-bottom-2">
                                       <div className="flex justify-between mb-4">
                                           <div className="flex flex-wrap gap-2">
                                               <button onClick={() => setSubQForm(p => ({...p, type: 'mcq'}))} className={`px-3 py-1 text-xs font-bold rounded border ${subQForm.type === 'mcq' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-slate-200 dark:border-slate-700'}`}>MCQ</button>
                                               <button onClick={() => setSubQForm(p => ({...p, type: 'descriptive'}))} className={`px-3 py-1 text-xs font-bold rounded border ${subQForm.type === 'descriptive' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-slate-200 dark:border-slate-700'}`}>Descriptive</button>
                                           </div>
                                           <button onClick={() => setSubQForm(p => ({...p, isOpen: false}))}><X size={16} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500"/></button>
                                       </div>

                                       <div className="space-y-2">
                                           <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Question Text</label>
                                           <StableEditor uniqueKey={subQForm.editIndex !== null ? `sub-edit-${subQForm.editIndex}` : 'sub-new'} initialContent={subQForm.text} onChange={val => setSubQForm(p => ({...p, text: val}))} />
                                       </div>
                                       
                                       <div className="mt-4 flex gap-4">
                                            <div className="flex-1">
                                                <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Marks</label>
                                                <input type="number" value={subQForm.marks} onChange={e => setSubQForm(p => ({...p, marks: Number(e.target.value)}))} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg p-2 text-sm font-bold mt-1 outline-none focus:ring-2 focus:ring-indigo-500"/>
                                            </div>
                                       </div>

                                       {subQForm.type === 'mcq' && (
                                           <div className="mt-4 space-y-2">
                                               <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Options</label>
                                               {subQForm.options.map((opt, i) => (
                                                   <div key={i} className="flex flex-wrap gap-2 items-center">
                                                       <button onClick={() => { const n = [...subQForm.options]; n.forEach(o => o.is_correct = false); n[i].is_correct = true; setSubQForm(p => ({...p, options: n})); }} className={`p-1.5 rounded-full border ${opt.is_correct ? 'bg-green-500 text-white' : 'text-slate-300'}`}><CheckCircle size={14}/></button>
                                                       <input className="flex-1 border-b text-sm p-1 outline-none" value={opt.option_text} onChange={e => { const n = [...subQForm.options]; n[i].option_text = e.target.value; setSubQForm(p => ({...p, options: n})); }} placeholder={`Option ${i+1}`}/>
                                                   </div>
                                               ))}
                                               <button onClick={() => setSubQForm(p => ({...p, options: [...p.options, {option_text:'', is_correct:false}]}))} className="text-xs text-indigo-600 font-bold hover:underline">+ Option</button>
                                           </div>
                                       )}

                                       <div className="mt-4 space-y-1">
                                            <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Explanation</label>
                                            <StableEditor uniqueKey={subQForm.editIndex !== null ? `sub-expl-${subQForm.editIndex}` : 'sub-expl-new'} initialContent={subQForm.explanation} onChange={val => setSubQForm(p => ({...p, explanation: val}))} />
                                       </div>

                                       <button onClick={saveSubQuestion} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-indigo-700 mt-4 shadow-md">
                                           {subQForm.editIndex !== null ? 'Update Question' : 'Add to Passage'}
                                       </button>
                                   </div>
                               )}
                           </div>
                       </div>
                   )}
               </div>

               <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex justify-end sticky bottom-0 z-10">
                   <button onClick={handleSave} disabled={loading} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95">
                       {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <Save size={18}/>} Save Question
                   </button>
               </div>
           </div>
       )}

       {/* === LIST VIEW === */}
       {view === 'list' && (
           <div className="flex flex-col md:flex-row gap-6 px-6 pb-6 overflow-hidden h-[calc(100vh-140px)]">
               
               {/* SIDEBAR FILTERS */}
               {isSidebarOpen && (
                   <div className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 overflow-y-auto space-y-6 animate-in slide-in-from-left-4 h-full">
                       <div>
                          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Filters</h3>
                          <div className="space-y-3">
                              {/* Segment */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Segment</label>
                                <select className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500" value={filters.segment} onChange={e => { setFilters(p=>({...p, segment:e.target.value})); loadGroups(e.target.value, true); }}><option value="">All Segments</option>{dropdowns.segments.map((s:any) => <option key={s.id} value={s.id}>{s.title}</option>)}</select>
                              </div>
                              {/* Group */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Group</label>
                                <select className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500" value={filters.group} onChange={e => { setFilters(p=>({...p, group:e.target.value})); loadSubjects(e.target.value, true); }} disabled={!filters.segment}><option value="">All Groups</option>{filterGroupsList.map((g:any) => <option key={g.id} value={g.id}>{g.title}</option>)}</select>
                              </div>
                              {/* Subject */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Subject</label>
                                <select className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500" value={filters.subject} onChange={e => setFilters(p=>({...p, subject:e.target.value}))} disabled={!filters.group}><option value="">All Subjects</option>{filterSubjectsList.map((s:any) => <option key={s.id} value={s.id}>{s.title}</option>)}</select>
                              </div>
                              {/* Type */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Type</label>
                                <select className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500" value={filters.type} onChange={e => setFilters(p=>({...p, type:e.target.value}))}><option value="all">All Types</option><option value="mcq">MCQ</option><option value="passage">Passage</option><option value="descriptive">Descriptive</option></select>
                              </div>
                          </div>
                       </div>
                       <button onClick={() => { setFilters({segment:'',group:'',subject:'',type:'all',topic:''}); setSearchQuery(''); }} className="w-full py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">Reset Filters</button>
                   </div>
               )}
               
               {/* MAIN TABLE */}
               <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden flex flex-col h-full">
                   <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50">
                       <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 ml-2"/>
                       <input className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="Search questions or tags..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}/>
                   </div>
                   <div className="flex-1 overflow-auto">
                       <table className="w-full text-left text-sm">
                           <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
                               <tr>
                                   <th className="p-3 font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 text-xs uppercase w-12">#</th>
                                   <th className="p-3 font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 text-xs uppercase">Question</th>
                                   <th className="p-3 font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 text-xs uppercase w-32">Topic</th>
                                   <th className="p-3 font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 text-xs uppercase w-24">Type</th>
                                   <th className="p-3 font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 text-xs uppercase w-20 text-right">Actions</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                               {questions.map((q, i) => (
                                   <tr key={q.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 group border-b border-slate-100 dark:border-slate-800 transition-colors">
                                       <td className="p-3 text-xs text-slate-400 dark:text-slate-500 font-mono">{i + 1 + pagination.page * pagination.itemsPerPage}</td>
                                       <td className="p-3">
                                           <div className="line-clamp-2 text-slate-800 dark:text-slate-100 font-medium" dangerouslySetInnerHTML={{__html: q.question_text}}/>
                                           <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{q.subjects?.title}</div>
                                       </td>
                                       <td className="p-3">
                                           <div className="flex flex-wrap gap-1">
                                               {q.topic_tag?.split(',').slice(0, 2).map((t:string, idx:number) => (
                                                   <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{t}</span>
                                               ))}
                                               {(q.topic_tag?.split(',').length || 0) > 2 && <span className="text-[10px] text-slate-400 dark:text-slate-500">...</span>}
                                           </div>
                                       </td>
                                       <td className="p-3"><span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${q.question_type === 'passage' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 dark:text-slate-500'}`}>{q.question_type}</span></td>
                                       <td className="p-3 text-right">
                                           <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                               <button onClick={() => handleEdit(q)} className="p-1.5 hover:bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400 dark:text-slate-500"><Edit3 size={16}/></button>
                                               <button onClick={() => handleDelete(q.id || '')} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={16}/></button>
                                           </div>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
                   <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center text-xs">
                        <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">Page {pagination.page + 1}</span>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => setPagination(p => ({...p, page: Math.max(0, p.page - 1)}))} disabled={pagination.page === 0} className="px-3 py-1 bg-white dark:bg-slate-900 border rounded disabled:opacity-50">Prev</button>
                            <button onClick={() => setPagination(p => ({...p, page: p.page + 1}))} disabled={!hasMore} className="px-3 py-1 bg-white dark:bg-slate-900 border rounded disabled:opacity-50">Next</button>
                        </div>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
}
