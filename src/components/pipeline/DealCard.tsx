"use client";

import { Typography, IconButton, Tooltip, Chip } from "@mui/material";
import {
  EditRounded, DeleteRounded,
  CalendarTodayRounded, PersonRounded,
} from "@mui/icons-material";
import { Deal } from "@/types/pipeline";
import { STAGE_CONFIG } from "./stageConfig";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Props {
  deal: Deal;
  dark: boolean;
  onEdit: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
  onDragStart: (e: React.DragEvent, dealId: string) => void;
}

export function DealCard({ deal, dark, onEdit, onDelete, onDragStart }: Props) {
  const t = {
    card: dark ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.9)",
    border: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    text: dark ? "#F1F5F9" : "#1E293B",
    muted: dark ? "#64748B" : "#94A3B8",
  };

  const stageColor = STAGE_CONFIG[deal.stage].color;
  const probColor =
    deal.probability >= 70 ? "#10B981" :
    deal.probability >= 40 ? "#F59E0B" : "#EF4444";

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, deal.id)}
      className="rounded-xl p-3 cursor-grab active:cursor-grabbing select-none"
      style={{
        background: t.card,
        border: `1px solid ${t.border}`,
        backdropFilter: "blur(12px)",
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Title + actions */}
      <div className="flex items-start justify-between gap-1 mb-2">
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: t.text, lineHeight: 1.4, flex: 1 }}>
          {deal.title}
        </Typography>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(deal)}
              sx={{ p: 0.4, color: t.muted, "&:hover": { color: "#4F8EF7", bgcolor: "rgba(79,142,247,0.1)" }, borderRadius: "6px" }}>
              <EditRounded sx={{ fontSize: 13 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => onDelete(deal)}
              sx={{ p: 0.4, color: t.muted, "&:hover": { color: "#EF4444", bgcolor: "rgba(239,68,68,0.1)" }, borderRadius: "6px" }}>
              <DeleteRounded sx={{ fontSize: 13 }} />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Contact name */}
      {deal.contactName && (
        <div className="flex items-center gap-1 mb-2">
          <PersonRounded sx={{ fontSize: 12, color: t.muted }} />
          <Typography noWrap sx={{ fontSize: 11, color: t.muted }}>{deal.contactName}</Typography>
        </div>
      )}

      {/* Value + probability */}
      <div className="flex items-center justify-between mt-2">
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: stageColor }}>
          {formatCurrency(deal.value)}
        </Typography>
        <Chip
          label={`${deal.probability}%`}
          size="small"
          sx={{
            fontSize: 10, fontWeight: 700, height: 18,
            bgcolor: `${probColor}20`, color: probColor, border: "none",
          }}
        />
      </div>

      {/* Expected close date */}
      {deal.expectedCloseDate && (
        <div className="flex items-center gap-1 mt-1.5">
          <CalendarTodayRounded sx={{ fontSize: 10, color: t.muted }} />
          <Typography sx={{ fontSize: 10, color: t.muted }}>
            {formatDate(deal.expectedCloseDate)}
          </Typography>
        </div>
      )}
    </div>
  );
}
