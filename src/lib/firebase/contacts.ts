import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, getDoc, onSnapshot, query, where,
  orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { Contact, ContactFormData } from "@/types/contact";

const COL = "contacts";

export function subscribeToContacts(
  userId: string,
  role: string,
  callback: (contacts: Contact[]) => void
) {
  const col = collection(db, COL);
  const q =
    role === "admin"
      ? query(col, orderBy("createdAt", "desc"))
      : query(col, where("assignedTo", "==", userId), orderBy("createdAt", "desc"));

  return onSnapshot(q, (snap) => {
    const contacts = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Contact[];
    callback(contacts);
  });
}

export async function addContact(data: ContactFormData) {
  return addDoc(collection(db, COL), {
    ...data,
    totalOrders: 0,
    totalRevenue: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateContact(id: string, data: Partial<ContactFormData>) {
  return updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteContact(id: string) {
  return deleteDoc(doc(db, COL, id));
}

export async function getContact(id: string): Promise<Contact | null> {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Contact) : null;
}
