import type { Metadata } from "next";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Low Stock Alerts | Maal Manager",
};
import { Card, CardContent } from "@/components/ui/card";
import { StockBadge } from "@/components/StockBadge";
import { RestockDialog } from "@/components/RestockDialog";
import { PrintButton } from "@/components/PrintButton";
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
          <p className="text-sm text-muted-foreground">
            {lowStockProducts.length === 0
              ? "All items are well-stocked. 🎉"
              : `${lowStockProducts.length} item${lowStockProducts.length !== 1 ? "s" : ""} need restocking — sorted by most critical first.`}
          </p>
        </div>
        {lowStockProducts.length > 0 && <PrintButton />}
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
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-xl">
                    {p.categoryIcon}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-sm font-semibold">
                        {p.name}
                      </span>
                      <StockBadge status={p.stockStatus} />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
                      <div>
                        <span className="text-muted-foreground">Stock:</span>{" "}
                        <span className="font-semibold text-destructive">
                          {p.currentStock}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          / {p.minStock} {p.unit}s
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowDown className="h-3 w-3 text-destructive" />
                        <span className="font-semibold text-destructive">
                          {p.unitsShort} short
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Reorder:
                        </span>{" "}
                        <span className="font-medium">
                          {p.reorderQty} {p.unit}s
                        </span>
                      </div>
                      {p.supplierName && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Truck className="h-3 w-3" />
                          <span className="truncate">{p.supplierName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="shrink-0">
                    <RestockDialog
                      productId={p.id}
                      productName={p.name}
                      reorderQty={p.reorderQty}
                      unit={p.unit}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
