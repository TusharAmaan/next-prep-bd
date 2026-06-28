"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Youtube, Phone, Mail, MessageSquare, ShieldCheck } from "lucide-react";
import MobileAppButtons from "./MobileAppButtons";

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-black pt-16 pb-8 border-t border-white/10 font-sans relative overflow-hidden">
      {/* Subtle ambient glow in the background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-32 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12 relative z-10">

        {/* COLUMN 1: BRANDING & APPS */}
        <div className="col-span-2 lg:col-span-4 flex flex-col items-start text-left pr-0 lg:pr-8">
          <Link href="/" className="mb-6 block group">
            <h2 className="text-2xl font-extrabold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
              NextPrep<span className="text-indigo-500">BD</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1 font-medium">Your ultimate exam companion</p>
          </Link>
          
          <p className="text-sm text-slate-400 mb-8 leading-relaxed">
            We are dedicated to providing the best quality education, resources, and mentorship to students across Bangladesh. Start your journey to success today.
          </p>

          <p className="text-sm text-slate-300 mb-3 font-semibold capitalize">Get our mobile app</p>
          <div className="w-full flex justify-start">
            <MobileAppButtons />
          </div>
        </div>

        {/* COLUMN 2: COMPANY */}
        <div className="col-span-1 lg:col-span-2 text-left">
          <h3 className="text-sm font-semibold mb-5 text-white capitalize tracking-wide">Company</h3>
          <ul className="space-y-3.5 text-sm text-slate-400 font-medium">
            <li><Link href="/about" className="hover:text-white transition-colors">About us</Link></li>
            <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
            <li><Link href="/join-as-teacher" className="hover:text-white transition-colors">Join as a teacher</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy policy</Link></li>
            <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund policy</Link></li>
            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of use</Link></li>
          </ul>
        </div>

        {/* COLUMN 3: RESOURCES */}
        <div className="col-span-1 lg:col-span-3 text-left">
          <h3 className="text-sm font-semibold mb-5 text-white capitalize tracking-wide">Resources</h3>
          <ul className="space-y-3.5 text-sm text-slate-400 font-medium">
            <li><Link href="/find-tutor" className="hover:text-white transition-colors">Find a tutor</Link></li>
            <li><Link href="/blog" className="hover:text-white transition-colors">Class blogs</Link></li>
            <li><Link href="/ebooks" className="hover:text-white transition-colors">Free eBooks</Link></li>
            <li><Link href="/resources/ssc" className="hover:text-white transition-colors">SSC guide</Link></li>
            <li><Link href="/resources/hsc" className="hover:text-white transition-colors">HSC guide</Link></li>
            <li><Link href="/resources/university-admission" className="hover:text-white transition-colors">University admission</Link></li>
            <li><Link href="/verify-certificate" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors flex items-center gap-1.5"><ShieldCheck className="w-4 h-4"/> Verify certificate</Link></li>
          </ul>
        </div>

        {/* COLUMN 4: CONTACT */}
        <div className="col-span-2 lg:col-span-3 text-left">
          <h3 className="text-sm font-semibold mb-5 text-white capitalize tracking-wide">Contact us</h3>
          <ul className="space-y-4 text-sm font-medium text-slate-400">
            <li className="flex items-start gap-3 group cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 transition-colors">
                 <Phone className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
              </div>
              <div className="flex flex-col pt-1">
                <span className="text-[11px] font-medium text-slate-500 capitalize mb-0.5">Call us</span>
                <span className="group-hover:text-white transition-colors">+880 161 966 3933</span>
              </div>
            </li>

            <li className="flex items-start gap-3 group">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-colors">
                 <MessageSquare className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-400 transition-colors" />
              </div>
              <div className="flex flex-col pt-1">
                <span className="text-[11px] font-medium text-slate-500 capitalize mb-0.5">WhatsApp</span>
                <a href="https://wa.me/8801745775697" target="_blank" rel="noopener noreferrer" className="group-hover:text-white transition-colors">
                  +880 174 577 5697
                </a>
              </div>
            </li>

            <li className="flex items-start gap-3 group">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 transition-colors">
                 <Mail className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
              </div>
              <div className="flex flex-col pt-1">
                <span className="text-[11px] font-medium text-slate-500 capitalize mb-0.5">Email</span>
                <a href="mailto:nextprepbd@gmail.com" className="group-hover:text-white transition-colors">
                  nextprepbd@gmail.com
                </a>
              </div>
            </li>
          </ul>

          {/* Social Icons */}
          <div className="flex justify-start gap-3 mt-8">
            <a href="https://www.facebook.com/profile.php?id=61584943876571" target="_blank" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white transition-all shadow-sm">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://instagram.com" target="_blank" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-pink-600 hover:border-pink-600 hover:text-white transition-all shadow-sm">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://www.youtube.com/channel/UCH5mIuxfWQEzXB1IiJqPigA" target="_blank" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white transition-all shadow-sm">
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>

      {/* COPYRIGHT */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        <p className="text-slate-500 text-xs font-medium">
          &copy; {currentYear} NextPrepBD. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-xs font-medium text-slate-500">
           <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
           <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
           <Link href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}