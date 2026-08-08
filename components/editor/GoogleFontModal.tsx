"use client";

import React, { useState, useMemo } from 'react';
import { Search, Check, AlertCircle, X, Sparkles } from 'lucide-react';

// Comprehensive database of top Google Fonts including Western, Asian, and Bengali typography
export const GOOGLE_FONTS_DATABASE = [
  // Sans-Serif
  "Roboto", "Open Sans", "Montserrat", "Lato", "Poppins", "Inter", "Oswald", 
  "Raleway", "Ubuntu", "Nunito", "Rubik", "Work Sans", "Plus Jakarta Sans", 
  "DM Sans", "Outfit", "Manrope", "Quicksand", "Karla", "Barlow", "Josefin Sans",
  
  // Serif
  "Times New Roman", "Playfair Display", "Merriweather", "Lora", "PT Serif", 
  "Cinzel", "Bodoni Moda", "Prata", "Spectral", "Cormorant Garamond", 
  "EB Garamond", "Bitter", "Crimson Text",
  
  // Monospace
  "Fira Code", "JetBrains Mono", "Source Code Pro", "Inconsolata", "Space Mono", 
  "Courier Prime", "Roboto Mono",
  
  // Bengali / Regional Fonts
  "Hind Siliguri", "Tiro Bangla", "Noto Serif Bengali", "Noto Sans Bengali", 
  "Atma", "Galada", "Mina", "Anek Bangla"
];

interface GoogleFontModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFont: (fontName: string) => void;
}

// Levenshtein / String similarity helper for nearby font suggestions
function stringSimilarity(s1: string, s2: string): number {
  const str1 = s1.toLowerCase();
  const str2 = s2.toLowerCase();
  
  if (str1 === str2) return 1.0;
  if (str1.includes(str2) || str2.includes(str1)) return 0.8;
  
  let matchCount = 0;
  const length = Math.max(str1.length, str2.length);
  for (let i = 0; i < Math.min(str1.length, str2.length); i++) {
    if (str1[i] === str2[i]) matchCount++;
  }
  return matchCount / length;
}

export default function GoogleFontModal({ isOpen, onClose, onSelectFont }: GoogleFontModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFont, setSelectedFont] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState('The quick brown fox jumps over the lazy dog (১২৩৪৫৬৭৮৯০)');
  const [loadedPreviewFont, setLoadedPreviewFont] = useState<string | null>(null);

  // Exact match search
  const exactMatch = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.trim().toLowerCase();
    return GOOGLE_FONTS_DATABASE.find(f => f.toLowerCase() === query) || null;
  }, [searchQuery]);

  // Partial or nearby suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return GOOGLE_FONTS_DATABASE.slice(0, 12);
    
    const query = searchQuery.trim().toLowerCase();
    
    // Sort by similarity score
    const scored = GOOGLE_FONTS_DATABASE.map(font => {
      let score = 0;
      const fLower = font.toLowerCase();
      if (fLower === query) score = 10;
      else if (fLower.startsWith(query)) score = 8;
      else if (fLower.includes(query)) score = 6;
      else {
        score = stringSimilarity(query, fLower) * 5;
      }
      return { font, score };
    });

    return scored
      .filter(item => item.score > 1.2)
      .sort((a, b) => b.score - a.score)
      .map(item => item.font)
      .slice(0, 10);
  }, [searchQuery]);

  // Load preview font link dynamically when selected
  const handleSelectFontForPreview = (fontName: string) => {
    setSelectedFont(fontName);
    const linkId = 'google-font-preview-style';
    let link = document.getElementById(linkId) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;600;700&display=swap`;
    setLoadedPreviewFont(fontName);
  };

  const handleConfirmAdd = () => {
    const fontToApply = selectedFont || exactMatch || (suggestions.length > 0 ? suggestions[0] : searchQuery.trim());
    if (fontToApply) {
      onSelectFont(fontToApply);
      onClose();
      // Reset modal state
      setSearchQuery('');
      setSelectedFont(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Google Font Explorer</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Search, verify & apply web fonts dynamically</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedFont(null);
              }}
              placeholder="Search font (e.g. 'Roboto', 'Outfit', 'Hind Siliguri')..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              autoFocus
            />
          </div>

          {/* Verification Status */}
          {searchQuery.trim() !== '' && (
            <div>
              {exactMatch ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Exact Google Font Match Found: <strong>{exactMatch}</strong></span>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-center gap-3 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Font '<strong>{searchQuery}</strong>' not directly matched. Select a recommended font below:</span>
                </div>
              )}
            </div>
          )}

          {/* Recommendations / Grid */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {searchQuery.trim() ? "Matching Google Fonts" : "Popular Google Fonts"}
            </label>

            {suggestions.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {suggestions.map((font) => {
                  const isSelected = (selectedFont || exactMatch) === font;
                  return (
                    <button
                      key={font}
                      type="button"
                      onClick={() => handleSelectFontForPreview(font)}
                      className={`px-3 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/70 hover:border-indigo-400 dark:hover:border-indigo-500'
                      }`}
                    >
                      <span className="truncate">{font}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                No matching fonts found. You can still apply '<strong>{searchQuery}</strong>' directly.
              </div>
            )}
          </div>

          {/* Live Text Preview Box */}
          {(selectedFont || exactMatch) && (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Live Preview: {selectedFont || exactMatch}
                </label>
              </div>

              <div 
                className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 text-base transition-all min-h-[70px] flex items-center"
                style={{ fontFamily: loadedPreviewFont ? `"${loadedPreviewFont}", sans-serif` : 'inherit' }}
              >
                {previewText}
              </div>

              <input 
                type="text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                placeholder="Type custom text to preview font..."
                className="w-full text-xs px-3 py-1.5 bg-transparent border-b border-slate-200 dark:border-slate-800 text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-[11px] text-slate-400 font-medium">Font CDN loaded for current post session</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmAdd}
              disabled={!selectedFont && !exactMatch && !searchQuery.trim()}
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Apply Font
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
