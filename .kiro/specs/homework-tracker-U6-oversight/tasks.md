# Implementation Plan: U6 Oversight

## Overview
Stories US-018, US-019, US-020, US-022 (read-only views). **Strategy**: query/read models; test-first สำหรับ teacher scope

## Tasks

- [ ] 1. Oversight service (queries)
  - [ ] 1.1 getClassOverview + teacher scope guard (test-first PBT)
    - **Deps**: U3(3.1), U4(3.1) | **Ref**: design — Correctness (US-018) | **Est**: 5h
    - เทสต์ก่อน: teacher-scope-readonly (เห็นเฉพาะ class มอบหมาย; revoke→403; ไม่มี mutation)
  - [ ] 1.2 getAdminOverview (KPI + recent activity + need-nudge)
    - **Deps**: U2,U4,U5 | **Ref**: design — API (US-019) | **Est**: 4h
  - [ ] 1.3 getAllProgress (filter) + getAllFamilies (admin RBAC)
    - **Deps**: U2,U4 | **Ref**: design — API (US-020,US-022) | **Est**: 4h

- [ ] 2. Web (read-only)
  - [ ] 2.1 TeacherOverviewPage (filter status)
    - **Deps**: 1.1, U1(2.1) | **Ref**: design — web (US-018) | **Est**: 4h
  - [ ] 2.2 AdminOverviewPage
    - **Deps**: 1.2 | **Ref**: design — web (US-019) | **Est**: 4h
  - [ ] 2.3 AdminProgressPage + AdminFamiliesPage
    - **Deps**: 1.3 | **Ref**: design — web (US-020,US-022) | **Est**: 5h

## Task Dependency Graph
```
U2,U3,U4,U5 ─► 1.1 ─► 2.1
              ─► 1.2 ─► 2.2
              ─► 1.3 ─► 2.3
```
```json
{ "waves": [
  { "wave": 1, "tasks": ["1.1", "1.2", "1.3"] },
  { "wave": 2, "tasks": ["2.1", "2.2", "2.3"] }
] }
```

## Execution Waves
| Wave | Phases | Resolved |
|------|--------|----------|
| 1 | 1.1/1.2/1.3 oversight queries (ภายใน oversight.service — sequential) | U2,U3,U4,U5 |
| 2 | 2.1/2.2/2.3 web pages (ownership แยกไฟล์ route) | wave 1 |

## Coverage
US-018(1.1,2.1), US-019(1.2,2.2), US-020(1.3,2.3), US-022(1.3,2.3). PBT: teacher-scope-readonly(1.1)
