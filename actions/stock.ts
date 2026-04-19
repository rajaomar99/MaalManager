"use server";

import { prisma } from "@/lib/prisma";
import { MovementType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type StockActionResult =
  | {
      success: true;
      currentStock: number;
      stockStatus: "OK" | "LOW" | "OUT";
    }
  | { success: false; error: string };

export async function updateStock(
  productId: number,
  delta: number,
  type?: "RESTOCK" | "SALE" | "ADJUSTMENT",
  note?: string
): Promise<StockActionResult> {
  if (typeof delta !== "number" || delta === 0) {
    return { success: false, error: "delta must be a non-zero number" };
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const newStock = product.currentStock + delta;
    if (newStock < 0) {
      return { success: false, error: "Stock cannot go below 0" };
    }

    const movementType: MovementType =
      type != null
        ? MovementType[type]
        : delta > 0
          ? MovementType.RESTOCK
          : MovementType.SALE;

    const updated = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { currentStock: newStock },
      });

      await tx.stockMovement.create({
        data: {
          productId,
          type: movementType,
          quantity: delta,
          note: note ?? (delta > 0 ? "Quick restock" : "Quick sale"),
        },
      });

      return updatedProduct;
    });

    let stockStatus: "OK" | "LOW" | "OUT";
    if (updated.currentStock === 0) stockStatus = "OUT";
    else if (updated.currentStock <= updated.minStock) stockStatus = "LOW";
    else stockStatus = "OK";

    // Revalidate pages that show stock data so server components get fresh data
    revalidatePath("/");
    revalidatePath("/inventory");
    revalidatePath("/alerts");

    return { success: true, currentStock: updated.currentStock, stockStatus };
  } catch (error) {
    console.error("updateStock action error:", error);
    return { success: false, error: "Failed to update stock" };
  }
}
