import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-shadow hover:shadow-md",
        className
      )}
    >
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-base font-medium text-muted-foreground">
            {title}
          </p>
          <p
            className={cn(
              "text-2xl font-bold tracking-tight md:text-3xl",
              trend === "down" && "text-destructive",
              trend === "up" && "text-emerald-600 dark:text-emerald-400"
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-base text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" aria-hidden />
        </div>
      </CardContent>
    </Card>
  );
}
