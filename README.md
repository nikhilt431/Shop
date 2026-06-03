# Repair Shop Management System

A production-oriented cloud repair workflow app for electronics, appliances, electrical repairs, customer portals, technician work queues, billing, inventory, notifications, and reports.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS with shadcn-style primitives
- Prisma ORM
- PostgreSQL
- Auth.js / NextAuth credentials auth
- Cloudinary or S3-ready storage abstraction
- PDF invoice and receipt generation with jsPDF

## Quick Start

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`, `AUTH_SECRET`, and storage credentials.
3. Install dependencies:

```bash
npm install
```

4. Create the database schema and seed sample data:

```bash
npm run prisma:migrate
npm run prisma:seed
```

5. Run locally:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Demo Accounts

- Super Admin: `admin@repairpro.local` / `Password123!`
- Reception: `reception@repairpro.local` / `Password123!`
- Technician: `tech@repairpro.local` / `Password123!`
- Customer: `customer@repairpro.local` / `Password123!`

## Deployment

1. Create a PostgreSQL database through Neon, Supabase, Railway, Render, or Vercel Postgres.
2. Configure environment variables in Vercel.
3. Run `prisma migrate deploy` during deployment.
4. Configure Cloudinary or S3 credentials.
5. Deploy the repository to Vercel.

## Main Modules

- Authentication and role-based access
- Dashboard with metrics, charts, recent jobs, pending deliveries, and low stock parts
- Customer management and repair history
- Product intake with photo upload support and printable receipt
- Technician management, workload, assignments, and performance
- Repair job workflow with full timeline and notes
- Spare parts inventory with automatic stock deduction
- Billing, invoices, taxes, discounts, payment tracking, and PDF export
- Warranty records and warranty claim tracking
- Notification templates and notification log
- Reports with CSV export-ready endpoints
- Multi-branch and multi-technician assignment data model

