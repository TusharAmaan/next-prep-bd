import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Clock, CheckCircle2, PlayCircle, Trophy, BookOpen, GraduationCap, XCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Student Dashboard | NextPrep BD',
};

export default async function StudentDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  // Fetch enrollments
  const { data: enrollments } = await supabase
    .from('course_enrollments')
    .select(`
        id, 
        course_id, 
        status,
        course:course_id(title, image_url, level)
    `)
    .eq('user_id', user.id);

  // Fetch manual payments
  const { data: payments } = await supabase
    .from('manual_payments')
    .select(`
        id, 
        amount, 
        status, 
        payment_method, 
        transaction_id, 
        created_at,
        course:course_id(title)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch certificates (completed courses)
  const { data: certificates } = await supabase
    .from('course_certificates')
    .select('course_id, certificate_code, issued_at')
    .eq('user_id', user.id);

  const completedCourseIds = new Set(certificates?.map(c => c.course_id) || []);

  const enrolledCourses = enrollments?.filter(e => !completedCourseIds.has(e.course_id)) || [];
  const completedCourses = enrollments?.filter(e => completedCourseIds.has(e.course_id)) || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Student Dashboard</h1>
                <p className="text-slate-500 mt-2">Welcome back! Here's an overview of your learning journey.</p>
            </div>

            {/* Payments Section */}
            {payments && payments.length > 0 && (
                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Clock className="text-indigo-600" /> Pending & Recent Payments
                    </h2>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <th className="p-4 pl-6">Course</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">Method & TX ID</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map(payment => (
                                        <tr key={payment.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 pl-6 font-semibold text-sm text-slate-700 dark:text-slate-300">
                                                {(payment.course as any)?.title || (Array.isArray(payment.course) ? (payment.course[0] as any)?.title : 'Unknown Course')}
                                            </td>
                                            <td className="p-4 font-bold text-slate-900 dark:text-white">
                                                ৳{payment.amount}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${payment.payment_method === 'bkash' ? 'text-[#E2136E]' : 'text-[#F37021]'}`}>
                                                        {payment.payment_method}
                                                    </span>
                                                    <span className="font-mono text-sm font-semibold text-slate-500">{payment.transaction_id}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                                                {new Date(payment.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                {payment.status === 'pending' && <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"><Clock size={14} /> Pending</span>}
                                                {payment.status === 'approved' && <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"><CheckCircle2 size={14} /> Approved</span>}
                                                {payment.status === 'rejected' && <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"><XCircle size={14} /> Rejected</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            )}

            {/* Enrolled Courses */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <BookOpen className="text-indigo-600" /> Enrolled Courses
                </h2>
                {enrolledCourses.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500">
                        <GraduationCap size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                        <p className="font-semibold text-lg text-slate-700 dark:text-slate-300">No active enrollments yet.</p>
                        <Link href="/courses" className="mt-4 inline-block text-indigo-600 hover:text-indigo-700 font-bold transition-colors">Browse Courses &rarr;</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrolledCourses.map(enrollment => (
                            <div key={enrollment.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all group flex flex-col">
                                <div className="h-40 bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                                    {(enrollment.course as any)?.image_url ? (
                                        <img src={(enrollment.course as any).image_url} alt={(enrollment.course as any)?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : Array.isArray(enrollment.course) && (enrollment.course[0] as any)?.image_url && (
                                        <img src={(enrollment.course[0] as any).image_url} alt={(enrollment.course[0] as any)?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    )}
                                    <div className="absolute top-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold capitalize shadow-sm">
                                        {(enrollment.course as any)?.level || (Array.isArray(enrollment.course) ? (enrollment.course[0] as any)?.level : 'Intermediate')}
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-6 line-clamp-2">
                                        {(enrollment.course as any)?.title || (Array.isArray(enrollment.course) ? (enrollment.course[0] as any)?.title : 'Unknown Course')}
                                    </h3>
                                    <div className="mt-auto">
                                        <Link href={`/courses/${enrollment.course_id}/learn`} className="w-full py-3 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-400 hover:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                                            <PlayCircle size={18} /> Continue Learning
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Completed Courses */}
            {completedCourses.length > 0 && (
                <section className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Trophy className="text-emerald-600" /> Completed Courses
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {completedCourses.map(enrollment => (
                            <div key={enrollment.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-emerald-100 dark:border-emerald-900/30 hover:shadow-lg transition-all group flex flex-col relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-16 -mt-16 z-0"></div>
                                <div className="p-6 flex-1 flex flex-col relative z-10">
                                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                                        <Trophy size={24} />
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2">
                                        {(enrollment.course as any)?.title || (Array.isArray(enrollment.course) ? (enrollment.course[0] as any)?.title : 'Unknown Course')}
                                    </h3>
                                    <p className="text-sm font-medium text-emerald-600 flex items-center gap-1.5 mb-6"><CheckCircle2 size={16} /> Completed</p>
                                    <div className="mt-auto">
                                        <Link href={`/courses/${enrollment.course_id}/certificate`} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm">
                                            <Trophy size={18} /> View Certificate
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

        </div>
    </div>
  );
}
