# StockFlow MVP

A minimal multi-tenant inventory management app. Each signup creates an organization; products and settings are scoped to that org.

## Stack

- **Backend:** Node.js, Express 5, Prisma 7, PostgreSQL
- **Frontend:** Next.js 16, React 19, Tailwind CSS, shadcn/ui

## Live deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | [Vercel](https://vercel.com) | [https://prd-mvp-wexaai.vercel.app/](https://prd-mvp-wexaai.vercel.app/) |
| Backend API | [Render](https://render.com) (free tier) | [https://stockflow-api-lrkf.onrender.com](https://stockflow-api-lrkf.onrender.com) |

**Try the app:** open the [StockFlow frontend](https://prd-mvp-wexaai.vercel.app/) and sign up or log in.

**Render free tier — cold starts:** The API runs on Render’s free plan, which spins down after inactivity. The **first request after idle time can take 30–60+ seconds** while the service wakes up. If login or page loads feel slow at first, wait a moment and retry; subsequent requests are much faster until the next sleep cycle.

**Health check:** `GET https://stockflow-api-lrkf.onrender.com/api/health`

### Production environment variables

**Vercel (frontend)**

```
NEXT_PUBLIC_API_URL=https://stockflow-api-lrkf.onrender.com
API_URL=https://stockflow-api-lrkf.onrender.com
```

`API_URL` is used by the server-side `/api/*` proxy so login sets an **httpOnly cookie on the Vercel domain**. Without it, auth works in the network tab but middleware never sees the session and you stay on `/login?from=/dashboard`.

**Render (backend)**

| Setting | Value |
|---------|--------|
| **Build command** | `npm install && npm run build` |
| **Start command** | `npm start` |
| **Root directory** | `backend` (if deploying from monorepo) |

The API runs with **`tsx src/index.ts`** (not compiled `dist/`), because Prisma 7’s generated client is ESM and breaks when compiled to CommonJS for `node dist/index.js`.

```
DATABASE_URL=<your-postgres-url>
JWT_SECRET=<long-random-secret>
NODE_ENV=production
FRONTEND_URL=https://prd-mvp-wexaai.vercel.app
PORT=10000
```

`FRONTEND_URL` must match the Vercel origin exactly so CORS and auth cookies work across the frontend and API.

After the first deploy, run migrations against production (locally or a one-off Render shell):

```bash
cd backend
DATABASE_URL="<production-url>" npm run db:migrate:deploy
```

Do **not** set `NODE_ENV=production` for the **build** step on Render if you ever move TypeScript back to `devDependencies` — that skips dev packages and breaks `tsc`. This repo keeps `typescript`, `prisma`, and `@types/*` in `dependencies` so production builds succeed.

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

For local dev, keep `FRONTEND_URL=http://localhost:3000` on the backend and `NEXT_PUBLIC_API_URL=http://localhost:5000` on the frontend.

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
