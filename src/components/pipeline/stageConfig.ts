import { Deal } from "@/types/pipeline";

export const STAGE_CONFIG: Record<
  Deal["stage"],
  { label: string; color: string; bg: string }
> = {
  new_lead:    { label: "New Lead",    color: "#6366F1", bg: "rgba(99,102,241,0.08)"  },
  contacted:   { label: "Contacted",   color: "#4F8EF7", bg: "rgba(79,142,247,0.08)"  },
  quoted:      { label: "Quoted",      color: "#F59E0B", bg: "rgba(245,158,11,0.08)"  },
  negotiation: { label: "Negotiation", color: "#F97316", bg: "rgba(249,115,22,0.08)"  },
  won:         { label: "Won",         color: "#10B981", bg: "rgba(16,185,129,0.08)"  },
  lost:        { label: "Lost",        color: "#EF4444", bg: "rgba(239,68,68,0.08)"   },
};

export const STAGE_ORDER: Deal["stage"][] = [
  "new_lead", "contacted", "quoted", "negotiation", "won", "lost",
];
