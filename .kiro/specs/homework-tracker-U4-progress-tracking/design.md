# Design: U4 Progress & Tracking

> Domain unit (หัวใจระบบ). Stories: US-008 (Parent update), US-009 (Child update), US-010 (data isolation), US-011 (detail), US-012 (notifications near/due/overdue). ใช้ stack/convention จาก U0-U3

## Summary
- **Architecture**: NestJS module `progress` + React (Dashboard + child tabs, AssignmentDetail, StatusPill)
- **Components**: 5 — ProgressModule, DueStateService, DashboardPage, AssignmentDetailPage, StatusPill(ใช้ shared-ui)
- **Entities**: 1 — Progress (per Child+Assignment)
- **Endpoints**: list dashboard (family-scoped), patch status, get detail

## Architecture
```
DashboardPage(child tabs) ─► GET /progress?childId (family scope guard)
StatusPill tap ─► PATCH /progress/:id  (cycle Not started→Done→Submitted, อิสระ)
   └► emit progress.status.changed (→ U5 audit, U6 oversight)
DueStateService: คำนวณ near(≤2วันก่อน due)/dueToday/overdue จาก due_date + status
events subscribed: assignment.changed (U3), family.member.removed (U2 → ลบ progress)
```

---

## Components

### ProgressModule (api)
- **Responsibilities**: อ่าน/อัปเดต progress, บังคับ family scope (US-010), สิทธิ์ Parent(ลูกทุกคน)/Child(ตัวเอง), สร้าง progress lazy เมื่อ list active assignment
- **Exposes**: `ProgressService` (listForFamily, updateStatus, getDetail); publishes `progress.status.changed`
- **Consumes**: shared-auth (ScopeGuard family), U2 members, U3 listActive, event-bus
- **Subscribes**: `family.member.removed` → ลบ progress ของ child; `assignment.changed`

### DueStateService (api/shared pure logic)
- **Responsibilities**: pure function คำนวณ DueState
- **Rule**: ถ้า Submitted → none; else ถ้า today > due → overdue; ถ้า today == due → dueToday; ถ้า due-today ∈ [1,2] วัน → near; else none

### DashboardPage (web)
- child tabs (ลูกแต่ละคน), summary, list งาน active + StatusPill + สี DueState; Child เห็นเฉพาะตัวเอง (US-009)

### AssignmentDetailPage (web)
- รายละเอียดงาน + เปลี่ยนสถานะ + ปุ่มแจ้งแอดมิน (→ U5)

---

## Data Model

### Progress (schema `progress`)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| child_user_id | UUID | FK→User, not null, index | เด็กเจ้าของ |
| assignment_id | UUID | FK→MasterAssignment, not null, index | |
| family_id | UUID | not null, index | data isolation scope |
| school_id | UUID | null | multi-school ready |
| status | enum(not_started,done,submitted) | not null, default not_started | |
| updated_at | timestamptz | not null | |

**Constraint**: unique(child_user_id, assignment_id)
**Indexes**: (family_id), (child_user_id), (assignment_id)

---

## API Specification

### GET /api/v1/progress?childId=&classId=&termId=
- **Auth**: parent/child (ScopeGuard: family ของผู้ใช้) | **Response 200**: `{ items: [{ assignment, status, dueState }] }`
- **Behavior**: Child → บังคับ childId = ตัวเอง; Parent → ลูกในครอบครัว; cross-family → 403

### PATCH /api/v1/progress/:id
- **Auth**: parent (ลูกในครอบครัว) / child (ตัวเอง) | **Request**: `{ status }`
- **Response 200**: `{ id, status }`; emit `progress.status.changed { actor, role, from, to, assignmentId, childId, ts }`
- **Errors**: 403 (cross-family / child แก้ของคนอื่น)

### GET /api/v1/progress/:id (detail)
- **Auth**: parent/child (scope) | **Response 200**: assignment detail + status + dueState

---

## Integration Points
| Source | Type | Purpose |
|--------|------|---------|
| U2 Family | service/event | สมาชิก (children) + member.removed |
| U3 Assignment | service/event | active assignments + assignment.changed |
| U5 Audit | event | progress.status.changed → audit |

---

## Implementation
```
apps/api/src/modules/progress/{progress.module.ts,progress.service.ts,due-state.ts,*.controller.ts,*.repository.ts}
apps/web/src/routes/{Dashboard.tsx,AssignmentDetail.tsx}
```
- **Tests**: Jest+Supertest (scope/isolation 403, parent/child perms), Vitest+RTL (dashboard, pill cycle); fast-check (due-state, transition, isolation)

## Correctness Properties
| Property | Description | Validates |
|----------|-------------|-----------|
| due-state-rule | DueState ถูกต้องตามนิยาม (random due/today/status): submitted→none; >due→overdue; ==due→dueToday; 1-2วันก่อน→near | US-012 |
| status-transition-free | เปลี่ยนสถานะไป-กลับได้ทุกทิศ (random sequence) ลงเอยตามค่าล่าสุด | US-008 |
| family-isolation | ผู้ใช้ครอบครัว A เข้าถึง/แก้ progress ครอบครัว B → 403 เสมอ (random) | US-010 |
| child-own-only | child แก้ได้เฉพาะ progress ที่ child_user_id == ตัวเอง | US-009 |

## Traceability
| Requirement | Component | API | Data |
|-------------|-----------|-----|------|
| US-008 | ProgressModule, DashboardPage | PATCH /progress | Progress |
| US-009 | ProgressModule, DashboardPage | PATCH/GET /progress | Progress |
| US-010 | ScopeGuard, ProgressService | all /progress | Progress.family_id |
| US-011 | AssignmentDetailPage | GET /progress/:id | Progress |
| US-012 | DueStateService, StatusPill | GET /progress (dueState) | Progress, MasterAssignment.due_date |
