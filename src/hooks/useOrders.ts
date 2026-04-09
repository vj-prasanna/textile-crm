"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useOrderStore } from "@/store/useOrderStore";
import { subscribeToOrders } from "@/lib/firebase/orders";

export function useOrders() {
  const { appUser } = useAuthStore();
  const { setOrders, setLoading } = useOrderStore();

  useEffect(() => {
    if (!appUser) return;
    setLoading(true);
    const unsub = subscribeToOrders(appUser.uid, appUser.role, setOrders);
    return () => unsub();
  }, [appUser, setOrders, setLoading]);

  return useOrderStore();
}
