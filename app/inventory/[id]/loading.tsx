import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProductDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-md bg-muted" />
        <div className="space-y-2">
          <div className="h-7 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
        </div>
      </div>

      {/* Info cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
              <div className="h-11 w-32 animate-pulse rounded-md bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Movement history skeleton */}
      <Card>
        <CardHeader>
          <div className="h-5 w-48 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="ml-auto h-4 w-10 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
