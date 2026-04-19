"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { createProduct, updateProduct } from "@/actions/products";
import type { Category } from "@/lib/types";

const UNITS = ["packet", "bottle", "piece", "bag", "pack", "jar", "kg", "litre", "dozen"];

interface ProductFormProps {
  categories: Category[];
  product?: {
    id: number;
    name: string;
    categoryId: number;
    unit: string;
    currentStock: number;
    minStock: number;
    reorderQty: number;
    purchasePrice: number;
    sellingPrice: number;
    supplierName: string | null;
  };
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(
    product?.categoryId?.toString() ?? ""
  );
  const [unit, setUnit] = useState(product?.unit ?? "packet");
  const [currentStock, setCurrentStock] = useState(
    product?.currentStock?.toString() ?? "0"
  );
  const [minStock, setMinStock] = useState(
    product?.minStock?.toString() ?? "5"
  );
  const [reorderQty, setReorderQty] = useState(
    product?.reorderQty?.toString() ?? "12"
  );
  const [purchasePrice, setPurchasePrice] = useState(
    product?.purchasePrice?.toString() ?? ""
  );
  const [sellingPrice, setSellingPrice] = useState(
    product?.sellingPrice?.toString() ?? ""
  );
  const [supplierName, setSupplierName] = useState(
    product?.supplierName ?? ""
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const input = {
      name: name.trim(),
      categoryId: Number(categoryId),
      unit,
      currentStock: Number(currentStock),
      minStock: Number(minStock),
      reorderQty: Number(reorderQty),
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      supplierName: supplierName.trim() || undefined,
    };

    // Client-side validation
    if (!input.name) {
      toast.error("Product name is required");
      return;
    }
    if (!input.categoryId || Number.isNaN(input.categoryId)) {
      toast.error("Please select a category");
      return;
    }
    if (Number.isNaN(input.purchasePrice) || input.purchasePrice <= 0) {
      toast.error("Purchase price must be greater than 0");
      return;
    }
    if (Number.isNaN(input.sellingPrice) || input.sellingPrice <= 0) {
      toast.error("Selling price must be greater than 0");
      return;
    }

    startTransition(async () => {
      const result = isEdit
        ? await updateProduct({ ...input, id: product!.id })
        : await createProduct(input);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(isEdit ? "Product updated!" : "Product added!");
      router.push(isEdit ? `/inventory/${result.id}` : "/inventory");
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Product" : "New Product"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="product-name">Product Name *</Label>
            <Input
              id="product-name"
              placeholder="e.g. Tapal Danedar 200g"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Category + Unit */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category-select">Category *</Label>
              <Select
                value={categoryId}
                onValueChange={(v) => setCategoryId(v ?? "")}
              >
                <SelectTrigger id="category-select">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.icon} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit-select">Unit *</Label>
              <Select value={unit} onValueChange={(v) => setUnit(v ?? "packet")}>
                <SelectTrigger id="unit-select">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stock Fields */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="current-stock">
                {isEdit ? "Current Stock" : "Opening Stock"}
              </Label>
              <Input
                id="current-stock"
                type="number"
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min-stock">Min Stock (Alert Threshold) *</Label>
              <Input
                id="min-stock"
                type="number"
                min="1"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorder-qty">Reorder Quantity</Label>
              <Input
                id="reorder-qty"
                type="number"
                min="1"
                value={reorderQty}
                onChange={(e) => setReorderQty(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Prices */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="purchase-price">Purchase Price (PKR) *</Label>
              <Input
                id="purchase-price"
                type="number"
                min="1"
                step="0.01"
                placeholder="e.g. 380"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="selling-price">Selling Price (PKR) *</Label>
              <Input
                id="selling-price"
                type="number"
                min="1"
                step="0.01"
                placeholder="e.g. 420"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Supplier */}
          <div className="space-y-2">
            <Label htmlFor="supplier-name">Supplier Name (optional)</Label>
            <Input
              id="supplier-name"
              placeholder="e.g. Tapal Distributor — Anarkali"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending} className="min-w-32">
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isEdit ? "Save Changes" : "Add Product"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
