"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Copy, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseName: string;
    amount: string | number;
    onSubmit: (data: { method: "bkash" | "nagad" | "upay", senderNumber: string, transactionId: string }) => Promise<void>;
}

export default function PaymentModal({ isOpen, onClose, courseName, amount, onSubmit }: PaymentModalProps) {
    const [method, setMethod] = useState<"bkash" | "nagad" | "upay" | null>(null);
    const [senderNumber, setSenderNumber] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Hardcoded official numbers for the demo
    const officialNumbers = {
        bkash: "01619663933",
        nagad: "01745775697",
        upay: "01828677148"
    };

    if (!isOpen || !mounted) return null;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Number copied to clipboard!");
    };

    const handleSubmit = async () => {
        if (!method) return toast.error("Please select a payment method.");
        if (!senderNumber || senderNumber.length < 11) return toast.error("Please enter a valid sender number.");
        if (!transactionId || transactionId.length < 5) return toast.error("Please enter a valid Transaction ID.");

        setSubmitting(true);
        try {
            await onSubmit({ method, senderNumber, transactionId });
            // The parent will handle closing and success message if needed, or we can close it here
        } catch (err: any) {
            toast.error(err.message || "Failed to submit payment.");
        } finally {
            setSubmitting(false);
        }
    };

    const getPalette = () => {
        if (method === "bkash") return { bg: "bg-[#E2136E]", text: "text-[#E2136E]", border: "border-[#E2136E]", ring: "focus:ring-[#E2136E]/20", headerText: "text-white", headerSub: "text-white/80", closeIcon: "text-white/70 hover:text-white", btnText: "text-white" };
        if (method === "nagad") return { bg: "bg-[#F37021]", text: "text-[#F37021]", border: "border-[#F37021]", ring: "focus:ring-[#F37021]/20", headerText: "text-white", headerSub: "text-white/80", closeIcon: "text-white/70 hover:text-white", btnText: "text-white" };
        if (method === "upay") return { bg: "bg-[#FFC107]", text: "text-[#D9A406]", border: "border-[#FFC107]", ring: "focus:ring-[#FFC107]/20", headerText: "text-slate-900", headerSub: "text-slate-700", closeIcon: "text-slate-600 hover:text-slate-900", btnText: "text-slate-900" };
        return { bg: "bg-slate-800", text: "text-indigo-600", border: "border-slate-800", ring: "focus:ring-indigo-600/20", headerText: "text-white", headerSub: "text-white/80", closeIcon: "text-white/70 hover:text-white", btnText: "text-white" };
    };

    const palette = getPalette();

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className={`p-6 ${palette.bg} transition-colors duration-500`}>
                    <button onClick={onClose} className={`absolute top-4 right-4 ${palette.closeIcon} transition-colors`}>
                        <X size={20} />
                    </button>
                    <h3 className={`text-xl font-bold ${palette.headerText} mb-1`}>Complete Your Payment</h3>
                    <p className={`${palette.headerSub} text-sm`}>{courseName}</p>
                </div>

                <div className="p-6 md:p-8 space-y-8">
                    {/* Amount to pay */}
                    <div className="text-center">
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-2">Amount to Pay</p>
                        <p className={`text-4xl font-bold ${palette.text} transition-colors duration-500`}>৳{amount}</p>
                    </div>

                    {!method ? (
                        /* Step 1: Select Method */
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 text-center mb-6">Select your preferred payment method</p>

                            <button
                                onClick={() => setMethod("bkash")}
                                className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-[#E2136E] hover:bg-[#E2136E]/5 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#E2136E] rounded-full flex items-center justify-center text-white font-bold text-xs tracking-tighter">bKash</div>
                                    <span className="font-bold text-slate-800 dark:text-white group-hover:text-[#E2136E] transition-colors">Pay with bKash</span>
                                </div>
                            </button>

                            <button
                                onClick={() => setMethod("nagad")}
                                className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-[#F37021] hover:bg-[#F37021]/5 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#F37021] rounded-full flex items-center justify-center text-white font-bold text-xs tracking-tighter">Nagad</div>
                                    <span className="font-bold text-slate-800 dark:text-white group-hover:text-[#F37021] transition-colors">Pay with Nagad</span>
                                </div>
                            </button>

                            <button
                                onClick={() => setMethod("upay")}
                                className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-[#FFC107] hover:bg-[#FFC107]/5 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#FFC107] rounded-full flex items-center justify-center text-slate-900 font-bold text-xs tracking-tighter">Upay</div>
                                    <span className="font-bold text-slate-800 dark:text-white group-hover:text-[#D9A406] transition-colors">Pay with Upay</span>
                                </div>
                            </button>
                        </div>
                    ) : (
                        /* Step 2: Pay and Submit */
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className={`p-4 rounded-xl border ${method === 'bkash' ? 'bg-[#E2136E]/5 border-[#E2136E]/20' : method === 'nagad' ? 'bg-[#F37021]/5 border-[#F37021]/20' : 'bg-[#FFC107]/5 border-[#FFC107]/30'}`}>
                                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">1. Send money to this official number:</p>
                                <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <span className={`font-mono font-bold text-lg ${palette.text}`}>{officialNumbers[method]}</span>
                                    <button onClick={() => handleCopy(officialNumbers[method])} className="p-2 text-slate-400 hover:text-slate-700 transition-colors bg-slate-50 rounded-md">
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">2. Enter your payment details below:</p>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Sender Number</label>
                                    <input
                                        type="text"
                                        value={senderNumber}
                                        onChange={e => setSenderNumber(e.target.value)}
                                        placeholder="e.g. 01XXXXXXXXX"
                                        className={`w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-xl outline-none focus:border-current ${palette.text} ${palette.ring} transition-all font-medium`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Transaction ID</label>
                                    <input
                                        type="text"
                                        value={transactionId}
                                        onChange={e => setTransactionId(e.target.value)}
                                        placeholder="e.g. 8K4P9L2X"
                                        className={`w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-xl outline-none focus:border-current uppercase ${palette.text} ${palette.ring} transition-all font-medium`}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setMethod(null)}
                                    className="px-6 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 ${palette.bg} ${palette.btnText} opacity-90 hover:opacity-100 transition-all disabled:opacity-50`}
                                >
                                    {submitting ? "Verifying..." : "Verify Payment"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
