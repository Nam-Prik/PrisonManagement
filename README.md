# ZedYor — Prison Management System

A full-stack web application for managing prison operations including maintainers, prisoners, officers, visitations, treatments, and incidents.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router v7 |
| HTTP | Native `fetch` wrapper (no axios) |
| Backend | Hono.js on Node.js |
| Database | PostgreSQL (raw `pg`, no ORM) |
| Validation | Zod (both client and server) |
| Package manager | pnpm |

---

## Project Structure

```
ZedYor/
├── client/               # React + Vite frontend
│   └── src/
│       ├── api/          # HTTP calls (http.ts wrapper + per-resource files)
│       ├── pages/        # Page components
│       └── types/dto/    # Zod schemas and TypeScript types
├── server/               # Hono.js backend
│   └── src/
│       ├── routes/       # Route definitions + Zod validation
│       ├── controllers/  # Request/response handling
│       ├── services/     # Business logic
│       ├── repositories/ # Raw SQL queries
│       ├── models/       # DB row → domain type conversion
│       ├── dto/          # Zod schemas
│       └── db/           # PostgreSQL pool
└── SQL/
    └── setup/            # Table definitions and seed data
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- PostgreSQL (or use the Docker setup below)

### 1. Clone and install

```bash
git clone <repo-url>
cd ZedYor
pnpm install          # installs root deps and sets up git hooks
cd server && pnpm install
cd ../client && pnpm install
```

### 2. Configure environment

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env and set your DATABASE_URL

# Client
cp client/.env.example client/.env
```

`server/.env`:
```env
DATABASE_URL=postgresql://user:password@host:port/dbname
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

`client/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Set up the database

```bash
# Using Docker (recommended)
docker-compose up db

# Or run the SQL files manually against your existing PostgreSQL instance
psql $DATABASE_URL -f SQL/setup/create-tables.sql
psql $DATABASE_URL -f SQL/setup/populate-tables.sql
```

### 4. Run

```bash
# Terminal 1 — backend
cd server && pnpm dev

# Terminal 2 — frontend
cd client && pnpm dev
```

- API: `http://localhost:3000`
- App: `http://localhost:5173`

---

## Docker (full stack)

```bash
docker-compose up --build
```

- App: `http://localhost:80`
- API: `http://localhost:3000`

---

## API Endpoints

Base URL: `/api`

### Maintainer

| Method | Path | Description |
|---|---|---|
| GET | `/maintainer` | List all maintainers |
| GET | `/maintainer/:id` | Get a maintainer |
| POST | `/maintainer` | Create a maintainer |
| PUT | `/maintainer/:id` | Update a maintainer |
| DELETE | `/maintainer/:id` | Delete a maintainer |

All responses follow this shape:

```json
{
  "data": { },
  "message": "..."
}
```

Errors:

```json
{
  "error": "Not Found",
  "message": "Maintainer not found",
  "statusCode": 404
}
```

---

## Verify DB connection

```bash
cd server && pnpm db:test
```

---

## Commit Convention

Commits must follow [Conventional Commits](https://www.conventionalcommits.org/). The pre-commit hook enforces this automatically.

```
feat: add prisoner intake endpoint
fix: correct blood type validation
docs: update README
refactor: extract shared query builder
chore: upgrade dependencies
```

Allowed types: `feat` `fix` `docs` `style` `refactor` `test` `chore` `perf` `ci` `revert`

The pre-commit hook also runs:
1. **Biome** — lint and format check on staged files
2. **TypeScript** — type check on both server and client