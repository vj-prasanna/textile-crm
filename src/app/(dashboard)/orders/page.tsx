"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Typography, Button, Chip, IconButton, Tooltip, Skeleton, MenuItem, Select, Menu,
} from "@mui/material";
import {
  AddRounded, EditRounded, DeleteRounded, SearchRounded,
  ReceiptLongRounded, PendingActionsRounded, LocalShippingRounded,
  CheckCircleOutlineRounded, OpenInNewRounded,
} from "@mui/icons-material";
import { useThemeStore } from "@/store/useThemeStore";
import { useOrders } from "@/hooks/useOrders";
import { deleteOrder, updateOrderStatus } from "@/lib/firebase/orders";
import { OrderDrawer } from "@/components/orders/OrderDrawer";
import { DeleteDialog } from "@/components/orders/DeleteDialog";
import { Order } from "@/types/order";
import { formatCurrency, formatDate } from "@/lib/utils";

/* ─── Config ─────────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<Order["status"], { label: string; color: string; bg: string }> = {
  draft:         { label: "Draft",         color: "#94A3B8", bg: "rgba(148,163,184,0.15)" },
  confirmed:     { label: "Confirmed",     color: "#4F8EF7", bg: "rgba(79,142,247,0.15)"  },
  in_production: { label: "In Production", color: "#F59E0B", bg: "rgba(245,158,11,0.15)"  },
  dispatched:    { label: "Dispatched",    color: "#14B8A6", bg: "rgba(20,184,166,0.15)"  },
  delivered:     { label: "Delivered",     color: "#10B981", bg: "rgba(16,185,129,0.15)"  },
  cancelled:     { label: "Cancelled",     color: "#EF4444", bg: "rgba(239,68,68,0.15)"   },
};

const PAYMENT_CONFIG: Record<Order["paymentStatus"], { label: string; color: string; bg: string }> = {
  unpaid:  { label: "Unpaid",  color: "#EF4444", bg: "rgba(239,68,68,0.15)"   },
  partial: { label: "Partial", color: "#F59E0B", bg: "rgba(245,158,11,0.15)"  },
  paid:    { label: "Paid",    color: "#10B981", bg: "rgba(16,185,129,0.15)"  },
};

const NEXT_STATUSES: Partial<Record<Order["status"], Order["status"][]>> = {
  draft:         ["confirmed", "cancelled"],
  confirmed:     ["in_production", "cancelled"],
  in_production: ["dispatched", "cancelled"],
  dispatched:    ["delivered"],
};

/* ─── Status menu ─────────────────────────────────────────────────── */
function StatusMenu({ order, dark, borderColor }: { order: Order; dark: boolean; borderColor: string }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const cfg = STATUS_CONFIG[order.status];
  const nexts = NEXT_STATUSES[order.status] ?? [];

  if (nexts.length === 0) {
    return (
      <Chip label={cfg.label} size="small"
        sx={{ fontSize: 11, fontWeight: 600, height: 22, background: cfg.bg, color: cfg.color, border: "none" }} />
    );
  }

  return (
    <>
      <Chip
        label={cfg.label}
        size="small"
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ fontSize: 11, fontWeight: 600, height: 22, background: cfg.bg, color: cfg.color, border: "none", cursor: "pointer" }}
      />
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              background: dark ? "rgba(15,23,42,0.97)" : "#fff",
              backdropFilter: "blur(20px)",
              border: `1px solid ${borderColor}`,
              borderRadius: "12px",
              minWidth: 160,
            },
          },
        }}
      >
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: dark ? "#64748B" : "#94A3B8", px: 2, pt: 1, pb: 0.5, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Move to
        </Typography>
        {nexts.map((s) => {
          const c = STATUS_CONFIG[s];
          return (
            <MenuItem key={s} onClick={() => { updateOrderStatus(order.id, s); setAnchor(null); }}
              sx={{ fontSize: 13, color: c.color, fontWeight: 600, py: 1, "&:hover": { background: c.bg } }}>
              {c.label}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────── */
export default function OrdersPage() {
  const { mode } = useThemeStore();
  const dark = mode === "dark";
  const { orders, loading } = useOrders();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Order["status"] | "all">("all");
  const [paymentFilter, setPaymentFilter] = useState<Order["paymentStatus"] | "all">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState<Order | null>(null);

  const filtered = useMemo(() => orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      (!search || o.orderNumber.toLowerCase().includes(q) || o.contactName.toLowerCase().includes(q)) &&
      (statusFilter === "all" || o.status === statusFilter) &&
      (paymentFilter === "all" || o.paymentStatus === paymentFilter)
    );
  }), [orders, search, statusFilter, paymentFilter]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === "draft" || o.status === "confirmed").length,
    inProd: orders.filter((o) => o.status === "in_production").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  }), [orders]);

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
    { label: "Total Orders",  value: stats.total,     icon: ReceiptLongRounded,       color: "#4F8EF7" },
    { label: "Pending",       value: stats.pending,   icon: PendingActionsRounded,     color: "#F59E0B" },
    { label: "In Production", value: stats.inProd,    icon: LocalShippingRounded,      color: "#14B8A6" },
    { label: "Delivered",     value: stats.delivered, icon: CheckCircleOutlineRounded, color: "#10B981" },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Typography sx={{ fontWeight: 700, fontSize: 22, color: t.text }}>Orders</Typography>
          <Typography sx={{ fontSize: 13, color: t.muted, mt: 0.3 }}>Track and manage customer orders</Typography>
        </div>
        <Button variant="contained" startIcon={<AddRounded />}
          onClick={() => { setEditing(null); setDrawerOpen(true); }}
          sx={{ borderRadius: "10px", fontWeight: 700, px: 2.5, background: "linear-gradient(135deg,#4F8EF7,#6366F1)", boxShadow: "0 4px 15px rgba(79,142,247,0.3)", "&:hover": { background: "linear-gradient(135deg,#3B82F6,#4F46E5)" } }}>
          New Order
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
            <Typography sx={{ fontSize: 28, fontWeight: 700, color: t.text }}>
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
          <input placeholder="Search orders or contacts..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: t.text, width: "100%" }} />
        </div>

        <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          sx={{ minWidth: 150, height: 40, borderRadius: "10px", fontSize: 13, color: t.text, background: t.input, "& .MuiOutlinedInput-notchedOutline": { borderColor: t.border }, "& .MuiSvgIcon-root": { color: t.muted } }}
          MenuProps={{ slotProps: menuPaper }}>
          <MenuItem value="all">All Statuses</MenuItem>
          {(Object.keys(STATUS_CONFIG) as Order["status"][]).map((s) => (
            <MenuItem key={s} value={s}>{STATUS_CONFIG[s].label}</MenuItem>
          ))}
        </Select>

        <Select size="small" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value as typeof paymentFilter)}
          sx={{ minWidth: 130, height: 40, borderRadius: "10px", fontSize: 13, color: t.text, background: t.input, "& .MuiOutlinedInput-notchedOutline": { borderColor: t.border }, "& .MuiSvgIcon-root": { color: t.muted } }}
          MenuProps={{ slotProps: menuPaper }}>
          <MenuItem value="all">All Payments</MenuItem>
          {(["unpaid", "partial", "paid"] as const).map((s) => (
            <MenuItem key={s} value={s}>{PAYMENT_CONFIG[s].label}</MenuItem>
          ))}
        </Select>

        <Typography sx={{ fontSize: 13, color: t.muted, ml: "auto" }}>{filtered.length} of {orders.length}</Typography>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: t.card, border: `1px solid ${t.border}`, backdropFilter: "blur(20px)" }}>
        <div className="hidden lg:grid px-4 py-3"
          style={{ gridTemplateColumns: "1.2fr 1.8fr 0.7fr 1.2fr 1fr 1fr 1fr 100px", gap: 8, borderBottom: `1px solid ${t.border}` }}>
          {["Order #", "Contact", "Items", "Total", "Status", "Payment", "Date", ""].map((h) => (
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
            <ReceiptLongRounded sx={{ fontSize: 48, color: t.muted, opacity: 0.3 }} />
            <Typography sx={{ color: t.muted, fontSize: 14 }}>
              {orders.length === 0 ? "No orders yet — create your first one!" : "No orders match your filters."}
            </Typography>
          </div>
        ) : (
          filtered.map((order, idx) => {
            const pay = PAYMENT_CONFIG[order.paymentStatus];
            return (
              <div key={order.id}
                className="lg:grid px-4 items-center"
                style={{ gridTemplateColumns: "1.2fr 1.8fr 0.7fr 1.2fr 1fr 1fr 1fr 100px", gap: 8, padding: "12px 16px", borderBottom: idx < filtered.length - 1 ? `1px solid ${t.border}` : "none", transition: "background 0.15s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = t.hover)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#4F8EF7", fontFamily: "monospace" }}>
                  {order.orderNumber}
                </Typography>
                <Typography noWrap sx={{ fontSize: 13, fontWeight: 600, color: t.text }}>{order.contactName}</Typography>
                <Typography sx={{ fontSize: 13, color: t.muted }}>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: t.text }}>{formatCurrency(order.grandTotal)}</Typography>
                <StatusMenu order={order} dark={dark} borderColor={t.border} />
                <Chip label={pay.label} size="small"
                  sx={{ fontSize: 11, fontWeight: 600, height: 22, background: pay.bg, color: pay.color, border: "none" }} />
                <Typography sx={{ fontSize: 12, color: t.muted }}>{formatDate(order.createdAt)}</Typography>
                <div className="flex items-center gap-1">
                  <Tooltip title="View">
                    <Link href={`/orders/${order.id}`}>
                      <IconButton size="small"
                        sx={{ color: t.muted, "&:hover": { color: "#4F8EF7", bgcolor: "rgba(79,142,247,0.1)" }, borderRadius: "8px" }}>
                        <OpenInNewRounded sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Link>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => { setEditing(order); setDrawerOpen(true); }}
                      sx={{ color: t.muted, "&:hover": { color: "#4F8EF7", bgcolor: "rgba(79,142,247,0.1)" }, borderRadius: "8px" }}>
                      <EditRounded sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => setDeleting(order)}
                      sx={{ color: t.muted, "&:hover": { color: "#EF4444", bgcolor: "rgba(239,68,68,0.1)" }, borderRadius: "8px" }}>
                      <DeleteRounded sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            );
          })
        )}
      </div>

      <OrderDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} editing={editing} />
      {deleting && (
        <DeleteDialog open={!!deleting} orderNumber={deleting.orderNumber}
          onClose={() => setDeleting(null)} onConfirm={() => deleteOrder(deleting.id)} />
      )}
    </>
  );
}
