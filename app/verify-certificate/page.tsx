"use client";

import React, { useState } from 'react';
import { Search, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function VerifyCertificatePage() {
    const [certCode, setCertCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');
    const supabase = createClient();

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!certCode.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            // Check the database for the certificate code
            const { data, error } = await supabase
                .from('course_certificates')
                .select(`
                    id, 
                    certificate_code, 
                    issued_at,
                    profiles(full_name),
                    courses(title)
                `)
                .eq('certificate_code', certCode.trim().toUpperCase())
                .single();

            if (error || !data) {
                setError("Certificate not found or invalid. Please check the code and try again.");
            } else {
                setResult(data);
            }
        } catch (err) {
            setError("An error occurred while verifying the certificate.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-20 px-4 font-sans">
            <div className="w-full max-w-2xl text-center mb-10">
                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck size={40} />
                </div>
                <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Verify Certificate</h1>
                <p className="text-slate-500 mt-3 text-lg">Enter the unique certificate number to verify its authenticity.</p>
            </div>

            <div className="w-full max-w-xl bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                <form onSubmit={handleVerify} className="relative">
                    <div className="relative flex items-center">
                        <Search className="absolute left-6 text-slate-400" size={24} />
                        <input
                            type="text"
                            value={certCode}
                            onChange={(e) => setCertCode(e.target.value.toUpperCase())}
                            placeholder="e.g. NPBD-XXXX-XXXX"
                            className="w-full pl-16 pr-36 py-6 bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-2xl text-xl font-semibold tracking-widest outline-none transition-all placeholder:text-slate-300 placeholder:font-normal uppercase"
                        />
                        <button
                            type="submit"
                            disabled={loading || !certCode}
                            className="absolute right-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-6 py-4 rounded-xl font-semibold tracking-wide transition-all"
                        >
                            {loading ? "Checking..." : "Verify"}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="mt-6 p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-600 animate-in fade-in slide-in-from-bottom-2">
                        <XCircle size={24} className="shrink-0" />
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {result && (
                    <div className="mt-8 bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center border-b border-emerald-100 pb-6 mb-6">
                            <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-emerald-800">Certificate Verified!</h3>
                            <p className="text-emerald-600 font-medium mt-1">This is a valid NextPrepBD certificate.</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4 border-b border-emerald-100/50 pb-4">
                                <div className="text-emerald-700/70 text-sm font-semibold uppercase tracking-wider">Student</div>
                                <div className="col-span-2 text-emerald-900 font-bold text-lg">{result.profiles?.full_name || 'Unknown Student'}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 border-b border-emerald-100/50 pb-4">
                                <div className="text-emerald-700/70 text-sm font-semibold uppercase tracking-wider">Course</div>
                                <div className="col-span-2 text-emerald-900 font-bold">{result.courses?.title || 'Unknown Course'}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 border-b border-emerald-100/50 pb-4">
                                <div className="text-emerald-700/70 text-sm font-semibold uppercase tracking-wider">Issue Date</div>
                                <div className="col-span-2 text-emerald-900 font-bold">{new Date(result.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 pt-2">
                                <div className="text-emerald-700/70 text-sm font-semibold uppercase tracking-wider">Cert No.</div>
                                <div className="col-span-2 text-emerald-900 font-bold tracking-widest bg-emerald-100/50 px-3 py-1 rounded inline-block w-max">{result.certificate_code}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
