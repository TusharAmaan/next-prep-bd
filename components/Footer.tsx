import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-16 border-t border-gray-800 font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* COLUMN 1: BRANDING & APPS */}
        <div>
          {/* Logo Placeholder */}
          <div className="mb-6">
            <h2 className="text-3xl font-extrabold tracking-tight">NextPrep<span className="text-blue-500">BD</span></h2>
            <p className="text-xs text-gray-500 mt-1">Your Ultimate Exam Companion</p>
          </div>
          
          <p className="text-sm text-gray-400 mb-4">Download our mobile app</p>
          
          <div className="flex gap-3">
            {/* Google Play Placeholder */}
            <div className="w-36 h-12 bg-gray-900 border border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-500 transition">
                <div className="text-left">
                    <p className="text-[10px] text-gray-400 leading-none">GET IT ON</p>
                    <p className="text-sm font-bold">Google Play</p>
                </div>
            </div>
            {/* App Store Placeholder */}
            <div className="w-36 h-12 bg-gray-900 border border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-500 transition">
                <div className="text-left">
                    <p className="text-[10px] text-gray-400 leading-none">Download on the</p>
                    <p className="text-sm font-bold">App Store</p>
                </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: COMPANY */}
        <div>
          <h3 className="text-lg font-bold mb-6">Company</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><Link href="/careers" className="hover:text-white transition">Career / Job Circular</Link></li>
            <li><Link href="/join-as-teacher" className="hover:text-white transition">Join as a Teacher</Link></li>
            <li><Link href="/affiliate" className="hover:text-white transition">Affiliate Registration</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link></li>
            <li><Link href="/refund-policy" className="hover:text-white transition">Refund Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white transition">Terms of Use</Link></li>
          </ul>
        </div>

        {/* COLUMN 3: OTHERS */}
        <div>
          <h3 className="text-lg font-bold mb-6">Others</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
            <li><Link href="/book-store" className="hover:text-white transition">Book Store</Link></li>
            <li><Link href="/free-notes" className="hover:text-white transition">Free Notes & Guides</Link></li>
            <li><Link href="/job-prep" className="hover:text-white transition">Job Prep Courses</Link></li>
            <li><Link href="/verify-certificate" className="hover:text-white transition">Verify Certificate</Link></li>
            <li><Link href="/free-download" className="hover:text-white transition">Free Download</Link></li>
          </ul>
        </div>

        {/* COLUMN 4: CONTACT */}
        <div>
          <h3 className="text-lg font-bold mb-6">Contact Us</h3>
          <ul className="space-y-4 text-sm text-gray-400">
            <li className="flex items-center gap-3">
                <span className="text-blue-500"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>
                <span>Call: 16910 (24x7)</span>
            </li>
            <li className="flex items-center gap-3">
                <span className="text-green-500"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>
                <span>WhatsApp: +8801896016252</span>
            </li>
            <li className="flex items-center gap-3">
                <span className="text-gray-500"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></span>
                <span>Email: support@nextprepbd.com</span>
            </li>
          </ul>

          <div className="flex gap-4 mt-6">
            {/* Social Icons (Placeholders) */}
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition cursor-pointer">f</div>
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition cursor-pointer">in</div>
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-600 transition cursor-pointer">yt</div>
          </div>
        </div>

      </div>
      
      {/* COPYRIGHT */}
      <div className="text-center text-gray-600 text-xs mt-16 pt-8 border-t border-gray-900">
        &copy; {new Date().getFullYear()} NextPrep BD. All rights reserved.
      </div>
    </footer>
  );
}