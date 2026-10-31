# Renvexa Permanent Engineering Standards
## Reusable Components | Clean Architecture | DRY Code | High Performance | Minimal Bundle Size

This document defines the permanent architectural and implementation standards for all present and future code in the Renvexa multi-tenant SaaS platform.

---

### Rule 1: Reusable Component Architecture
- **Zero Component Duplication**: Never create `TenantTable`, `RoomTable`, `PropertyTable`, and `PaymentTable` as separate monolithic implementations.
- Always use the centralized, configurable [`DataTable<T>`](../components/shared/data-table.tsx) supporting generic sorting, filtering, pagination, search, row actions, empty states, and loading skeletons.
- Always use standardized UI primitives:
  - [`StatusBadge`](../components/shared/status-badge.tsx) for unit, lease, bill, and staff role statuses.
  - [`StatCard`](../components/shared/stat-card.tsx) for metrics and KPI displays.
  - [`EmptyState`](../components/shared/empty-state.tsx) for zero-data placeholders.

### Rule 2: Strict DRY Principle (Don't Repeat Yourself)
- Never duplicate financial calculations, phone number parsing, or date/currency formatting across pages.
- Use centralized formatters in [`lib/utils/formatters.ts`](../lib/utils/formatters.ts).
- Centralize all financial calculations in [`services/financial/calculator.ts`](../services/financial/calculator.ts).

### Rule 3: Centralized Design System
- Standardize all visual tokens using Tailwind CSS and CSS variables.
- Palette tokens:
  - Deep Forest Teal: `#123332`
  - Mid Teal: `#295654`
  - Mint Accent: `#a9e7d6`
  - Neutral Background: `#f5f7f6`
- Never hardcode arbitrary slightly different colors or spacing.

### Rule 4: Modular, Feature-Oriented Architecture
- Organize code by features and shared domains:
  - `components/shared/`: Cross-cutting UI primitives (tables, badges, dialogs, cards).
  - `services/financial/`: Pure financial calculation engines.
  - `lib/validations/`: Shared Zod validation schemas.
  - `lib/db/`: Drizzle ORM schemas and client pooling.
  - `lib/storage/`: Provider-agnostic storage abstraction layer.
  - `lib/jobs/`: Serverless durable background job outbox.
  - `lib/integrations/`: Decoupled Google Drive & Google Sheets adapters.

### Rule 5: Strict Business Logic Separation
- React Components **only** render UI and bind user events.
- Never calculate rent proration, tiered electricity rates, or payment allocation inline inside JSX. Always delegate to `services/financial/calculator.ts`.
- Ensures 100% logic reusability between web routes and future Expo React Native mobile apps.

### Rule 6: Database Query Optimization
- Use Drizzle ORM efficiently:
  - Explicit column selections; avoid unbounded `SELECT *`.
  - Zero N+1 queries. Use relational joins and batch resolvers.
  - Server-side pagination (`limit`, `offset`) and indexing on `(organization_id, property_id)`.
  - Transaction-safe writes for payments and double-entry ledger postings.

### Rule 7: Performance-First Frontend
- Default to React Server Components (RSC).
- Use Client Components (`'use client'`) **only** when DOM interaction or local state requires it.
- Keep client JS bundles lightweight. Never import Node.js server packages (`postgres`, `fs`, `crypto`) into client component files.
- Avoid unnecessary `useEffect` and `useState`.

### Rule 8: Lightweight Dependency Policy
- Keep `package.json` lean.
- Use Lucide React exclusively for icons; avoid installing multiple icon packs.
- Never add multiple date or HTTP client libraries.
- Prefer native browser/Node APIs when appropriate.

### Rule 9: Reusable Forms & Shared Validation
- Define all validation schemas once in [`lib/validations/schemas.ts`](../lib/validations/schemas.ts) using Zod.
- Share identical schemas across client-side forms and API route handlers (`safeParse`).

### Rule 10: Centralized Decimal-Safe Financial Services
- Never use JavaScript floating-point arithmetic (`0.1 + 0.2`) for money.
- Use scaled integer arithmetic (cents/poisha) in [`FinancialCalculatorService`](../services/financial/calculator.ts).
- PostgreSQL numeric columns: `NUMERIC(14, 2)`.

### Rule 11: Standardized API & Response Structure
- All route handlers return standardized JSON via [`lib/api/response.ts`](../lib/api/response.ts):
  - Success: `{ success: true, data: ..., meta: { timestamp, organizationId, pagination } }`
  - Error: `{ success: false, error: { code, message, details } }`
- Built-in pagination parameter parser: `parsePaginationParams(request)`.

### Rule 12: Strict TypeScript Quality
- Zero `any`.
- Infer types from Zod schemas (`z.infer<typeof ...>`) and Drizzle models.
- Explicit return types for financial services and storage abstractions.

### Rule 13: Defense-in-Depth Security
- Server-side validation on every mutating endpoint. UI visibility is never a security boundary.
- Double-scoped tenant query checks (`WHERE organization_id = :org_id AND property_id = :prop_id`).
- PostgreSQL Row-Level Security (RLS) policies as an additional engine-level security guard.

### Rule 14: Code Cleanliness & Zero Dead Code
- No unused variables, dead code, or redundant wrappers.
- Remove deprecated mock functions when replaced by centralized services.

### Rule 15: Post-Implementation Verification Rule
- Every feature must pass automated unit and integration tests before deployment:
  - `npm run build` (0 warnings/errors)
  - `npx tsx scripts/test-financial-calculator.ts`
  - `npx tsx scripts/test-validation-schemas.ts`
  - `npx tsx scripts/verify-infrastructure.ts`
  - `npx tsx scripts/verify-saas.ts`

### Rule 16: Git Commit & Push Strategy
- **Short Commit Messages**: Keep commit messages short, concise, and simple (e.g., a single brief sentence).
- **No Description**: Do not add any description or body to commit messages; use only the short subject line.
- Execute git commits, builds, and pushes only when explicitly commanded.

### Rule 17: Temporary Scripts & Clean Workspace Policy
- Store temporary test scripts or one-off verification tools strictly in `/scratch` or `/scripts`.
- Never git push temporary scripts; always ensure they are excluded via `.gitignore`.
- Clean up one-off task scripts once their verification task is complete.


