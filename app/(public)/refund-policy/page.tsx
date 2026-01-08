import { Metadata } from "next";
import Link from "next/link";
import { RefreshCcw, FileText, CheckCircle2, XCircle, Mail, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund Policy | NextPrepBD",
  description: "Read the Refund Policy for NextPrepBD. Understand the conditions under which refunds are granted for our digital products and courses.",
};

export default function RefundPage() {
  const lastUpdated = "January 8, 2026"; 

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 text-indigo-600 rounded-2xl mb-4">
            <RefreshCcw className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">
            Refund Policy
          </h1>
          <p className="text-slate-500 font-medium">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* CONTENT CONTAINER */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 md:p-12 space-y-10 text-slate-700 leading-relaxed">

            {/* 1. Overview */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 text-sm font-black">1</span>
                Overview
              </h2>
              <p className="mb-4">
                At <strong>NextPrepBD</strong>, we strive to provide high-quality educational resources. However, we understand that there may be exceptional circumstances. This policy outlines the conditions under which you may be eligible for a refund for our paid services (e.g., Premium Courses, Paid eBooks).
              </p>
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex gap-3">
                <AlertTriangle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-sm text-indigo-900 font-medium">
                  Please read this policy carefully before making any purchase. By purchasing a product, you agree to these terms.
                </p>
              </div>
            </section>

            {/* 2. Eligibility for Refund */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 text-sm font-black">2</span>
                Eligibility Conditions
              </h2>
              <p className="mb-4">
                You may request a refund within <strong>48 hours</strong> of your purchase if one of the following conditions applies:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Technical Issues</h3>
                    <p className="text-xs text-slate-500 mt-1">The file/course is corrupted, or you are unable to access the content due to a technical error on our end that we cannot resolve.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Wrong Product</h3>
                    <p className="text-xs text-slate-500 mt-1">You were charged for a product different from the one you intended to purchase due to a system glitch.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Non-Refundable Items */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 text-sm font-black">3</span>
                Non-Refundable Items
              </h2>
              <p className="mb-4">
                Refunds will <strong>NOT</strong> be granted in the following situations:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-sm">You simply changed your mind after purchasing.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-sm">You purchased the wrong course by mistake and have already accessed or downloaded the materials.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-sm">More than 48 hours have passed since the transaction date.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-sm">Issues caused by your own device, internet connection, or lack of required software (e.g., PDF reader).</span>
                </li>
              </ul>
            </section>

            {/* 4. Refund Process */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 text-sm font-black">4</span>
                How to Request a Refund
              </h2>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <ol className="list-decimal pl-5 space-y-3 text-sm font-medium text-slate-700 marker:text-indigo-500 marker:font-bold">
                  <li>
                    Send an email to <a href="mailto:support@nextprepbd.com" className="text-indigo-600 hover:underline">support@nextprepbd.com</a> with the subject line "Refund Request".
                  </li>
                  <li>
                    Include your <strong>Order ID</strong>, the email address used for purchase, and a detailed reason for the refund request.
                  </li>
                  <li>
                    Attach screenshots or proof if claiming a technical issue.
                  </li>
                </ol>
                <p className="mt-4 text-xs text-slate-500">
                  * Our team will review your request and respond within 24-48 hours. If approved, the refund will be processed to your original payment method (e.g., bKash, Nagad) within 5-7 business days.
                </p>
              </div>
            </section>

            {/* Footer Contact */}
            <div className="border-t border-slate-100 pt-8 mt-12">
              <h3 className="font-bold text-slate-900 mb-2">Need Help?</h3>
              <p className="text-sm text-slate-500 mb-4">
                If you have questions about a specific charge, please contact us before filing a dispute.
              </p>
              <Link 
                href="mailto:support@nextprepbd.com" 
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 transition-colors"
              >
                <Mail className="w-4 h-4" /> Contact Billing Support
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}