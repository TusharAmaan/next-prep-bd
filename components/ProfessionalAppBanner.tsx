"use client";

import { useState } from "react";
import { Apple, Bell, BookOpen, Download, PlayCircle, Smartphone, X } from "lucide-react";

export default function ProfessionalAppBanner() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-8 p-5 sm:p-6 md:p-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Smartphone className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              NextPrepBD mobile app
            </div>

            <div className="space-y-3">
              <h2 className="max-w-3xl text-2xl font-semibold leading-tight tracking-tight text-slate-950 dark:text-white sm:text-3xl md:text-4xl">
                Study from anywhere, even when you are offline.
              </h2>

              <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-350 md:text-lg">
                Keep lessons, practice updates, and exam reminders close at hand with the NextPrepBD app.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-350 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Offline access
              </div>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Timely reminders
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Practice tracking
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <button
                onClick={() => setShowPopup(true)}
                className="flex min-h-12 items-center justify-center gap-3 rounded-md border border-slate-300 bg-white px-5 py-3 text-left font-medium text-slate-950 transition-colors hover:bg-slate-50 active:scale-[0.99] dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800"
              >
                <Apple className="h-5 w-5" fill="currentColor" />
                <span>
                  <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">
                    Download on the
                  </span>
                  <span className="block text-sm">App Store</span>
                </span>
              </button>

              <button
                onClick={() => setShowPopup(true)}
                className="flex min-h-12 items-center justify-center gap-3 rounded-md bg-slate-950 px-5 py-3 text-left font-medium text-white transition-colors hover:bg-slate-800 active:scale-[0.99] dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                <PlayCircle className="h-5 w-5" fill="currentColor" />
                <span>
                  <span className="block text-xs font-normal text-white/70 dark:text-slate-500">
                    Get it on
                  </span>
                  <span className="block text-sm">Google Play</span>
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-600 text-sm font-semibold text-white">
                  N
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    NextPrepBD
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    App access is coming soon
                  </p>
                </div>
              </div>

              <div className="rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="mb-3 text-sm font-medium text-slate-900 dark:text-white">
                  What you will get
                </p>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-350">
                  <p>Saved resources for focused study sessions.</p>
                  <p>Notifications for important academic updates.</p>
                  <p>A cleaner way to follow your exam preparation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-left shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-7">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute right-4 top-4 rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
              <Smartphone className="h-6 w-6" />
            </div>

            <h3 className="mb-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
              The app is not available yet
            </h3>
            <p className="mb-6 text-base leading-7 text-slate-600 dark:text-slate-350">
              We are finishing the mobile app and will share the download links when it is ready.
            </p>

            <button
              onClick={() => setShowPopup(false)}
              className="w-full rounded-md bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
