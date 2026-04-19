"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ProductActionResult =
  | { success: true; id: number }
  | { success: false; error: string };

interface CreateProductInput {
  name: string;
  categoryId: number;
  unit: string;
  currentStock: number;
  minStock: number;
  reorderQty: number;
  purchasePrice: number;
  sellingPrice: number;
  supplierName?: string;
}

export async function createProduct(
  input: CreateProductInput
): Promise<ProductActionResult> {
  if (!input.name?.trim()) {
    return { success: false, error: "Product name is required" };
  }
  if (input.currentStock < 0) {
    return { success: false, error: "Stock cannot be negative" };
  }
  if (input.minStock <= 0) {
    return { success: false, error: "Min stock must be greater than 0" };
  }
  if (input.purchasePrice <= 0 || input.sellingPrice <= 0) {
    return { success: false, error: "Prices must be greater than 0" };
  }

  try {
    const product = await prisma.product.create({
      data: {
        name: input.name.trim(),
        categoryId: input.categoryId,
        unit: input.unit,
        currentStock: input.currentStock,
        minStock: input.minStock,
        reorderQty: input.reorderQty,
        purchasePrice: input.purchasePrice,
        sellingPrice: input.sellingPrice,
        supplierName: input.supplierName?.trim() || null,
      },
    });

    // Record opening stock movement if stock > 0
    if (input.currentStock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: "RESTOCK",
          quantity: input.currentStock,
          note: "Initial stock",
        },
      });
    }

    revalidatePath("/");
    revalidatePath("/inventory");
    revalidatePath("/alerts");

    return { success: true, id: product.id };
  } catch (error) {
    console.error("createProduct action error:", error);
    return { success: false, error: "Failed to create product" };
  }
}

interface UpdateProductInput extends CreateProductInput {
  id: number;
}

export async function updateProduct(
  input: UpdateProductInput
): Promise<ProductActionResult> {
  if (!input.name?.trim()) {
    return { success: false, error: "Product name is required" };
  }
  if (input.currentStock < 0) {
    return { success: false, error: "Stock cannot be negative" };
  }
  if (input.minStock <= 0) {
    return { success: false, error: "Min stock must be greater than 0" };
  }
  if (input.purchasePrice <= 0 || input.sellingPrice <= 0) {
    return { success: false, error: "Prices must be greater than 0" };
  }

  try {
    const existing = await prisma.product.findUnique({
      where: { id: input.id },
    });
    if (!existing) {
      return { success: false, error: "Product not found" };
    }

    await prisma.product.update({
      where: { id: input.id },
      data: {
        name: input.name.trim(),
        categoryId: input.categoryId,
        unit: input.unit,
        currentStock: input.currentStock,
        minStock: input.minStock,
        reorderQty: input.reorderQty,
        purchasePrice: input.purchasePrice,
        sellingPrice: input.sellingPrice,
        supplierName: input.supplierName?.trim() || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/inventory");
    revalidatePath(`/inventory/${input.id}`);
    revalidatePath("/alerts");

    return { success: true, id: input.id };
  } catch (error) {
    console.error("updateProduct action error:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProduct(
  productId: number
): Promise<ProductActionResult> {
  try {
    const existing = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!existing) {
      return { success: false, error: "Product not found" };
    }

    // StockMovements are cascade-deleted via schema onDelete: Cascade
    await prisma.product.delete({ where: { id: productId } });

    revalidatePath("/");
    revalidatePath("/inventory");
    revalidatePath("/alerts");

    return { success: true, id: productId };
  } catch (error) {
    console.error("deleteProduct action error:", error);
    return { success: false, error: "Failed to delete product" };
  }
}
