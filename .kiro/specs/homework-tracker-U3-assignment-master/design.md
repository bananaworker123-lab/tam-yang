# Design: U3 Assignment Master

> Domain unit. Stories: US-006 (master CRUD), US-007 (active ผูกชั้น+เทอม), US-021 (มอบหมาย/ถอดครู). ใช้ stack/convention จาก U0/U1

## Summary
- **Architecture**: NestJS module `assignment` + React (Admin Tasks/Assignment CRUD, Teacher Assignment)
- **Components**: 4 — AssignmentModule, ClassRegistryService, AdminAssignmentsPage, AdminTeachersPage
- **Entities**: 4 — ClassRoom, Term, MasterAssignment, TeacherAssignment
- **Endpoints**: CRUD assignments, list active (filter class/term), assign/revoke teacher

## Architecture
```
AdminAssignmentsPage ─► /assignments (CRUD, toggle active)
AdminTeachersPage   ─► /teacher-assignments (assign/revoke)
list active (class+term) ─► consumed by U4 (progress) / U6 (oversight)
events: assignment.changed, assignment.teacher.changed
```

---

## Components

### AssignmentModule (api)
- **Responsibilities**: CRUD MasterAssignment (Admin only), active toggle, list active by class+term
- **Exposes**: `AssignmentService` (create/update/delete/listActive), publishes `assignment.changed`
- **Consumes**: shared-auth (admin guard), Prisma, event-bus

### ClassRegistryService (api)
- **Responsibilities**: ClassRoom/Term registry; TeacherAssignment (assign/revoke ครูเข้าชั้น — ไม่แบ่งเทอม)
- **Exposes**: `assignTeacher`, `revokeTeacher`, `getTeacherClasses(userId)`; publishes `assignment.teacher.changed`

### AdminAssignmentsPage / AdminTeachersPage (web)
- ตาม prototype: list + new/edit/delete form (วิชา/ครู/ชั้น/เทอม/วันสั่ง/กำหนดส่ง/active); assign teacher list + remove

---

## Data Model

### ClassRoom (schema `assignment`)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| name | varchar | not null | เช่น ป.4 |
| school_id | UUID | null | multi-school ready |

### Term (schema `assignment`)
| id UUID PK | name varchar | active bool | — เทอม |

### MasterAssignment (schema `assignment`)
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | |
| subject | varchar | not null | วิชา |
| teacher_name | varchar | not null | ชื่อครูผู้สั่ง |
| class_id | UUID | FK→ClassRoom, not null, index | |
| term_id | UUID | FK→Term, not null, index | |
| assigned_date | date | not null | วันสั่ง |
| due_date | date | not null | กำหนดส่ง |
| active | bool | not null, default true | |
| created_at/updated_at | timestamptz | | |

**Constraint**: due_date >= assigned_date

### TeacherAssignment (schema `assignment`)
| id UUID PK | teacher_user_id UUID FK→User, index | class_id UUID FK→ClassRoom, index | created_at |
**Constraint**: unique(teacher_user_id, class_id)

---

## API Specification

### POST/PUT/DELETE /api/v1/assignments[/:id]
- **Auth**: admin | **Request**: `{ subject, teacherName, classId, termId, assignedDate, dueDate, active }`
- **Errors**: 400 (due<assigned / ฟิลด์ว่าง), 403 (ไม่ใช่ admin); emit `assignment.changed`

### GET /api/v1/assignments?classId=&termId=&active=
- **Auth**: required | **Response 200**: `{ assignments[] }` (active filter)

### POST /api/v1/teacher-assignments  | DELETE /api/v1/teacher-assignments/:id
- **Auth**: admin | **Request**: `{ teacherUserId, classId }` | emit `assignment.teacher.changed`; **Errors**: 403, 409 (ซ้ำ)

---

## Implementation
```
apps/api/src/modules/assignment/{assignment.module.ts,assignment.service.ts,class-registry.service.ts,*.controller.ts,*.repository.ts}
apps/web/src/routes/admin/{Assignments.tsx,Teachers.tsx}
```
- **Tests**: Jest+Supertest (CRUD, validation due>=assigned, admin RBAC, teacher unique), Vitest+RTL

## Correctness Properties
| Property | Description | Validates |
|----------|-------------|-----------|
| due-after-assigned | บันทึกได้ ⇔ due_date >= assigned_date (random dates) | US-006 |
| active-filter | listActive คืนเฉพาะ active && class+term ตรง | US-007 |

## Traceability
| Requirement | Component | API | Data |
|-------------|-----------|-----|------|
| US-006 | AssignmentModule, AdminAssignmentsPage | /assignments CRUD | MasterAssignment |
| US-007 | AssignmentService | GET /assignments (filter) | MasterAssignment, ClassRoom, Term |
| US-021 | ClassRegistryService, AdminTeachersPage | /teacher-assignments | TeacherAssignment |
