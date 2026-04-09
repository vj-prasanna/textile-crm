import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, getDoc, getDocs, onSnapshot, query,
  orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { Product, ProductFormData } from "@/types/product";

const COL = "products";

export function subscribeToProducts(callback: (products: Product[]) => void) {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const products = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[];
    callback(products);
  });
}

export async function generateSKU(category: Product["category"]): Promise<string> {
  const prefix = { yarn: "YARN", fabric: "FABRIC", garment: "GARMENT" }[category];
  const snap = await getDocs(collection(db, COL));
  const nums = snap.docs
    .map((d) => (d.data() as Product).sku)
    .filter((sku) => sku.startsWith(prefix + "-"))
    .map((sku) => parseInt(sku.replace(prefix + "-", ""), 10))
    .filter((n) => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}-${String(next).padStart(3, "0")}`;
}

export async function addProduct(data: ProductFormData) {
  return addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateProduct(id: string, data: Partial<ProductFormData>) {
  return updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteProduct(id: string) {
  return deleteDoc(doc(db, COL, id));
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Product) : null;
}
