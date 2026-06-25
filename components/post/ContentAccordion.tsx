"use client";

import { useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface ContentAccordionProps {
  id: string;
  icon: ReactNode;
  iconVariant?: "green" | "purple" | "amber" | "blue";
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: "green" | "purple" | "amber" | "blue";
  defaultOpen?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

const iconBgVariants: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  purple: "bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
};

const badgeVariants: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  purple: "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
};

export default function ContentAccordion({
  id,
  icon,
  iconVariant = "green",
  title,
  subtitle,
  badge,
  badgeVariant: bv = "green",
  defaultOpen = false,
  children,
  footer,
}: ContentAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      id={id}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md"
    >
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 px-4 md:px-5 py-3.5 md:py-4 text-left transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30 ${
          isOpen ? "border-b border-slate-100 dark:border-slate-800/60" : ""
        }`}
      >
        {/* Icon */}
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgVariants[iconVariant]}`}
        >
          {icon}
        </div>

        {/* Title group */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            {title}
          </div>
          {subtitle && (
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
              {subtitle}
            </div>
          )}
        </div>

        {/* Badge */}
        {badge && (
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${badgeVariants[bv]}`}
          >
            {badge}
          </span>
        )}

        {/* Chevron */}
        <ChevronDown
          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Body */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[9999px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 md:px-5 py-4 md:py-5">{children}</div>
      </div>

      {/* Footer */}
      {footer && isOpen && (
        <div className="px-4 md:px-5 py-3 bg-slate-50/70 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800/60">
          {footer}
        </div>
      )}
    </div>
  );
}
