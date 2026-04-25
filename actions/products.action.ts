"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { MovementType } from "@prisma/client";

export type ProductActionResult =
  | { success: true; id: number }
  | { success: false; error: string };

export type StockActionResult =
  | {
      success: true;
      currentStock: number;
      stockStatus: "OK" | "LOW" | "OUT";
    }
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
  supplierPhone?: string;
}

interface UpdateProductInput extends CreateProductInput {
  id: number;
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
        supplierPhone: input.supplierPhone?.trim() || null,
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

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
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
          supplierPhone: input.supplierPhone?.trim() || null,
        },
      });

      if (existing.currentStock !== input.currentStock) {
        const qtyChange = input.currentStock - existing.currentStock;
        await tx.stockMovement.create({
          data: {
            productId: input.id,
            type: "ADJUSTMENT",
            quantity: qtyChange,
            note: `Manual stock adjustment from ${existing.currentStock} to ${input.currentStock}`,
          },
        });
      }
    });

    revalidatePath("/");
    revalidatePath("/inventory");
    revalidatePath("/inventory/[id]", "page");
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

export async function getStats() {
  const products = await prisma.product.findMany({
    select: {
      currentStock: true,
      minStock: true,
      sellingPrice: true,
    },
  });

  return {
    totalProducts: products.length,
    lowStockCount: products.filter(
      (p) => p.currentStock > 0 && p.currentStock <= p.minStock
    ).length,
    outOfStockCount: products.filter((p) => p.currentStock === 0).length,
    totalInventoryValue: products.reduce(
      (acc, p) => acc + p.currentStock * Number(p.sellingPrice),
      0
    ),
  };
}

export async function getFiveLowStockProducts() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { currentStock: "asc" },
  }).catch(() => []);

  return products
    .filter((p) => p.currentStock <= p.minStock)
    .sort((a, b) => {
      const aOut = a.currentStock === 0;
      const bOut = b.currentStock === 0;
      if (aOut && !bOut) return -1;
      if (!aOut && bOut) return 1;
      return (b.minStock - b.currentStock) - (a.minStock - a.currentStock);
    })
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      name: p.name,
      currentStock: p.currentStock,
      minStock: p.minStock,
      unit: p.unit,
      reorderQty: p.reorderQty,
      categoryIcon: p.category.icon,
      categoryName: p.category.name,
      stockStatus: p.currentStock === 0 ? ("OUT" as const) : ("LOW" as const),
      unitsShort: p.minStock - p.currentStock,
    }));
}

export async function getLowStockProducts() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      movements: {
        where: { type: "RESTOCK" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
    orderBy: { currentStock: "asc" },
  });

  return products
    .filter((p) => p.currentStock <= p.minStock)
    .sort((a, b) => {
      const aOut = a.currentStock === 0;
      const bOut = b.currentStock === 0;
      if (aOut && !bOut) return -1;
      if (!aOut && bOut) return 1;
      return (b.minStock - b.currentStock) - (a.minStock - a.currentStock);
    })
    .map((p) => ({
      id: p.id,
      name: p.name,
      currentStock: p.currentStock,
      minStock: p.minStock,
      reorderQty: p.reorderQty,
      unit: p.unit,
      purchasePrice: Number(p.purchasePrice),
      sellingPrice: Number(p.sellingPrice),
      supplierName: p.supplierName,
      categoryIcon: p.category.icon,
      categoryName: p.category.name,
      stockStatus:
        p.currentStock === 0 ? ("OUT" as const) : ("LOW" as const),
      unitsShort: p.minStock - p.currentStock,
      supplierPhone: p.supplierPhone,
      lastRestockedAt: p.movements[0]?.createdAt.toISOString() ?? null,
    }));
}

export async function getProducts() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      movements: {
        where: { type: "RESTOCK" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return products.map((p) => {
    let stockStatus: "OK" | "LOW" | "OUT";
    if (p.currentStock === 0) stockStatus = "OUT";
    else if (p.currentStock <= p.minStock) stockStatus = "LOW";
    else stockStatus = "OK";

    return {
      id: p.id,
      name: p.name,
      categoryId: p.categoryId,
      unit: p.unit,
      currentStock: p.currentStock,
      minStock: p.minStock,
      reorderQty: p.reorderQty,
      purchasePrice: Number(p.purchasePrice),
      sellingPrice: Number(p.sellingPrice),
      supplierName: p.supplierName,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      stockStatus,
      categoryName: p.category.name,
      categoryIcon: p.category.icon,
      supplierPhone: p.supplierPhone,
      lastRestockedAt: p.movements[0]?.createdAt.toISOString() ?? null,
    };
  });
}

export async function getProduct(id: number) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      movements: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
}

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

export async function getDailyRevenue() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const movements = await prisma.stockMovement.findMany({
    where: { type: "SALE", createdAt: { gte: todayStart } },
    include: { product: { select: { sellingPrice: true } } },
  });

  return movements.reduce(
    (acc, m) => acc + Math.abs(m.quantity) * Number(m.product.sellingPrice),
    0
  );
}

export async function getSupplierNames(): Promise<{ name: string; phone: string | null }[]> {
  const products = await prisma.product.findMany({
    where: { supplierName: { not: null } },
    select: { supplierName: true, supplierPhone: true },
    distinct: ["supplierName"],
    orderBy: { supplierName: "asc" },
  });
  return products.map((p) => ({ name: p.supplierName!, phone: p.supplierPhone }));
}

export async function getLowStockCount() {
  const products = await prisma.product.findMany({
    select: { currentStock: true, minStock: true },
  });
  return products.filter((p) => p.currentStock <= p.minStock).length;
}
