import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, getDoc, getDocs, onSnapshot, query,
  where, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { Order, OrderFormData } from "@/types/order";
import { generateOrderNumber } from "@/lib/utils";

const COL = "orders";

export function subscribeToOrders(
  userId: string,
  role: string,
  callback: (orders: Order[]) => void
) {
  const col = collection(db, COL);
  // See contacts.ts — sales role sorts client-side to avoid composite index.
  const q =
    role === "admin"
      ? query(col, orderBy("createdAt", "desc"))
      : query(col, where("assignedTo", "==", userId));
  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Order[];
    if (role !== "admin") {
      orders.sort(
        (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
      );
    }
    callback(orders);
  });
}

export async function createOrder(data: OrderFormData): Promise<string> {
  const snap = await getDocs(collection(db, COL));
  const orderNumber = generateOrderNumber(snap.size);
  const ref = await addDoc(collection(db, COL), {
    ...data,
    orderNumber,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateOrder(id: string, data: Partial<OrderFormData>) {
  return updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
}

export async function updateOrderStatus(id: string, status: Order["status"]) {
  return updateDoc(doc(db, COL, id), { status, updatedAt: serverTimestamp() });
}

export async function deleteOrder(id: string) {
  return deleteDoc(doc(db, COL, id));
}

export async function getOrder(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Order) : null;
}
