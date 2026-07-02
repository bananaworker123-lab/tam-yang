# Implementation Plan: U3 Assignment Master

## Overview
Stories US-006, US-007, US-021. **Strategy**: vertical slice; test-first สำหรับ validation/filter

## Tasks

- [ ] 1. Data model
  - [ ] 1.1 Prisma ClassRoom, Term, MasterAssignment, TeacherAssignment + migration
    - **Deps**: U0(2.1) | **Ref**: design — Data Model | **Est**: 3h

- [ ] 2. Assignment CRUD
  - [ ] 2.1 AssignmentService CRUD + active toggle + validation (test-first)
    - **Deps**: 1.1 | **Ref**: design — Correctness (due-after-assigned) | **Est**: 5h
    - เทสต์ก่อน (fast-check): due-after-assigned
  - [ ] 2.2 listActive filter (class/term/active) (test-first)
    - **Deps**: 1.1 | **Ref**: design — Correctness (active-filter) | **Est**: 3h
    - เทสต์ก่อน: active-filter property
  - [ ] 2.3 emit assignment.changed + admin RBAC guard
    - **Deps**: 2.1 | **Ref**: design — API | **Est**: 2h

- [ ] 3. Teacher assignment
  - [ ] 3.1 ClassRegistryService assign/revoke + emit teacher.changed
    - **Deps**: 1.1 | **Ref**: design — API (US-021) | **Est**: 4h

- [ ] 4. Web (admin)
  - [ ] 4.1 AdminAssignmentsPage (list + form + delete + active toggle)
    - **Deps**: 2.1, 2.2 | **Ref**: design — web (US-006,US-007) | **Est**: 5h
  - [ ] 4.2 AdminTeachersPage (assign/remove)
    - **Deps**: 3.1 | **Ref**: design — web (US-021) | **Est**: 3h

## Task Dependency Graph
```
U0 ─► 1.1 ─┬─► 2.1 ─► 2.3 ─► 4.1
           ├─► 2.2 ─► 4.1
           └─► 3.1 ─► 4.2
```
```json
{ "waves": [
  { "wave": 1, "tasks": ["1.1"] },
  { "wave": 2, "tasks": ["2.1", "2.2", "3.1"] },
  { "wave": 3, "tasks": ["2.3", "4.2"] },
  { "wave": 4, "tasks": ["4.1"] }
] }
```

## Execution Waves
| Wave | Phases | Resolved |
|------|--------|----------|
| 1 | 1. Data model | U0 |
| 2 | 2.1/2.2 assignment service, 3.1 teacher (ownership: assignment.service vs class-registry.service) | 1.1 |
| 3 | 2.3 events/RBAC, 4.2 AdminTeachers | wave 2 |
| 4 | 4.1 AdminAssignments | wave 2-3 |

## Coverage
US-006(1.1,2.1,2.3,4.1), US-007(2.2,4.1), US-021(3.1,4.2). PBT: due-after-assigned(2.1), active-filter(2.2)
