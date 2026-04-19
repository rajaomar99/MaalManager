import { Card, CardContent, CardHeader } from "@/components/ui/card";

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
  );
}

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <SkeletonPulse className="h-8 w-40" />
        <SkeletonPulse className="h-4 w-72" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-start justify-between gap-3 p-5">
              <div className="flex-1 space-y-2">
                <SkeletonPulse className="h-3 w-20" />
                <SkeletonPulse className="h-7 w-16" />
                <SkeletonPulse className="h-3 w-28" />
              </div>
              <SkeletonPulse className="h-10 w-10 rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cards Skeleton */}
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <SkeletonPulse className="h-5 w-36" />
              <SkeletonPulse className="h-3 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <SkeletonPulse className="h-4 w-4 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <SkeletonPulse className="h-4 w-32" />
                    <SkeletonPulse className="h-3 w-20" />
                  </div>
                  <SkeletonPulse className="h-5 w-12" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
