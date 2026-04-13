import { Timestamp } from "firebase/firestore";

export interface Payment {
  id: string;
  orderId: string;
  orderNumber: string;
  contactId: string;
  contactName: string;
  amount: number;
  method: "cash" | "bank_transfer" | "upi" | "cheque" | "credit";
  reference?: string;
  date: Timestamp;
  notes?: string;
  assignedTo: string;
  createdAt: Timestamp;
}

export type PaymentFormData = Omit<Payment, "id" | "assignedTo" | "createdAt">;
