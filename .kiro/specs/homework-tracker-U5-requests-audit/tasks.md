# Implementation Plan: U5 Requests & Audit

## Overview
Stories US-013..US-017. **Strategy**: vertical slice; test-first สำหรับ audit idempotency/lifecycle

## Tasks

- [ ] 1. Data model
  - [ ] 1.1 Prisma Request + AuditEntry (append-only) + migration
    - **Deps**: U0(2.1), U3(1.1) | **Ref**: design — Data Model | **Est**: 3h

- [ ] 2. Audit (test-first)
  - [ ] 2.1 AuditService subscribe progress.status.changed + append idempotent (PBT)
    - **Deps**: 1.1, U4(3.2) | **Ref**: design — Correctness (US-016) | **Est**: 4h
    - เทสต์ก่อน (fast-check): audit-append-idempotent
  - [ ] 2.2 audit search (admin) + RBAC
    - **Deps**: 2.1 | **Ref**: design — API (US-017) | **Est**: 3h

- [ ] 3. Requests
  - [ ] 3.1 RequestService create + listMine (RBAC ไม่ใช่ admin)
    - **Deps**: 1.1 | **Ref**: design — API (US-013,US-014) | **Est**: 4h
  - [ ] 3.2 admin list + resolve/reject + reply (lifecycle test)
    - **Deps**: 3.1 | **Ref**: design — Correctness (US-015) | **Est**: 4h

- [ ] 4. Web
  - [ ] 4.1 ReportIssuePage + MyRequestsPage
    - **Deps**: 3.1, U4(4.2) | **Ref**: design — web (US-013,US-014) | **Est**: 4h
  - [ ] 4.2 AdminRequestsPage + AdminAuditPage
    - **Deps**: 3.2, 2.2 | **Ref**: design — web (US-015,US-017) | **Est**: 5h

## Task Dependency Graph
```
U0,U3 ─► 1.1 ─┬─► 2.1 ─► 2.2
              └─► 3.1 ─► 3.2
3.1 ─► 4.1 ; 3.2,2.2 ─► 4.2
```
```json
{ "waves": [
  { "wave": 1, "tasks": ["1.1"] },
  { "wave": 2, "tasks": ["2.1", "3.1"] },
  { "wave": 3, "tasks": ["2.2", "3.2", "4.1"] },
  { "wave": 4, "tasks": ["4.2"] }
] }
```

## Execution Waves
| Wave | Phases | Resolved |
|------|--------|----------|
| 1 | 1. Data model | U0,U3 |
| 2 | 2.1 audit, 3.1 request (ownership: audit.service vs request.service) | 1.1 |
| 3 | 2.2 audit search, 3.2 admin requests, 4.1 web report/mine (ownership แยก) | wave 2 |
| 4 | 4.2 admin requests/audit pages | wave 3 |

## Coverage
US-013(3.1,4.1), US-014(3.1,4.1), US-015(3.2,4.2), US-016(2.1), US-017(2.2,4.2).
PBT: audit-append-idempotent(2.1); lifecycle test(3.2)
