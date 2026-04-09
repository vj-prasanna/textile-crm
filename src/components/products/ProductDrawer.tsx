"use client";

import { useState, useEffect } from "react";
import {
  Drawer, Typography, IconButton, Button,
  TextField, MenuItem, Switch, FormControlLabel,
  Alert, Divider, CircularProgress,
} from "@mui/material";
import { CloseRounded, AutorenewRounded } from "@mui/icons-material";
import { useThemeStore } from "@/store/useThemeStore";
import { addProduct, updateProduct, generateSKU } from "@/lib/firebase/products";
import { Product, ProductFormData } from "@/types/product";

const SUB_CATEGORIES: Record<Product["category"], string[]> = {
  yarn: ["Cotton", "Polyester", "Nylon", "Wool", "Blended", "Silk"],
  fabric: ["Denim", "Silk", "Cotton", "Synthetic", "Knit", "Chiffon", "Georgette", "Linen"],
  garment: ["Shirts", "T-Shirts", "Pants", "Sarees", "Kurtas", "Dress", "Jeans", "Blazer"],
};

const UNITS: Product["unit"][] = ["meter", "kg", "piece", "roll"];
const CATEGORIES: Product["category"][] = ["yarn", "fabric", "garment"];

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Product | null;
}

const EMPTY: ProductFormData = {
  name: "",
  sku: "",
  category: "fabric",
  subCategory: "Cotton",
  unit: "meter",
  pricePerUnit: 0,
  stock: 0,
  minStock: 10,
  icon: "fabric",
  description: "",
  isActive: true,
};

export function ProductDrawer({ open, onClose, editing }: Props) {
  const { mode } = useThemeStore();
  const dark = mode === "dark";

  const [form, setForm] = useState<ProductFormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [generatingSKU, setGeneratingSKU] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editing) {
      const { id, createdAt, updatedAt, ...rest } = editing;
      void id; void createdAt; void updatedAt;
      setForm(rest);
    } else {
      setForm({ ...EMPTY });
      handleGenerateSKU("fabric");
    }
    setError("");
  }, [editing, open]);

  async function handleGenerateSKU(category: Product["category"]) {
    setGeneratingSKU(true);
    try {
      const sku = await generateSKU(category);
      setForm((prev) => ({ ...prev, sku }));
    } finally {
      setGeneratingSKU(false);
    }
  }

  function set<K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleCategoryChange(category: Product["category"]) {
    const firstSub = SUB_CATEGORIES[category][0];
    setForm((prev) => ({ ...prev, category, subCategory: firstSub, icon: category }));
    if (!editing) handleGenerateSKU(category);
  }

  function validate() {
    if (!form.name.trim()) return "Product name is required.";
    if (!form.sku.trim()) return "SKU is required.";
    if (!form.subCategory) return "Sub-category is required.";
    if (form.pricePerUnit <= 0) return "Price per unit must be greater than 0.";
    if (form.stock < 0) return "Stock cannot be negative.";
    if (form.minStock < 0) return "Min stock cannot be negative.";
    return null;
  }

  async function handleSave() {
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await updateProduct(editing.id, form);
      } else {
        await addProduct(form);
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
      "&:hover fieldset": { borderColor: dark ? "rgba(79,142,247,0.4)" : "rgba(37,99,235,0.3)" },
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
            width: { xs: "100vw", sm: 480 },
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
      <div
        className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ borderBottom: `1px solid ${borderColor}` }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 17, color: dark ? "#F1F5F9" : "#1E293B" }}>
          {editing ? "Edit Product" : "New Product"}
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: dark ? "#64748B" : "#94A3B8", "&:hover": { color: dark ? "#F1F5F9" : "#1E293B" } }}
        >
          <CloseRounded fontSize="small" />
        </IconButton>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {error && (
          <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Category */}
        <div>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: labelColor, mb: 2, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Category
          </Typography>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                style={{
                  padding: "10px 8px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                  background: form.category === cat ? "linear-gradient(135deg,rgba(79,142,247,0.2),rgba(99,102,241,0.2))" : (dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"),
                  color: form.category === cat ? "#4F8EF7" : labelColor,
                  outline: form.category === cat ? "1px solid rgba(79,142,247,0.4)" : `1px solid ${borderColor}`,
                  textTransform: "capitalize",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <Divider sx={{ borderColor: borderColor }} />

        {/* Basic Info */}
        <div>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: labelColor, mb: 2, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Product Info
          </Typography>
          <div className="space-y-3">
            <TextField
              label="Product Name"
              fullWidth
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              sx={inputSx}
            />
            <div className="flex gap-2 items-end">
              <TextField
                label="SKU"
                fullWidth
                required
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                sx={inputSx}
                slotProps={{ input: { style: { fontFamily: "monospace" } } }}
              />
              {!editing && (
                <IconButton
                  onClick={() => handleGenerateSKU(form.category)}
                  disabled={generatingSKU}
                  title="Regenerate SKU"
                  sx={{
                    mb: 0.5,
                    color: "#4F8EF7",
                    background: "rgba(79,142,247,0.1)",
                    borderRadius: "10px",
                    "&:hover": { background: "rgba(79,142,247,0.2)" },
                    flexShrink: 0,
                  }}
                >
                  {generatingSKU ? <CircularProgress size={18} sx={{ color: "#4F8EF7" }} /> : <AutorenewRounded fontSize="small" />}
                </IconButton>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Sub-Category"
                select
                fullWidth
                required
                value={form.subCategory}
                onChange={(e) => set("subCategory", e.target.value)}
                sx={inputSx}
                slotProps={{ select: { MenuProps: menuSx } }}
              >
                {SUB_CATEGORIES[form.category].map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Unit"
                select
                fullWidth
                required
                value={form.unit}
                onChange={(e) => set("unit", e.target.value as Product["unit"])}
                sx={inputSx}
                slotProps={{ select: { MenuProps: menuSx } }}
              >
                {UNITS.map((u) => (
                  <MenuItem key={u} value={u} sx={{ textTransform: "capitalize" }}>{u}</MenuItem>
                ))}
              </TextField>
            </div>
          </div>
        </div>

        <Divider sx={{ borderColor: borderColor }} />

        {/* Pricing & Stock */}
        <div>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: labelColor, mb: 2, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Pricing & Stock
          </Typography>
          <div className="space-y-3">
            <TextField
              label="Price Per Unit (₹)"
              type="number"
              fullWidth
              required
              value={form.pricePerUnit || ""}
              onChange={(e) => set("pricePerUnit", parseFloat(e.target.value) || 0)}
              sx={inputSx}
              slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Current Stock"
                type="number"
                fullWidth
                required
                value={form.stock || ""}
                onChange={(e) => set("stock", parseInt(e.target.value) || 0)}
                sx={inputSx}
                slotProps={{ htmlInput: { min: 0 } }}
              />
              <TextField
                label="Min Stock (Alert)"
                type="number"
                fullWidth
                required
                value={form.minStock || ""}
                onChange={(e) => set("minStock", parseInt(e.target.value) || 0)}
                sx={inputSx}
                slotProps={{ htmlInput: { min: 0 } }}
              />
            </div>
          </div>
        </div>

        <Divider sx={{ borderColor: borderColor }} />

        {/* Description & Status */}
        <div className="space-y-3">
          <TextField
            label="Description (optional)"
            fullWidth
            multiline
            rows={3}
            value={form.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
            sx={inputSx}
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#4F8EF7" },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#4F8EF7" },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: 13, color: dark ? "#F1F5F9" : "#1E293B" }}>
                Active Product
              </Typography>
            }
          />
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex gap-3 px-5 py-4 flex-shrink-0"
        style={{ borderTop: `1px solid ${borderColor}` }}
      >
        <Button
          fullWidth
          variant="outlined"
          onClick={onClose}
          disabled={saving}
          sx={{
            borderRadius: "10px",
            borderColor: borderColor,
            color: dark ? "#64748B" : "#94A3B8",
            "&:hover": { borderColor: dark ? "#94A3B8" : "#64748B" },
          }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          sx={{
            borderRadius: "10px",
            fontWeight: 700,
            background: "linear-gradient(135deg,#4F8EF7,#6366F1)",
            boxShadow: "0 4px 15px rgba(79,142,247,0.3)",
            "&:hover": { background: "linear-gradient(135deg,#3B82F6,#4F46E5)" },
          }}
        >
          {saving ? <CircularProgress size={18} sx={{ color: "white" }} /> : (editing ? "Save Changes" : "Add Product")}
        </Button>
      </div>
    </Drawer>
  );
}
