# Maal Manager — مال مینیجر

> Restock planning & reorder alerts tool for Pakistani kiryana stores.
> Built as a take-home assignment for a YC-backed Pakistani startup.

A full-stack web application built for small shop owners who manage stock and plan restocks manually using notebooks or from memory. Maal Manager gives them real-time visibility into stock levels, automatic reorder alerts, and a complete history of every sale, restock, and adjustment — all managed from their phone.

---

## Features

- **Dashboard** — At-a-glance stats: total products, low-stock count, out-of-stock count, total inventory value in PKR, and today's revenue.
- **Inventory Management** — Browse all products with search, category filter, and stock-status filter. Add, edit, or delete products. Full movement history per product.
- **Quick Stock Updates** — Tap `+` or `−` directly from the product list. Updates are optimistic (instant UI feedback) and create a `StockMovement` record automatically.
- **Reorder Alerts** — Dedicated alerts page shows every product at or below its minimum threshold, sorted by urgency. One-tap restock action opens a dialog to log the incoming quantity.
- **Alert Banner** — A persistent banner on every page shows the live count of items that need restocking, linking straight to the alerts page.
- **Stock Movement Log** — Every stock change (restock, sale, adjustment) is recorded with a timestamp and optional note. The dashboard shows the last 10 movements in real time.
- **PDF Export and One-Click Whatsapp Share** — Generate a printable restock list for suppliers and share it with one click.
- **Mobile-First UI** — Bottom navigation on mobile, sidebar on desktop. Large touch targets throughout.
- **Pakistani UX** — PKR currency formatting (`Rs. 1,250`), Urdu product names, and pre-seeded Pakistani products (Tapal Danedar, Shan Masala, Dalda Oil, etc.).

---

## Tech Stack

| Layer      | Technology                  |
| ---------- | --------------------------- |
| Framework  | Next.js 16 (App Router)     |
| Language   | TypeScript                  |
| Styling    | Tailwind CSS v4 + shadcn/ui |
| Database   | Neon (PostgreSQL)           |
| ORM        | Prisma                      |
| Deployment | Vercel                      |

---

## Project Structure

```
app/
├── page.tsx                  # Dashboard
├── inventory/
│   ├── page.tsx              # Product list (search + filters)
│   ├── new/page.tsx          # Add product form
│   └── [id]/page.tsx         # Product detail, edit, delete, movement history
├── alerts/page.tsx           # Low-stock alerts
└── api/
    ├── products/             # CRUD + stock patch
    ├── categories/           # Category list
    └── stats/                # Aggregate dashboard stats

components/
├── StatsCard.tsx             # Metric card (number + label + trend)
├── ProductCard.tsx           # Product row with quick stock buttons
├── StockBadge.tsx            # OK / LOW / OUT OF STOCK colored badge
├── QuickStockUpdate.tsx      # Optimistic +/- stock buttons
├── AlertBanner.tsx           # Top-of-page restock warning bar
└── Navbar.tsx                # Mobile bottom nav + desktop sidebar

prisma/
├── schema.prisma             # Category, Product, StockMovement models
└── seed.ts                   # 15 real Pakistani products pre-seeded
```

---

## Database Schema

Three models:

- **Category** — `id`, `name`, `icon` (emoji)
- **Product** — `name`, `categoryId`, `unit`, `currentStock`, `minStock`, `reorderQty`, `purchasePrice`, `sellingPrice`, `supplierName?`, `supplierPhone?`
- **StockMovement** — `productId`, `type` (`RESTOCK | SALE | ADJUSTMENT`), `quantity`, `note?`, `createdAt`

Stock status is computed at query time:

- `currentStock === 0` → **Out of Stock**
- `currentStock <= minStock` → **Low Stock**
- `currentStock > minStock` → **OK**

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database (free tier is enough)

### 1. Clone & install

```bash
git clone https://github.com/your-username/maal-manager.git
cd maal-manager
npm install
```

### 2. Configure environment

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://..."
```

Paste your Neon connection string above.

### 3. Run migrations & seed

```bash
npm run db:migrate      # apply schema migrations
npm run db:seed         # populate 15 Pakistani products
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

1. Push to GitHub.
2. Import the repo on [Vercel](https://vercel.com).
3. In Vercel → Storage, connect a Neon database. The `DATABASE_URL` env var is set automatically.
4. Add this build command override so migrations run on every deploy:
   ```
   prisma migrate deploy && next build
   ```
5. After the first deploy, run `npm run db:seed` once from your local machine pointing at the production `DATABASE_URL`.

---

## Scripts

| Command              | Description                            |
| -------------------- | -------------------------------------- |
| `npm run dev`        | Start development server               |
| `npm run build`      | Production build                       |
| `npm run db:migrate` | Run Prisma migrations (dev)            |
| `npm run db:deploy`  | Run Prisma migrations (production)     |
| `npm run db:seed`    | Seed the database with sample data     |
| `npm run db:studio`  | Open Prisma Studio (visual DB browser) |
