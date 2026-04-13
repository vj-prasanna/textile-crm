"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePaymentStore } from "@/store/usePaymentStore";
import { subscribeToPayments } from "@/lib/firebase/payments";

export function usePayments() {
  const { appUser } = useAuthStore();
  const { setPayments, setLoading } = usePaymentStore();

  useEffect(() => {
    if (!appUser) return;
    setLoading(true);
    const unsub = subscribeToPayments(appUser.uid, appUser.role, setPayments);
    return () => unsub();
  }, [appUser, setPayments, setLoading]);

  return usePaymentStore();
}
