# Design Decisions (D3) — U0 Foundation (system-wide stack)

## Context Summary
- Unit: U0 Foundation (infra) — กำหนด stack + scaffold ที่ทุก unit ใช้
- Modular Monolith, Monorepo, TypeScript, OAuth Google + session, RBAC + data isolation, shared DB แยก schema (+ multi-school ready)
- Frontend: responsive web ตาม design prototype (accent #5B53E0, Plus Jakarta Sans/Bricolage)

> หมายเหตุ: foundation.md ตอบ repo/auth/error/comms/DB/shared-types ไปแล้ว — D3 เลือกเฟรมเวิร์ก/เครื่องมือที่เหลือ

---

## Decision Questions

### D3-1: Backend framework
**Question**: เฟรมเวิร์ก backend (TypeScript)?
- 1) NestJS — modular (modules/providers/guards), เหมาะ modular monolith + RBAC guards + DI **(Recommended)**
- 2) Express + โครงเอง
- 3) Fastify
- 4) Other: _______

**Answer**: 1

---

### D3-2: Frontend framework
**Question**: เฟรมเวิร์ก frontend?
- 1) React + Vite + TypeScript **(Recommended)** — ตรงกับ design prototype, ecosystem กว้าง
- 2) Next.js (SSR)
- 3) Vue
- 4) Other: _______

**Answer**: 1

---

### D3-3: Styling
**Question**: ระบบ styling ให้ตรง design tokens?
- 1) Tailwind CSS + design tokens (accent #5B53E0, สีสถานะ) **(Recommended)**
- 2) CSS Modules
- 3) styled-components
- 4) Other: _______

**Answer**: 1

---

### D3-4: Database engine
**Question**: ฐานข้อมูล?
- 1) PostgreSQL — รองรับ schema แยก + relational + JSON **(Recommended)**
- 2) MySQL
- 3) SQLite (dev เท่านั้น)
- 4) Other: _______

**Answer**: 1

---

### D3-5: ORM / data access
**Question**: เครื่องมือเข้าถึง DB?
- 1) Prisma — typed, migrations, multi-schema **(Recommended)**
- 2) TypeORM
- 3) Drizzle
- 4) Other: _______

**Answer**: 1

---

### D3-6: Auth library
**Question**: ไลบรารี auth (Google OAuth + session)?
- 1) Passport (passport-google-oauth20) + express-session (เก็บใน DB/Redis) ผ่าน NestJS **(Recommended)**
- 2) Auth.js (NextAuth)
- 3) เขียน OIDC เอง
- 4) Other: _______

**Answer**: 1

---

### D3-7: Monorepo tooling
**Question**: เครื่องมือ monorepo?
- 1) pnpm workspaces + Turborepo **(Recommended)**
- 2) npm workspaces
- 3) Nx
- 4) Other: _______

**Answer**: 1

---

### D3-8: Frontend data fetching/state
**Question**: จัดการ server state ฝั่ง frontend?
- 1) TanStack Query (React Query) + Context สำหรับ session/preferences **(Recommended)**
- 2) Redux Toolkit + RTK Query
- 3) SWR
- 4) Other: _______

**Answer**: 1

---

### D3-9: Testing strategy
**Question**: แนวทางทดสอบ?
- 1) Backend: Jest + Supertest; Frontend: Vitest + RTL; เน้นทดสอบ RBAC/data-isolation **(Recommended)**
- 2) Vitest ทั้งหมด
- 3) Minimal
- 4) Other: _______

**Answer**: 1

---

### D3-10: Correctness & Property-Based Testing
**Question**: ใช้ Property-Based Testing กับ logic วิกฤตไหม?
- 1) ใช้ PBT (fast-check) กับ pure logic วิกฤต: due-state (near/due/overdue), status transition, RBAC scope/data-isolation predicate **(Recommended)**
- 2) ไม่ใช้ PBT (unit test ปกติ)
- 3) Other: _______

**Answer**: 1

---

### D3-11: Deployment / hosting
**Question**: deploy อย่างไร?
- 1) Containerized (Docker) + PaaS (เช่น Render/Railway/Fly.io) + managed PostgreSQL **(Recommended)** — เหมาะ solo, ค่าใช้จ่ายต่ำ
- 2) AWS (ECS + RDS)
- 3) VPS เอง
- 4) Other: _______

**Answer**: 1

---

### D3-12: Session store
**Question**: เก็บ session ที่ไหน?
- 1) PostgreSQL session table (connect-pg-simple) — ไม่ต้องเพิ่ม service **(Recommended)**
- 2) Redis
- 3) In-memory (dev เท่านั้น)
- 4) Other: _______

**Answer**: 1

---

## Decisions Summary
<!-- Downstream phases: read ONLY this section. -->
- D3-1 Backend: NestJS (TypeScript)
- D3-2 Frontend: React + Vite + TypeScript
- D3-3 Styling: Tailwind CSS + design tokens
- D3-4 Database: PostgreSQL
- D3-5 ORM: Prisma (multi-schema, migrations)
- D3-6 Auth: Passport google-oauth20 + express-session (NestJS)
- D3-7 Monorepo: pnpm workspaces + Turborepo
- D3-8 FE State: TanStack Query + Context
- D3-9 Testing: Jest+Supertest (BE), Vitest+RTL (FE)
- D3-10 PBT: Yes — fast-check on due-state, status transition, RBAC/isolation predicate
- D3-11 Deploy: Docker + PaaS + managed PostgreSQL
- D3-12 Session store: PostgreSQL (connect-pg-simple)

---

**Instructions**: Fill in your answers above and respond with "done"
