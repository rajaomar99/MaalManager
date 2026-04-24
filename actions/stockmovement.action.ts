"use server";

import { prisma } from "@/lib/prisma";

export async function getRecentMovements() {
  const movements = await prisma.stockMovement.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { id: true, name: true } },
    },
  }).catch(() => []);

  return movements.map((m) => ({
    id: m.id,
    type: m.type as "RESTOCK" | "SALE" | "ADJUSTMENT",
    quantity: m.quantity,
    note: m.note,
    createdAt: m.createdAt.toISOString(),
    product: m.product,
  }));
}
