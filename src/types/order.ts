import { Timestamp } from "firebase/firestore";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  contactId: string;
  contactName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  status: "draft" | "confirmed" | "in_production" | "dispatched" | "delivered" | "cancelled";
  paymentStatus: "unpaid" | "partial" | "paid";
  assignedTo: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type OrderFormData = Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">;
