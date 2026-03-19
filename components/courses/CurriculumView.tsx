'use client';

import { useState } from 'react';
import { ChevronDown, PlayCircle, BookOpen, CheckCircle2, Trophy, Clock } from 'lucide-react';

interface CurriculumViewProps {
  lessons: any[];
}

export default function CurriculumView({ lessons }: CurriculumViewProps) {
  const [openLessons, setOpenLessons] = useState<string[]>(lessons.length > 0 ? [lessons[0].id] : []);

  const toggleLesson = (id: string) => {
    setOpenLessons(prev => 
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  if (!lessons || lessons.length === 0) {
     return (
       <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
         <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
         <p className="text-slate-500 font-medium">No curriculum items have been added yet.</p>
       </div>
     );
  }

  return (
    <div className="space-y-4">
      {lessons.map((lesson, index) => (
        <div 
          key={lesson.id} 
          className={`border rounded-2xl overflow-hidden shadow-sm transition-all ${openLessons.includes(lesson.id) ? 'bg-white border-indigo-100 ring-4 ring-indigo-50/50' : 'bg-slate-50/50 border-transparent hover:bg-white'}`}
        >
          {/* LESSON HEADER */}
          <button 
            onClick={() => toggleLesson(lesson.id)}
            className="w-full px-6 py-5 flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-4">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 ${openLessons.includes(lesson.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-400 group-hover:border-indigo-200 group-hover:text-indigo-500'}`}>
                 {index + 1}
               </div>
               <div>
                 <h4 className="font-bold text-slate-900 uppercase tracking-tight italic">
                   {lesson.title}
                 </h4>
                 <div className="flex items-center gap-3 mt-1">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                     <PlayCircle size={12} /> {lesson.course_contents?.length || 0} ITEMS
                   </span>
                 </div>
               </div>
            </div>
            <ChevronDown 
              className={`text-slate-400 transition-transform duration-300 ${openLessons.includes(lesson.id) ? 'rotate-180 text-indigo-500' : ''}`} 
              size={20} 
            />
          </button>

          {/* LESSON CONTENTS */}
          <div className={`overflow-hidden transition-all duration-300 ${openLessons.includes(lesson.id) ? 'max-h-[1000px] border-t border-indigo-50' : 'max-h-0'}`}>
            <div className="p-4 space-y-2">
              {lesson.course_contents?.map((content: any) => (
                <div key={content.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                      {content.content_type === 'video' && <PlayCircle size={16} />}
                      {content.content_type === 'article' && <BookOpen size={16} />}
                      {content.content_type === 'quiz' && <Trophy size={16} />}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-700">{content.title}</p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase">{content.content_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {content.is_free_preview && (
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase italic">Preview</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
