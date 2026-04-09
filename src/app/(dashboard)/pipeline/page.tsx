"use client";
import { useThemeStore } from "@/store/useThemeStore";
import { Typography } from "@mui/material";
export default function Page() {
  const { mode } = useThemeStore();
  const dark = mode === "dark";
  return (
    <div className="flex flex-col items-center justify-center gap-3" style={{ minHeight: 400 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: dark ? "#F1F5F9" : "#1E293B" }}>Coming soon</Typography>
      <Typography sx={{ color: dark ? "#64748B" : "#94A3B8" }}>This module will be built in an upcoming phase.</Typography>
    </div>
  );
}
