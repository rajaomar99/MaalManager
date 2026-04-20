import type { Metadata } from "next";
import { connection } from "next/server";
import { InventoryList } from "@/components/InventoryList";
import { getCategories } from "@/actions/category.action";
import { getProducts } from "@/actions/products.action";
import { Package } from "lucide-react";

export const metadata: Metadata = {
  title: "Inventory | Maal Manager",
};

export default async function InventoryPage() {
  await connection();

  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight">Inventory</h2>
        </div>
        <p className="text-base text-muted-foreground">
          Manage your {products.length} products. Use +/- to adjust stock quickly.
        </p>
      </div>
      <InventoryList initialProducts={products} categories={categories} />
    </div>
  );
}
