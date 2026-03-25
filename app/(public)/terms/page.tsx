import { Metadata } from "next";
import Link from "next/link";
import { Scale, AlertCircle, Mail, ShieldCheck, FileText, UserCheck, Scale as ScaleIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | NextPrepBD",
  description: "Read the Terms of Service for NextPrepBD. Understand your rights and responsibilities when using our education platform.",
};

export default function TermsPage() {
  const lastUpdated = "March 25, 2026";

  return (
    <div className="min-h-screen bg-[#FAFBFD] font-sans relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[600px] opacity-20 pointer-events-none blur-[120px] bg-gradient-to-bl from-indigo-300 via-blue-200 to-transparent"></div>
      
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-[2rem] shadow-xl shadow-indigo-200 mb-6 transform rotate-3 hover:rotate-0 transition-all duration-300">
            <Scale className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Terms of Service
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Effective from: <span className="text-indigo-600 font-bold">{lastUpdated}</span>
          </p>
        </div>

        {/* CONTENT CONTAINER */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 overflow-hidden">
          <div className="p-8 md:p-14 space-y-12 text-slate-700 leading-relaxed">

            {/* 1. Introduction */}
            <section className="group">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  <FileText className="w-6 h-6" />
                </div>
                Acceptance of Terms
              </h2>
              <div className="pl-16 space-y-4 text-lg">
                  <p>
                    Welcome to <strong className="text-slate-900">NextPrepBD</strong> ("we," "our," or "us"). By accessing or using our website, 
                    located at <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold">nextprepbd.com</span>, 
                    you agree to be bound by these Terms of Service. 
                  </p>
                  <p>
                    These terms apply to all visitors, users, and others who access or use the Service. If you do not agree with any part of these terms, you are prohibited from using this site.
                  </p>
              </div>
            </section>

            {/* 2. Educational Disclaimer */}
            <section className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-3xl border border-amber-100 shadow-inner">
              <h2 className="text-xl font-black text-amber-900 mb-4 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600"/> Educational Disclaimer
              </h2>
              <p className="text-amber-800 leading-relaxed">
                The materials on NextPrepBD (notes, suggestions, question banks) are provided for educational purposes only. 
                While we strive for accuracy, we do not guarantee that the information is free from errors or omissions. 
                <strong className="text-amber-900 block mt-2 p-3 bg-amber-100/50 rounded-xl border border-amber-200">
                   We are not responsible for any exam results or academic outcomes resulting from the use of our materials.
                </strong> 
                <span className="block mt-2">Students should always cross-reference materials with official textbooks authorized by the National Curriculum and Textbook Board (NCTB).</span>
              </p>
            </section>

            {/* 3. User Accounts */}
            <section className="group">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  <UserCheck className="w-6 h-6" />
                </div>
                User Accounts & Security
              </h2>
              <div className="pl-16">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">1</div>
                        <span className="text-lg">You are responsible for maintaining the confidentiality of your account and password.</span>
                    </li>
                    <li className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">2</div>
                        <span className="text-lg">You agree to accept responsibility for all activities that occur under your account.</span>
                    </li>
                    <li className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">3</div>
                        <span className="text-lg">We reserve the right to terminate accounts, edit or remove content, and cancel orders at our sole discretion.</span>
                    </li>
                  </ul>
              </div>
            </section>

            {/* 4. Intellectual Property */}
            <section className="group">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                Intellectual Property
              </h2>
              <div className="pl-16 space-y-4 text-lg">
                  <p>
                    The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of NextPrepBD and its licensors.
                  </p>
                  <p className="font-bold text-slate-900 mt-6">License Restrictions:</p>
                  <p>Permission is granted to temporarily download one copy of the materials for personal, non-commercial transitory viewing only. Under this license, you may not:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-800 text-sm font-medium">
                        ❌ Modify or copy the materials for commercial use.
                    </div>
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-800 text-sm font-medium">
                        ❌ Attempt to decompile or reverse engineer any software.
                    </div>
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-800 text-sm font-medium">
                        ❌ Remove copyright or proprietary notations.
                    </div>
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-800 text-sm font-medium">
                        ❌ Mirror the materials on any other server.
                    </div>
                  </div>
              </div>
            </section>

            {/* 5. Limitations & Governing Law */}
            <section className="group">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  <ScaleIcon className="w-6 h-6" />
                </div>
                Governing Law & Liability
              </h2>
              <div className="pl-16 space-y-6 text-lg">
                  <p>
                    In no event shall NextPrepBD, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                  </p>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                     These Terms shall be governed and construed in accordance with the laws of <strong className="text-slate-900">Bangladesh</strong>, without regard to its conflict of law provisions.
                  </div>
              </div>
            </section>

            <div className="border-t-2 border-slate-100 pt-10 mt-16 px-16">
              <div className="bg-slate-900 rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white shadow-2xl">
                  <div>
                      <h3 className="text-2xl font-black mb-2">Still have questions?</h3>
                      <p className="text-slate-400 font-medium max-w-sm">
                        If you have any questions about these Terms, feel free to reach out to our legal and support team.
                      </p>
                  </div>
                  <Link 
                    href="mailto:support@nextprepbd.com" 
                    className="flex-shrink-0 inline-flex items-center justify-center gap-3 px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black text-lg shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all hover:scale-105 active:scale-95"
                  >
                    <Mail className="w-5 h-5" /> Contact Support
                  </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}