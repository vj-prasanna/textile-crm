"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Typography, Chip, Button, IconButton, Skeleton, Divider,
} from "@mui/material";
import {
  ArrowBackRounded, EditRounded, CheckRounded, CancelRounded,
  ReceiptLongRounded, PersonRounded,
} from "@mui/icons-material";
import { useThemeStore } from "@/store/useThemeStore";
import { getOrder, updateOrderStatus } from "@/lib/firebase/orders";
import { OrderDrawer } from "@/components/orders/OrderDrawer";
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

// Ordered pipeline (excluding cancelled — it branches off)
const PIPELINE: Order["status"][] = ["draft", "confirmed", "in_production", "dispatched", "delivered"];

const NEXT_STATUSES: Partial<Record<Order["status"], Order["status"][]>> = {
  draft:         ["confirmed", "cancelled"],
  confirmed:     ["in_production", "cancelled"],
  in_production: ["dispatched", "cancelled"],
  dispatched:    ["delivered"],
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { mode } = useThemeStore();
  const dark = mode === "dark";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState<Order["status"] | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getOrder(id).then((o) => { setOrder(o); setLoading(false); });
  }, [id]);

  async function handleStatusUpdate(status: Order["status"]) {
    if (!order) return;
    setUpdating(status);
    try {
      await updateOrderStatus(order.id, status);
      setOrder((prev) => prev ? { ...prev, status } : null);
    } finally {
      setUpdating(null);
    }
  }

  const t = {
    card: dark ? "rgba(15,23,42,0.6)" : "rgba(255,255,255,0.8)",
    border: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    text: dark ? "#F1F5F9" : "#1E293B",
    muted: dark ? "#64748B" : "#94A3B8",
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: "16px", bgcolor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: "16px", bgcolor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />
        <Skeleton variant="rectangular" height={240} sx={{ borderRadius: "16px", bgcolor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <ReceiptLongRounded sx={{ fontSize: 48, color: t.muted, opacity: 0.3 }} />
        <Typography sx={{ color: t.muted }}>Order not found.</Typography>
        <Button onClick={() => router.push("/orders")} startIcon={<ArrowBackRounded />}
          sx={{ color: "#4F8EF7" }}>Back to Orders</Button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[order.status];
  const paymentCfg = PAYMENT_CONFIG[order.paymentStatus];
  const currentStep = PIPELINE.indexOf(order.status);
  const nexts = NEXT_STATUSES[order.status] ?? [];
  const isCancelled = order.status === "cancelled";

  return (
    <>
      {/* Back + header */}
      <div className="flex items-center gap-3 mb-6">
        <IconButton onClick={() => router.push("/orders")}
          sx={{ color: t.muted, background: t.card, border: `1px solid ${t.border}`, borderRadius: "10px", "&:hover": { color: t.text } }}>
          <ArrowBackRounded fontSize="small" />
        </IconButton>
        <div className="flex-1">
          <Typography sx={{ fontWeight: 700, fontSize: 20, color: t.text, fontFamily: "monospace" }}>{order.orderNumber}</Typography>
          <Typography sx={{ fontSize: 13, color: t.muted }}>{formatDate(order.createdAt)}</Typography>
        </div>
        <Chip label={statusCfg.label} sx={{ fontWeight: 700, background: statusCfg.bg, color: statusCfg.color, border: "none" }} />
        <Chip label={paymentCfg.label} sx={{ fontWeight: 700, background: paymentCfg.bg, color: paymentCfg.color, border: "none" }} />
        <IconButton onClick={() => setEditing(true)}
          sx={{ color: "#4F8EF7", background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)", borderRadius: "10px", "&:hover": { background: "rgba(79,142,247,0.2)" } }}>
          <EditRounded fontSize="small" />
        </IconButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column — main info */}
        <div className="lg:col-span-2 space-y-4">

          {/* Status timeline */}
          <div className="rounded-2xl p-5" style={{ background: t.card, border: `1px solid ${t.border}`, backdropFilter: "blur(20px)" }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: "0.07em", mb: 3 }}>
              Status Timeline
            </Typography>

            {isCancelled ? (
              <div className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.15)" }}>
                  <CancelRounded sx={{ fontSize: 16, color: "#EF4444" }} />
                </div>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#EF4444" }}>Order Cancelled</Typography>
              </div>
            ) : (
              <div className="flex items-center gap-0">
                {PIPELINE.map((step, i) => {
                  const reached = currentStep >= i;
                  const isCurrent = currentStep === i;
                  const cfg = STATUS_CONFIG[step];
                  return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      {/* Step node */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                          style={{
                            background: reached ? cfg.bg : (dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"),
                            border: `2px solid ${reached ? cfg.color : (dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")}`,
                            boxShadow: isCurrent ? `0 0 0 4px ${cfg.color}25` : "none",
                          }}
                        >
                          {reached && !isCurrent
                            ? <CheckRounded sx={{ fontSize: 14, color: cfg.color }} />
                            : <div className="w-2 h-2 rounded-full" style={{ background: reached ? cfg.color : (dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)") }} />
                          }
                        </div>
                        <Typography sx={{ fontSize: 10, fontWeight: 600, color: reached ? cfg.color : t.muted, textAlign: "center", lineHeight: 1.2, whiteSpace: "nowrap" }}>
                          {cfg.label}
                        </Typography>
                      </div>
                      {/* Connector */}
                      {i < PIPELINE.length - 1 && (
                        <div className="flex-1 h-0.5 mx-1 mb-4" style={{ background: currentStep > i ? STATUS_CONFIG[PIPELINE[i + 1]].color : (dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)") }} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Action buttons */}
            {nexts.length > 0 && (
              <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: `1px solid ${t.border}` }}>
                {nexts.map((s) => {
                  const c = STATUS_CONFIG[s];
                  const isCancel = s === "cancelled";
                  return (
                    <Button key={s} size="small" variant={isCancel ? "outlined" : "contained"}
                      disabled={updating !== null}
                      onClick={() => handleStatusUpdate(s)}
                      sx={{
                        borderRadius: "8px", fontWeight: 600, fontSize: 12,
                        ...(isCancel ? {
                          color: "#EF4444", borderColor: "rgba(239,68,68,0.3)",
                          "&:hover": { borderColor: "#EF4444", background: "rgba(239,68,68,0.08)" },
                        } : {
                          background: `linear-gradient(135deg,${c.color},${c.color}cc)`,
                          "&:hover": { background: c.color },
                        }),
                      }}>
                      {updating === s ? "Updating…" : `Mark as ${c.label}`}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Line items */}
          <div className="rounded-2xl overflow-hidden" style={{ background: t.card, border: `1px solid ${t.border}`, backdropFilter: "blur(20px)" }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${t.border}` }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: t.text }}>Order Items</Typography>
            </div>
            {/* Header */}
            <div className="grid px-5 py-2" style={{ gridTemplateColumns: "3fr 1fr 1.5fr 1.5fr", gap: 8, borderBottom: `1px solid ${t.border}` }}>
              {["Product", "Qty", "Price/Unit", "Total"].map((h) => (
                <Typography key={h} sx={{ fontSize: 11, fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</Typography>
              ))}
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} className="grid px-5 items-center"
                style={{ gridTemplateColumns: "3fr 1fr 1.5fr 1.5fr", gap: 8, padding: "12px 20px", borderBottom: idx < order.items.length - 1 ? `1px solid ${t.border}` : "none" }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: t.text }}>{item.productName}</Typography>
                <Typography sx={{ fontSize: 13, color: t.muted }}>{item.quantity}</Typography>
                <Typography sx={{ fontSize: 13, color: t.muted }}>{formatCurrency(item.pricePerUnit)}</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: t.text }}>{formatCurrency(item.total)}</Typography>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — summary + contact */}
        <div className="space-y-4">

          {/* Financial summary */}
          <div className="rounded-2xl p-5 space-y-3" style={{ background: t.card, border: `1px solid ${t.border}`, backdropFilter: "blur(20px)" }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: "0.07em", mb: 1 }}>
              Summary
            </Typography>
            <div className="flex justify-between">
              <Typography sx={{ fontSize: 13, color: t.muted }}>Subtotal</Typography>
              <Typography sx={{ fontSize: 13, color: t.text }}>{formatCurrency(order.subtotal)}</Typography>
            </div>
            <div className="flex justify-between">
              <Typography sx={{ fontSize: 13, color: t.muted }}>Tax</Typography>
              <Typography sx={{ fontSize: 13, color: t.text }}>{formatCurrency(order.tax)}</Typography>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <Typography sx={{ fontSize: 13, color: t.muted }}>Discount</Typography>
                <Typography sx={{ fontSize: 13, color: "#EF4444" }}>-{formatCurrency(order.discount)}</Typography>
              </div>
            )}
            <Divider sx={{ borderColor: t.border }} />
            <div className="flex justify-between items-center">
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: t.text }}>Grand Total</Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#4F8EF7" }}>{formatCurrency(order.grandTotal)}</Typography>
            </div>
          </div>

          {/* Contact info */}
          <div className="rounded-2xl p-5" style={{ background: t.card, border: `1px solid ${t.border}`, backdropFilter: "blur(20px)" }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: "0.07em", mb: 2 }}>
              Customer
            </Typography>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#4F8EF7,#8B5CF6)" }}>
                {order.contactName[0]?.toUpperCase()}
              </div>
              <div>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: t.text }}>{order.contactName}</Typography>
                <Typography sx={{ fontSize: 12, color: t.muted }}>
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </Typography>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="rounded-2xl p-5" style={{ background: t.card, border: `1px solid ${t.border}`, backdropFilter: "blur(20px)" }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: "0.07em", mb: 1.5 }}>
                Notes
              </Typography>
              <Typography sx={{ fontSize: 13, color: t.text, lineHeight: 1.6 }}>{order.notes}</Typography>
            </div>
          )}
        </div>
      </div>

      <OrderDrawer
        open={editing}
        onClose={() => setEditing(false)}
        editing={order}
      />
    </>
  );
}
