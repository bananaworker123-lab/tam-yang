# Design: U0 Foundation

> Infrastructure unit (0 stories). กำหนด stack + scaffold + shared packages + cross-cutting ที่ทุก domain unit ใช้ อ้างอิง `../homework-tracker/foundation.md`

## Summary
- **Architecture**: Modular Monolith (NestJS modules) + React SPA, Monorepo — แยกความรับผิดชอบตาม bounded context, deploy เป็นก้อนเดียว
- **Stack**: React+Vite+Tailwind / NestJS(TypeScript) / PostgreSQL+Prisma
- **Components (shared)**: 6 — shared-types, shared-ui, shared-auth, shared-errors, shared-logging, shared-config + DB/event-bus baseline
- **Entities (baseline)**: 2 — Session, (schema scaffolding + scope columns)
- **Endpoints**: baseline `/api/v1/me`, `/api/v1/auth/google`, `/api/v1/auth/google/callback`, `/api/v1/auth/logout`, `/healthz`

## Architecture

**Pattern**: Modular Monolith + SPA (จาก D3/DF)

```
                 ┌─────────────────────────────┐
   Browser ────► │ apps/web (React+Vite+TW)    │
                 └──────────────┬──────────────┘
                                │ REST /api/v1 (session cookie)
                 ┌──────────────▼──────────────┐
                 │ apps/api (NestJS monolith)   │
                 │  modules: identity, family,  │
                 │  assignment, progress,       │
                 │  requests-audit, oversight   │
                 │  ├ shared-auth (guard/RBAC)  │
                 │  ├ shared-errors (filter)    │
                 │  ├ event-bus (in-process)    │
                 │  └ Prisma ──► PostgreSQL      │
                 └──────────────────────────────┘
                                │
                        Google OAuth (OIDC)
```

---

## Components

### packages/shared-types
- **Purpose**: single source of truth ของ DTOs/enums/event schemas
- **Technology**: TypeScript
- **Exposes**: `Role`, `ProgressStatus`, `RequestStatus`, `InviteStatus`, `DueState`, `AuthContext`, `DomainEvent<T>`, DTO interfaces
- **Consumes**: —

### packages/shared-auth
- **Purpose**: Google OAuth + session + RBAC/data-isolation guard
- **Technology**: NestJS, Passport (google-oauth20), express-session + connect-pg-simple
- **Responsibilities**: เริ่ม/รับ callback OAuth, สร้าง session, `@Roles()` decorator + `RolesGuard`, scope guard (family/class), invite-email match
- **Exposes**: `requireAuth(roles, scope)`, `AuthContext`, `RolesGuard`, `ScopeGuard`
- **Consumes**: shared-types, Prisma (User/Session)

### packages/shared-errors
- **Purpose**: error envelope + global exception filter
- **Exposes**: `AppError(code, status, message, details?)`, `AllExceptionsFilter`, shared codes (`VALIDATION_001`, `AUTH_001/002`, `NOT_FOUND`, `INTERNAL`)
- **Consumes**: shared-types

### packages/shared-ui
- **Purpose**: design tokens + base components ตาม prototype
- **Technology**: React + Tailwind preset
- **Exposes**: tokens (accent `#5B53E0`, status colors เทา/เหลืองอ่อน/เหลืองเข้ม/เขียว/แดง, fonts Plus Jakarta Sans + Bricolage), components `StatusPill`, `Card`, `Button`, `Avatar`, `StatusBanner`, `EmptyState`
- **Consumes**: shared-types

### packages/shared-logging
- **Purpose**: structured JSON logging + request id
- **Exposes**: `logger`, `RequestIdMiddleware` (X-Request-Id)

### packages/shared-config
- **Purpose**: tsconfig/eslint/prettier/tailwind preset ร่วม + build config

### event-bus (in `apps/api/src/common`)
- **Purpose**: in-process domain event dispatcher (pub/sub)
- **Exposes**: `EventBus.publish(event)`, `@OnEvent(type)` handlers; idempotent handler pattern

---

## Data Model

### Session (schema `identity`)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| sid | varchar | PK | session id (connect-pg-simple) |
| sess | jsonb | not null | session payload (userId) |
| expire | timestamptz | not null, index | expiry |

### Schema scaffolding (baseline convention)
- schemas: `identity`, `family`, `assignment`, `progress`, `requests_audit`
- ทุกตารางข้อมูลผู้ใช้ในโดเมน: `id UUID PK`, `created_at`/`updated_at timestamptz`, `family_id UUID` (เมื่อ scope ครอบครัว), `school_id UUID NULL` (เผื่อ multi-school)
- audit table: append-only (ไม่มี update/delete)

**Relationships**: กำหนดจริงในแต่ละ unit
**Indexes**: `session.expire`; index `family_id`, `school_id` บนตารางที่ scope

---

## API Specification

**API Conventions**: prefix `/api/v1`; JSON; auth ผ่าน session cookie (httpOnly, secure, sameSite=lax); error envelope `{ error: { code, message, status, details?, requestId } }`; ไม่มี pagination ในงาน list ขนาดเล็ก (เพิ่มภายหลังถ้าจำเป็น)

### GET /api/v1/auth/google
- **Description**: เริ่ม Google OAuth flow
- **Auth**: Public
- **Response**: redirect ไป Google

### GET /api/v1/auth/google/callback
- **Description**: รับ callback, สร้าง/เชื่อม user + session
- **Auth**: Public
- **Response 302**: redirect ไป app (onboarding หรือ home ตาม state)
- **Errors**: 401 OAuth ล้มเหลว

### POST /api/v1/auth/logout
- **Description**: จบ session
- **Auth**: required
- **Response 204**

### GET /api/v1/me
- **Description**: คืน AuthContext ปัจจุบัน
- **Auth**: required
- **Response 200**: `{ userId, roles, familyId?, classScopes? }`
- **Errors**: 401

### GET /healthz
- **Description**: health check (DB ping)
- **Auth**: Public
- **Response 200**: `{ status: "ok" }`

---

## Integration Points

| External System | Protocol | Purpose | Error Handling |
|----------------|----------|---------|----------------|
| Google OAuth (OIDC) | HTTPS/OAuth2 | login + identity | callback error → 401 + redirect login |
| PostgreSQL | TCP (Prisma) | persistence + session store | connection retry; `/healthz` ping |

---

## Implementation

### Directory Structure
```
homework-tracker/
├── apps/
│   ├── web/                 # React + Vite + Tailwind
│   │   └── src/{components,hooks,lib,context,routes,i18n}
│   └── api/                 # NestJS
│       └── src/
│           ├── main.ts
│           ├── app.module.ts
│           ├── common/      # event-bus, request-id, filters
│           └── modules/{identity,family,assignment,progress,requests-audit,oversight}
├── packages/{shared-types,shared-ui,shared-auth,shared-errors,shared-logging,shared-config}
├── prisma/                  # schema.prisma (multi-schema) + migrations
├── docker-compose.yml       # postgres (local)
├── Dockerfile
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### Dev Setup
```bash
pnpm install
docker compose up -d            # postgres
pnpm prisma migrate dev         # baseline schemas + session table
pnpm --filter api dev           # NestJS
pnpm --filter web dev           # Vite
```

### Conventions
- **Files**: kebab-case; class/type PascalCase; var/fn camelCase
- **Code**: NestJS modules (controller → service → repository via Prisma); guards สำหรับ RBAC/scope; in-process events สำหรับ audit/projection
- **Tests**: Jest + Supertest (api), Vitest + RTL (web), fast-check สำหรับ pure logic; `pnpm test`

---

## Non-Functional Requirements

- **Security**: ทุก endpoint ผ่าน guard; scope guard กัน cross-family; session cookie httpOnly/secure/sameSite; OAuth secrets เป็น env ไม่ commit
- **Performance**: index บน scope columns; query scope ที่ระดับ DB เสมอ
- **Scalability**: schema/scope columns เผื่อ multi-school; modular monolith แยก service ได้ภายหลัง

## Correctness Properties

| Property | Description | Validates |
|----------|-------------|-----------|
| isolation-predicate | ฟังก์ชันตรวจ scope: ผู้ใช้เข้าถึง resource ได้เฉพาะเมื่อ family/class ตรง (random ครอบครัว/role → ไม่มี leak) | US-010 (foundation guard) |
| error-envelope-shape | ทุก AppError แปลงเป็น envelope ที่มี code/status/requestId ครบ | cross-cutting |

---

## Traceability

| Requirement | Component | API | Data |
|-------------|-----------|-----|------|
| (foundation/cross-cutting) | shared-auth, shared-errors, event-bus | /api/v1/me, /auth/* | Session, schema baseline |

## External References

| Source | Type | Used in |
|--------|------|---------|
| `../homework-tracker/foundation.md` | Foundation conventions | ทุก section |
| `Initial-requirement/app_design/Homeroom - Homework Tracker.dc.html` | Design tokens | shared-ui |
