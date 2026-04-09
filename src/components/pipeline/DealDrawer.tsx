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
import { useAuthStore } from "@/store/useAuthStore";
import { createDeal, updateDeal } from "@/lib/firebase/pipeline";
import { Deal, DealFormData } from "@/types/pipeline";
import { Contact } from "@/types/contact";
import { STAGE_CONFIG, STAGE_ORDER } from "./stageConfig";

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Deal | null;
}

export function DealDrawer({ open, onClose, editing }: Props) {
  const { mode } = useThemeStore();
  const { appUser } = useAuthStore();
  const dark = mode === "dark";

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [title, setTitle] = useState("");
  const [contactId, setContactId] = useState("");
  const [value, setValue] = useState<number | "">("");
  const [stage, setStage] = useState<Deal["stage"]>("new_lead");
  const [probability, setProbability] = useState(50);
  const [closeDateStr, setCloseDateStr] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    getDocs(collection(db, "contacts")).then((snap) => {
      setContacts(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Contact));
    });

    if (editing) {
      setTitle(editing.title);
      setContactId(editing.contactId ?? "");
      setValue(editing.value);
      setStage(editing.stage);
      setProbability(editing.probability);
      setNotes(editing.notes ?? "");
      setCloseDateStr(
        editing.expectedCloseDate
          ? editing.expectedCloseDate.toDate().toISOString().split("T")[0]
          : ""
      );
    } else {
      setTitle("");
      setContactId("");
      setValue("");
      setStage("new_lead");
      setProbability(50);
      setNotes("");
      setCloseDateStr("");
    }
    setError("");
  }, [open, editing]);

  async function handleSave() {
    if (!title.trim()) { setError("Title is required."); return; }
    if (!value || Number(value) <= 0) { setError("Value must be greater than 0."); return; }

    setSaving(true);
    setError("");

    try {
      const selectedContact = contacts.find((c) => c.id === contactId);

      const data: DealFormData = {
        title: title.trim(),
        value: Number(value),
        stage,
        probability,
        assignedTo: appUser?.uid ?? "unknown",
      };

      if (selectedContact) {
        data.contactId = selectedContact.id;
        data.contactName = selectedContact.companyName;
      }
      if (closeDateStr) {
        data.expectedCloseDate = Timestamp.fromDate(new Date(closeDateStr));
      }
      if (notes.trim()) {
        data.notes = notes.trim();
      }

      if (editing) {
        await updateDeal(editing.id, data);
      } else {
        await createDeal(data);
      }
      onClose();
    } catch {
      setError("Failed to save deal. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const t = {
    bg: dark ? "#0A1120" : "#FAFAFA",
    border: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
    text: dark ? "#F1F5F9" : "#1E293B",
    muted: dark ? "#64748B" : "#94A3B8",
    input: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      fontSize: 13,
      borderRadius: "10px",
      background: t.input,
      color: t.text,
      "& fieldset": { borderColor: t.border },
      "&:hover fieldset": { borderColor: dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)" },
      "&.Mui-focused fieldset": { borderColor: "#4F8EF7" },
    },
    "& .MuiInputLabel-root": {
      fontSize: 13,
      color: t.muted,
      "&.Mui-focused": { color: "#4F8EF7" },
    },
    "& .MuiSelect-icon": { color: t.muted },
  };

  const menuPaperSx = {
    sx: {
      background: dark ? "rgba(10,17,32,0.98)" : "#fff",
      backdropFilter: "blur(20px)",
      border: `1px solid ${t.border}`,
      borderRadius: 2,
      "& .MuiMenuItem-root": {
        fontSize: 13,
        color: t.text,
        "&:hover": { background: "rgba(79,142,247,0.1)" },
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
            width: { xs: "100vw", sm: 440 },
            background: t.bg,
            borderLeft: `1px solid ${t.border}`,
          },
        },
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: `1px solid ${t.border}` }}>
        <Typography sx={{ fontWeight: 700, fontSize: 17, color: t.text }}>
          {editing ? "Edit Deal" : "Add Deal"}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: t.muted }}>
          <CloseRounded />
        </IconButton>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-4 px-5 py-5 overflow-y-auto flex-1">
        {error && (
          <Alert severity="error" sx={{ borderRadius: "10px", fontSize: 13 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Deal Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={fieldSx}
        />

        <TextField
          fullWidth
          select
          label="Contact (optional)"
          value={contactId}
          onChange={(e) => setContactId(e.target.value)}
          sx={fieldSx}
          slotProps={{ select: { MenuProps: { slotProps: { paper: menuPaperSx } } } }}
        >
          <MenuItem value=""><em style={{ color: t.muted }}>None</em></MenuItem>
          {contacts.map((c) => (
            <MenuItem key={c.id} value={c.id}>{c.companyName}</MenuItem>
          ))}
        </TextField>

        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Value (₹) *"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value === "" ? "" : Number(e.target.value))}
            sx={fieldSx}
          />
          <TextField
            label="Probability (%)"
            type="number"
            value={probability}
            onChange={(e) =>
              setProbability(Math.min(100, Math.max(0, Number(e.target.value))))
            }
            slotProps={{ htmlInput: { min: 0, max: 100 } }}
            sx={fieldSx}
          />
        </div>

        <TextField
          fullWidth
          select
          label="Stage"
          value={stage}
          onChange={(e) => setStage(e.target.value as Deal["stage"])}
          sx={fieldSx}
          slotProps={{ select: { MenuProps: { slotProps: { paper: menuPaperSx } } } }}
        >
          {STAGE_ORDER.map((s) => (
            <MenuItem key={s} value={s}>{STAGE_CONFIG[s].label}</MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          label="Expected Close Date"
          type="date"
          value={closeDateStr}
          onChange={(e) => setCloseDateStr(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={fieldSx}
        />

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={fieldSx}
        />
      </div>

      <Divider sx={{ borderColor: t.border }} />
      <div className="flex gap-2 px-5 py-4">
        <Button
          fullWidth
          onClick={onClose}
          disabled={saving}
          sx={{ borderRadius: "10px", color: t.muted, border: `1px solid ${t.border}` }}
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
            "&:hover": { background: "linear-gradient(135deg,#3B82F6,#4F46E5)" },
          }}
        >
          {saving
            ? <CircularProgress size={16} sx={{ color: "white" }} />
            : editing ? "Save Changes" : "Add Deal"
          }
        </Button>
      </div>
    </Drawer>
  );
}
