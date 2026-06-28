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
    Eye,
    ChevronDown
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { 
    saveCourseAdmin, 
    addLessonAdmin, 
    updateLessonAdmin, 
    deleteLessonAdmin, 
    addContentAdmin, 
    updateContentAdmin, 
    deleteContentAdmin 
} from "@/app/actions/admin";
import { toast } from "sonner";
import ConfirmModal from "@/components/shared/ConfirmModal";
import ContentItemEditor from "./ContentItemEditor";
import RichTextEditor from "@/components/shared/RichTextEditor";

interface CourseBuilderProps {
    course: any;
    onBack: () => void;
}

export default function CourseBuilder({ course, onBack }: CourseBuilderProps) {
    const supabase = createClient();
    const [activeStep, setActiveStep] = useState(1); // 1: Info, 2: Curriculum, 3: Pricing, 4: Certificates
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [levelDropdownOpen, setLevelDropdownOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);

    const markDirty = () => !isDirty && setIsDirty(true);

    // Course State
    const [courseData, setCourseData] = useState<any>(course || {
        title: "",
        slug: "",
        level: "Beginner",
        price_type: "free",
        price: "0",
        is_published: false,
        instructor_signature_text: "",
        instructor_signature_font: "Caveat",
        description: "",
        image_url: ""
    });

    // Curriculum State
    const [lessons, setLessons] = useState<any[]>([]);
    const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);
    const [dragOverLessonId, setDragOverLessonId] = useState<string | null>(null);
    const [isPreviewing, setIsPreviewing] = useState<string | null>(null);
    const [editingContentId, setEditingContentId] = useState<string | null>(null);
    const [descriptionMode, setDescriptionMode] = useState<'visual' | 'code'>('visual');

    const CertificatePreview = ({ template }: { template: string }) => (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl w-full max-w-4xl aspect-[1.414/1] relative p-12 overflow-hidden shadow-2xl">
                {/* Decorative border */}
                <div className="absolute inset-8 border-[16px] border-double border-indigo-50 leading-relaxed rounded-2xl flex flex-col items-center justify-center text-center">
                    <Trophy size={80} className="text-amber-400 mb-8" />
                    <h1 className="text-4xl font-bold text-slate-800 capitalize tracking-tight mb-4 italic">Certificate of Completion</h1>
                    <div className="w-24 h-1 bg-indigo-600 mb-8"></div>
                    <p className="text-slate-400  tracking-widest text-sm font-semibold mb-12">This is to certify that</p>
                    <div className="text-4xl font-serif text-slate-900 mb-12 border-b-2 border-slate-100 px-12 pb-2 min-w-[300px]">Student Name</div>
                    <p className="text-slate-500 max-w-lg font-medium leading-relaxed">
                        has successfully completed the comprehensive professional course titled
                        <br/>
                        <span className="text-indigo-600 font-semibold  text-xl mt-4 block">{courseData.title || "Selected Course Name"}</span>
                    </p>
                    <div className="absolute bottom-16 w-full px-24 flex justify-between items-end">
                        <div className="text-left border-t border-slate-200 pt-4 w-40">
                            <p className="text-[10px] font-semibold  text-slate-400">Date Issued</p>
                            <p className="font-bold text-slate-800">Sept 19, 2026</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl">
                             <GraduationCap className="h-10 opacity-30 text-indigo-200" size={40} />
                        </div>
                        <div className="text-right border-t border-slate-200 pt-4 w-40">
                            <p className="text-[10px] font-semibold  text-slate-400">Verified By</p>
                            <p className="font-bold text-slate-800">NextPrep Director</p>
                        </div>
                    </div>
                </div>
                <button onClick={() => setIsPreviewing(null)} className="absolute top-8 right-8 p-4 bg-slate-900 text-white rounded-full hover:bg-indigo-600 transition-all shadow-xl"><X size={24} /></button>
            </div>
        </div>
    );

    useEffect(() => {
        if (courseData?.id) {
            fetchLessons();
        }
    }, [courseData.id]);

    const fetchLessons = async () => {
        if (!courseData?.id) return;
        const { data, error } = await supabase
            .from('course_lessons')
            .select('*, course_contents(*)')
            .eq('course_id', courseData.id)
            .order('order_index', { ascending: true });
        
        if (!error) setLessons(data || []);
    };

    const handleAddLesson = async () => {
        if (!courseData?.id) {
            toast.error("Please save general info first.");
            return;
        }
        try {
            const data = await addLessonAdmin(Number(courseData.id), lessons.length);
            setLessons([...lessons, { ...data, course_contents: [] }]);
            toast.success("Lesson added.");
        } catch (error: any) {
            console.error("Insert error:", error);
            toast.error(`Error adding lesson: ${error.message}`);
        }
    };

    const handleUpdateLesson = async (id: string, updates: any) => {
        try {
            await updateLessonAdmin(id, updates);
            setLessons(lessons.map(l => l.id === id ? { ...l, ...updates } : l));
        } catch (error: any) {
            toast.error(`Failed to update lesson: ${error.message}`);
        }
    };

    const handleDeleteLesson = async (id: string) => {
        try {
            await deleteLessonAdmin(id);
            setLessons(lessons.filter(l => l.id !== id));
            toast.success("Lesson removed.");
        } catch (error: any) {
            toast.error(`Failed to delete lesson: ${error.message}`);
        }
    };

    const handleAddContent = async (lessonId: string) => {
        try {
            const lesson = lessons.find(l => l.id === lessonId);
            const data = await addContentAdmin(lessonId, lesson?.course_contents?.length || 0);
            setLessons(lessons.map(l => l.id === lessonId ? { ...l, course_contents: [...(l.course_contents || []), data] } : l));
            toast.success("Content added.");
        } catch (error: any) {
            toast.error(`Failed to add content: ${error.message}`);
        }
    };

    const handleUpdateContentFull = async (id: string, updates: any) => {
        setLessons(lessons.map(l => ({
            ...l,
            course_contents: l.course_contents?.map((c: any) => c.id === id ? { ...c, ...updates } : c)
        })));
        markDirty();

        try {
            await updateContentAdmin(id, updates);
            setEditingContentId(null);
            toast.success("Content saved.");
        } catch (error: any) {
            toast.error(`Failed to update content: ${error.message}`);
        }
    };

    const handleDeleteContent = async (id: string) => {
        try {
            await deleteContentAdmin(id);
            setLessons(lessons.map(l => ({
                ...l,
                course_contents: l.course_contents?.filter((c: any) => c.id !== id)
            })));
        } catch (error: any) {
            toast.error(`Failed to delete content: ${error.message}`);
        }
    };

    const handleUpdateContent = async (id: string, updates: any) => {
        try {
            await updateContentAdmin(id, updates);
            setLessons(lessons.map(l => ({
                ...l,
                course_contents: l.course_contents?.map((c: any) => c.id === id ? { ...c, ...updates } : c)
            })));
        } catch (error: any) {
            toast.error(`Failed to update content: ${error.message}`);
        }
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedLessonId(id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id); // Required for Firefox
    };

    const handleDragOver = (e: React.DragEvent, id: string) => {
        e.preventDefault(); // Necessary to allow dropping
        setDragOverLessonId(id);
    };

    const handleDragEnd = () => {
        setDraggedLessonId(null);
        setDragOverLessonId(null);
    };

    const handleDrop = async (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        setDragOverLessonId(null);
        if (!draggedLessonId || draggedLessonId === targetId) {
            setDraggedLessonId(null);
            return;
        }

        const sourceIndex = lessons.findIndex(l => l.id === draggedLessonId);
        const targetIndex = lessons.findIndex(l => l.id === targetId);

        if (sourceIndex === -1 || targetIndex === -1) return;

        const newLessons = [...lessons];
        const [movedItem] = newLessons.splice(sourceIndex, 1);
        newLessons.splice(targetIndex, 0, movedItem);

        const updatedLessons = newLessons.map((l, idx) => ({ ...l, order_index: idx }));
        setLessons(updatedLessons);
        setDraggedLessonId(null);

        try {
            await Promise.all(
                updatedLessons.map(l => updateLessonAdmin(l.id, { order_index: l.order_index }))
            );
            toast.success("Lessons reordered.");
        } catch (error: any) {
            toast.error("Failed to save new order.");
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
            .eq('course_id', courseData.id)
            .order('order_index');

        if (!error) setLessons(data || []);
    };

    const handleSaveInfo = async (nextStep: number = 2) => {
        setSaving(true);
        try {
            // Using Server Action to bypass RLS for guest testing
            const res = await saveCourseAdmin({
                id: courseData.id,
                title: courseData.title,
                level: courseData.level,
                description: courseData.description,
                price_type: courseData.price_type,
                price: courseData.price,
                discount_price: courseData.discount_price,
                instructor_signature_text: courseData.instructor_signature_text,
                instructor_signature_font: courseData.instructor_signature_font,
                is_published: courseData.is_published,
                image_url: courseData.image_url
            });
            
            if (!courseData.id && res?.id) {
                setCourseData(res);
                toast.success("Course created successfully!");
            } else {
                toast.success("Course information updated!");
            }
            setIsDirty(false);
            if (nextStep === 4) {
                // Done! Navigate back.
                onBack();
            } else {
                setActiveStep(nextStep);
            }
        } catch (err: any) {
            toast.error(`Error saving: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const steps = [
        { id: 1, name: "General Info", icon: BookOpen },
        { id: 2, name: "Curriculum", icon: GraduationCap },
        { id: 3, name: "Pricing & Publish", icon: DollarSign },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => isDirty ? setModalConfig({
                            isOpen: true,
                            title: "Discard Changes?",
                            message: "You have unsaved changes. Are you sure you want to go back?",
                            onConfirm: onBack
                        }) : onBack()}
                        className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
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
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-semibold capitalize tracking-wide flex items-center gap-2 transition-all active:scale-95 ${activeStep === step.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-500/10' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600'}`}
                            >
                                <step.icon size={14} /> <span className="hidden sm:inline">{step.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full">
                {/* STEP 1: INFO */}
                {activeStep === 1 && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 capitalize tracking-wide mb-2">Course Title</label>
                                    <input
                                        type="text"
                                        value={courseData.title}
                                        onChange={e => { setCourseData({ ...courseData, title: e.target.value }); markDirty(); }}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 transition-all"
                                        placeholder="Enter course name..."
                                    />
                                </div>
                            </div>

                            {/* DESCRIPTION */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-[10px] font-semibold text-slate-500 capitalize tracking-wide">Course Description</label>
                                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                        <button 
                                            onClick={() => setDescriptionMode('visual')}
                                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${descriptionMode === 'visual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Visual
                                        </button>
                                        <button 
                                            onClick={() => setDescriptionMode('code')}
                                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${descriptionMode === 'code' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            HTML Code
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                                    {descriptionMode === 'visual' ? (
                                        <RichTextEditor 
                                            initialValue={courseData.description}
                                            onChange={(val) => { setCourseData({ ...courseData, description: val }); markDirty(); }}
                                        />
                                    ) : (
                                        <textarea
                                            rows={12}
                                            value={courseData.description}
                                            onChange={e => { setCourseData({ ...courseData, description: e.target.value }); markDirty(); }}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none px-5 py-4 text-sm font-mono outline-none resize-y"
                                            placeholder="<p>What will students learn?</p>"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* LEVEL AND STATUS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 capitalize tracking-wide mb-2">Level</label>
                                    <div className="relative">
                                        <div 
                                            onClick={() => setLevelDropdownOpen(!levelDropdownOpen)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold outline-none cursor-pointer flex justify-between items-center group transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                                        >
                                            <span className="text-slate-800 dark:text-white">{courseData.level}</span>
                                            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${levelDropdownOpen ? 'rotate-180' : ''}`} />
                                        </div>
                                        {levelDropdownOpen && (
                                            <>
                                                <div 
                                                    className="fixed inset-0 z-40" 
                                                    onClick={() => setLevelDropdownOpen(false)}
                                                ></div>
                                                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white dark:bg-[#1E232F] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                                                        <div 
                                                            key={level}
                                                            onClick={() => {
                                                                setCourseData({ ...courseData, level });
                                                                setLevelDropdownOpen(false);
                                                                markDirty();
                                                            }}
                                                            className={`px-5 py-3.5 text-sm font-semibold cursor-pointer transition-colors ${courseData.level === level ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'}`}
                                                        >
                                                            {level}
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 capitalize tracking-wide mb-2">Status</label>
                                    <div
                                        onClick={() => setCourseData({ ...courseData, is_published: !courseData.is_published })}
                                        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all border-2 ${courseData.is_published ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400'}`}
                                    >
                                        {courseData.is_published ? <Rocket size={16} /> : <BookOpen size={16} />}
                                        <span className="text-xs font-semibold capitalize tracking-wide">{courseData.is_published ? 'Published' : 'Draft'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* COVER IMAGE */}
                            <div className="space-y-4">
                                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Course Cover Image</label>
                                <div className="aspect-[3/1] bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-8 group relative overflow-hidden transition-all hover:border-indigo-400 w-full">
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

                        {/* SIGNATURE SECTION */}
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 mt-8 space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Trophy size={16} className="text-amber-500" /> Certificate Signature Setup
                                </h3>
                                <p className="text-[10px] text-slate-500 mt-1">This signature will automatically appear on student certificates upon course completion.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Instructor Name (for signature)</label>
                                    <input
                                        type="text"
                                        value={courseData.instructor_signature_text || ""}
                                        onChange={e => { setCourseData({ ...courseData, instructor_signature_text: e.target.value }); markDirty(); }}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 transition-all"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Signature Font Style</label>
                                    <select
                                        value={courseData.instructor_signature_font || "Caveat"}
                                        onChange={e => { setCourseData({ ...courseData, instructor_signature_font: e.target.value }); markDirty(); }}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 transition-all"
                                    >
                                        <option value="Caveat">Caveat (Modern Casual)</option>
                                        <option value="Great Vibes">Great Vibes (Elegant Script)</option>
                                        <option value="Dancing Script">Dancing Script (Dynamic)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Admin Name (Fixed Signature)</label>
                                    <input
                                        type="text"
                                        value={courseData.admin_signature_text || "MD Tushar Aman"}
                                        onChange={e => { setCourseData({ ...courseData, admin_signature_text: e.target.value }); markDirty(); }}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 transition-all"
                                        placeholder="e.g. MD Tushar Aman"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Admin Signature Font Style</label>
                                    <select
                                        value={courseData.admin_signature_font || "Caveat"}
                                        onChange={e => { setCourseData({ ...courseData, admin_signature_font: e.target.value }); markDirty(); }}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 transition-all"
                                    >
                                        <option value="Caveat">Caveat (Modern Casual)</option>
                                        <option value="Great Vibes">Great Vibes (Elegant Script)</option>
                                        <option value="Dancing Script">Dancing Script (Dynamic)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {courseData.instructor_signature_text && (
                                    <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center min-h-[120px]">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-4">Instructor Preview</p>
                                        <span style={{ fontFamily: `'${courseData.instructor_signature_font}', cursive` }} className="text-4xl text-slate-800 dark:text-white">
                                            {courseData.instructor_signature_text}
                                        </span>
                                    </div>
                                )}
                                {(courseData.admin_signature_text || "MD Tushar Aman") && (
                                    <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center min-h-[120px]">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-4">Admin Preview</p>
                                        <span style={{ fontFamily: `'${courseData.admin_signature_font || 'Caveat'}', cursive` }} className="text-4xl text-slate-800 dark:text-white">
                                            {courseData.admin_signature_text || "MD Tushar Aman"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-50 dark:border-slate-800">
                            <button
                                onClick={() => handleSaveInfo(2)}
                                disabled={saving || !courseData.title}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                            >
                                {saving ? <><Clock className="animate-spin w-4 h-4" /> Saving...</> : <><Save size={18} /> Save & Continue to Curriculum</>}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: CURRICULUM BUILDER */}
                {activeStep === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Header */}
                        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-6 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Curriculum Builder</h3>
                                <p className="text-slate-500 text-sm mt-1">Structure your course by adding modules and lessons.</p>
                            </div>
                            <button 
                                onClick={handleAddLesson}
                                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-all flex items-center gap-2"
                            >
                                <Plus size={16} /> Add Module
                            </button>
                        </div>

                        <div className="space-y-4 min-h-[300px]">
                            {lessons.length === 0 ? (
                                <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
                                        <BookOpen size={24} />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-800 dark:text-white">No Modules Yet</h4>
                                    <p className="text-slate-500 text-sm max-w-sm mt-2 mb-6">Create your first module to start organizing your course content.</p>
                                    <button 
                                        onClick={handleAddLesson}
                                        className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                    >
                                        Add First Module
                                    </button>
                                </div>
                            ) : (
                                lessons.map((lesson, lIndex) => (
                                    <div 
                                        key={lesson.id} 
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, lesson.id)}
                                        onDragOver={(e) => handleDragOver(e, lesson.id)}
                                        onDragEnd={handleDragEnd}
                                        onDrop={(e) => handleDrop(e, lesson.id)}
                                        className={`bg-white dark:bg-slate-900 rounded-xl border ${dragOverLessonId === lesson.id ? 'border-indigo-500 shadow-lg scale-[1.01]' : 'border-slate-200 dark:border-slate-800'} shadow-sm overflow-hidden group/lesson transition-all duration-200 ${draggedLessonId === lesson.id ? 'opacity-50' : 'opacity-100'}`}
                                    >
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 cursor-move" onDragOver={(e) => e.preventDefault()}>
                                            <div className="flex items-center gap-3 flex-1 mr-4">
                                                <div className="w-6 h-6 shrink-0 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded flex items-center justify-center font-bold text-xs">
                                                    {lIndex + 1}
                                                </div>
                                                <input 
                                                    type="text" 
                                                    defaultValue={lesson.title}
                                                    onBlur={(e) => handleUpdateLesson(lesson.id, { title: e.target.value })}
                                                    className="bg-transparent border-none font-semibold text-slate-800 dark:text-white outline-none focus:ring-0 w-full text-sm"
                                                />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="flex items-center gap-2 mr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5">
                                                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Passing Score:</span>
                                                    <input 
                                                        type="number" 
                                                        defaultValue={lesson.passing_score || 0}
                                                        onBlur={(e) => handleUpdateLesson(lesson.id, { passing_score: parseInt(e.target.value) || 0 })}
                                                        className="w-12 bg-transparent border-none text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-0 p-0 text-center"
                                                        min="0"
                                                    />
                                                </div>
                                                <button onClick={() => handleDeleteLesson(lesson.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"><Trash2 size={16} /></button>
                                                <button className="p-1.5 text-slate-400 cursor-grab active:cursor-grabbing hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors" title="Drag to reorder"><GripVertical size={16} /></button>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-2 bg-slate-50/50 dark:bg-slate-800/20">
                                            {lesson.course_contents?.map((content: any, cIndex: number) => (
                                                <div key={content.id}>
                                                    {editingContentId === content.id ? (
                                                        <div className="my-4 rounded-xl shadow-lg border border-indigo-200 dark:border-indigo-800 overflow-hidden">
                                                            <ContentItemEditor 
                                                                content={content} 
                                                                onSave={handleUpdateContentFull} 
                                                                onCancel={() => setEditingContentId(null)} 
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div 
                                                            onClick={() => setEditingContentId(content.id)}
                                                            className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg group/content hover:border-indigo-300 dark:hover:border-indigo-600 transition-all shadow-sm cursor-pointer mb-2"
                                                        >
                                                            <div className="flex items-center gap-3 w-full">
                                                                <div className="text-slate-400">
                                                                    {content.content_type === 'video' && <Rocket size={14} />}
                                                                    {content.content_type === 'article' && <BookOpen size={14} />}
                                                                    {content.content_type === 'quiz' && <CheckCircle2 size={14} />}
                                                                </div>
                                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1">{content.title || 'Untitled Content'}</span>
                                                                
                                                                {/* Summary pills */}
                                                                <div className="flex gap-2">
                                                                    {content.content_type === 'quiz' && content.mcqs?.length > 0 && (
                                                                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">{content.mcqs.length} MCQs</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 opacity-0 group-hover/content:opacity-100 transition-opacity">
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteContent(content.id); }} 
                                                                    className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-800 rounded"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            <button 
                                                onClick={() => handleAddContent(lesson.id)}
                                                className="w-full py-2.5 mt-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Plus size={14} /> Add Content Item
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800 mt-8">
                            <button onClick={() => setActiveStep(1)} className="px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Back</button>
                            <button onClick={() => setActiveStep(3)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-sm">Next Step <ChevronRight size={16} /></button>
                        </div>
                    </div>
                )}

                {/* STEP 3: PRICING */}
                {activeStep === 3 && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { id: 'free', label: 'Free Access', icon: Globe, desc: 'Publicly accessible for all logged-in users.' },
                                { id: 'one_time', label: 'One-Time Purchase', icon: DollarSign, desc: 'Users pay once for lifetime access.' },
                                { id: 'subscription', label: 'Subscription Base', icon: Clock, desc: 'Recurring payment models (monthly/yearly).' }
                            ].map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => setCourseData({ ...courseData, price_type: item.id })}
                                    className={`p-8 rounded-2xl border transition-all cursor-pointer ${courseData.price_type === item.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${courseData.price_type === item.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                            <item.icon size={24} />
                                        </div>
                                        {courseData.price_type === item.id && <CheckCircle2 size={24} className="text-indigo-600 dark:text-indigo-400" />}
                                    </div>
                                    <h4 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">{item.label}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        {(courseData.price_type === 'one_time' || courseData.price_type === 'subscription') && (
                            <div className="max-w-3xl mx-auto pt-8 border-t border-slate-100 dark:border-slate-800 space-y-8 animate-in fade-in">
                                <div className="text-center mb-10">
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Set your course pricing</h3>
                                    <p className="text-sm text-slate-500 mt-2">Enter the regular price and an optional discounted price to attract more students.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Regular Price</label>
                                        <div className="relative group">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-medium text-slate-400">৳</span>
                                            <input
                                                type="number"
                                                value={courseData.price}
                                                onChange={e => setCourseData({ ...courseData, price: e.target.value })}
                                                className="w-full pl-12 pr-6 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-2xl text-2xl font-semibold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 focus:border-indigo-500 transition-all shadow-sm"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Discounted Price <span className="font-normal text-slate-400">(Optional)</span></label>
                                        <div className="relative group">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-medium text-emerald-500/50">৳</span>
                                            <input
                                                type="number"
                                                value={courseData.discount_price || ""}
                                                onChange={e => setCourseData({ ...courseData, discount_price: e.target.value })}
                                                className="w-full pl-12 pr-6 py-5 bg-emerald-50/30 dark:bg-emerald-900/5 border border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-200 focus:border-emerald-500 rounded-2xl text-2xl font-semibold outline-none focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/20 transition-all text-emerald-700 dark:text-emerald-400 shadow-sm"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-10 mt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-4">
                            <button onClick={() => setActiveStep(2)} className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-base hover:bg-slate-50 transition-all shadow-sm">Previous</button>
                            <button onClick={() => handleSaveInfo(4)} className="flex-1 md:flex-none px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"><CheckCircle2 size={20} /> Save & Launch Course</button>
                        </div>
                    </div>
                )}

                {modalConfig && (
                    <ConfirmModal 
                        isOpen={modalConfig.isOpen}
                        title={modalConfig.title}
                        message={modalConfig.message}
                        onConfirm={modalConfig.onConfirm}
                        onCancel={() => setModalConfig(null)}
                    />
                )}
            </div>
        </div>
    );
}
