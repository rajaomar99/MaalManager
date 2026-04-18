import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Package, Bell } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Welcome back, Ahmed Bhai. Inventory overview coming soon.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Day 1 setup complete</CardTitle>
          <CardDescription>
            Next.js 16, Prisma, shadcn/ui, and the navigation shell are ready.
            Connect Neon and run the seed to bring this dashboard to life.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Link href="/inventory" className={cn(buttonVariants({ size: "lg" }))}>
            <Package className="mr-2 h-4 w-4" />
            Go to Inventory
          </Link>
          <Link
            href="/alerts"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            <Bell className="mr-2 h-4 w-4" />
            Low Stock Alerts
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
