# Textile CRM — Implementation Phases & Checkpoints

Each phase has:
- A **GitHub Issue** describing the work
- A **feature branch** off `develop`
- A **checkpoint** — what must work before moving to next phase
- A **PR** merged into `develop` after checkpoint passes

---

## Git Branching Strategy

```
main (production - only merged from develop)
 └── develop (integration branch)
      ├── feature/phase-1-project-setup
      ├── feature/phase-2-auth
      ├── feature/phase-3-dashboard-layout
      ├── feature/phase-4-contacts
      ├── feature/phase-5-products
      ├── feature/phase-6-orders
      ├── feature/phase-7-payments
      ├── feature/phase-8-pipeline
      ├── feature/phase-9-ai-insights
      ├── feature/phase-10-animations
      └── feature/phase-11-cicd-deploy
```

---

## Phase 1: Project Setup & Foundation
**Branch:** `feature/phase-1-project-setup`
**Issue:** Initialize Next.js 15 project with all dependencies and base config

### Work
- Initialize Next.js 15 with TypeScript, App Router, Tailwind CSS v4
- Install Material UI v6, GSAP 3, Zustand, Firebase SDK, Lucide React
- Set up folder structure (`src/app`, `components`, `lib`, `hooks`, `store`, `types`)
- Configure Firebase (`lib/firebase/config.ts`)
- Set up Tailwind + MUI theme integration
- Create `.gitignore`, `tsconfig.json`, ESLint config
- Add `.env.local` to `.gitignore`

### Checkpoint
- [ ] `pnpm dev` runs without errors
- [ ] Firebase initializes without errors (check console)
- [ ] Tailwind classes render correctly
- [ ] MUI Button component renders correctly
- [ ] Folder structure matches design spec

---

## Phase 2: Authentication System
**Branch:** `feature/phase-2-auth`
**Issue:** Implement Firebase Auth with login, register, and route protection

### Work
- Create `useAuthStore` (Zustand) — user state, login/logout actions
- Build Login page (`/login`) — email/password + Google sign-in
- Build Register page (`/register`) — email/password with validation
- Create auth helpers (`lib/firebase/auth.ts`)
- Add auth guard middleware — redirect unauthenticated users to `/login`
- Create user document in Firestore on registration (with role field)

### Checkpoint
- [ ] Can register a new user with email/password
- [ ] Can login with email/password
- [ ] Can login with Google
- [ ] Unauthenticated users redirected to `/login`
- [ ] Authenticated users redirected to `/dashboard`
- [ ] User document created in Firestore with correct role

---

## Phase 3: Dashboard Layout & Shell
**Branch:** `feature/phase-3-dashboard-layout`
**Issue:** Build the main app shell — sidebar, topbar, responsive layout

### Work
- Create dashboard layout (`(dashboard)/layout.tsx`) — sidebar + topbar
- Build Sidebar component — navigation links with icons, collapsible on mobile
- Build Topbar component — user avatar, search bar, notifications bell
- Create placeholder pages for all routes (contacts, products, orders, etc.)
- Add responsive design — mobile hamburger menu
- Wire up Zustand sidebar state (open/collapsed)

### Checkpoint
- [ ] Sidebar shows all navigation links
- [ ] Clicking nav links navigates to correct pages
- [ ] Sidebar collapses on mobile with hamburger toggle
- [ ] Topbar shows user name and avatar
- [ ] All placeholder pages render without errors
- [ ] Layout looks professional on desktop and mobile

---

## Phase 4: Contacts Module
**Branch:** `feature/phase-4-contacts`
**Issue:** Build contacts CRUD — list, add, edit, delete, detail view

### Work
- Define Contact TypeScript interface (`types/contact.ts`)
- Create Firestore CRUD helpers for contacts (`lib/firebase/firestore.ts`)
- Build contacts list page with DataTable (search, filter, sort)
- Build Add/Edit contact drawer form with validation
- Build contact detail page (`/contacts/[id]`)
- Add delete confirmation dialog
- Create `useContactStore` for client-side caching

### Checkpoint
- [ ] Can add a new contact (customer or supplier)
- [ ] Contacts list shows all contacts with search and filter
- [ ] Can edit an existing contact
- [ ] Can delete a contact
- [ ] Contact detail page shows full info
- [ ] Data persists in Firestore

---

## Phase 5: Products Module
**Branch:** `feature/phase-5-products`
**Issue:** Build product catalog with grid/list view and category icons

### Work
- Define Product TypeScript interface (`types/product.ts`)
- Create Firestore CRUD for products
- Build products page with grid/list view toggle
- Product cards with category icons (yarn/fabric/garment)
- Add/Edit product form with validation
- Low stock indicator badges
- SKU auto-generation

### Checkpoint
- [ ] Can add a new product with category and pricing
- [ ] Grid view shows product cards with icons
- [ ] List view shows product table
- [ ] Can toggle between grid and list
- [ ] Low stock products show warning badge
- [ ] Can edit and delete products

---

## Phase 6: Orders Module
**Branch:** `feature/phase-6-orders`
**Issue:** Build order management — create multi-item orders, track status

### Work
- Define Order TypeScript interface (`types/order.ts`)
- Create Firestore CRUD for orders
- Build order list page with status filters and badges
- Create order form — select contact, add multiple items, auto-calculate totals
- Build order detail page with status timeline
- Order number auto-generation (ORD-2026-0001)
- Status update functionality (draft → confirmed → dispatched → delivered)

### Checkpoint
- [ ] Can create an order with multiple line items
- [ ] Order totals (subtotal, tax, discount, grand total) calculate correctly
- [ ] Order list shows with status badges and filters
- [ ] Can update order status through the workflow
- [ ] Order detail page shows full info with timeline
- [ ] Order number auto-generates correctly

---

## Phase 7: Payments Module
**Branch:** `feature/phase-7-payments`
**Issue:** Build payment tracking — record payments, link to orders

### Work
- Define Payment TypeScript interface (`types/payment.ts`)
- Create Firestore CRUD for payments
- Build payment log page with filters
- Record payment form — link to order, payment method, amount
- Auto-update order `paymentStatus` (unpaid → partial → paid)
- Payment summary per contact
- Update contact `totalRevenue` on payment

### Checkpoint
- [ ] Can record a payment against an order
- [ ] Order payment status updates automatically
- [ ] Payment log shows all payments with filters
- [ ] Contact total revenue updates correctly
- [ ] Can filter payments by method, date, contact

---

## Phase 8: Sales Pipeline (Kanban)
**Branch:** `feature/phase-8-pipeline`
**Issue:** Build drag-and-drop Kanban board for sales pipeline

### Work
- Define Deal/Pipeline TypeScript interface (`types/pipeline.ts`)
- Create Firestore CRUD for deals
- Build Kanban board with 6 stages (new_lead → contacted → quoted → negotiation → won → lost)
- Drag and drop cards between stages (using dnd-kit or similar)
- Deal cards showing value, contact, probability
- Stage-wise total value display
- Add activity log to deals (call, email, meeting, note)

### Checkpoint
- [ ] Kanban board renders with 6 columns
- [ ] Can create a new deal
- [ ] Can drag deals between stages
- [ ] Stage totals update on drag
- [ ] Can add activities to a deal
- [ ] Deal data persists in Firestore after drag

---

## Phase 9: AI-Powered Insights
**Branch:** `feature/phase-9-ai-insights`
**Issue:** Integrate Google Gemini API for dashboard AI insights

### Work
- Create Gemini API client (`lib/ai/gemini.ts`)
- Build API route (`/api/ai/insights`) as proxy
- Dashboard AI widget with 4 insight cards:
  - Sales forecast
  - Follow-up suggestions
  - Deal risk alerts
  - Smart weekly summary
- "Ask AI" chat box for free-form questions
- Loading skeletons and error fallback UI
- Response caching (1 hour)

### Checkpoint
- [ ] AI insights widget loads on dashboard
- [ ] Sales forecast shows predicted revenue
- [ ] Follow-up suggestions identify inactive customers
- [ ] Ask AI chat returns meaningful answers about business data
- [ ] Graceful fallback when API is unavailable
- [ ] Responses are cached (no duplicate API calls on refresh)

---

## Phase 10: GSAP Animations & Polish
**Branch:** `feature/phase-10-animations`
**Issue:** Add GSAP animations, responsive polish, and UI refinements

### Work
- Create reusable animation components (`FadeIn`, `StaggerList`, `Counter`, `PageTransition`)
- Dashboard: stats counter animation, card stagger entrance
- Tables: row fade-in on load
- Forms: drawer slide-in, success animations
- Pipeline: drag effects, column highlights
- Page transitions between routes
- Responsive testing and fixes
- Landing page with hero animation

### Checkpoint
- [ ] Dashboard stats animate from 0 → value on load
- [ ] Cards stagger in on page load
- [ ] Page transitions are smooth between routes
- [ ] Pipeline drag has visual feedback
- [ ] Landing page hero section animates
- [ ] All pages look good on mobile, tablet, desktop

---

## Phase 11: CI/CD & Deployment
**Branch:** `feature/phase-11-cicd-deploy`
**Issue:** Set up GitHub Actions CI pipeline and Vercel deployment

### Work
- Create `.github/workflows/ci.yml` — lint, type-check, test on PR
- Connect repo to Vercel
- Add environment variables to Vercel dashboard
- Set up branch protection on `main` (require CI pass)
- Merge `develop` → `main` for first production deploy
- Test preview deployments on PR

### Checkpoint
- [ ] GitHub Actions runs on PR (lint + type-check pass)
- [ ] Vercel auto-deploys on push to `main`
- [ ] Preview URL generated for PRs
- [ ] Production site is live and functional
- [ ] All environment variables configured in Vercel

---

## Final: Merge to Main & Demo Ready

After all phases complete:
1. Final merge `develop` → `main`
2. Production deploy on Vercel
3. Seed demo data (sample contacts, products, orders)
4. Test full user flow end-to-end
5. Share live URL + GitHub repo with interviewer
