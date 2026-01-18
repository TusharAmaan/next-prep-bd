"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Plus, Trash2, Search, CheckCircle, 
  ArrowRight, GripVertical, BookOpen 
} from "lucide-react";

interface QuestionLinkerProps {
  resourceId: number | string; // The ID of the Blog/Resource we are editing
}

export default function QuestionLinker({ resourceId }: QuestionLinkerProps) {
  const supabase = createClient();
  
  // State
  const [linkedQuestions, setLinkedQuestions] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // --- INITIAL LOAD ---
  useEffect(() => {
    if (resourceId) {
      fetchLinkedQuestions();
    }
  }, [resourceId]);

  // --- FETCHERS ---
  const fetchLinkedQuestions = async () => {
    // Join resource_questions -> question_bank
    const { data, error } = await supabase
      .from('resource_questions')
      .select(`
        id,
        order_index,
        question:question_bank (
          id, question_text, question_type, topic_tag, marks
        )
      `)
      .eq('resource_id', resourceId)
      .order('order_index', { ascending: true });

    if (data) setLinkedQuestions(data);
  };

  const searchBank = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) return;

    // Search available questions (exclude ones already linked ideally, but simple search first)
    // We filter for PARENTS only (standalone questions or passage containers)
    const { data } = await supabase
      .from('question_bank')
      .select('*')
      .ilike('question_text', `%${query}%`)
      .is('parent_id', null) 
      .limit(10);

    if (data) {
      // Filter out questions that are already linked
      const linkedIds = new Set(linkedQuestions.map(lq => lq.question.id));
      setSearchResults(data.filter(q => !linkedIds.has(q.id)));
    }
  };

  // --- ACTIONS ---
  const handleAddQuestion = async (questionId: string) => {
    if (!resourceId) return alert("Save the resource first before adding questions.");
    setLoading(true);

    // Calculate next order index
    const nextIndex = linkedQuestions.length > 0 
      ? Math.max(...linkedQuestions.map(l => l.order_index)) + 1 
      : 0;

    const { error } = await supabase
      .from('resource_questions')
      .insert({
        resource_id: Number(resourceId),
        question_id: questionId,
        order_index: nextIndex
      });

    if (error) {
      alert("Error linking question: " + error.message);
    } else {
      await fetchLinkedQuestions();
      // Remove from search results instantly for UI snap
      setSearchResults(prev => prev.filter(q => q.id !== questionId));
    }
    setLoading(false);
  };

  const handleRemoveQuestion = async (linkId: number) => {
    const { error } = await supabase
      .from('resource_questions')
      .delete()
      .eq('id', linkId);

    if (error) alert("Error removing: " + error.message);
    else fetchLinkedQuestions();
  };

  // --- RENDERERS ---
  const renderQuestionCard = (q: any, isLinked: boolean, linkId?: number) => (
    <div key={q.id} className={`p-3 rounded-lg border flex items-start justify-between gap-3 group ${isLinked ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 border-dashed hover:border-indigo-300'}`}>
        <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${q.question_type === 'passage' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {q.question_type}
                </span>
                {q.topic_tag && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{q.topic_tag}</span>}
            </div>
            <div className="text-sm font-medium text-slate-800 line-clamp-2" dangerouslySetInnerHTML={{__html: q.question_text}}></div>
        </div>
        
        {isLinked ? (
            <button 
                onClick={() => linkId && handleRemoveQuestion(linkId)}
                className="text-slate-400 hover:text-red-500 p-1"
                title="Unlink Question"
            >
                <Trash2 size={16} />
            </button>
        ) : (
            <button 
                onClick={() => handleAddQuestion(q.id)}
                className="bg-white border border-indigo-200 text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors shadow-sm"
                title="Link to Blog"
            >
                {loading ? <span className="animate-spin text-xs">⏳</span> : <Plus size={16} />}
            </button>
        )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[600px]">
      
      {/* LEFT COL: LINKED QUESTIONS */}
      <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-slate-50/50">
        <div className="p-4 border-b bg-white flex justify-between items-center">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600"/> 
                Linked Questions ({linkedQuestions.length})
            </h3>
            <span className="text-xs text-slate-400">These will appear on the blog</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {linkedQuestions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-6">
                    <BookOpen size={40} className="mb-2 opacity-20"/>
                    <p className="text-sm font-medium">No questions linked yet.</p>
                    <p className="text-xs">Search and add questions from the right.</p>
                </div>
            ) : (
                linkedQuestions.map(link => renderQuestionCard(link.question, true, link.id))
            )}
        </div>
      </div>

      {/* RIGHT COL: SEARCH BANK */}
      <div className="flex flex-col h-full border rounded-xl overflow-hidden bg-white">
        <div className="p-4 border-b bg-slate-50 space-y-3">
            <h3 className="font-bold text-slate-700">Search Question Bank</h3>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input 
                    className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    placeholder="Search by text, topic, or type..."
                    value={searchQuery}
                    onChange={(e) => searchBank(e.target.value)}
                />
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {searchResults.length === 0 ? (
                <div className="text-center p-8 text-slate-400 text-sm">
                    {searchQuery ? "No matching questions found." : "Type to search..."}
                </div>
            ) : (
                searchResults.map(q => renderQuestionCard(q, false))
            )}
        </div>
      </div>

    </div>
  );
}