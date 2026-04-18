import { PrismaClient, MovementType } from "@prisma/client";

const prisma = new PrismaClient();

type SeedCategory = { name: string; icon: string };

type SeedProduct = {
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  reorderQty: number;
  purchasePrice: number;
  sellingPrice: number;
  supplierName?: string;
};

const categories: SeedCategory[] = [
  { name: "Tea & Coffee", icon: "☕" },
  { name: "Beverages", icon: "🥤" },
  { name: "Spices", icon: "🌶️" },
  { name: "Flour & Grains", icon: "🌾" },
  { name: "Snacks", icon: "🍪" },
  { name: "Dairy", icon: "🥛" },
  { name: "Household", icon: "🧼" },
  { name: "Cooking Oil", icon: "🫙" },
  { name: "Spreads", icon: "🍯" },
];

const products: SeedProduct[] = [
  { name: "Tapal Danedar 200g",       category: "Tea & Coffee",    unit: "packet", currentStock: 4,  minStock: 10, reorderQty: 24, purchasePrice: 380, sellingPrice: 420, supplierName: "Tapal Distributor — Anarkali" },
  { name: "Lipton Yellow Label 100g", category: "Tea & Coffee",    unit: "packet", currentStock: 18, minStock: 8,  reorderQty: 12, purchasePrice: 260, sellingPrice: 290, supplierName: "Unilever Agent" },
  { name: "Pepsi 1.5L",                category: "Beverages",       unit: "bottle", currentStock: 6,  minStock: 12, reorderQty: 24, purchasePrice: 180, sellingPrice: 220, supplierName: "Pepsi Distributor — Gulberg" },
  { name: "Coca-Cola 500ml",           category: "Beverages",       unit: "bottle", currentStock: 24, minStock: 12, reorderQty: 24, purchasePrice: 70,  sellingPrice: 90,  supplierName: "Coca-Cola Agent — Liberty" },
  { name: "Shan Biryani Masala",       category: "Spices",          unit: "packet", currentStock: 3,  minStock: 8,  reorderQty: 24, purchasePrice: 110, sellingPrice: 140, supplierName: "Shan Foods" },
  { name: "Shan Chicken Masala",       category: "Spices",          unit: "packet", currentStock: 12, minStock: 8,  reorderQty: 24, purchasePrice: 110, sellingPrice: 140, supplierName: "Shan Foods" },
  { name: "Sunridge Flour 5kg",        category: "Flour & Grains",  unit: "bag",    currentStock: 2,  minStock: 5,  reorderQty: 10, purchasePrice: 1450, sellingPrice: 1550, supplierName: "Sunridge Mills" },
  { name: "Lays Classic 34g",          category: "Snacks",          unit: "piece",  currentStock: 45, minStock: 20, reorderQty: 60, purchasePrice: 40,  sellingPrice: 50,  supplierName: "Pepsico Snacks" },
  { name: "Peek Freans Peanut Pik",    category: "Snacks",          unit: "piece",  currentStock: 7,  minStock: 15, reorderQty: 30, purchasePrice: 28,  sellingPrice: 40,  supplierName: "EBM Distributor" },
  { name: "Olpers Milk 1L",            category: "Dairy",           unit: "pack",   currentStock: 10, minStock: 10, reorderQty: 20, purchasePrice: 270, sellingPrice: 300, supplierName: "Engro Foods Agent" },
  { name: "Nestle Raita 400g",         category: "Dairy",           unit: "pack",   currentStock: 8,  minStock: 5,  reorderQty: 12, purchasePrice: 210, sellingPrice: 250, supplierName: "Nestle Distributor" },
  { name: "Safeguard Soap 135g",       category: "Household",       unit: "piece",  currentStock: 20, minStock: 10, reorderQty: 24, purchasePrice: 120, sellingPrice: 150, supplierName: "P&G Agent" },
  { name: "Surf Excel 500g",           category: "Household",       unit: "packet", currentStock: 3,  minStock: 8,  reorderQty: 12, purchasePrice: 380, sellingPrice: 430, supplierName: "Unilever Agent" },
  { name: "Dalda Cooking Oil 1L",      category: "Cooking Oil",     unit: "bottle", currentStock: 5,  minStock: 10, reorderQty: 12, purchasePrice: 580, sellingPrice: 650, supplierName: "Dalda Foods" },
  { name: "Mitchell's Jam 440g",       category: "Spreads",         unit: "jar",    currentStock: 6,  minStock: 5,  reorderQty: 10, purchasePrice: 420, sellingPrice: 490, supplierName: "Mitchell's Distributor" },
];

async function main() {
  console.log("🌱 Seeding Al-Madina General Store...");

  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const categoryByName = new Map<string, number>();
  for (const c of categories) {
    const created = await prisma.category.create({ data: c });
    categoryByName.set(created.name, created.id);
  }
  console.log(`  ✓ ${categories.length} categories`);

  for (const p of products) {
    const categoryId = categoryByName.get(p.category);
    if (!categoryId) throw new Error(`Missing category ${p.category}`);

    const created = await prisma.product.create({
      data: {
        name: p.name,
        categoryId,
        unit: p.unit,
        currentStock: p.currentStock,
        minStock: p.minStock,
        reorderQty: p.reorderQty,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        supplierName: p.supplierName,
      },
    });

    await prisma.stockMovement.create({
      data: {
        productId: created.id,
        type: MovementType.RESTOCK,
        quantity: p.currentStock,
        note: "Initial stock",
      },
    });
  }
  console.log(`  ✓ ${products.length} products + opening RESTOCK movements`);
  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
