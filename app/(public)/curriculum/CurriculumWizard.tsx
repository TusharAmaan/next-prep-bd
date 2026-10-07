'use client';

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronDown,
  ChevronLeft,
  ArrowRight,
  BookOpen, 
  Compass, 
  CheckCircle2, 
  RotateCcw,
  Library,
  FileText,
  Loader2,
  Atom,
  Microscope,
  FlaskConical,
  Dna,
  Stethoscope,
  Calculator,
  Binary,
  Laptop,
  Cpu,
  Languages,
  BookOpenText,
  Receipt,
  Coins,
  TrendingUp,
  BarChart2,
  BarChart3,
  Scale,
  Hourglass,
  Globe,
  Map,
  Sprout,
  Brain,
  Moon,
  Lightbulb,
  GraduationCap,
  Award,
  Briefcase,
  Building2,
  Landmark,
  Plane,
  Shield,
  Layers,
  LayoutGrid,
  Search,
  X,
  Sparkles,
  Eye,
  EyeOff,
  Scroll
} from 'lucide-react';
import Link from 'next/link';
import { fetchSubjectCurriculumUnits, searchCurriculumGlobal } from '@/app/actions/curriculum';

interface SegmentItem {
  id: number | string;
  title: string;
  slug: string;
}

interface GroupItem {
  id: number | string;
  title: string;
  slug: string;
  segment_id: number | string;
}

interface SubjectItem {
  id: number | string;
  title: string;
  slug: string;
  group_id?: number | string;
  segment_id?: number | string;
  groups?: any;
}

interface CurriculumWizardProps {
  initialSegments: SegmentItem[];
  initialGroups: GroupItem[];
  initialSubjects: SubjectItem[];
}

export default function CurriculumWizard({
  initialSegments,
  initialGroups,
  initialSubjects
}: CurriculumWizardProps) {
  // Selections
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');

  // Active step for selection UI (1: Stage, 2: Group, 3: Subject, 4: Lessons)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Global Command Palette / Search Overlay State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isSearchingServer, setIsSearchingServer] = useState(false);
  const [serverSearchResults, setServerSearchResults] = useState<{
    contents: any[];
    units: any[];
  }>({ contents: [], units: [] });
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Step 4 filtering & PC options
  const [lessonSearchQuery, setLessonSearchQuery] = useState<string>('');
  const [unitViewMode, setUnitViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [expandedUnitAccordions, setExpandedUnitAccordions] = useState<Record<string, boolean>>({});
  const [expandedLessonIds, setExpandedLessonIds] = useState<Record<string, boolean>>({});
  const [expandAllUnits, setExpandAllUnits] = useState<boolean>(true);
  const [showEmptyUnits, setShowEmptyUnits] = useState<boolean>(false);
  const unitsScrollRef = useRef<HTMLDivElement>(null);

  // Dynamic Units & Lessons cache per subject
  const [unitsCache, setUnitsCache] = useState<Record<string, any[]>>({});
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);

  // --- KEYBOARD SHORTCUT FOR GLOBAL SEARCH (Cmd/Ctrl + K) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Focus input when search modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isSearchOpen]);

  // Debounced server search for contents and units
  useEffect(() => {
    const query = globalSearchQuery.trim();
    if (!query || query.length < 2) {
      setServerSearchResults({ contents: [], units: [] });
      setIsSearchingServer(false);
      return;
    }

    setIsSearchingServer(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchCurriculumGlobal(query);
        setServerSearchResults(results);
      } catch (err) {
        console.error('Curriculum search failed:', err);
      } finally {
        setIsSearchingServer(false);
      }
    }, 280);

    return () => clearTimeout(timeoutId);
  }, [globalSearchQuery]);

  // Available groups based on selected segment
  const availableGroups = useMemo(() => {
    if (!selectedSegmentId) return [];
    return initialGroups.filter(g => g.segment_id?.toString() === selectedSegmentId);
  }, [initialGroups, selectedSegmentId]);

  // Available subjects based on stage and group
  const availableSubjects = useMemo(() => {
    if (!selectedSegmentId) return [];
    return initialSubjects.filter(sub => {
      const segMatch = (sub.groups?.segment_id?.toString() || sub.segment_id?.toString()) === selectedSegmentId;
      const grpMatch = !selectedGroupId || sub.group_id?.toString() === selectedGroupId;
      return segMatch && grpMatch;
    });
  }, [initialSubjects, selectedSegmentId, selectedGroupId]);

  // Selected entities
  const selectedSegment = useMemo(
    () => initialSegments.find(s => s.id.toString() === selectedSegmentId),
    [initialSegments, selectedSegmentId]
  );

  const selectedGroup = useMemo(
    () => initialGroups.find(g => g.id.toString() === selectedGroupId),
    [initialGroups, selectedGroupId]
  );

  const selectedSubject = useMemo(
    () => initialSubjects.find(s => s.id.toString() === selectedSubjectId),
    [initialSubjects, selectedSubjectId]
  );

  // Current subject units
  const currentUnits = useMemo(() => {
    if (!selectedSubjectId) return [];
    return unitsCache[selectedSubjectId] || [];
  }, [unitsCache, selectedSubjectId]);

  // Units with lessons vs empty units
  const unitsWithLessonsCount = useMemo(() => {
    return currentUnits.filter((u: any) => (u.lesson_plan_lessons || []).length > 0).length;
  }, [currentUnits]);

  const emptyUnitsCount = useMemo(() => {
    return currentUnits.length - unitsWithLessonsCount;
  }, [currentUnits, unitsWithLessonsCount]);

  // Filtered units based on selectedUnitId, lessonSearchQuery, and showEmptyUnits
  const filteredUnits = useMemo(() => {
    if (!currentUnits || currentUnits.length === 0) return [];
    
    const query = lessonSearchQuery.trim().toLowerCase();
    
    return currentUnits
      .filter((u: any) => {
        if (!showEmptyUnits && unitsWithLessonsCount > 0) {
          if (!u.lesson_plan_lessons || u.lesson_plan_lessons.length === 0) {
            return false;
          }
        }
        if (selectedUnitId && u.id.toString() !== selectedUnitId) {
          return false;
        }
        return true;
      })
      .map((u: any) => {
        if (!query) return u;
        
        const unitTitleMatch = (u.title || '').toLowerCase().includes(query);
        const matchingLessons = (u.lesson_plan_lessons || []).filter((l: any) => {
          const lessonTitleMatch = (l.title || '').toLowerCase().includes(query);
          const contentMatch = (l.lesson_plan_contents || []).some((c: any) => 
            (c.title || '').toLowerCase().includes(query)
          );
          return lessonTitleMatch || contentMatch;
        });

        if (unitTitleMatch) {
          return u;
        }

        if (matchingLessons.length > 0) {
          return {
            ...u,
            lesson_plan_lessons: matchingLessons
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [currentUnits, selectedUnitId, lessonSearchQuery, showEmptyUnits, unitsWithLessonsCount]);

  const totalLessonsCount = useMemo(() => {
    return currentUnits.reduce((acc: number, u: any) => acc + (u.lesson_plan_lessons?.length || 0), 0);
  }, [currentUnits]);

  // --- PC-FRIENDLY SCROLL & ACCORDION HELPERS ---
  const scrollUnits = (direction: 'left' | 'right') => {
    if (unitsScrollRef.current) {
      const scrollOffset = direction === 'left' ? -260 : 260;
      unitsScrollRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };

  const handleUnitsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (unitsScrollRef.current && e.deltaY !== 0) {
      unitsScrollRef.current.scrollLeft += e.deltaY;
    }
  };

  const toggleUnitAccordion = (unitId: string | number) => {
    const key = unitId.toString();
    setExpandedUnitAccordions(prev => ({
      ...prev,
      [key]: prev[key] === undefined ? false : !prev[key]
    }));
  };

  const toggleLessonExpanded = (lessonId: string | number) => {
    const key = lessonId.toString();
    setExpandedLessonIds(prev => ({
      ...prev,
      [key]: prev[key] === undefined ? false : !prev[key]
    }));
  };

  const handleToggleExpandAll = () => {
    const nextState = !expandAllUnits;
    setExpandAllUnits(nextState);
    const updated: Record<string, boolean> = {};
    currentUnits.forEach((u: any) => {
      updated[u.id.toString()] = nextState;
    });
    setExpandedUnitAccordions(updated);
  };

  // --- SELECTION ACTIONS ---
  const handleSelectSegment = useCallback((id: string) => {
    setSelectedSegmentId(id);
    setSelectedGroupId('');
    setSelectedSubjectId('');
    setSelectedUnitId('');
    setLessonSearchQuery('');
    setExpandedLessonIds({});
    setActiveStep(2);
  }, []);

  const handleSelectGroup = useCallback((id: string) => {
    setSelectedGroupId(id);
    setSelectedSubjectId('');
    setSelectedUnitId('');
    setLessonSearchQuery('');
    setExpandedLessonIds({});
    setActiveStep(3);
  }, []);

  const handleSelectSubject = useCallback(async (id: string, directJumpUnitId?: string) => {
    setSelectedSubjectId(id);
    setSelectedUnitId(directJumpUnitId || '');
    setLessonSearchQuery('');
    setExpandedLessonIds({});

    if (!unitsCache[id]) {
      setIsLoadingUnits(true);
      try {
        const fetchedUnits = await fetchSubjectCurriculumUnits(id, 'bn');
        setUnitsCache(prev => ({ ...prev, [id]: fetchedUnits || [] }));
      } catch (err) {
        console.error('Failed to load units:', err);
      } finally {
        setIsLoadingUnits(false);
      }
    }

    setActiveStep(4);
  }, [unitsCache]);

  const handleReset = useCallback(() => {
    setSelectedSegmentId('');
    setSelectedGroupId('');
    setSelectedSubjectId('');
    setSelectedUnitId('');
    setLessonSearchQuery('');
    setExpandedLessonIds({});
    setActiveStep(1);
  }, []);

  // Jump from global search directly into a subject or unit
  const handleGlobalSelectSubject = useCallback((subject: SubjectItem, unitId?: string | number) => {
    const segId = subject.groups?.segment_id?.toString() || subject.segment_id?.toString() || '';
    const grpId = subject.group_id?.toString() || '';

    if (segId) setSelectedSegmentId(segId);
    if (grpId) setSelectedGroupId(grpId);

    setIsSearchOpen(false);
    setGlobalSearchQuery('');
    handleSelectSubject(subject.id.toString(), unitId ? unitId.toString() : undefined);
  }, [handleSelectSubject]);

  // Client-side instant subject matches for global search
  const filteredSearchSubjects = useMemo(() => {
    const q = globalSearchQuery.trim().toLowerCase();
    if (!q) return initialSubjects.slice(0, 8);
    return initialSubjects.filter(sub => {
      const matchSub = (sub.title || '').toLowerCase().includes(q);
      const matchGrp = (sub.groups?.title || '').toLowerCase().includes(q);
      const matchSeg = (sub.groups?.segments?.title || '').toLowerCase().includes(q);
      return matchSub || matchGrp || matchSeg;
    }).slice(0, 10);
  }, [initialSubjects, globalSearchQuery]);

  // =========================================================================
  // DYNAMIC NAME-BASED ICONOGRAPHY RESOLVERS
  // =========================================================================

  // 1. SEGMENTS (Academic Program / Stage)
  const getSegmentIcon = (title: string = '') => {
    const lower = title.toLowerCase();
    if (lower.includes('ssc')) return GraduationCap;
    if (lower.includes('hsc')) return Award;
    if (lower.includes('job') || lower.includes('চাকরি')) return Briefcase;
    if (lower.includes('university') || lower.includes('ভর্তি') || lower.includes('admission')) return Landmark;
    if (lower.includes('special') || lower.includes('বিশেষ')) return Sparkles;
    if (lower.includes('master') || lower.includes('মাস্টার্স')) return Scroll;
    if (lower.includes('skill') || lower.includes('দক্ষতা')) return Cpu;
    return GraduationCap;
  };

  // 2. GROUPS (Disciplines / Streams)
  const getGroupIcon = (title: string = '') => {
    const lower = title.toLowerCase();
    if (
      lower.includes('business') || 
      lower.includes('commerce') || 
      lower.includes('ব্যবসায়') || 
      lower.includes('বাণিজ্য') || 
      lower.includes('mba')
    ) return TrendingUp;
    if (lower.includes('science') || lower.includes('বিজ্ঞান') || lower.includes('ms')) return Microscope;
    if (lower.includes('humanities') || lower.includes('arts') || lower.includes('মানবিক')) return Globe;
    if (lower.includes('bcs')) return Landmark;
    if (lower.includes('bank') || lower.includes('ব্যাংক')) return Coins;
    if (lower.includes('govt') || lower.includes('সরকারি')) return Building2;
    if (lower.includes('computer') || lower.includes('cse') || lower.includes('তথ্য') || lower.includes('প্রযুক্তি')) return Laptop;
    if (lower.includes('statistic') || lower.includes('পরিসংখ্যান')) return BarChart3;
    if (lower.includes('cadet') || lower.includes('ক্যাডেট')) return Shield;
    if (lower.includes('english') || lower.includes('ইংরেজি') || lower.includes('language')) return Languages;
    if (lower.includes('abroad') || lower.includes('aborad') || lower.includes('বিদেশ')) return Plane;
    if (lower.includes('geology') || lower.includes('ভূতত্ত্ব')) return Compass;
    if (lower.includes('admission') || lower.includes('ভর্তি')) return Landmark;
    return Layers;
  };

  const getGroupColorStyles = (title: string = '', isSelected: boolean) => {
    if (isSelected) return 'bg-white/20 text-white';
    const lower = title.toLowerCase();
    if (lower.includes('business') || lower.includes('commerce') || lower.includes('ব্যবসায়') || lower.includes('বাণিজ্য') || lower.includes('mba')) {
      return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60';
    }
    if (lower.includes('science') || lower.includes('বিজ্ঞান') || lower.includes('ms')) {
      return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200/60 dark:border-cyan-900/60';
    }
    if (lower.includes('humanities') || lower.includes('arts') || lower.includes('মানবিক')) {
      return 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-900/60';
    }
    if (lower.includes('bank') || lower.includes('govt') || lower.includes('bcs')) {
      return 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60';
    }
    return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/60';
  };

  // 3. SUBJECTS (Academic Subject Iconography)
  const getSubjectIcon = (title: string = '') => {
    const lower = title.toLowerCase();
    if (lower.includes('physics') || lower.includes('পদার্থ')) return Atom;
    if (lower.includes('chemistry') || lower.includes('রসায়ন')) return FlaskConical;
    if (lower.includes('medical') || lower.includes('মেডিকেল') || lower.includes('ডাক্তার')) return Stethoscope;
    if (lower.includes('biology') || lower.includes('জীববিজ্ঞান')) return Dna;
    if (lower.includes('math') || lower.includes('গণিত') || lower.includes('geometry') || lower.includes('algebra')) return Calculator;
    if (lower.includes('ict') || lower.includes('তথ্য') || lower.includes('computer') || lower.includes('কম্পিউটার')) return Binary;
    if (
      lower.includes('english') || 
      lower.includes('ইংরেজি') || 
      lower.includes('ielts') || 
      lower.includes('sat') || 
      lower.includes('act') || 
      lower.includes('cat') || 
      lower.includes('gmat') ||
      lower.includes('spoken')
    ) return Languages;
    if (lower.includes('bangla') || lower.includes('বাংলা') || lower.includes('সাহিত্য')) return BookOpenText;
    if (lower.includes('accounting') || lower.includes('হিসাববিজ্ঞান')) return Receipt;
    if (lower.includes('finance') || lower.includes('banking') || lower.includes('insurance') || lower.includes('ফিন্যান্স') || lower.includes('ব্যাংকিং')) return Coins;
    if (
      lower.includes('business') || 
      lower.includes('entrepreneurship') || 
      lower.includes('management') || 
      lower.includes('marketing') || 
      lower.includes('ব্যবসায়') || 
      lower.includes('ব্যবস্থাপনা') || 
      lower.includes('বিপণন')
    ) return Briefcase;
    if (lower.includes('economics') || lower.includes('অর্থনীতি')) return TrendingUp;
    if (lower.includes('statistic') || lower.includes('পরিসংখ্যান')) return BarChart2;
    if (lower.includes('civic') || lower.includes('পৌরনীতি') || lower.includes('law') || lower.includes('আইন')) return Scale;
    if (lower.includes('history') || lower.includes('ইতিহাস')) return Hourglass;
    if (lower.includes('geography') || lower.includes('ভূগোল') || lower.includes('পরিবেশ')) return Map;
    if (lower.includes('agriculture') || lower.includes('কৃষি')) return Sprout;
    if (lower.includes('psychology') || lower.includes('মনোবিজ্ঞান')) return Brain;
    if (lower.includes('islam') || lower.includes('religion') || lower.includes('ধর্ম')) return Moon;
    if (lower.includes('general knowledge') || lower.includes('gk') || lower.includes('সাধারণ জ্ঞান') || lower.includes('analytical')) return Lightbulb;
    if (lower.includes('general science') || lower.includes('বিজ্ঞান')) return Microscope;
    if (
      lower.includes('du') || 
      lower.includes('buet') || 
      lower.includes('ru') || 
      lower.includes('ju') || 
      lower.includes('cu') || 
      lower.includes('gst') || 
      lower.includes('sust') || 
      lower.includes('iba') || 
      lower.includes('bup') || 
      lower.includes('mist')
    ) return Landmark;

    return BookOpen;
  };

  const getSubjectColorStyles = (title: string = '', isSelected: boolean) => {
    if (isSelected) return 'bg-white/20 text-white';
    const lower = title.toLowerCase();
    if (lower.includes('physics') || lower.includes('math') || lower.includes('ict') || lower.includes('পদার্থ') || lower.includes('গণিত')) {
      return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60';
    }
    if (lower.includes('chem') || lower.includes('bio') || lower.includes('রসায়ন') || lower.includes('জীব')) {
      return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60';
    }
    if (lower.includes('account') || lower.includes('finance') || lower.includes('business') || lower.includes('হিসাব') || lower.includes('ব্যবসায়')) {
      return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60';
    }
    if (lower.includes('english') || lower.includes('bangla') || lower.includes('history') || lower.includes('ইংরেজি') || lower.includes('বাংলা')) {
      return 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/60';
    }
    return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60';
  };

  return (
    <div className="w-full min-h-screen bg-[#fafbfc] dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white transition-colors">
      
      {/* ========================================================
          1. HEADER WITH SLEEK AMBIENT GRADIENT & QUICK STATS
      ======================================================== */}
      <header className="relative w-full bg-white/80 dark:bg-[#0c1222]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 pt-20 pb-5 md:pt-28 md:pb-6 px-4 sm:px-6 lg:px-8 transition-all">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-24 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          
          {/* Top Row: Breadcrumb & Reset */}
          <div className="flex items-center justify-between gap-4 mb-2">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 dark:text-slate-200 font-semibold">Academic Curriculum</span>
            </nav>

            {selectedSegmentId && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All</span>
              </button>
            )}
          </div>

          {/* Title Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-400 text-[11px] font-bold uppercase tracking-wider mb-1.5 shadow-2xs">
                <Compass className="w-3 h-3 text-indigo-500 animate-pulse" />
                <span>NCTB Curriculum Navigator</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Curriculum Explorer
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                Official curriculum chapters, units, and direct reading lessons across SSC, HSC, and Admission.
              </p>
            </div>

            {/* Quick Sticky Search Trigger Button */}
            <div className="w-full md:w-auto">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-full md:w-80 flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                  <Search className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Search anything in curriculum...
                  </span>
                </div>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md border border-slate-200 dark:border-slate-700">
                  <span>Ctrl</span>+<span>K</span>
                </kbd>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* ========================================================
          2. COMPACT STEP PROGRESS & INLINE BREADCRUMB DOCK
      ======================================================== */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        
        {/* Horizontal Step Indicator Bar */}
        <div className="bg-white dark:bg-[#0c1222] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-3 shadow-xs">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            
            {/* Step 1: Program */}
            <button
              onClick={() => setActiveStep(1)}
              className={`flex-1 flex items-center gap-2 p-1.5 sm:p-2 rounded-xl transition-all text-left ${
                activeStep === 1
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-900/60 shadow-2xs'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                selectedSegmentId 
                  ? 'bg-emerald-600 text-white' 
                  : activeStep === 1 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {selectedSegmentId ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  React.createElement(getSegmentIcon(selectedSegment?.title || ''), { className: 'w-3.5 h-3.5' })
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block truncate">
                  1. Stage
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white truncate block">
                  {selectedSegment ? selectedSegment.title : 'Choose'}
                </span>
              </div>
            </button>

            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700 shrink-0 hidden xs:block" />

            {/* Step 2: Discipline */}
            <button
              onClick={() => selectedSegmentId && setActiveStep(2)}
              disabled={!selectedSegmentId}
              className={`flex-1 flex items-center gap-2 p-1.5 sm:p-2 rounded-xl transition-all text-left ${
                !selectedSegmentId 
                  ? 'opacity-40 cursor-not-allowed' 
                  : activeStep === 2
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-900/60 shadow-2xs'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                selectedGroupId !== '' || availableGroups.length === 0
                  ? 'bg-emerald-600 text-white' 
                  : activeStep === 2 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {selectedGroupId !== '' || availableGroups.length === 0 ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  React.createElement(getGroupIcon(selectedGroup?.title || ''), { className: 'w-3.5 h-3.5' })
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block truncate">
                  2. Discipline
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white truncate block">
                  {selectedGroup ? selectedGroup.title : selectedGroupId === '' && selectedSegmentId ? 'All Groups' : 'Select'}
                </span>
              </div>
            </button>

            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700 shrink-0 hidden xs:block" />

            {/* Step 3: Subject */}
            <button
              onClick={() => selectedSegmentId && setActiveStep(3)}
              disabled={!selectedSegmentId}
              className={`flex-1 flex items-center gap-2 p-1.5 sm:p-2 rounded-xl transition-all text-left ${
                !selectedSegmentId 
                  ? 'opacity-40 cursor-not-allowed' 
                  : activeStep === 3
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-900/60 shadow-2xs'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                selectedSubjectId 
                  ? 'bg-emerald-600 text-white' 
                  : activeStep === 3 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {selectedSubjectId ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  React.createElement(getSubjectIcon(selectedSubject?.title || ''), { className: 'w-3.5 h-3.5' })
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block truncate">
                  3. Subject
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white truncate block">
                  {selectedSubject ? selectedSubject.title : 'Choose'}
                </span>
              </div>
            </button>

            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700 shrink-0 hidden xs:block" />

            {/* Step 4: Lessons */}
            <button
              onClick={() => selectedSubjectId && setActiveStep(4)}
              disabled={!selectedSubjectId}
              className={`flex-1 flex items-center gap-2 p-1.5 sm:p-2 rounded-xl transition-all text-left ${
                !selectedSubjectId 
                  ? 'opacity-40 cursor-not-allowed' 
                  : activeStep === 4
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-900/60 shadow-2xs'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                activeStep === 4 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                <Library className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block truncate">
                  4. Lessons
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white truncate block">
                  {currentUnits.length > 0 ? `${totalLessonsCount} Lessons` : 'Browse'}
                </span>
              </div>
            </button>

          </div>

          {/* Inline Breadcrumb Trail (When 2 or more steps are picked) */}
          {selectedSegment && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mr-1">
                  Current Track:
                </span>

                {/* Stage Chip with Dynamic Icon */}
                {(() => {
                  const SegIcon = getSegmentIcon(selectedSegment.title);
                  return (
                    <button
                      onClick={() => setActiveStep(1)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-900/70 text-indigo-700 dark:text-indigo-300 font-extrabold hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
                    >
                      <SegIcon className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{selectedSegment.title}</span>
                      <span className="text-[10px] text-indigo-400">✏️</span>
                    </button>
                  );
                })()}

                <ChevronRight className="w-3 h-3 text-slate-400" />

                {/* Discipline Chip with Dynamic Icon */}
                {(() => {
                  const GrpIcon = getGroupIcon(selectedGroup ? selectedGroup.title : 'All Groups');
                  return (
                    <button
                      onClick={() => setActiveStep(2)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-extrabold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      <GrpIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>{selectedGroup ? selectedGroup.title : 'All Groups'}</span>
                      <span className="text-[10px] text-slate-400">✏️</span>
                    </button>
                  );
                })()}

                {selectedSubject && (
                  <>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                    {/* Subject Chip with Dynamic Icon */}
                    {(() => {
                      const SubIcon = getSubjectIcon(selectedSubject.title);
                      return (
                        <button
                          onClick={() => setActiveStep(3)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <SubIcon className="w-3.5 h-3.5 text-indigo-200" />
                          <span>{selectedSubject.title}</span>
                          <span className="text-[10px] text-indigo-200">✏️</span>
                        </button>
                      );
                    })()}
                  </>
                )}
              </div>

              {selectedSubject && activeStep !== 4 && (
                <button
                  onClick={() => setActiveStep(4)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>View Lessons</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

        </div>

      </div>

      {/* ========================================================
          3. MAIN INTERACTIVE CONTENT AREA (EXPANDED SELECTION OR LESSONS)
      ======================================================== */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* ----------------------------------------------------
            STEP 1: SELECT ACADEMIC PROGRAM WITH NAME-BASED ICONS
        ---------------------------------------------------- */}
        {activeStep === 1 && (
          <div className="bg-white dark:bg-[#0c1222] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-0.5">
                  Step 1 &bull; Academic Program
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Select Your Target Education Level
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose your curriculum stage to see available streams and subject syllabuses.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
              {initialSegments.map(seg => {
                const isSelected = selectedSegmentId === seg.id.toString();
                const SegIcon = getSegmentIcon(seg.title);

                return (
                  <button
                    key={seg.id}
                    onClick={() => handleSelectSegment(seg.id.toString())}
                    className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                        : 'bg-slate-50/80 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                      }`}>
                        <SegIcon className="w-4 h-4" />
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-sm font-extrabold truncate block">{seg.title}</span>
                    <span className={`text-[11px] mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-600 dark:text-slate-300'}`}>
                      Select Program &rarr;
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            STEP 2: SELECT DISCIPLINE / GROUP WITH NAME-BASED ICONS
        ---------------------------------------------------- */}
        {activeStep === 2 && (
          <div className="bg-white dark:bg-[#0c1222] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-0.5">
                  Step 2 &bull; Discipline & Stream
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Filter by Discipline for {selectedSegment?.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pick your study group (Science, Business Studies, Humanities) or view all subjects.
                </p>
              </div>

              <button
                onClick={() => setActiveStep(1)}
                className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
              >
                &larr; Back to Stage
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
              {/* All Groups Option */}
              <button
                onClick={() => handleSelectGroup('')}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  selectedGroupId === ''
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                    : 'bg-slate-50/80 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800/80 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    selectedGroupId === '' ? 'bg-white/20 text-white dark:bg-slate-900/10 dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    <Layers className="w-4 h-4" />
                  </div>
                  {selectedGroupId === '' && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <span className="text-sm font-extrabold truncate block">All Groups</span>
                <span className="text-[11px] opacity-75 mt-0.5">View all subjects</span>
              </button>

              {availableGroups.map(grp => {
                const isSelected = selectedGroupId === grp.id.toString();
                const GrpIcon = getGroupIcon(grp.title);
                const colorBadgeClass = getGroupColorStyles(grp.title, isSelected);

                return (
                  <button
                    key={grp.id}
                    onClick={() => handleSelectGroup(grp.id.toString())}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                        : 'bg-slate-50/80 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${colorBadgeClass}`}>
                        <GrpIcon className="w-4 h-4" />
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-sm font-extrabold truncate block">{grp.title}</span>
                    <span className={`text-[11px] mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-600 dark:text-slate-300'}`}>
                      Filter Group &rarr;
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            STEP 3: SELECT SUBJECT WITH NAME-BASED ICONS
        ---------------------------------------------------- */}
        {activeStep === 3 && (
          <div className="bg-white dark:bg-[#0c1222] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-0.5">
                  Step 3 &bull; Academic Subject
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Choose Subject ({availableSubjects.length} available)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select a subject to instantly explore its chapters, lessons, and topic content.
                </p>
              </div>

              <button
                onClick={() => setActiveStep(2)}
                className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
              >
                &larr; Back to Discipline
              </button>
            </div>

            {availableSubjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {availableSubjects.map(sub => {
                  const isSelected = selectedSubjectId === sub.id.toString();
                  const SubIcon = getSubjectIcon(sub.title);
                  const colorBadgeClass = getSubjectColorStyles(sub.title, isSelected);

                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleSelectSubject(sub.id.toString())}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                          : 'bg-slate-50/80 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-sm'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorBadgeClass}`}>
                        <SubIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs sm:text-sm font-extrabold truncate block">{sub.title}</span>
                        <span className={`text-[10px] truncate block ${isSelected ? 'text-indigo-200' : 'text-slate-600 dark:text-slate-300'}`}>
                          {sub.groups?.title || selectedGroup?.title || 'General'}
                        </span>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
                      ) : (
                        <ChevronRight className="w-4 h-4 shrink-0 text-slate-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <p className="text-xs text-slate-500">No subjects found for the selected filter.</p>
                <button
                  onClick={() => setSelectedGroupId('')}
                  className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
                >
                  Show all subjects in {selectedSegment?.title}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------
            STEP 4: DIRECT SYLLABUS LESSONS JUMP & EXPLORER
        ---------------------------------------------------- */}
        {activeStep === 4 && selectedSubject && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* 1. HERO SUBJECT BANNER */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-indigo-800/60 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                    {React.createElement(getSubjectIcon(selectedSubject.title), { className: 'w-6 h-6 text-indigo-300' })}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                        {selectedSegment?.title}
                      </span>
                      {selectedGroup && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/10">
                          {selectedGroup.title}
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {currentUnits.length} Chapters &bull; {totalLessonsCount} Lessons
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                      {selectedSubject.title} Lessons & Topics
                    </h2>
                    <p className="text-xs text-indigo-200/80 mt-0.5">
                      Select any topic below to open the lesson plan and study curriculum notes.
                    </p>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    onClick={() => setActiveStep(3)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-indigo-900 hover:bg-indigo-50 transition-colors shadow-sm flex items-center gap-1.5"
                    title="Change Subject"
                  >
                    <span>Switch Subject</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. TOOLBAR: Search, Jump Dropdown, Empty Units Toggle, Grid/Row View */}
            <div className="bg-white dark:bg-[#0c1222] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-3 sm:p-4 shadow-xs space-y-3">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Search in Current Subject */}
                <div className="relative flex-1 md:max-w-md">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={lessonSearchQuery}
                    onChange={(e) => setLessonSearchQuery(e.target.value)}
                    placeholder="Search topics inside this subject (e.g., Affirmative, Vectors)..."
                    className="w-full text-xs font-medium pl-8 pr-7 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  {lessonSearchQuery && (
                    <button
                      onClick={() => setLessonSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Right controls: Chapter Dropdown + Empty Units Toggle + View Mode */}
                <div className="flex items-center gap-2 flex-wrap">
                  
                  {/* Jump Dropdown */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <select
                      value={selectedUnitId}
                      onChange={(e) => setSelectedUnitId(e.target.value)}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 max-w-[180px] sm:max-w-xs cursor-pointer truncate"
                    >
                      <option value="">All Chapters ({filteredUnits.length})</option>
                      {currentUnits.map((u: any, idx: number) => {
                        const lessonsCount = (u.lesson_plan_lessons || []).length;
                        return (
                          <option key={u.id} value={u.id.toString()}>
                            U{idx + 1}: {u.title} ({lessonsCount} lessons)
                          </option>
                        );
                      })}
                    </select>
                    {selectedUnitId && (
                      <button
                        onClick={() => setSelectedUnitId('')}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Empty Units Toggle Button (User-Requested: Hide empty units with toggle) */}
                  {emptyUnitsCount > 0 && (
                    <button
                      onClick={() => setShowEmptyUnits(prev => !prev)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors shrink-0 ${
                        showEmptyUnits
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                      title={showEmptyUnits ? "Hide empty chapters with 0 lessons" : `Show ${emptyUnitsCount} empty chapters`}
                    >
                      {showEmptyUnits ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                      <span className="hidden sm:inline">
                        {showEmptyUnits ? 'Hiding 0-lesson units' : `${emptyUnitsCount} empty units hidden`}
                      </span>
                      <span className="sm:hidden">
                        {showEmptyUnits ? 'Hide empty' : `${emptyUnitsCount} empty`}
                      </span>
                    </button>
                  )}

                  {/* View Mode Toggle: Grid vs Carousel */}
                  <button
                    onClick={() => setUnitViewMode(unitViewMode === 'carousel' ? 'grid' : 'carousel')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shrink-0 shadow-2xs"
                    title={unitViewMode === 'carousel' ? "Show all chapters as a grid" : "Show compact scrollable row"}
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="hidden sm:inline">{unitViewMode === 'carousel' ? 'Grid' : 'Row'}</span>
                  </button>

                  {/* Expand/Collapse All */}
                  <button
                    onClick={handleToggleExpandAll}
                    className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors shrink-0 px-1"
                  >
                    {expandAllUnits ? 'Collapse All' : 'Expand All'}
                  </button>

                </div>

              </div>

              {/* 3. CHAPTER NAVIGATION (GRID OR ROW CAROUSEL) */}
              {unitViewMode === 'grid' ? (
                /* GRID MODE FOR PC USERS */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1 animate-in fade-in duration-150">
                  <button
                    onClick={() => setSelectedUnitId('')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                      selectedUnitId === ''
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>All Chapters</span>
                      <span className="text-[10px] opacity-75">{filteredUnits.length}</span>
                    </div>
                  </button>

                  {currentUnits
                    .filter((u: any) => showEmptyUnits || (u.lesson_plan_lessons || []).length > 0 || unitsWithLessonsCount === 0)
                    .map((u: any, idx: number) => {
                      const isSelected = selectedUnitId === u.id.toString();
                      const lessonCount = (u.lesson_plan_lessons || []).length;
                      return (
                        <button
                          key={u.id}
                          onClick={() => setSelectedUnitId(isSelected ? '' : u.id.toString())}
                          className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-[10px] font-black uppercase ${isSelected ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'}`}>
                              Unit {idx + 1}
                            </span>
                            <span className={`text-[10px] font-semibold ${lessonCount === 0 ? 'text-slate-400' : isSelected ? 'text-indigo-100' : 'text-emerald-600 dark:text-emerald-400'}`}>
                              {lessonCount} lessons
                            </span>
                          </div>
                          <p className="truncate mt-0.5 text-xs">{u.title}</p>
                        </button>
                      );
                    })}
                </div>
              ) : (
                /* HORIZONTAL CAROUSEL WITH PC ARROW BUTTONS */
                <div className="relative group/carousel pt-1">
                  <button
                    type="button"
                    onClick={() => scrollUnits('left')}
                    aria-label="Scroll left"
                    className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all opacity-90 group-hover/carousel:opacity-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div
                    ref={unitsScrollRef}
                    onWheel={handleUnitsWheel}
                    className="flex items-center gap-1.5 overflow-x-auto py-1 px-6 scroll-smooth select-none"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    <button
                      onClick={() => setSelectedUnitId('')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all shrink-0 ${
                        selectedUnitId === ''
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      All Chapters ({filteredUnits.length})
                    </button>

                    {currentUnits
                      .filter((u: any) => showEmptyUnits || (u.lesson_plan_lessons || []).length > 0 || unitsWithLessonsCount === 0)
                      .map((u: any, idx: number) => {
                        const isSelected = selectedUnitId === u.id.toString();
                        const lessonCount = (u.lesson_plan_lessons || []).length;
                        return (
                          <button
                            key={u.id}
                            onClick={() => setSelectedUnitId(isSelected ? '' : u.id.toString())}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                            }`}
                            title={`Unit ${idx + 1}: ${u.title}`}
                          >
                            <span className={`text-[10px] font-black uppercase ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                              U{idx + 1}
                            </span>
                            <span className="max-w-[180px] truncate">{u.title}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}>
                              {lessonCount}
                            </span>
                          </button>
                        );
                      })}
                  </div>

                  <button
                    type="button"
                    onClick={() => scrollUnits('right')}
                    aria-label="Scroll right"
                    className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all opacity-90 group-hover/carousel:opacity-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>

            {/* 4. CHAPTERS & LESSON ACCORDIONS LIST */}
            {isLoadingUnits ? (
              <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#0c1222] rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Loading structured curriculum lessons...</span>
              </div>
            ) : filteredUnits.length > 0 ? (
              <div className="space-y-3">
                {filteredUnits.map((unit: any, idx: number) => {
                  const isOpen = (expandedUnitAccordions[unit.id.toString()] ?? expandAllUnits) || !!selectedUnitId || !!lessonSearchQuery;
                  const lessons = unit.lesson_plan_lessons || [];
                  const hasLessons = lessons.length > 0;

                  return (
                    <div 
                      key={unit.id} 
                      className="rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-white dark:bg-[#0c1222] shadow-2xs transition-all hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      {/* Chapter Accordion Header */}
                      <button
                        type="button"
                        onClick={() => toggleUnitAccordion(unit.id)}
                        className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-900/50 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-left transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                              Unit / Chapter {idx + 1}
                            </span>
                            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                              {unit.title}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 ml-2">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            hasLessons
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-900/60'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}>
                            {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`} />
                        </div>
                      </button>

                      {/* Inside Chapter: Lessons & Topics */}
                      {isOpen && (
                        <div className="p-3 sm:p-4 space-y-3 bg-slate-50/30 dark:bg-slate-950/20 animate-in fade-in duration-150">
                          {hasLessons ? (
                            lessons.map((lesson: any) => {
                              const contents = lesson.lesson_plan_contents || [];
                              const isLessonExpanded = expandedLessonIds[lesson.id.toString()] !== undefined
                                ? expandedLessonIds[lesson.id.toString()]
                                : (lessons.length <= 3 || !!lessonSearchQuery);

                              return (
                                <div
                                  key={lesson.id}
                                  className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1222] overflow-hidden shadow-2xs transition-all"
                                >
                                  {/* Lesson Header Card */}
                                  <div
                                    onClick={() => toggleLessonExpanded(lesson.id)}
                                    className="p-3 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors select-none group/lesson bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/80"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover/lesson:bg-indigo-600 group-hover/lesson:text-white transition-colors border border-indigo-100 dark:border-indigo-900/60 shadow-2xs">
                                        <FileText className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover/lesson:text-indigo-600 dark:group-hover/lesson:text-indigo-400 truncate transition-colors">
                                          {lesson.title}
                                        </h4>
                                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
                                          {contents.length} {contents.length === 1 ? 'reading topic' : 'reading topics'} &bull; {isLessonExpanded ? 'Click to collapse' : 'Click to view topics'}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/60 hidden xs:inline-flex items-center gap-1">
                                        <span>{isLessonExpanded ? 'Collapse' : `View ${contents.length} Topics`}</span>
                                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isLessonExpanded ? 'rotate-180' : ''}`} />
                                      </span>

                                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 xs:hidden ${
                                        isLessonExpanded ? 'rotate-180' : ''
                                      }`} />
                                    </div>
                                  </div>

                                  {/* Topics List */}
                                  {isLessonExpanded && (
                                    <div className="p-2 sm:p-3 space-y-2 bg-white dark:bg-[#0c1222] animate-in fade-in duration-150">
                                      {contents.length > 0 ? (
                                        <>
                                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 pt-1 pb-0.5 flex items-center justify-between">
                                            <span>Select a topic to start studying:</span>
                                            <span>{contents.length} topics</span>
                                          </div>

                                          <div className="grid grid-cols-1 gap-1.5">
                                            {contents.map((content: any, cIdx: number) => (
                                              <Link
                                                key={content.id}
                                                href={`/curriculum/${selectedSubjectId}/${content.id}`}
                                                className="group/topic flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/50 border border-slate-200/70 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 shadow-2xs hover:shadow-xs transition-all"
                                              >
                                                <div className="flex items-center gap-3 min-w-0">
                                                  <span className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 group-hover/topic:bg-indigo-600 group-hover/topic:text-white group-hover/topic:border-indigo-600 transition-colors shadow-2xs">
                                                    {cIdx + 1}
                                                  </span>
                                                  <div className="min-w-0">
                                                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover/topic:text-indigo-600 dark:group-hover/topic:text-indigo-400 truncate block transition-colors">
                                                      {content.title}
                                                    </span>
                                                    {content.type && (
                                                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 capitalize block truncate">
                                                        Type: {content.type}
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                                  <span className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-extrabold text-xs group-hover/topic:bg-indigo-700 transition-colors flex items-center gap-1 shadow-2xs">
                                                    <span>Start</span>
                                                    <ArrowRight className="w-3.5 h-3.5 group-hover/topic:translate-x-0.5 transition-transform" />
                                                  </span>
                                                </div>
                                              </Link>
                                            ))}
                                          </div>
                                        </>
                                      ) : (
                                        <p className="text-xs text-slate-500 italic py-2 px-2">
                                          No reading topics uploaded yet for this lesson.
                                        </p>
                                      )}
                                    </div>
                                  )}

                                </div>
                              );
                            })
                          ) : (
                            <div className="p-4 text-center bg-white dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
                              <p className="text-xs text-slate-500">No structured lessons recorded under this chapter yet.</p>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-white dark:bg-[#0c1222] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No chapters or lessons match your search query &ldquo;{lessonSearchQuery}&rdquo;
                </p>
                <div className="flex items-center justify-center gap-3 mt-3">
                  <button
                    onClick={() => { setLessonSearchQuery(''); setSelectedUnitId(''); }}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Clear search filter
                  </button>
                  {emptyUnitsCount > 0 && !showEmptyUnits && (
                    <button
                      onClick={() => setShowEmptyUnits(true)}
                      className="text-xs font-bold text-amber-600 hover:underline"
                    >
                      Show empty chapters
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* ========================================================
          4. GLOBAL SEARCH COMMAND PALETTE OVERLAY (MODAL)
      ======================================================== */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-start justify-center pt-12 sm:pt-20 px-4 animate-in fade-in duration-200"
          onClick={() => setIsSearchOpen(false)}
        >
          <div 
            className="w-full max-w-2xl bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Header */}
            <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
              <Search className="w-5 h-5 text-indigo-500 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Search any subject, topic, chapter, or exam level..."
                className="w-full text-sm font-bold bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
              />
              {isSearchingServer && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />}
              {globalSearchQuery && (
                <button
                  onClick={() => setGlobalSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd 
                onClick={() => setIsSearchOpen(false)}
                className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded cursor-pointer"
              >
                ESC
              </kbd>
            </div>

            {/* Search Results Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* CATEGORY 1: TOPICS & CONTENTS (DIRECT LINKS) */}
              {serverSearchResults.contents.length > 0 && (
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Matching Topics & Reading Notes ({serverSearchResults.contents.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {serverSearchResults.contents.map((c: any) => {
                      const subject = initialSubjects.find(s => s.id.toString() === c.subject_id?.toString());
                      return (
                        <Link
                          key={c.id}
                          href={`/curriculum/${c.subject_id}/${c.id}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="group p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200/70 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 flex items-center justify-between transition-all"
                        >
                          <div className="min-w-0 flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-[11px] flex items-center justify-center shrink-0">
                              📄
                            </span>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate block">
                                {c.title}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                                {subject ? subject.title : 'Curriculum'} &bull; {c.unit_title || 'Chapter'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {c.type && (
                              <span className="text-[10px] font-semibold text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 capitalize">
                                {c.type}
                              </span>
                            )}
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                              <span>Open</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CATEGORY 2: CHAPTERS / UNITS */}
              {serverSearchResults.units.length > 0 && (
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1.5">
                    <Library className="w-3.5 h-3.5" />
                    <span>Matching Chapters ({serverSearchResults.units.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {serverSearchResults.units.map((u: any) => {
                      const subject = initialSubjects.find(s => s.id.toString() === u.subject_id?.toString());
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            if (subject) {
                              handleGlobalSelectSubject(subject, u.id);
                            }
                          }}
                          className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200/70 dark:border-slate-800 text-left transition-all"
                        >
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate block">
                            {u.title}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate block mt-0.5">
                            {subject ? subject.title : 'Chapter'} &rarr; Jump to Unit
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CATEGORY 3: SUBJECTS WITH DYNAMIC ICONS */}
              {filteredSearchSubjects.length > 0 && (
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Subjects ({filteredSearchSubjects.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredSearchSubjects.map(sub => {
                      const SubIcon = getSubjectIcon(sub.title);
                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleGlobalSelectSubject(sub)}
                          className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200/70 dark:border-slate-800 text-left transition-all flex items-center justify-between group"
                        >
                          <div className="min-w-0 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/60">
                              <SubIcon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate block">
                                {sub.title}
                              </span>
                              <span className="text-[10px] text-slate-500 truncate block">
                                {sub.groups?.title || 'General'} &bull; {sub.groups?.segments?.title || 'Curriculum'}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* QUICK SUGGESTIONS WHEN EMPTY */}
              {!globalSearchQuery && (
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                    Quick Suggestions
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Physics', icon: Atom },
                      { name: 'Chemistry', icon: FlaskConical },
                      { name: 'English 2nd Paper', icon: Languages },
                      { name: 'Higher Math', icon: Calculator },
                      { name: 'Business Studies', icon: TrendingUp },
                      { name: 'ICT', icon: Binary },
                      { name: 'HSC', icon: Award },
                      { name: 'SSC', icon: GraduationCap }
                    ].map(item => {
                      const IconComponent = item.icon;
                      return (
                        <button
                          key={item.name}
                          onClick={() => setGlobalSearchQuery(item.name)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition-colors flex items-center gap-1.5"
                        >
                          <IconComponent className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* NO RESULTS FOUND */}
              {globalSearchQuery && !isSearchingServer && serverSearchResults.contents.length === 0 && serverSearchResults.units.length === 0 && filteredSearchSubjects.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  <p className="text-sm font-semibold">No results found for &ldquo;{globalSearchQuery}&rdquo;</p>
                  <p className="text-xs mt-1">Try searching for subject names like &ldquo;Physics&rdquo; or topics like &ldquo;Sentence&rdquo;.</p>
                </div>
              )}

            </div>

            {/* Footer Hints */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Press <kbd className="font-bold">ESC</kbd> to close</span>
              <span>Click any subject or topic to jump directly</span>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          5. FOOTER
      ======================================================== */}
      <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0c1222] py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>NextPrepBD Curriculum Framework &bull; Standardized NCTB Syllabus &copy; {new Date().getFullYear()}</p>
      </footer>

    </div>
  );
}
