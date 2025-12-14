"use client";

import { useEffect, useRef } from 'react';

// Tell TypeScript that Facebook variables exist on the window object
declare global {
    interface Window {
        fbAsyncInit: any;
        FB: any;
    }
}

export default function FacebookComments({ url }: { url: string }) {
  const hasLoaded = useRef(false);

  useEffect(() => {
    // Avoid double-loading script on re-renders
    if (hasLoaded.current) {
        // If FB script is already loaded, just re-parse the div to display comments for the new URL
        if (window.FB) {
            window.FB.XFBML.parse();
        }
        return;
    }
    hasLoaded.current = true;

    // 1. Setup Facebook Init function
    window.fbAsyncInit = function() {
      window.FB.init({
        appId            : 1153175390297877, // <--- PASTE YOUR APP ID HERE
        autoLogAppEvents : true,
        xfbml            : true,
        version          : 'v18.0'
      });
    };

    // 2. Load the Facebook SDK script asynchronously
    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s) as HTMLScriptElement; js.id = id;
       js.src = "https://connect.facebook.net/en_US/sdk.js";
       if(fjs && fjs.parentNode) {
           fjs.parentNode.insertBefore(js, fjs);
       }
     }(document, 'script', 'facebook-jssdk'));

  }, [url]); // Re-run effect if the URL changes (navigating between articles)

  return (
    <div className="mt-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
       <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        💬 Discussion
       </h3>
       
       {/* Required root div for FB SDK */}
       <div id="fb-root"></div>

       {/* The actual comments container */}
       <div 
         className="fb-comments w-full" 
         data-href={url} 
         data-width="100%" 
         data-numposts="5" 
         data-colorscheme="light"
         data-lazy="true"
       ></div>
       
       {/* Helper for localhost testing */}
       {url.includes('localhost') && (
         <p className="text-xs text-amber-600 mt-4 bg-amber-50 p-2 rounded">
            Note: Facebook comments might not appear fully on 'localhost'. Push to Vercel to see it work perfectly.
         </p>
       )}
    </div>
  );
}