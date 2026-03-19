"use client";
import { useState, useEffect } from "react";
import {
    ArrowLeft,
    Save,
    Plus,
    Clock,
    Trophy,
    DollarSign,
    BookOpen,
    ChevronRight,
    Trash2,
    GripVertical,
    CheckCircle2,
    X,
    Image as ImageIcon,
    Rocket,
    GraduationCap,
    Globe,
    Eye
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface CourseBuilderProps {
    course: any;
    onBack: () => void;
}

export default function CourseBuilder({ course, onBack }: CourseBuilderProps) {
    const [activeStep, setActiveStep] = useState(1); // 1: Info, 2: Curriculum, 3: Pricing, 4: Certificates
    const [saving, setSaving] = useState(false);

    // Course State
    const [courseData, setCourseData] = useState<any>(course || {
        title: "",
        slug: "",
        level: "Beginner",
        price_type: "free",
        price: "0",
        is_published: false,
        certificate_template: "template_1",
        description: "",
        image_url: ""
    });

    // Curriculum State
    const [lessons, setLessons] = useState<any[]>([]);
    const [isPreviewing, setIsPreviewing] = useState<string | null>(null);

    const CertificatePreview = ({ template }: { template: string }) => (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] w-full max-w-4xl aspect-[1.414/1] relative p-12 overflow-hidden shadow-2xl">
                {/* Decorative border */}
                <div className="absolute inset-8 border-[16px] border-double border-indigo-50 leading-relaxed rounded-2xl flex flex-col items-center justify-center text-center">
                    <Trophy size={80} className="text-amber-400 mb-8" />
                    <h1 className="text-5xl font-black text-slate-800 uppercase tracking-tighter mb-4 italic">Certificate of Completion</h1>
                    <div className="w-24 h-1 bg-indigo-600 mb-8"></div>
                    <p className="text-slate-400 uppercase tracking-[0.3em] text-sm font-black mb-12">This is to certify that</p>
                    <div className="text-4xl font-serif text-slate-900 mb-12 border-b-2 border-slate-100 px-12 pb-2 min-w-[300px]">Student Name</div>
                    <p className="text-slate-500 max-w-lg font-medium leading-relaxed">
                        has successfully completed the comprehensive professional course titled
                        <br/>
                        <span className="text-indigo-600 font-black uppercase text-xl mt-4 block">{courseData.title || "Selected Course Name"}</span>
                    </p>
                    <div className="absolute bottom-16 w-full px-24 flex justify-between items-end">
                        <div className="text-left border-t border-slate-200 pt-4 w-40">
                            <p className="text-[10px] font-black uppercase text-slate-400">Date Issued</p>
                            <p className="font-bold text-slate-800">Sept 19, 2026</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl">
                             <GraduationCap className="h-10 opacity-30 text-indigo-200" size={40} />
                        </div>
                        <div className="text-right border-t border-slate-200 pt-4 w-40">
                            <p className="text-[10px] font-black uppercase text-slate-400">Verified By</p>
                            <p className="font-bold text-slate-800">NextPrep Director</p>
                        </div>
                    </div>
                </div>
                <button onClick={() => setIsPreviewing(null)} className="absolute top-8 right-8 p-4 bg-slate-900 text-white rounded-full hover:bg-indigo-600 transition-all shadow-xl"><X size={24} /></button>
            </div>
        </div>
    );

    useEffect(() => {
        if (course?.id) {
            fetchLessons();
        }
    }, [course]);

    const fetchLessons = async () => {
        const { data, error } = await supabase
            .from('course_lessons')
            .select('*, course_contents(*)')
            .eq('course_id', course.id)
            .order('order_index', { ascending: true });
        
        if (!error) setLessons(data || []);
    };

    const handleAddLesson = async () => {
        if (!course?.id) {
            toast.error("Please save general info first.");
            return;
        }
        const { data, error } = await supabase.from('course_lessons').insert({
            course_id: course.id,
            title: "New Lesson",
            order_index: lessons.length
        }).select().single();

        if (!error) {
            setLessons([...lessons, { ...data, course_contents: [] }]);
            toast.success("Lesson added.");
        }
    };

    const handleUpdateLesson = async (id: string, updates: any) => {
        const { error } = await supabase.from('course_lessons').update(updates).eq('id', id);
        if (!error) {
            setLessons(lessons.map(l => l.id === id ? { ...l, ...updates } : l));
        }
    };

    const handleDeleteLesson = async (id: string) => {
        const { error } = await supabase.from('course_lessons').delete().eq('id', id);
        if (!error) {
            setLessons(lessons.filter(l => l.id !== id));
            toast.success("Lesson removed.");
        }
    };

    const handleAddContent = async (lessonId: string) => {
        const { data, error } = await supabase.from('course_contents').insert({
            lesson_id: lessonId,
            title: "New Content Item",
            content_type: 'video',
            order_index: 0
        }).select().single();

        if (!error) {
            setLessons(lessons.map(l => l.id === lessonId ? { ...l, course_contents: [...(l.course_contents || []), data] } : l));
            toast.success("Content added.");
        }
    };

    const handleDeleteContent = async (id: string) => {
        const { error } = await supabase.from('course_contents').delete().eq('id', id);
        if (!error) {
            setLessons(lessons.map(l => ({
                ...l,
                course_contents: l.course_contents?.filter((c: any) => c.id !== id)
            })));
        }
    };

    useEffect(() => {
        if (course?.id) {
            fetchCurriculum();
        }
    }, [course]);

    const fetchCurriculum = async () => {
        const { data, error } = await supabase
            .from('course_lessons')
            .select(`
                *,
                course_contents (*)
            `)
            .eq('course_id', course.id)
            .order('order_index');

        if (!error) setLessons(data || []);
    };

    const handleSaveInfo = async () => {
        setSaving(true);
        try {
            if (courseData.id) {
                // Update
                const { error } = await supabase.from('courses').update({
                    title: courseData.title,
                    level: courseData.level,
                    description: courseData.description,
                    price_type: courseData.price_type,
                    price: courseData.price,
                    certificate_template: courseData.certificate_template,
                    is_published: courseData.is_published,
                    image_url: courseData.image_url
                }).eq('id', courseData.id);
                if (error) throw error;
                toast.success("Course information updated!");
            } else {
                // Create
                const { data, error } = await supabase.from('courses').insert({
                    ...courseData
                }).select().single();
                if (error) throw error;
                setCourseData(data);
                toast.success("Course created successfully!");
            }
            setActiveStep(2);
        } catch (err: any) {
            toast.error(`Error saving: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const steps = [
        { id: 1, name: "General Info", icon: BookOpen },
        { id: 2, name: "Curriculum", icon: GraduationCap },
        { id: 3, name: "Pricing & Access", icon: DollarSign },
        { id: 4, name: "Certificates", icon: Trophy },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight uppercase">
                            {course ? 'Edit Course' : 'Create Course'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
                            {courseData.title || "Untitled Course Draft"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex shadow-sm">
                        {steps.map((step) => (
                            <button
                                key={step.id}
                                onClick={() => (courseData.id || step.id === 1) && setActiveStep(step.id)}
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeStep === step.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600'}`}
                            >
                                <step.icon size={14} /> <span className="hidden sm:inline">{step.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                {/* STEP 1: INFO */}
                {activeStep === 1 && (
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Course Title</label>
                                    <input
                                        type="text"
                                        value={courseData.title}
                                        onChange={e => setCourseData({ ...courseData, title: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 transition-all font-bangla"
                                        placeholder="Enter course name..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Level</label>
                                        <select
                                            value={courseData.level}
                                            onChange={e => setCourseData({ ...courseData, level: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none"
                                        >
                                            <option>Beginner</option>
                                            <option>Intermediate</option>
                                            <option>Advanced</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Status</label>
                                        <div
                                            onClick={() => setCourseData({ ...courseData, is_published: !courseData.is_published })}
                                            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all border-2 ${courseData.is_published ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400'}`}
                                        >
                                            {courseData.is_published ? <Rocket size={16} /> : <BookOpen size={16} />}
                                            <span className="text-xs font-black uppercase tracking-widest">{courseData.is_published ? 'Published' : 'Draft'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Description</label>
                                    <textarea
                                        rows={4}
                                        value={courseData.description}
                                        onChange={e => setCourseData({ ...courseData, description: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-medium outline-none"
                                        placeholder="What will students learn?"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Course Cover Image</label>
                                <div className="aspect-video bg-slate-50 dark:bg-slate-800 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-8 group relative overflow-hidden transition-all hover:border-indigo-400">
                                    {courseData.image_url ? (
                                        <>
                                            <img src={courseData.image_url} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                                            <button onClick={() => setCourseData({ ...courseData, image_url: "" })} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} /></button>
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon size={48} className="text-slate-300 mb-4 group-hover:scale-110 transition-transform" />
                                            <p className="text-xs font-bold text-slate-400">Drag & drop or click to upload</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Or paste an image URL..."
                                    value={courseData.image_url}
                                    onChange={e => setCourseData({ ...courseData, image_url: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-[10px] font-bold outline-none"
                                />
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-50 dark:border-slate-800">
                            <button
                                onClick={handleSaveInfo}
                                disabled={saving || !courseData.title}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all"
                            >
                                {saving ? <><Clock className="animate-spin" /> Saving...</> : <><Save size={18} /> Save & Continue to Curriculum</>}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: CURRICULUM BUILDER */}
                {activeStep === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Summary Bar */}
                        <div className="bg-indigo-600 rounded-[2rem] p-8 text-white flex justify-between items-center shadow-xl shadow-indigo-900/20">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight italic">Content Builder</h3>
                                <p className="text-indigo-100 text-xs font-medium">Add units, lessons, and content to structure your course.</p>
                            </div>
                            <div className="flex gap-3 text-right">
                                <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md">
                                    <span className="text-[10px] font-black uppercase tracking-widest block opacity-70">Total Lessons</span>
                                    <span className="text-lg font-black">{lessons.length}</span>
                                </div>
                                <button 
                                    onClick={handleAddLesson}
                                    className="bg-white text-indigo-600 px-6 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all flex items-center gap-2"
                                >
                                    <Plus size={14} /> New Lesson
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 min-h-[400px]">
                            {lessons.length === 0 ? (
                                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-20 text-center flex flex-col items-center justify-center space-y-6">
                                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-300">
                                        <Plus size={40} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Structured Learning</h4>
                                        <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">Start building your course structure by adding the first lesson.</p>
                                    </div>
                                    <button 
                                        onClick={handleAddLesson}
                                        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all"
                                    >
                                        Add First Lesson
                                    </button>
                                </div>
                            ) : (
                                lessons.map((lesson, lIndex) => (
                                    <div key={lesson.id} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm group/lesson">
                                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-black text-xs">
                                                    {lIndex + 1}
                                                </div>
                                                <input 
                                                    type="text" 
                                                    defaultValue={lesson.title}
                                                    onBlur={(e) => handleUpdateLesson(lesson.id, { title: e.target.value })}
                                                    className="bg-transparent border-none font-black uppercase tracking-tight text-slate-800 dark:text-white outline-none focus:ring-0 w-64"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleDeleteLesson(lesson.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                                <button className="p-2 text-slate-400 cursor-grab active:cursor-grabbing"><GripVertical size={18} /></button>
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-3">
                                            {lesson.course_contents?.map((content: any, cIndex: number) => (
                                                <div key={content.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl group/content border border-transparent hover:border-indigo-100 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-indigo-500">
                                                            {content.content_type === 'video' && <Rocket size={16} />}
                                                            {content.content_type === 'article' && <BookOpen size={16} />}
                                                            {content.content_type === 'quiz' && <CheckCircle2 size={16} />}
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{content.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-0 group-hover/content:opacity-100 transition-opacity">
                                                        <button onClick={() => handleDeleteContent(content.id)} className="p-1.5 text-slate-400 hover:text-red-500"><X size={14} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button 
                                                onClick={() => handleAddContent(lesson.id)}
                                                className="w-full py-3 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Plus size={14} /> Add Content Item
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex justify-between gap-4 pt-6">
                            <button onClick={() => setActiveStep(1)} className="px-8 py-5 bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-slate-800 rounded-2xl font-black uppercase tracking-widest text-[10px]">Previous</button>
                            <button onClick={() => setActiveStep(3)} className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl">Continue to Pricing <ChevronRight size={18} /></button>
                        </div>
                    </div>
                )}

                {/* STEP 3: PRICING */}
                {activeStep === 3 && (
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { id: 'free', label: 'Free Access', icon: Globe, desc: 'Publicly accessible for all logged-in users.' },
                                { id: 'one_time', label: 'One-Time Purchase', icon: DollarSign, desc: 'Users pay once for lifetime access.' },
                                { id: 'subscription', label: 'Subscription Base', icon: Clock, desc: 'Recurring payment models (monthly/yearly).' }
                            ].map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => setCourseData({ ...courseData, price_type: item.id })}
                                    className={`p-8 rounded-[2rem] border-2 cursor-pointer transition-all ${courseData.price_type === item.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-900/20 scale-105' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500 hover:border-indigo-100'}`}
                                >
                                    <item.icon size={32} className={courseData.price_type === item.id ? 'text-white' : 'text-indigo-500'} />
                                    <h4 className="font-black text-lg uppercase tracking-tight mt-6 mb-2">{item.label}</h4>
                                    <p className={`text-[10px] font-medium leading-relaxed ${courseData.price_type === item.id ? 'text-indigo-100' : 'text-slate-400'}`}>{item.desc}</p>
                                    {courseData.price_type === item.id && <div className="mt-8 flex justify-center"><CheckCircle2 size={24} /></div>}
                                </div>
                            ))}
                        </div>

                        {courseData.price_type === 'one_time' && (
                            <div className="max-w-xs mx-auto space-y-4 animate-in zoom-in-95">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Set Selling Price</label>
                                <div className="relative group">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-2xl text-slate-300">$</span>
                                    <input
                                        type="number"
                                        value={courseData.price}
                                        onChange={e => setCourseData({ ...courseData, price: e.target.value })}
                                        className="w-full pl-12 pr-6 py-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] text-3xl font-black outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-center"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex justify-between gap-4">
                            <button onClick={() => setActiveStep(2)} className="px-8 py-5 bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-slate-800 rounded-2xl font-black uppercase tracking-widest text-[10px]">Previous</button>
                            <button onClick={handleSaveInfo} className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl">Complete & Select Certificates <ChevronRight size={18} /></button>
                        </div>
                    </div>
                )}

                {activeStep === 4 && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white flex flex-col items-center text-center shadow-2xl">
                            <Trophy size={64} className="mb-6 animate-bounce" />
                            <h2 className="text-3xl font-black uppercase tracking-tighter italic">Award Mastery</h2>
                            <p className="text-indigo-100 max-w-sm mt-2 font-medium">Select a certificate theme. Students will receive this upon completion of all modules.</p>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(id => (
                                <div
                                    key={id}
                                    onClick={() => setCourseData({ ...courseData, certificate_template: `template_${id}` })}
                                    className={`aspect-[1.4/1] rounded-[2rem] border-4 cursor-pointer p-1 transition-all flex items-center justify-center overflow-hidden relative group ${courseData.certificate_template === `template_${id}` ? 'border-indigo-600 ring-8 ring-indigo-500/10 scale-105' : 'border-slate-100 dark:border-slate-800 grayscale hover:grayscale-0'}`}
                                >
                                    <div className="w-full h-full bg-slate-50 dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center font-black text-slate-300 uppercase tracking-tighter text-center gap-4">
                                        <Trophy size={32} className="opacity-20" />
                                        TEMPLATE {id}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setIsPreviewing(`template_${id}`); }}
                                            className="px-4 py-2 bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black flex items-center gap-2 hover:bg-slate-100 transition-all"
                                        >
                                            <Eye size={12} /> Preview
                                        </button>
                                    </div>
                                    {courseData.certificate_template === `template_${id}` && (
                                        <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center backdrop-blur-[2px]">
                                            <div className="bg-indigo-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                <CheckCircle2 size={14} /> SELECTED
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 flex justify-between gap-4">
                            <button onClick={() => setActiveStep(3)} className="px-8 py-5 bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-slate-800 rounded-2xl font-black uppercase tracking-widest text-[10px]">Previous</button>
                            <button onClick={onBack} className="flex-1 py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl hover:bg-emerald-600 transition-all">Finish & Launch Course</button>
                        </div>
                    </div>
                )}
                {isPreviewing && <CertificatePreview template={isPreviewing} />}
            </div>
        </div>
    );
}
