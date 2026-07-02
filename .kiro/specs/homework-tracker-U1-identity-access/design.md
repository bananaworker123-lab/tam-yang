# Design: U1 Identity & Access

> Domain unit. Stories: US-001 (Google login), US-002 (profile + logout). ใช้ stack/convention จาก U0 (`../homework-tracker-U0-foundation/design.md`, `../homework-tracker/foundation.md`)

## Summary
- **Architecture**: NestJS module `identity` + React routes (Login, Profile)
- **Stack**: React+Vite / NestJS / PostgreSQL+Prisma (ตาม D3)
- **Components**: 4 — IdentityModule(api), LoginPage, ProfilePage, AuthProvider(web)
- **Entities**: 1 — User (Session มาจาก U0)
- **Endpoints**: ใช้ของ U0 (`/auth/google`, `/callback`, `/logout`, `/me`) + เพิ่มข้อมูล profile ใน `/me`

## Architecture

```
LoginPage ─► GET /auth/google ─► Google ─► /auth/google/callback
   │                                            │ upsert User + create session
   ▼                                            ▼
AuthProvider (web) ◄── GET /api/v1/me ◄── IdentityModule (api)
ProfilePage ◄── /me ; POST /auth/logout
routing: ถ้า user ไม่มี family/role → Onboarding (U2), else Home
```

---

## Components

### IdentityModule (api)
- **Purpose**: จัดการ user identity + profile, ต่อยอดจาก shared-auth (U0)
- **Responsibilities**: upsert User จาก Google profile, คืนข้อมูล profile ใน `/me`, ตรวจสถานะ onboarding (มี family/role หรือยัง)
- **Exposes**: `UserService.upsertFromGoogle()`, `UserService.getProfile(userId)`
- **Consumes**: shared-auth, Prisma (User), shared-errors

### AuthProvider (web)
- **Purpose**: เก็บ session state ฝั่ง client (React Context)
- **Exposes**: `useAuth()` → `{ user, roles, familyId, status, refetch, logout }` (ใช้ TanStack Query เรียก `/me`)

### LoginPage (web)
- **Purpose**: หน้า Login (ปุ่ม Sign in with Google) ตาม prototype
- **Behavior**: redirect ไป `/auth/google`; ถ้า login แล้วเข้าหน้าตาม routing

### ProfilePage (web)
- **Purpose**: แสดง name/email/role/scope + ปุ่ม logout
- **Behavior**: `POST /auth/logout` → clear session → กลับ Login

---

## Data Model

### User (schema `identity`)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | user id |
| google_sub | varchar | unique, not null | Google subject id |
| email | varchar | unique, not null | Google email |
| name | varchar | not null | display name |
| picture_url | varchar | null | avatar |
| created_at | timestamptz | not null | |
| updated_at | timestamptz | not null | |

> Role/family membership เก็บใน U2 (Membership) — `/me` รวมข้อมูลจาก membership เพื่อสร้าง AuthContext
**Indexes**: unique(google_sub), unique(email)

---

## API Specification

ใช้ endpoints จาก U0 (`/auth/google`, `/auth/google/callback`, `/auth/logout`, `/api/v1/me`).

### GET /api/v1/me (ขยายจาก U0)
- **Auth**: required
- **Response 200**: `{ userId, email, name, pictureUrl, roles, familyId?, classScopes?, onboardingComplete }`
- **Errors**: 401

---

## Integration Points

| External System | Protocol | Purpose | Error Handling |
|----------------|----------|---------|----------------|
| Google OAuth | OAuth2 | login + profile | callback error → 401 + redirect login |

---

## Implementation

### Directory Structure
```
apps/api/src/modules/identity/{identity.module.ts,user.service.ts,user.controller.ts,user.repository.ts}
apps/web/src/{routes/Login.tsx,routes/Profile.tsx,context/AuthProvider.tsx,hooks/useAuth.ts}
prisma/ (User model ใน schema identity)
```

### Conventions
- controller → service → repository (Prisma); guard จาก shared-auth
- **Tests**: Jest+Supertest (upsert, /me onboarding states), Vitest+RTL (Login/Profile, logout)

---

## Correctness Properties

| Property | Description | Validates |
|----------|-------------|-----------|
| upsert-idempotent | upsertFromGoogle ด้วย google_sub เดิม → ไม่สร้าง user ซ้ำ (จำนวนคงที่) | US-001 |

---

## Traceability

| Requirement | Component | API | Data |
|-------------|-----------|-----|------|
| US-001 | IdentityModule, LoginPage, AuthProvider | /auth/google, /callback, /me | User, Session |
| US-002 | ProfilePage, IdentityModule | /me, /auth/logout | User |
