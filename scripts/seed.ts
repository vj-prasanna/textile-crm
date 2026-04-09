/**
 * Textile CRM — Seed Script
 *
 * Populates Firebase with realistic dummy data for development.
 *
 * Usage:
 *   pnpm seed              → adds all collections
 *   pnpm seed:contacts     → contacts only
 *   pnpm seed:products     → products only
 *   pnpm seed:clear        → clears all seeded data (adds __seeded:true marker)
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

// ── Firebase init ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

const now = Timestamp.now();
const daysAgo = (d: number) => Timestamp.fromDate(new Date(Date.now() - d * 86400000));

// ── Contacts seed data ─────────────────────────────────────────────────────
const CONTACTS = [
  // Customers
  {
    type: "customer", companyName: "Krishna Exports Pvt Ltd", contactPerson: "Rajesh Mehta",
    email: "rajesh@krishnaexports.com", phone: "9876543210", gstNumber: "24AABCK1234A1Z5",
    category: "export", address: { street: "45, Industrial Estate", city: "Surat", state: "Gujarat", pincode: "395010" },
    totalOrders: 28, totalRevenue: 1850000, lastOrderDate: daysAgo(5), notes: "Premium exporter, prefers silk and georgette.",
  },
  {
    type: "customer", companyName: "Patel Garments", contactPerson: "Suresh Patel",
    email: "suresh@patelgarments.com", phone: "9823456781", gstNumber: "24AABCP5678B1Z2",
    category: "garment", address: { street: "12, Ring Road", city: "Ahmedabad", state: "Gujarat", pincode: "380015" },
    totalOrders: 14, totalRevenue: 620000, lastOrderDate: daysAgo(12), notes: "Regular buyer of cotton fabric.",
  },
  {
    type: "customer", companyName: "Mumbai Textile Hub", contactPerson: "Anita Shah",
    email: "anita@mumbaitextile.in", phone: "9911223344", gstNumber: "27AABCM9012C1Z3",
    category: "wholesale", address: { street: "78, Dharavi Road", city: "Mumbai", state: "Maharashtra", pincode: "400017" },
    totalOrders: 35, totalRevenue: 3200000, lastOrderDate: daysAgo(2), notes: "Largest wholesale buyer. Net 30 payment terms.",
  },
  {
    type: "customer", companyName: "Style Craft India", contactPerson: "Vikram Nair",
    email: "vikram@stylecraft.in", phone: "9944556677", gstNumber: "29AABCS3456D1Z4",
    category: "retail", address: { street: "22, MG Road", city: "Bangalore", state: "Karnataka", pincode: "560001" },
    totalOrders: 9, totalRevenue: 380000, lastOrderDate: daysAgo(20), notes: "Boutique retailer, small orders but regular.",
  },
  {
    type: "customer", companyName: "Chennai Cotton Co.", contactPerson: "Priya Rajan",
    email: "priya@chennaicotton.com", phone: "9988776655", gstNumber: "33AABCC7890E1Z5",
    category: "fabric", address: { street: "56, Anna Salai", city: "Chennai", state: "Tamil Nadu", pincode: "600002" },
    totalOrders: 22, totalRevenue: 940000, lastOrderDate: daysAgo(8), notes: "Specializes in cotton fabric trading.",
  },
  {
    type: "customer", companyName: "Jaipur Fabrics", contactPerson: "Arjun Sharma",
    email: "arjun@jaipurfabrics.com", phone: "9871234567", gstNumber: "08AABCJ2345F1Z6",
    category: "fabric", address: { street: "108, Bapu Nagar", city: "Jaipur", state: "Rajasthan", pincode: "302015" },
    totalOrders: 17, totalRevenue: 710000, lastOrderDate: daysAgo(15), notes: "Interested in printed and dyed fabrics.",
  },
  {
    type: "customer", companyName: "Royal Weavers Hyderabad", contactPerson: "Mohammed Saleem",
    email: "saleem@royalweavers.in", phone: "9966554433", gstNumber: "36AABCR6789G1Z7",
    category: "garment", address: { street: "34, Begum Bazar", city: "Hyderabad", state: "Telangana", pincode: "500012" },
    totalOrders: 11, totalRevenue: 490000, lastOrderDate: daysAgo(30), notes: "Buys in bulk during festive season.",
  },
  // Suppliers
  {
    type: "supplier", companyName: "Vardhman Yarns Ltd", contactPerson: "Deepak Gupta",
    email: "deepak@vardhman.com", phone: "9812345678", gstNumber: "03AABCV1234H1Z8",
    category: "yarn", address: { street: "Plot 45, Industrial Area", city: "Ludhiana", state: "Uttar Pradesh", pincode: "141003" },
    totalOrders: 45, totalRevenue: 5600000, lastOrderDate: daysAgo(3), notes: "Primary yarn supplier. Excellent quality cotton and polyester.",
  },
  {
    type: "supplier", companyName: "Silk Route Traders", contactPerson: "Kavya Iyer",
    email: "kavya@silkroute.in", phone: "9955667788", gstNumber: "29AABCS9876I1Z9",
    category: "fabric", address: { street: "77, Silk Board", city: "Bangalore", state: "Karnataka", pincode: "560068" },
    totalOrders: 18, totalRevenue: 2100000, lastOrderDate: daysAgo(7), notes: "Best source for premium silk and satin.",
  },
  {
    type: "supplier", companyName: "Indore Cotton Mills", contactPerson: "Ramesh Joshi",
    email: "ramesh@indorecotton.com", phone: "9833445566", gstNumber: "23AABCI4567J2Z0",
    category: "yarn", address: { street: "Scheme 78, AB Road", city: "Indore", state: "Maharashtra", pincode: "452010" },
    totalOrders: 32, totalRevenue: 3800000, lastOrderDate: daysAgo(1), notes: "Best rates on cotton yarn. MOQ 500 kg.",
  },
];

// ── Products seed data ─────────────────────────────────────────────────────
const PRODUCTS = [
  { name: "Cotton Grey Fabric", sku: "FAB-CTN-001", category: "fabric", subCategory: "Cotton", unit: "meter", pricePerUnit: 85, stock: 4200, minStock: 500, icon: "fabric", isActive: true },
  { name: "Polyester Georgette", sku: "FAB-PLY-002", category: "fabric", subCategory: "Polyester", unit: "meter", pricePerUnit: 120, stock: 2800, minStock: 300, icon: "fabric", isActive: true },
  { name: "Pure Silk Fabric", sku: "FAB-SLK-003", category: "fabric", subCategory: "Silk", unit: "meter", pricePerUnit: 450, stock: 680, minStock: 100, icon: "fabric", isActive: true },
  { name: "Rayon Viscose", sku: "FAB-RYN-004", category: "fabric", subCategory: "Rayon", unit: "meter", pricePerUnit: 95, stock: 3100, minStock: 400, icon: "fabric", isActive: true },
  { name: "Denim Fabric (14 oz)", sku: "FAB-DNM-005", category: "fabric", subCategory: "Denim", unit: "meter", pricePerUnit: 185, stock: 1500, minStock: 200, icon: "fabric", isActive: true },
  { name: "Cotton Yarn (30s)", sku: "YRN-CTN-001", category: "yarn", subCategory: "Cotton", unit: "kg", pricePerUnit: 220, stock: 8500, minStock: 1000, icon: "yarn", isActive: true },
  { name: "Polyester Yarn (150D)", sku: "YRN-PLY-002", category: "yarn", subCategory: "Polyester", unit: "kg", pricePerUnit: 180, stock: 6200, minStock: 800, icon: "yarn", isActive: true },
  { name: "Silk Yarn (Raw)", sku: "YRN-SLK-003", category: "yarn", subCategory: "Silk", unit: "kg", pricePerUnit: 1200, stock: 320, minStock: 50, icon: "yarn", isActive: true },
  { name: "Blended Yarn (PC 65/35)", sku: "YRN-BLD-004", category: "yarn", subCategory: "Blended", unit: "kg", pricePerUnit: 195, stock: 4800, minStock: 600, icon: "yarn", isActive: true },
  { name: "Men's Formal Shirt (White)", sku: "GRM-SHT-001", category: "garment", subCategory: "Shirt", unit: "piece", pricePerUnit: 350, stock: 1200, minStock: 150, icon: "garment", isActive: true },
  { name: "Women's Salwar Kameez", sku: "GRM-SKZ-002", category: "garment", subCategory: "Ethnic", unit: "piece", pricePerUnit: 480, stock: 850, minStock: 100, icon: "garment", isActive: true },
  { name: "Kids T-Shirt (Cotton)", sku: "GRM-KTS-003", category: "garment", subCategory: "Kids", unit: "piece", pricePerUnit: 180, stock: 2400, minStock: 200, icon: "garment", isActive: true },
  { name: "Linen Fabric (Natural)", sku: "FAB-LNN-006", category: "fabric", subCategory: "Linen", unit: "meter", pricePerUnit: 210, stock: 180, minStock: 200, icon: "fabric", isActive: true, description: "Low stock — order soon" },
];

// ── Seed functions ─────────────────────────────────────────────────────────
async function seedContacts() {
  console.log("\n📇 Seeding contacts...");
  const col = collection(db, "contacts");
  let count = 0;
  for (const contact of CONTACTS) {
    await addDoc(col, { ...contact, assignedTo: "seed", __seeded: true, createdAt: daysAgo(Math.floor(Math.random() * 90)), updatedAt: now });
    console.log(`   ✓ ${contact.companyName}`);
    count++;
  }
  console.log(`   → ${count} contacts added`);
}

async function seedProducts() {
  console.log("\n📦 Seeding products...");
  const col = collection(db, "products");
  let count = 0;
  for (const product of PRODUCTS) {
    await addDoc(col, { ...product, __seeded: true, createdAt: daysAgo(Math.floor(Math.random() * 60)), updatedAt: now });
    console.log(`   ✓ ${product.name}`);
    count++;
  }
  console.log(`   → ${count} products added`);
}

async function clearSeeded() {
  console.log("\n🗑️  Clearing seeded data...");
  const collections = ["contacts", "products", "orders", "payments", "pipeline"];
  for (const col of collections) {
    const q = query(collection(db, col), where("__seeded", "==", true));
    const snap = await getDocs(q);
    for (const doc of snap.docs) {
      await deleteDoc(doc.ref);
    }
    if (snap.size > 0) console.log(`   ✓ Removed ${snap.size} from ${col}`);
  }
  console.log("   → Seeded data cleared");
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const arg = process.argv[2];

  console.log("🌱 Textile CRM — Seed Script");
  console.log(`   Project: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);

  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.error("❌  Firebase config not found. Make sure .env.local exists.");
    process.exit(1);
  }

  try {
    if (arg === "clear") {
      await clearSeeded();
    } else if (arg === "contacts") {
      await seedContacts();
    } else if (arg === "products") {
      await seedProducts();
    } else {
      // Default: seed everything
      await seedContacts();
      await seedProducts();
    }
    console.log("\n✅ Done!\n");
    process.exit(0);
  } catch (err) {
    console.error("❌  Seed failed:", err);
    process.exit(1);
  }
}

main();
