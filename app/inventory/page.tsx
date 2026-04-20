import type { Metadata } from "next";
import { connection } from "next/server";
import { InventoryList } from "@/components/InventoryList";
import { getCategories } from "@/actions/category.action";
import { getProducts } from "@/actions/products.action";

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
        <h2 className="text-2xl font-semibold tracking-tight">Inventory</h2>
        <p className="text-sm text-muted-foreground">
          Manage your {products.length} products. Use +/- to adjust stock quickly.
        </p>
      </div>
      <InventoryList initialProducts={products} categories={categories} />
    </div>
  );
}
