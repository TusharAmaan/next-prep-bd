"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Home,
  Menu,
  X,
  ChevronDown,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Briefcase,
  FileText,
  Sparkles,
  UserPlus,
  Info,
  Gift,
  HelpCircle,
  FolderClosed,
  ChevronRight
} from "lucide-react";

interface LeftSidebarProps {
  activeSegment?: string;
  activeGroup?: string;
  activeSubject?: string;
}

export default function LeftSidebar({
  activeSegment,
  activeGroup,
  activeSubject
}: LeftSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Toggle sidebar on mobile
  const toggleSidebar = () => setIsOpen(!isOpen);

  // Toggle accordion group section
  const toggleSection = (slug: string) => {
    setOpenSections(prev => ({
      ...prev,
      [slug]: !prev[slug]
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: segs } = await supabase
          .from("segments")
          .select("id, title, slug")
          .order("id");

        const { data: grps } = await supabase
          .from("groups")
          .select("id, segment_id, title, slug")
          .order("id");

        if (segs) {
          setSegments(segs);
          // Set active segment section open by default
          const initialOpen: Record<string, boolean> = {};
          segs.forEach(s => {
            initialOpen[s.slug] = s.slug === activeSegment;
          });
          setOpenSections(initialOpen);
        }
        if (grps) setGroups(grps);
      } catch (err) {
        console.error("Error fetching menu items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeSegment]);

  // Close sidebar on path change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* MOBILE FAB BUTTON */}
      <button
        onClick={toggleSidebar}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 active:scale-95 transition-all lg:hidden animate-bounce"
        aria-label="Toggle Navigation Menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* OVERLAY FOR MOBILE */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
        />
      )}

      {/* SIDEBAR NAVIGATION CONTROLLER */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-[280px] transform bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-auto lg:z-0 flex flex-col pt-24 pb-10 overflow-y-auto scrollbar-thin ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Navigation Section */}
        <div className="px-4 mb-6">
          <div className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-2">
            Navigation
          </div>
          <nav className="space-y-1">
            <Link
              href="/"
              className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                pathname === "/"
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              href="/forum"
              className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                pathname?.startsWith("/forum")
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Forum</span>
            </Link>
            <Link
              href="/ebooks"
              className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                pathname?.startsWith("/ebooks")
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>eBooks</span>
            </Link>
            <Link
              href="/courses"
              className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                pathname?.startsWith("/courses")
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Courses</span>
            </Link>
          </nav>
        </div>

        {/* Separator */}
        <div className="h-px bg-slate-200 dark:bg-slate-800 mx-4 mb-6" />

        {/* Exam Resources Accordion Section */}
        <div className="px-4 mb-6 flex-grow">
          <div className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-2">
            Exam Resources
          </div>

          {loading ? (
            <div className="space-y-3 px-2 py-4">
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-5/6"></div>
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-2/3"></div>
            </div>
          ) : (
            <div className="space-y-1">
              {segments.map(seg => {
                const isOpen = openSections[seg.slug];
                const segmentGroups = groups.filter(g => g.segment_id === seg.id);
                const isCurrentSegment = activeSegment === seg.slug;

                return (
                  <div key={seg.id} className="space-y-0.5">
                    {/* Header */}
                    <button
                      onClick={() => toggleSection(seg.slug)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                        isCurrentSegment
                          ? "text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/40 dark:bg-indigo-950/20"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <FolderClosed className="h-4 w-4 opacity-75" />
                        <span>{seg.title}</span>
                      </span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Accordion Body */}
                    {isOpen && (
                      <div className="pl-4 py-1 space-y-0.5 transition-all duration-300">
                        {/* Overview Link */}
                        <Link
                          href={`/resources/${seg.slug}`}
                          className={`flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${
                            isCurrentSegment && !activeGroup
                              ? "text-indigo-600 dark:text-indigo-400 font-bold"
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          <ChevronRight className="h-2.5 w-2.5 opacity-55" />
                          <span>Overview</span>
                        </Link>

                        {/* Groups */}
                        {segmentGroups.map(grp => {
                          const isCurrentGroup = isCurrentSegment && activeGroup === grp.slug;
                          return (
                            <Link
                              key={grp.id}
                              href={`/resources/${seg.slug}/${grp.slug}`}
                              className={`flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${
                                isCurrentGroup
                                  ? "text-indigo-600 dark:text-indigo-400 font-bold"
                                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              }`}
                            >
                              <ChevronRight className="h-2.5 w-2.5 opacity-55" />
                              <span>{grp.title}</span>
                            </Link>
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

        {/* Separator */}
        <div className="h-px bg-slate-200 dark:bg-slate-800 mx-4 mb-6" />

        {/* Discover Section */}
        <div className="px-4">
          <div className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-2">
            Discover
          </div>
          <nav className="space-y-1">
            <Link
              href="/blog"
              className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                pathname?.startsWith("/blog")
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Blog</span>
            </Link>
            <Link
              href="/find-tutor"
              className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                pathname?.startsWith("/find-tutor")
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-655 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>Find a Tutor</span>
            </Link>
            <Link
              href="/about"
              className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                pathname?.startsWith("/about")
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-655 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Info className="h-4 w-4" />
              <span>About Us</span>
            </Link>
            <Link
              href="/donate"
              className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                pathname?.startsWith("/donate")
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-655 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Gift className="h-4 w-4" />
              <span>Donate</span>
            </Link>
          </nav>
        </div>
      </aside>
    </>
  );
}
