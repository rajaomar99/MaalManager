import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export function AlertBanner({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <div className="border-b bg-amber-50 dark:bg-amber-950/30">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 md:px-6">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="flex-1 text-xs font-medium text-amber-800 dark:text-amber-300">
          ⚠ {count} item{count !== 1 ? "s" : ""} need{count === 1 ? "s" : ""}{" "}
          restocking
        </p>
        <Link
          href="/alerts"
          className="text-xs font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200"
        >
          View alerts →
        </Link>
      </div>
    </div>
  );
}
