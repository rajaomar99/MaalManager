import { Card } from "@/components/ui/card";

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
  );
}

export default function InventoryLoading() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <SkeletonPulse className="h-8 w-32" />
        <SkeletonPulse className="h-4 w-64" />
      </div>

      {/* Search + Filter Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SkeletonPulse className="h-10 flex-1" />
        <SkeletonPulse className="h-10 w-full sm:w-48" />
      </div>

      {/* Status Tabs Skeleton */}
      <div className="flex gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonPulse key={i} className="h-8 w-24" />
        ))}
      </div>

      {/* Product Cards Skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <div className="flex items-center gap-3 p-4">
              <SkeletonPulse className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <SkeletonPulse className="h-4 w-40" />
                  <SkeletonPulse className="h-5 w-16 rounded-full" />
                </div>
                <SkeletonPulse className="h-3 w-56" />
              </div>
              <div className="flex items-center gap-1.5">
                <SkeletonPulse className="h-8 w-8 rounded-md" />
                <SkeletonPulse className="h-4 w-10" />
                <SkeletonPulse className="h-8 w-8 rounded-md" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
