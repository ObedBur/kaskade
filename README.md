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
