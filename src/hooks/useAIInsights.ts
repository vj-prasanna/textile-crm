"use client";

import { useEffect } from "react";
import { useAIInsightsStore } from "@/store/useAIInsightsStore";
import { AIInsights } from "@/lib/ai/gemini";

export function useAIInsights() {
  const { setInsights, setLoading, setError } = useAIInsightsStore();

  useEffect(() => {
    setLoading(true);
    fetch("/api/ai/insights")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch insights");
        return res.json() as Promise<AIInsights>;
      })
      .then(setInsights)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg);
      });
  }, [setInsights, setLoading, setError]);

  return useAIInsightsStore();
}
