"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateStock } from "@/actions/stock";

interface QuickStockUpdateProps {
  productId: number;
  currentStock: number;
  unit: string;
  onUpdate?: (newStock: number, stockStatus: string) => void;
}

export function QuickStockUpdate({
  productId,
  currentStock,
  unit,
  onUpdate,
}: QuickStockUpdateProps) {
  const [stock, setStock] = useState(currentStock);
  const [isPending, startTransition] = useTransition();

  function handleDelta(delta: number) {
    const optimisticStock = stock + delta;
    if (optimisticStock < 0) {
      toast.error("Stock cannot go below 0");
      return;
    }

    // Optimistic update
    const previousStock = stock;
    setStock(optimisticStock);

    startTransition(async () => {
      const result = await updateStock(productId, delta);

      if (!result.success) {
        // Rollback
        setStock(previousStock);
        toast.error(result.error);
        return;
      }

      setStock(result.currentStock);
      onUpdate?.(result.currentStock, result.stockStatus);
      toast.success(
        `${delta > 0 ? "Added" : "Removed"} ${Math.abs(delta)} ${unit}${Math.abs(delta) !== 1 ? "s" : ""}`
      );
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        id={`stock-minus-${productId}`}
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => handleDelta(-1)}
        disabled={isPending || stock <= 0}
        aria-label={`Remove 1 ${unit}`}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Minus className="h-3.5 w-3.5" />
        )}
      </Button>
      <span className="min-w-10 text-center text-sm font-semibold tabular-nums">
        {stock}
      </span>
      <Button
        id={`stock-plus-${productId}`}
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => handleDelta(1)}
        disabled={isPending}
        aria-label={`Add 1 ${unit}`}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
