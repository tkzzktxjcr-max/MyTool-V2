# AI Rules for This Project

This is a **React 19 + Vite 6 + TypeScript** app using **Tailwind CSS** and **shadcn/ui** for the UI,
with **React Router DOM** for routing and **TanStack Query** for data fetching.

These rules apply to every AI edit and generation.

## 1. Tech stack

- Use **React 19 with TypeScript** for all components.
- Use **Vite** conventions (no Next.js / server components / `getServerSideProps`).
- Use **React Router DOM** for routing (no Next.js router, no custom router libs).
- Use **Tailwind CSS** utilities and existing design tokens.
- Use **shadcn/ui** + **Radix UI** primitives for components (dialogs, sheets, menus, etc.).
- Use **Lucide React** for icons (do not add other icon libraries).
- Use **TanStack Query** for async data fetching/caching where it is already used.
- Keep using existing helpers for forms (**React Hook Form + Zod**), dates (**date-fns**, `react-day-picker`), and notifications (Sonner/Vaul).

Do **not** introduce new UI kits, CSS frameworks, or routing libraries.

## 2. Goal: keep the codebase small and focused

- Prefer **editing existing files** over creating new ones.
- Before creating a new component or hook, **check for an existing one** with similar responsibilities.
- Avoid duplicate components (for example, two slightly different `Button` or `Modal` components).
- Keep components reasonably small and focused:
  - Aim for components under ~150 lines when practical.
  - Extract clearly reusable UI into shared components (for example, `components/ui/...` or `components/common/...` as used in this repo).
- Avoid speculative abstractions; only extract into a new hook or utility after 2–3 real usage sites exist.

## 3. File and directory structure

- Respect the existing folder layout (for example: `src/components`, `src/routes` or `src/pages`, `src/hooks`, `src/lib`, etc.).
- When adding files:
  - Place them alongside similar files in the same feature or directory.
  - Use naming and patterns consistent with existing code (for example, `SomethingForm.tsx`, `useSomething.ts`, `something-service.ts`).
- Do not create new top-level directories without an explicit instruction.

## 4. Styling and UI consistency

- Use **Tailwind CSS** classes consistently; do not introduce plain CSS files or CSS modules unless they already exist.
- For higher-level UI elements (buttons, inputs, dialogs, sheets, dropdowns, etc.), prefer **shadcn/ui** components and patterns already present.
- Use **`clsx`**, `tailwind-merge`, and `class-variance-authority` the same way they are used in this repo; do not introduce new style helpers.
- Keep dark mode behavior consistent with the existing **next-themes** integration (theme toggle, `className` usage, etc.).

## 5. Cleaning and refactoring

When asked to “clean up”, “simplify”, or “reduce” code:

1. **Safety**
   - Preserve existing behavior and public APIs.
   - Do not remove code unless it is clearly unused (no imports, no references).
   - If you are not sure a piece of code is dead, leave it and optionally comment it as “suspected dead code”.

2. **Consolidation**
   - Merge duplicate utilities and hooks into a single implementation.
   - Remove components that are never used.
   - Prefer a single shared component over multiple nearly identical components.

3. **Simplicity**
   - Prefer straightforward React components and hooks over over‑abstracted patterns.
   - Keep hook dependencies clear and avoid unnecessary indirection.

4. **Incremental work**
   - For large refactors, first propose a short plan grouped by folder/feature.
   - Then apply changes in small, coherent steps (for example, one feature directory at a time).

## 6. Protected areas

Do **not** modify the following without explicit instruction:

- Environment / configuration files (`vite.config.ts`, `tailwind.config.ts`, `tsconfig*.json`, `vercel.json`, `Dockerfile`, `nginx.conf`).
- Authentication and critical infrastructure code (for example, centralized auth/service clients).
- Global design tokens or base styles in a way that breaks existing screens.

If a change is necessary in these areas, explain it clearly in comments and keep it minimal.

## 7. Data fetching, forms, and state

- Use **TanStack Query** for server state where already present; do not mix in other data-fetching libraries.
- Use **React Hook Form + Zod** for forms and validation (where the project already does so).
- Keep local UI state with React hooks; do not introduce new global state libraries.

## 8. Tests and quality

- When updating logic, update or extend existing tests in the same style and framework.
- Do not introduce a new test framework.
- Remove only clearly obsolete or fully broken tests that no longer correspond to any code.

## 9. Logging and debugging

- Follow existing patterns for logging or error reporting.
- Avoid adding noisy `console.log` calls; if they are required for debugging, mark them clearly as temporary.

## 10. Conflict resolution

If user instructions in chat conflict with this file:

- Prefer the user’s explicit instructions for that specific request.
- Otherwise, default to:
  - Keeping the codebase small,
  - Reusing existing components and utilities,
  - Avoiding new dependencies,
  - Preserving behavior,
  - Matching existing patterns in the repository.