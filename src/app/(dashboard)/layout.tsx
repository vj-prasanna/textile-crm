"use client";

import { AuthGuard } from "@/components/ui/AuthGuard";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { signOut } from "@/lib/firebase/auth";
import { Button, Avatar, Typography } from "@mui/material";
import { LogoutRounded } from "@mui/icons-material";
import { useRouter } from "next/navigation";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { appUser } = useAuthStore();
  const { mode } = useThemeStore();
  const dark = mode === "dark";
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.replace("/login");
  }

  return (
    <div
      className="flex h-screen"
      style={{ background: dark ? "#060B18" : "#F1F5F9" }}
    >
      {/* Sidebar placeholder */}
      <aside
        className="w-64 flex-shrink-0 flex flex-col justify-between p-4"
        style={{
          background: dark ? "rgba(15,23,42,0.8)" : "rgba(255,255,255,0.8)",
          backdropFilter: "blur(20px)",
          borderRight: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {/* Logo */}
        <div>
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #4F8EF7, #8B5CF6)",
                boxShadow: "0 4px 12px rgba(79,142,247,0.35)",
              }}
            >
              <span className="text-white font-bold">T</span>
            </div>
            <Typography sx={{ fontWeight: 700, color: dark ? "#F1F5F9" : "#1E293B" }}>
              Textile CRM
            </Typography>
          </div>
          <div
            className="rounded-xl px-3 py-2 text-center"
            style={{
              background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
              border: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <Typography variant="caption" style={{ color: dark ? "#475569" : "#94A3B8" }}>
              Full sidebar in Phase 3
            </Typography>
          </div>
        </div>

        {/* Bottom: user info + logout */}
        <div className="space-y-3">
          <ThemeToggle />

          {appUser && (
            <div
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{
                background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                border: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <Avatar
                sx={{ width: 34, height: 34, fontSize: 14, bgcolor: "#4F8EF7" }}
              >
                {appUser.displayName?.[0]?.toUpperCase() ?? "U"}
              </Avatar>
              <div className="flex-1 min-w-0">
                <Typography
                  variant="body2"
                  noWrap
                  sx={{ fontWeight: 600, color: dark ? "#F1F5F9" : "#1E293B" }}
                >
                  {appUser.displayName}
                </Typography>
                <Typography
                  variant="caption"
                  noWrap
                  style={{ color: dark ? "#475569" : "#94A3B8", textTransform: "capitalize" }}
                >
                  {appUser.role}
                </Typography>
              </div>
            </div>
          )}

          <Button
            fullWidth
            variant="outlined"
            startIcon={<LogoutRounded fontSize="small" />}
            onClick={handleLogout}
            sx={{
              borderRadius: "10px",
              py: 1,
              borderColor: dark ? "rgba(239,68,68,0.3)" : "rgba(239,68,68,0.25)",
              color: "#EF4444",
              fontSize: 13,
              fontWeight: 600,
              "&:hover": {
                borderColor: "#EF4444",
                background: "rgba(239,68,68,0.08)",
              },
            }}
          >
            Sign Out
          </Button>
        </div>
      </aside>

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
