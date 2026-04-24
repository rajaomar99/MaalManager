"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type CategoryActionResult =
  | { success: true; id: number }
  | { success: false; error: string };

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  }).catch(() => []);
}

const DEFAULT_ICON = "📦";

export async function createCategory(
  name: string,
  icon: string
): Promise<CategoryActionResult> {
  const trimmedName = name.trim();
  const trimmedIcon = icon.trim() || DEFAULT_ICON;

  if (!trimmedName) return { success: false, error: "Category name is required" };

  try {
    const existing = await prisma.category.findFirst({
      where: { name: { equals: trimmedName, mode: "insensitive" } },
    });
    if (existing) return { success: false, error: "A category with that name already exists" };

    const category = await prisma.category.create({
      data: { name: trimmedName, icon: trimmedIcon },
    });

    revalidatePath("/categories");
    revalidatePath("/inventory");
    revalidatePath("/inventory/new");

    return { success: true, id: category.id };
  } catch {
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategory(
  id: number,
  name: string,
  icon: string
): Promise<CategoryActionResult> {
  const trimmedName = name.trim();
  const trimmedIcon = icon.trim() || DEFAULT_ICON;

  if (!trimmedName) return { success: false, error: "Category name is required" };

  try {
    const existing = await prisma.category.findFirst({
      where: { name: { equals: trimmedName, mode: "insensitive" }, NOT: { id } },
    });
    if (existing) return { success: false, error: "A category with that name already exists" };

    await prisma.category.update({
      where: { id },
      data: { name: trimmedName, icon: trimmedIcon },
    });

    revalidatePath("/categories");
    revalidatePath("/inventory");

    return { success: true, id };
  } catch {
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: number): Promise<CategoryActionResult> {
  try {
    await prisma.$transaction(async (tx) => {
      // StockMovements cascade-delete when their product is deleted
      await tx.product.deleteMany({ where: { categoryId: id } });
      await tx.category.delete({ where: { id } });
    });

    revalidatePath("/categories");
    revalidatePath("/inventory");
    revalidatePath("/alerts");
    revalidatePath("/");

    return { success: true, id };
  } catch {
    return { success: false, error: "Failed to delete category" };
  }
}
