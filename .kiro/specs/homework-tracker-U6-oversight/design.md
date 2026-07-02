# Design: U6 Oversight (Teacher & Admin views)

> Domain unit (read-only views). Stories: US-018 (teacher class overview), US-019 (admin overview), US-020 (admin progress รวม), US-022 (admin family overview). ใช้ stack/convention จาก U0-U5

## Summary
- **Architecture**: NestJS module `oversight` (read models/queries) + React (TeacherOverview, AdminOverview, AdminProgress, AdminFamilies)
- **Components**: 5 — OversightModule, TeacherOverviewPage, AdminOverviewPage, AdminProgressPage, AdminFamiliesPage
- **Entities**: read projections (อ่านจาก progress/assignment/family/audit) — ไม่มี write model ใหม่
- **Endpoints**: teacher class overview, admin overview KPI, admin progress (filter), admin families

## Architecture
```
TeacherOverviewPage ─► GET /oversight/class/:classId (teacher scope guard; revoked→403)
AdminOverviewPage ─► GET /oversight/admin/overview (KPI + recent activity จาก audit)
AdminProgressPage ─► GET /oversight/admin/progress?class&term&status
AdminFamiliesPage ─► GET /oversight/admin/families
(read-only; teacher แก้สถานะไม่ได้)
```

---

## Components

### OversightModule (api)
- **Responsibilities**: query read-only ข้ามครอบครัว (admin) / ตามชั้นที่มอบหมาย (teacher); KPI aggregation; teacher scope enforcement (revoked → ไม่เห็น)
- **Exposes**: `getClassOverview(classId, teacherCtx)`, `getAdminOverview()`, `getAllProgress(filter)`, `getAllFamilies()`
- **Consumes**: shared-auth (RolesGuard admin / teacher scope), U3 (class/teacher assignment), U4 (progress), U2 (families), U5 (audit recent, pending requests count)

### Web pages (read-only)
- TeacherOverviewPage: ตาราง progress เด็กทั้งชั้น + filter สถานะ (read-only)
- AdminOverviewPage: KPI (families, active tasks, pending requests, completion %) + recent activity + students need nudge
- AdminProgressPage: progress ทุกครอบครัว/เด็ก + filter class/term/status; เปิด detail เด็ก
- AdminFamiliesPage: ครอบครัว + สมาชิก

---

## Data Model

ไม่มี entity ใหม่ — ใช้ projection/queries จาก:
- Progress (U4), MasterAssignment/ClassRoom/Term/TeacherAssignment (U3), Family/Membership (U2), AuditEntry/Request (U5)

> teacher scope: เห็นเฉพาะ class ที่มี TeacherAssignment(teacher_user_id, class_id) อยู่ — ถ้าถูก revoke (ลบ row) → query คืน 403/empty

---

## API Specification

### GET /api/v1/oversight/class/:classId
- **Auth**: teacher (ต้องมี TeacherAssignment ของ classId) | **Response 200**: `{ students: [{ child, cells: [{assignment,status,dueState}] }] }`
- **Errors**: 403 (ไม่ได้รับมอบหมาย/ถูก revoke)

### GET /api/v1/oversight/admin/overview
- **Auth**: admin | **Response 200**: `{ familyCount, activeTasks, pendingRequests, completionPct, recentActivity[], needNudge[] }`

### GET /api/v1/oversight/admin/progress?classId=&termId=&status=
- **Auth**: admin | **Response 200**: `{ rows: [{ child, family, cells[] }] }`

### GET /api/v1/oversight/admin/families
- **Auth**: admin | **Response 200**: `{ families: [{ name, members[] }] }`

---

## Integration Points
| Source | Type | Purpose |
|--------|------|---------|
| U2/U3/U4/U5 | service (read) | aggregate read models |

---

## Implementation
```
apps/api/src/modules/oversight/{oversight.module.ts,oversight.service.ts,oversight.controller.ts}
apps/web/src/routes/{TeacherOverview.tsx,admin/Overview.tsx,admin/Progress.tsx,admin/Families.tsx}
```
- **Tests**: Jest+Supertest (teacher scope/revoke 403, admin-only, read-only ไม่มี mutation), Vitest+RTL (views, filters)

## Correctness Properties
| Property | Description | Validates |
|----------|-------------|-----------|
| teacher-scope-readonly | teacher เห็นเฉพาะ class ที่มอบหมาย; ไม่มี endpoint แก้สถานะ; ถูก revoke → 403 | US-018 |

## Traceability
| Requirement | Component | API | Data |
|-------------|-----------|-----|------|
| US-018 | OversightModule, TeacherOverviewPage | /oversight/class/:id | Progress, TeacherAssignment |
| US-019 | AdminOverviewPage | /oversight/admin/overview | aggregate + AuditEntry |
| US-020 | AdminProgressPage | /oversight/admin/progress | Progress, Family |
| US-022 | AdminFamiliesPage | /oversight/admin/families | Family, Membership |
