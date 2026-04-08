# Textile CRM — Design Specification

**Date:** 2026-04-08
**Status:** Approved
**Author:** Claude + User

---

## 1. Overview

A Textile CRM (Customer Relationship Management) system for businesses operating across the full textile chain — yarn, fabric, and garment. Built as an interview project to demonstrate full-stack proficiency with modern web technologies and AI integration.

### Goals

- Manage customers, suppliers, products, orders, and payments in one place
- Role-based access for Admin and Sales teams
- AI-powered business insights using Google Gemini
- Polished UI with GSAP animations for professional presentation
- CI/CD pipeline for production-grade deployment workflow

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS + Material UI | v4 + v6 |
| Animations | GSAP | 3.x |
| Auth | Firebase Auth | v10 |
| Database | Cloud Firestore | v10 |
| Icons | Material Icons + Lucide React | - |
| State | Zustand | 5.x |
| AI | Google Gemini API | latest |
| CI/CD | GitHub Actions + Vercel | - |
| Testing | Vitest + React Testing Library | - |
| Package Manager | pnpm | latest |

---

## 3. Architecture

**Pattern:** Modular Monolith — single Next.js app with clean module separation.

### Folder Structure

```
textile-crm/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Lint + test on PR
│       └── deploy.yml             # Auto deploy to Vercel
├── public/
│   └── assets/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          # Sidebar + Topbar layout
│   │   │   ├── page.tsx            # Main dashboard
│   │   │   ├── contacts/
│   │   │   │   ├── page.tsx        # Contact list
│   │   │   │   └── [id]/page.tsx   # Contact detail
│   │   │   ├── products/
│   │   │   │   └── page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── payments/
│   │   │   │   └── page.tsx
│   │   │   └── pipeline/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   └── ai/
│   │   │       └── insights/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                     # DataTable, StatsCard, StatusBadge
│   │   ├── forms/                  # ContactForm, OrderForm, ProductForm
│   │   ├── charts/                 # RevenueChart, OrdersChart
│   │   └── animations/            # GSAP wrappers (FadeIn, StaggerList, Counter)
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── config.ts           # Firebase init
│   │   │   ├── auth.ts             # Auth helpers
│   │   │   └── firestore.ts        # CRUD helpers
│   │   ├── ai/
│   │   │   └── gemini.ts           # Gemini API client
│   │   └── utils.ts
│   ├── hooks/                      # useAuth, useFirestore, useGSAP
│   ├── store/                      # Zustand stores
│   │   ├── useAuthStore.ts
│   │   ├── useContactStore.ts
│   │   └── useOrderStore.ts
│   └── types/                      # TypeScript interfaces
│       ├── contact.ts
│       ├── product.ts
│       ├── order.ts
│       └── payment.ts
├── CLAUDE.md
├── README.md
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## 4. Data Models (Firestore Collections)

### `users`

```typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  role: "admin" | "sales";
  avatar?: string;
  phone?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `contacts`

```typescript
interface Contact {
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
```

### `products`

```typescript
interface Product {
  id: string;
  name: string;
  sku: string;
  category: "yarn" | "fabric" | "garment";
  subCategory: string;
  unit: "meter" | "kg" | "piece" | "roll";
  pricePerUnit: number;
  stock: number;
  minStock: number;
  icon: string;             // Category-based icon (yarn, fabric, garment)
  description?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `orders`

```typescript
interface Order {
  id: string;
  orderNumber: string;
  contactId: string;
  contactName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  status: "draft" | "confirmed" | "in_production" | "dispatched" | "delivered" | "cancelled";
  paymentStatus: "unpaid" | "partial" | "paid";
  assignedTo: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
}
```

### `payments`

```typescript
interface Payment {
  id: string;
  orderId: string;
  contactId: string;
  amount: number;
  method: "cash" | "bank_transfer" | "upi" | "cheque" | "credit";
  reference?: string;
  date: Timestamp;
  notes?: string;
  createdAt: Timestamp;
}
```

### `pipeline`

```typescript
interface Deal {
  id: string;
  contactId?: string;
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

interface Activity {
  type: "call" | "email" | "meeting" | "note";
  description: string;
  date: Timestamp;
}
```

---

## 5. Pages & Features

### Landing Page
- Hero section with textile imagery
- Feature highlights (cards)
- CTA to login/register
- GSAP: text reveal, scroll-triggered sections, floating elements

### Auth (Login / Register)
- Email/password + Google sign-in via Firebase Auth
- Form validation with error messages
- Auto-redirect to dashboard on successful auth
- GSAP: form slide-in, input focus animations

### Dashboard
- Stats cards: total revenue, orders this month, pending payments, active deals
- Revenue chart (last 6 months)
- Recent orders table
- AI Insights widget (see Section 6)
- GSAP: counter animations, card stagger entrance, chart draw-in

### Contacts
- Data table with search, filter by type/category, sort
- Add/Edit contact via slide-out drawer
- Contact detail page with order history and payment summary
- GSAP: table row fade-in, drawer slide, page transitions

### Products
- Grid/List view toggle
- Product cards with images
- Add/Edit product form
- Low stock indicators
- GSAP: card hover effects, view toggle morph, image zoom

### Orders
- Order list with status badges and filters
- Create order: select contact, add items, calculate totals
- Order detail with timeline
- GSAP: status badge pulse, form step transitions

### Payments
- Payment log with filters
- Record payment against an order
- Payment summary per contact
- GSAP: amount counter, progress bar animation

### Sales Pipeline
- Kanban board with drag & drop (6 stages)
- Deal cards with value, contact, and probability
- Stage-wise total value display
- GSAP: card drag physics, column highlight, value counters

---

## 6. AI-Powered Insights (Standout Feature)

Powered by Google Gemini API via a Next.js API route `/api/ai/insights`.

| Feature | Description | Data Sent to Gemini |
|---|---|---|
| Sales Forecast | Predicted next month revenue based on trends | Last 3 months of order totals |
| Follow-Up Suggestions | Identify contacts with order gaps | Contact order frequency patterns |
| Deal Risk Alert | Deals stuck in stages too long | Pipeline stage durations |
| Smart Summary | Natural language weekly business summary | Aggregated weekly data |
| Ask AI | Free-form chat about business data | Relevant Firestore context |

### Implementation

- API route aggregates Firestore data server-side
- Sends structured context + prompt to Gemini API
- Results cached for 1 hour to minimize API calls
- Graceful fallback UI if API is unavailable
- Loading skeletons during fetch

---

## 7. Role-Based Access Control

| Feature | Admin | Sales Rep |
|---|---|---|
| Dashboard | Full stats + AI | Own stats only |
| Contacts | All contacts | Assigned contacts |
| Products | Full CRUD | View only |
| Orders | All orders | Own orders |
| Payments | All + record | View own |
| Pipeline | All deals | Own deals |
| Settings | User management | Profile only |

### Implementation

- `useAuthStore` holds current user + role
- `withRole()` HOC or middleware checks access
- Firestore queries filtered by `assignedTo` for sales reps
- UI conditionally renders actions based on role

---

## 8. GSAP Animation Strategy

| Category | Animations |
|---|---|
| Page Transitions | Fade + slide between routes using `useGSAP` hook |
| Dashboard | Stats counter (0 → value), card stagger entrance, chart draw-in |
| Tables | Row fade-in on load, row highlight on hover |
| Forms | Slide-in drawers, step transitions, success checkmark |
| Pipeline | Drag physics on cards, column glow on drag-over |
| Micro-interactions | Button ripple, badge pulse, tooltip fade |

Approach: Create reusable GSAP wrapper components in `src/components/animations/`:
- `<FadeIn>` — fade + optional slide direction
- `<StaggerList>` — stagger children entrance
- `<Counter>` — animate number from 0 to value
- `<PageTransition>` — route-level animation wrapper

---

## 9. CI/CD Pipeline

### GitHub Actions — `ci.yml` (runs on PR)
1. Checkout code
2. Install dependencies (pnpm)
3. Run linter (ESLint)
4. Run type check (tsc --noEmit)
5. Run tests (vitest)

### Vercel Auto-Deploy — `deploy.yml`
1. Push to `main` → auto-deploy to production
2. Push to PR branch → deploy preview URL

### Branch Strategy
- `main` — production (protected)
- `develop` — integration branch
- `feature/*` — feature branches (PR into develop)

---

## 10. Setup Prerequisites

The user must complete these before coding begins:

1. **Firebase Project** — create project, enable Auth (Email + Google), Firestore (test mode)
2. **Gemini API Key** — generate from Google AI Studio
3. **GitHub Repo** — create `textile-crm` (public)
4. **Vercel Account** — sign up with GitHub
5. **Local Tools** — Node.js 18+, pnpm, Git

### Environment Variables (`.env.local`)

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
GEMINI_API_KEY=
```

---

## 11. Verification Plan

After implementation, verify:

1. **Auth**: Register, login, Google sign-in, logout, role-based redirect
2. **CRUD**: Create/read/update/delete for contacts, products, orders, payments
3. **Role Access**: Login as sales rep — verify restricted access
4. **Pipeline**: Drag and drop deals between stages, verify persistence
5. **AI Insights**: Dashboard AI widget loads predictions and summaries
6. **Animations**: Page transitions, counter animations, stagger effects smooth
7. **Responsive**: Test on mobile, tablet, desktop viewports
8. **CI/CD**: Push a PR → verify GitHub Actions runs → verify Vercel preview
9. **Build**: `pnpm build` succeeds with no errors
