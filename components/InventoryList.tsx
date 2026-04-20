"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StockBadge } from "@/components/StockBadge";
import { QuickStockUpdate } from "@/components/QuickStockUpdate";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Search, Plus, Package, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn, productSlug } from "@/lib/utils";
import { formatPKR } from "@/lib/format";
import type { ProductWithStatus, Category } from "@/lib/types";

type StatusFilter = "ALL" | "OK" | "LOW" | "OUT";

interface InventoryListProps {
  initialProducts: ProductWithStatus[];
  categories: Category[];
}

export function InventoryList({
  initialProducts,
  categories,
}: InventoryListProps) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const handleStockUpdate = useCallback(
    (productId: number, newStock: number, newStatus: string) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                currentStock: newStock,
                stockStatus: newStatus as "OK" | "LOW" | "OUT",
              }
            : p
        )
      );
    },
    []
  );

  // Apply filters
  const filtered = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "ALL" || p.categoryName === categoryFilter;
    const matchesStatus =
      statusFilter === "ALL" || p.stockStatus === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Count by status for filter buttons
  const counts = {
    ALL: products.length,
    OK: products.filter((p) => p.stockStatus === "OK").length,
    LOW: products.filter((p) => p.stockStatus === "LOW").length,
    OUT: products.filter((p) => p.stockStatus === "OUT").length,
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="product-search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "ALL")}>
          <SelectTrigger id="category-filter" className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.name}>
                {c.icon} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Link
          href="/inventory/new"
          className={cn(buttonVariants(), "hidden shrink-0 gap-2 md:flex")}
          id="add-product-btn"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["ALL", "OK", "LOW", "OUT"] as StatusFilter[]).map((s) => (
          <Button
            id={`filter-${s.toLowerCase()}`}
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            className="shrink-0 text-sm"
            onClick={() => setStatusFilter(s)}
          >
            {s === "ALL"
              ? "All"
              : s === "OK"
                ? "In Stock"
                : s === "LOW"
                  ? "Low Stock"
                  : "Out of Stock"}{" "}
            <span className="ml-1 rounded-full bg-background/20 px-1.5 py-0.5 text-xs font-bold">
              {counts[s]}
            </span>
          </Button>
        ))}
      </div>

      {/* Product List */}
      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <Package className="h-10 w-10 text-muted-foreground/50" />
          <div>
            <p className="font-medium text-muted-foreground">
              No products found
            </p>
            <p className="text-xs text-muted-foreground/70">
              {search || categoryFilter !== "ALL" || statusFilter !== "ALL"
                ? "Try adjusting your filters"
                : "Add your first product to get started"}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((product) => (
            <Card
              key={product.id}
              className="transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-3">
                {/* Top row on mobile: icon + info */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {/* Category Icon */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
                    {product.categoryIcon}
                  </div>

                  {/* Product Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-base font-semibold leading-snug">
                        {product.name}
                      </span>
                      <StockBadge status={product.stockStatus} />
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                      <span>{product.categoryName}</span>
                      <span>
                        Min: {product.minStock} {product.unit}s
                      </span>
                      <span className="font-medium text-foreground/70">{formatPKR(product.sellingPrice)}</span>
                      {product.supplierName && (
                        <span className="hidden sm:inline">
                          {product.supplierName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom row on mobile: stock controls + View Product button */}
                <div className="flex items-center justify-between gap-2 sm:justify-normal">
                  <Link
                    href={`/inventory/${productSlug(product.id, product.name)}`}
                    className={cn(
                      buttonVariants({ size: "sm" }),
                      "shrink-0 gap-1.5 sm:hidden py-4"
                    )}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View Product
                  </Link>

                  <div className="flex items-center gap-2">
                    <QuickStockUpdate
                      productId={product.id}
                      currentStock={product.currentStock}
                      unit={product.unit}
                      onUpdate={(newStock, newStatus) =>
                        handleStockUpdate(product.id, newStock, newStatus)
                      }
                    />

                    {/* Desktop: View Product button */}
                    <Link
                      href={`/inventory/${productSlug(product.id, product.name)}`}
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        "hidden shrink-0 gap-1.5 sm:flex py-5"
                      )}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Product
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Mobile FAB */}
      <Link
        href="/inventory/new"
        className={cn(
          buttonVariants({ size: "lg" }),
          "fixed bottom-20 right-4 z-20 flex h-12 items-center gap-2 rounded-full px-5 shadow-lg md:hidden"
        )}
        id="add-product-fab"
        aria-label="Add product"
      >
        <Plus className="h-5 w-5" />
        <span className="text-sm font-semibold">Add Product</span>
      </Link>
    </div>
  );
}
