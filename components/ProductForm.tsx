"use client";

import { useState, useRef, useTransition } from "react";
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
import { createProduct, updateProduct } from "@/actions/products.action";
import { productSlug } from "@/lib/utils";
import type { Category } from "@/lib/types";

const UNITS = ["packet", "bottle", "piece", "bag", "pack", "jar", "kg", "litre", "dozen"];

interface SupplierOption {
  name: string;
  phone: string | null;
}

interface ProductFormProps {
  categories: Category[];
  suppliers?: SupplierOption[];
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
    supplierPhone: string | null;
  };
}

export function ProductForm({ categories, suppliers = [], product }: ProductFormProps) {
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
    product?.reorderQty?.toString() ?? "10"
  );
  const [purchasePrice, setPurchasePrice] = useState(
    product?.purchasePrice?.toString() ?? ""
  );
  const [sellingPrice, setSellingPrice] = useState(
    product?.sellingPrice?.toString() ?? ""
  );
  const [supplierName, setSupplierName] = useState(product?.supplierName ?? "");
  const [supplierPhone, setSupplierPhone] = useState(product?.supplierPhone ?? "");

  // Build a name → phone lookup from the suppliers list
  const supplierMap = new Map<string, string | null>(
    suppliers.map((s) => [s.name, s.phone])
  );

  // Track whether the current phone value was auto-filled by us (vs typed by user).
  // Starts true if there's an existing phone on the product being edited, so we
  // don't immediately overwrite it when the component mounts.
  const phoneAutoFilled = useRef<boolean>(!product?.supplierPhone);

  function handleSupplierNameChange(value: string) {
    setSupplierName(value);

    const knownPhone = supplierMap.get(value);

    if (supplierMap.has(value)) {
      // Exact match to a known supplier — always auto-fill the phone.
      // This covers: picking from datalist, typing an exact existing name.
      setSupplierPhone(knownPhone ?? "");
      phoneAutoFilled.current = true;
    } else if (value === "") {
      // Supplier name cleared — clear phone only if it was auto-filled
      if (phoneAutoFilled.current) {
        setSupplierPhone("");
      }
    }
    // If typing a custom/partial name: leave phone untouched
  }

  function handlePhoneChange(value: string) {
    setSupplierPhone(value);
    // User is manually editing — stop auto-filling on further name changes
    phoneAutoFilled.current = false;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedPhone = supplierPhone.trim();
    if (trimmedPhone && !/^03[0-9]{2}-[0-9]{7}$/.test(trimmedPhone)) {
      toast.error("Phone must be in format 03XX-XXXXXXX (e.g. 0312-3456789)");
      return;
    }

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
      supplierPhone: trimmedPhone || undefined,
    };

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
    if (input.purchasePrice >= input.sellingPrice) {
      toast.warning("Selling price is not higher than purchase price - margin will be zero or negative");
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
      router.push(isEdit ? `/inventory/${productSlug(result.id, name.trim())}` : "/inventory");
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Product" : "New Product"}</CardTitle>
        </CardHeader>
        <CardContent>
          <fieldset disabled={isPending} className="space-y-5">
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
                  {categoryId ? (
                    <span>
                      {categories.find((c) => c.id.toString() === categoryId)?.icon}{" "}
                      {categories.find((c) => c.id.toString() === categoryId)?.name ?? "Select category"}
                    </span>
                  ) : (
                    <SelectValue placeholder="Select category" />
                  )}
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

          {/* Supplier Name + Phone */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="supplier-name">Supplier Name (optional)</Label>
              <Input
                id="supplier-name"
                list="supplier-suggestions"
                placeholder="e.g. Tapal Distributor"
                value={supplierName}
                onChange={(e) => handleSupplierNameChange(e.target.value)}
                autoComplete="off"
              />
              {suppliers.length > 0 && (
                <datalist id="supplier-suggestions">
                  {suppliers.map((s) => (
                    <option key={s.name} value={s.name} />
                  ))}
                </datalist>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-phone">Supplier Phone (optional)</Label>
              <Input
                id="supplier-phone"
                placeholder="e.g. 0312-3456789"
                value={supplierPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                inputMode="tel"
              />
            </div>
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
          </fieldset>
        </CardContent>
      </Card>
    </form>
  );
}
