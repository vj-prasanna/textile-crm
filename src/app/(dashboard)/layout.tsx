"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/ui/AuthGuard";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { signOut } from "@/lib/firebase/auth";
import {
  Avatar,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  LogoutRounded,
  ChevronLeft,
  ChevronRight,
  LightMode,
  DarkMode,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { appUser } = useAuthStore();
  const { mode, toggleMode } = useThemeStore();
  const dark = mode === "dark";
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    await signOut();
    router.replace("/login");
  }

  const sidebarW = collapsed ? 64 : 240;

  const sidebarBg = dark
    ? "rgba(15,23,42,0.85)"
    : "rgba(255,255,255,0.85)";
  const borderColor = dark
    ? "rgba(255,255,255,0.06)"
    : "rgba(0,0,0,0.06)";
  const textPrimary = dark ? "#F1F5F9" : "#1E293B";
  const textMuted = dark ? "#64748B" : "#94A3B8";

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: dark ? "#060B18" : "#F1F5F9" }}
    >
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: sidebarW,
          minWidth: sidebarW,
          background: sidebarBg,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRight: `1px solid ${borderColor}`,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.25s ease, min-width 0.25s ease",
          overflow: "hidden",
        }}
      >
        {/* ── Logo row ── */}
        <div
          className="flex items-center px-3 py-4"
          style={{
            borderBottom: `1px solid ${borderColor}`,
            justifyContent: collapsed ? "center" : "space-between",
          }}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #4F8EF7, #8B5CF6)",
                boxShadow: "0 4px 12px rgba(79,142,247,0.35)",
              }}
            >
              <span className="text-white font-bold text-sm">T</span>
            </div>
            {!collapsed && (
              <Typography sx={{ fontWeight: 700, color: textPrimary, whiteSpace: "nowrap", fontSize: 15 }}>
                Textile CRM
              </Typography>
            )}
          </div>

          {!collapsed && (
            <Tooltip title="Collapse sidebar">
              <IconButton
                size="small"
                onClick={() => setCollapsed(true)}
                sx={{
                  color: textMuted,
                  "&:hover": { color: textPrimary, bgcolor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" },
                }}
              >
                <ChevronLeft fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </div>

        {/* ── Expand button (collapsed state) ── */}
        {collapsed && (
          <div className="flex justify-center pt-2">
            <Tooltip title="Expand sidebar" placement="right">
              <IconButton
                size="small"
                onClick={() => setCollapsed(false)}
                sx={{
                  color: textMuted,
                  "&:hover": { color: textPrimary, bgcolor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" },
                }}
              >
                <ChevronRight fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        )}

        {/* ── Nav placeholder ── */}
        {!collapsed && (
          <div className="flex-1 px-3 pt-4">
            <div
              className="rounded-xl px-3 py-2 text-center"
              style={{
                background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                border: `1px solid ${borderColor}`,
              }}
            >
              <Typography variant="caption" sx={{ color: textMuted }}>
                Nav links in Phase 3
              </Typography>
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* ── Bottom section ── */}
        <div
          className="flex flex-col gap-2 p-3"
          style={{ borderTop: `1px solid ${borderColor}` }}
        >
          {/* Theme toggle */}
          <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"} placement={collapsed ? "right" : "top"}>
            <IconButton
              onClick={toggleMode}
              sx={{
                width: "100%",
                borderRadius: "10px",
                py: 0.8,
                justifyContent: collapsed ? "center" : "flex-start",
                px: collapsed ? 0 : 1.5,
                gap: 1.5,
                color: textMuted,
                background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                border: `1px solid ${borderColor}`,
                "&:hover": {
                  color: textPrimary,
                  background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
                },
              }}
            >
              {mode === "dark"
                ? <LightMode sx={{ fontSize: 18 }} />
                : <DarkMode sx={{ fontSize: 18 }} />}
              {!collapsed && (
                <Typography variant="body2" sx={{ fontWeight: 500, color: "inherit" }}>
                  {mode === "dark" ? "Light mode" : "Dark mode"}
                </Typography>
              )}
            </IconButton>
          </Tooltip>

          {/* User card */}
          {appUser && (
            <div
              className="flex items-center gap-2.5 rounded-xl p-2"
              style={{
                background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                border: `1px solid ${borderColor}`,
                justifyContent: collapsed ? "center" : "flex-start",
                overflow: "hidden",
              }}
            >
              <Tooltip title={collapsed ? appUser.displayName : ""} placement="right">
                <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: "#4F8EF7", flexShrink: 0 }}>
                  {appUser.displayName?.[0]?.toUpperCase() ?? "U"}
                </Avatar>
              </Tooltip>
              {!collapsed && (
                <div className="min-w-0">
                  <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: textPrimary, fontSize: 13 }}>
                    {appUser.displayName}
                  </Typography>
                  <Typography variant="caption" noWrap sx={{ color: textMuted, textTransform: "capitalize", fontSize: 11 }}>
                    {appUser.role}
                  </Typography>
                </div>
              )}
            </div>
          )}

          {/* Logout */}
          <Tooltip title="Sign out" placement={collapsed ? "right" : "top"}>
            <IconButton
              onClick={handleLogout}
              sx={{
                width: "100%",
                borderRadius: "10px",
                py: 0.8,
                justifyContent: collapsed ? "center" : "flex-start",
                px: collapsed ? 0 : 1.5,
                gap: 1.5,
                color: "#EF4444",
                background: "rgba(239,68,68,0.05)",
                border: "1px solid rgba(239,68,68,0.15)",
                "&:hover": {
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                },
              }}
            >
              <LogoutRounded sx={{ fontSize: 18 }} />
              {!collapsed && (
                <Typography variant="body2" sx={{ fontWeight: 600, color: "inherit" }}>
                  Sign Out
                </Typography>
              )}
            </IconButton>
          </Tooltip>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
