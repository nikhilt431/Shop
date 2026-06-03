# Deployment Instructions

## Local Development

1. Install Node.js 22 or newer.
2. Install PostgreSQL 15 or newer.
3. Copy `.env.example` to `.env`.
4. Set `DATABASE_URL` and `AUTH_SECRET`.
5. Run:

```bash
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## Production on Vercel

1. Push this project to a Git repository.
2. Create a PostgreSQL database through Neon, Supabase, Railway, Render, or Vercel Postgres.
3. Add these Vercel environment variables:

```bash
DATABASE_URL
AUTH_SECRET
NEXTAUTH_URL
STORAGE_PROVIDER
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
EMAIL_FROM
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASSWORD
```

4. Set the build command:

```bash
npm run build
```

5. Run migrations in production:

```bash
npx prisma migrate deploy
```

6. Configure Cloudinary unsigned or signed upload presets, or replace `lib/storage.ts` with an S3 signed upload flow.

## Security Checklist

- Use a strong `AUTH_SECRET`.
- Enforce HTTPS in production.
- Store all credentials in Vercel environment variables.
- Keep customer photo buckets private unless signed URLs are used.
- Limit technician and customer permissions through role checks.
- Review `AuditLog` regularly.

## Background Services

Notifications are queued in the database. For production delivery, connect `Notification` rows to a scheduled worker or queue consumer that sends SMS, WhatsApp, and email through your preferred providers.

Realtime events are modeled in `lib/realtime.ts`; connect those channels to Pusher, Supabase Realtime, Ably, or Vercel-compatible websocket infrastructure.
