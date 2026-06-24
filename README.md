# BistroFlow POS

A single-tenant restaurant Point-of-Sale (POS) system built for the Indonesian market. Combines a cashier interface for daily operations with a strategic owner dashboard for business metrics, inventory management, and financial reporting. Works **offline-first** as a Progressive Web App (PWA) — core POS functionality runs without an internet connection.

## Features

### Cashier POS
- Menu grid with photos, prices, and category filtering
- Cart management with quantity adjustments, notes, and line-item void
- Order modes: dine-in, takeaway, delivery (with delivery markup)
- PPN (tax) calculation with configurable rate (default 11%)
- Payment modal with change calculator
- Bill hold & resume
- Shift open/close with Z-Report and cash reconciliation

### Owner Dashboard
- Bento-grid layout with real-time business metrics
- Daily sales chart (Recharts)
- Top 10 selling items
- Low-stock alerts
- Period-based reporting (daily, weekly, monthly, custom range)

### Inventory & Expenses
- Raw materials CRUD with stock tracking
- Stock-in, stock-out, and adjustment transactions
- Low-stock threshold alerts
- Operational expenses (opex) recording by category

### Kitchen & Printing
- Real-time WebSocket-based kitchen printing
- Printer-to-category routing (e.g., drinks → bar printer, food → kitchen printer)
- Job buffering when no printer is connected (up to 5 minutes)
- 80mm thermal receipt print layout

### Platform
- **Offline-first PWA** — Service Worker with background sync; IndexedDB for menu, orders, shifts, and settings
- **RBAC** — owner and cashier roles enforced at API middleware and frontend routing
- **Audit trail** — every significant action logged with metadata
- **Dark mode** support
- WCAG AA contrast ratios, 48×48px minimum touch targets, reduced-motion support

## Tech Stack

| Layer       | Technology                                              |
|-------------|---------------------------------------------------------|
| Backend     | Go 1.26, Gin-Gonic v1.10, GORM v1.25                    |
| Database    | PostgreSQL 16 (Alpine)                                   |
| Auth        | JWT RS256, bcrypt password hashing                       |
| Frontend    | Next.js 16 (React 19, TypeScript 5.9), Tailwind CSS v4  |
| State       | Zustand v5                                               |
| Charts      | Recharts v3.3                                            |
| PWA         | Custom Service Worker, IndexedDB (via `idb`)             |
| Real-time   | Gorilla WebSocket v1.5                                   |
| PDF Export  | gofpdf v1.16                                             |
| Infra       | Docker Compose, Air (Go hot-reload), Turbopack           |

## Prerequisites

- **Go** 1.26+
- **Node.js** 20+
- **PostgreSQL** 16 (or Docker Compose for a managed instance)
- **Docker & Docker Compose** (optional, recommended for development)

## Quick Start

### 1. Environment

Copy the example environment file and review the defaults:

```bash
cp .env.example .env
```

The defaults work out-of-the-box with Docker Compose. Key variables:

| Variable                  | Default               | Description                       |
|---------------------------|-----------------------|-----------------------------------|
| `DB_HOST`                 | `db`                  | PostgreSQL host                   |
| `DB_PORT`                 | `5432`                | PostgreSQL port                   |
| `DB_USER` / `DB_PASSWORD` | `postgres` / `postgres` | Database credentials            |
| `DB_NAME`                 | `bistroflow`          | Database name                     |
| `SERVER_PORT`             | `8080`                | Backend API port                  |
| `GIN_MODE`                | `debug`               | `debug` or `release`              |
| `FRONTEND_URL`            | `http://localhost:3000` | CORS allowed origin             |
| `NEXT_PUBLIC_API_URL`     | `http://localhost:8080` | API base URL (frontend)         |
| `NEXT_PUBLIC_WS_URL`      | `ws://localhost:8080`   | WebSocket URL (frontend)        |

JWT keys are auto-generated (RSA 2048-bit) if left blank in development.

### 2. Start with Docker Compose

```bash
docker compose up --build
```

This starts three services:
- **db** — PostgreSQL 16 on port `5432`
- **backend** — Go API on port `8080` (hot-reload via Air)
- **frontend** — Next.js on port `3000` (Turbopack dev server)

Migrations and seed data run automatically on backend startup.

### 3. Manual Start

If you prefer running without Docker:

```bash
# Start PostgreSQL and create the database
createdb bistroflow

# Backend
cd backend
go run ./cmd/server

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

### 4. Login

Open **http://localhost:3000** and sign in:

| Role    | Username   | Password      |
|---------|------------|---------------|
| Owner   | `owner`    | `admin123`    |
| Cashier | `cashier`  | `cashier123`  |

## Project Structure

```
resto-pos-mvp/
├── .env.example                  # Environment template
├── docker-compose.yml            # Docker Compose (db + backend + frontend)
├── docs/
│   └── PRD-2026-06-23.md         # Full PRD (Indonesian)
├── backend/
│   ├── cmd/
│   │   ├── server/main.go        # Entry point: router, DI, middleware
│   │   └── hashgen/main.go       # bcrypt hash generator utility
│   ├── internal/
│   │   ├── auth/                 # JWT auth, login handler
│   │   ├── config/               # Env & JWT key loader
│   │   ├── employee/             # Employee CRUD (owner-managed users)
│   │   ├── inventory/            # Raw materials, stock-in/out, alerts
│   │   ├── menu/                 # Menu items & categories
│   │   ├── middleware/           # Auth, RBAC, CORS, logger, rate-limit
│   │   ├── models/               # GORM models (13 tables)
│   │   ├── opex/                 # Operational expenses
│   │   ├── pos/                  # Order creation & batch sync
│   │   ├── printer/              # Printer management & test print
│   │   ├── report/               # Financial reports, CSV/PDF export
│   │   ├── settings/             # Global settings (PPN, tokens, tax rate)
│   │   ├── shift/                # Shift open/close, Z-Report
│   │   ├── websocket/            # WebSocket hub for kitchen printing
│   │   └── activitylog/          # User activity audit trail
│   ├── pkg/
│   │   ├── database/             # PostgreSQL connection, migration runner
│   │   ├── ratelimit/            # Login brute-force protection
│   │   ├── response/             # Standard API response envelope
│   │   └── validator/            # Input validation utilities
│   └── migrations/               # 15 SQL migration pairs (up/down)
├── frontend/
│   ├── public/
│   │   ├── manifest.json         # PWA manifest
│   │   ├── sw.js                 # Custom Service Worker
│   │   └── icons/                # PWA icons (192×192, 512×512)
│   └── src/
│       ├── app/                  # Next.js App Router pages
│       │   ├── login/            # Login page
│       │   ├── cashier/pos/      # Main POS interface
│       │   └── owner/            # Owner dashboard (10 pages)
│       ├── components/
│       │   ├── ui/               # Shared UI primitives
│       │   ├── landing/          # Landing page sections
│       │   ├── owner/            # Dashboard-specific components
│       │   └── pos/              # POS-specific components
│       ├── stores/               # Zustand stores
│       ├── services/             # API client & service layer
│       ├── hooks/                # useAuth, useOnlineStatus, useWebSocket
│       ├── db/                   # IndexedDB schema & sync helpers
│       ├── lib/                  # Tax calc, currency format, utilities
│       └── types/                # TypeScript interfaces
```

## API Overview

Base path: `/api/v1/`. All responses use the envelope `{ status, data, message }`.

### Public
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| POST   | `/auth/login`         | Login (rate-limited)     |
| GET    | `/settings/active`    | Public settings          |
| GET    | `/healthz`            | Health check             |

### WebSocket
| Protocol | Endpoint                          | Description               |
|----------|-----------------------------------|---------------------------|
| WS       | `/ws?token=<jwt>&channel=<name>`  | Kitchen print hub (JWT-protected) |

### Authenticated (any role)
| Method | Endpoint    | Description                |
|--------|-------------|----------------------------|
| GET    | `/auth/me`  | Current user profile       |
| GET    | `/menu`     | Menu items (role-filtered) |

### Owner-only
- **Dashboard:** `GET /dashboard`
- **Employees:** CRUD at `/employees`
- **Categories:** CRUD at `/categories`
- **Menu items:** CRUD at `/menu`
- **Inventory:** CRUD at `/raw-materials`, stock-in/out, low stock, history
- **Opex:** CRUD at `/opex`
- **Reports:** summary, top items, sales chart, CSV/PDF export at `/reports`
- **Printers:** CRUD at `/printers`
- **Settings:** list & update at `/settings`
- **Activity log:** `GET /activity-log`

### Cashier-only
| Method | Endpoint           | Description                   |
|--------|---------------------|-------------------------------|
| GET    | `/shift/active`     | Current active shift          |
| POST   | `/shift/open`       | Open a new shift              |
| POST   | `/shift/end`        | End shift with Z-Report       |
| POST   | `/orders`           | Create a single order         |
| POST   | `/orders/batch`     | Batch sync offline orders     |

## Database

13 PostgreSQL tables managed via `golang-migrate`. Migrations run automatically on server startup. Custom ENUM types for roles, shift status, order types, payment methods, order status, stock transaction types, and printer types. See `backend/migrations/` for the full schema and seed data.

## Offline Architecture

The PWA strategy uses multiple layers:

| Layer          | Strategy                      | Storage                          |
|----------------|-------------------------------|----------------------------------|
| Static assets  | Pre-cache + stale-while-revalidate | Service Worker cache         |
| Menu data      | Cache-first, periodic refresh | IndexedDB (`menuCache`)          |
| Orders         | Write-through, background sync| IndexedDB (`pendingSync`)        |
| Held bills     | Local-first                   | IndexedDB (`heldBills`)          |
| Shift state    | Local-first, server reconcile | IndexedDB (`shiftCache`)         |
| Settings       | Network-first, local fallback | IndexedDB (`settings`)           |

Offline orders queue in IndexedDB and sync via `POST /orders/batch` when connectivity is restored (Background Sync API).

## Design System

- **Primary:** Brand green (`#1A5D3A` / `#4CAF50`) with 9-shade scale
- **Neutral:** Gray scale (`#111827` → `#F9FAFB`) for dark mode
- **Typography:** Inter variable, 16px minimum
- **Touch targets:** 48×48px minimum
- **Print:** 80mm thermal receipt width
- **Accessibility:** WCAG AA contrast, `prefers-reduced-motion` support, semantic HTML

## Security

- JWT RS256-signed tokens (12-hour expiry)
- bcrypt password hashing
- Brute-force protection: 5 failed login attempts → 15-minute block
- CORS restricted to configured `FRONTEND_URL`
- RBAC enforced at API middleware level
- WebSocket connections authenticated via query-param JWT

## License

Proprietary. All rights reserved.
