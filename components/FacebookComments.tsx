"use client";
import { useEffect, useRef } from 'react';

export default function FacebookComments({ url }: { url: string }) {
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (hasLoaded.current) {
        if ((window as any).FB) {
            (window as any).FB.XFBML.parse();
        }
        return;
    }
    hasLoaded.current = true;

    // Standard Facebook SDK loader
    (window as any).fbAsyncInit = function() {
      (window as any).FB.init({
        appId            : '936286300164215', // I added a generic test ID. Replace with yours later!
        autoLogAppEvents : true,
        xfbml            : true,
        version          : 'v18.0'
      });
    };

    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s) as HTMLScriptElement; js.id = id;
       js.src = "https://connect.facebook.net/en_US/sdk.js";
       if(fjs && fjs.parentNode) {
           fjs.parentNode.insertBefore(js, fjs);
       }
     }(document, 'script', 'facebook-jssdk'));

  }, [url]);

  return (
    <div className="mt-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
       <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        💬 Discussion
       </h3>
       <div id="fb-root"></div>
       <div 
         className="fb-comments w-full" 
         data-href={url} 
         data-width="100%" 
         data-numposts="5" 
         data-colorscheme="light"
         data-lazy="true"
       ></div>
    </div>
  );
}