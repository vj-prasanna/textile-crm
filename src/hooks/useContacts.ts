"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useContactStore } from "@/store/useContactStore";
import { subscribeToContacts } from "@/lib/firebase/contacts";

export function useContacts() {
  const { appUser } = useAuthStore();
  const { setContacts, setLoading } = useContactStore();

  useEffect(() => {
    if (!appUser) return;
    setLoading(true);
    const unsub = subscribeToContacts(appUser.uid, appUser.role, setContacts);
    return () => unsub();
  }, [appUser, setContacts, setLoading]);

  return useContactStore();
}
