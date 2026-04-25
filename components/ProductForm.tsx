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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { createProduct, updateProduct } from "@/actions/products.action";
import { cn, productSlug } from "@/lib/utils";
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
  
  const [openSupplier, setOpenSupplier] = useState(false);

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
    } else {
      // Name changed to a new/different supplier — clear the phone number
      setSupplierPhone("");
      phoneAutoFilled.current = false;
    }
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
    if (input.supplierPhone && !input.supplierName) {
      toast.error("Supplier name is required if a supplier phone number is provided");
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
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="supplier-name">Supplier Name (optional)</Label>
              <div className="relative w-full">
                <Popover open={openSupplier} onOpenChange={setOpenSupplier}>
                  <PopoverTrigger
                    render={
                      <Button
                        id="supplier-name"
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between font-normal"
                      >
                        {supplierName
                          ? suppliers.find((s) => s.name === supplierName)?.name || supplierName
                          : "Select or enter supplier..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    }
                  />
                  <PopoverContent 
                    className="w-[var(--anchor-width)] p-0" 
                    side="top"
                    initialFocus={(type) => (type === "touch" ? false : true)}
                  >
                  <Command filter={(value, search) => {
                    if (value === "create_new_item") return 1;
                    if (value.toLowerCase().includes(search.toLowerCase().trim())) return 1;
                    return 0;
                  }}>
                    <CommandInput
                      autoFocus={false}
                      placeholder="Search or enter supplier..."
                      value={supplierName}
                      onValueChange={(val) => {
                         handleSupplierNameChange(val);
                      }}
                    />
                    <CommandList className="max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:!block [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
                      <CommandEmpty>No supplier found.</CommandEmpty>
                      <CommandGroup>
                        {supplierName && !suppliers.some(s => s.name.toLowerCase() === supplierName.trim().toLowerCase()) && (
                          <CommandItem
                            value="create_new_item"
                            onSelect={() => {
                              handleSupplierNameChange(supplierName.trim());
                              setOpenSupplier(false);
                            }}
                            className="font-medium text-primary cursor-pointer mt-1 border border-border"
                          >
                            <Check className="mr-2 h-4 w-4 opacity-0" />
                            Create new: "{supplierName}"
                          </CommandItem>
                        )}
                        {suppliers.map((s) => (
                          <CommandItem
                            key={s.name}
                            value={s.name}
                            onSelect={(currentValue) => {
                              // shadcn command item value is always lowercase
                              const actualSupplier = suppliers.find(sup => sup.name.toLowerCase() === currentValue);
                              if(actualSupplier) {
                                handleSupplierNameChange(actualSupplier.name);
                              } else {
                                handleSupplierNameChange(currentValue);
                              }
                              setOpenSupplier(false);
                            }}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                supplierName.toLowerCase() === s.name.toLowerCase() ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {s.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
                </Popover>
              </div>
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
