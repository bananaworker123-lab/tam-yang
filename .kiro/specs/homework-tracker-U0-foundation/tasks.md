# Implementation Plan: U0 Foundation

## Overview
Infrastructure unit — วางโครง monorepo + shared packages + cross-cutting ก่อน domain units

**Derived From**: `design.md` (U0), `../homework-tracker/foundation.md`
**Strategy**: Foundation-first (scaffold → shared packages → DB/auth/cross-cutting)
**Estimates**: ชั่วโมง (โดยประมาณ)

---

## Tasks

- [ ] 1. Monorepo scaffold
  - [x] 1.1 ตั้ง monorepo (pnpm workspaces + Turborepo)
    - **Deps**: None | **Ref**: design — Implementation | **Est**: 3h
    - `pnpm-workspace.yaml`, `turbo.json`, root `package.json`, โครง `apps/`, `packages/`
    - `packages/shared-config`: tsconfig base, eslint, prettier, tailwind preset
  - [x] 1.2 scaffold apps/api (NestJS) + apps/web (React+Vite+Tailwind)
    - **Deps**: 1.1 | **Ref**: design — Architecture | **Est**: 4h
    - NestJS app (main.ts, app.module.ts), health controller `/healthz`
    - Vite React app (main.tsx, App.tsx), Tailwind + design tokens (accent #5B53E0, status colors, fonts)
  - [x] 1.3 docker-compose (postgres) + Dockerfile + env config
    - **Deps**: 1.1 | **Ref**: design — Dev Setup, NFR | **Est**: 3h
    - `docker-compose.yml` (postgres), `.env.example` (DB_URL, GOOGLE_CLIENT_ID/SECRET, SESSION_SECRET), Dockerfile (build api + serve web)

- [ ] 2. Database baseline (Prisma)
  - [ ] 2.1 Prisma setup + multi-schema + baseline migration
    - **Deps**: 1.2, 1.3 | **Ref**: design — Data Model | **Est**: 4h
    - `prisma/schema.prisma`: datasource (postgres, multiSchema), schemas identity/family/assignment/progress/requests_audit
    - convention: id UUID, created_at/updated_at, family_id, school_id (nullable); session table (connect-pg-simple)
    - `pnpm prisma migrate dev` baseline

- [ ] 3. shared-types package
  - [x] 3.1 enums + core DTOs + event schema
    - **Deps**: 1.1 | **Ref**: design — shared-types | **Est**: 3h
    - `Role`, `ProgressStatus`, `RequestStatus`, `InviteStatus`, `DueState`, `AuthContext`, `DomainEvent<T>`

- [ ] 4. shared-errors + global filter (test-first PBT)
  - [x] 4.1 error envelope + codes + exception filter + PBT
    - **Deps**: 1.2, 3.1 | **Ref**: design — Correctness (error-envelope-shape) | **Est**: 4h
    - เทสต์ก่อน (fast-check): ทุก `AppError` → envelope มี code/message/status/requestId
    - `AppError`, shared codes, `AllExceptionsFilter`

- [ ] 5. shared-auth (Google OAuth + session + RBAC/isolation)
  - [x] 5.1 Google OAuth + session
    - **Deps**: 2.1, 3.1 | **Ref**: design — Auth, API | **Est**: 6h
    - Passport google-oauth20, express-session + connect-pg-simple
    - endpoints `/api/v1/auth/google`, `/callback`, `/logout`, `/api/v1/me`
  - [x] 5.2 RBAC guard + scope/isolation guard (test-first PBT)
    - **Deps**: 5.1 | **Ref**: design — Correctness (isolation-predicate) | **Est**: 5h
    - เทสต์ก่อน (fast-check): isolation predicate — เข้าถึงได้เฉพาะเมื่อ family/class scope ตรง (random role/family → ไม่ leak)
    - `@Roles()` + `RolesGuard`, `ScopeGuard`, invite-email match helper

- [ ] 6. shared-logging + event bus
  - [x] 6.1 structured logging + request id middleware
    - **Deps**: 1.2 | **Ref**: design — Logging | **Est**: 2h
  - [x] 6.2 in-process event bus utility
    - **Deps**: 1.2, 3.1 | **Ref**: design — event-bus | **Est**: 3h
    - `EventBus.publish`, `@OnEvent`, idempotent handler pattern + test

- [ ] 7. shared-ui base
  - [ ] 7.1 design tokens + base components
    - **Deps**: 1.2 | **Ref**: design — shared-ui | **Est**: 4h
    - tokens (สีสถานะ เทา/เหลืองอ่อน/เหลืองเข้ม/เขียว/แดง), `StatusPill`, `Card`, `Button`, `Avatar`, `StatusBanner`, `EmptyState`

- [ ] 8. CI baseline
  - [x] 8.1 CI pipeline (lint → test → build)
    - **Deps**: 1.1 | **Ref**: design — NFR | **Est**: 2h
    - GitHub Actions: install (pnpm) → lint → test → build (turbo)

---

## Task Dependency Graph

```
1.1 ──┬─► 1.2 ──┬─► 2.1 ──► 5.1 ──► 5.2
      │         ├─► 4.1
      │         ├─► 6.1
      │         ├─► 6.2
      │         └─► 7.1
      ├─► 1.3 ──► 2.1
      └─► 3.1 ──┬─► 4.1
                ├─► 5.1
                └─► 6.2
8.1 (after 1.1)
```

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1.1"] },
    { "wave": 2, "tasks": ["1.2", "1.3", "3.1", "8.1"] },
    { "wave": 3, "tasks": ["2.1", "4.1", "6.1", "6.2", "7.1"] },
    { "wave": 4, "tasks": ["5.1"] },
    { "wave": 5, "tasks": ["5.2"] }
  ]
}
```

---

## Execution Waves

| Wave | Phases | Dependencies Resolved |
|------|--------|-----------------------|
| 1 | 1. Monorepo scaffold (1.1) | None |
| 2 | 1.2/1.3 scaffold apps, 3. shared-types, 8. CI | Wave 1 |
| 3 | 2. DB baseline, 4. shared-errors, 6. logging/events, 7. shared-ui | Wave 2 |
| 4 | 5.1 auth+session | Wave 3 |
| 5 | 5.2 RBAC/isolation guards | Wave 4 |

> Solo + foundation: รันแบบ sequential ตาม wave; ไม่มี file ownership overlap (แต่ละ package คนละโฟลเดอร์)

---

## Coverage

- shared-types(3.1), shared-errors(4.1), shared-auth(5.1,5.2), shared-logging(6.1), event-bus(6.2), shared-ui(7.1)
- DB baseline + scope columns(2.1), scaffold(1.x), CI(8.1)
- PBT: error-envelope-shape(4.1), isolation-predicate(5.2)
