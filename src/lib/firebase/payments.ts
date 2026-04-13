import {
  collection, addDoc, deleteDoc, getDoc, getDocs,
  doc, onSnapshot, query, where, orderBy,
  serverTimestamp, updateDoc,
} from "firebase/firestore";
import { db } from "./config";
import { Payment, PaymentFormData } from "@/types/payment";
import { Order } from "@/types/order";

const COL = "payments";

export function subscribeToPayments(
  userId: string,
  role: string,
  callback: (payments: Payment[]) => void
) {
  const col = collection(db, COL);
  // See contacts.ts — sales role sorts client-side to avoid composite index.
  const q =
    role === "admin"
      ? query(col, orderBy("createdAt", "desc"))
      : query(col, where("assignedTo", "==", userId));
  return onSnapshot(q, (snap) => {
    const payments = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Payment[];
    if (role !== "admin") {
      payments.sort(
        (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
      );
    }
    callback(payments);
  });
}

/** Create a payment, then sync the order paymentStatus and contact totalRevenue. */
export async function createPayment(data: PaymentFormData): Promise<string> {
  // Sum existing payments for this order before inserting
  const existingSnap = await getDocs(
    query(collection(db, COL), where("orderId", "==", data.orderId))
  );
  const alreadyPaid = existingSnap.docs.reduce(
    (s, d) => s + (d.data() as Payment).amount,
    0
  );
  const totalPaid = alreadyPaid + data.amount;

  // Inherit assignedTo from the parent order so the sales rep who owns the
  // order also owns the payment record.
  const orderRef = await getDoc(doc(db, "orders", data.orderId));
  const assignedTo = orderRef.exists()
    ? ((orderRef.data() as Order).assignedTo ?? "")
    : "";

  // Create the payment record
  const ref = await addDoc(collection(db, COL), {
    ...data,
    assignedTo,
    createdAt: serverTimestamp(),
  });

  // Update order paymentStatus
  const orderSnap = await getDoc(doc(db, "orders", data.orderId));
  if (orderSnap.exists()) {
    const order = orderSnap.data() as Order;
    const paymentStatus: Order["paymentStatus"] =
      totalPaid >= order.grandTotal ? "paid" : totalPaid > 0 ? "partial" : "unpaid";
    await updateDoc(doc(db, "orders", data.orderId), {
      paymentStatus,
      updatedAt: serverTimestamp(),
    });
  }

  // Update contact totalRevenue
  const contactSnap = await getDoc(doc(db, "contacts", data.contactId));
  if (contactSnap.exists()) {
    const contact = contactSnap.data();
    await updateDoc(doc(db, "contacts", data.contactId), {
      totalRevenue: (contact.totalRevenue ?? 0) + data.amount,
      updatedAt: serverTimestamp(),
    });
  }

  return ref.id;
}

/** Delete a payment, then recalculate order paymentStatus and revert contact totalRevenue. */
export async function deletePayment(id: string) {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return;
  const payment = { id: snap.id, ...snap.data() } as Payment;

  await deleteDoc(doc(db, COL, id));

  // Recalculate remaining paid amount for this order
  const remainingSnap = await getDocs(
    query(collection(db, COL), where("orderId", "==", payment.orderId))
  );
  const totalPaid = remainingSnap.docs.reduce(
    (s, d) => s + (d.data() as Payment).amount,
    0
  );

  const orderSnap = await getDoc(doc(db, "orders", payment.orderId));
  if (orderSnap.exists()) {
    const order = orderSnap.data() as Order;
    const paymentStatus: Order["paymentStatus"] =
      totalPaid >= order.grandTotal ? "paid" : totalPaid > 0 ? "partial" : "unpaid";
    await updateDoc(doc(db, "orders", payment.orderId), {
      paymentStatus,
      updatedAt: serverTimestamp(),
    });
  }

  // Revert contact totalRevenue
  const contactSnap = await getDoc(doc(db, "contacts", payment.contactId));
  if (contactSnap.exists()) {
    const contact = contactSnap.data();
    await updateDoc(doc(db, "contacts", payment.contactId), {
      totalRevenue: Math.max(0, (contact.totalRevenue ?? 0) - payment.amount),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function getPaymentsByOrder(orderId: string): Promise<Payment[]> {
  const snap = await getDocs(
    query(collection(db, COL), where("orderId", "==", orderId), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Payment[];
}
