# StockFlow MVP

A minimal multi-tenant inventory management app. Each signup creates an organization; products and settings are scoped to that org.

## Stack

- **Backend:** Node.js, Express 5, Prisma 7, PostgreSQL
- **Frontend:** Next.js 16, React 19, Tailwind CSS, shadcn/ui

## Prerequisites

- Node.js 20+
- PostgreSQL database (e.g. [Neon](https://neon.tech))

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | API port (default `5000`) |
| `JWT_SECRET` | Long random string for session tokens |
| `FRONTEND_URL` | Frontend origin (default `http://localhost:3000`) |

Run migrations and start the API:

```bash
npm run db:generate
npm run db:migrate
npm run dev
```

API base: `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
```

Set in `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo checklist (MVP success criteria)

1. **Sign up** with email, password, and organization name.
2. **Log in** and land on the **Dashboard** (product count, total units, low-stock table).
3. **Create a product** with SKU and quantity (`Products` → **Add product**).
4. Confirm the product appears in the **Products** list and updates dashboard totals.
5. Set quantity at or below the low-stock threshold and confirm it shows under **Low stock items** on the dashboard.
6. Change **Settings** → default low-stock threshold and verify low-stock logic uses it for products without their own threshold.
7. **Log out** and confirm protected routes redirect to login.

## API overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/signup` | Register + create org |
| POST | `/api/auth/login` | Login (HTTP-only cookie) |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user + org |
| GET/POST | `/api/products` | List / create products |
| GET/PATCH/DELETE | `/api/products/:id` | Product CRUD |
| GET | `/api/dashboard` | Summary + low-stock items |
| GET/PATCH | `/api/settings` | Org default low-stock threshold |

## Scripts

**Backend**

- `npm run dev` — API with hot reload (`tsx`)
- `npm run build` / `npm start` — production build
- `npm run db:migrate` — apply Prisma migrations
- `npm run db:generate` — regenerate Prisma client

**Frontend**

- `npm run dev` — Next.js dev server
- `npm run build` / `npm start` — production build
