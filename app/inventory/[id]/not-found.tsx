import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PackageSearch, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ProductNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-5 py-10 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <PackageSearch className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Product not found</h2>
            <p className="text-base text-muted-foreground">
              This product does not exist or may have been deleted.
            </p>
          </div>
          <Link
            href="/inventory"
            className={cn(buttonVariants({ size: "lg" }), "min-w-[160px] gap-2")}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Inventory
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
