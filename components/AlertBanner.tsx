"use client";

import Link from "next/link";
import { AlertTriangle, X } from "lucide-react";
import { useRef, useState } from "react";

export function AlertBanner({ count }: { count: number }) {
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  if (count === 0 || !visible) return null;

  function dismiss() {
    if (ref.current) {
      ref.current.style.animation = "alertSlideOut 0.35s ease forwards";
      setTimeout(() => setVisible(false), 350);
    }
  }

  return (
    <div
      ref={ref}
      className="border-b bg-amber-50 dark:bg-amber-950/30"
      style={{ animation: "alertSlideIn 0.35s ease" }}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
        <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="flex-1 text-base font-bold text-amber-800 dark:text-amber-300">
          {count} item{count !== 1 ? "s" : ""} need{count === 1 ? "s" : ""}{" "}
          restocking
        </p>
        <Link
          href="/alerts"
          className="text-base font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200"
        >
          View alerts →
        </Link>
        <button
          onClick={dismiss}
          aria-label="Dismiss alert"
          className="ml-1 rounded p-1 text-amber-600 hover:bg-amber-100 hover:text-amber-900 dark:text-amber-400 dark:hover:bg-amber-900/40 dark:hover:text-amber-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <style>{`
        @keyframes alertSlideIn {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 80px; }
        }
        @keyframes alertSlideOut {
          from { opacity: 1; max-height: 80px; }
          to { opacity: 0; max-height: 0; }
        }
      `}</style>
    </div>
  );
}
