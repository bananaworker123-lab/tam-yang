# Implementation Plan: U4 Progress & Tracking

## Overview
Stories US-008..US-012 (หัวใจระบบ). **Strategy**: test-first PBT สำหรับ logic วิกฤต (due-state, transition, isolation)

## Tasks

- [ ] 1. Data model
  - [ ] 1.1 Prisma Progress + constraints/indexes + migration
    - **Deps**: U0(2.1), U2(1.1), U3(1.1) | **Ref**: design — Data Model | **Est**: 2h

- [ ] 2. Pure logic (test-first / PBT)
  - [ ] 2.1 due-state.ts + PBT (due-state-rule)
    - **Deps**: U0(3.1) | **Ref**: design — Correctness (US-012) | **Est**: 4h
    - เทสต์ก่อน (fast-check): submitted→none; >due→overdue; ==due→dueToday; 1-2วันก่อน→near
  - [ ] 2.2 status transition helper + PBT (status-transition-free)
    - **Deps**: U0(3.1) | **Ref**: design — Correctness (US-008) | **Est**: 2h

- [ ] 3. Progress service (test-first scope)
  - [ ] 3.1 listForFamily + lazy create + family scope (PBT family-isolation)
    - **Deps**: 1.1, U2,U3 | **Ref**: design — Correctness (US-010) | **Est**: 5h
    - เทสต์ก่อน: cross-family → 403 (random)
  - [ ] 3.2 updateStatus + perms (parent/child) + child-own-only (PBT) + emit event
    - **Deps**: 3.1, 2.2 | **Ref**: design — Correctness (US-009) | **Est**: 5h
    - เทสต์ก่อน: child-own-only
  - [ ] 3.3 subscribe family.member.removed (ลบ progress) + assignment.changed
    - **Deps**: 3.1 | **Ref**: design — Architecture | **Est**: 2h

- [ ] 4. Web
  - [ ] 4.1 DashboardPage (child tabs, summary, list + StatusPill + dueState colors)
    - **Deps**: 3.1, 2.1, U1(2.1) | **Ref**: design — web (US-008,US-009,US-012) | **Est**: 6h
  - [ ] 4.2 AssignmentDetailPage (detail + เปลี่ยนสถานะ + ปุ่มแจ้งแอดมิน)
    - **Deps**: 3.2 | **Ref**: design — web (US-011) | **Est**: 3h

## Task Dependency Graph
```
U0,U2,U3 ─► 1.1 ─► 3.1 ─┬─► 3.2 ─► 4.2
                        └─► 3.3
2.1, 2.2 (after U0 3.1) ─► 3.2 ; 2.1 ─► 4.1 ; 3.1 ─► 4.1
```
```json
{ "waves": [
  { "wave": 1, "tasks": ["1.1", "2.1", "2.2"] },
  { "wave": 2, "tasks": ["3.1"] },
  { "wave": 3, "tasks": ["3.2", "3.3"] },
  { "wave": 4, "tasks": ["4.1", "4.2"] }
] }
```

## Execution Waves
| Wave | Phases | Resolved |
|------|--------|----------|
| 1 | 1.1 model, 2.1/2.2 pure logic (ownership: prisma vs lib) | U0,U2,U3 |
| 2 | 3.1 progress service + isolation | wave 1 |
| 3 | 3.2 update perms, 3.3 subscribers | wave 2 |
| 4 | 4.1 Dashboard, 4.2 Detail (ownership แยกไฟล์) | wave 3 |

## Coverage
US-008(3.2,4.1), US-009(3.2,4.1), US-010(3.1), US-011(4.2), US-012(2.1,4.1).
PBT: due-state-rule(2.1), status-transition-free(2.2), family-isolation(3.1), child-own-only(3.2)
