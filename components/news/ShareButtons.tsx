"use client";

import { Facebook, Twitter, Linkedin, Link as LinkIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(window.location.href || url);
  }, [url]);

  const shareActions = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`,
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied to clipboard!");
  };

  const buttons = [
    { icon: Facebook, color: "bg-blue-600", platform: 'facebook' },
    { icon: Twitter, color: "bg-sky-500", platform: 'twitter' },
    { icon: Linkedin, color: "bg-indigo-700", platform: 'linkedin' },
    { icon: LinkIcon, color: "bg-slate-800", platform: 'copy' }
  ];

  return (
    <div className="flex items-center gap-4">
      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Share This:</span>
      {buttons.map((social, i) => (
        <a
          key={i}
          href={social.platform === 'copy' ? '#' : (shareActions as any)[social.platform]}
          target={social.platform === 'copy' ? undefined : "_blank"}
          rel="noopener noreferrer"
          className={`w-10 h-10 rounded-xl ${social.color} text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg cursor-pointer`}
          onClick={social.platform === 'copy' ? handleCopyLink : undefined}
        >
          <social.icon className="w-4 h-4" />
        </a>
      ))}
    </div>
  );
}
