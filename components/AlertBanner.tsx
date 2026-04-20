import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export function AlertBanner({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <div className="border-b bg-amber-50 dark:bg-amber-950/30">
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
      </div>
    </div>
  );
}
