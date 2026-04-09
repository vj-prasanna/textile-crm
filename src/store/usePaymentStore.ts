import { create } from "zustand";
import { Payment } from "@/types/payment";

interface PaymentState {
  payments: Payment[];
  loading: boolean;
  setPayments: (payments: Payment[]) => void;
  setLoading: (loading: boolean) => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  loading: true,
  setPayments: (payments) => set({ payments, loading: false }),
  setLoading: (loading) => set({ loading }),
}));
