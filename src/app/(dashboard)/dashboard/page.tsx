"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Typography, Skeleton, TextField, IconButton, Chip } from "@mui/material";
import {
  TrendingUpRounded,
  PersonSearchRounded,
  WarningAmberRounded,
  SummarizeRounded,
  SendRounded,
  RefreshRounded,
  SmartToyRounded,
  AutoAwesomeRounded,
  CurrencyRupeeRounded,
  ShoppingBagRounded,
  PeopleRounded,
  ViewKanbanRounded,
} from "@mui/icons-material";
import { useThemeStore } from "@/store/useThemeStore";
import { useOrders } from "@/hooks/useOrders";
import { useContacts } from "@/hooks/useContacts";
import { usePipeline } from "@/hooks/usePipeline";
import { usePayments } from "@/hooks/usePayments";
import { formatCurrency } from "@/lib/utils";
import { AIInsights, BusinessSummary } from "@/lib/ai/gemini";
import { Counter } from "@/components/animations/Counter";
import { StaggerList } from "@/components/animations/StaggerList";

/* ─── constants ─── */

const INSIGHT_CARDS: {
  key: keyof AIInsights;
  label: string;
  Icon: React.ElementType;
  color: string;
  bg: string;
}[] = [
  {
    key: "salesForecast",
    label: "Sales Forecast",
    Icon: TrendingUpRounded,
    color: "#4F8EF7",
    bg: "rgba(79,142,247,0.1)",
  },
  {
    key: "followUpSuggestions",
    label: "Follow-up Suggestions",
    Icon: PersonSearchRounded,
    color: "#10B981",
    bg: "rgba(16,185,129,0.1)",
  },
  {
    key: "dealRiskAlerts",
    label: "Deal Risk Alerts",
    Icon: WarningAmberRounded,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
  },
  {
    key: "weeklySummary",
    label: "Weekly Summary",
    Icon: SummarizeRounded,
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.1)",
  },
];

/* ─── component ─── */

export default function DashboardPage() {
  const { mode } = useThemeStore();
  const dark = mode === "dark";

  // Load data from existing Firestore subscriptions
  const { orders, loading: oLoad } = useOrders();
  const { contacts, loading: cLoad } = useContacts();
  const { deals, loading: dLoad } = usePipeline();
  const { payments, loading: pLoad } = usePayments();
  const dataLoading = oLoad || cLoad || dLoad || pLoad;

  // AI insights state
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  // Ask AI state
  const [question, setQuestion] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [askError, setAskError] = useState<string | null>(null);

  /* ─── theme tokens ─── */
  const t = {
    card: dark ? "rgba(15,23,42,0.65)" : "rgba(255,255,255,0.9)",
    border: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.09)",
    text: dark ? "#F1F5F9" : "#1E293B",
    muted: dark ? "#64748B" : "#94A3B8",
    sub: dark ? "#475569" : "#CBD5E1",
  };

  /* ─── stats ─── */
  const stats = useMemo(() => {
    const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
    const activeOrders = orders.filter(
      (o) => !["delivered", "cancelled"].includes(o.status)
    ).length;
    const customers = contacts.filter((c) => c.type === "customer").length;
    const pipelineValue = deals
      .filter((d) => !["won", "lost"].includes(d.stage))
      .reduce((s, d) => s + d.value, 0);
    return { totalRevenue, activeOrders, customers, pipelineValue };
  }, [orders, contacts, deals, payments]);

  /* ─── build compact summary for Gemini (keeps prompt small → fast response) ─── */
  function buildSummary(): BusinessSummary {
    const STAGES = ["new_lead", "contacted", "quoted", "negotiation", "won", "lost"];
    const STATUS_LIST = ["draft", "confirmed", "in_production", "dispatched", "delivered", "cancelled"];

    return {
      totalRevenue: payments.reduce((s, p) => s + p.amount, 0),
      activeOrders: orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length,
      unpaidOrders: orders.filter((o) => o.paymentStatus !== "paid").length,
      totalCustomers: contacts.filter((c) => c.type === "customer").length,
      pipelineValue: deals
        .filter((d) => !["won", "lost"].includes(d.stage))
        .reduce((s, d) => s + d.value, 0),
      topCustomers: contacts
        .filter((c) => c.type === "customer")
        .sort((a, b) => (b.totalRevenue ?? 0) - (a.totalRevenue ?? 0))
        .slice(0, 5)
        .map((c) => ({ name: c.companyName, revenue: c.totalRevenue ?? 0, orders: c.totalOrders ?? 0 })),
      dealsByStage: STAGES.map((stage) => ({
        stage,
        count: deals.filter((d) => d.stage === stage).length,
        value: deals.filter((d) => d.stage === stage).reduce((s, d) => s + d.value, 0),
      })),
      ordersByStatus: STATUS_LIST.map((status) => ({
        status,
        count: orders.filter((o) => o.status === status).length,
      })),
      recentPayments: payments.slice(0, 5).map((p) => ({
        contact: p.contactName,
        amount: p.amount,
        method: p.method,
      })),
    };
  }

  async function fetchInsights(force = false) {
    if (force) hasFetched.current = false;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "insights", summary: buildSummary() }),
      });
      if (!res.ok) {
        let errorMsg = "Failed to fetch insights";
        try {
          const err = (await res.json()) as { error?: string };
          errorMsg = err.error ?? errorMsg;
        } catch { /* response was not JSON */ }
        throw new Error(errorMsg);
      }
      const data = (await res.json()) as AIInsights;
      setInsights(data);
      hasFetched.current = true;
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setAiLoading(false);
    }
  }

  // Fire once data is loaded
  useEffect(() => {
    if (dataLoading || hasFetched.current) return;
    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLoading]);

  async function handleAsk() {
    const q = question.trim();
    if (!q) return;
    setAskLoading(true);
    setAnswer(null);
    setAskError(null);
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "ask", summary: buildSummary(), question: q }),
      });
      if (!res.ok) {
        let errorMsg = "Failed to answer";
        try {
          const err = (await res.json()) as { error?: string };
          errorMsg = err.error ?? errorMsg;
        } catch { /* response was not JSON */ }
        throw new Error(errorMsg);
      }
      const data = (await res.json()) as { answer: string };
      setAnswer(data.answer);
    } catch (err) {
      setAskError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setAskLoading(false);
    }
  }

  const isLoading = dataLoading || aiLoading;

  /* ─── stat card data ─── */
  const statCards = [
    {
      label: "Total Revenue",
      rawValue: stats.totalRevenue,
      isCurrency: true,
      Icon: CurrencyRupeeRounded,
      color: "#10B981",
      bg: "rgba(16,185,129,0.1)",
    },
    {
      label: "Active Orders",
      rawValue: stats.activeOrders,
      isCurrency: false,
      Icon: ShoppingBagRounded,
      color: "#4F8EF7",
      bg: "rgba(79,142,247,0.1)",
    },
    {
      label: "Customers",
      rawValue: stats.customers,
      isCurrency: false,
      Icon: PeopleRounded,
      color: "#8B5CF6",
      bg: "rgba(139,92,246,0.1)",
    },
    {
      label: "Pipeline Value",
      rawValue: stats.pipelineValue,
      isCurrency: true,
      Icon: ViewKanbanRounded,
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.1)",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <Typography sx={{ fontWeight: 800, fontSize: 24, color: t.text, letterSpacing: "-0.02em" }}>
            Dashboard
          </Typography>
          <Typography sx={{ fontSize: 13, color: t.muted, mt: 0.4 }}>
            Overview of your textile business
          </Typography>
        </div>
        <Chip
          icon={<AutoAwesomeRounded sx={{ fontSize: 14 }} />}
          label="AI Powered"
          size="small"
          sx={{
            background: "linear-gradient(135deg,rgba(79,142,247,0.12),rgba(139,92,246,0.12))",
            border: "1px solid rgba(99,102,241,0.25)",
            color: "#8B5CF6",
            fontWeight: 600,
            fontSize: 11,
            "& .MuiChip-icon": { color: "#8B5CF6" },
          }}
        />
      </div>

      {/* ── Stats Row ── */}
      <StaggerList className="grid grid-cols-2 lg:grid-cols-4 gap-4" delay={0.1}>
        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4"
            style={{ background: t.card, border: `1px solid ${t.border}`, backdropFilter: "blur(20px)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: t.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {s.label}
              </Typography>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                <s.Icon sx={{ fontSize: 16, color: s.color }} />
              </div>
            </div>
            <Typography
              component="div"
              sx={{ fontSize: s.isCurrency ? 20 : 28, fontWeight: 800, color: t.text, letterSpacing: "-0.02em" }}
            >
              {dataLoading ? (
                <Skeleton width={80} sx={{ bgcolor: t.border }} />
              ) : (
                <Counter
                  key={s.rawValue}
                  target={s.rawValue}
                  formatter={s.isCurrency ? formatCurrency : undefined}
                />
              )}
            </Typography>
          </div>
        ))}
      </StaggerList>

      {/* ── AI Insights Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,rgba(79,142,247,0.2),rgba(139,92,246,0.2))" }}
          >
            <AutoAwesomeRounded sx={{ fontSize: 16, color: "#8B5CF6" }} />
          </div>
          <div>
            <Typography sx={{ fontWeight: 700, fontSize: 15, color: t.text }}>
              AI Insights
            </Typography>
            <Typography sx={{ fontSize: 11, color: t.muted }}>Powered by Gemini · Updates on refresh</Typography>
          </div>
        </div>
        <IconButton
          onClick={() => fetchInsights(true)}
          disabled={isLoading}
          size="small"
          sx={{
            background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
            border: `1px solid ${t.border}`,
            color: t.muted,
            "&:hover": { color: "#4F8EF7", borderColor: "rgba(79,142,247,0.3)" },
          }}
        >
          <RefreshRounded sx={{ fontSize: 18 }} />
        </IconButton>
      </div>

      {/* ── Error Banner ── */}
      {aiError && !aiLoading && (
        <div
          className="rounded-2xl px-5 py-4"
          style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)" }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#EF4444" }}>
            Could not load AI insights
          </Typography>
          <Typography sx={{ fontSize: 12, color: t.muted, mt: 0.5 }}>
            {aiError}. Click refresh to try again.
          </Typography>
        </div>
      )}

      {/* ── 4 Insight Cards ── */}
      <StaggerList className="grid grid-cols-1 md:grid-cols-2 gap-4" delay={0.15} stagger={0.1}>
        {INSIGHT_CARDS.map(({ key, label, Icon, color, bg }) => (
          <div
            key={key}
            className="rounded-2xl p-5 flex flex-col gap-3"
            style={{ background: t.card, border: `1px solid ${t.border}`, backdropFilter: "blur(20px)" }}
          >
            {/* card header */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: bg, border: `1px solid ${color}25` }}
              >
                <Icon sx={{ fontSize: 18, color }} />
              </div>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: t.text }}>
                {label}
              </Typography>
            </div>

            {/* divider */}
            <div style={{ height: 1, background: t.border }} />

            {/* content */}
            {isLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton variant="text" sx={{ bgcolor: t.border, borderRadius: 1, fontSize: 14 }} />
                <Skeleton variant="text" width="90%" sx={{ bgcolor: t.border, borderRadius: 1, fontSize: 14 }} />
                <Skeleton variant="text" width="70%" sx={{ bgcolor: t.border, borderRadius: 1, fontSize: 14 }} />
              </div>
            ) : aiError ? (
              <Typography sx={{ fontSize: 13, color: t.muted, fontStyle: "italic" }}>
                Unavailable — click refresh to retry.
              </Typography>
            ) : (
              <Typography sx={{ fontSize: 13.5, color: t.muted, lineHeight: 1.7 }}>
                {insights?.[key] ?? "—"}
              </Typography>
            )}
          </div>
        ))}
      </StaggerList>

      {/* ── Ask AI ── */}
      <div
        className="rounded-2xl p-5 flex flex-col gap-4"
        style={{ background: t.card, border: `1px solid ${t.border}`, backdropFilter: "blur(20px)" }}
      >
        {/* header */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,rgba(79,142,247,0.12),rgba(99,102,241,0.12))",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            <SmartToyRounded sx={{ fontSize: 18, color: "#6366F1" }} />
          </div>
          <div>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: t.text }}>Ask AI</Typography>
            <Typography sx={{ fontSize: 12, color: t.muted }}>
              Ask anything about your business data
            </Typography>
          </div>
        </div>

        {/* input */}
        <div className="flex gap-2">
          <TextField
            fullWidth
            size="small"
            placeholder="e.g. Which customers haven't ordered in 30 days?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !askLoading) handleAsk(); }}
            disabled={askLoading}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                fontSize: 13,
                background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                color: t.text,
                "& fieldset": { borderColor: t.border },
                "&:hover fieldset": { borderColor: "rgba(79,142,247,0.35)" },
                "&.Mui-focused fieldset": { borderColor: "#4F8EF7" },
              },
              "& .MuiInputBase-input::placeholder": { color: t.muted, opacity: 1, fontSize: 13 },
            }}
          />
          <IconButton
            onClick={handleAsk}
            disabled={askLoading || !question.trim()}
            sx={{
              borderRadius: "10px",
              px: 2,
              background: question.trim() ? "linear-gradient(135deg,#4F8EF7,#6366F1)" : t.border,
              color: question.trim() ? "#fff" : t.muted,
              flexShrink: 0,
              transition: "all 0.15s",
              "&:hover": {
                background: question.trim() ? "linear-gradient(135deg,#3B82F6,#4F46E5)" : t.border,
              },
              "&.Mui-disabled": { background: t.border, color: t.sub },
            }}
          >
            <SendRounded sx={{ fontSize: 18 }} />
          </IconButton>
        </div>

        {/* ask loading */}
        {askLoading && (
          <div className="flex flex-col gap-2">
            <Skeleton variant="text" sx={{ bgcolor: t.border, borderRadius: 1, fontSize: 14 }} />
            <Skeleton variant="text" width="85%" sx={{ bgcolor: t.border, borderRadius: 1, fontSize: 14 }} />
          </div>
        )}

        {/* answer */}
        {answer && !askLoading && (
          <div
            className="rounded-xl p-4"
            style={{
              background: dark ? "rgba(79,142,247,0.06)" : "rgba(79,142,247,0.05)",
              border: "1px solid rgba(79,142,247,0.15)",
            }}
          >
            <div className="flex items-start gap-2">
              <AutoAwesomeRounded sx={{ fontSize: 15, color: "#4F8EF7", mt: "2px", flexShrink: 0 }} />
              <Typography sx={{ fontSize: 13.5, color: t.text, lineHeight: 1.7 }}>
                {answer}
              </Typography>
            </div>
          </div>
        )}

        {/* ask error */}
        {askError && !askLoading && (
          <div
            className="rounded-xl px-4 py-3"
            style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}
          >
            <Typography sx={{ fontSize: 13, color: "#EF4444" }}>{askError}</Typography>
          </div>
        )}
      </div>
    </div>
  );
}
