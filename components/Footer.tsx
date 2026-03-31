"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Youtube, Phone, Mail, MessageSquare } from "lucide-react";
import MobileAppButtons from "./MobileAppButtons";

export default function Footer() {
  const pathname = usePathname(); // <--- 2. Get current path
  const currentYear = new Date().getFullYear();

  // --- 3. CONDITIONAL RENDER: Hide on Admin Pages ---
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-black text-white py-16 border-t border-gray-800 font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">

        {/* COLUMN 1: BRANDING & APPS */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          {/* Logo */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">NextPrep<span className="text-blue-500">BD</span></h2>
            <p className="text-[10px] text-gray-500 mt-2 tracking-[0.2em] font-bold opacity-60">Your Ultimate Exam Companion</p>
          </div>

          <p className="text-xs text-gray-400 mb-6 font-bold tracking-widest opacity-80">Download our official mobile app</p>

          {/* Mobile App Popup */}
          <div className="w-full flex justify-center md:justify-start">
            <MobileAppButtons />
          </div>

        </div>

        {/* COLUMN 2: COMPANY */}
        <div className="text-center md:text-left">
          <h3 className="text-sm font-bold mb-6 text-white tracking-[0.2em]">Company</h3>
          <ul className="space-y-3 text-sm text-gray-400 font-medium">
            <li><Link href="/about" className="hover:text-blue-500 transition-colors">About Us</Link></li>
            <li><Link href="/careers" className="hover:text-blue-500 transition-colors">Careers</Link></li>
            <li><Link href="/join-as-teacher" className="hover:text-blue-500 transition-colors">Join as a Teacher</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-blue-500 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/refund-policy" className="hover:text-blue-500 transition-colors">Refund Policy</Link></li>
            <li><Link href="/terms" className="hover:text-blue-500 transition-colors">Terms of Use</Link></li>
          </ul>
        </div>

        {/* COLUMN 3: RESOURCES */}
        <div className="text-center md:text-left">
          <h3 className="text-sm font-bold mb-6 text-white tracking-[0.2em]">Resources</h3>
          <ul className="space-y-3 text-sm text-gray-400 font-medium">
            <li><Link href="/find-tutor" className="hover:text-blue-500 transition-colors">Find a Tutor</Link></li>
            <li><Link href="/blog" className="hover:text-blue-500 transition-colors">Class Blogs</Link></li>
            <li><Link href="/ebooks" className="hover:text-blue-500 transition-colors">Free eBooks</Link></li>
            <li><Link href="/resources/ssc" className="hover:text-blue-500 transition-colors">SSC Guide</Link></li>
            <li><Link href="/resources/hsc" className="hover:text-blue-500 transition-colors">HSC Guide</Link></li>
            <li><Link href="/resources/university-admission" className="hover:text-blue-500 transition-colors">University Admission</Link></li>
            <li><Link href="/resources/university-admission/science/medical-admission" className="hover:text-blue-500 transition-colors">Medical Admission</Link></li>
            <li><Link href="/resources/master's-admission/mba/iba" className="hover:text-blue-500 transition-colors">IBA MBA</Link></li>
            <li><Link href="/resources/job-prep" className="hover:text-blue-500 transition-colors">Job Preparation</Link></li>
          </ul>
        </div>

        {/* COLUMN 4: CONTACT */}
        <div className="text-center md:text-left">
          <h3 className="text-sm font-bold mb-6 text-white tracking-[0.2em]">Contact Us</h3>
          <ul className="space-y-4 text-xs font-bold tracking-widest">
            <li className="flex items-center justify-center md:justify-start gap-3">
              <span className="text-blue-500 bg-blue-500/10 p-2 rounded-lg shrink-0"><Phone className="w-4 h-4" /></span>
              <span className="hover:text-white transition opacity-70 hover:opacity-100">+8801619663933</span>
            </li>

            <li>
              <a href="https://wa.me/8801745775697" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center md:justify-start gap-3 group">
                <span className="text-green-500 bg-green-500/10 p-2 rounded-lg group-hover:bg-green-500 group-hover:text-white transition-all shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <span className="group-hover:text-green-400 transition opacity-70 group-hover:opacity-100">+8801745775697</span>
              </a>
            </li>

            <li className="flex items-center justify-center md:justify-start gap-3">
              <a href="mailto:nextprepbd@gmail.com" className="flex items-center justify-center md:justify-start gap-3 group">
                <span className="text-gray-400 bg-gray-800 p-2 rounded-lg shrink-0"><Mail className="w-4 h-4" /></span>
                <span className="hover:text-white transition opacity-70 hover:opacity-100 lowercase">nextprepbd@gmail.com</span>
              </a>
            </li>
          </ul>

          {/* Social Icons */}
          <div className="flex justify-center md:justify-start gap-4 mt-8">
            <a href="https://www.facebook.com/profile.php?id=61584943876571" target="_blank" className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white transition-all">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://instagram.com" target="_blank" className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:border-pink-600 hover:text-white transition-all">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://youtube.com" target="_blank" className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white transition-all">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>

      </div>

      {/* COPYRIGHT */}
      <div className="text-center text-gray-600 text-xs mt-16 pt-8 border-t border-gray-900 font-bold tracking-wide">
        &copy; {currentYear} NextPrepBD. All rights reserved.
      </div>
    </footer>
  );
}