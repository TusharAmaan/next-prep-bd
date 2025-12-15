"use client";
import { useEffect, useRef } from 'react';

export default function FacebookComments({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // CAST WINDOW TO 'ANY' TO FIX THE RED ERRORS
    const win = window as any;

    // 1. If FB is already loaded, just parse the new content
    if (win.FB) {
      try {
        win.FB.XFBML.parse(containerRef.current);
      } catch (e) {
        console.error("FB Parse Error:", e);
      }
    }

    // 2. Define the Init function
    win.fbAsyncInit = function() {
      win.FB.init({
        // NOTE: If you don't have a real App ID yet, this might cause the box to be empty.
        // You can leave this placeholder for now, but for production, get a real ID from developers.facebook.com
        appId            : '1153175390297877', 
        autoLogAppEvents : true,
        xfbml            : true,
        version          : 'v18.0'
      });
      // Force parse after init
      if (containerRef.current) {
        win.FB.XFBML.parse(containerRef.current);
      }
    };

    // 3. Load the Script (Standard Facebook SDK Loader)
    if (!document.getElementById('facebook-jssdk')) {
      const js = document.createElement('script');
      js.id = 'facebook-jssdk';
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      js.async = true;
      js.defer = true;
      js.crossOrigin = "anonymous";
      document.body.appendChild(js);
    }
  }, [url]);

  return (
    <div ref={containerRef} className="mt-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[200px]">
       <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        💬 Discussion
       </h3>
       
       <div id="fb-root"></div>

       <div 
         className="fb-comments" 
         data-href={url} 
         data-width="100%" 
         data-numposts="5"
         style={{ minHeight: '100px', width: '100%' }}
       ></div>
    </div>
  );
}