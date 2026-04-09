import { Timestamp } from "firebase/firestore";

export interface Activity {
  type: "call" | "email" | "meeting" | "note";
  description: string;
  date: Timestamp;
}

export interface Deal {
  id: string;
  contactId?: string;
  contactName?: string;
  title: string;
  value: number;
  stage: "new_lead" | "contacted" | "quoted" | "negotiation" | "won" | "lost";
  probability: number;
  assignedTo: string;
  expectedCloseDate?: Timestamp;
  notes?: string;
  activities: Activity[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type DealFormData = Omit<Deal, "id" | "activities" | "createdAt" | "updatedAt">;
