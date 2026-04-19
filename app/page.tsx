import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatPKR } from "@/lib/format";
import { StatsCard } from "@/components/StatsCard";
import { StockBadge } from "@/components/StockBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  AlertTriangle,
  PackageX,
  IndianRupee,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";

async function getStats() {
  const products = await prisma.product.findMany({
    select: {
      currentStock: true,
      minStock: true,
      sellingPrice: true,
    },
  });

  return {
    totalProducts: products.length,
    lowStockCount: products.filter(
      (p) => p.currentStock > 0 && p.currentStock <= p.minStock
    ).length,
    outOfStockCount: products.filter((p) => p.currentStock === 0).length,
    totalInventoryValue: products.reduce(
      (acc, p) => acc + p.currentStock * Number(p.sellingPrice),
      0
    ),
  };
}

async function getLowStockProducts() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { currentStock: "asc" },
  });

  return products
    .filter((p) => p.currentStock <= p.minStock)
    .sort((a, b) => (a.currentStock - a.minStock) - (b.currentStock - b.minStock))
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      name: p.name,
      currentStock: p.currentStock,
      minStock: p.minStock,
      unit: p.unit,
      reorderQty: p.reorderQty,
      categoryIcon: p.category.icon,
      categoryName: p.category.name,
      stockStatus: p.currentStock === 0 ? ("OUT" as const) : ("LOW" as const),
      unitsShort: p.minStock - p.currentStock,
    }));
}

async function getRecentMovements() {
  return prisma.stockMovement.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { id: true, name: true } },
    },
  });
}

function MovementTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "RESTOCK":
      return <ArrowUpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    case "SALE":
      return <ArrowDownCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
    case "ADJUSTMENT":
      return <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    default:
      return null;
  }
}

function formatRelativeTime(dateStr: string | Date): string {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
  });
}

export default async function DashboardPage() {
  await connection();

  const [stats, lowStockProducts, recentMovements] = await Promise.all([
    getStats(),
    getLowStockProducts(),
    getRecentMovements(),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Welcome back, Ahmed Bhai. Here&apos;s your store overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatsCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          subtitle="across all categories"
        />
        <StatsCard
          title="Low Stock"
          value={stats.lowStockCount}
          icon={AlertTriangle}
          trend={stats.lowStockCount > 0 ? "down" : "neutral"}
          subtitle="items need restocking"
        />
        <StatsCard
          title="Out of Stock"
          value={stats.outOfStockCount}
          icon={PackageX}
          trend={stats.outOfStockCount > 0 ? "down" : "neutral"}
          subtitle="items unavailable"
        />
        <StatsCard
          title="Inventory Value"
          value={formatPKR(stats.totalInventoryValue)}
          icon={IndianRupee}
          subtitle="total at selling price"
        />
      </div>

      {/* Low Stock + Recent Movements */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Low Stock Items */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  Low Stock Items
                </CardTitle>
                <CardDescription>
                  Top {lowStockProducts.length} items needing reorder
                </CardDescription>
              </div>
              <Link
                href="/alerts"
                className="text-xs font-medium text-primary underline-offset-4 hover:underline"
              >
                View all →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-0 p-0">
            {lowStockProducts.length === 0 ? (
              <div className="px-6 pb-6 text-center text-sm text-muted-foreground">
                🎉 All items are stocked!
              </div>
            ) : (
              <ul className="divide-y">
                {lowStockProducts.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 px-6 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base" aria-hidden>
                          {p.categoryIcon}
                        </span>
                        <span className="truncate text-sm font-medium">
                          {p.name}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {p.currentStock}/{p.minStock} {p.unit}s · need{" "}
                        {p.reorderQty}
                      </p>
                    </div>
                    <StockBadge status={p.stockStatus} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Movements */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <RefreshCw className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Last {recentMovements.length} stock movements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-0 p-0">
            {recentMovements.length === 0 ? (
              <div className="px-6 pb-6 text-center text-sm text-muted-foreground">
                No stock movements yet.
              </div>
            ) : (
              <ul className="divide-y">
                {recentMovements.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/50"
                  >
                    <MovementTypeIcon type={m.type} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {m.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m.note || m.type.toLowerCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-sm font-semibold tabular-nums ${
                          m.quantity > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {m.quantity > 0 ? "+" : ""}
                        {m.quantity}
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        {formatRelativeTime(m.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
