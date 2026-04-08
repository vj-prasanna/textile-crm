# Textile CRM — Claude Code Init File

## Project Overview

A full-stack Textile CRM built with Next.js 15, covering the complete textile chain (yarn, fabric, garment). Features AI-powered business insights via Google Gemini, role-based access (Admin + Sales), and a polished UI with GSAP animations.

## Tech Stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4 + Material UI v6
- **Animations:** GSAP 3
- **Backend:** Firebase (Auth, Firestore, Storage)
- **State:** Zustand 5
- **AI:** Google Gemini API
- **CI/CD:** GitHub Actions + Vercel
- **Testing:** Vitest + React Testing Library
- **Package Manager:** pnpm

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── (auth)/       # Login, Register (public routes)
│   ├── (dashboard)/  # Dashboard, Contacts, Products, Orders, Payments, Pipeline
│   └── api/          # API routes (AI insights)
├── components/       # Reusable components
│   ├── ui/           # DataTable, StatsCard, StatusBadge
│   ├── forms/        # ContactForm, OrderForm, ProductForm
│   ├── charts/       # RevenueChart, OrdersChart
│   └── animations/   # GSAP wrappers (FadeIn, StaggerList, Counter)
├── lib/              # Core utilities
│   ├── firebase/     # Firebase config, auth helpers, Firestore CRUD
│   └── ai/           # Gemini API client
├── hooks/            # Custom React hooks (useAuth, useFirestore, useGSAP)
├── store/            # Zustand stores (auth, contacts, orders)
└── types/            # TypeScript interfaces (Contact, Product, Order, Payment)
```

## Architecture Decisions

- **Modular Monolith**: Single Next.js app with clean folder separation per module
- **Firestore**: NoSQL — data is denormalized where needed for fast reads (e.g., `contactName` in orders)
- **API routes**: Used as proxy for Gemini API calls (keeps API key server-side)
- **Zustand**: Lightweight global state for auth, UI state, and cached data
- **GSAP**: Reusable animation wrapper components, not inline animations

## Key Conventions

- Use TypeScript strict mode — no `any` types
- Use `"use client"` directive only on components that need client-side interactivity
- Firestore helpers in `src/lib/firebase/firestore.ts` — all CRUD goes through these
- All forms use controlled components with validation
- GSAP animations wrapped in reusable components under `src/components/animations/`
- Environment variables: Firebase config uses `NEXT_PUBLIC_` prefix, Gemini key is server-only

## Data Collections (Firestore)

- `users` — uid, email, displayName, role (admin/sales)
- `contacts` — customers & suppliers with address, category, assignment
- `products` — catalog with SKU, pricing, stock levels
- `orders` — multi-item orders with status tracking
- `payments` — payment records linked to orders
- `pipeline` — sales deals with Kanban stages

## Role-Based Access

- **Admin**: Full access to all modules
- **Sales**: Access only to assigned contacts, own orders, own deals

## Branch Strategy

- `main` — production (auto-deploys to Vercel)
- `develop` — integration branch
- `feature/*` — feature branches (PR into develop)

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm test         # Run tests
pnpm lint         # Run ESLint
pnpm type-check   # TypeScript check
```

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
GEMINI_API_KEY
```

## Design Spec

Full design document: `docs/superpowers/specs/2026-04-08-textile-crm-design.md`
