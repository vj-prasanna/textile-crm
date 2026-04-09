"use client";

import { useState, useEffect } from "react";
import {
  Drawer, Typography, IconButton, Button,
  TextField, MenuItem, ToggleButton, ToggleButtonGroup,
  Alert, Divider, CircularProgress,
} from "@mui/material";
import { CloseRounded } from "@mui/icons-material";
import { useThemeStore } from "@/store/useThemeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { addContact, updateContact } from "@/lib/firebase/contacts";
import { Contact, ContactFormData } from "@/types/contact";

const CATEGORIES = ["yarn", "fabric", "garment", "retail", "wholesale", "export"] as const;
const STATES = ["Andhra Pradesh","Gujarat","Karnataka","Maharashtra","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","West Bengal","Other"];

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Contact | null;
}

const EMPTY: ContactFormData = {
  type: "customer",
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  gstNumber: "",
  address: { street: "", city: "", state: "Gujarat", pincode: "" },
  category: "fabric",
  assignedTo: "",
  notes: "",
};

export function ContactDrawer({ open, onClose, editing }: Props) {
  const { mode } = useThemeStore();
  const { appUser } = useAuthStore();
  const dark = mode === "dark";

  const [form, setForm] = useState<ContactFormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editing) {
      const { id, totalOrders, totalRevenue, lastOrderDate, createdAt, updatedAt, ...rest } = editing;
      void id; void totalOrders; void totalRevenue; void lastOrderDate; void createdAt; void updatedAt;
      setForm(rest);
    } else {
      setForm({ ...EMPTY, assignedTo: appUser?.uid ?? "" });
    }
    setError("");
  }, [editing, open, appUser]);

  function set(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }
  function setAddr(field: string, value: string) {
    setForm((prev) => ({ ...prev, address: { ...prev.address, [field]: value } }));
  }

  function validate() {
    if (!form.companyName.trim()) return "Company name is required.";
    if (!form.contactPerson.trim()) return "Contact person is required.";
    if (!form.phone.trim()) return "Phone number is required.";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) return "Invalid email address.";
    if (!form.address.city.trim()) return "City is required.";
    return null;
  }

  async function handleSave() {
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await updateContact(editing.id, form);
      } else {
        await addContact({ ...form, assignedTo: appUser?.uid ?? "" });
      }
      onClose();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

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
            "&:hover": { background: dark ? "rgba(79,142,247,0.1)" : "rgba(79,142,247,0.06)" },
          },
        },
      },
    },
  };

  const drawerBg = dark ? "#0A1120" : "#FFFFFF";
  const borderColor = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const labelColor = dark ? "#94A3B8" : "#64748B";

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100vw", sm: 480 },
            background: drawerBg,
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
          {editing ? "Edit Contact" : "New Contact"}
        </Typography>
        <IconButton size="small" onClick={onClose}
          sx={{ color: dark ? "#64748B" : "#94A3B8", "&:hover": { color: dark ? "#F1F5F9" : "#1E293B" } }}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {error && <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>}

        {/* Type toggle */}
        <div>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: labelColor, mb: 1, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Contact Type
          </Typography>
          <ToggleButtonGroup
            exclusive value={form.type}
            onChange={(_, v) => v && set("type", v)}
            fullWidth size="small"
            sx={{
              "& .MuiToggleButton-root": {
                border: `1px solid ${borderColor}`,
                color: dark ? "#64748B" : "#94A3B8",
                fontSize: 13,
                fontWeight: 600,
                py: 1,
                borderRadius: "10px !important",
                textTransform: "none",
                "&.Mui-selected": {
                  background: "linear-gradient(135deg,rgba(79,142,247,0.2),rgba(99,102,241,0.2))",
                  color: "#4F8EF7",
                  borderColor: "rgba(79,142,247,0.4)",
                },
              },
            }}
          >
            <ToggleButton value="customer">Customer</ToggleButton>
            <ToggleButton value="supplier">Supplier</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <Divider sx={{ borderColor: borderColor }} />

        {/* Company info */}
        <div>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: labelColor, mb: 2, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Company Info
          </Typography>
          <div className="space-y-3">
            <TextField label="Company Name" fullWidth required value={form.companyName}
              onChange={(e) => set("companyName", e.target.value)} sx={inputSx} />
            <TextField label="Contact Person" fullWidth required value={form.contactPerson}
              onChange={(e) => set("contactPerson", e.target.value)} sx={inputSx} />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Phone" fullWidth required value={form.phone}
                onChange={(e) => set("phone", e.target.value)} sx={inputSx} />
              <TextField label="Email" type="email" fullWidth value={form.email}
                onChange={(e) => set("email", e.target.value)} sx={inputSx} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="GST Number" fullWidth value={form.gstNumber ?? ""}
                onChange={(e) => set("gstNumber", e.target.value)} sx={inputSx} />
              <TextField label="Category" select fullWidth required value={form.category}
                onChange={(e) => set("category", e.target.value)} sx={inputSx}
                slotProps={{ select: { MenuProps: menuSx } }}>
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c} sx={{ textTransform: "capitalize" }}>{c}</MenuItem>
                ))}
              </TextField>
            </div>
          </div>
        </div>

        <Divider sx={{ borderColor: borderColor }} />

        {/* Address */}
        <div>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: labelColor, mb: 2, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Address
          </Typography>
          <div className="space-y-3">
            <TextField label="Street" fullWidth value={form.address.street}
              onChange={(e) => setAddr("street", e.target.value)} sx={inputSx} />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="City" fullWidth required value={form.address.city}
                onChange={(e) => setAddr("city", e.target.value)} sx={inputSx} />
              <TextField label="Pincode" fullWidth value={form.address.pincode}
                onChange={(e) => setAddr("pincode", e.target.value)} sx={inputSx} />
            </div>
            <TextField label="State" select fullWidth value={form.address.state}
              onChange={(e) => setAddr("state", e.target.value)} sx={inputSx}
              slotProps={{ select: { MenuProps: menuSx } }}>
              {STATES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </div>
        </div>

        <Divider sx={{ borderColor: borderColor }} />

        {/* Notes */}
        <TextField label="Notes (optional)" fullWidth multiline rows={3}
          value={form.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
          sx={inputSx} />
      </div>

      {/* Footer */}
      <div className="flex gap-3 px-5 py-4 flex-shrink-0"
        style={{ borderTop: `1px solid ${borderColor}` }}>
        <Button fullWidth variant="outlined" onClick={onClose} disabled={saving}
          sx={{
            borderRadius: "10px", borderColor: borderColor,
            color: dark ? "#64748B" : "#94A3B8",
            "&:hover": { borderColor: dark ? "#94A3B8" : "#64748B" },
          }}>
          Cancel
        </Button>
        <Button fullWidth variant="contained" onClick={handleSave} disabled={saving}
          sx={{
            borderRadius: "10px", fontWeight: 700,
            background: "linear-gradient(135deg,#4F8EF7,#6366F1)",
            boxShadow: "0 4px 15px rgba(79,142,247,0.3)",
            "&:hover": { background: "linear-gradient(135deg,#3B82F6,#4F46E5)" },
          }}>
          {saving ? <CircularProgress size={18} sx={{ color: "white" }} /> : (editing ? "Save Changes" : "Add Contact")}
        </Button>
      </div>
    </Drawer>
  );
}
