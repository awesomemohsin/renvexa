# Antigravity Project Instructions & Engineering Rules

## Developer Identity & Credentials
- **GitHub Username**: `awesomemohsin`
- **GitHub Email**: `mohsindude5@gmail.com`

## Execution Guidelines
- **Autonomous Command Execution**: You are permitted to execute commands directly without requesting explicit permission.
- **High Precision**: Perform all tasks with precision, accuracy, and zero avoidable mistakes.
- **Direct Code Fixes**: Do not rely on external scratchpads; resolve issues directly in code.
- **Aesthetic & Quality Standard**: Always ensure designs, code structure, and architecture are clean, modern, beautiful, and powerful.
- **Review Strategy**: Request review only for large/complex design tasks; execute smaller tasks immediately without unnecessary friction.
- **Temporary Files & Scripts**: Store temporary scripts or one-off verification files exclusively in `/scratch` or `/scripts`. Never push them to git; always keep them in `.gitignore`. Clear one-time scripts after the task completes.
- **Restricted Git & Build Actions**: Do not trigger `npm run build`, `git add`, `git commit`, or `git push origin main` unless explicitly instructed by command.

## Git Commit & Push Strategy
Whenever instructed to commit, push, or finalize changes:
- **Short Commit Messages**: Keep commit messages short, concise, and simple (e.g., a single brief sentence).
- **No Description**: Do not add any description or body to the commit messages; use only the short subject line.

## Core SaaS Architecture & Engineering Rules
1. **Multi-Tenant Relational PostgreSQL**: Maintain strict multi-organization and multi-property tenant isolation. Never default to single-property logic.
2. **Reusable Component Architecture**: Use centralized UI primitives (`DataTable<T>`, `StatCard`, `StatusBadge`, `EmptyState`) instead of bespoke tables or cards.
3. **Strict DRY Principle**: Centralize all financial calculations in `services/financial/calculator.ts` using decimal-safe scaled-integer arithmetic (poisha/cents). Centralize validation in `lib/validations/schemas.ts`.
4. **Lightweight Frontend Bundles**: Maintain clean server/client boundaries. Never bundle Node.js server drivers into client components.
5. **Strict TypeScript & Zod Validation**: Validate all API inputs and mutation payloads with Zod schemas.
