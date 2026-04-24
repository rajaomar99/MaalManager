import type { Metadata } from "next";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Product Detail | Maal Manager",
};
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockBadge } from "@/components/StockBadge";
import { QuickStockUpdate } from "@/components/QuickStockUpdate";
import { QuickSaleDialog } from "@/components/QuickSaleDialog";
import { DeleteProductDialog } from "@/components/DeleteProductDialog";
import { ProductForm } from "@/components/ProductForm";
import { formatPKR } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCategories } from "@/actions/category.action";
import { getProduct, getSupplierNames } from "@/actions/products.action";
import { parseProductId, productSlug } from "@/lib/utils";

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  await connection();

  const { id } = await params;
  const { edit } = await searchParams;
  const productId = parseProductId(id);
  if (Number.isNaN(productId) || productId <= 0) notFound();

  const product = await getProduct(productId);
  if (!product) notFound();

  const isEditing = edit === "true";

  let stockStatus: "OK" | "LOW" | "OUT";
  if (product.currentStock === 0) stockStatus = "OUT";
  else if (product.currentStock <= product.minStock) stockStatus = "LOW";
  else stockStatus = "OK";

  // Edit mode
  if (isEditing) {
    const [categories, suppliers] = await Promise.all([getCategories(), getSupplierNames()]);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/inventory/${productSlug(productId, product.name)}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Edit Product
            </h2>
            <p className="text-base text-muted-foreground">{product.name}</p>
          </div>
        </div>
        <ProductForm
          categories={categories}
          suppliers={suppliers}
          product={{
            id: product.id,
            name: product.name,
            categoryId: product.categoryId,
            unit: product.unit,
            currentStock: product.currentStock,
            minStock: product.minStock,
            reorderQty: product.reorderQty,
            purchasePrice: Number(product.purchasePrice),
            sellingPrice: Number(product.sellingPrice),
            supplierName: product.supplierName,
            supplierPhone: product.supplierPhone,
          }}
        />
      </div>
    );
  }

  // Detail view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-start gap-3">
          <Link
            href="/inventory"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xl" aria-hidden>
                {product.category.icon}
              </span>
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {product.name}
              </h2>
              <StockBadge status={stockStatus} />
            </div>
            <p className="mt-0.5 text-[15px] text-muted-foreground">
              {product.category.name}
              {product.supplierName && (
                <>
                  {" "}
                  · <Truck className="mr-0.5 inline h-3 w-3" />
                  {product.supplierName}
                </>
              )}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link
              href={`/inventory/${productSlug(productId, product.name)}?edit=true`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "min-h-[44px]")}
              id="edit-product-btn"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
            <DeleteProductDialog
              productId={productId}
              productName={product.name}
            />
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Current Stock
            </p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-2xl font-bold">{product.currentStock}</p>
              <span className="text-sm text-muted-foreground">
                {product.unit}s
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <QuickStockUpdate
                productId={product.id}
                currentStock={product.currentStock}
                unit={product.unit}
              />
            </div>
            <div className="mt-2">
              <QuickSaleDialog
                productId={product.id}
                productName={product.name}
                currentStock={product.currentStock}
                unit={product.unit}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Min Stock / Reorder
            </p>
            <p className="mt-1 text-2xl font-bold">{product.minStock}</p>
            <p className="text-sm text-muted-foreground">
              Reorder qty: {product.reorderQty} {product.unit}s
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Purchase Price
            </p>
            <p className="mt-1 text-2xl font-bold">
              {formatPKR(Number(product.purchasePrice))}
            </p>
            <p className="text-sm text-muted-foreground">per {product.unit}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Selling Price
            </p>
            <p className="mt-1 text-2xl font-bold">
              {formatPKR(Number(product.sellingPrice))}
            </p>
            <p className="text-sm text-muted-foreground">
              Margin:{" "}
              {formatPKR(
                Number(product.sellingPrice) - Number(product.purchasePrice)
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Movement History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stock Movement History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {product.movements.length === 0 ? (
            <div className="px-6 pb-6 text-center text-sm text-muted-foreground">
              No stock movements recorded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4 sm:pl-6">Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.movements.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="pl-4 sm:pl-6 text-[13px] sm:text-sm text-muted-foreground">
                        {new Date(m.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {" · "}
                        {new Date(m.createdAt).toLocaleTimeString("en-PK", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            m.type === "RESTOCK" &&
                              "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
                            m.type === "SALE" &&
                              "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
                            m.type === "ADJUSTMENT" &&
                              "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                          )}
                        >
                          {m.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            "font-semibold tabular-nums text-base",
                            m.quantity > 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          )}
                        >
                          {m.quantity > 0 ? "+" : ""}
                          {m.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-[13px] sm:text-sm text-muted-foreground">
                        {m.note || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
