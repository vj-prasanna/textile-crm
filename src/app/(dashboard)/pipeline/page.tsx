"use client";

import { useRef, useState, useMemo } from "react";
import { Typography, Button, Skeleton } from "@mui/material";
import {
  AddRounded,
  ViewKanbanRounded,
  TrendingUpRounded,
  EmojiEventsRounded,
  GroupsRounded,
} from "@mui/icons-material";
import { useThemeStore } from "@/store/useThemeStore";
import { usePipeline } from "@/hooks/usePipeline";
import { updateDealStage, deleteDeal } from "@/lib/firebase/pipeline";
import { Deal } from "@/types/pipeline";
import { KanbanColumn } from "@/components/pipeline/KanbanColumn";
import { DealDrawer } from "@/components/pipeline/DealDrawer";
import { DeleteDialog } from "@/components/pipeline/DeleteDialog";
import { STAGE_ORDER } from "@/components/pipeline/stageConfig";
import { formatCurrency } from "@/lib/utils";

export default function PipelinePage() {
  const { mode } = useThemeStore();
  const dark = mode === "dark";
  const { deals, loading } = usePipeline();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [deleting, setDeleting] = useState<Deal | null>(null);
  const dragDealId = useRef<string>("");

  const dealsByStage = useMemo(() => {
    const map: Record<Deal["stage"], Deal[]> = {
      new_lead: [], contacted: [], quoted: [],
      negotiation: [], won: [], lost: [],
    };
    deals.forEach((d) => { map[d.stage]?.push(d); });
    return map;
  }, [deals]);

  const stats = useMemo(() => ({
    total: deals.length,
    pipeline: deals
      .filter((d) => d.stage !== "won" && d.stage !== "lost")
      .reduce((s, d) => s + d.value, 0),
    won: deals.filter((d) => d.stage === "won").reduce((s, d) => s + d.value, 0),
    wonCount: deals.filter((d) => d.stage === "won").length,
  }), [deals]);

  function handleDragStart(e: React.DragEvent, dealId: string) {
    dragDealId.current = dealId;
    e.dataTransfer.effectAllowed = "move";
  }

  async function handleDrop(e: React.DragEvent, stage: Deal["stage"]) {
    e.preventDefault();
    const id = dragDealId.current;
    if (!id) return;
    const deal = deals.find((d) => d.id === id);
    if (deal && deal.stage !== stage) {
      await updateDealStage(id, stage);
    }
    dragDealId.current = "";
  }

  function openEdit(deal: Deal) { setEditing(deal); setDrawerOpen(true); }
  function openAdd() { setEditing(null); setDrawerOpen(true); }
  function closeDrawer() { setDrawerOpen(false); setEditing(null); }

  const t = {
    card: dark ? "rgba(15,23,42,0.6)" : "rgba(255,255,255,0.8)",
    border: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    text: dark ? "#F1F5F9" : "#1E293B",
    muted: dark ? "#64748B" : "#94A3B8",
  };

  const statCards = [
    { label: "Active Deals",   value: stats.total,                   icon: ViewKanbanRounded,  color: "#4F8EF7" },
    { label: "Pipeline Value", value: formatCurrency(stats.pipeline), icon: TrendingUpRounded,  color: "#8B5CF6" },
    { label: "Won Value",      value: formatCurrency(stats.won),      icon: EmojiEventsRounded, color: "#10B981" },
    { label: "Deals Won",      value: stats.wonCount,                 icon: GroupsRounded,      color: "#F59E0B" },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Typography sx={{ fontWeight: 700, fontSize: 22, color: t.text }}>Sales Pipeline</Typography>
          <Typography sx={{ fontSize: 13, color: t.muted, mt: 0.3 }}>Track deals across all stages</Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={openAdd}
          sx={{
            borderRadius: "10px", fontWeight: 700, px: 2.5,
            background: "linear-gradient(135deg,#4F8EF7,#6366F1)",
            boxShadow: "0 4px 15px rgba(79,142,247,0.3)",
            "&:hover": { background: "linear-gradient(135deg,#3B82F6,#4F46E5)" },
          }}
        >
          Add Deal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl p-4"
            style={{ background: t.card, border: `1px solid ${t.border}`, backdropFilter: "blur(20px)" }}>
            <div className="flex items-center justify-between mb-2">
              <Typography sx={{ fontSize: 12, color: t.muted, fontWeight: 600 }}>{s.label}</Typography>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20` }}>
                <s.icon sx={{ fontSize: 16, color: s.color }} />
              </div>
            </div>
            <Typography sx={{ fontSize: typeof s.value === "string" ? 18 : 28, fontWeight: 700, color: t.text }}>
              {loading ? <Skeleton width={80} sx={{ bgcolor: t.border }} /> : s.value}
            </Typography>
          </div>
        ))}
      </div>

      {/* Kanban board */}
      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 400 }}>
        {STAGE_ORDER.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            deals={dealsByStage[stage]}
            loading={loading}
            dark={dark}
            onEdit={openEdit}
            onDelete={setDeleting}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
          />
        ))}
      </div>

      <DealDrawer open={drawerOpen} onClose={closeDrawer} editing={editing} />

      {deleting && (
        <DeleteDialog
          open={!!deleting}
          title={deleting.title}
          onClose={() => setDeleting(null)}
          onConfirm={() => deleteDeal(deleting!.id)}
        />
      )}
    </>
  );
}
