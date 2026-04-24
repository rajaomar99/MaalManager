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
import { Loader2, PackagePlus } from "lucide-react";
import { toast } from "sonner";
import { updateStock } from "@/actions/products.action";

interface RestockDialogProps {
  productId: number;
  productName: string;
  reorderQty: number;
  unit: string;
}

export function RestockDialog({
  productId,
  productName,
  reorderQty,
  unit,
}: RestockDialogProps) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState(reorderQty.toString());

  function handleOpenChange(next: boolean) {
    if (!next) setQty(reorderQty.toString()); // reset on close
    setOpen(next);
  }
  const [isPending, startTransition] = useTransition();

  function handleRestock() {
    const quantity = Number(qty);
    if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
      toast.error("Enter a valid whole number");
      return;
    }

    startTransition(async () => {
      const result = await updateStock(
        productId,
        quantity,
        "RESTOCK",
        `Restocked ${quantity} ${unit}s`
      );

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(`Restocked ${quantity} ${unit}s of ${productName}`);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button size="sm" className="min-h-[44px]" id={`restock-btn-${productId}`} />
        }
      >
        <PackagePlus className="mr-2 h-4 w-4" />
        Mark Restocked
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restock {productName}</DialogTitle>
          <DialogDescription>
            Enter the quantity received. Suggested reorder: {reorderQty}{" "}
            {unit}s.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Label htmlFor="restock-qty">Quantity ({unit}s)</Label>
          <Input
            id="restock-qty"
            type="number"
            min="1"
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
          <Button onClick={handleRestock} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PackagePlus className="mr-2 h-4 w-4" />
            )}
            Restock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
