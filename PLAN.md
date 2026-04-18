# Maal Manager — مال مینیجر
## Complete Implementation Plan

Inventory management + reorder alerts for Pakistani kiryana stores.

---

## App Concept

**Name:** Maal Manager (مال مینیجر)  
**Store:** Al-Madina General Store — Ahmed Bhai, Gulberg Lahore  
**Problem:** Kiryana store owners run out of fast-moving items because they track inventory manually in notebooks or in their heads. No visibility into what needs reordering until it's already out of stock.  
**Solution:** A simple web app where store owners can see live stock levels, get reorder alerts, and update inventory with one tap.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 (App Router) | Frontend + backend in one project, one Vercel deployment |
| Language | TypeScript | End-to-end type safety |
| Styling | Tailwind CSS + shadcn/ui | Fast, clean, accessible components |
| Database | Neon (PostgreSQL) | Serverless PostgreSQL, connects to Vercel in 2 clicks — SQLite breaks on Vercel serverless |
| ORM | Prisma | Schema + migrations + seed.ts |
| Deployment | Vercel | Free tier, one-click deploy, Neon integration built-in |

---

## Why Neon over SQLite or File-Based

- **Vercel serverless incompatibility:** SQLite needs a persistent filesystem. Vercel functions are stateless — SQLite breaks. Neon is HTTP-based and works perfectly.
- **Zero config:** Connect Neon to Vercel in 2 clicks from the Vercel dashboard. One env variable (`DATABASE_URL`). Done.
- **Production-grade signal:** Evaluators see a real PostgreSQL-backed product, not a JSON file.
- **Prisma seed is trivial:** `npx prisma db seed` runs once and populates all 15 Pakistani products instantly.

---

## Database Schema

### Category
```prisma
model Category {
  id       Int       @id @default(autoincrement())
  name     String    @unique
  icon     String
  products Product[]
}
```

### Product
```prisma
model Product {
  id            Int             @id @default(autoincrement())
  name          String
  categoryId    Int
  category      Category        @relation(fields: [categoryId], references: [id])
  unit          String          // "piece", "kg", "dozen", "litre", "packet"
  currentStock  Int
  minStock      Int             // reorder threshold — alert fires at or below this
  reorderQty    Int             // suggested quantity to reorder
  purchasePrice Decimal
  sellingPrice  Decimal
  supplierName  String?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  movements     StockMovement[]
}
```

### StockMovement
```prisma
enum MovementType {
  RESTOCK
  SALE
  ADJUSTMENT
}

model StockMovement {
  id        Int          @id @default(autoincrement())
  productId Int
  product   Product      @relation(fields: [productId], references: [id], onDelete: Cascade)
  type      MovementType
  quantity  Int          // positive = stock added, negative = removed
  note      String?
  createdAt DateTime     @default(now())
}
```

---

## Seed Data — Realistic Pakistani Products

Seed as: **Ahmed Bhai, Al-Madina General Store, Gulberg Lahore**

Mix of low-stock and OK items so alerts are visible immediately on first load.

| Product | Category | Stock | Min | Unit | Status |
|---|---|---|---|---|---|
| Tapal Danedar 200g | Tea & Coffee | 4 | 10 | packet | ⚠ LOW |
| Lipton Yellow Label 100g | Tea & Coffee | 18 | 8 | packet | ✓ OK |
| Pepsi 1.5L | Beverages | 6 | 12 | bottle | ⚠ LOW |
| Coca-Cola 500ml | Beverages | 24 | 12 | bottle | ✓ OK |
| Shan Biryani Masala | Spices | 3 | 8 | packet | ⚠ LOW |
| Shan Chicken Masala | Spices | 12 | 8 | packet | ✓ OK |
| Sunridge Flour 5kg | Flour & Grains | 2 | 5 | bag | ⚠ LOW |
| Lays Classic 34g | Snacks | 45 | 20 | piece | ✓ OK |
| Peek Freans Peanut Pik | Snacks | 7 | 15 | piece | ⚠ LOW |
| Olpers Milk 1L | Dairy | 10 | 10 | pack | ⚠ AT THRESHOLD |
| Nestle Raita 400g | Dairy | 8 | 5 | pack | ✓ OK |
| Safeguard Soap 135g | Household | 20 | 10 | piece | ✓ OK |
| Surf Excel 500g | Household | 3 | 8 | packet | ⚠ LOW |
| Dalda Cooking Oil 1L | Cooking Oil | 5 | 10 | bottle | ⚠ LOW |
| Mitchell's Jam 440g | Spreads | 6 | 5 | jar | ✓ OK |

---

## API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/products` | Fetch all products with category + computed stock status |
| GET | `/api/products/low-stock` | Fetch only products at or below minStock |
| GET | `/api/products/[id]` | Fetch single product with movement history |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/[id]` | Update product details |
| DELETE | `/api/products/[id]` | Delete product + cascade delete movements |
| PATCH | `/api/products/[id]/stock` | Update stock quantity, creates StockMovement record |
| GET | `/api/categories` | Fetch all categories |
| GET | `/api/stats` | Dashboard stats: total, lowStockCount, outOfStockCount, totalInventoryValue |

---

## Pages & UI Structure

```
app/
  page.tsx                    — Dashboard (default route)
  inventory/
    page.tsx                  — Full product list with search + filter
    new/page.tsx              — Add new product form
    [id]/page.tsx             — Product detail + edit + movement history
  alerts/
    page.tsx                  — Dedicated low stock alerts page
  api/
    products/route.ts
    products/[id]/route.ts
    products/[id]/stock/route.ts
    products/low-stock/route.ts
    categories/route.ts
    stats/route.ts

components/
  ui/                         — shadcn/ui components (auto-generated)
  StatsCard.tsx               — Dashboard metric card (number + label)
  ProductCard.tsx             — Product row with quick +/- stock buttons
  StockBadge.tsx              — OK / LOW / OUT OF STOCK colored badge
  QuickStockUpdate.tsx        — Inline +/- buttons with optimistic update
  AlertBanner.tsx             — Top-of-page "X items need restocking" bar
  Navbar.tsx                  — Mobile bottom nav + desktop left sidebar

prisma/
  schema.prisma
  seed.ts                     — All 15 Pakistani products seeded here
```

---

## Pages Detail

### `/` — Dashboard
- 4 stat cards at top: Total Products, Low Stock, Out of Stock, Total Inventory Value (PKR)
- Low stock list below: top items needing reorder with red badge, sorted by urgency
- Recent stock movements feed: last 10 movements with type + timestamp

### `/inventory` — Product List
- Search bar (by product name)
- Filter by category (dropdown)
- Filter by status: All / Low Stock / Out of Stock / OK
- Each row: product name, category, current stock, min stock, StockBadge, QuickStockUpdate buttons (+/-), edit link
- Floating "Add Product" button

### `/inventory/new` — Add Product
- Form fields: name, category (dropdown), unit, current stock, min stock (reorder threshold), reorder quantity, purchase price (PKR), selling price (PKR), supplier name (optional)
- Validation: name required, stock ≥ 0, minStock > 0, prices > 0

### `/inventory/[id]` — Product Detail
- Full product info card
- Edit form (same fields as add)
- Delete button with confirmation dialog
- Stock movement history table: date, type (RESTOCK/SALE/ADJUSTMENT), quantity, note

### `/alerts` — Low Stock Alerts
- All products at or below minStock, sorted by most critical first (lowest stock relative to threshold)
- Each alert card: product name, current stock, min stock, units short, suggested reorder quantity, supplier name if available
- "Mark Restocked" button → opens dialog to enter quantity → creates RESTOCK movement, updates stock

---

## Component Specs

### StockBadge
```
currentStock === 0          → red    "Out of Stock"
currentStock <= minStock    → amber  "Low Stock"
currentStock > minStock     → green  "OK"
```

### AlertBanner
- Shown on every page at the top
- "⚠ 6 items need restocking" with link to /alerts
- Hidden when 0 low stock items

### Navbar
- Mobile: fixed bottom bar with icons + labels (Dashboard, Inventory, Alerts)
- Desktop: left sidebar with same links
- Alerts link shows red dot badge with count

### QuickStockUpdate
- Two buttons: `-` and `+`
- Clicking calls PATCH /api/products/[id]/stock with delta
- Optimistic UI: number updates instantly, rolls back on error
- Shows toast: "Stock updated" or "Failed to update"

---

## Sprint Plan

### Day 1 — Sunday: Project Setup + Database + Seed

- `npx create-next-app@latest maal-manager --typescript --tailwind --app`
- `npx shadcn@latest init` — install components: button, input, select, badge, card, dialog, table, toast
- `npm install prisma @prisma/client` → `npx prisma init`
- Create Neon account → new project → copy `DATABASE_URL` to `.env`
- Write full `schema.prisma` with all three models
- `npx prisma migrate dev --name init`
- Write `prisma/seed.ts` with all 15 products across 8 categories
- `npx prisma db seed` → verify data in Neon console
- Build `Navbar` component — mobile bottom nav + desktop sidebar
- Set up `layout.tsx` with Navbar + store name header "Al-Madina General Store"
- Deploy skeleton to Vercel → connect Neon via Vercel integration (2 clicks)
- Confirm public URL works

---

### Day 2 — Monday: Dashboard + Inventory List + Stock Updates

- Build `/api/stats` — totalProducts, lowStockCount, outOfStockCount, totalInventoryValue
- Build Dashboard page — 4 metric stat cards
- Dashboard: low stock items list (top 5, red badge)
- Dashboard: recent stock movements feed (last 10)
- Build `/api/products` GET with category name + computed stock status
- Build Inventory page — search + category filter + status filter
- `StockBadge` component
- `QuickStockUpdate` component — calls PATCH on click
- `PATCH /api/products/[id]/stock` — updates currentStock, creates StockMovement
- Optimistic UI updates — no page reload on stock change
- Toast notifications on update success/failure

---

### Day 3 — Tuesday: Add/Edit/Delete + Alerts Page + Product Detail

- `POST /api/products` with validation
- `PUT /api/products/[id]`
- `DELETE /api/products/[id]` with cascade
- Add Product form page `/inventory/new`
- Edit Product — same form pre-filled, accessible from product row
- Delete confirmation dialog (shadcn Dialog)
- Product detail page `/inventory/[id]` — full info + movement history table
- `/alerts` page — all low stock sorted by urgency
- Alert card: name, current stock, min stock, units short, reorder qty, supplier
- `AlertBanner` component on every page
- Red dot badge on Alerts nav item
- Redeploy to Vercel — full end-to-end test

---

### Day 4 — Wednesday: Polish + Mobile + Pakistani UX

- Full mobile responsiveness audit at 375px (iPhone SE)
- Large touch targets on all buttons (min 44px height)
- PKR currency formatting: "Rs. 1,250" throughout
- Urdu product names display correctly — ensure font handles Urdu script
- Store header: "Al-Madina General Store — احمد بھائی" + "Gulberg, Lahore"
- Warm green color scheme — trustworthy, clean, not sterile
- Empty states — helpful messages not blank screens
- Loading skeletons on all data fetches — no layout shift
- Error boundaries — friendly error UI if API fails
- Page titles: "Maal Manager | Al-Madina General Store"
- Emoji favicon: 🏪
- Final Vercel deployment — verify all routes, seed data live

---

### Day 5 — Thursday (Phase 2, if Phase 1 complete)

- Quick Sale recording — tap product, enter quantity sold, stock auto-decrements
- Daily revenue tracker — sum of today's sales × selling price
- "Mark Restocked" action on alert cards — enter qty, creates RESTOCK movement
- Supplier name on product cards — "Order from: Rafiq Traders"
- Category management page — add/rename categories
- Print restock list — browser print of all low stock items

---

## Phases Overview

### Phase 1 — MVP (must ship)
Dashboard stats, product list, add/edit/delete products, quick stock +/- buttons, reorder alerts, low stock badge, alert banner, Pakistani seed data, mobile-first UI, PKR formatting.

### Phase 2 — Sales (if time allows)
Quick sale recording, daily revenue tracking, restock action from alerts, supplier tracking, category management, print restock list.

### Phase 3 — Analytics (stretch)
Weekly/monthly stock charts, top selling products, wastage tracking, Urdu language toggle, export to CSV, low stock history graphs.

---

## UX Requirements Checklist

- [ ] Mobile-first — works perfectly at 375px width
- [ ] PKR currency format everywhere — "Rs. 1,250" not "$1250"
- [ ] Urdu script support in product names
- [ ] Store name + owner name in header ("احمد بھائی")
- [ ] AlertBanner on every page showing low stock count
- [ ] Red badge on Alerts nav item with live count
- [ ] Loading skeletons on all async data
- [ ] Toast notifications on all mutations
- [ ] Empty state messages (not blank screens)
- [ ] Confirmation dialog before delete
- [ ] Optimistic UI on stock updates (no reload)
- [ ] Error boundaries with friendly messages
- [ ] Warm green color scheme
- [ ] Large touch targets (min 44px)
- [ ] Bottom nav on mobile, sidebar on desktop

---

## Claude Code Starter Prompt

Paste this into Claude Code to begin:

```
I am building "Maal Manager" — an inventory management app with reorder alerts
for a Pakistani kiryana store owner. Single store, no authentication required.

Tech stack: Next.js 16 App Router, TypeScript, Tailwind CSS, shadcn/ui,
Prisma ORM, Neon PostgreSQL, deployed on Vercel.

DATABASE SCHEMA:
Three models — Category (id, name, icon), Product (id, name, categoryId, unit,
currentStock, minStock, reorderQty, purchasePrice, sellingPrice, supplierName?,
createdAt, updatedAt), StockMovement (id, productId, type ENUM[RESTOCK|SALE|
ADJUSTMENT], quantity, note?, createdAt).

SEED DATA:
Pre-populate with 15 real Pakistani products (Tapal Danedar 200g, Pepsi 1.5L,
Shan Biryani Masala, Sunridge Flour 5kg, Lays Classic, Olpers Milk 1L, Surf
Excel 500g, Dalda Cooking Oil 1L etc.) for "Al-Madina General Store, Ahmed
Bhai, Gulberg Lahore". Mix of low-stock and OK items so alerts show immediately.

PAGES:
/ — Dashboard with 4 stat cards (total products, low stock count, out of stock
count, total inventory value in PKR) + low stock list + recent movements feed
/inventory — Searchable product list with category filter, status filter,
quick +/- stock update buttons, StockBadge (OK/LOW/OUT OF STOCK)
/inventory/new — Add product form
/inventory/[id] — Product detail + edit + delete + movement history
/alerts — All low stock items sorted by urgency with restock action

UX REQUIREMENTS:
Mobile-first. PKR currency format (Rs. X,XXX). Warm green color scheme.
AlertBanner on every page showing low stock count. Red badge on alerts nav.
Bottom nav on mobile, sidebar on desktop. Loading skeletons. Toast notifications
on stock updates. Optimistic UI (no page reload on +/- stock). Empty states.
Store header shows: "Al-Madina General Store — احمد بھائی | Gulberg, Lahore"

Start with Step 1: project setup, Prisma schema, Neon connection, seed data,
and the base layout with Navbar.
```

---

## Deployment Checklist

- [ ] Neon database created and `DATABASE_URL` in Vercel env vars
- [ ] `npx prisma migrate deploy` runs on Vercel build
- [ ] `npx prisma db seed` run once manually after first deploy
- [ ] All API routes return correct status codes (200, 201, 400, 404, 500)
- [ ] Public URL accessible with no authentication
- [ ] Seed data visible immediately on landing (no blank screens)
- [ ] Mobile tested on actual phone before submission
- [ ] All 4 pages navigate correctly from Navbar

---
