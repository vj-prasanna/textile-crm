"use client";

import { useState, useEffect } from "react";
import {
  Drawer, Typography, IconButton, Button, TextField,
  MenuItem, Alert, Divider, CircularProgress,
} from "@mui/material";
import { CloseRounded } from "@mui/icons-material";
import { getDocs, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useThemeStore } from "@/store/useThemeStore";
import { createPayment } from "@/lib/firebase/payments";
import { PaymentFormData, Payment } from "@/types/payment";
import { Order } from "@/types/order";
import { formatCurrency } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Pre-select an order if opened from order detail */
  defaultOrderId?: string;
}

const METHODS: { value: Payment["method"]; label: string }[] = [
  { value: "cash",          label: "Cash"          },
  { value: "bank_transfer", label: "Bank Transfer"  },
  { value: "upi",           label: "UPI"            },
  { value: "cheque",        label: "Cheque"         },
  { value: "credit",        label: "Credit"         },
];

function todayString() {
  return new Date().toISOString().split("T")[0];
}

export function PaymentDrawer({ open, onClose, defaultOrderId }: Props) {
  const { mode } = useThemeStore();
  const dark = mode === "dark";

  const [orders, setOrders] = useState<Order[]>([]);
  const [orderId, setOrderId] = useState(defaultOrderId ?? "");
  const [amount, setAmount] = useState<number | "">("");
  const [method, setMethod] = useState<Payment["method"]>("bank_transfer");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(todayString());
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    // Fetch non-cancelled orders that are not fully paid
    getDocs(collection(db, "orders")).then((snap) => {
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
      setOrders(all.filter((o) => o.status !== "cancelled" && o.paymentStatus !== "paid"));
    });
    setOrderId(defaultOrderId ?? "");
    setAmount("");
    setMethod("bank_transfer");
    setReference("");
    setDate(todayString());
    setNotes("");
    setError("");
  }, [open, defaultOrderId]);

  const selectedOrder = orders.find((o) => o.id === orderId) ?? null;

  function validate() {
    if (!orderId) return "Please select an order.";
    if (!amount || amount <= 0) return "Amount must be greater than 0.";
    if (!date) return "Date is required.";
    return null;
  }

  async function handleSave() {
    const err = validate();
    if (err) { setError(err); return; }
    if (!selectedOrder) return;

    setSaving(true);
    setError("");

    const data: PaymentFormData = {
      orderId,
      orderNumber: selectedOrder.orderNumber,
      contactId: selectedOrder.contactId,
      contactName: selectedOrder.contactName,
      amount: amount as number,
      method,
      date: Timestamp.fromDate(new Date(date)),
      ...(reference && { reference }),
      ...(notes && { notes }),
    };

    try {
      await createPayment(data);
      onClose();
    } catch {
      setError("Failed to record payment. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const borderColor = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const labelColor = dark ? "#94A3B8" : "#64748B";

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
      borderRadius: "10px",
      color: dark ? "#F1F5F9" : "#1E293B",
      fontSize: 14,
      "& fieldset": { borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" },
      "&:hover fieldset": { borderColor: "rgba(79,142,247,0.4)" },
      "&.Mui-focused fieldset": { borderColor: "#4F8EF7", boxShadow: "0 0 0 3px rgba(79,142,247,0.12)" },
    },
    "& .MuiInputLabel-root": {
      color: dark ? "rgba(241,245,249,0.4)" : "rgba(30,41,59,0.4)",
      fontSize: 14,
      "&.Mui-focused": { color: "#4F8EF7" },
    },
    "& .MuiInputBase-input": { color: dark ? "#F1F5F9" : "#1E293B" },
  };

  const menuSx = {
    slotProps: {
      paper: {
        sx: {
          background: dark ? "rgba(15,23,42,0.95)" : "#fff",
          backdropFilter: "blur(20px)",
          border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
          borderRadius: 2,
          "& .MuiMenuItem-root": {
            fontSize: 13,
            color: dark ? "#F1F5F9" : "#1E293B",
            "&:hover": { background: "rgba(79,142,247,0.1)" },
          },
        },
      },
    },
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100vw", sm: 460 },
            background: dark ? "#0A1120" : "#FFFFFF",
            backgroundImage: "none",
            borderLeft: `1px solid ${borderColor}`,
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: `1px solid ${borderColor}` }}>
        <Typography sx={{ fontWeight: 700, fontSize: 17, color: dark ? "#F1F5F9" : "#1E293B" }}>
          Record Payment
        </Typography>
        <IconButton size="small" onClick={onClose}
          sx={{ color: dark ? "#64748B" : "#94A3B8", "&:hover": { color: dark ? "#F1F5F9" : "#1E293B" } }}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {error && <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>}

        {/* Order selection */}
        <div>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: labelColor, mb: 2, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Order
          </Typography>
          <TextField
            label="Select Order"
            select
            fullWidth
            required
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            sx={inputSx}
            slotProps={{ select: { MenuProps: menuSx } }}
          >
            {orders.length === 0
              ? <MenuItem disabled>No pending orders</MenuItem>
              : orders.map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.orderNumber} — {o.contactName} ({formatCurrency(o.grandTotal)})
                </MenuItem>
              ))
            }
          </TextField>

          {/* Selected order summary */}
          {selectedOrder && (
            <div className="mt-3 rounded-xl p-3 space-y-1"
              style={{ background: dark ? "rgba(79,142,247,0.08)" : "rgba(79,142,247,0.05)", border: "1px solid rgba(79,142,247,0.15)" }}>
              <div className="flex justify-between">
                <Typography sx={{ fontSize: 12, color: labelColor }}>Contact</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: dark ? "#F1F5F9" : "#1E293B" }}>{selectedOrder.contactName}</Typography>
              </div>
              <div className="flex justify-between">
                <Typography sx={{ fontSize: 12, color: labelColor }}>Order Total</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: dark ? "#F1F5F9" : "#1E293B" }}>{formatCurrency(selectedOrder.grandTotal)}</Typography>
              </div>
              <div className="flex justify-between">
                <Typography sx={{ fontSize: 12, color: labelColor }}>Payment Status</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: selectedOrder.paymentStatus === "unpaid" ? "#EF4444" : "#F59E0B", textTransform: "capitalize" }}>
                  {selectedOrder.paymentStatus}
                </Typography>
              </div>
            </div>
          )}
        </div>

        <Divider sx={{ borderColor: borderColor }} />

        {/* Payment details */}
        <div>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: labelColor, mb: 2, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Payment Details
          </Typography>
          <div className="space-y-3">
            <TextField
              label="Amount (₹)"
              type="number"
              fullWidth
              required
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || "")}
              sx={inputSx}
              slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Payment Method"
                select
                fullWidth
                required
                value={method}
                onChange={(e) => setMethod(e.target.value as Payment["method"])}
                sx={inputSx}
                slotProps={{ select: { MenuProps: menuSx } }}
              >
                {METHODS.map((m) => (
                  <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Date"
                type="date"
                fullWidth
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                sx={inputSx}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </div>
            <TextField
              label="Reference / UTR (optional)"
              fullWidth
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              sx={inputSx}
            />
            <TextField
              label="Notes (optional)"
              fullWidth
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={inputSx}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-3 px-5 py-4 flex-shrink-0"
        style={{ borderTop: `1px solid ${borderColor}` }}>
        <Button fullWidth variant="outlined" onClick={onClose} disabled={saving}
          sx={{ borderRadius: "10px", borderColor: borderColor, color: dark ? "#64748B" : "#94A3B8", "&:hover": { borderColor: dark ? "#94A3B8" : "#64748B" } }}>
          Cancel
        </Button>
        <Button fullWidth variant="contained" onClick={handleSave} disabled={saving}
          sx={{ borderRadius: "10px", fontWeight: 700, background: "linear-gradient(135deg,#4F8EF7,#6366F1)", boxShadow: "0 4px 15px rgba(79,142,247,0.3)", "&:hover": { background: "linear-gradient(135deg,#3B82F6,#4F46E5)" } }}>
          {saving ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Record Payment"}
        </Button>
      </div>
    </Drawer>
  );
}
