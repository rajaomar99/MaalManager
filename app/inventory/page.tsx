import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { InventoryList } from "@/components/InventoryList";

async function getProducts() {
  const products = await prisma.product.findMany({
    include: { category: true },
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
    };
  });
}

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export default async function InventoryPage() {
  await connection();

  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Inventory</h2>
        <p className="text-sm text-muted-foreground">
          Manage your {products.length} products. Use +/- to adjust stock quickly.
        </p>
      </div>
      <InventoryList initialProducts={products} categories={categories} />
    </div>
  );
}
