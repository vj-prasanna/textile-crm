"use client";

import { useEffect } from "react";
import { usePaymentStore } from "@/store/usePaymentStore";
import { subscribeToPayments } from "@/lib/firebase/payments";

export function usePayments() {
  const { setPayments, setLoading } = usePaymentStore();

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToPayments(setPayments);
    return () => unsub();
  }, [setPayments, setLoading]);

  return usePaymentStore();
}
