# Kaskade Monorepo

Welcome to the Kaskade monorepo. This project uses **Turborepo** and **pnpm workspaces** for better scalability and developer experience.

## 📁 Project Structure

- `apps/backend`: NestJS API (`@kaskade/backend`)
- `apps/frontend`: Next.js Web App (`@kaskade/frontend`)
- `packages/`: Shared libraries (optional, ready for expansion)

## 🚀 Getting Started

1. **Install dependencies** (run from the root):
   ```bash
   pnpm install
   ```

2. **Run in development mode**:
   ```bash
   pnpm dev
   ```
   This will start both the backend and frontend simultaneously with caching.

3. **Build all apps**:
   ```bash
   pnpm build
   ```

4. **Lint all apps**:
   ```bash
   pnpm lint
   ```

## 🛠 Features

- **Turbo Power**: Fast, incremental builds and task orchestration.
- **pnpm Workspaces**: Shared dependency management and workspace linking.
- **Single Source of Truth**: All configuration and code in one place.

## 📦 Adding Shared Packages
To add a new shared package (e.g., `packages/types`), simply create the folder and add it to `pnpm-workspace.yaml`.
You can then link it to your apps using `pnpm add @kaskade/types --workspace`.

# Monorepo

## Structure

```
kaskade/
├── backend/          # NestJS API
├── frontend/         # Next.js Web App
├── pnpm-workspace.yaml
└── package.json
```

## Quick Start

### Install dependencies
```bash
pnpm install
```

### Development

Run all services in parallel:
```bash
pnpm dev
```

Or run individually:
```bash
pnpm backend:dev    # Start NestJS server
pnpm frontend:dev   # Start Next.js dev server
```

### Build

Build all packages:
```bash
pnpm build
```

Or specific packages:
```bash
pnpm backend:build    # Build NestJS
pnpm frontend:build   # Build Next.js
```

### Testing

```bash
pnpm test           # Run all tests
pnpm test:e2e       # Run e2e tests
```

### Linting & Formatting

```bash
pnpm lint           # Lint all packages
pnpm format         # Format all packages
```

## Scripts Documentation

| Script | Description |
|--------|-------------|
| `pnpm dev` | Run all services in development mode |
| `pnpm build` | Build all packages |
| `pnpm start` | Start all services |
| `pnpm test` | Run tests across workspace |
| `pnpm lint` | Lint all packages |
| `pnpm format` | Format code in all packages |
| `pnpm backend:dev` | Start only backend development server |
| `pnpm frontend:dev` | Start only frontend development server |

## Key Directories

- **backend/src** - NestJS application source code
- **frontend/src** - Next.js application source code
- **backend/prisma** - Database schema and migrations
- **frontend/prisma** - Frontend Prisma schema (if needed)

## Technologies

- **Backend**: NestJS, Prisma, PostgreSQL
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Package Manager**: pnpm
