"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useThemeStore } from "@/store/useThemeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useContactStore } from "@/store/useContactStore";
import { signOut } from "@/lib/firebase/auth";
import {
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
} from "@mui/material";
import {
  MenuRounded,
  SearchRounded,
  CloseRounded,
  LogoutRounded,
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
  onMenuToggle: () => void;
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { mode } = useThemeStore();
  const { appUser } = useAuthStore();
  // Read contacts from shared Zustand store (subscribed once in layout)
  const { contacts } = useContactStore();
  const dark = mode === "dark";

  /* ── search ── */
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  /* ── profile menu ── */
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);

  /* ── theme tokens ── */
  const borderColor = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const bg = dark ? "rgba(10,17,35,0.85)" : "rgba(255,255,255,0.85)";
  const textPrimary = dark ? "#F1F5F9" : "#1E293B";
  const textMuted = dark ? "#64748B" : "#94A3B8";
  const inputBg = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const dropdownBg = dark ? "rgba(8,14,32,0.98)" : "#ffffff";

  /* ── search results ── */
  const results =
    query.trim().length > 0
      ? contacts
          .filter(
            (c) =>
              c.companyName.toLowerCase().includes(query.toLowerCase()) ||
              c.contactPerson.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 6)
      : [];

  /* ── close search on outside click ── */
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  async function handleLogout() {
    setProfileAnchor(null);
    await signOut();
    router.push("/login");
  }

  const title = PAGE_TITLES[pathname] ?? "";

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
        position: "relative",
        zIndex: 30,
      }}
    >
      {/* ── Hamburger — always visible, toggles sidebar on all screen sizes ── */}
      <IconButton
        size="small"
        onClick={onMenuToggle}
        sx={{
          color: textMuted,
          flexShrink: 0,
          "&:hover": { color: textPrimary, background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" },
          transition: "color 0.15s",
        }}
      >
        <MenuRounded />
      </IconButton>

      {/* ── Page title ── */}
      <Typography
        sx={{ fontWeight: 700, fontSize: { xs: 16, sm: 18 }, color: textPrimary, flexShrink: 0 }}
      >
        {title}
      </Typography>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── Search ── */}
      <div ref={searchRef} className="relative hidden sm:block">
        <div
          className="flex items-center gap-2 rounded-xl px-3"
          style={{
            background: inputBg,
            border: `1px solid ${searchOpen || query ? "#4F8EF7" : borderColor}`,
            height: 38,
            width: 230,
            transition: "border-color 0.2s",
          }}
        >
          <SearchRounded sx={{ fontSize: 17, color: textMuted, flexShrink: 0 }} />
          <input
            placeholder="Search contacts..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 13,
              color: textPrimary,
              width: "100%",
            }}
          />
          {query && (
            <CloseRounded
              sx={{ fontSize: 15, color: textMuted, cursor: "pointer", flexShrink: 0 }}
              onClick={() => {
                setQuery("");
                setSearchOpen(false);
              }}
            />
          )}
        </div>

        {/* Search dropdown */}
        {searchOpen && query.trim().length > 0 && (
          <div
            className="absolute top-11 left-0 w-72 rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: dropdownBg,
              border: `1px solid ${borderColor}`,
              backdropFilter: "blur(20px)",
              zIndex: 50,
            }}
          >
            {results.length > 0 ? (
              <>
                <div className="px-3 pt-2.5 pb-1">
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Contacts
                  </Typography>
                </div>
                {results.map((c) => (
                  <Link
                    key={c.id}
                    href={`/contacts/${c.id}`}
                    onClick={() => {
                      setQuery("");
                      setSearchOpen(false);
                    }}
                  >
                    <div
                      className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                      style={{ transition: "background 0.12s" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = dark
                          ? "rgba(79,142,247,0.1)"
                          : "rgba(79,142,247,0.07)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: "rgba(79,142,247,0.15)", color: "#4F8EF7" }}
                      >
                        {c.companyName[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <Typography
                          sx={{ fontSize: 13, fontWeight: 600, color: textPrimary, lineHeight: 1.3 }}
                          noWrap
                        >
                          {c.companyName}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: textMuted, lineHeight: 1.3 }} noWrap>
                          {c.type} · {c.category}
                        </Typography>
                      </div>
                    </div>
                  </Link>
                ))}
                <div style={{ height: 6 }} />
              </>
            ) : (
              <div className="px-4 py-5 text-center">
                <Typography sx={{ fontSize: 13, color: textMuted }}>
                  No results for &quot;{query}&quot;
                </Typography>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Profile avatar ── */}
      <Avatar
        onClick={(e) => setProfileAnchor(e.currentTarget)}
        sx={{
          width: 34,
          height: 34,
          fontSize: 13,
          fontWeight: 700,
          bgcolor: "#4F8EF7",
          flexShrink: 0,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(79,142,247,0.35)",
          transition: "box-shadow 0.2s, transform 0.15s",
          "&:hover": {
            boxShadow: "0 4px 14px rgba(79,142,247,0.55)",
            transform: "scale(1.05)",
          },
        }}
      >
        {appUser?.displayName?.[0]?.toUpperCase() ?? "U"}
      </Avatar>

      {/* ── Profile dropdown ── */}
      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => setProfileAnchor(null)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 220,
              borderRadius: "14px",
              background: dropdownBg,
              border: `1px solid ${borderColor}`,
              backdropFilter: "blur(20px)",
              boxShadow: dark
                ? "0 20px 60px rgba(0,0,0,0.5)"
                : "0 12px 40px rgba(0,0,0,0.12)",
            },
          },
        }}
      >
        {/* User info */}
        <div className="px-4 py-3">
          <Typography sx={{ fontWeight: 700, fontSize: 14, color: textPrimary }}>
            {appUser?.displayName ?? "User"}
          </Typography>
          <Typography sx={{ fontSize: 12, color: textMuted, mt: 0.25 }}>
            {appUser?.email ?? ""}
          </Typography>
          {appUser?.role && (
            <div
              className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-md"
              style={{ background: "rgba(79,142,247,0.12)" }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#4F8EF7",
                  textTransform: "capitalize",
                }}
              >
                {appUser.role}
              </Typography>
            </div>
          )}
        </div>

        <Divider sx={{ borderColor, mx: 1.5 }} />

        <div style={{ padding: "4px 6px" }}>
          <MenuItem
            onClick={handleLogout}
            sx={{
              borderRadius: "10px",
              color: "#EF4444",
              gap: 1,
              "&:hover": { background: "rgba(239,68,68,0.08)" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 0 }}>
              <LogoutRounded sx={{ fontSize: 17, color: "#EF4444" }} />
            </ListItemIcon>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Sign out</Typography>
          </MenuItem>
        </div>
      </Menu>
    </header>
  );
}
