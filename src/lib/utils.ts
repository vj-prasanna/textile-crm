import { Timestamp } from "firebase/firestore";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(timestamp: Timestamp | Date | undefined): string {
  if (!timestamp) return "—";
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function generateOrderNumber(count: number): string {
  const year = new Date().getFullYear();
  return `ORD-${year}-${String(count + 1).padStart(4, "0")}`;
}

export function generateSKU(category: string, name: string, count: number): string {
  const prefix = category.slice(0, 3).toUpperCase();
  const nameCode = name.slice(0, 3).toUpperCase().replace(/\s/g, "");
  return `${prefix}-${nameCode}-${String(count + 1).padStart(3, "0")}`;
}

export function getStatusColor(status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" {
  const map: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
    draft: "default",
    confirmed: "primary",
    in_production: "warning",
    dispatched: "info",
    delivered: "success",
    cancelled: "error",
    unpaid: "error",
    partial: "warning",
    paid: "success",
    new_lead: "default",
    contacted: "primary",
    quoted: "info",
    negotiation: "warning",
    won: "success",
    lost: "error",
  };
  return map[status] ?? "default";
}
