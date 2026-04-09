"use client";

import { IconButton, Tooltip } from "@mui/material";
import { LightMode, DarkMode } from "@mui/icons-material";
import { useThemeStore } from "@/store/useThemeStore";

export function ThemeToggle({ className }: { className?: string }) {
  const { mode, toggleMode } = useThemeStore();

  return (
    <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton
        onClick={toggleMode}
        className={className}
        sx={{
          background: mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          backdropFilter: "blur(10px)",
          border: mode === "dark" ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)",
          color: mode === "dark" ? "#F1F5F9" : "#1E293B",
          "&:hover": {
            background: mode === "dark" ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.1)",
          },
          width: 40,
          height: 40,
        }}
      >
        {mode === "dark" ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
