import { Timestamp } from "firebase/firestore";

export interface Payment {
  id: string;
  orderId: string;
  contactId: string;
  amount: number;
  method: "cash" | "bank_transfer" | "upi" | "cheque" | "credit";
  reference?: string;
  date: Timestamp;
  notes?: string;
  createdAt: Timestamp;
}

export type PaymentFormData = Omit<Payment, "id" | "createdAt">;
