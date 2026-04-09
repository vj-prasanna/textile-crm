import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, where, orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { Deal, DealFormData } from "@/types/pipeline";

const COL = "pipeline";

export function subscribeToDeals(
  userId: string,
  role: string,
  callback: (deals: Deal[]) => void
) {
  const col = collection(db, COL);
  const q =
    role === "admin"
      ? query(col, orderBy("createdAt", "desc"))
      : query(col, where("assignedTo", "==", userId), orderBy("createdAt", "desc"));

  return onSnapshot(q, (snap) => {
    const deals = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Deal[];
    callback(deals);
  });
}

export async function createDeal(data: DealFormData): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    activities: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateDeal(id: string, data: Partial<DealFormData>) {
  return updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
}

export async function updateDealStage(id: string, stage: Deal["stage"]) {
  return updateDoc(doc(db, COL, id), { stage, updatedAt: serverTimestamp() });
}

export async function deleteDeal(id: string) {
  return deleteDoc(doc(db, COL, id));
}
