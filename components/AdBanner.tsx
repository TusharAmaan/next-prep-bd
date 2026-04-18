"use client";

import { useEffect } from "react";

type AdBannerProps = {
  dataAdSlot: string;
  dataAdFormat?: string;
  dataFullWidthResponsive?: boolean;
  dataAdLayoutKey?: string; // <--- NEW PROP
};

const AdBanner = ({
  dataAdSlot,
  dataAdFormat = "auto",
  dataFullWidthResponsive = true,
  dataAdLayoutKey,
}: AdBannerProps) => {
  useEffect(() => {
    // Only attempt to push if we're in the browser
    if (typeof window !== "undefined") {
      try {
        const adsbygoogle = (window as any).adsbygoogle || [];
        // Optional: Check if the script is actually loaded before pushing
        if ((window as any).adsbygoogle) {
          adsbygoogle.push({});
        }
      } catch (err: any) {
        // TagError: adsbygoogle.push() error is common if called too early or too many times
        // We catch it silently or log a minimal warning to keep console clean
        if (!err?.message?.includes('already have ads')) {
            console.warn("AdSense push issue:", err?.message || err);
        }
      }
    }
  }, [dataAdSlot]); // Re-run if slot changes, but usually slots are static

  return (
    <div className="my-8 text-center overflow-hidden min-h-[100px] flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client="ca-pub-3105440348785747"
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive.toString()}
        {...(dataAdLayoutKey && { "data-ad-layout-key": dataAdLayoutKey })}
      ></ins>
    </div>
  );
};

export default AdBanner;