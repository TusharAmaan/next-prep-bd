'use client';

import { useState, useEffect } from 'react';
import { 
  PlayCircle, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Menu, 
  X,
  Layout,
  Clock,
  ChevronDown,
  HelpCircle,
  AlertCircle,
  Trophy
} from 'lucide-react';
import { updateProgress } from '@/app/actions/enrollment';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CoursePlayerProps {
  course: any;
  lessons: any[];
  initialProgress: any[];
}

export default function CoursePlayer({ course, lessons, initialProgress }: CoursePlayerProps) {
  const router = useRouter();
  const [activeContent, setActiveContent] = useState<any>(null);
  const [completedItems, setCompletedItems] = useState<string[]>(
    initialProgress.filter(p => p.is_completed).map(p => p.content_id)
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openLessons, setOpenLessons] = useState<string[]>([]);

  // Quiz States
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Initialize first uncompleted item or first item
  useEffect(() => {
    if (lessons.length > 0) {
      let firstItem = null;
      let firstLessonId = null;

      // Find first uncompleted
      for (const lesson of lessons) {
        if (!firstItem && lesson.course_contents) {
          const uncompleted = lesson.course_contents.find((c: any) => !completedItems.includes(c.id));
          if (uncompleted) {
            firstItem = uncompleted;
            firstLessonId = lesson.id;
            break;
          }
        }
      }

      // Fallback to absolute first item
      if (!firstItem && lessons[0].course_contents?.length > 0) {
        firstItem = lessons[0].course_contents[0];
        firstLessonId = lessons[0].id;
      }

      if (firstItem) {
        setActiveContent(firstItem);
        setOpenLessons(prev => [...new Set([...prev, firstLessonId as string])]);
      }
    }
  }, [lessons]);

  // Reset quiz state when active content changes
  useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  }, [activeContent?.id]);

  const handleMarkAsCompleted = async (contentId: string, autoProceed = false) => {
    if (completedItems.includes(contentId)) {
      if (autoProceed) handleNextItem();
      return;
    }

    setCompletedItems(prev => [...prev, contentId]);
    const result = await updateProgress(contentId, true);
    
    if (result.error) {
      toast.error('Failed to save progress');
      setCompletedItems(prev => prev.filter(id => id !== contentId));
    } else {
      if (autoProceed) {
        handleNextItem();
      } else {
        toast.success('Progress saved!');
      }
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
      l.course_contents?.forEach((c: any) => flatItems.push(c));
    });

    const currentIndex = flatItems.findIndex(c => c.id === activeContent.id);
    if (currentIndex < flatItems.length - 1) {
      return flatItems[currentIndex + 1];
    }
    return null;
  };

  const nextItem = findNextItem();

  const handleNextItem = () => {
    if (nextItem) {
       setActiveContent(nextItem);
       const lesson = lessons.find(l => l.course_contents?.some((c: any) => c.id === nextItem.id));
       if (lesson && !openLessons.includes(lesson.id)) {
          setOpenLessons(prev => [...prev, lesson.id]);
       }
    } else {
       toast.success("Congratulations! You have completed all course materials.");
       router.push(`/courses/${course.id}`);
    }
  };

  const currentLesson = lessons.find(l => l.course_contents?.some((c: any) => c.id === activeContent?.id));

  const handleQuizSubmit = () => {
    if (!activeContent.mcqs) return;
    const passingScore = currentLesson?.passing_score || 0;
    
    let score = 0;
    activeContent.mcqs.forEach((mcq: any) => {
      if (quizAnswers[mcq.id] === mcq.correctOptionId) {
        score++;
      }
    });
    
    setQuizScore(score);
    setQuizSubmitted(true);

    if (score >= passingScore) {
       toast.success(`You passed with a score of ${score}!`);
       handleMarkAsCompleted(activeContent.id, false);
    } else {
       toast.error(`You scored ${score}. You need ${passingScore} to pass. Please review and try again.`);
    }
  };

  const handleQuizRetry = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const totalItemsCount = lessons.reduce((acc, l) => acc + (l.course_contents?.length || 0), 0);
  const progressPercentage = totalItemsCount === 0 ? 0 : Math.round((completedItems.length / totalItemsCount) * 100);

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans text-slate-800">
      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-40 w-[320px] bg-slate-50 border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-200 bg-white">
          <Link href={`/courses/${course.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 mb-4 transition-colors">
            <ChevronLeft size={16} /> Back to Course
          </Link>
          <h2 className="text-lg font-bold text-slate-900 leading-tight mb-3 line-clamp-2">{course.title}</h2>
          
          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>{progressPercentage}% Completed</span>
              <span>{completedItems.length}/{totalItemsCount}</span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Course Curriculum Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {lessons.map((lesson, index) => {
            const isLessonOpen = openLessons.includes(lesson.id);
            const isLessonActive = currentLesson?.id === lesson.id;
            
            return (
              <div key={lesson.id} className="mb-2">
                <button 
                  onClick={() => toggleLesson(lesson.id)}
                  className={`w-full flex items-start justify-between p-3 rounded-lg text-left transition-colors ${isLessonActive ? 'bg-indigo-50/50 border border-indigo-100' : 'hover:bg-slate-100 border border-transparent'}`}
                >
                  <div className="flex flex-col gap-1 pr-3">
                    <span className="text-xs font-bold text-slate-500">Module {index + 1}</span>
                    <span className={`text-sm font-semibold leading-snug ${isLessonActive ? 'text-indigo-900' : 'text-slate-800'}`}>
                      {lesson.title}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 mt-1 text-slate-400 shrink-0 transition-transform ${isLessonOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isLessonOpen && lesson.course_contents && (
                  <div className="mt-1 ml-3 pl-3 border-l-2 border-slate-100 space-y-1 py-1">
                    {lesson.course_contents.map((content: any) => {
                      const isActive = activeContent?.id === content.id;
                      const isCompleted = completedItems.includes(content.id);
                      
                      return (
                        <button
                          key={content.id}
                          onClick={() => setActiveContent(content)}
                          className={`w-full flex items-start gap-3 p-2.5 rounded-md text-left transition-all ${
                            isActive 
                              ? 'bg-indigo-600 text-white shadow-sm' 
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div className={`mt-0.5 shrink-0 ${isActive ? 'text-indigo-200' : (isCompleted ? 'text-emerald-500' : 'text-slate-400')}`}>
                            {isCompleted ? (
                              <CheckCircle2 size={16} className={isActive ? "text-white" : ""} />
                            ) : content.content_type === 'video' ? (
                              <PlayCircle size={16} />
                            ) : content.content_type === 'quiz' ? (
                              <HelpCircle size={16} />
                            ) : (
                              <BookOpen size={16} />
                            )}
                          </div>
                          <span className={`text-sm font-medium line-clamp-2 ${isActive ? 'text-white' : 'text-slate-700'}`}>
                            {content.title}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 shrink-0 bg-white z-10">
           <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-md text-slate-600 transition-colors lg:hidden"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-2 text-indigo-600">
                <Layout size={18} />
                <span className="text-sm font-bold tracking-tight">NextPrep Learning</span>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              {activeContent?.estimated_time && (
                <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
                  <Clock size={14} /> {activeContent.estimated_time}
                </div>
              )}
           </div>
        </header>

        {/* Content Scroll Container */}
        <main className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
          {!activeContent ? (
            <div className="h-full flex items-center justify-center flex-col text-slate-400 p-12 text-center">
              <Layout className="w-16 h-16 mb-4 opacity-20 animate-pulse" />
              <h2 className="text-xl font-semibold text-slate-600">Loading content...</h2>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full p-6 md:p-10 space-y-10 pb-32">
              
              <div className="space-y-4 border-b border-slate-100 pb-6">
                 <h1 className="text-3xl font-bold text-slate-900 leading-tight">
                    {activeContent.title}
                 </h1>
              </div>

              {/* VIDEO PLAYER (If content has a video URL) */}
              {(activeContent.content_type === 'video' || activeContent.video_url) && activeContent.video_url && (
                <div className="w-full rounded-2xl overflow-hidden bg-black shadow-lg aspect-video ring-1 ring-slate-200">
                  <iframe 
                    src={activeContent.video_url.includes('youtube') ? activeContent.video_url.replace('watch?v=', 'embed/') : activeContent.video_url} 
                    className="w-full h-full border-0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              )}

              {/* RICH TEXT ARTICLE BODY */}
              {activeContent.article_body && (
                <div 
                  className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-a:text-indigo-600"
                  dangerouslySetInnerHTML={{ __html: activeContent.article_body }}
                />
              )}

              {/* MCQ QUIZ INTERFACE */}
              {activeContent.content_type === 'quiz' && activeContent.mcqs && activeContent.mcqs.length > 0 && (
                <div className="space-y-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-10">
                  <div className="flex items-center justify-between mb-2 border-b border-slate-200 pb-6">
                    <h2 className="text-xl font-bold text-slate-800">Knowledge Check</h2>
                    <span className="text-sm font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                      Passing Score: {currentLesson?.passing_score || 0} / {activeContent.mcqs.length}
                    </span>
                  </div>

                  {activeContent.mcqs.map((mcq: any, idx: number) => (
                    <div key={mcq.id} className="space-y-4">
                      <p className="text-lg font-semibold text-slate-900 flex gap-3">
                         <span className="text-indigo-600">{idx + 1}.</span> 
                         <span>{mcq.question}</span>
                      </p>
                      
                      <div className="space-y-3 ml-6">
                        {mcq.options.map((opt: any) => {
                          const isSelected = quizAnswers[mcq.id] === opt.id;
                          const isSubmitted = quizSubmitted;
                          const isCorrect = mcq.correctOptionId === opt.id;
                          const showCorrectness = isSubmitted && (isSelected || isCorrect);
                          
                          let bgClass = "bg-white border-slate-200 hover:border-indigo-300";
                          if (isSelected) bgClass = "bg-indigo-50 border-indigo-500 text-indigo-900";
                          if (showCorrectness) {
                             if (isCorrect) bgClass = "bg-emerald-50 border-emerald-500 text-emerald-900";
                             else if (isSelected && !isCorrect) bgClass = "bg-red-50 border-red-500 text-red-900";
                          }

                          return (
                            <label 
                              key={opt.id} 
                              className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${bgClass} ${isSubmitted && !showCorrectness ? 'opacity-50' : ''}`}
                            >
                              <input 
                                type="radio" 
                                name={`question-${mcq.id}`} 
                                value={opt.id}
                                checked={isSelected}
                                onChange={() => !quizSubmitted && setQuizAnswers(prev => ({ ...prev, [mcq.id]: opt.id }))}
                                disabled={quizSubmitted}
                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                              />
                              <span className="font-medium text-[15px]">{opt.text}</span>
                            </label>
                          )
                        })}
                      </div>
                      
                      {quizSubmitted && mcq.explanation && (
                         <div className="ml-6 p-4 bg-blue-50 text-blue-800 rounded-xl border border-blue-100 text-sm flex gap-3">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <div>
                               <span className="font-bold block mb-1">Explanation:</span>
                               {mcq.explanation}
                            </div>
                         </div>
                      )}
                    </div>
                  ))}

                  <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                    {!quizSubmitted ? (
                      <button 
                        onClick={handleQuizSubmit}
                        disabled={Object.keys(quizAnswers).length < activeContent.mcqs.length}
                        className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors shadow-sm"
                      >
                        Submit Answers
                      </button>
                    ) : (
                      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                           {quizScore >= (currentLesson?.passing_score || 0) ? (
                              <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-lg">
                                 <CheckCircle2 size={20} /> Passed ({quizScore}/{activeContent.mcqs.length})
                              </div>
                           ) : (
                              <div className="flex items-center gap-2 text-red-600 font-bold bg-red-50 px-4 py-2 rounded-lg">
                                 <X size={20} /> Failed ({quizScore}/{activeContent.mcqs.length})
                              </div>
                           )}
                        </div>
                        
                        {quizScore < (currentLesson?.passing_score || 0) ? (
                          <button 
                            onClick={handleQuizRetry}
                            className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors"
                          >
                            Retry Quiz
                          </button>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ACTION FOOTER */}
              <div className="pt-10 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                 <button 
                   onClick={() => handleMarkAsCompleted(activeContent.id, false)}
                   disabled={completedItems.includes(activeContent.id) || (activeContent.content_type === 'quiz' && (!quizSubmitted || quizScore < (currentLesson?.passing_score || 0)))}
                   className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                     completedItems.includes(activeContent.id) 
                       ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                       : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed'
                   }`}
                 >
                   {completedItems.includes(activeContent.id) ? (
                     <><CheckCircle2 size={18} /> Mark as Incomplete</>
                   ) : (
                     'Mark as Completed'
                   )}
                 </button>
                 
                 {nextItem ? (
                   <button 
                     onClick={() => {
                        handleMarkAsCompleted(activeContent.id, true);
                     }}
                     className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                   >
                      Next Item <ChevronRight size={18} />
                   </button>
                 ) : (
                   <Link href={`/courses/${course.id}`} className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-sm">
                      Finish Course <Trophy size={18} />
                   </Link>
                 )}
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
