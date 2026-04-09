"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { getUserDocument } from "@/lib/firebase/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { AppUser } from "@/types/user";

export function useAuthListener() {
  const { setFirebaseUser, setAppUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const data = await getUserDocument(user.uid);
        setAppUser(data as AppUser | null);
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setFirebaseUser, setAppUser, setLoading]);
}
