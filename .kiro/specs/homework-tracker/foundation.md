# Foundation Specification

## Summary
<!-- Compact digest for downstream agents. Read ONLY this section. -->
- **Team**: Solo
- **Repo**: Monorepo (frontend + backend + shared packages)
- **Architecture**: Modular Monolith (backend module ต่อ bounded context + web frontend)
- **Gateway**: N/A (modular monolith — เรียก service ภายในตรง)
- **Auth**: OAuth2/OIDC (Google) + server-side session cookie; RBAC 4 roles
- **Error Format**: Custom envelope `{ error: { code, message, details } }`
- **Inter-Unit Comms**: In-process service calls + in-process domain events (audit/projection)
- **Database**: Shared DB แยก schema ตาม module + scope columns (family_id, school_id เผื่อ multi-school)
- **Shared Types**: Shared package ใน monorepo (TypeScript)
- **Frontend**: In monorepo — Shared UI: Yes
- **Infrastructure Units**: Foundation (U0)

> หมายเหตุ: ภาษา/รันไทม์ฝั่ง shared = TypeScript (จาก DF-8). เฟรมเวิร์ก frontend/backend ที่เจาะจง (เช่น React/Next, Node/Express/NestJS) เป็นการตัดสินใน D3 (design phase)

---

## Repository Structure

**Strategy**: Monorepo
**Rationale**: Solo dev + แชร์ types/utils/UI ระหว่าง frontend-backend ได้ง่าย deploy เป็นก้อนเดียว เหมาะ modular monolith

```
homework-tracker/
├── apps/
│   ├── web/                      # Frontend web app (responsive, ทุก role) — D3 เลือกเฟรมเวิร์ก
│   └── api/                      # Backend modular monolith (โมดูลต่อ bounded context)
│       └── src/modules/
│           ├── identity/         # U1 Identity & Access
│           ├── family/           # U2 Family & Membership
│           ├── assignment/       # U3 Assignment Master
│           ├── progress/         # U4 Progress & Tracking
│           ├── requests-audit/   # U5 Requests & Audit
│           └── oversight/        # U6 Oversight (read models)
├── packages/
│   ├── shared-types/             # DTOs, domain types, event schemas (TS)
│   ├── shared-ui/                # UI components กลาง + design tokens (accent #5B53E0, สีสถานะ)
│   ├── shared-auth/              # auth middleware, session, RBAC + data-isolation guard
│   ├── shared-errors/            # error envelope + shared error codes
│   ├── shared-logging/           # logging config (structured JSON + request id)
│   └── shared-config/            # lint/format/build/tsconfig ร่วม
├── infrastructure/               # IaC / deploy config (กำหนดละเอียดใน D3)
├── docker-compose.yml            # local dev (DB ฯลฯ)
└── [monorepo-config]             # pnpm-workspace.yaml / turbo.json (เลือกใน D3)
```

**NOTE**: ทุก unit จาก units.md ปรากฏใน structure — frontend อยู่ใน `apps/web`, backend modules ใต้ `apps/api/src/modules/`

---

## API Architecture

ข้าม — เป็น Modular Monolith (ไม่มี API gateway แยก). Frontend เรียก REST API ของ `apps/api`; โมดูลภายในเรียกกันผ่าน service interface โดยตรง

---

## Authentication & Authorization

**Approach**: OAuth2 / OpenID Connect (Google) → สร้าง server-side session, เก็บใน httpOnly secure cookie
**Authorization**: RBAC (Admin / Parent / Child / Teacher) + scope guard (family scope สำหรับ Parent/Child, class scope สำหรับ Teacher, ข้ามขอบเขตสำหรับ Admin)
**Enforced at**: Unit level ผ่าน shared-auth middleware (ทุก endpoint)

**Shared Auth Contract**: `AuthContext { userId, roles, familyId?, classScopes?: string[] }` — middleware คืน context หรือ error (`AUTH_001`/`AUTH_002`)

**Invite verification**: ยอมรับคำเชิญได้เฉพาะเมื่อ Google email ตรงกับอีเมลที่ถูกเชิญ

---

## Error Handling

**Format**: Custom envelope
**Code Convention**: `[DOMAIN]_[NUMBER]` — เช่น `AUTH_001`, `FAMILY_001`, `PROGRESS_001`
**Standard Shape**: `{ error: { code, message, status, details?, requestId } }`

**Shared Codes**: `VALIDATION_001` (400), `AUTH_001` (401 ไม่ได้ login), `AUTH_002` (403 สิทธิ์ไม่พอ/ข้ามครอบครัว), `NOT_FOUND` (404), `INTERNAL` (500)

---

## Inter-Unit Communication

**Pattern**: In-process (service calls + domain events)
**Convention**:
- REST (frontend → api): `/api/v1/[resource]`
- Internal service calls: `[Module]Service` interface
- Domain events (in-process): `[unit].[entity].[action]` — เช่น `progress.status.changed`
**Timeout/Retry**: ไม่ต้อง (in-process); event handlers ออกแบบให้ idempotent (upsert)

**Event Schema**: `DomainEvent<T> { eventId, eventType, timestamp, source, data: T }`
**Key events**: `progress.status.changed` (→ audit + oversight projection), `family.member.removed` (→ ลบ progress), `assignment.changed`, `assignment.teacher.changed`

---

## Database Strategy

**Approach**: Shared DB, แยก schema/namespace ตามโมดูล

- Schema convention: `[module]` เช่น `identity`, `family`, `assignment`, `progress`, `requests_audit`
- Scope columns ทุกตารางข้อมูลผู้ใช้: `family_id` (data isolation) และ `school_id` (nullable, เผื่อ multi-school อนาคต)
- Cross-schema access: ผ่าน service layer เท่านั้น (ไม่ query ข้าม schema ตรง)
- เลือก engine จริง (เช่น PostgreSQL) ใน D3

---

## Shared Types & Contracts

**Strategy**: Shared package (`packages/shared-types/`)
- เป็น single source of truth ของ DTOs, domain enums (ProgressStatus, Role, RequestStatus, InviteStatus), event schemas
- frontend และ backend import จาก package เดียวกัน — ไม่ drift
- Versioning: ตาม monorepo (ไม่ publish ออกนอก)

---

## Code & Data Conventions

### Code
- **Language**: TypeScript (strict) ทั้ง frontend + backend + shared
- **Naming**: ไฟล์ kebab-case; class/type PascalCase; ฟังก์ชัน/ตัวแปร camelCase; REST route kebab-case
- **Testing**: กำหนดใน D3 (คาด unit + integration; ทดสอบ RBAC/data-isolation เป็นพิเศษ)
- **Linting/Formatting**: ESLint + Prettier (config ร่วมใน `shared-config`)

### Data
- **IDs**: UUID v4
- **Timestamps**: ISO 8601 UTC
- **Soft deletes**: ลบ progress/membership แบบ hard delete (ตาม D1-9) แต่ audit log เก็บถาวร (append-only)

---

## Integration Contracts

ภาพร่างระดับสูง — API spec เต็มกำหนดในเฟส design ของแต่ละ unit

### U1 Identity → (ทุก unit)
```
GET  /api/v1/me                  → AuthContext ปัจจุบัน
middleware: requireAuth(roles[], scope)
```
```typescript
interface AuthContext { userId: string; roles: Role[]; familyId?: string; classScopes?: string[] }
type Role = 'admin' | 'parent' | 'child' | 'teacher'
```

### U2 Family → U4 Progress
```
GET  /api/v1/families/:id/members → สมาชิก (children) ในครอบครัว
event: family.member.removed      → progress ของ child ถูกลบ
```

### U3 Assignment → U4 / U5 / U6
```
GET  /api/v1/assignments?class=&term=&active=  → active assignments ตามชั้น/เทอม
event: assignment.changed
event: assignment.teacher.changed              → อัปเดต teacher scope
```

### U4 Progress → U5 Audit / U6 Oversight
```
PATCH /api/v1/progress/:id        → เปลี่ยนสถานะ (scope: family)
event: progress.status.changed { actor, role, from, to, assignmentId, childId, ts }
```

---

## Infrastructure Units

### Foundation (U0)

**Type**: Infrastructure (not domain)
**Purpose**: วางโครง monorepo + shared packages + cross-cutting ทั้งหมด
**Priority**: Design และ implement ก่อน domain units
**Responsibilities**:
- scaffold monorepo (apps/web, apps/api, packages/*)
- shared-types, shared-ui (design tokens + base components), shared-auth (OAuth/session + RBAC + data-isolation guard), shared-errors (envelope + codes), shared-logging, shared-config
- DB setup + schema/migration baseline + scope columns (family_id, school_id)
- in-process event bus utility
- CI/CD baseline (lint → test → build)
**Stories**: None (cross-cutting)
**Depended on by**: U1, U2, U3, U4, U5, U6

---

## Logging & Observability

**Log Format**: Structured JSON
**Correlation**: Request ID via `X-Request-Id` header (สร้างถ้าไม่มี)
**Log Levels**: error, warn, info, debug
**Audit note**: audit log เป็น domain concern (U5) แยกจาก application logging
