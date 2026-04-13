import { create } from "zustand";
import { AIInsights } from "@/lib/ai/gemini";

interface AIInsightsState {
  insights: AIInsights | null;
  loading: boolean;
  error: string | null;
  setInsights: (insights: AIInsights) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAIInsightsStore = create<AIInsightsState>((set) => ({
  insights: null,
  loading: true,
  error: null,
  setInsights: (insights) => set({ insights, loading: false, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
}));
