"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Typography, Button, Chip, IconButton, Tooltip, Skeleton, MenuItem, Select } from "@mui/material";
import {
  AddRounded, EditRounded, DeleteRounded,
  PeopleAltRounded, PersonRounded, BusinessRounded,
  SearchRounded,
} from "@mui/icons-material";
import { useThemeStore } from "@/store/useThemeStore";
import { useContacts } from "@/hooks/useContacts";
import { deleteContact } from "@/lib/firebase/contacts";
import { ContactDrawer } from "@/components/contacts/ContactDrawer";
import { DeleteDialog } from "@/components/contacts/DeleteDialog";
import { formatCurrency } from "@/lib/utils";
import { Contact } from "@/types/contact";

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  yarn:      { bg: "rgba(245,158,11,0.15)",  color: "#F59E0B" },
  fabric:    { bg: "rgba(79,142,247,0.15)",  color: "#4F8EF7" },
  garment:   { bg: "rgba(139,92,246,0.15)",  color: "#8B5CF6" },
  retail:    { bg: "rgba(16,185,129,0.15)",  color: "#10B981" },
  wholesale: { bg: "rgba(249,115,22,0.15)",  color: "#F97316" },
  export:    { bg: "rgba(20,184,166,0.15)",  color: "#14B8A6" },
};

export default function ContactsPage() {
  const { mode } = useThemeStore();
  const dark = mode === "dark";
  const { contacts, loading } = useContacts();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "customer" | "supplier">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState<Contact | null>(null);

  const filtered = useMemo(() => contacts.filter((c) => {
    const q = search.toLowerCase();
    return (
      (!search || c.companyName.toLowerCase().includes(q) || c.contactPerson.toLowerCase().includes(q) || c.phone.includes(q)) &&
      (typeFilter === "all" || c.type === typeFilter) &&
      (categoryFilter === "all" || c.category === categoryFilter)
    );
  }), [contacts, search, typeFilter, categoryFilter]);

  const stats = useMemo(() => ({
    total: contacts.length,
    customers: contacts.filter((c) => c.type === "customer").length,
    suppliers: contacts.filter((c) => c.type === "supplier").length,
    revenue: contacts.reduce((s, c) => s + (c.totalRevenue ?? 0), 0),
  }), [contacts]);

  const t = {
    card: dark ? "rgba(15,23,42,0.6)" : "rgba(255,255,255,0.8)",
    border: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    text: dark ? "#F1F5F9" : "#1E293B",
    muted: dark ? "#64748B" : "#94A3B8",
    hover: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
    input: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
  };

  const menuPaper = {
    paper: {
      sx: {
        background: dark ? "rgba(15,23,42,0.95)" : "#fff",
        backdropFilter: "blur(20px)",
        border: `1px solid ${t.border}`,
        borderRadius: 2,
        "& .MuiMenuItem-root": {
          fontSize: 13, color: t.text,
          "&:hover": { background: "rgba(79,142,247,0.1)" },
        },
      },
    },
  };

  const statCards = [
    { label: "Total Contacts", value: stats.total, icon: PeopleAltRounded, color: "#4F8EF7" },
    { label: "Customers",      value: stats.customers, icon: PersonRounded,   color: "#10B981" },
    { label: "Suppliers",      value: stats.suppliers, icon: BusinessRounded, color: "#F59E0B" },
    { label: "Total Revenue",  value: formatCurrency(stats.revenue), icon: null, color: "#8B5CF6" },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Typography sx={{ fontWeight: 700, fontSize: 22, color: t.text }}>Contacts</Typography>
          <Typography sx={{ fontSize: 13, color: t.muted, mt: 0.3 }}>Manage your customers and suppliers</Typography>
        </div>
        <Button variant="contained" startIcon={<AddRounded />}
          onClick={() => { setEditing(null); setDrawerOpen(true); }}
          sx={{
            borderRadius: "10px", fontWeight: 700, px: 2.5,
            background: "linear-gradient(135deg,#4F8EF7,#6366F1)",
            boxShadow: "0 4px 15px rgba(79,142,247,0.3)",
            "&:hover": { background: "linear-gradient(135deg,#3B82F6,#4F46E5)" },
          }}>
          Add Contact
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl p-4"
            style={{ background: t.card, border: `1px solid ${t.border}`, backdropFilter: "blur(20px)" }}>
            <div className="flex items-center justify-between mb-2">
              <Typography sx={{ fontSize: 12, color: t.muted, fontWeight: 600 }}>{s.label}</Typography>
              {s.icon && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20` }}>
                  <s.icon sx={{ fontSize: 16, color: s.color }} />
                </div>
              )}
            </div>
            <Typography sx={{ fontSize: s.label === "Total Revenue" ? 18 : 28, fontWeight: 700, color: t.text }}>
              {loading ? <Skeleton width={60} sx={{ bgcolor: t.border }} /> : s.value}
            </Typography>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl mb-4"
        style={{ background: t.card, border: `1px solid ${t.border}`, backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-2 rounded-xl px-3 flex-1"
          style={{ background: t.input, border: `1px solid ${t.border}`, height: 40, minWidth: 180 }}>
          <SearchRounded sx={{ fontSize: 17, color: t.muted }} />
          <input placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: t.text, width: "100%" }} />
        </div>
        {(["all","customer","supplier"] as const).map((v) => (
          <button key={v} onClick={() => setTypeFilter(v)}
            style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none",
              background: typeFilter === v ? "rgba(79,142,247,0.15)" : t.input,
              color: typeFilter === v ? "#4F8EF7" : t.muted,
              outline: typeFilter === v ? "1px solid rgba(79,142,247,0.3)" : `1px solid ${t.border}`,
            }}>
            {v === "all" ? "All" : v.charAt(0).toUpperCase() + v.slice(1) + "s"}
          </button>
        ))}
        <Select size="small" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          sx={{ minWidth: 140, height: 40, borderRadius: "10px", fontSize: 13, color: t.text, background: t.input,
            "& .MuiOutlinedInput-notchedOutline": { borderColor: t.border },
            "& .MuiSvgIcon-root": { color: t.muted },
          }}
          MenuProps={{ slotProps: menuPaper }}>
          <MenuItem value="all">All Categories</MenuItem>
          {["yarn","fabric","garment","retail","wholesale","export"].map((c) => (
            <MenuItem key={c} value={c} sx={{ textTransform: "capitalize" }}>{c}</MenuItem>
          ))}
        </Select>
        <Typography sx={{ fontSize: 13, color: t.muted, ml: "auto" }}>{filtered.length} of {contacts.length}</Typography>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: t.card, border: `1px solid ${t.border}`, backdropFilter: "blur(20px)" }}>
        <div className="hidden md:grid px-4 py-3"
          style={{ gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr 1fr 80px", gap: 8, borderBottom: `1px solid ${t.border}` }}>
          {["Company", "Contact", "Type", "Category", "City", "Revenue", ""].map((h) => (
            <Typography key={h} sx={{ fontSize: 11, fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</Typography>
          ))}
        </div>

        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-3.5" style={{ borderBottom: `1px solid ${t.border}` }}>
              <Skeleton height={20} sx={{ bgcolor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <PeopleAltRounded sx={{ fontSize: 48, color: t.muted, opacity: 0.3 }} />
            <Typography sx={{ color: t.muted, fontSize: 14 }}>
              {contacts.length === 0 ? "No contacts yet — add your first one!" : "No contacts match your filters."}
            </Typography>
          </div>
        ) : (
          filtered.map((contact, idx) => {
            const cat = CATEGORY_COLORS[contact.category] ?? { bg: "rgba(100,116,139,0.15)", color: "#64748B" };
            return (
              <div key={contact.id}
                className="md:grid px-4 items-center"
                style={{
                  gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr 1fr 80px",
                  gap: 8, padding: "12px 16px",
                  borderBottom: idx < filtered.length - 1 ? `1px solid ${t.border}` : "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = t.hover)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div className="flex items-center gap-2.5 min-w-0 mb-2 md:mb-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                    style={{ background: "linear-gradient(135deg,#4F8EF7,#8B5CF6)" }}>
                    {contact.companyName[0]?.toUpperCase()}
                  </div>
                  <Link href={`/contacts/${contact.id}`} style={{ textDecoration: "none" }}>
                    <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 600, color: t.text, "&:hover": { color: "#4F8EF7" } }}>
                      {contact.companyName}
                    </Typography>
                  </Link>
                </div>
                <Typography noWrap sx={{ fontSize: 13, color: t.muted }}>{contact.contactPerson}</Typography>
                <Chip label={contact.type} size="small" sx={{
                  fontSize: 11, fontWeight: 600, height: 22,
                  background: contact.type === "customer" ? "rgba(79,142,247,0.15)" : "rgba(16,185,129,0.15)",
                  color: contact.type === "customer" ? "#4F8EF7" : "#10B981",
                  textTransform: "capitalize", border: "none",
                }} />
                <Chip label={contact.category} size="small" sx={{
                  fontSize: 11, fontWeight: 600, height: 22,
                  background: cat.bg, color: cat.color,
                  textTransform: "capitalize", border: "none",
                }} />
                <Typography noWrap sx={{ fontSize: 13, color: t.muted }}>{contact.address?.city || "—"}</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: t.text }}>
                  {contact.totalRevenue ? formatCurrency(contact.totalRevenue) : "—"}
                </Typography>
                <div className="flex items-center gap-1">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => { setEditing(contact); setDrawerOpen(true); }}
                      sx={{ color: t.muted, "&:hover": { color: "#4F8EF7", bgcolor: "rgba(79,142,247,0.1)" }, borderRadius: "8px" }}>
                      <EditRounded sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => setDeleting(contact)}
                      sx={{ color: t.muted, "&:hover": { color: "#EF4444", bgcolor: "rgba(239,68,68,0.1)" }, borderRadius: "8px" }}>
                      <DeleteRounded sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ContactDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} editing={editing} />
      {deleting && (
        <DeleteDialog open={!!deleting} contactName={deleting.companyName}
          onClose={() => setDeleting(null)} onConfirm={() => deleteContact(deleting.id)} />
      )}
    </>
  );
}
