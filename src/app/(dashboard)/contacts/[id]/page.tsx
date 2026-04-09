"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Typography, Button, Chip, IconButton, Skeleton } from "@mui/material";
import {
  ArrowBackRounded, EditRounded,
  EmailRounded, PhoneRounded, LocationOnRounded,
  ReceiptLongRounded, AttachMoneyRounded,
} from "@mui/icons-material";
import { useThemeStore } from "@/store/useThemeStore";
import { getContact } from "@/lib/firebase/contacts";
import { ContactDrawer } from "@/components/contacts/ContactDrawer";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Contact } from "@/types/contact";

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  yarn:      { bg: "rgba(245,158,11,0.15)",  color: "#F59E0B" },
  fabric:    { bg: "rgba(79,142,247,0.15)",  color: "#4F8EF7" },
  garment:   { bg: "rgba(139,92,246,0.15)",  color: "#8B5CF6" },
  retail:    { bg: "rgba(16,185,129,0.15)",  color: "#10B981" },
  wholesale: { bg: "rgba(249,115,22,0.15)",  color: "#F97316" },
  export:    { bg: "rgba(20,184,166,0.15)",  color: "#14B8A6" },
};

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { mode } = useThemeStore();
  const dark = mode === "dark";

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const t = {
    card: dark ? "rgba(15,23,42,0.6)" : "rgba(255,255,255,0.8)",
    border: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    text: dark ? "#F1F5F9" : "#1E293B",
    muted: dark ? "#64748B" : "#94A3B8",
  };

  async function load() {
    setLoading(true);
    const data = await getContact(id);
    setContact(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  const cat = contact ? (CATEGORY_COLORS[contact.category] ?? { bg: "rgba(100,116,139,0.15)", color: "#64748B" }) : null;

  function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string }) {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: dark ? "rgba(79,142,247,0.1)" : "rgba(79,142,247,0.08)" }}>
          <Icon sx={{ fontSize: 16, color: "#4F8EF7" }} />
        </div>
        <div>
          <Typography sx={{ fontSize: 11, color: t.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</Typography>
          <Typography sx={{ fontSize: 14, color: t.text, mt: 0.3 }}>{value}</Typography>
        </div>
      </div>
    );
  }

  function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
    return (
      <div className="rounded-xl p-4" style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: `1px solid ${t.border}` }}>
        <Typography sx={{ fontSize: 12, color: t.muted, fontWeight: 600, mb: 0.5 }}>{label}</Typography>
        <Typography sx={{ fontSize: 20, fontWeight: 700, color }}>{value}</Typography>
      </div>
    );
  }

  return (
    <>
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-6">
        <Button startIcon={<ArrowBackRounded />} onClick={() => router.push("/contacts")}
          sx={{ color: t.muted, borderRadius: "10px", fontWeight: 600, fontSize: 13,
            "&:hover": { color: t.text, bgcolor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" } }}>
          Back to Contacts
        </Button>
        {contact && (
          <Button variant="outlined" startIcon={<EditRounded />} onClick={() => setDrawerOpen(true)}
            sx={{ borderRadius: "10px", fontWeight: 600, borderColor: t.border, color: t.text,
              "&:hover": { borderColor: "#4F8EF7", color: "#4F8EF7" } }}>
            Edit Contact
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={80} sx={{ borderRadius: 3, bgcolor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }} />
          ))}
        </div>
      ) : !contact ? (
        <div className="flex flex-col items-center justify-center gap-3" style={{ minHeight: 300 }}>
          <Typography sx={{ color: t.muted }}>Contact not found.</Typography>
          <Button onClick={() => router.push("/contacts")} sx={{ color: "#4F8EF7" }}>Back to Contacts</Button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Header card */}
          <div className="rounded-2xl p-6" style={{ background: t.card, border: `1px solid ${t.border}`, backdropFilter: "blur(20px)" }}>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#4F8EF7,#8B5CF6)", boxShadow: "0 8px 20px rgba(79,142,247,0.3)" }}>
                {contact.companyName[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Typography sx={{ fontSize: 22, fontWeight: 700, color: t.text }}>{contact.companyName}</Typography>
                  <Chip label={contact.type} size="small" sx={{
                    fontSize: 11, fontWeight: 600, height: 22,
                    background: contact.type === "customer" ? "rgba(79,142,247,0.15)" : "rgba(16,185,129,0.15)",
                    color: contact.type === "customer" ? "#4F8EF7" : "#10B981",
                    textTransform: "capitalize", border: "none",
                  }} />
                  {cat && <Chip label={contact.category} size="small" sx={{
                    fontSize: 11, fontWeight: 600, height: 22,
                    background: cat.bg, color: cat.color,
                    textTransform: "capitalize", border: "none",
                  }} />}
                </div>
                <Typography sx={{ fontSize: 15, color: t.muted }}>{contact.contactPerson}</Typography>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Contact info */}
            <div className="lg:col-span-2 rounded-2xl p-6 space-y-5"
              style={{ background: t.card, border: `1px solid ${t.border}`, backdropFilter: "blur(20px)" }}>
              <Typography sx={{ fontWeight: 700, fontSize: 15, color: t.text }}>Contact Information</Typography>
              <InfoRow icon={PhoneRounded} label="Phone" value={contact.phone} />
              <InfoRow icon={EmailRounded} label="Email" value={contact.email} />
              <InfoRow icon={LocationOnRounded} label="Address"
                value={[contact.address?.street, contact.address?.city, contact.address?.state, contact.address?.pincode].filter(Boolean).join(", ")} />
              {contact.gstNumber && <InfoRow icon={ReceiptLongRounded} label="GST Number" value={contact.gstNumber} />}
              {contact.notes && (
                <div>
                  <Typography sx={{ fontSize: 11, color: t.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", mb: 1 }}>Notes</Typography>
                  <Typography sx={{ fontSize: 14, color: t.text, lineHeight: 1.6 }}>{contact.notes}</Typography>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="rounded-2xl p-5 space-y-4"
                style={{ background: t.card, border: `1px solid ${t.border}`, backdropFilter: "blur(20px)" }}>
                <Typography sx={{ fontWeight: 700, fontSize: 15, color: t.text }}>Activity</Typography>
                <StatCard label="Total Orders" value={contact.totalOrders ?? 0} color="#4F8EF7" />
                <StatCard label="Total Revenue" value={formatCurrency(contact.totalRevenue ?? 0)} color="#10B981" />
                {contact.lastOrderDate && (
                  <StatCard label="Last Order" value={formatDate(contact.lastOrderDate)} color="#F59E0B" />
                )}
              </div>

              <div className="rounded-2xl p-5"
                style={{ background: t.card, border: `1px solid ${t.border}`, backdropFilter: "blur(20px)" }}>
                <Typography sx={{ fontWeight: 700, fontSize: 15, color: t.text, mb: 2 }}>Details</Typography>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Typography sx={{ fontSize: 13, color: t.muted }}>Member since</Typography>
                    <Typography sx={{ fontSize: 13, color: t.text, fontWeight: 500 }}>
                      {contact.createdAt ? formatDate(contact.createdAt) : "—"}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography sx={{ fontSize: 13, color: t.muted }}>Category</Typography>
                    <Typography sx={{ fontSize: 13, color: t.text, fontWeight: 500, textTransform: "capitalize" }}>{contact.category}</Typography>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {contact && (
        <ContactDrawer open={drawerOpen} onClose={() => { setDrawerOpen(false); load(); }} editing={contact} />
      )}
    </>
  );
}
