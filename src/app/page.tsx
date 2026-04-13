"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { Typography, Button, Chip } from "@mui/material";
import {
  AutoAwesomeRounded,
  ShoppingBagRounded,
  ViewKanbanRounded,
  PeopleRounded,
  ArrowForwardRounded,
} from "@mui/icons-material";
import gsap from "gsap";
import { useThemeStore } from "@/store/useThemeStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const FEATURES = [
  {
    Icon: PeopleRounded,
    color: "#10B981",
    bg: "rgba(16,185,129,0.1)",
    title: "Contacts & Customers",
    desc: "Manage your full textile chain — yarn suppliers, fabric mills, garment buyers — all in one place.",
  },
  {
    Icon: ShoppingBagRounded,
    color: "#4F8EF7",
    bg: "rgba(79,142,247,0.1)",
    title: "Order Management",
    desc: "Create multi-item orders, auto-calculate totals, and track every delivery from draft to doorstep.",
  },
  {
    Icon: ViewKanbanRounded,
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.1)",
    title: "Sales Pipeline",
    desc: "Visualize your deals on a Kanban board, forecast revenue, and never let a hot lead go cold.",
  },
  {
    Icon: AutoAwesomeRounded,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
    title: "AI-Powered Insights",
    desc: "Gemini analyses your orders, payments, and pipeline to surface forecasts, risks, and follow-ups.",
  },
];

export default function LandingPage() {
  const { mode } = useThemeStore();
  const dark = mode === "dark";

  const navRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(navRef.current, { opacity: 0, y: -16, duration: 0.5 })
        .from(badgeRef.current, { opacity: 0, y: 12, duration: 0.45 }, "-=0.2")
        .from(headingRef.current, { opacity: 0, y: 32, duration: 0.65 }, "-=0.25")
        .from(subRef.current, { opacity: 0, y: 20, duration: 0.5 }, "-=0.35")
        .from(ctaRef.current, { opacity: 0, y: 16, duration: 0.45 }, "-=0.3")
        .from(
          featuresRef.current?.children ?? [],
          { opacity: 0, y: 28, stagger: 0.1, duration: 0.5 },
          "-=0.15"
        );
    });
    return () => ctx.revert();
  }, []);

  const t = {
    bg: dark ? "#060B18" : "#F1F5F9",
    card: dark ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.9)",
    border: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    text: dark ? "#F1F5F9" : "#1E293B",
    muted: dark ? "#64748B" : "#94A3B8",
    nav: dark ? "rgba(6,11,24,0.85)" : "rgba(241,245,249,0.9)",
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: t.bg, color: t.text }}
    >
      {/* ── Nav ── */}
      <nav
        ref={navRef}
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background: t.nav,
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg,#4F8EF7,#8B5CF6)",
            }}
          >
            <AutoAwesomeRounded sx={{ fontSize: 16, color: "#fff" }} />
          </div>
          <Typography sx={{ fontWeight: 800, fontSize: 16, color: t.text, letterSpacing: "-0.01em" }}>
            Textile CRM
          </Typography>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login">
            <Button
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: 13,
                color: t.muted,
                textTransform: "none",
                "&:hover": { color: t.text },
              }}
            >
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button
              size="small"
              variant="contained"
              sx={{
                fontWeight: 600,
                fontSize: 13,
                textTransform: "none",
                borderRadius: "10px",
                px: 2.5,
                background: "linear-gradient(135deg,#4F8EF7,#6366F1)",
                boxShadow: "none",
                "&:hover": {
                  background: "linear-gradient(135deg,#3B82F6,#4F46E5)",
                  boxShadow: "none",
                },
              }}
            >
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="flex flex-col items-center text-center px-6 pt-24 pb-20">
        <div ref={badgeRef}>
          <Chip
            icon={<AutoAwesomeRounded sx={{ fontSize: 13 }} />}
            label="AI-Powered Textile CRM"
            size="small"
            sx={{
              mb: 4,
              background: "linear-gradient(135deg,rgba(79,142,247,0.12),rgba(139,92,246,0.12))",
              border: "1px solid rgba(99,102,241,0.25)",
              color: "#8B5CF6",
              fontWeight: 600,
              fontSize: 12,
              "& .MuiChip-icon": { color: "#8B5CF6" },
            }}
          />
        </div>

        <h1
          ref={headingRef}
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            maxWidth: 720,
            margin: "0 auto 1.25rem",
            background: dark
              ? "linear-gradient(135deg,#F1F5F9 30%,#94A3B8)"
              : "linear-gradient(135deg,#1E293B 30%,#475569)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Run Your Textile Business.{" "}
          <span
            style={{
              background: "linear-gradient(135deg,#4F8EF7,#8B5CF6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Smarter.
          </span>
        </h1>

        <p
          ref={subRef}
          style={{
            fontSize: 18,
            color: t.muted,
            maxWidth: 560,
            margin: "0 auto 2.5rem",
            lineHeight: 1.7,
          }}
        >
          From yarn suppliers to garment buyers — manage contacts, orders, payments,
          and your full sales pipeline powered by Google Gemini AI insights.
        </p>

        <div ref={ctaRef} className="flex flex-wrap gap-3 justify-center">
          <Link href="/register">
            <Button
              variant="contained"
              endIcon={<ArrowForwardRounded />}
              sx={{
                fontWeight: 700,
                fontSize: 15,
                textTransform: "none",
                borderRadius: "12px",
                px: 3.5,
                py: 1.4,
                background: "linear-gradient(135deg,#4F8EF7,#6366F1)",
                boxShadow: "0 8px 24px rgba(79,142,247,0.35)",
                "&:hover": {
                  background: "linear-gradient(135deg,#3B82F6,#4F46E5)",
                  boxShadow: "0 12px 32px rgba(79,142,247,0.45)",
                },
              }}
            >
              Start for Free
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outlined"
              sx={{
                fontWeight: 600,
                fontSize: 15,
                textTransform: "none",
                borderRadius: "12px",
                px: 3.5,
                py: 1.4,
                color: t.text,
                borderColor: t.border,
                "&:hover": {
                  borderColor: "#4F8EF7",
                  background: "rgba(79,142,247,0.06)",
                },
              }}
            >
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 pb-24 max-w-5xl mx-auto w-full">
        <div
          ref={featuresRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {FEATURES.map(({ Icon, color, bg, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl p-5 flex flex-col gap-3"
              style={{
                background: t.card,
                border: `1px solid ${t.border}`,
                backdropFilter: "blur(20px)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: bg }}
              >
                <Icon sx={{ fontSize: 20, color }} />
              </div>
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: t.text }}>
                {title}
              </Typography>
              <Typography sx={{ fontSize: 13, color: t.muted, lineHeight: 1.65 }}>
                {desc}
              </Typography>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="mt-auto px-6 py-6 text-center"
        style={{ borderTop: `1px solid ${t.border}` }}
      >
        <Typography sx={{ fontSize: 13, color: t.muted }}>
          © {new Date().getFullYear()} Textile CRM · Built with Next.js 15 + Firebase + Google Gemini
        </Typography>
      </footer>
    </div>
  );
}
