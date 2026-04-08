# Textile CRM

A full-stack Customer Relationship Management system for the textile industry, covering the complete textile chain — yarn, fabric, and garment businesses.

Built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **Material UI**, **GSAP Animations**, **Firebase**, and **Zustand**. Features **AI-powered business insights** via Google Gemini API.

---

## Features

### Core CRM
- **Contacts Management** — Customers & suppliers with full profile, order history, and payment tracking
- **Product Catalog** — Fabric, yarn, and garment listings with SKU, pricing, and stock alerts
- **Order Management** — Multi-item orders with status tracking (draft → confirmed → dispatched → delivered)
- **Payment Tracking** — Record payments against orders, track pending dues
- **Sales Pipeline** — Kanban board with drag & drop for deal management across 6 stages

### AI-Powered Insights (Standout Feature)
- **Sales Forecast** — Predicted revenue based on historical trends
- **Follow-Up Suggestions** — Identify customers who haven't ordered recently
- **Deal Risk Alerts** — Flag deals stuck in negotiation too long
- **Smart Summary** — Natural language weekly business overview
- **Ask AI** — Free-form questions about your business data

### Role-Based Access
- **Admin** — Full access to all modules and settings
- **Sales Rep** — Access only to assigned contacts, own orders, and own deals

### UI/UX
- Responsive dashboard with animated stats cards
- GSAP animations — page transitions, counter animations, drag effects
- Material UI components + Tailwind CSS for polished, consistent design

### DevOps
- CI/CD pipeline with GitHub Actions
- Auto-deployment to Vercel on push to main
- Preview deployments for pull requests

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + Material UI v6 |
| Animations | GSAP 3 |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Storage | Firebase Storage |
| State | Zustand |
| AI | Google Gemini API |
| CI/CD | GitHub Actions + Vercel |
| Testing | Vitest + React Testing Library |

---

## Prerequisites

Before running this project, you need:

1. **Node.js 18+** — [Download](https://nodejs.org)
2. **pnpm** — Install via `npm install -g pnpm`
3. **Firebase Project** — [Create one](https://console.firebase.google.com)
   - Enable Authentication (Email/Password + Google)
   - Create Firestore Database (test mode)
   - Enable Storage
   - Register a Web App and copy the config
4. **Gemini API Key** — [Get one](https://aistudio.google.com/apikey)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/textile-crm.git
cd textile-crm
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Create production build |
| `pnpm start` | Start production server |
| `pnpm test` | Run tests |
| `pnpm lint` | Run ESLint |
| `pnpm type-check` | Run TypeScript compiler check |

---

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── (auth)/       # Login, Register
│   ├── (dashboard)/  # Dashboard, Contacts, Products, Orders, Payments, Pipeline
│   └── api/          # API routes (AI insights)
├── components/       # Reusable components (ui, forms, charts, animations)
├── lib/              # Firebase config, Gemini client, utilities
├── hooks/            # Custom React hooks
├── store/            # Zustand state stores
└── types/            # TypeScript interfaces
```

---

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repo on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Every push to `main` auto-deploys to production

### CI/CD

- **Pull Requests** trigger lint + type-check + tests via GitHub Actions
- **Merge to main** triggers auto-deployment to Vercel

---

## License

MIT
