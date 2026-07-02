# Foundation Decisions (DF)

## Context Summary
- **Architecture**: Modular Monolith (จาก D2), Domain-Driven, 6 units (U1-U6)
- **Type**: Greenfield, responsive web + backend API + database
- **Cross-cutting**: RBAC (4 roles), data isolation ระหว่างครอบครัว, audit log, DB รองรับ multi-school
- **Auth**: Google OAuth (OpenID Connect); invite ผูก Gmail
- **Frontend**: เว็บเดียว responsive (ไม่มี mobile native)

---

## Decision Questions

### DF-1: ขนาดทีม
**Question**: ทีมพัฒนาขนาดเท่าไหร่?
- 1) Solo (คนเดียว) **(Recommended สำหรับโปรเจกต์นี้)**
- 2) ทีมเล็ก (2-3 คน)
- 3) หลายทีม (4+ คน)
- 4) Other (please specify): _______

**Answer**: 1

---

### DF-2: กลยุทธ์ repository
**Question**: จัดเก็บโค้ดอย่างไร?
- 1) Monorepo — frontend + backend + shared types ในที่เดียว **(Recommended)**
- 2) Multi-repo — แยก repo frontend/backend
- 3) Hybrid
- 4) Other (please specify): _______

**Answer**: 1

---

### DF-3: ระดับการแชร์ foundation
**Question**: แชร์ส่วนกลางมากแค่ไหน?
- 1) แชร์ทั้ง shared types + utils + UI component กลาง **(Recommended)** — modular monolith
- 2) แชร์เฉพาะ interface/contract
- 3) แชร์ขั้นต่ำ
- 4) Other (please specify): _______

**Answer**: 1

---

### DF-4: การยืนยันตัวตน (auth)
**Question**: กลไก auth หลัก?
- 1) OAuth2 / OpenID Connect (Google) + session cookie ฝั่ง server **(Recommended)** — เหมาะ web app
- 2) OAuth2 (Google) + JWT (stateless)
- 3) Session-based ล้วน
- 4) Other (please specify): _______

**Answer**: 1

---

### DF-5: รูปแบบ error response
**Question**: รูปแบบ error ของ API?
- 1) Custom envelope `{ error: { code, message, details } }` **(Recommended)** — อ่านง่าย ปรับแต่งได้
- 2) RFC 7807 (problem+json)
- 3) Framework default
- 4) Other (please specify): _______

**Answer**: 1

---

### DF-6: การสื่อสารระหว่าง module
**Question**: module ภายใน monolith สื่อสารกันอย่างไร?
- 1) เรียก service ภายในโดยตรง + domain events ภายใน (in-process) สำหรับ audit/projection **(Recommended)**
- 2) REST ภายในทุกครั้ง
- 3) Event-driven เต็มรูปแบบ (broker)
- 4) Other (please specify): _______

**Answer**: 1

---

### DF-7: กลยุทธ์ฐานข้อมูล
**Question**: จัดโครงสร้าง DB อย่างไร (ต้องรองรับ multi-school ในอนาคต)?
- 1) Shared DB, แยก schema/namespace ตาม module + คอลัมน์ scope (family_id, school_id เผื่ออนาคต) **(Recommended)**
- 2) Database per unit
- 3) Shared DB ตารางรวมไม่แยก
- 4) Other (please specify): _______

**Answer**: 1

---

### DF-8: กลยุทธ์ shared types
**Question**: แชร์ type/contract ระหว่าง frontend-backend อย่างไร?
- 1) Shared package ใน monorepo (TypeScript types ร่วม) **(Recommended)**
- 2) Code generation จาก schema/OpenAPI
- 3) Manual sync
- 4) Other (please specify): _______

**Answer**: 1

---

### DF-9: Infrastructure units ที่ต้องมี
**Question**: ต้องมี infrastructure unit อะไรบ้าง?
- 1) Foundation unit เดียว (scaffold, shared packages, auth middleware, error handling, DB setup, RBAC/data-isolation guard, CI/CD) **(Recommended)** — เหมาะ monolith + solo/ทีมเล็ก
- 2) แยกหลาย infra unit (gateway, auth service, event bus)
- 3) ไม่มี infra unit
- 4) Other (please specify): _______

**Answer**: 1

---

### DF-10: กลยุทธ์ infrastructure unit
**Question**: จัดการ infra unit แบบไหน?
- 1) Combined — Foundation unit เดียวรวมทุกอย่าง **(Recommended)**
- 2) Separate — แยกแต่ละ infra component เป็น unit
- 3) Other (please specify): _______

**Answer**: 1

---

## Decisions Summary
<!-- Machine-readable compact summary. Downstream phases: read ONLY this section. -->
<!-- Auto-populated after user fills answers. One line per decision. -->
- DF-1 Team Size: Solo
- DF-2 Repository: Monorepo (frontend + backend + shared types)
- DF-3 Shared Level: แชร์ทั้ง shared types + utils + UI components
- DF-4 Auth: OAuth2/OIDC (Google) + server session cookie
- DF-5 Error Format: Custom envelope { error: { code, message, details } }
- DF-6 Inter-module Comms: เรียก service ภายในตรง + in-process domain events (audit/projection)
- DF-7 Database: Shared DB แยก schema ตาม module + scope columns (family_id, school_id เผื่อ multi-school)
- DF-8 Shared Types: Shared package ใน monorepo (TypeScript)
- DF-9 Infra Units: Foundation unit เดียว (scaffold, shared pkgs, auth, error, DB, RBAC/isolation guard, CI/CD)
- DF-10 Infra Strategy: Combined (Foundation unit เดียว)

---

**Instructions**: Fill in your answers above and respond with "done"
