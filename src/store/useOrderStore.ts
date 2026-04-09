import { create } from "zustand";
import { Order } from "@/types/order";

interface OrderState {
  orders: Order[];
  loading: boolean;
  setOrders: (orders: Order[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  loading: true,
  setOrders: (orders) => set({ orders, loading: false }),
  setLoading: (loading) => set({ loading }),
}));
