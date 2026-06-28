"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Trophy, Download, ShieldCheck, CheckCircle2, Search, DollarSign, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { getPendingPaymentsAdmin, approvePaymentAdmin, rejectPaymentAdmin } from '@/app/actions/payment';
import { toast } from 'sonner';

export default function CourseDashboard({ course, onBack }: { course: any, onBack: () => void }) {
    const [completions, setCompletions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'certificates' | 'payments'>('certificates');
    const [payments, setPayments] = useState<any[]>([]);
    const [processingPayment, setProcessingPayment] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (course?.id) {
            fetchCompletions();
            fetchPayments();
        }
    }, [course]);

    const fetchPayments = async () => {
        const data = await getPendingPaymentsAdmin(course.id);
        setPayments(data);
    };

    const handleApprove = async (paymentId: string, userId: string) => {
        setProcessingPayment(paymentId);
        const res = await approvePaymentAdmin(paymentId, course.id, userId);
        if (res.success) {
            toast.success("Payment approved & User enrolled!");
            fetchPayments();
        } else {
            toast.error(res.error || "Failed to approve payment");
        }
        setProcessingPayment(null);
    };

    const handleReject = async (paymentId: string) => {
        if (!confirm("Are you sure you want to reject this payment?")) return;
        setProcessingPayment(paymentId);
        const res = await rejectPaymentAdmin(paymentId);
        if (res.success) {
            toast.success("Payment rejected.");
            fetchPayments();
        } else {
            toast.error(res.error || "Failed to reject payment");
        }
        setProcessingPayment(null);
    };

    const fetchCompletions = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('course_certificates')
                .select(`
                    id,
                    certificate_code,
                    issued_at,
                    profiles:user_id(id, full_name, email)
                `)
                .eq('course_id', course.id)
                .order('issued_at', { ascending: false });

            if (!error && data) {
                setCompletions(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredCompletions = completions.filter(c => 
        (c.profiles?.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (c.certificate_code?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <button 
                    onClick={onBack}
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-all text-slate-500"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Course Dashboard</h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">{course.title}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Total Enrolled</p>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{course.course_enrollments?.length || 0}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                        <Trophy size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Completions</p>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{completions.length}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Completion Rate</p>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                            {course.course_enrollments?.length ? Math.round((completions.length / course.course_enrollments.length) * 100) : 0}%
                        </h3>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center gap-4 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                        {activeTab === 'certificates' ? 'Certificate Issuance Log' : 'Pending Payments'}
                    </h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="flex border-b border-slate-100 dark:border-slate-800">
                    <button 
                        onClick={() => setActiveTab('certificates')}
                        className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'certificates' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    >
                        Certificate Issuance Log
                    </button>
                    <button 
                        onClick={() => setActiveTab('payments')}
                        className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'payments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    >
                        Pending Payments
                        {payments.length > 0 && (
                            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px]">{payments.length}</span>
                        )}
                    </button>
                </div>

                {activeTab === 'certificates' ? (
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">Student</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">Certificate No.</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">Issue Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-sm text-slate-500">Loading completions...</td>
                                    </tr>
                                ) : filteredCompletions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center">
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                                                <Trophy size={32} className="text-slate-300" />
                                            </div>
                                            <h4 className="text-lg font-semibold text-slate-700">No completions yet</h4>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCompletions.map(cert => (
                                        <tr key={cert.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-800 dark:text-white">{cert.profiles?.full_name || 'Unknown Student'}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{cert.profiles?.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded font-bold">
                                                    {cert.certificate_code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                                    {new Date(cert.issued_at).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-slate-400 hover:text-indigo-600 p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 transition-all">
                                                    <Download size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <th className="p-4 pl-6">Student Email</th>
                                    <th className="p-4">Method & Amount</th>
                                    <th className="p-4">Sender Number</th>
                                    <th className="p-4">Transaction ID</th>
                                    <th className="p-4 text-right pr-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-slate-500">
                                            <CheckCircle2 size={40} className="mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                                            <p className="font-semibold">No pending payments.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map(payment => (
                                        <tr key={payment.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 pl-6 font-semibold text-sm text-slate-700 dark:text-slate-300">
                                                {payment.user?.email || 'Unknown User'}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${payment.payment_method === 'bkash' ? 'text-[#E2136E]' : 'text-[#F37021]'}`}>
                                                        {payment.payment_method}
                                                    </span>
                                                    <span className="font-semibold text-slate-900 dark:text-white">৳{payment.amount}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                                                {payment.sender_number}
                                            </td>
                                            <td className="p-4">
                                                <span className="font-mono text-sm font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300 uppercase">
                                                    {payment.transaction_id}
                                                </span>
                                            </td>
                                            <td className="p-4 pr-6 flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleReject(payment.id)}
                                                    disabled={processingPayment === payment.id}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                                                >
                                                    <XCircle size={14} /> Reject
                                                </button>
                                                <button 
                                                    onClick={() => handleApprove(payment.id, payment.user_id)}
                                                    disabled={processingPayment === payment.id}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 bg-emerald-50 hover:emerald-100 transition-colors disabled:opacity-50"
                                                >
                                                    {processingPayment === payment.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Approve
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
