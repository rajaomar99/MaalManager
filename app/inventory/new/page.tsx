import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export default async function NewProductPage() {
  await connection();
  const categories = await getCategories();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/inventory"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Add Product
          </h2>
          <p className="text-sm text-muted-foreground">
            Add a new product to your inventory.
          </p>
        </div>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
