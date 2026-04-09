"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Drawer, Typography, IconButton, Button, TextField,
  MenuItem, Alert, Divider, CircularProgress,
} from "@mui/material";
import { CloseRounded, AddRounded, DeleteOutlineRounded } from "@mui/icons-material";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useThemeStore } from "@/store/useThemeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { createOrder, updateOrder } from "@/lib/firebase/orders";
import { Order, OrderFormData, OrderItem } from "@/types/order";
import { Contact } from "@/types/contact";
import { Product } from "@/types/product";
import { formatCurrency } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Order | null;
}

const EMPTY_ITEM: OrderItem = {
  productId: "",
  productName: "",
  quantity: 1,
  pricePerUnit: 0,
  total: 0,
};

export function OrderDrawer({ open, onClose, editing }: Props) {
  const { mode } = useThemeStore();
  const { appUser } = useAuthStore();
  const dark = mode === "dark";

  const [contactId, setContactId] = useState("");
  const [contactName, setContactName] = useState("");
  const [items, setItems] = useState<OrderItem[]>([{ ...EMPTY_ITEM }]);
  const [taxRate, setTaxRate] = useState(18);
  const [discount, setDiscount] = useState(0);
  const [status, setStatus] = useState<Order["status"]>("draft");
  const [notes, setNotes] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch contacts + products when drawer opens
  useEffect(() => {
    if (!open) return;
    getDocs(collection(db, "contacts")).then((snap) =>
      setContacts(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Contact)
    ));
    getDocs(collection(db, "products")).then((snap) =>
      setProducts(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as Product)
          .filter((p) => p.isActive)
      )
    );

    if (editing) {
      setContactId(editing.contactId);
      setContactName(editing.contactName);
      setItems(editing.items);
      setDiscount(editing.discount);
      setStatus(editing.status);
      setNotes(editing.notes ?? "");
      // Reverse-calculate taxRate from stored tax/subtotal
      const sub = editing.subtotal;
      setTaxRate(sub > 0 ? Math.round((editing.tax / sub) * 100) : 18);
    } else {
      setContactId("");
      setContactName("");
      setItems([{ ...EMPTY_ITEM }]);
      setTaxRate(18);
      setDiscount(0);
      setStatus("draft");
      setNotes("");
    }
    setError("");
  }, [open, editing]);

  // Computed totals
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.total, 0),
    [items]
  );
  const tax = Math.round(subtotal * taxRate / 100);
  const grandTotal = subtotal + tax - discount;

  function updateItem(idx: number, field: keyof OrderItem, value: string | number) {
    setItems((prev) => {
      const next = [...prev];
      const row = { ...next[idx], [field]: value };
      if (field === "quantity" || field === "pricePerUnit") {
        row.total = row.quantity * row.pricePerUnit;
      }
      next[idx] = row;
      return next;
    });
  }

  function selectProduct(idx: number, productId: string) {
    const p = products.find((p) => p.id === productId);
    if (!p) return;
    setItems((prev) => {
      const next = [...prev];
      next[idx] = {
        productId: p.id,
        productName: p.name,
        quantity: next[idx].quantity || 1,
        pricePerUnit: p.pricePerUnit,
        total: (next[idx].quantity || 1) * p.pricePerUnit,
      };
      return next;
    });
  }

  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function validate() {
    if (!contactId) return "Please select a contact.";
    if (items.length === 0) return "Add at least one item.";
    for (const item of items) {
      if (!item.productId) return "Select a product for every line item.";
      if (item.quantity <= 0) return "Quantity must be greater than 0.";
      if (item.pricePerUnit <= 0) return "Price must be greater than 0.";
    }
    if (discount < 0) return "Discount cannot be negative.";
    if (discount > subtotal + tax) return "Discount cannot exceed order total.";
    return null;
  }

  async function handleSave() {
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);
    setError("");

    const data: OrderFormData = {
      contactId,
      contactName,
      items,
      subtotal,
      tax,
      discount,
      grandTotal,
      status,
      paymentStatus: editing?.paymentStatus ?? "unpaid",
      assignedTo: appUser?.uid ?? "",
      notes,
    };

    try {
      if (editing) {
        await updateOrder(editing.id, data);
      } else {
        await createOrder(data);
      }
      onClose();
    } catch {
      setError("Failed to save. Please try again.");
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

  const STATUS_OPTIONS: Order["status"][] = ["draft", "confirmed", "in_production", "dispatched", "delivered", "cancelled"];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100vw", sm: 560 },
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
          {editing ? `Edit Order — ${editing.orderNumber}` : "New Order"}
        </Typography>
        <IconButton size="small" onClick={onClose}
          sx={{ color: dark ? "#64748B" : "#94A3B8", "&:hover": { color: dark ? "#F1F5F9" : "#1E293B" } }}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {error && <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>}

        {/* Contact */}
        <div>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: labelColor, mb: 2, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Customer
          </Typography>
          <TextField
            label="Select Contact"
            select
            fullWidth
            required
            value={contactId}
            onChange={(e) => {
              const c = contacts.find((c) => c.id === e.target.value);
              if (c) { setContactId(c.id); setContactName(c.companyName); }
            }}
            sx={inputSx}
            slotProps={{ select: { MenuProps: menuSx } }}
          >
            {contacts.length === 0
              ? <MenuItem disabled>No contacts found</MenuItem>
              : contacts.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.companyName} — {c.contactPerson}
                </MenuItem>
              ))
            }
          </TextField>
        </div>

        <Divider sx={{ borderColor: borderColor }} />

        {/* Line items */}
        <div>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: labelColor, mb: 2, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Order Items
          </Typography>

          {/* Column headers */}
          <div className="grid gap-2 mb-2 px-1" style={{ gridTemplateColumns: "3fr 1fr 1.5fr 1fr 32px" }}>
            {["Product", "Qty", "Price/Unit", "Total", ""].map((h) => (
              <Typography key={h} sx={{ fontSize: 10, fontWeight: 700, color: labelColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</Typography>
            ))}
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="grid gap-2 items-center" style={{ gridTemplateColumns: "3fr 1fr 1.5fr 1fr 32px" }}>
                {/* Product */}
                <TextField
                  select
                  size="small"
                  value={item.productId}
                  onChange={(e) => selectProduct(idx, e.target.value)}
                  sx={{ ...inputSx, "& .MuiOutlinedInput-root": { ...inputSx["& .MuiOutlinedInput-root"], fontSize: 12 } }}
                  slotProps={{ select: { MenuProps: menuSx, displayEmpty: true } }}
                >
                  <MenuItem value="" disabled sx={{ fontSize: 12 }}>Select…</MenuItem>
                  {products.map((p) => (
                    <MenuItem key={p.id} value={p.id} sx={{ fontSize: 12 }}>
                      {p.name} ({p.sku})
                    </MenuItem>
                  ))}
                </TextField>

                {/* Qty */}
                <TextField
                  size="small"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                  sx={{ ...inputSx, "& .MuiOutlinedInput-root": { ...inputSx["& .MuiOutlinedInput-root"], fontSize: 12 } }}
                  slotProps={{ htmlInput: { min: 1 } }}
                />

                {/* Price */}
                <TextField
                  size="small"
                  type="number"
                  value={item.pricePerUnit}
                  onChange={(e) => updateItem(idx, "pricePerUnit", parseFloat(e.target.value) || 0)}
                  sx={{ ...inputSx, "& .MuiOutlinedInput-root": { ...inputSx["& .MuiOutlinedInput-root"], fontSize: 12 } }}
                  slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                />

                {/* Total */}
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: dark ? "#F1F5F9" : "#1E293B", textAlign: "right" }}>
                  {formatCurrency(item.total)}
                </Typography>

                {/* Remove */}
                <IconButton
                  size="small"
                  onClick={() => removeItem(idx)}
                  disabled={items.length === 1}
                  sx={{ color: "#EF4444", "&:hover": { bgcolor: "rgba(239,68,68,0.1)" }, borderRadius: "6px", p: 0.5 }}
                >
                  <DeleteOutlineRounded sx={{ fontSize: 16 }} />
                </IconButton>
              </div>
            ))}
          </div>

          <Button
            startIcon={<AddRounded />}
            onClick={addItem}
            size="small"
            sx={{
              mt: 2, fontSize: 12, fontWeight: 600, borderRadius: "8px",
              color: "#4F8EF7", border: "1px dashed rgba(79,142,247,0.4)",
              "&:hover": { background: "rgba(79,142,247,0.08)" },
            }}
          >
            Add Item
          </Button>
        </div>

        <Divider sx={{ borderColor: borderColor }} />

        {/* Totals */}
        <div>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: labelColor, mb: 2, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Pricing
          </Typography>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Typography sx={{ fontSize: 13, color: labelColor }}>Subtotal</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: dark ? "#F1F5F9" : "#1E293B" }}>{formatCurrency(subtotal)}</Typography>
            </div>
            <div className="flex items-center gap-3">
              <Typography sx={{ fontSize: 13, color: labelColor, flexShrink: 0 }}>Tax (%)</Typography>
              <TextField
                size="small"
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Math.max(0, parseFloat(e.target.value) || 0))}
                sx={{ ...inputSx, width: 90, "& .MuiOutlinedInput-root": { ...inputSx["& .MuiOutlinedInput-root"], fontSize: 13 } }}
                slotProps={{ htmlInput: { min: 0, max: 100 } }}
              />
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: dark ? "#F1F5F9" : "#1E293B", ml: "auto" }}>{formatCurrency(tax)}</Typography>
            </div>
            <div className="flex items-center gap-3">
              <Typography sx={{ fontSize: 13, color: labelColor, flexShrink: 0 }}>Discount (₹)</Typography>
              <TextField
                size="small"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                sx={{ ...inputSx, width: 120, "& .MuiOutlinedInput-root": { ...inputSx["& .MuiOutlinedInput-root"], fontSize: 13 } }}
                slotProps={{ htmlInput: { min: 0 } }}
              />
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#EF4444", ml: "auto" }}>-{formatCurrency(discount)}</Typography>
            </div>
            <div
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: "linear-gradient(135deg,rgba(79,142,247,0.1),rgba(99,102,241,0.1))", border: "1px solid rgba(79,142,247,0.2)" }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: dark ? "#F1F5F9" : "#1E293B" }}>Grand Total</Typography>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#4F8EF7" }}>{formatCurrency(grandTotal)}</Typography>
            </div>
          </div>
        </div>

        <Divider sx={{ borderColor: borderColor }} />

        {/* Status + Notes */}
        <div className="space-y-3">
          <TextField
            label="Status"
            select
            fullWidth
            value={status}
            onChange={(e) => setStatus(e.target.value as Order["status"])}
            sx={inputSx}
            slotProps={{ select: { MenuProps: menuSx } }}
          >
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>
                {s.replace("_", " ")}
              </MenuItem>
            ))}
          </TextField>
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

      {/* Footer */}
      <div className="flex gap-3 px-5 py-4 flex-shrink-0"
        style={{ borderTop: `1px solid ${borderColor}` }}>
        <Button fullWidth variant="outlined" onClick={onClose} disabled={saving}
          sx={{ borderRadius: "10px", borderColor: borderColor, color: dark ? "#64748B" : "#94A3B8", "&:hover": { borderColor: dark ? "#94A3B8" : "#64748B" } }}>
          Cancel
        </Button>
        <Button fullWidth variant="contained" onClick={handleSave} disabled={saving}
          sx={{ borderRadius: "10px", fontWeight: 700, background: "linear-gradient(135deg,#4F8EF7,#6366F1)", boxShadow: "0 4px 15px rgba(79,142,247,0.3)", "&:hover": { background: "linear-gradient(135deg,#3B82F6,#4F46E5)" } }}>
          {saving ? <CircularProgress size={18} sx={{ color: "white" }} /> : (editing ? "Save Changes" : "Create Order")}
        </Button>
      </div>
    </Drawer>
  );
}
