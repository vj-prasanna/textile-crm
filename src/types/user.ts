import { Timestamp } from "firebase/firestore";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: "admin" | "sales";
  avatar?: string;
  phone?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
