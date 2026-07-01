# SmartMart Frontend

Web app for the SmartMart IoT smart trolley system: customer and admin portals with role-based login, product management, dashboard, trolleys, alerts, and sales.

## Tech Stack

- **React 18**
- **TypeScript**
- **Vite 5**
- **React Router 6**
- **TanStack Query (React Query)**
- **Tailwind CSS**
- **shadcn/ui** (Radix UI)
- **Recharts**
- **Lucide React** (icons)

## Prerequisites

- Node.js 18+ (or use Bun; project has `bun.lockb`)
- npm, yarn, or bun

## Setup

### 1. Install dependencies

```bash
npm install
# or: yarn install / bun install
```

### 2. Environment

Copy `.env.example` to `.env` and set:

```env
# Auth service (login/register). Required for real auth.
VITE_AUTH_API_URL=http://localhost:8081

# App API (products, trolleys, alerts, dashboard, sales).
# Set to auth-service URL to use backend; leave unset for mock data.
VITE_APP_API_URL=http://localhost:8081
```

- **VITE_AUTH_API_URL** – Backend auth base URL (default `http://localhost:8081`).
- **VITE_APP_API_URL** – Same backend URL if all APIs run there; omit to use mock data only.

### 3. Run

```bash
npm run dev
```

App runs at **http://localhost:8080** (see `vite.config.ts` for port).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest |

## Project Structure

```
src/
├── api/             # App API client (products, trolleys, alerts, etc.)
├── components/     # UI components, layout, ProtectedRoute
├── context/        # AuthContext
├── data/           # Mock data (used when VITE_APP_API_URL unset)
├── hooks/          # useToast, use-mobile
├── lib/            # api (auth), utils
├── pages/          # Routes
│   ├── admin/      # Admin dashboard, products, trolleys, alerts, reports
│   ├── customer/   # Login, register, dashboard, payment
│   ├── Index.tsx   # Landing
│   └── NotFound.tsx
├── types/          # TypeScript types
└── main.tsx
```

## Roles & Routes

- **Customer** (`ROLE_CUSTOMER`): Register, Customer Login → Dashboard, Payment.
- **Admin** (`ROLE_ADMIN`): Admin Login → Dashboard, Products, Trolleys, Alerts, Reports.

Customer routes require customer role; admin routes require admin role. Logout clears session.

## Backend & API JSON

Auth and app APIs are provided by **auth-service** (see its README). Ensure it is running on the URL set in `VITE_AUTH_API_URL` (and `VITE_APP_API_URL` if using real data).

Default base URL: **http://localhost:8081**

Full request/response JSON for all APIs is in the **auth-service README**. Quick reference:

**Login** – `POST /api/auth/login`

Request:
```json
{ "email": "user@example.com", "password": "secret123" }
```
Response:
```json
{ "token": "eyJhbGciOiJIUzI1NiIs...", "role": "ROLE_CUSTOMER" }
```

**Register** – `POST /api/auth/register`

Request:
```json
{ "name": "John Smith", "email": "john@example.com", "password": "secret123", "role": "ROLE_CUSTOMER" }
```

**Protected requests** – Send header: `Authorization: Bearer <token>`.

## Build for production

```bash
npm run build
```

Output is in `dist/`. Serve with any static host or use `npm run preview` to test.
