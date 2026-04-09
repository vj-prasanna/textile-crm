import { Timestamp } from "firebase/firestore";

export interface Contact {
  id: string;
  type: "customer" | "supplier";
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstNumber?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  category: "yarn" | "fabric" | "garment" | "retail" | "wholesale" | "export";
  assignedTo: string;
  totalOrders: number;
  totalRevenue: number;
  lastOrderDate?: Timestamp;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ContactFormData = Omit<Contact, "id" | "totalOrders" | "totalRevenue" | "lastOrderDate" | "createdAt" | "updatedAt">;
