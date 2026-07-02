---
inclusion: always
---

# Technology Context

## Summary
<!-- 3-line max -->
- **Stack**: TypeScript — React+Vite (web) / NestJS (api) / PostgreSQL+Prisma; Google OAuth + session
- **Architecture**: Modular Monolith + SPA, Monorepo (pnpm + Turborepo)
- **Infra**: Docker + PaaS + managed PostgreSQL

## Stack

- **Languages**: TypeScript (strict)
- **Frameworks**: React + Vite (web), NestJS (api)
- **Build System**: Vite (web), Nest build (api), Turborepo orchestration
- **Package Manager**: pnpm (workspaces)
- **Testing**: Jest + Supertest (api), Vitest + React Testing Library (web), fast-check (PBT)

## Architecture

- **Pattern**: Modular Monolith (NestJS modules ต่อ bounded context) + React SPA
- **API Style**: REST (`/api/v1`), session cookie auth

## Infrastructure

- **Cloud Provider**: PaaS (Render/Railway/Fly.io — เลือกตอน deploy)
- **Compute**: Docker container (api เสิร์ฟ web build หรือแยก static)
- **Database**: PostgreSQL (managed) + Prisma (multi-schema, migrations)
- **IaC Tool**: docker-compose (local); PaaS config (prod)

## Patterns & Conventions

Will be defined during design phase (D2/D3/D4). ข้อกำหนดที่ design ต้องครอบคลุม:

- **Authorization**: Role-based access control (Admin/Parent/Child/Teacher) — บังคับใช้ฝั่ง backend ทุก endpoint
- **Data isolation**: ทุก query ของ Parent/Child ต้อง scope ด้วย family; Teacher scope ด้วยชั้นเรียนที่ดูแล; ห้าม leak ข้ามครอบครัว
- **Audit logging**: ทุกการเปลี่ยน progress ต้องเขียน audit record (actor, role, timestamp, from→to, assignment, child)
- **Authentication**: Google OAuth (OpenID Connect); invite verification ผูกกับ Gmail ที่ถูกเชิญ
- **Validation**: validate input ทุก mutation; ตรวจสิทธิ์ก่อนเขียน
- **Error handling**: Pending design phase
- **Code style**: Pending design phase

## Environment Configuration

Will be defined during design phase.

- **Config approach**: Pending — ต้องเก็บ Google OAuth client id/secret อย่างปลอดภัย
- **Environments**: Pending (อย่างน้อย local dev + production)
- **Secrets management**: Pending — OAuth secrets ห้าม commit

## CI/CD Pipeline

- **Tool**: Pending D3 decisions
- **Stages**: Pending (คาดว่า install → lint/test → build → deploy)
- **Deploy target**: Pending D3 decisions

## Dependency Management

- **Lockfile**: Pending (commit lockfile)
- **Version strategy**: Pending
- **Monorepo tooling**: Pending — อาจมี frontend + backend (พิจารณา workspace/monorepo ใน D3)

## Design System (จาก design prototype)

อ้างอิง `Initial-requirement/app_design/Homeroom - Homework Tracker.dc.html`:

- **Fonts**: Plus Jakarta Sans (body), Bricolage Grotesque (headings)
- **Accent**: `#5B53E0` (indigo), accent-soft `#ECEBFD`, accent-ink `#463FBF`
- **Neutrals**: bg `#F4F4FB`, card `#fff`, ink `#1B1A2A`, muted `#6E6D80`, line `#ECEAF3`
- **Status colors**: Submitted = green `#27A56B`, Done = amber `#EBA53A`, Not started = grey `#C9C7D8`, Overdue/danger = red `#E5484D` / `#D5403F`
- **Layout**: mobile-first (phone frame ~392px) + desktop responsive; การ์ดมุมมน, soft shadow
- **Interaction**: status pill วน Not started → Done → Submitted; Teacher view read-only

## Shared Conventions (จาก Foundation / DF)

- **Repo**: Monorepo — `apps/web`, `apps/api` (modular monolith), `packages/shared-*`
- **Language**: TypeScript (strict) ทั้ง frontend/backend/shared; framework เจาะจงตัดสินใน D3
- **Authentication**: OAuth2/OIDC (Google) → server-side session cookie (httpOnly secure); invite ยอมรับเมื่อ Google email ตรงอีเมลที่เชิญ
- **Authorization**: RBAC (admin/parent/child/teacher) + scope guard — family scope (Parent/Child), class scope (Teacher), ข้ามขอบเขต (Admin); บังคับผ่าน `shared-auth` middleware ทุก endpoint
- **AuthContext**: `{ userId, roles, familyId?, classScopes?[] }`
- **Error format**: envelope `{ error: { code, message, status, details?, requestId } }`; codes `[DOMAIN]_[NUMBER]` (VALIDATION_001, AUTH_001/002, NOT_FOUND, INTERNAL)
- **Inter-module comms**: in-process service calls + in-process domain events; events `[unit].[entity].[action]` (เช่น `progress.status.changed`, `family.member.removed`, `assignment.changed`); handlers idempotent
- **Database**: Shared DB แยก schema ตามโมดูล (`identity`, `family`, `assignment`, `progress`, `requests_audit`); ทุกตารางข้อมูลผู้ใช้มี `family_id` + `school_id` (nullable, เผื่อ multi-school); cross-schema ผ่าน service layer เท่านั้น
- **Shared types**: `packages/shared-types` single source of truth (DTOs, enums: ProgressStatus/Role/RequestStatus/InviteStatus, event schemas)
- **IDs/Timestamps**: UUID v4 / ISO 8601 UTC
- **Deletes**: progress/membership hard delete; audit log append-only (เก็บถาวร)
- **Logging**: structured JSON + `X-Request-Id` correlation
- **Infra unit**: U0 Foundation (ทำก่อน domain units)
