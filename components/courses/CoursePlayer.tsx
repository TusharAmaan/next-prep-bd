'use client';

import { useState, useEffect } from 'react';
import { 
  PlayCircle, 
  BookOpen, 
  Trophy, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Menu, 
  X,
  Layout,
  Clock,
  ChevronDown
} from 'lucide-react';
import { updateProgress } from '@/app/actions/enrollment';
import { toast } from 'sonner';

interface CoursePlayerProps {
  course: any;
  lessons: any[];
  initialProgress: any[];
}

export default function CoursePlayer({ course, lessons, initialProgress }: CoursePlayerProps) {
  const [activeContent, setActiveContent] = useState<any>(null);
  const [completedItems, setCompletedItems] = useState<string[]>(
    initialProgress.filter(p => p.is_completed).map(p => p.content_id)
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openLessons, setOpenLessons] = useState<string[]>([]);

  // Initialize first item
  useEffect(() => {
    if (lessons.length > 0 && lessons[0].course_contents?.length > 0) {
      setActiveContent(lessons[0].course_contents[0]);
      setOpenLessons([lessons[0].id]);
    }
  }, [lessons]);

  const handleMarkAsCompleted = async (contentId: string) => {
    if (completedItems.includes(contentId)) return;

    setCompletedItems(prev => [...prev, contentId]);
    const result = await updateProgress(contentId, true);
    if (result.error) {
      toast.error('Failed to save progress');
      setCompletedItems(prev => prev.filter(id => id !== contentId));
    } else {
      toast.success('Progress saved!');
    }
  };

  const toggleLesson = (id: string) => {
    setOpenLessons(prev => 
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const findNextItem = () => {
    if (!activeContent) return null;
    
    let flatItems: any[] = [];
    lessons.forEach(l => {
      l.course_contents.forEach((c: any) => flatItems.push(c));
    });

    const currentIndex = flatItems.findIndex(c => c.id === activeContent.id);
    if (currentIndex < flatItems.length - 1) {
      return flatItems[currentIndex + 1];
    }
    return null;
  };

  const nextItem = findNextItem();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-900 text-white">
            <h2 className="text-xl font-black uppercase tracking-tighter italic mb-1">{course.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500" 
                  style={{ width: `${(completedItems.length / lessons.reduce((acc, l) => acc + (l.course_contents?.length || 0), 0)) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-black">{Math.round((completedItems.length / lessons.reduce((acc, l) => acc + (l.course_contents?.length || 0), 0)) * 100)}%</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {lessons.map((lesson, index) => (
              <div key={lesson.id} className="space-y-1">
                <button 
                  onClick={() => toggleLesson(lesson.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors ${openLessons.includes(lesson.id) ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 w-4">{index + 1}</span>
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-tight italic">{lesson.title}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openLessons.includes(lesson.id) ? 'rotate-180' : ''}`} />
                </button>
                
                {openLessons.includes(lesson.id) && (
                  <div className="ml-7 space-y-1">
                    {lesson.course_contents.map((content: any) => (
                      <button
                        key={content.id}
                        onClick={() => setActiveContent(content)}
                        className={`w-full flex items-center justify-between p-2 pl-3 rounded-lg text-left text-xs transition-all ${activeContent?.id === content.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                      >
                        <div className="flex items-center gap-2">
                          {content.content_type === 'video' && <PlayCircle size={14} />}
                          {content.content_type === 'article' && <BookOpen size={14} />}
                          {content.content_type === 'quiz' && <Trophy size={14} />}
                          <span className="font-medium truncate max-w-[120px]">{content.title}</span>
                        </div>
                        {completedItems.includes(content.id) && (
                          <CheckCircle2 size={14} className={activeContent?.id === content.id ? 'text-white' : 'text-emerald-500'} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
             <button onClick={() => window.history.back()} className="text-[10px] font-black uppercase text-slate-500 hover:text-indigo-600 flex items-center gap-1">
               <ChevronLeft size={14} /> Back to Course
             </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 relative z-30 shadow-sm">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors lg:hidden"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-2">
                <Layout size={20} className="text-indigo-600" />
                <h1 className="text-sm font-black text-slate-900 uppercase tracking-tighter italic hidden sm:block">NextPrep Player</h1>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <Clock size={12} /> {activeContent?.estimated_time || "15m"}
              </div>
              <button className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
                <X size={18} />
              </button>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 scroll-smooth custom-scrollbar">
          {!activeContent ? (
            <div className="h-full flex items-center justify-center flex-col text-slate-300 p-12 text-center">
              <Layout className="w-20 h-20 mb-6 opacity-10 animate-pulse" />
              <h2 className="text-2xl font-black uppercase tracking-tighter italic">Loading content...</h2>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto w-full p-6 md:p-10 space-y-10">
              {/* CONTENT VIEW */}
              <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden aspect-video border-8 border-slate-800 relative group">
                {activeContent.content_type === 'video' ? (
                  <iframe 
                    src={activeContent.video_url?.includes('youtube') ? activeContent.video_url.replace('watch?v=', 'embed/') : activeContent.video_url} 
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white gap-6 bg-gradient-to-br from-indigo-900 to-slate-900 p-12 text-center">
                    {activeContent.content_type === 'quiz' ? <Trophy size={64} className="text-amber-400" /> : <BookOpen size={64} className="text-indigo-400" />}
                    <div>
                      <h2 className="text-4xl font-black uppercase tracking-tighter italic mb-4">{activeContent.title}</h2>
                      <p className="text-indigo-200 font-medium max-w-xl mx-auto text-lg leading-relaxed">This item contains reading material or a quiz. Please scroll down to read and complete.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ARTICLE BODY */}
              {activeContent.content_type === 'article' && (
                <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-10 md:p-16">
                  <h2 className="text-4xl font-black text-slate-900 mb-10 border-b border-slate-50 pb-8 uppercase tracking-tighter italic">{activeContent.title}</h2>
                  <div 
                    className="prose prose-xl prose-indigo max-w-none text-slate-600 font-medium leading-[1.8]"
                    dangerouslySetInnerHTML={{ __html: activeContent.article_body }}
                  />
                </div>
              )}

              {/* ACTION BAR */}
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 ring-1 ring-slate-200/50">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      {activeContent.content_type === 'video' && <PlayCircle size={24} />}
                      {activeContent.content_type === 'article' && <BookOpen size={24} />}
                      {activeContent.content_type === 'quiz' && <Trophy size={24} />}
                   </div>
                   <div>
                      <h3 className="font-black text-slate-900 uppercase tracking-tighter italic leading-none">{activeContent.title}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{activeContent.content_type} ITEM</p>
                   </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                   <button 
                    onClick={() => handleMarkAsCompleted(activeContent.id)}
                    disabled={completedItems.includes(activeContent.id)}
                    className={`flex-1 md:flex-none px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all transform active:scale-95 ${completedItems.includes(activeContent.id) ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/30'}`}
                   >
                     {completedItems.includes(activeContent.id) ? (
                       <><CheckCircle2 size={16} /> Completed</>
                     ) : (
                       'Mark as Completed'
                     )}
                   </button>
                   
                   {nextItem && (
                     <button 
                       onClick={() => setActiveContent(nextItem)}
                       className="flex-1 md:flex-none bg-slate-900 text-white hover:bg-black px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/10 group"
                     >
                        Next <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                     </button>
                   )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
