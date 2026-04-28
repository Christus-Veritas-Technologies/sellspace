---
name: sellspace-copilot-engineering-skill
description: >
  Enforces strict code quality, architecture, and consistency across the Sellspace
  Turborepo. Apply this skill when generating, modifying, or reviewing any code.
  This is a HARD constraint system — do not deviate unless explicitly instructed.
applies_to:
  - apps/**
  - packages/**
---

# Sellspace Engineering Discipline

This document defines **non-negotiable engineering rules** for the Sellspace codebase.

Copilot must treat these as **hard constraints**, not suggestions.

---

# 1. Monorepo Architecture (Turborepo)

## 1.1 Folder Structure (STRICT)


apps/
web/ # Next.js (frontend)
mobile/ # Expo React Native
server/ # Hono API

packages/
ui/ # Shared UI components (web + mobile)
db/ # Prisma client + schema
types/ # Shared TypeScript types


## 1.2 Rules

- ❌ NEVER import directly between apps
- ❌ NEVER duplicate shared logic across apps
- ✅ ALWAYS place shared logic inside `packages/*`
- ✅ ALWAYS use absolute imports where configured

---

# 2. Separation of Concerns

## 2.1 Layer Responsibilities

| Layer | Responsibility |
|------|----------------|
| UI (`packages/ui`) | Pure presentation only |
| App (`apps/*`) | Feature logic, state, orchestration |
| Server (`apps/server`) | API, business logic, persistence |
| DB (`packages/db`) | Data models, Prisma |

## 2.2 Rules

- ❌ UI components must NOT contain business logic
- ❌ Server must NOT depend on UI
- ❌ Apps must NOT bypass server for data logic
- ✅ Keep boundaries clean and enforced

---

# 3. Component Architecture

## 3.1 Placement Rules

- Shared components → `packages/ui`
- Screen/page components → `apps/*`
- Feature-specific components → inside feature folder

## 3.2 Component Design Rules

- Keep components **small and focused**
- One responsibility per component
- Extract reusable parts early

## 3.3 Anti-Patterns

- ❌ Components > 300 lines
- ❌ Deeply nested JSX trees
- ❌ Inline styles outside design system
- ❌ Duplicated UI patterns

---

# 4. API Design (Hono)

## 4.1 Route Structure


routes/
auth.ts
listings.ts
offers.ts
messages.ts
users.ts


## 4.2 Rules

- One domain per route file
- Use RESTful conventions
- Keep handlers thin

## 4.3 Validation (MANDATORY)

- ✅ Use Zod for ALL inputs
- ❌ Never trust request data
- ❌ No unvalidated `c.req.json()`

---

# 5. Database Discipline (Prisma + SQLite)

## 5.1 Rules

- ✅ Use Prisma for ALL DB access
- ❌ Avoid raw SQL unless unavoidable
- ✅ Use relations properly (foreign keys)

## 5.2 Indexing

Always index:
- Foreign keys
- Frequently queried fields
- Filtering fields (e.g., `category`, `createdAt`)

## 5.3 Data Integrity

- ❌ No nullable fields unless necessary
- ❌ No ambiguous enums
- ✅ Use strict typing

---

# 6. State Management

## 6.1 Web (Next.js)

- Prefer **server components**
- Use **React Query** for client-side fetching

## 6.2 Mobile (Expo)

- Use **React Query**

## 6.3 Rules

- ❌ Avoid global state unless required
- ❌ Do NOT introduce Redux/Zustand prematurely
- ✅ Keep state local and predictable

---

# 7. Error Handling

## 7.1 API Response Format

Always return structured errors:

```ts
{ error: string }
7.2 Rules
❌ Never expose stack traces
❌ Never throw raw errors to client
✅ Use correct HTTP status codes
8. Code Quality Standards
8.1 Function Design
Small, single-purpose functions
Clear inputs and outputs
No side-effect confusion
8.2 Naming
Type	Convention
Files	kebab-case
Components	PascalCase
Variables	camelCase
8.3 Readability
❌ No magic numbers
❌ No unclear abbreviations
✅ Prefer explicit over clever
9. Reusability Rules

Before writing new code, Copilot MUST check:

Does this exist in packages/ui?
Can this be shared?
Is this duplicated elsewhere?

If YES → reuse or refactor.

10. Performance Guidelines
✅ Paginate all list endpoints
✅ Lazy load images
✅ Avoid unnecessary re-renders

Avoid:

❌ Over-fetching data
❌ Large payload responses
❌ Premature optimization
11. Security Rules
11.1 Authentication
OTP must be hashed (bcrypt)
Tokens must be short-lived
11.2 Input Safety
✅ Validate ALL inputs (Zod)
❌ Never trust client input
11.3 Sensitive Data
❌ Do not expose internal IDs unnecessarily
❌ Do not log sensitive values
12. Design System Enforcement
12.1 Mandatory Usage
Must use sellspace-design-system
Must use tokens for:
Colors
Spacing
Typography
12.2 UI Rules
❌ No custom styles outside tokens
❌ No new color values
❌ No alternative icon libraries
13. Dependency Management
13.1 Rules
❌ Do NOT add new libraries without necessity
❌ Avoid overlapping libraries
✅ Prefer existing stack
13.2 Evaluation Criteria

Only add a dependency if:

It significantly reduces complexity
It aligns with architecture
It does not duplicate existing tools
14. Anti-Patterns (STRICTLY FORBIDDEN)
❌ Mixing UI + business logic
❌ Cross-app imports
❌ Large monolithic files
❌ Unvalidated inputs
❌ Ignoring design system
❌ Over-engineering simple features
15. Definition of Done

A feature is ONLY complete if:

Uses design system correctly
Follows monorepo structure
Has validation (Zod)
Handles errors properly
Avoids duplication
Is readable and maintainable
16. Copilot Execution Behavior

When generating code, Copilot MUST:

Follow this document strictly
Prefer clarity over cleverness
Reuse before creating new code
Keep implementations simple
Respect architectural boundaries