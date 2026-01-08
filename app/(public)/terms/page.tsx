import { Metadata } from "next";
import Link from "next/link";
import { FileText, Shield, Scale, AlertCircle, Mail, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | NextPrepBD",
  description: "Read the Terms of Service for NextPrepBD. Understand your rights and responsibilities when using our education platform.",
};

export default function TermsPage() {
  const lastUpdated = "January 8, 2026"; // You can update this date dynamically or manually

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 text-indigo-600 rounded-2xl mb-4">
            <Scale className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-slate-500 font-medium">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* CONTENT CONTAINER */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 md:p-12 space-y-10 text-slate-700 leading-relaxed">

            {/* 1. Introduction */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 text-sm font-black">1</span>
                Acceptance of Terms
              </h2>
              <p className="mb-4">
                Welcome to <strong>NextPrepBD</strong> ("we," "our," or "us"). By accessing or using our website, 
                located at <span className="text-indigo-600 font-bold">nextprepbd.com</span>, you agree to be bound by these Terms of Service. 
                If you do not agree with any part of these terms, you are prohibited from using this site.
              </p>
              <p>
                These terms apply to all visitors, users, and others who access or use the Service.
              </p>
            </section>

            {/* 2. Educational Disclaimer */}
            <section className="bg-amber-50 p-6 rounded-xl border border-amber-100">
              <h2 className="text-lg font-bold text-amber-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5"/> Educational Disclaimer
              </h2>
              <p className="text-sm text-amber-900/80">
                The materials on NextPrepBD (notes, suggestions, question banks) are provided for educational purposes only. 
                While we strive for accuracy, we do not guarantee that the information is free from errors or omissions. 
                <strong>We are not responsible for any exam results or academic outcomes</strong> resulting from the use of our materials. 
                Students should cross-reference materials with official textbooks authorized by the National Curriculum and Textbook Board (NCTB).
              </p>
            </section>

            {/* 3. User Accounts */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 text-sm font-black">2</span>
                User Accounts & Security
              </h2>
              <ul className="list-disc pl-5 space-y-2 marker:text-indigo-500">
                <li>You are responsible for maintaining the confidentiality of your account and password.</li>
                <li>You agree to accept responsibility for all activities that occur under your account.</li>
                <li>We reserve the right to terminate accounts, edit or remove content, and cancel orders at our sole discretion.</li>
                <li>You must provide accurate and complete information when creating an account.</li>
              </ul>
            </section>

            {/* 4. Intellectual Property */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 text-sm font-black">3</span>
                Intellectual Property
              </h2>
              <p className="mb-4">
                The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of NextPrepBD and its licensors.
              </p>
              <p>
                <strong>License to Use:</strong> Permission is granted to temporarily download one copy of the materials (notes, PDFs) for personal, non-commercial transitory viewing only. Under this license, you may not:
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-2 marker:text-indigo-500">
                <li>Modify or copy the materials for commercial use.</li>
                <li>Attempt to decompile or reverse engineer any software contained on NextPrepBD.</li>
                <li>Remove any copyright or other proprietary notations from the materials.</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
              </ul>
            </section>

            {/* 5. User Generated Content */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 text-sm font-black">4</span>
                User Comments & Conduct
              </h2>
              <p>
                NextPrepBD allows users to post comments and questions. You agree not to post content that is:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm font-semibold text-slate-600">🚫 Unlawful, offensive, or threatening</div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm font-semibold text-slate-600">🚫 Spam or unauthorized advertising</div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm font-semibold text-slate-600">🚫 Political or religious hate speech</div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm font-semibold text-slate-600">🚫 Infringing on any third-party rights</div>
              </div>
            </section>

            {/* 6. Limitation of Liability */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 text-sm font-black">5</span>
                Limitation of Liability
              </h2>
              <p>
                In no event shall NextPrepBD, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
            </section>

            {/* 7. Governing Law */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 text-sm font-black">6</span>
                Governing Law
              </h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of <strong>Bangladesh</strong>, without regard to its conflict of law provisions.
              </p>
            </section>

            <div className="border-t border-slate-100 pt-8 mt-12">
              <h3 className="font-bold text-slate-900 mb-2">Contact Us</h3>
              <p className="text-sm text-slate-500 mb-4">
                If you have any questions about these Terms, please contact us.
              </p>
              <Link 
                href="mailto:support@nextprepbd.com" 
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 transition-colors"
              >
                <Mail className="w-4 h-4" /> Contact Support
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}