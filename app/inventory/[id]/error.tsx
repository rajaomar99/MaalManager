"use client";

import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, ChevronLeft } from "lucide-react";
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
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md border-destructive/20">
        <CardContent className="flex flex-col items-center gap-5 py-10 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <Package className="h-10 w-10 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Product not found</h2>
            <p className="text-base text-muted-foreground">
              This product could not be loaded. It may have been removed or there was a connection issue.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={reset} size="lg" className="min-w-[140px]">
              Try again
            </Button>
            <Link
              href="/inventory"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "min-w-[140px] gap-2")}
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Inventory
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
