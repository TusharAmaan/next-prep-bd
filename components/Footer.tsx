import Link from "next/link";
import MobileAppButtons from "./MobileAppButtons"; // <--- Import the popup component

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white py-16 border-t border-gray-800 font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* COLUMN 1: BRANDING & APPS */}
        <div>
          {/* Logo */}
          <div className="mb-6">
            <h2 className="text-3xl font-extrabold tracking-tight">NextPrep<span className="text-blue-500">BD</span></h2>
            <p className="text-xs text-gray-500 mt-1">Your Ultimate Exam Companion</p>
          </div>
          
          <p className="text-sm text-gray-400 mb-2">Download our mobile app</p>
          
          {/* --- NEW POPUP SYSTEM INTEGRATED HERE --- */}
          <MobileAppButtons />
          {/* -------------------------------------- */}

        </div>

        {/* COLUMN 2: COMPANY */}
        <div>
          <h3 className="text-lg font-bold mb-6 text-white">Company</h3>
          <ul className="space-y-3 text-sm text-gray-400 font-medium">
            <li><Link href="/careers" className="hover:text-blue-500 transition-colors">Career / Job Circular</Link></li>
            <li><Link href="/join-as-teacher" className="hover:text-blue-500 transition-colors">Join as a Teacher</Link></li>
            <li><Link href="/affiliate" className="hover:text-blue-500 transition-colors">Affiliate Registration</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-blue-500 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/refund-policy" className="hover:text-blue-500 transition-colors">Refund Policy</Link></li>
            <li><Link href="/terms" className="hover:text-blue-500 transition-colors">Terms of Use</Link></li>
          </ul>
        </div>

        {/* COLUMN 3: RESOURCES */}
        <div>
          <h3 className="text-lg font-bold mb-6 text-white">Resources</h3>
          <ul className="space-y-3 text-sm text-gray-400 font-medium">
            <li><Link href="/blog" className="hover:text-blue-500 transition-colors">Class Blogs</Link></li>
            <li><Link href="/book-store" className="hover:text-blue-500 transition-colors">Book Store</Link></li>
            <li><Link href="/resources/ssc" className="hover:text-blue-500 transition-colors">SSC Guide</Link></li>
            <li><Link href="/resources/hsc" className="hover:text-blue-500 transition-colors">HSC Guide</Link></li>
            <li><Link href="/verify-certificate" className="hover:text-blue-500 transition-colors">Verify Certificate</Link></li>
            <li><Link href="/ebooks" className="hover:text-blue-500 transition-colors">Free Download</Link></li>
          </ul>
        </div>

        {/* COLUMN 4: CONTACT */}
        <div>
          <h3 className="text-lg font-bold mb-6 text-white">Contact Us</h3>
          <ul className="space-y-4 text-sm text-gray-400">
            <li className="flex items-center gap-3">
                <span className="text-blue-500 bg-blue-500/10 p-2 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>
                <span className="font-medium hover:text-white transition">Call: 16910 (24x7)</span>
            </li>
            
            <li>
                <a href="https://wa.me/8801745775697" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                    <span className="text-green-500 bg-green-500/10 p-2 rounded-lg group-hover:bg-green-500 group-hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </span>
                    <span className="font-medium group-hover:text-green-400 transition">WhatsApp: +8801745775697</span>
                </a>
            </li>

            <li className="flex items-center gap-3">
                <span className="text-gray-500 bg-gray-800 p-2 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></span>
                <span className="font-medium hover:text-white transition">support@nextprepbd.com</span>
            </li>
          </ul>

          {/* Social Icons */}
          <div className="flex gap-4 mt-8">
            <a href="https://facebook.com" target="_blank" className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center text-gray-400 hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white transition-all">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://instagram.com" target="_blank" className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:border-pink-600 hover:text-white transition-all">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://youtube.com" target="_blank" className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center text-gray-400 hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white transition-all">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
            </a>
          </div>
        </div>

      </div>
      
      {/* COPYRIGHT */}
      <div className="text-center text-gray-600 text-xs mt-16 pt-8 border-t border-gray-900 font-bold tracking-wide">
        &copy; {currentYear} NextPrep BD. All rights reserved.
      </div>
    </footer>
  );
}