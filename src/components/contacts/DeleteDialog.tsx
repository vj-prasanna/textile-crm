"use client";

import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress } from "@mui/material";
import { WarningAmberRounded } from "@mui/icons-material";
import { useThemeStore } from "@/store/useThemeStore";

interface Props {
  open: boolean;
  contactName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteDialog({ open, contactName, onClose, onConfirm }: Props) {
  const { mode } = useThemeStore();
  const dark = mode === "dark";
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try { await onConfirm(); onClose(); }
    finally { setLoading(false); }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            background: dark ? "rgba(15,23,42,0.95)" : "#fff",
            backdropFilter: "blur(20px)",
            border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
            borderRadius: 3,
            maxWidth: 400,
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <WarningAmberRounded sx={{ color: "#EF4444", fontSize: 20 }} />
          </div>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: dark ? "#F1F5F9" : "#1E293B" }}>
            Delete Contact
          </Typography>
        </div>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 14, color: dark ? "#94A3B8" : "#64748B" }}>
          Are you sure you want to delete <strong style={{ color: dark ? "#F1F5F9" : "#1E293B" }}>{contactName}</strong>?
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
        <Button fullWidth variant="outlined" onClick={onClose} disabled={loading}
          sx={{
            borderRadius: "10px",
            borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
            color: dark ? "#94A3B8" : "#64748B",
          }}>
          Cancel
        </Button>
        <Button fullWidth variant="contained" onClick={handleConfirm} disabled={loading}
          sx={{
            borderRadius: "10px", fontWeight: 700,
            background: "linear-gradient(135deg,#EF4444,#DC2626)",
            boxShadow: "0 4px 15px rgba(239,68,68,0.3)",
            "&:hover": { background: "linear-gradient(135deg,#DC2626,#B91C1C)" },
          }}>
          {loading ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
