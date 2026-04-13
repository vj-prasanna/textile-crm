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
  doc,
  setDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

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
const firebaseAuth = getAuth(app);

const now = Timestamp.now();
const daysAgo = (d: number) => Timestamp.fromDate(new Date(Date.now() - d * 86400000));

// ── Demo sales rep credentials ─────────────────────────────────────────────
const DEMO_SALES_REP = {
  email: "sales@demo.com",
  password: "sales@1234",
  displayName: "Demo Sales Rep",
};

/**
 * Create (or sign into) the demo sales rep account and write the Firestore
 * users doc with role=sales. Returns the UID so seeded data can be assigned
 * to this account, letting you demo role-based access immediately.
 */
async function seedDemoSalesRep(): Promise<string> {
  console.log("\n👤 Seeding demo sales rep...");
  let uid: string;
  try {
    const cred = await createUserWithEmailAndPassword(
      firebaseAuth,
      DEMO_SALES_REP.email,
      DEMO_SALES_REP.password
    );
    uid = cred.user.uid;
    console.log(`   ✓ Created auth account: ${DEMO_SALES_REP.email}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("email-already-in-use")) {
      // Already exists — sign in to grab the UID
      const cred = await signInWithEmailAndPassword(
        firebaseAuth,
        DEMO_SALES_REP.email,
        DEMO_SALES_REP.password
      );
      uid = cred.user.uid;
      console.log(`   ✓ Auth account already exists, using existing UID`);
    } else {
      throw err;
    }
  }

  // Upsert the Firestore users doc with role=sales
  await setDoc(doc(db, "users", uid), {
    uid,
    email: DEMO_SALES_REP.email,
    displayName: DEMO_SALES_REP.displayName,
    role: "sales",
    createdAt: now,
    updatedAt: now,
  });
  console.log(`   ✓ Firestore user doc written (role=sales)`);
  console.log(`   → UID: ${uid}`);
  return uid;
}

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

// ── Pipeline seed data ────────────────────────────────────────────────────
type DealStage = "new_lead"|"contacted"|"quoted"|"negotiation"|"won"|"lost";

interface DealSpec {
  title: string;
  contactName: string;
  value: number;
  stage: DealStage;
  probability: number;
  daysAgoCreated: number;
  daysToClose: number;
}

const PIPELINE_DEALS: DealSpec[] = [
  { title: "Bulk Cotton Yarn Supply Contract",     contactName: "Vardhman Yarns Ltd",      value: 850000,  stage: "won",         probability: 100, daysAgoCreated: 60, daysToClose: -30 },
  { title: "Silk Fabric Seasonal Order",           contactName: "Krishna Exports Pvt Ltd", value: 420000,  stage: "negotiation", probability: 70,  daysAgoCreated: 14, daysToClose: 10  },
  { title: "Polyester Georgette — Q2 Supply",      contactName: "Mumbai Textile Hub",      value: 680000,  stage: "quoted",      probability: 55,  daysAgoCreated: 21, daysToClose: 20  },
  { title: "Denim Fabric Annual Contract",         contactName: "Patel Garments",          value: 1200000, stage: "contacted",   probability: 35,  daysAgoCreated: 7,  daysToClose: 45  },
  { title: "Kids Apparel Range",                   contactName: "Style Craft India",       value: 195000,  stage: "new_lead",    probability: 20,  daysAgoCreated: 3,  daysToClose: 60  },
  { title: "Festival Season Garment Order",        contactName: "Royal Weavers Hyderabad", value: 310000,  stage: "quoted",      probability: 60,  daysAgoCreated: 10, daysToClose: 25  },
  { title: "Cotton Fabric Export Tender",          contactName: "Chennai Cotton Co.",      value: 750000,  stage: "negotiation", probability: 65,  daysAgoCreated: 18, daysToClose: 15  },
  { title: "Linen & Printed Fabric Mix",           contactName: "Jaipur Fabrics",          value: 280000,  stage: "contacted",   probability: 40,  daysAgoCreated: 5,  daysToClose: 40  },
  { title: "Raw Silk Yarn Procurement",            contactName: "Silk Route Traders",      value: 560000,  stage: "won",         probability: 100, daysAgoCreated: 45, daysToClose: -10 },
  { title: "Blended Yarn Pilot Batch",             contactName: "Indore Cotton Mills",     value: 125000,  stage: "new_lead",    probability: 15,  daysAgoCreated: 2,  daysToClose: 90  },
  { title: "Wholesale Cotton Fabric Deal",         contactName: "Mumbai Textile Hub",      value: 940000,  stage: "lost",        probability: 0,   daysAgoCreated: 50, daysToClose: -5  },
  { title: "Georgette Dupatta Export",             contactName: "Krishna Exports Pvt Ltd", value: 230000,  stage: "contacted",   probability: 30,  daysAgoCreated: 8,  daysToClose: 35  },
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

// ── Orders seed data ──────────────────────────────────────────────────────
type OrderStatus   = "draft"|"confirmed"|"in_production"|"dispatched"|"delivered"|"cancelled";
type PaymentStatus = "unpaid"|"partial"|"paid";
type PayMethod     = "cash"|"bank_transfer"|"upi"|"cheque"|"credit";

interface OrderSpec {
  contactName: string;
  items: { productName: string; qty: number }[];
  taxRate: number;
  discount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  daysAgoCreated: number;
}

const ORDER_SPECS: OrderSpec[] = [
  { contactName: "Mumbai Textile Hub",     items: [{ productName: "Cotton Grey Fabric", qty: 500 }, { productName: "Rayon Viscose", qty: 300 }], taxRate: 18, discount: 2000, status: "delivered",     paymentStatus: "paid",    daysAgoCreated: 45 },
  { contactName: "Krishna Exports Pvt Ltd",items: [{ productName: "Pure Silk Fabric",   qty: 200 }],                                             taxRate: 18, discount: 0,    status: "dispatched",    paymentStatus: "partial", daysAgoCreated: 20 },
  { contactName: "Patel Garments",         items: [{ productName: "Men's Formal Shirt (White)", qty: 200 }, { productName: "Kids T-Shirt (Cotton)", qty: 300 }], taxRate: 18, discount: 0, status: "confirmed", paymentStatus: "unpaid", daysAgoCreated: 10 },
  { contactName: "Chennai Cotton Co.",     items: [{ productName: "Cotton Yarn (30s)",   qty: 100 }],                                             taxRate: 5,  discount: 0,    status: "in_production", paymentStatus: "partial", daysAgoCreated: 14 },
  { contactName: "Jaipur Fabrics",         items: [{ productName: "Denim Fabric (14 oz)", qty: 150 }, { productName: "Polyester Yarn (150D)", qty: 200 }],       taxRate: 18, discount: 1500, status: "delivered", paymentStatus: "paid", daysAgoCreated: 60 },
  { contactName: "Style Craft India",      items: [{ productName: "Women's Salwar Kameez", qty: 50 }],                                           taxRate: 12, discount: 0,    status: "draft",         paymentStatus: "unpaid", daysAgoCreated: 2  },
  { contactName: "Royal Weavers Hyderabad",items: [{ productName: "Polyester Georgette", qty: 400 }],                                            taxRate: 18, discount: 0,    status: "confirmed",     paymentStatus: "unpaid", daysAgoCreated: 7  },
  { contactName: "Mumbai Textile Hub",     items: [{ productName: "Cotton Yarn (30s)",  qty: 500 }, { productName: "Blended Yarn (PC 65/35)", qty: 300 }],       taxRate: 18, discount: 0, status: "in_production", paymentStatus: "partial", daysAgoCreated: 18 },
];

// Payments to create per order index (0-based), with amounts and methods
interface PaymentSpec {
  orderIdx: number;
  amount: number;
  method: PayMethod;
  reference?: string;
  daysAgoDate: number;
}

// ── Seed functions ─────────────────────────────────────────────────────────
async function seedOrders(): Promise<string[]> {
  console.log("\n🧾 Seeding orders...");

  // Fetch seeded contacts & products
  const contactsSnap = await getDocs(query(collection(db, "contacts"), where("__seeded", "==", true)));
  const productsSnap = await getDocs(query(collection(db, "products"), where("__seeded", "==", true)));

  if (contactsSnap.empty || productsSnap.empty) {
    console.log("   ⚠️  No seeded contacts/products found — run full seed first.");
    return [];
  }

  const contacts = contactsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as { id: string } & Record<string, unknown>));
  const products  = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as { id: string } & Record<string, unknown>));

  const findContact = (name: string) => contacts.find((c) => (c.companyName as string).includes(name.split(" ")[0]));
  const findProduct = (name: string) => products.find((p) => (p.name as string) === name);

  const orderIds: string[] = [];

  for (let i = 0; i < ORDER_SPECS.length; i++) {
    const spec = ORDER_SPECS[i];
    const contact = findContact(spec.contactName);
    if (!contact) { console.log(`   ⚠️  Contact not found: ${spec.contactName}`); continue; }

    const items: Record<string, unknown>[] = [];
    for (const { productName, qty } of spec.items) {
      const product = findProduct(productName);
      if (!product) { console.log(`   ⚠️  Product not found: ${productName}`); continue; }
      const price = product.pricePerUnit as number;
      items.push({ productId: product.id, productName: product.name, quantity: qty, pricePerUnit: price, total: qty * price });
    }
    if (items.length === 0) continue;

    const subtotal = items.reduce((s, it) => s + (it.total as number), 0);
    const tax      = Math.round(subtotal * spec.taxRate / 100);
    const grandTotal = subtotal + tax - spec.discount;
    const orderNumber = `ORD-2026-${String(i + 1).padStart(4, "0")}`;

    // Orders inherit the contact's owner so sales reps see their own orders.
    const assignedTo = (contact.assignedTo as string) ?? "seed";

    const ref = await addDoc(collection(db, "orders"), {
      orderNumber,
      contactId:     contact.id,
      contactName:   contact.companyName,
      items,
      subtotal,
      tax,
      discount:      spec.discount,
      grandTotal,
      status:        spec.status,
      paymentStatus: spec.paymentStatus,
      assignedTo,
      notes:         "",
      __seeded:      true,
      createdAt:     daysAgo(spec.daysAgoCreated),
      updatedAt:     daysAgo(Math.max(0, spec.daysAgoCreated - 2)),
    });

    orderIds.push(ref.id);
    console.log(`   ✓ ${orderNumber} — ${contact.companyName as string} (${spec.status}, ${spec.paymentStatus}) — ₹${grandTotal.toLocaleString("en-IN")}`);
  }

  console.log(`   → ${orderIds.length} orders added`);
  return orderIds;
}

async function seedPayments(orderIds: string[]): Promise<void> {
  console.log("\n💳 Seeding payments...");
  if (orderIds.length === 0) { console.log("   ⚠️  No order IDs to reference."); return; }

  // Fetch the created orders to get contactId, contactName, grandTotal, orderNumber
  const ordersSnap = await getDocs(query(collection(db, "orders"), where("__seeded", "==", true)));
  const orders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as { id: string } & Record<string, unknown>));

  const getOrder = (idx: number) => orders.find((o) => o.id === orderIds[idx]);

  // Define payments: (orderIdx, amount, method, reference?, daysAgo)
  const PAYMENTS: PaymentSpec[] = [
    // Order 0 (Mumbai Textile Hub, delivered, PAID) — single full payment
    { orderIdx: 0, amount: 0,      method: "bank_transfer", reference: "NEFT20260315001", daysAgoDate: 38 },
    // Order 1 (Krishna Exports, dispatched, PARTIAL) — 60% paid via UPI
    { orderIdx: 1, amount: 63720,  method: "upi",           reference: "UPI20260322001",  daysAgoDate: 12 },
    // Order 3 (Chennai Cotton, in_production, PARTIAL) — advance cash
    { orderIdx: 3, amount: 10000,  method: "cash",          daysAgoDate: 10 },
    // Order 4 (Jaipur Fabrics, delivered, PAID) — two cheques
    { orderIdx: 4, amount: 40000,  method: "cheque",        reference: "CHQ-004521",      daysAgoDate: 50 },
    { orderIdx: 4, amount: 0,      method: "bank_transfer", reference: "NEFT20260115002", daysAgoDate: 35 },
    // Order 7 (Mumbai Textile Hub, in_production, PARTIAL) — advance
    { orderIdx: 7, amount: 100000, method: "bank_transfer", reference: "NEFT20260325003", daysAgoDate: 14 },
  ];

  let count = 0;
  for (const spec of PAYMENTS) {
    const order = getOrder(spec.orderIdx);
    if (!order) { console.log(`   ⚠️  Order at index ${spec.orderIdx} not found`); continue; }

    // amount = 0 means "full remaining" (used for the paid orders)
    const grandTotal = order.grandTotal as number;
    const amount = spec.amount === 0 ? grandTotal : spec.amount;

    const paymentDoc: Record<string, unknown> = {
      orderId:     order.id,
      orderNumber: order.orderNumber,
      contactId:   order.contactId,
      contactName: order.contactName,
      amount,
      method:      spec.method,
      date:        daysAgo(spec.daysAgoDate),
      assignedTo:  (order.assignedTo as string) ?? "seed",
      __seeded:    true,
      createdAt:   daysAgo(spec.daysAgoDate),
    };
    if (spec.reference) paymentDoc.reference = spec.reference;

    await addDoc(collection(db, "payments"), paymentDoc);
    console.log(`   ✓ ₹${amount.toLocaleString("en-IN")} — ${order.orderNumber as string} — ${spec.method}`);
    count++;
  }

  console.log(`   → ${count} payments added`);
}

async function seedPipeline(): Promise<void> {
  console.log("\n🎯 Seeding pipeline...");

  const contactsSnap = await getDocs(
    query(collection(db, "contacts"), where("__seeded", "==", true))
  );
  const contacts = contactsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as { id: string } & Record<string, unknown>));
  const findContact = (name: string) =>
    contacts.find((c) => (c.companyName as string).includes(name.split(" ")[0]));

  let count = 0;
  for (const spec of PIPELINE_DEALS) {
    const contact = findContact(spec.contactName);
    const deal: Record<string, unknown> = {
      title: spec.title,
      value: spec.value,
      stage: spec.stage,
      probability: spec.probability,
      // Deals inherit their contact's owner so sales reps see their own pipeline.
      assignedTo: (contact?.assignedTo as string) ?? "seed",
      activities: [],
      __seeded: true,
      createdAt: daysAgo(spec.daysAgoCreated),
      updatedAt: daysAgo(Math.max(0, spec.daysAgoCreated - 2)),
      expectedCloseDate: Timestamp.fromDate(new Date(Date.now() + spec.daysToClose * 86400000)),
    };
    if (contact) {
      deal.contactId = contact.id;
      deal.contactName = contact.companyName as string;
    }
    await addDoc(collection(db, "pipeline"), deal);
    console.log(`   ✓ ${spec.title} — ${spec.stage} (${spec.probability}%)`);
    count++;
  }
  console.log(`   → ${count} deals added`);
}

async function seedContacts(salesUid?: string) {
  console.log("\n📇 Seeding contacts...");
  const col = collection(db, "contacts");
  let count = 0;
  let salesCount = 0;
  for (let i = 0; i < CONTACTS.length; i++) {
    const contact = CONTACTS[i];
    // Assign every 3rd contact to the demo sales rep so the role-based filter
    // has meaningful data to show. Fall back to "seed" (admin-only) otherwise.
    const assignedTo = salesUid && i % 3 === 0 ? salesUid : "seed";
    if (assignedTo === salesUid) salesCount++;
    await addDoc(col, {
      ...contact,
      assignedTo,
      __seeded: true,
      createdAt: daysAgo(Math.floor(Math.random() * 90)),
      updatedAt: now,
    });
    console.log(`   ✓ ${contact.companyName}${assignedTo === salesUid ? " → sales rep" : ""}`);
    count++;
  }
  console.log(`   → ${count} contacts added${salesUid ? ` (${salesCount} assigned to sales rep)` : ""}`);
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
      const salesUid = await seedDemoSalesRep();
      await seedContacts(salesUid);
    } else if (arg === "products") {
      await seedProducts();
    } else if (arg === "orders") {
      const ids = await seedOrders();
      await seedPayments(ids);
    } else if (arg === "payments") {
      // Seed payments against already-seeded orders
      const ordersSnap = await getDocs(query(collection(db, "orders"), where("__seeded", "==", true)));
      const ids = ordersSnap.docs.map((d) => d.id);
      await seedPayments(ids);
    } else if (arg === "pipeline") {
      await seedPipeline();
    } else if (arg === "sales-rep") {
      await seedDemoSalesRep();
    } else {
      // Default: seed everything, including the demo sales rep account.
      const salesUid = await seedDemoSalesRep();
      await seedContacts(salesUid);
      await seedProducts();
      const ids = await seedOrders();
      await seedPayments(ids);
      await seedPipeline();

      console.log("\n──────────────────────────────────────────────");
      console.log("  Demo sales rep credentials");
      console.log(`    Email:    ${DEMO_SALES_REP.email}`);
      console.log(`    Password: ${DEMO_SALES_REP.password}`);
      console.log("  Log in with these to test role-based access.");
      console.log("──────────────────────────────────────────────");
    }
    console.log("\n✅ Done!\n");
    process.exit(0);
  } catch (err) {
    console.error("❌  Seed failed:", err);
    process.exit(1);
  }
}

main();
