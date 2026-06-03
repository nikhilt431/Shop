# Architecture

## Modules

- `app/(app)/dashboard`: metrics, charts, recent jobs, pending delivery, low stock.
- `app/(app)/customers`: customer management and repair history.
- `app/(app)/jobs`: intake, workflow, status history, notes, part consumption.
- `app/(app)/technicians`: technician profiles, workload, performance.
- `app/(app)/inventory`: parts, stock levels, low-stock monitoring.
- `app/(app)/billing`: invoice generation, payment tracking, PDF export.
- `app/(app)/notifications`: templates and notification logs.
- `app/(app)/reports`: operational reports and CSV export.
- `app/(app)/portal`: customer self-service repair tracking.
- `app/(app)/categories`: unlimited repair category management.
- `app/(app)/settings`: system defaults.

## Backend

- Server actions handle form-first workflows.
- API routes expose JSON and export endpoints.
- Prisma models define all production entities.
- Role guards live in `lib/permissions.ts`.
- Audit logging lives in `lib/audit.ts`.
- Upload abstraction lives in `lib/storage.ts`.
- Notification queueing lives in `lib/notifications.ts`.

## Data Model Highlights

- Multi-branch support through `Branch`.
- Multi-technician assignment through `JobAssignment`.
- Full repair history through `RepairStatusEvent`.
- Product and repair photos through `RepairPhoto`.
- Automatic stock deduction through `JobPartUsage` and `StockMovement`.
- Billing through `Invoice`.
- Warranty claims through `WarrantyClaim`.
- Custom templates and delivery log through `NotificationTemplate` and `Notification`.
- Security trail through `AuditLog`.
