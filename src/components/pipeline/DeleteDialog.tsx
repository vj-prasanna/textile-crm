"use client";

import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, CircularProgress,
} from "@mui/material";
import { WarningAmberRounded } from "@mui/icons-material";
import { useThemeStore } from "@/store/useThemeStore";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteDialog({ open, title, onClose, onConfirm }: Props) {
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
            borderRadius: "16px",
            background: dark ? "#0A1120" : "#fff",
            border: dark
              ? "1px solid rgba(255,255,255,0.07)"
              : "1px solid rgba(0,0,0,0.07)",
            minWidth: 340,
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <div className="flex items-center gap-2">
          <WarningAmberRounded sx={{ color: "#EF4444", fontSize: 22 }} />
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: dark ? "#F1F5F9" : "#1E293B" }}>
            Delete Deal
          </Typography>
        </div>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 14, color: dark ? "#94A3B8" : "#64748B" }}>
          Delete{" "}
          <strong style={{ color: dark ? "#F1F5F9" : "#1E293B" }}>
            &ldquo;{title}&rdquo;
          </strong>
          ? This cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            borderRadius: "10px",
            color: dark ? "#64748B" : "#94A3B8",
            border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}
          variant="contained"
          sx={{
            borderRadius: "10px",
            fontWeight: 700,
            background: "linear-gradient(135deg,#EF4444,#DC2626)",
            "&:hover": { background: "linear-gradient(135deg,#DC2626,#B91C1C)" },
          }}
        >
          {loading ? <CircularProgress size={16} sx={{ color: "white" }} /> : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
