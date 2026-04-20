"use client";

import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Could not load inventory</h2>
        <p className="text-sm text-muted-foreground">
          There was a problem fetching your products. Please try again.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline" className="min-h-[44px]">
          Try again
        </Button>
        <Link href="/" className={cn(buttonVariants({ variant: "ghost" }), "min-h-[44px]")}>
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
