"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePipelineStore } from "@/store/usePipelineStore";
import { subscribeToDeals } from "@/lib/firebase/pipeline";

export function usePipeline() {
  const { appUser } = useAuthStore();
  const { setDeals, setLoading } = usePipelineStore();

  useEffect(() => {
    if (!appUser) return;
    setLoading(true);
    const unsub = subscribeToDeals(appUser.uid, appUser.role, setDeals);
    return () => unsub();
  }, [appUser, setDeals, setLoading]);

  return usePipelineStore();
}
