'use client';

import { useState } from 'react';
import { ChevronDown, PlayCircle, BookOpen, CheckCircle2, Trophy, Clock } from 'lucide-react';

interface CurriculumViewProps {
  lessons: any[];
  isEnrolled?: boolean;
}

export default function CurriculumView({ lessons, isEnrolled = false }: CurriculumViewProps) {
  const [openLessons, setOpenLessons] = useState<string[]>(lessons.length > 0 && isEnrolled ? [lessons[0].id] : []);

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
          className={`border rounded-2xl overflow-hidden shadow-sm transition-all ${openLessons.includes(lesson.id) && isEnrolled ? 'bg-white border-indigo-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}
        >
          {/* LESSON HEADER */}
          <button 
            onClick={() => isEnrolled && toggleLesson(lesson.id)}
            disabled={!isEnrolled}
            className={`w-full px-6 py-5 flex items-center justify-between text-left group ${!isEnrolled ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-4">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${openLessons.includes(lesson.id) && isEnrolled ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'}`}>
                 {index + 1}
               </div>
               <div>
                 <h4 className="font-semibold text-slate-800 text-lg">
                   {lesson.title}
                 </h4>
                 <div className="flex items-center gap-2 mt-1.5">
                   <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                     <PlayCircle size={14} className="text-slate-400" /> {lesson.course_contents?.length || 0} Lessons
                   </span>
                   {!isEnrolled && (
                     <>
                       <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                       <span className="text-xs font-medium text-indigo-500">Enroll to unlock</span>
                     </>
                   )}
                 </div>
               </div>
            </div>
            {isEnrolled && (
              <ChevronDown 
                className={`text-slate-400 transition-transform duration-300 ${openLessons.includes(lesson.id) ? 'rotate-180 text-indigo-500' : 'group-hover:text-slate-600'}`} 
                size={20} 
              />
            )}
          </button>

          {/* LESSON CONTENTS */}
          {isEnrolled && (
            <div className={`overflow-hidden transition-all duration-300 ${openLessons.includes(lesson.id) ? 'max-h-[1000px] border-t border-slate-100' : 'max-h-0'}`}>
              <div className="p-3 space-y-1 bg-slate-50/50">
                {lesson.course_contents?.map((content: any) => (
                  <div key={content.id} className="flex items-center justify-between p-3 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 hover:shadow-sm group">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-100 group-hover:bg-indigo-50 transition-colors">
                        {content.content_type === 'video' && <PlayCircle size={16} />}
                        {content.content_type === 'article' && <BookOpen size={16} />}
                        {content.content_type === 'quiz' && <Trophy size={16} />}
                      </div>
                      <div>
                          <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{content.title}</p>
                          <p className="text-[11px] font-medium text-slate-400 capitalize mt-0.5">{content.content_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {content.is_free_preview && (
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">Preview</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
