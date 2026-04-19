// Shared types for the Maal Manager frontend

export interface ProductWithStatus {
  id: number;
  name: string;
  categoryId: number;
  unit: string;
  currentStock: number;
  minStock: number;
  reorderQty: number;
  purchasePrice: number;
  sellingPrice: number;
  supplierName: string | null;
  createdAt: string;
  updatedAt: string;
  stockStatus: "OK" | "LOW" | "OUT";
  categoryName: string;
  categoryIcon: string;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalInventoryValue: number;
}

export interface StockMovement {
  id: number;
  productId: number;
  type: "RESTOCK" | "SALE" | "ADJUSTMENT";
  quantity: number;
  note: string | null;
  createdAt: string;
  product?: {
    id: number;
    name: string;
  };
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  _count: {
    products: number;
  };
}
