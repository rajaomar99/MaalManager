import { Card } from "@/components/ui/card";

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
  );
}

export default function AlertsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <SkeletonPulse className="h-6 w-6 rounded" />
          <SkeletonPulse className="h-8 w-48" />
        </div>
        <SkeletonPulse className="h-4 w-72" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <div className="flex items-start gap-3 p-4">
              <SkeletonPulse className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <SkeletonPulse className="h-4 w-40" />
                  <SkeletonPulse className="h-5 w-16 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <SkeletonPulse className="h-3 w-24" />
                  <SkeletonPulse className="h-3 w-16" />
                  <SkeletonPulse className="h-3 w-20" />
                  <SkeletonPulse className="h-3 w-28" />
                </div>
              </div>
              <SkeletonPulse className="h-8 w-28 rounded-md" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
