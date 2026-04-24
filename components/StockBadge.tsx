import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type StockStatus = "OK" | "LOW" | "OUT";

const config: Record<
  StockStatus,
  { label: string; className: string }
> = {
  OK: {
    label: "In Stock",
    className:
      "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  LOW: {
    label: "Low Stock",
    className:
      "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300",
  },
  OUT: {
    label: "Out of Stock",
    className:
      "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300",
  },
};

export function StockBadge({ status }: { status: StockStatus }) {
  const { label, className } = config[status];
  return (
    <Badge
      variant="secondary"
      className={cn(
        "pointer-events-none select-none text-[11px] font-semibold uppercase tracking-wide",
        className
      )}
    >
      {label}
    </Badge>
  );
}
