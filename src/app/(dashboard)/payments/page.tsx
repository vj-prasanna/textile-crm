"use client";

import { useState, useMemo } from "react";
import {
  Typography, Button, Chip, IconButton, Tooltip, Skeleton, MenuItem, Select,
} from "@mui/material";
import {
  AddRounded, DeleteRounded, SearchRounded,
  AccountBalanceWalletRounded, TrendingUpRounded,
  ReceiptLongRounded, PendingActionsRounded,
} from "@mui/icons-material";
import { useThemeStore } from "@/store/useThemeStore";
import { usePayments } from "@/hooks/usePayments";
import { deletePayment } from "@/lib/firebase/payments";
import { PaymentDrawer } from "@/components/payments/PaymentDrawer";
import { DeleteDialog } from "@/components/payments/DeleteDialog";
import { Payment } from "@/types/payment";
import { formatCurrency, formatDate } from "@/lib/utils";

/* ─── Config ─────────────────────────────────────────────────────── */
const METHOD_CONFIG: Record<Payment["method"], { label: string; color: string; bg: string }> = {
  cash:          { label: "Cash",          color: "#10B981", bg: "rgba(16,185,129,0.15)"  },
  bank_transfer: { label: "Bank Transfer", color: "#4F8EF7", bg: "rgba(79,142,247,0.15)"  },
  upi:           { label: "UPI",           color: "#8B5CF6", bg: "rgba(139,92,246,0.15)"  },
  cheque:        { label: "Cheque",        color: "#F59E0B", bg: "rgba(245,158,11,0.15)"  },
  credit:        { label: "Credit",        color: "#EF4444", bg: "rgba(239,68,68,0.15)"   },
};

function thisMonthTotal(payments: Payment[]) {
  const now = new Date();
  return payments
    .filter((p) => {
      const d = p.date?.toDate?.() ?? new Date(0);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, p) => s + p.amount, 0);
}

export default function PaymentsPage() {
  const { mode } = useThemeStore();
  const dark = mode === "dark";
  const { payments, loading } = usePayments();

  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<Payment["method"] | "all">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleting, setDeleting] = useState<Payment | null>(null);

  const filtered = useMemo(() => payments.filter((p) => {
    const q = search.toLowerCase();
    return (
      (!search || p.orderNumber.toLowerCase().includes(q) || p.contactName.toLowerCase().includes(q) || (p.reference ?? "").toLowerCase().includes(q)) &&
      (methodFilter === "all" || p.method === methodFilter)
    );
  }), [payments, search, methodFilter]);

  const stats = useMemo(() => ({
    total: payments.reduce((s, p) => s + p.amount, 0),
    count: payments.length,
    thisMonth: thisMonthTotal(payments),
    byMethod: Object.fromEntries(
      (["cash", "bank_transfer", "upi", "cheque", "credit"] as Payment["method"][]).map((m) => [
        m,
        payments.filter((p) => p.method === m).reduce((s, p) => s + p.amount, 0),
      ])
    ),
  }), [payments]);

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
        "& .MuiMenuItem-root": { fontSize: 13, color: t.text, "&:hover": { background: "rgba(79,142,247,0.1)" } },
      },
    },
  };

  const statCards = [
    { label: "Total Collected",  value: formatCurrency(stats.total),      icon: AccountBalanceWalletRounded, color: "#10B981" },
    { label: "This Month",       value: formatCurrency(stats.thisMonth),   icon: TrendingUpRounded,           color: "#4F8EF7" },
    { label: "Total Payments",   value: stats.count,                       icon: ReceiptLongRounded,          color: "#8B5CF6" },
    { label: "Pending (UPI)",    value: formatCurrency(stats.byMethod.upi ?? 0), icon: PendingActionsRounded, color: "#F59E0B" },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Typography sx={{ fontWeight: 700, fontSize: 22, color: t.text }}>Payments</Typography>
          <Typography sx={{ fontSize: 13, color: t.muted, mt: 0.3 }}>Track all payment records</Typography>
        </div>
        <Button variant="contained" startIcon={<AddRounded />}
          onClick={() => setDrawerOpen(true)}
          sx={{ borderRadius: "10px", fontWeight: 700, px: 2.5, background: "linear-gradient(135deg,#4F8EF7,#6366F1)", boxShadow: "0 4px 15px rgba(79,142,247,0.3)", "&:hover": { background: "linear-gradient(135deg,#3B82F6,#4F46E5)" } }}>
          Record Payment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: t.card, border: `1px solid ${t.border}`, backdropFilter: "blur(20px)" }}>
            <div className="flex items-center justify-between mb-2">
              <Typography sx={{ fontSize: 12, color: t.muted, fontWeight: 600 }}>{s.label}</Typography>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20` }}>
                <s.icon sx={{ fontSize: 16, color: s.color }} />
              </div>
            </div>
            <Typography sx={{ fontSize: typeof s.value === "string" ? 18 : 28, fontWeight: 700, color: t.text }}>
              {loading ? <Skeleton width={80} sx={{ bgcolor: t.border }} /> : s.value}
            </Typography>
          </div>
        ))}
      </div>

      {/* Method breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        {(Object.entries(METHOD_CONFIG) as [Payment["method"], typeof METHOD_CONFIG[Payment["method"]]][]).map(([m, cfg]) => (
          <div key={m} className="rounded-xl p-3 text-center" style={{ background: t.card, border: `1px solid ${t.border}` }}>
            <Chip label={cfg.label} size="small" sx={{ fontSize: 10, fontWeight: 700, height: 20, background: cfg.bg, color: cfg.color, border: "none", mb: 1 }} />
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: t.text }}>
              {loading ? "—" : formatCurrency(stats.byMethod[m] ?? 0)}
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
          <input placeholder="Search order, contact or reference..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: t.text, width: "100%" }} />
        </div>

        <Select size="small" value={methodFilter} onChange={(e) => setMethodFilter(e.target.value as typeof methodFilter)}
          sx={{ minWidth: 160, height: 40, borderRadius: "10px", fontSize: 13, color: t.text, background: t.input, "& .MuiOutlinedInput-notchedOutline": { borderColor: t.border }, "& .MuiSvgIcon-root": { color: t.muted } }}
          MenuProps={{ slotProps: menuPaper }}>
          <MenuItem value="all">All Methods</MenuItem>
          {(Object.entries(METHOD_CONFIG) as [Payment["method"], typeof METHOD_CONFIG[Payment["method"]]][]).map(([m, cfg]) => (
            <MenuItem key={m} value={m}>{cfg.label}</MenuItem>
          ))}
        </Select>

        <Typography sx={{ fontSize: 13, color: t.muted, ml: "auto" }}>{filtered.length} of {payments.length}</Typography>
      </div>

      {/* Payment log table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: t.card, border: `1px solid ${t.border}`, backdropFilter: "blur(20px)" }}>
        <div className="hidden lg:grid px-4 py-3"
          style={{ gridTemplateColumns: "1.2fr 1.8fr 1.5fr 1fr 1.2fr 1.2fr 60px", gap: 8, borderBottom: `1px solid ${t.border}` }}>
          {["Date", "Contact", "Order #", "Method", "Reference", "Amount", ""].map((h) => (
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
            <AccountBalanceWalletRounded sx={{ fontSize: 48, color: t.muted, opacity: 0.3 }} />
            <Typography sx={{ color: t.muted, fontSize: 14 }}>
              {payments.length === 0 ? "No payments yet — record your first one!" : "No payments match your filters."}
            </Typography>
          </div>
        ) : (
          filtered.map((payment, idx) => {
            const mc = METHOD_CONFIG[payment.method];
            return (
              <div key={payment.id}
                className="lg:grid px-4 items-center"
                style={{ gridTemplateColumns: "1.2fr 1.8fr 1.5fr 1fr 1.2fr 1.2fr 60px", gap: 8, padding: "12px 16px", borderBottom: idx < filtered.length - 1 ? `1px solid ${t.border}` : "none", transition: "background 0.15s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = t.hover)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
              >
                <Typography sx={{ fontSize: 12, color: t.muted }}>{formatDate(payment.date)}</Typography>
                <Typography noWrap sx={{ fontSize: 13, fontWeight: 600, color: t.text }}>{payment.contactName}</Typography>
                <Typography sx={{ fontSize: 12, color: "#4F8EF7", fontFamily: "monospace", fontWeight: 700 }}>{payment.orderNumber}</Typography>
                <Chip label={mc.label} size="small" sx={{ fontSize: 11, fontWeight: 600, height: 22, background: mc.bg, color: mc.color, border: "none" }} />
                <Typography noWrap sx={{ fontSize: 12, color: t.muted, fontFamily: "monospace" }}>{payment.reference || "—"}</Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#10B981" }}>{formatCurrency(payment.amount)}</Typography>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => setDeleting(payment)}
                    sx={{ color: t.muted, "&:hover": { color: "#EF4444", bgcolor: "rgba(239,68,68,0.1)" }, borderRadius: "8px" }}>
                    <DeleteRounded sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              </div>
            );
          })
        )}
      </div>

      <PaymentDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      {deleting && (
        <DeleteDialog
          open={!!deleting}
          amount={formatCurrency(deleting.amount)}
          onClose={() => setDeleting(null)}
          onConfirm={() => deletePayment(deleting.id)}
        />
      )}
    </>
  );
}
