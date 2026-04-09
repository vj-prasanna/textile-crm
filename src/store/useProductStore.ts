import { create } from "zustand";
import { Product } from "@/types/product";

interface ProductState {
  products: Product[];
  loading: boolean;
  setProducts: (products: Product[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  loading: true,
  setProducts: (products) => set({ products, loading: false }),
  setLoading: (loading) => set({ loading }),
}));
