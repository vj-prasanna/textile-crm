import { create } from "zustand";
import { Deal } from "@/types/pipeline";

interface PipelineState {
  deals: Deal[];
  loading: boolean;
  setDeals: (deals: Deal[]) => void;
  setLoading: (loading: boolean) => void;
}

export const usePipelineStore = create<PipelineState>((set) => ({
  deals: [],
  loading: true,
  setDeals: (deals) => set({ deals, loading: false }),
  setLoading: (loading) => set({ loading }),
}));
