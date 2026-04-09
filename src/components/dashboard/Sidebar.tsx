"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { signOut } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  GridViewRounded,
  PeopleAltRounded,
  Inventory2Rounded,
  ShoppingBagRounded,
  AccountBalanceWalletRounded,
  ViewKanbanRounded,
  ChevronLeft,
  ChevronRight,
  LogoutRounded,
  LightMode,
  DarkMode,
} from "@mui/icons-material";

const NAV_ITEMS = [
  { label: "Dashboard",      href: "/dashboard",  icon: GridViewRounded },
  { label: "Contacts",       href: "/contacts",   icon: PeopleAltRounded },
  { label: "Products",       href: "/products",   icon: Inventory2Rounded },
  { label: "Orders",         href: "/orders",     icon: ShoppingBagRounded },
  { label: "Payments",       href: "/payments",   icon: AccountBalanceWalletRounded },
  { label: "Pipeline",       href: "/pipeline",   icon: ViewKanbanRounded },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onCollapse, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { appUser } = useAuthStore();
  const { mode, toggleMode } = useThemeStore();
  const dark = mode === "dark";
  const router = useRouter();

  const dark_ = {
    bg: "rgba(10,17,35,0.9)",
    border: "rgba(255,255,255,0.06)",
    text: "#F1F5F9",
    muted: "#64748B",
    hover: "rgba(255,255,255,0.05)",
    activeBg: "linear-gradient(135deg,rgba(79,142,247,0.18),rgba(99,102,241,0.18))",
    activeColor: "#4F8EF7",
    activeBorder: "#4F8EF7",
  };
  const light_ = {
    bg: "rgba(255,255,255,0.92)",
    border: "rgba(0,0,0,0.06)",
    text: "#1E293B",
    muted: "#94A3B8",
    hover: "rgba(0,0,0,0.04)",
    activeBg: "linear-gradient(135deg,rgba(37,99,235,0.08),rgba(79,70,229,0.08))",
    activeColor: "#2563EB",
    activeBorder: "#2563EB",
  };
  const t = dark ? dark_ : light_;
  const w = collapsed ? 64 : 240;

  async function handleLogout() {
    await signOut();
    router.replace("/login");
  }

  const sidebarContent = (
    <aside
      style={{
        width: w,
        minWidth: w,
        height: "100%",
        background: t.bg,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRight: `1px solid ${t.border}`,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s ease, min-width 0.25s ease",
        overflow: "hidden",
      }}
    >
      {/* ── Logo row ── */}
      <div
        className="flex items-center px-3 py-4 flex-shrink-0"
        style={{
          borderBottom: `1px solid ${t.border}`,
          justifyContent: collapsed ? "center" : "space-between",
        }}
      >
        <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
          <div
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg,#4F8EF7,#8B5CF6)",
              boxShadow: "0 4px 12px rgba(79,142,247,0.35)",
            }}
          >
            <span className="text-white font-bold text-sm">T</span>
          </div>
          {!collapsed && (
            <Typography sx={{ fontWeight: 700, color: t.text, whiteSpace: "nowrap", fontSize: 15 }}>
              Textile CRM
            </Typography>
          )}
        </div>
        {!collapsed && (
          <Tooltip title="Collapse">
            <IconButton size="small" onClick={() => onCollapse(true)}
              sx={{ color: t.muted, flexShrink: 0, "&:hover": { color: t.text } }}>
              <ChevronLeft fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </div>

      {/* ── Expand button (collapsed) ── */}
      {collapsed && (
        <div className="flex justify-center py-2 flex-shrink-0">
          <Tooltip title="Expand" placement="right">
            <IconButton size="small" onClick={() => onCollapse(false)}
              sx={{ color: t.muted, "&:hover": { color: t.text } }}>
              <ChevronRight fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      )}

      {/* ── Navigation label ── */}
      {!collapsed && (
        <div className="px-4 pt-5 pb-1 flex-shrink-0">
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: t.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Menu
          </Typography>
        </div>
      )}
      {collapsed && <div style={{ height: 12 }} />}

      {/* ── Nav items ── */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Tooltip key={href} title={collapsed ? label : ""} placement="right">
              <Link href={href} onClick={onMobileClose}
                style={{ textDecoration: "none", display: "block" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: collapsed ? 0 : 10,
                    justifyContent: collapsed ? "center" : "flex-start",
                    padding: collapsed ? "10px 0" : "9px 12px",
                    borderRadius: 10,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background: active ? t.activeBg : "transparent",
                    borderLeft: active && !collapsed ? `2px solid ${t.activeBorder}` : "2px solid transparent",
                    paddingLeft: !collapsed ? (active ? 10 : 12) : undefined,
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = t.hover; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <Icon sx={{ fontSize: 20, color: active ? t.activeColor : t.muted, flexShrink: 0 }} />
                  {!collapsed && (
                    <Typography sx={{
                      fontSize: 13.5,
                      fontWeight: active ? 600 : 500,
                      color: active ? t.activeColor : t.muted,
                      whiteSpace: "nowrap",
                    }}>
                      {label}
                    </Typography>
                  )}
                </div>
              </Link>
            </Tooltip>
          );
        })}
      </nav>

      {/* ── Bottom section ── */}
      <div className="flex-shrink-0 px-2 py-3 space-y-1.5"
        style={{ borderTop: `1px solid ${t.border}` }}>

        {/* Theme toggle */}
        <Tooltip title={collapsed ? (mode === "dark" ? "Light mode" : "Dark mode") : ""} placement="right">
          <div
            role="button"
            tabIndex={0}
            onClick={toggleMode}
            onKeyDown={e => e.key === "Enter" && toggleMode()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: collapsed ? 0 : 10,
              justifyContent: collapsed ? "center" : "flex-start",
              padding: collapsed ? "9px 0" : "9px 12px",
              borderRadius: 10,
              cursor: "pointer",
              background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
              border: `1px solid ${t.border}`,
              transition: "all 0.15s",
              userSelect: "none",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = t.hover; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"; }}
          >
            {mode === "dark"
              ? <LightMode sx={{ fontSize: 18, color: t.muted, flexShrink: 0 }} />
              : <DarkMode sx={{ fontSize: 18, color: t.muted, flexShrink: 0 }} />}
            {!collapsed && (
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: t.muted, whiteSpace: "nowrap" }}>
                {mode === "dark" ? "Light mode" : "Dark mode"}
              </Typography>
            )}
          </div>
        </Tooltip>

        {/* User card */}
        {appUser && (
          <Tooltip title={collapsed ? `${appUser.displayName} · ${appUser.role}` : ""} placement="right">
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: collapsed ? 0 : 10,
              justifyContent: collapsed ? "center" : "flex-start",
              padding: collapsed ? "6px 0" : "8px 10px",
              borderRadius: 10,
              background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
              border: `1px solid ${t.border}`,
            }}>
              <Avatar sx={{ width: 30, height: 30, fontSize: 12, bgcolor: "#4F8EF7", flexShrink: 0 }}>
                {appUser.displayName?.[0]?.toUpperCase() ?? "U"}
              </Avatar>
              {!collapsed && (
                <div className="min-w-0">
                  <Typography noWrap sx={{ fontSize: 12.5, fontWeight: 600, color: t.text, lineHeight: 1.3 }}>
                    {appUser.displayName}
                  </Typography>
                  <Typography noWrap sx={{ fontSize: 11, color: t.muted, textTransform: "capitalize" }}>
                    {appUser.role}
                  </Typography>
                </div>
              )}
            </div>
          </Tooltip>
        )}

        {/* Logout */}
        <Tooltip title={collapsed ? "Sign out" : ""} placement="right">
          <div
            role="button"
            tabIndex={0}
            onClick={handleLogout}
            onKeyDown={e => e.key === "Enter" && handleLogout()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: collapsed ? 0 : 10,
              justifyContent: collapsed ? "center" : "flex-start",
              padding: collapsed ? "9px 0" : "9px 12px",
              borderRadius: 10,
              cursor: "pointer",
              background: "rgba(239,68,68,0.05)",
              border: "1px solid rgba(239,68,68,0.12)",
              transition: "all 0.15s",
              userSelect: "none",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.3)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.05)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.12)";
            }}
          >
            <LogoutRounded sx={{ fontSize: 18, color: "#EF4444", flexShrink: 0 }} />
            {!collapsed && (
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#EF4444", whiteSpace: "nowrap" }}>
                Sign Out
              </Typography>
            )}
          </div>
        </Tooltip>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-full flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden" style={{ width: 240 }}>
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
