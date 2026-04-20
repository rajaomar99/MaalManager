"use server";

import { prisma } from "@/lib/prisma";

export async function getRecentMovements() {
  return prisma.stockMovement.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { id: true, name: true } },
    },
  });
}
