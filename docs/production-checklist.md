# Production Checklist — Homeroom Homework Tracker

ทำรอบเดียวเพื่อเปลี่ยนจาก mock → production

---

## สถานะตอนนี้ (dev/mock)
- Google OAuth login → บันทึก User ใน Supabase ✅
- Session → MemoryStore (หายเมื่อ restart api) ❌
- Family / Membership / Progress / Assignments → mock data ใน React state ❌

---

## TODO list

### 1. Session store → Postgres
- เปลี่ยน MemoryStore เป็น `connect-pg-simple` ชี้ Supabase
- ทำแล้ว session ข้ามการ restart ได้; login ครั้งเดียวใช้ได้นาน 7 วัน
- ไฟล์: `apps/api/src/main.ts` (session config)

### 2. Family & Membership API
- `POST /api/v1/families` — สร้างครอบครัว
- `POST /api/v1/families/:id/invites` — เชิญสมาชิก (email-bound)
- `POST /api/v1/invites/:token/accept` — ยืนยันคำเชิญ
- `GET /api/v1/families/:id/members` — รายชื่อสมาชิก
- `DELETE /api/v1/families/:id/members/:userId` — ลบสมาชิก
- ไฟล์: `apps/api/src/modules/family/`

### 3. Assignment Master API
- `POST/PUT/DELETE /api/v1/assignments` — Admin CRUD
- `GET /api/v1/assignments?classId&termId&active` — list สำหรับ parent/child
- ไฟล์: `apps/api/src/modules/assignment/`

### 4. Progress API
- `GET /api/v1/progress?childId` — ดูสถานะงาน (family scope guard)
- `PATCH /api/v1/progress/:id` — เปลี่ยนสถานะ + emit audit event
- ไฟล์: `apps/api/src/modules/progress/`

### 5. Requests & Audit API
- `POST/GET /api/v1/requests` — ส่ง/ดูคำขอ
- `POST /api/v1/requests/:id/resolve|reject` — Admin จัดการ
- `GET /api/v1/audit` — Admin ดู log
- ไฟล์: `apps/api/src/modules/requests-audit/`

### 6. Oversight API (Teacher + Admin views)
- `GET /api/v1/oversight/class/:classId` — teacher read-only
- `GET /api/v1/oversight/admin/overview|progress|families` — admin dashboards
- ไฟล์: `apps/api/src/modules/oversight/`

### 7. เคลียร์ mock data ออกจาก frontend
- แทนที่ `useStore` mock calls ด้วย TanStack Query เรียก API จริง
- ลบ `apps/web/src/mock/data.ts` seed data (คง `config.ts` ไว้สำหรับ classes/terms/subjects)
- ลบ `apps/web/src/mock/store.tsx` หลังย้ายทุก action เข้า API

### 8. Test end-to-end
- Login → onboarding → create family → invite member → assign homework → update progress
- ทดสอบ data isolation (ครอบครัว A ไม่เห็นข้อมูลครอบครัว B)
- ทดสอบ teacher read-only scope

---

## สิ่งที่ทำแล้วและพร้อมใช้ (ไม่ต้องทำใหม่)
- Prisma schema ครบ 5 schemas (identity, family, assignment, progress, requests_audit) ✅
- PrismaService + UserService + GoogleStrategy ✅
- RolesGuard + ScopeGuard + data-isolation predicate (PBT ผ่าน) ✅
- EventBus (in-process, idempotent) ✅
- AllExceptionsFilter + error envelope ✅
- DB ต่อ Supabase ได้แล้ว (`prisma db push` sync แล้ว) ✅
