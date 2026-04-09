"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircularProgress, Box } from "@mui/material";
import { useAuthStore } from "@/store/useAuthStore";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.replace("/login");
    }
  }, [loading, firebaseUser, router]);

  if (loading) {
    return (
      <Box className="min-h-screen flex items-center justify-center bg-gray-50">
        <CircularProgress sx={{ color: "#1B4F72" }} size={40} />
      </Box>
    );
  }

  if (!firebaseUser) return null;

  return <>{children}</>;
}
