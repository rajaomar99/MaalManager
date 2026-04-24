"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { updateStock } from "@/actions/products.action";

interface QuickSaleDialogProps {
  productId: number;
  productName: string;
  currentStock: number;
  unit: string;
  onUpdate?: (newStock: number, stockStatus: string) => void;
}

export function QuickSaleDialog({
  productId,
  productName,
  currentStock,
  unit,
  onUpdate,
}: QuickSaleDialogProps) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState("1");
  const [isPending, startTransition] = useTransition();

  function handleSale() {
    const quantity = Number(qty);
    if (!qty.trim() || !Number.isInteger(quantity) || quantity <= 0) {
      toast.error("Enter a valid whole number");
      return;
    }
    if (quantity > currentStock) {
      toast.error(`Only ${currentStock} ${unit}s in stock`);
      return;
    }

    startTransition(async () => {
      const result = await updateStock(
        productId,
        -quantity,
        "SALE",
        `Sold ${quantity} ${unit}${quantity !== 1 ? "s" : ""}`
      );

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      onUpdate?.(result.currentStock, result.stockStatus);
      toast.success(`Sale recorded - ${quantity} ${unit}${quantity !== 1 ? "s" : ""} of ${productName}`);
      setQty("1");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) setQty("1"); setOpen(next); }}>
      <DialogTrigger
        render={
          <Button
            variant="default"
            size="lg"
            className="min-h-[44px] gap-2"
            id={`sale-btn-${productId}`}
            disabled={currentStock === 0}
          />
        }
      >
        <ShoppingCart className="h-4 w-4" />
        Record Sale
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Sale - {productName}</DialogTitle>
          <DialogDescription>
            Current stock: {currentStock} {unit}s. Enter how many were sold.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Label htmlFor="sale-qty">Quantity Sold ({unit}s)</Label>
          <Input
            id="sale-qty"
            type="number"
            min="1"
            max={currentStock}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="mt-1.5"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSale} disabled={isPending || currentStock === 0}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="mr-2 h-4 w-4" />
            )}
            Confirm Sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
