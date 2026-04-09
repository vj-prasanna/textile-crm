"use client";
import { useThemeStore } from "@/store/useThemeStore";
import { Typography } from "@mui/material";
import { GridViewRounded } from "@mui/icons-material";

export default function DashboardPage() {
  const { mode } = useThemeStore();
  const dark = mode === "dark";
  return (
    <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: 400 }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,rgba(79,142,247,0.15),rgba(99,102,241,0.15))", border: "1px solid rgba(79,142,247,0.2)" }}>
        <GridViewRounded sx={{ fontSize: 32, color: "#4F8EF7" }} />
      </div>
      <Typography variant="h5" sx={{ fontWeight: 700, color: dark ? "#F1F5F9" : "#1E293B" }}>Dashboard</Typography>
      <Typography sx={{ color: dark ? "#64748B" : "#94A3B8", textAlign: "center", maxWidth: 320 }}>
        Stats cards and AI insights coming in Phase 9.
      </Typography>
    </div>
  );
}
