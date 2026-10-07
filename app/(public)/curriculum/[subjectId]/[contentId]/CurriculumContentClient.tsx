'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { parseHashtagsToHTML } from '@/utils/hashtagParser';
import { 
  ChevronRight, 
  ChevronDown,
  Lock, 
  User, 
  BookOpen,
  FileText,
  Clock,
  Eye,
  Share2,
  Bookmark,
  Sun,
  Moon,
  X,
  Link as LinkIcon,
  Facebook,
  MessageCircle,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Zap,
  Layers,
  Mail,
  KeyRound,
  Loader2,
  ShieldCheck,
  Calendar,
  Flame,
  Star,
  Check,
  Trophy,
  Award
} from "lucide-react";
import Link from 'next/link';
import { toast } from 'sonner';
import RichTextDisplay from '@/components/shared/RichTextDisplay';
import Discussion from '@/components/shared/Discussion';
import TypographyScaler from '@/components/shared/TypographyScaler';
import { useTheme } from '@/components/shared/ThemeProvider';

interface ClientProps {
  subjectId: string;
  initialContent: any;
  initialSubject: any;
  initialHierarchy: any[];
  user: any;
}

export default function CurriculumContentClient({
  subjectId,
  initialContent,
  initialSubject,
  initialHierarchy,
  user
}: ClientProps) {
  const [subject] = useState<any>(initialSubject);
  const [hierarchy] = useState<any[]>(initialHierarchy);
  
  // Real-time Auth State: allows in-page unlock without reload!
  const [currentUser, setCurrentUser] = useState<any>(user);

  // In-Page Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [authFullName, setAuthFullName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Bookmarking & Saved State
  const [savedContentIds, setSavedContentIds] = useState<Set<string>>(new Set());
  const [savedCounts, setSavedCounts] = useState<Record<string, number>>({});
  const [pendingSaveContent, setPendingSaveContent] = useState<any | null>(null);

  // Dynamic author profiles for loaded contents
  const [authorProfiles, setAuthorProfiles] = useState<Record<string, any>>({});

  const [loadedContents, setLoadedContents] = useState<any[]>([initialContent]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [reachedBoundary, setReachedBoundary] = useState(false);
  
  const { isDark, toggleTheme } = useTheme();
  const [isTocOpenMobile, setIsTocOpenMobile] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState<{id: string, show: boolean} | null>(null);

  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  const loaderRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);

  // Sync auth state listener so any login/signup updates currentUser automatically
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch logged-in user's curriculum bookmarks
  useEffect(() => {
    if (!currentUser) {
      setSavedContentIds(new Set());
      return;
    }

    const fetchBookmarks = async () => {
      try {
        const { data, error } = await supabase
          .from('user_bookmarks')
          .select('item_id')
          .eq('user_id', currentUser.id)
          .eq('item_type', 'curriculum');

        if (!error && data) {
          setSavedContentIds(new Set(data.map(d => String(d.item_id))));
        }
      } catch (err) {
        console.error('Failed to load curriculum bookmarks', err);
      }
    };

    fetchBookmarks();
  }, [currentUser]);

  // Fetch bookmark counts for loaded contents
  useEffect(() => {
    if (loadedContents.length === 0) return;
    const ids = loadedContents.map(c => String(c.id));

    const fetchCounts = async () => {
      try {
        const { data, error } = await supabase
          .from('user_bookmarks')
          .select('item_id')
          .eq('item_type', 'curriculum')
          .in('item_id', ids);

        if (!error && data) {
          const counts: Record<string, number> = {};
          data.forEach((row: any) => {
            counts[row.item_id] = (counts[row.item_id] || 0) + 1;
          });
          setSavedCounts(prev => ({ ...prev, ...counts }));
        }
      } catch (err) {
        console.error('Failed to load bookmark counts', err);
      }
    };

    fetchCounts();
  }, [loadedContents]);

  // Fetch author profiles dynamically for loaded contents
  useEffect(() => {
    const ids = loadedContents
      .map(c => c.author_id)
      .filter((id): id is string => Boolean(id));

    if (ids.length === 0) return;

    const fetchAuthors = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .in('id', ids);

        if (data) {
          const map: Record<string, any> = {};
          data.forEach(p => { map[p.id] = p; });
          setAuthorProfiles(prev => ({ ...prev, ...map }));
        }
      } catch (err) {
        console.error('Failed to load author profiles', err);
      }
    };

    fetchAuthors();
  }, [loadedContents]);

  // Keyboard shortcut to close auth popup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        setIsAuthModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen]);

  const flatContentIndex = useMemo(() => {
     let flat: any[] = [];
     hierarchy.forEach(u => {
        u.lesson_plan_lessons?.sort((a:any,b:any) => a.order_index - b.order_index).forEach((l:any) => {
           l.lesson_plan_contents?.sort((a:any,b:any) => a.order_index - b.order_index).forEach((c:any) => {
              flat.push({ ...c, unit: u, lesson: l });
           });
        });
     });
     return flat;
  }, [hierarchy]);

  // Auto-expand based on loaded contents
  useEffect(() => {
    if (loadedContents.length === 0 || hierarchy.length === 0) return;
    const unitIds = new Set<string>();
    const lessonIds = new Set<string>();
    hierarchy.forEach(u => {
      u.lesson_plan_lessons?.forEach((l: any) => {
        l.lesson_plan_contents?.forEach((c: any) => {
          if (loadedContents.some(lc => lc.id === c.id)) {
            unitIds.add(String(u.id));
            lessonIds.add(String(l.id));
          }
        });
      });
    });
    setExpandedUnits(prev => new Set([...prev, ...unitIds]));
    setExpandedLessons(prev => new Set([...prev, ...lessonIds]));
  }, [loadedContents, hierarchy]);

  const loadNextContent = async () => {
     if (loadedContents.length === 0 || flatContentIndex.length === 0) return;
     const lastLoaded = loadedContents[loadedContents.length - 1];
     const currentIndex = flatContentIndex.findIndex(c => c.id.toString() === lastLoaded.id.toString());
     
     if (currentIndex === -1 || currentIndex >= flatContentIndex.length - 1) {
        setHasMore(false);
        return;
     }

     const nextContentMeta = flatContentIndex[currentIndex + 1];

     if (nextContentMeta.lesson_id !== lastLoaded.lesson_id) {
        if (!reachedBoundary) {
            setReachedBoundary(true);
            return;
        }
     }

     setIsLoadingMore(true);
     setReachedBoundary(false);

     try {
        const { data: nextContent } = await supabase
          .from('lesson_plan_contents')
          .select(`*, lesson_plan_lessons (*, lesson_plan_units (*))`)
          .eq('id', nextContentMeta.id)
          .single();
        
        if (nextContent) {
           setLoadedContents(prev => [...prev, nextContent]);
           await supabase.from('lesson_plan_contents').update({ view_count: (nextContent.view_count || 0) + 1 }).eq('id', nextContent.id);
        }
     } catch (err) {
        console.error('Error loading next topic:', err);
     } finally {
        setIsLoadingMore(false);
     }
  };

  const handleProceedToNextPart = async () => {
    if (!currentUser) {
      toast.info("Please sign up free or sign in to continue to the next part and track your syllabus progress.");
      openAuthModal('signup');
      return;
    }
    if (loadedContents.length === 0 || flatContentIndex.length === 0) return;
    const lastLoaded = loadedContents[loadedContents.length - 1];
    const currentIndex = flatContentIndex.findIndex(c => c.id.toString() === lastLoaded.id.toString());
    
    if (currentIndex === -1 || currentIndex >= flatContentIndex.length - 1) {
      setHasMore(false);
      return;
    }

    const nextContentMeta = flatContentIndex[currentIndex + 1];
    setIsLoadingMore(true);
    setReachedBoundary(false);

    try {
      const { data: nextContent } = await supabase
        .from('lesson_plan_contents')
        .select(`*, lesson_plan_lessons (*, lesson_plan_units (*))`)
        .eq('id', nextContentMeta.id)
        .single();
      
      if (nextContent) {
        setLoadedContents(prev => [...prev, nextContent]);
        await supabase.from('lesson_plan_contents').update({ view_count: (nextContent.view_count || 0) + 1 }).eq('id', nextContent.id);
        setTimeout(() => {
          const el = document.getElementById(`content-${nextContent.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 120);
      }
    } catch (err) {
      console.error('Error loading next topic:', err);
      toast.error("Could not load next topic.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && !isLoadingMore && hasMore && loadedContents.length > 0 && flatContentIndex.length > 0 && !reachedBoundary && currentUser) {
       loadNextContent();
    }
  }, [isLoadingMore, hasMore, loadedContents, flatContentIndex, reachedBoundary, currentUser]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { root: null, rootMargin: '20px', threshold: 0.1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => {
      const next = new Set(prev);
      if (next.has(unitId)) next.delete(unitId); else next.add(unitId);
      return next;
    });
  };

  const toggleLesson = (lessonId: string) => {
    setExpandedLessons(prev => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId); else next.add(lessonId);
      return next;
    });
  };

  const handleShare = (method: 'fb' | 'wa' | 'copy', contentUrl: string) => {
     const url = `${window.location.origin}${contentUrl}`;
     if (method === 'copy') {
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
     } else if (method === 'fb') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
     } else if (method === 'wa') {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent("Educational Resource: " + url)}`, '_blank');
     }
     setShowShareMenu(null);
  };

  const formatContentDate = (dateStr?: string) => {
    if (!dateStr) return "March 2026";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "March 2026";
    }
  };

  const getDisplaySavedCount = (contentItem: any) => {
    const itemId = String(contentItem.id);
    const dbCount = savedCounts[itemId] || 0;
    // High-converting baseline social proof seed per lesson based on ID & views
    const baseSeed = 118 + ((Number(contentItem.id) * 31) % 97) + Math.min(Math.floor((contentItem.view_count || 0) * 0.35), 45);
    const isSavedByMe = savedContentIds.has(itemId);
    return baseSeed + dbCount + (isSavedByMe ? 1 : 0);
  };

  const handleSave = async (contentItem: any, isAutoSave = false) => {
    if (!currentUser) {
      setPendingSaveContent(contentItem);
      toast.info("Please sign up or log in to save this lesson to your student dashboard.");
      openAuthModal('signup');
      return;
    }

    const itemId = String(contentItem.id);
    const isCurrentlySaved = savedContentIds.has(itemId);

    if (isAutoSave && isCurrentlySaved) return;

    // Optimistic toggle
    setSavedContentIds(prev => {
      const next = new Set(prev);
      if (isCurrentlySaved) next.delete(itemId);
      else next.add(itemId);
      return next;
    });

    setSavedCounts(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + (isCurrentlySaved ? -1 : 1))
    }));

    try {
      if (isCurrentlySaved) {
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('item_type', 'curriculum')
          .eq('item_id', itemId);

        if (error) throw error;
        toast.info("Lesson removed from your study dashboard");
      } else {
        const { error } = await supabase
          .from('user_bookmarks')
          .insert({
            user_id: currentUser.id,
            item_type: 'curriculum',
            item_id: itemId,
            metadata: {
              title: contentItem.title,
              subject_id: subjectId,
              subject_title: subject?.title || 'Academic Curriculum',
              unit_title: contentItem.lesson_plan_lessons?.lesson_plan_units?.title || '',
              lesson_title: contentItem.lesson_plan_lessons?.title || '',
              url: `/curriculum/${subjectId}/${contentItem.id}`
            }
          });

        if (error) throw error;
        toast.success(isAutoSave ? "Lesson saved to your student dashboard!" : "Saved to your study dashboard!");
      }
    } catch (err: any) {
      console.error('Error toggling bookmark:', err);
      toast.error("Could not update bookmark. Please try again.");
      // Rollback
      setSavedContentIds(prev => {
        const next = new Set(prev);
        if (isCurrentlySaved) next.add(itemId);
        else next.delete(itemId);
        return next;
      });
      setSavedCounts(prev => ({
        ...prev,
        [itemId]: Math.max(0, (prev[itemId] || 0) + (isCurrentlySaved ? 1 : -1))
      }));
    }
  };

  // Helper to unlock content and auto-save after login/signup
  const postAuthUnlock = async (authenticatedUser: any) => {
    setCurrentUser(authenticatedUser);
    setIsAuthModalOpen(false);

    if (pendingSaveContent) {
      const itemToSave = pendingSaveContent;
      setPendingSaveContent(null);
      try {
        await supabase.from('user_bookmarks').insert({
          user_id: authenticatedUser.id,
          item_type: 'curriculum',
          item_id: String(itemToSave.id),
          metadata: {
            title: itemToSave.title,
            subject_id: subjectId,
            subject_title: subject?.title || 'Academic Curriculum',
            unit_title: itemToSave.lesson_plan_lessons?.lesson_plan_units?.title || '',
            lesson_title: itemToSave.lesson_plan_lessons?.title || '',
            url: `/curriculum/${subjectId}/${itemToSave.id}`
          }
        });
        setSavedContentIds(prev => new Set([...prev, String(itemToSave.id)]));
        toast.success("Welcome! Lesson saved to your dashboard & full access unlocked.");
        return;
      } catch (err) {
        console.error('Auto save error:', err);
      }
    }

    toast.success("Welcome! Full curriculum lesson unlocked.");
  };

  // --- IN-PAGE AUTHENTICATION HANDLERS ---
  const openAuthModal = (mode: 'signup' | 'signin' = 'signup') => {
    setAuthMode(mode);
    setAuthError('');
    setIsAuthModalOpen(true);
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.href,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message || 'Failed to authenticate with Google.');
      setAuthLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'signup') {
        if (!authEmail || !authPassword) {
          throw new Error('Please fill in email and password.');
        }
        if (authPassword.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }

        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: {
            data: {
              full_name: authFullName.trim() || 'Student',
              role: 'student',
            },
          },
        });

        if (error) throw error;

        if (data.session?.user) {
          await postAuthUnlock(data.session.user);
        } else if (data.user) {
          await postAuthUnlock(data.user);
        }
      } else {
        // Sign In
        if (!authEmail || !authPassword) {
          throw new Error('Please enter both email and password.');
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        });

        if (error) throw error;

        if (data.user) {
          await postAuthUnlock(data.user);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Theme constants
  const textMain = isDark ? "text-slate-100" : "text-slate-900";
  const borderCol = isDark ? "border-slate-800" : "border-slate-200/80";
  const proseClass = isDark ? "prose-invert prose-slate" : "prose-slate";

  return (
    <div className={`min-h-screen transition-colors duration-300 bg-[#fafbfc] dark:bg-[#070b14]`}>
      <TypographyScaler />

      {/* ========================================================
          1. CLEAN IN-FLOW BREADCRUMB & CURRICULUM TOP CONTROL BAR
             (Positioned safely below the fixed site header: pt-24 md:pt-28)
      ======================================================== */}
      <section className="w-full bg-white dark:bg-[#0c1222] border-b border-slate-200/80 dark:border-slate-800/80 pt-24 sm:pt-28 md:pt-30 pb-4 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Breadcrumb Path & Back Link */}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <Link 
              href="/curriculum"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs transition-colors shrink-0 shadow-2xs mr-1"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              <span>Back to Curriculum</span>
            </Link>

            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 min-w-0 flex-wrap">
              <Link href="/curriculum" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Curriculum
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <Link href="/curriculum" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium truncate max-w-[140px] sm:max-w-none">
                {subject?.title}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-900 dark:text-slate-100 font-bold truncate max-w-[200px] sm:max-w-xs">
                {initialContent.title}
              </span>
            </nav>
          </div>

          {/* Quick Toolbar: Theme, Font, Mobile TOC, User Status */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            {currentUser ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Full Access Unlocked</span>
              </span>
            ) : (
              <button
                onClick={() => openAuthModal('signup')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-900/70 text-indigo-700 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-colors shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Unlock All Lessons</span>
              </button>
            )}

            <button 
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors shadow-2xs"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            <button 
              onClick={() => setIsTocOpenMobile(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-sm hover:bg-indigo-700 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Index</span>
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================
          2. MAIN CONTENT BODY (LESSON ARTICLE + COURSE SIDEBAR)
      ======================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 relative">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-10">
          
          {/* MAIN ARTICLE COLUMN */}
          <article ref={articleRef} className="flex-1 max-w-4xl min-w-0 space-y-12">
             {loadedContents.map((c, index) => {
                const isBengali = c.version === 'bn';
                let htmlBody = c.content_body || "";
                let isPaywalled = false;
                
                // If user is not logged in: preview first ~35% of first content, lock subsequent ones
                if (!currentUser && index === 0) { 
                    const previewLength = Math.max(Math.floor(htmlBody.length * 0.35), 450);
                    if (htmlBody.length > 550) {
                       htmlBody = htmlBody.substring(0, previewLength);
                       isPaywalled = true;
                    }
                } else if (!currentUser && index > 0) {
                    htmlBody = "";
                    isPaywalled = true;
                }

                return (
                 <div key={c.id} id={`content-${c.id}`} className="scroll-mt-28">
                    
                    {/* Header Info Banner */}
                    <header className="mb-6">
                       
                       {/* Context Pills */}
                       <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-lg shadow-2xs">
                             {c.lesson_plan_lessons?.lesson_plan_units?.title || subject?.title || 'Academic Unit'}
                          </span>
                          
                          {c.lesson_plan_lessons?.title && (
                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                              {c.lesson_plan_lessons.title}
                            </span>
                          )}

                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
                             <Clock className="w-3.5 h-3.5" />
                             <span>5-8 min read</span>
                          </div>

                          <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                             <Eye className="w-3.5 h-3.5" />
                             <span>{c.view_count || 0} views</span>
                          </div>
                       </div>
                       
                       {/* Topic Main Title */}
                       <h1 className={`text-2xl sm:text-3xl md:text-4xl font-black mb-4 leading-tight tracking-tight ${textMain} ${isBengali ? 'font-bangla' : ''}`}>
                          {c.title}
                       </h1>

                       {/* Educator & Marketing Value Card */}
                       {(() => {
                          const isSaved = savedContentIds.has(String(c.id));
                          const displaySavedCount = getDisplaySavedCount(c);
                          const authorName = 
                            c.author?.full_name || 
                            c.author_name || 
                            c.profiles?.full_name || 
                            (c.author_id && authorProfiles[c.author_id]?.full_name) || 
                            initialSubject?.author_name || 
                            initialSubject?.author || 
                            `${subject?.title || 'Academic'} Curriculum Faculty`;

                          return (
                             <div className={`p-4 bg-white dark:bg-[#0c1222] border ${borderCol} rounded-2xl shadow-xs transition-colors mb-6`}>
                                
                                {/* Line 1: Author / Educator Info + Actions */}
                                <div className="flex items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                                   <div className="flex items-center gap-3 min-w-0">
                                      {/* Faculty Avatar */}
                                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                                         {authorName.substring(0, 2).toUpperCase()}
                                      </div>

                                      {/* Author Name */}
                                      <div className="min-w-0">
                                         <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight truncate">
                                            {authorName}
                                         </h3>
                                      </div>
                                   </div>

                                   {/* Action Buttons: Save & Share */}
                                   <div className="flex items-center gap-2 shrink-0">
                                      {/* Interactive Save / Bookmark Button */}
                                      <button 
                                        onClick={() => handleSave(c)}
                                        className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all text-xs font-bold border shadow-2xs ${
                                          isSaved
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-600/20'
                                            : 'bg-slate-50 dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                                        }`}
                                        title={isSaved ? "Saved to your study dashboard (Click to remove)" : "Save to your study dashboard"}
                                      >
                                         <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                                         <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
                                         <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                                           isSaved 
                                             ? 'bg-indigo-700/80 text-white' 
                                             : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                         }`}>
                                           {displaySavedCount}
                                         </span>
                                      </button>

                                      {/* Share Button & Popover */}
                                      <div className="relative">
                                         <button 
                                           onClick={() => setShowShareMenu(showShareMenu?.id === c.id ? null : {id: c.id, show: true})}
                                           className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-400 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-2xs`}
                                           title="Share lesson"
                                         >
                                            <Share2 className="w-3.5 h-3.5" />
                                         </button>
                                         {showShareMenu?.id === c.id && (
                                            <div className={`absolute bottom-full right-0 mb-2 w-48 rounded-xl shadow-xl border overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 bg-white dark:bg-[#0c1222] ${borderCol}`}>
                                               <button onClick={() => handleShare('copy', `/curriculum/${subjectId}/${c.id}`)} className="w-full text-left px-4 py-2.5 text-xs font-bold flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"><LinkIcon size={14}/> Copy Link</button>
                                               <button onClick={() => handleShare('fb', `/curriculum/${subjectId}/${c.id}`)} className="w-full text-left px-4 py-2.5 text-xs font-bold flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"><Facebook size={14} className="text-indigo-600"/> Facebook</button>
                                               <button onClick={() => handleShare('wa', `/curriculum/${subjectId}/${c.id}`)} className="w-full text-left px-4 py-2.5 text-xs font-bold flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"><MessageCircle size={14} className="text-emerald-500"/> WhatsApp</button>
                                            </div>
                                         )}
                                      </div>
                                   </div>
                                </div>

                                {/* Line 2: Marketing Insights & Academic Value Triggers */}
                                <div className="pt-3 flex items-center gap-2 sm:gap-3 flex-wrap text-xs">
                                   
                                   {/* Last Updated */}
                                   <div className="flex items-center gap-1.5 font-semibold text-slate-500 dark:text-slate-400">
                                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <span>Last updated on {formatContentDate(c.created_at)}</span>
                                   </div>

                                   <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>

                                   {/* Saved by X Students */}
                                   <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                                      <Bookmark className="w-3.5 h-3.5 fill-indigo-600/20 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                      <span>Saved by <strong className="font-black">{displaySavedCount.toLocaleString()}</strong> students</span>
                                   </div>

                                   <span className="text-slate-300 dark:text-slate-700 font-bold hidden sm:inline">•</span>

                                   {/* High-Yield NCTB Trigger Pill */}
                                   <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 text-[11px] font-black shrink-0 shadow-2xs">
                                      <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                                      <span>98% Board Exam High-Yield</span>
                                   </span>

                                   {/* Syllabus Essential / Rating Pill */}
                                   <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-400 text-[11px] font-black shrink-0 shadow-2xs">
                                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                      <span>4.9/5 Student Rating</span>
                                   </span>

                                   {/* Quick Retention Time */}
                                   <div className="flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400 sm:ml-auto">
                                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <span>5–8 min high-retention read</span>
                                   </div>

                                </div>

                             </div>
                          );
                       })()}
                    </header>

                    {/* Lesson Body Content */}
                    <div className="relative">
                       {isPaywalled && index > 0 ? (
                          <div className={`p-8 rounded-2xl text-center border border-dashed ${borderCol} bg-white dark:bg-[#0c1222] shadow-xs`}>
                             <Lock className="w-8 h-8 mx-auto mb-3 text-indigo-500" />
                             <h4 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">Lesson Restricted to Registered Students</h4>
                             <p className="text-xs font-medium text-slate-500 mb-4 max-w-sm mx-auto">Create a free student profile to unlock all chapters in this subject.</p>
                             <button 
                               onClick={() => openAuthModal('signup')} 
                               className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition-all"
                             >
                               <span>Sign Up Free</span>
                               <ArrowRight size={14} />
                             </button>
                          </div>
                       ) : (
                          <RichTextDisplay 
                            className={`prose prose-base sm:prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:font-medium prose-p:leading-relaxed ${proseClass} ${isBengali ? 'font-bangla' : 'font-sans'}`}
                            content={parseHashtagsToHTML(htmlBody)}
                          />
                       )}

                       {/* ========================================================
                           REDESIGNED MINIMAL & ENGAGING PREVIEW PAYWALL SECTION
                       ======================================================== */}
                       {isPaywalled && index === 0 && (
                          <div className="relative mt-2">
                             {/* Smooth content fade-out gradient */}
                             <div className="h-44 bg-gradient-to-t from-white dark:from-[#070b14] via-white/80 dark:via-[#070b14]/80 to-transparent -translate-y-40 pointer-events-none" />
                             
                             {/* Minimal, High-Impact Conversion Card */}
                             <div className="relative -mt-24 max-w-xl mx-auto rounded-2xl p-6 sm:p-7 bg-white/95 dark:bg-[#0c1222]/95 border border-indigo-200/80 dark:border-indigo-900/60 shadow-xl backdrop-blur-xl text-center overflow-hidden">
                                
                                {/* Ambient Highlight Glow */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                                <div className="relative z-10 space-y-4">
                                   
                                   {/* Sparkle Badge */}
                                   <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-900/70 text-indigo-700 dark:text-indigo-400 text-xs font-extrabold shadow-2xs">
                                     <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                     <span>Free Academic Preview</span>
                                   </div>

                                   {/* Title & Description */}
                                   <div>
                                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                         Unlock the Complete Lesson
                                      </h3>
                                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1 max-w-md mx-auto leading-relaxed">
                                         Sign up in seconds to access the full curriculum reading notes, explanations, and key takeaways without leaving this page.
                                      </p>
                                   </div>

                                   {/* Micro-Benefits */}
                                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-left">
                                     <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                                       <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                       <span>Full Reading Text</span>
                                     </div>
                                     <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                                       <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                       <span>Sync Study State</span>
                                     </div>
                                     <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                                       <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                       <span>100% Free Access</span>
                                     </div>
                                   </div>

                                   {/* Action Buttons: Opens in-page Direct Auth Popup */}
                                   <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                                      <button 
                                        onClick={() => openAuthModal('signup')}
                                        className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group/btn"
                                      >
                                         <span>Sign Up Free to Continue</span>
                                         <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                                      </button>
                                      
                                      <button 
                                        onClick={() => openAuthModal('signin')}
                                        className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs sm:text-sm transition-colors"
                                      >
                                         Already registered? Sign In
                                      </button>
                                   </div>

                                </div>
                             </div>
                          </div>
                       )}
                    </div>
                    
                    {/* Discussion Section (Available once unlocked) */}
                    {!isPaywalled && (
                      <div className="mt-14 pt-8 border-t border-slate-200/80 dark:border-slate-800">
                        <Discussion itemType="curriculum" itemId={c.id.toString()} />
                      </div>
                    )}
                 </div>
                );
             })}

             {/* Infinite scroll loader for registered students */}
             {hasMore && currentUser && !reachedBoundary && (
                <div ref={loaderRef} className="py-16 flex justify-center">
                  <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 shadow-2xs">
                     <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                     <span>Loading next section...</span>
                  </div>
                </div>
             )}
          </article>

          {/* ========================================================
              RIGHT COLUMN: COURSE INDEX & TOPIC HIERARCHY
          ======================================================== */}
          <aside className="w-full lg:w-80 shrink-0">
             <div className="sticky top-28 bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors">
                
                {/* Index Header */}
                <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100 dark:border-slate-800">
                   <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                         <Layers size={14} />
                      </div>
                      <div>
                         <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Course Index</h3>
                         <span className="text-[10px] font-semibold text-slate-400 block truncate">
                            {subject?.title} Syllabus
                         </span>
                      </div>
                   </div>

                   <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                     {flatContentIndex.length} topics
                   </span>
                </div>

                {/* Topics Tree */}
                <div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                   {hierarchy.map(unit => {
                      const unitKey = String(unit.id);
                      const isUnitOpen = expandedUnits.has(unitKey);
                      const unitHasViewed = unit.lesson_plan_lessons?.some((l: any) => 
                         l.lesson_plan_contents?.some((c: any) => loadedContents.some(lc => lc.id === c.id))
                      );

                      return (
                        <div key={unit.id} className="rounded-xl border border-slate-100 dark:border-slate-800/80 overflow-hidden bg-slate-50/50 dark:bg-slate-900/30">
                          <button
                            onClick={() => toggleUnit(unitKey)}
                            className="w-full flex items-center gap-2 p-2.5 text-left hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors"
                          >
                              <div className={`w-1.5 h-3.5 rounded-full shrink-0 transition-all ${unitHasViewed ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`} />
                              <h4 className={`text-xs font-bold flex-1 truncate font-bangla ${unitHasViewed ? 'text-indigo-600 dark:text-indigo-400' : textMain}`}>
                                {unit.title}
                              </h4>
                              <ChevronDown size={13} className={`transition-transform duration-200 text-slate-400 ${isUnitOpen ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {isUnitOpen && (
                            <div className="space-y-1 p-1.5 pt-0 border-t border-slate-100 dark:border-slate-800">
                             {unit.lesson_plan_lessons?.sort((a:any, b:any) => a.order_index - b.order_index).map((l: any) => {
                                const lessonKey = String(l.id);
                                const isLessonOpen = expandedLessons.has(lessonKey);
                                const lessonHasViewed = l.lesson_plan_contents?.some((c: any) => loadedContents.some(lc => lc.id === c.id));

                                return (
                                  <div key={l.id} className="space-y-0.5">
                                   <button
                                     onClick={() => toggleLesson(lessonKey)}
                                     className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-lg text-left transition-colors ${lessonHasViewed ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                                   >
                                      <ChevronDown size={11} className={`transition-transform duration-200 text-slate-400 ${isLessonOpen ? 'rotate-180' : ''}`} />
                                      <span className="text-[11px] font-semibold truncate flex-1 font-bangla">{l.title}</span>
                                   </button>

                                   {isLessonOpen && (
                                     <div className="space-y-0.5 pl-3">
                                      {l.lesson_plan_contents?.sort((a:any, b:any) => a.order_index - b.order_index).map((c: any) => {
                                       const isViewed = loadedContents.some(loaded => loaded.id === c.id);
                                       return (
                                         <button 
                                           key={c.id} 
                                           onClick={() => {
                                              const element = document.getElementById(`content-${c.id}`);
                                              if (element) element.scrollIntoView({ behavior: 'smooth' });
                                              else window.location.href = `/curriculum/${subjectId}/${c.id}`;
                                           }}
                                           className={`relative w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all font-bangla ${
                                             isViewed 
                                               ? 'bg-indigo-600 text-white font-bold shadow-2xs' 
                                               : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                           }`}
                                         >
                                            <span className="truncate flex-1">{c.title}</span>
                                            {isViewed && <CheckCircle2 size={12} className="shrink-0" />}
                                         </button>
                                       );
                                      })}
                                     </div>
                                   )}
                                  </div>
                                );
                             })}
                            </div>
                          )}
                        </div>
                      );
                   })}
                </div>

                {/* Back to Subject */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Link 
                      href="/curriculum" 
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                    >
                        <ArrowRight size={13} className="rotate-180" />
                        <span>Curriculum Navigator</span>
                    </Link>
                </div>

             </div>
          </aside>

        </div>
      </div>

      {/* ========================================================
          3. DIRECT IN-PAGE AUTHENTICATION POPUP (MODAL)
             (Instant sign up / sign in to reveal content without reload!)
      ======================================================== */}
      {isAuthModalOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsAuthModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-2.5 shadow-md shadow-indigo-600/30">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {authMode === 'signup' ? 'Create Free Student Account' : 'Welcome Back'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {authMode === 'signup' 
                  ? 'Sign up to read the full curriculum lesson immediately.' 
                  : 'Sign in to sync your study progress and unlock all chapters.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 mb-5">
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                  authMode === 'signup'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign Up Free
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setAuthError(''); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                  authMode === 'signin'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Google OAuth Quick Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs font-extrabold text-slate-800 dark:text-slate-200 transition-colors shadow-2xs mb-4"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center mb-4">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-[#0c1222] px-2 text-[10px] uppercase font-bold text-slate-400 absolute">
                Or with email
              </span>
            </div>

            {/* Error Message Alert */}
            {authError && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 text-xs font-semibold text-center">
                {authError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={authFullName}
                      onChange={(e) => setAuthFullName(e.target.value)}
                      placeholder="e.g. Tanvir Ahmed"
                      className="w-full text-xs font-medium pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full text-xs font-medium pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full text-xs font-medium pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{authMode === 'signup' ? 'Create Account & Unlock Lesson' : 'Sign In & Unlock Lesson'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-[10px] text-center text-slate-400 mt-4">
              By continuing, you agree to NextPrepBD Terms of Service &bull; 100% Free
            </p>

          </div>
        </div>
      )}

      {/* ========================================================
          4. MOBILE TOC OVERLAY
      ======================================================== */}
      {isTocOpenMobile && (
         <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-300">
            <div className={`w-full max-w-[320px] h-full flex flex-col animate-in slide-in-from-right duration-300 bg-white dark:bg-[#0c1222] border-l border-slate-200 dark:border-slate-800`}>
               <div className="p-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Lesson Navigation</h3>
                  <button onClick={() => setIsTocOpenMobile(false)} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-2">
                   {hierarchy.map(unit => {
                      const unitKey = String(unit.id);
                      const isUnitOpen = expandedUnits.has(unitKey);
                      return (
                        <div key={unit.id} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 overflow-hidden">
                           <button onClick={() => toggleUnit(unitKey)} className="w-full flex items-center gap-2 p-2.5 text-left">
                              <span className="text-xs font-bold flex-1 font-bangla dark:text-white">{unit.title}</span>
                              <ChevronDown size={13} className={`transition-transform duration-200 text-slate-400 ${isUnitOpen ? 'rotate-180' : ''}`} />
                           </button>
                           {isUnitOpen && (
                             <div className="p-2 pt-0 space-y-1 border-t border-slate-100 dark:border-slate-800">
                                {unit.lesson_plan_lessons?.map((l:any) => (
                                   <div key={l.id} className="space-y-0.5">
                                      <p className="text-[10px] font-bold text-slate-400 font-bangla px-1">{l.title}</p>
                                      {l.lesson_plan_contents?.map((c:any) => (
                                         <button 
                                            key={c.id}
                                            onClick={() => { 
                                              setIsTocOpenMobile(false); 
                                              const el = document.getElementById(`content-${c.id}`); 
                                              if (el) el.scrollIntoView({behavior:'smooth'}); 
                                              else window.location.href = `/curriculum/${subjectId}/${c.id}`;
                                            }} 
                                            className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-xs font-semibold text-left dark:text-slate-300 truncate"
                                         >
                                            {c.title}
                                         </button>
                                      ))}
                                   </div>
                                ))}
                             </div>
                           )}
                        </div>
                      );
                   })}
               </div>
            </div>
         </div>
      )}

    </div>
  );
}
