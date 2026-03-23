"use client";
import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Users, 
  GraduationCap, 
  Clock, 
  BookOpen, 
  Trophy,
  DollarSign,
  Edit2,
  Trash2
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import CourseBuilder from "@/components/admin/sections/CourseBuilder";
import ConfirmModal from "@/components/shared/ConfirmModal";

export default function CourseManager({ darkMode = false }: { darkMode?: boolean }) {
    const [view, setView] = useState<'list' | 'builder'>('list');
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        isDangerous?: boolean;
    } | null>(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('courses')
                .select(`
                    *,
                    course_enrollments(id)
                `)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setCourses(data || []);
        } catch (err: any) {
            console.error("Error fetching courses:", err);
            toast.error("Failed to load courses. Check database logs.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNew = () => {
        setSelectedCourse(null);
        setView('builder');
    };

    const handleEdit = (course: any) => {
        setSelectedCourse(course);
        setView('builder');
    };

    const confirmDelete = (id: string | number) => {
        setModalConfig({
            isOpen: true,
            title: "Delete Course?",
            message: "Are you sure you want to delete this course? This will remove all enrollments and content links.",
            isDangerous: true,
            onConfirm: async () => {
                const { error } = await supabase.from('courses').delete().eq('id', id);
                if (!error) {
                    setCourses(prev => prev.filter(c => c.id !== id));
                    toast.success("Course deleted successfully.");
                } else {
                    toast.error("Error deleting course.");
                }
                setModalConfig(null);
            }
        });
    };

    const filteredCourses = courses.filter(c => 
        (c.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (c.level?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {view === 'builder' ? (
                <CourseBuilder 
                    course={selectedCourse} 
                    onBack={() => { setView('list'); fetchCourses(); }} 
                />
            ) : (
                <>
                    {/* Header Area */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Course Management</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Design, publish, and manage professional-grade courses.</p>
                        </div>
                        <button 
                            onClick={handleCreateNew}
                            className="group bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all shadow-xl shadow-indigo-200 dark:shadow-indigo-500/10 hover:-translate-y-1 active:scale-95"
                        >
                            <Plus className="w-5 h-5" /> Create New Course
                        </button>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search courses..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Course Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1,2,3].map(i => <div key={i} className="h-80 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCourses.map(course => (
                                <div 
                                    key={course.id}
                                    className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group overflow-hidden flex flex-col"
                                >
                                    {/* Course Image / Placeholder */}
                                    <div className="h-44 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                        {course.image_url ? (
                                            <img src={course.image_url} alt={course.title} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                                                <GraduationCap size={64} className="group-hover:rotate-12 transition-transform duration-500" />
                                            </div>
                                        )}
                                        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${course.is_published ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                            {course.is_published ? 'Published' : 'Draft'}
                                        </div>
                                        <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ">
                                            <Trophy size={11} className="text-amber-400" /> Certificate
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-8 flex-1 flex flex-col">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">{course.level || 'Intermediate'}</p>
                                        <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight line-clamp-2 leading-tight mb-4 group-hover:text-indigo-600 transition-colors">
                                            {course.title}
                                        </h3>

                                        <div className="flex flex-wrap gap-4 mb-6">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                                                <Users size={14} /> {course.course_enrollments?.length || 0} Students
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                                                <Clock size={14} /> {course.duration || 'Self-paced'}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                                                <BookOpen size={14} /> {course.total_lessons || 0} Lessons
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Access Cost</span>
                                                <span className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-0.5">
                                                    {course.price_type === 'free' ? 'FREE' : 
                                                     course.price_type === 'subscription' ? 'SUBSCRIPTION' : 
                                                     <><DollarSign size={16}/>{course.price}</>}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleEdit(course)}
                                                    className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all"
                                                    title="Edit Course"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => confirmDelete(course.id)}
                                                    className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                                                    title="Delete Course"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {modalConfig && (
                <ConfirmModal 
                    isOpen={modalConfig.isOpen}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    onConfirm={modalConfig.onConfirm}
                    onCancel={() => setModalConfig(null)}
                    isDangerous={modalConfig.isDangerous}
                />
            )}
        </div>
    );
}
