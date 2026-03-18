'use client';

import { Share2, Facebook, Twitter, Linkedin, Mail, Copy } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Share this article</p>
      <div className="flex flex-wrap gap-3">
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          title="Share on Facebook"
        >
          <Facebook className="w-5 h-5" />
        </a>
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-lg bg-sky-400 text-white hover:bg-sky-500 transition"
          title="Share on Twitter"
        >
          <Twitter className="w-5 h-5" />
        </a>
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition"
          title="Share on LinkedIn"
        >
          <Linkedin className="w-5 h-5" />
        </a>
        <a
          href={shareLinks.email}
          className="p-3 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition"
          title="Share via Email"
        >
          <Mail className="w-5 h-5" />
        </a>
        <button
          onClick={handleCopy}
          className={`p-3 rounded-lg transition ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
          }`}
          title="Copy link"
        >
          <Copy className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
