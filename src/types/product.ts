import { Timestamp } from "firebase/firestore";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: "yarn" | "fabric" | "garment";
  subCategory: string;
  unit: "meter" | "kg" | "piece" | "roll";
  pricePerUnit: number;
  stock: number;
  minStock: number;
  icon: string;
  description?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ProductFormData = Omit<Product, "id" | "createdAt" | "updatedAt">;
