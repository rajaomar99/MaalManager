import type { Metadata } from "next";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Low Stock Alerts | Maal Manager",
};
import { Card, CardContent } from "@/components/ui/card";
import { StockBadge } from "@/components/StockBadge";
import { RestockDialog } from "@/components/RestockDialog";
import { ShareButtons } from "@/components/PrintButton";
import {
  AlertTriangle,
  Package,
  Truck,
  ArrowDown,
} from "lucide-react";
import { getLowStockProducts } from "@/actions/products.action";

export default async function AlertsPage() {
  await connection();
  const lowStockProducts = await getLowStockProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            <h2 className="text-2xl font-semibold tracking-tight">
              Low Stock Alerts
            </h2>
          </div>
          <p className="text-base text-muted-foreground">
            {lowStockProducts.length === 0
              ? "All items are well-stocked. 🎉"
              : `${lowStockProducts.length} item${lowStockProducts.length !== 1 ? "s" : ""} need restocking — sorted by most critical first.`}
          </p>
        </div>
        {lowStockProducts.length > 0 && <ShareButtons products={lowStockProducts} />}
      </div>

      {lowStockProducts.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Package className="h-12 w-12 text-emerald-500/50" />
          <div>
            <p className="text-lg font-semibold text-muted-foreground">
              All stocked up!
            </p>
            <p className="text-sm text-muted-foreground/70">
              No products are at or below their reorder threshold.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {lowStockProducts.map((p) => (
            <Card
              key={p.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardContent className="p-4">
                {/* Top row: icon + name/badge + restock button (desktop only) */}
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
                    {p.categoryIcon}
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    {/* Name + badge + desktop restock button in same row */}
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-base font-semibold">
                          {p.name}
                        </span>
                        <StockBadge status={p.stockStatus} />
                      </div>
                      <div className="hidden sm:block">
                        <RestockDialog
                          productId={p.id}
                          productName={p.name}
                          reorderQty={p.reorderQty}
                          unit={p.unit}
                        />
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                      <div>
                        <span className="text-muted-foreground">Stock: </span>
                        <span className="font-semibold text-destructive">
                          {p.currentStock}
                        </span>
                        <span className="text-muted-foreground">
                          /{p.minStock} {p.unit}s
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowDown className="h-3 w-3 text-destructive" />
                        <span className="font-semibold text-destructive">
                          {p.unitsShort} short
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reorder: </span>
                        <span className="font-medium">
                          {p.reorderQty} {p.unit}s
                        </span>
                      </div>
                    </div>

                    {p.supplierName && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Truck className="h-3.5 w-3.5 shrink-0" />
                        <span>{p.supplierName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile-only restock button: full width below */}
                <div className="mt-3 sm:hidden [&>*]:w-full">
                  <RestockDialog
                    productId={p.id}
                    productName={p.name}
                    reorderQty={p.reorderQty}
                    unit={p.unit}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
