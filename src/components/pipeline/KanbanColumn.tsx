"use client";

import { useState } from "react";
import { Typography, Skeleton } from "@mui/material";
import { Deal } from "@/types/pipeline";
import { DealCard } from "./DealCard";
import { STAGE_CONFIG } from "./stageConfig";
import { formatCurrency } from "@/lib/utils";

interface Props {
  stage: Deal["stage"];
  deals: Deal[];
  loading: boolean;
  dark: boolean;
  onEdit: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
  onDragStart: (e: React.DragEvent, dealId: string) => void;
  onDrop: (e: React.DragEvent, stage: Deal["stage"]) => void;
}

export function KanbanColumn({
  stage, deals, loading, dark,
  onEdit, onDelete, onDragStart, onDrop,
}: Props) {
  const [dragOver, setDragOver] = useState(false);
  const cfg = STAGE_CONFIG[stage];
  const total = deals.reduce((s, d) => s + d.value, 0);

  const t = {
    col: dark ? "rgba(15,23,42,0.4)" : "rgba(255,255,255,0.6)",
    border: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    text: dark ? "#F1F5F9" : "#1E293B",
    muted: dark ? "#64748B" : "#94A3B8",
  };

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden flex-shrink-0"
      style={{
        width: 272,
        background: dragOver
          ? (dark ? `${cfg.color}18` : `${cfg.color}0A`)
          : t.col,
        border: `1px solid ${dragOver ? cfg.color + "50" : t.border}`,
        backdropFilter: "blur(20px)",
        transition: "background 0.15s, border-color 0.15s",
      }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { setDragOver(false); onDrop(e, stage); }}
    >
      {/* Column header */}
      <div className="px-3 py-3 flex-shrink-0"
        style={{ borderBottom: `1px solid ${t.border}` }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: cfg.color }} />
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: t.text }}>
              {cfg.label}
            </Typography>
          </div>
          <div className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: `${cfg.color}25` }}>
            <Typography sx={{ fontSize: 10, fontWeight: 700, color: cfg.color }}>
              {deals.length}
            </Typography>
          </div>
        </div>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: cfg.color }}>
          {loading ? "—" : formatCurrency(total)}
        </Typography>
      </div>

      {/* Cards list */}
      <div
        className="flex-1 overflow-y-auto p-2 space-y-2"
        style={{ minHeight: 120, maxHeight: "calc(100vh - 280px)" }}
      >
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={80}
              sx={{
                borderRadius: "10px",
                bgcolor: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
              }}
            />
          ))
        ) : deals.length === 0 ? (
          <div className="flex items-center justify-center py-6">
            <Typography sx={{ fontSize: 11, color: t.muted, textAlign: "center" }}>
              Drop deals here
            </Typography>
          </div>
        ) : (
          deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              dark={dark}
              onEdit={onEdit}
              onDelete={onDelete}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
}
