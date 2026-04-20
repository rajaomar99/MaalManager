import type { Metadata } from "next";
import { connection } from "next/server";
import { Tag } from "lucide-react";
import { CategoryManager } from "@/components/CategoryManager";
import { getCategories } from "@/actions/category.action";

export const metadata: Metadata = {
  title: "Categories | Maal Manager",
};

export default async function CategoriesPage() {
  await connection();
  const categories = await getCategories();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Tag className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight">Categories</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage your {categories.length} product categories.
        </p>
      </div>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
