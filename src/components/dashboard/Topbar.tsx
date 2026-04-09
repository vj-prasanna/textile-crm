"use client";

import { usePathname } from "next/navigation";
import { useThemeStore } from "@/store/useThemeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Typography, Avatar, IconButton, Badge, InputAdornment } from "@mui/material";
import {
  MenuRounded,
  NotificationsNoneRounded,
  SearchRounded,
} from "@mui/icons-material";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/contacts": "Contacts",
  "/products": "Products",
  "/orders": "Orders",
  "/payments": "Payments",
  "/pipeline": "Sales Pipeline",
};

interface TopbarProps {
  onMobileMenuOpen: () => void;
}

export function Topbar({ onMobileMenuOpen }: TopbarProps) {
  const pathname = usePathname();
  const { mode } = useThemeStore();
  const { appUser } = useAuthStore();
  const dark = mode === "dark";

  const title = PAGE_TITLES[pathname] ?? "Dashboard";
  const borderColor = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const bg = dark ? "rgba(10,17,35,0.8)" : "rgba(255,255,255,0.8)";
  const textPrimary = dark ? "#F1F5F9" : "#1E293B";
  const textMuted = dark ? "#64748B" : "#94A3B8";
  const inputBg = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";

  return (
    <header
      style={{
        height: 60,
        background: bg,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: `1px solid ${borderColor}`,
        display: "flex",
        alignItems: "center",
        paddingLeft: 16,
        paddingRight: 16,
        gap: 12,
        flexShrink: 0,
      }}
    >
      {/* Mobile hamburger */}
      <IconButton
        className="lg:hidden"
        size="small"
        onClick={onMobileMenuOpen}
        sx={{ color: textMuted, flexShrink: 0 }}
      >
        <MenuRounded />
      </IconButton>

      {/* Page title */}
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: { xs: 16, sm: 18 },
          color: textPrimary,
          flexShrink: 0,
        }}
      >
        {title}
      </Typography>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search bar */}
      <div
        className="hidden sm:flex items-center gap-2 rounded-xl px-3"
        style={{
          background: inputBg,
          border: `1px solid ${borderColor}`,
          height: 38,
          width: 220,
          transition: "all 0.2s",
        }}
        onFocus={e => (e.currentTarget.style.borderColor = "#4F8EF7")}
        onBlur={e => (e.currentTarget.style.borderColor = borderColor)}
      >
        <InputAdornment position="start" sx={{ m: 0 }}>
          <SearchRounded sx={{ fontSize: 17, color: textMuted }} />
        </InputAdornment>
        <input
          placeholder="Search..."
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 13,
            color: textPrimary,
            width: "100%",
          }}
        />
      </div>

      {/* Notifications */}
      <IconButton
        size="small"
        sx={{
          color: textMuted,
          background: inputBg,
          border: `1px solid ${borderColor}`,
          borderRadius: "10px",
          width: 38,
          height: 38,
          flexShrink: 0,
          "&:hover": { color: textPrimary, borderColor: "#4F8EF7" },
        }}
      >
        <Badge
          badgeContent={3}
          sx={{
            "& .MuiBadge-badge": {
              background: "linear-gradient(135deg,#4F8EF7,#8B5CF6)",
              color: "white",
              fontSize: 10,
              minWidth: 16,
              height: 16,
              padding: "0 4px",
            },
          }}
        >
          <NotificationsNoneRounded sx={{ fontSize: 20 }} />
        </Badge>
      </IconButton>

      {/* User avatar */}
      <Avatar
        sx={{
          width: 34,
          height: 34,
          fontSize: 13,
          fontWeight: 700,
          bgcolor: "#4F8EF7",
          flexShrink: 0,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(79,142,247,0.35)",
        }}
      >
        {appUser?.displayName?.[0]?.toUpperCase() ?? "U"}
      </Avatar>
    </header>
  );
}
