# Implementation Plan: U2 Family & Membership

## Overview
Stories US-003, US-004, US-005. **Strategy**: vertical slice + test-first สำหรับกฎ invite/child

## Tasks

- [ ] 1. Data model
  - [ ] 1.1 Prisma Family, Membership, Invite + constraints + migration
    - **Deps**: U0(2.1), U1(1.1) | **Ref**: design — Data Model | **Est**: 3h
    - unique child-1-family; unique(family,user); invite token unique

- [ ] 2. Family core
  - [ ] 2.1 FamilyService create + list members (RBAC)
    - **Deps**: 1.1 | **Ref**: design — API (US-003,US-005) | **Est**: 4h
  - [ ] 2.2 removeMember/cancelInvite + emit family.member.removed
    - **Deps**: 2.1 | **Ref**: design — API (US-005) | **Est**: 3h

- [ ] 3. Invite flow (test-first)
  - [ ] 3.1 InviteService create + email send (mock-first)
    - **Deps**: 1.1 | **Ref**: design — InviteService (US-004) | **Est**: 4h
  - [ ] 3.2 acceptInvite + verify email match + child-1-family (PBT)
    - **Deps**: 3.1, U1(1.3) | **Ref**: design — Correctness | **Est**: 5h
    - เทสต์ก่อน (fast-check): invite-email-match, child-single-family

- [ ] 4. Web
  - [ ] 4.1 Onboarding + CreateFamily
    - **Deps**: 2.1, U1(2.1) | **Ref**: design — web (US-003) | **Est**: 4h
  - [ ] 4.2 FamilyManagement (members, invite, remove, สถานะคำเชิญ)
    - **Deps**: 2.2, 3.1 | **Ref**: design — web (US-004,US-005) | **Est**: 4h

## Task Dependency Graph
```
U0,U1 ─► 1.1 ─┬─► 2.1 ─► 2.2 ─► 4.2
              └─► 3.1 ─► 3.2
2.1 ─► 4.1 ;  3.1 ─► 4.2
```
```json
{ "waves": [
  { "wave": 1, "tasks": ["1.1"] },
  { "wave": 2, "tasks": ["2.1", "3.1"] },
  { "wave": 3, "tasks": ["2.2", "3.2"] },
  { "wave": 4, "tasks": ["4.1", "4.2"] }
] }
```

## Execution Waves
| Wave | Phases | Resolved |
|------|--------|----------|
| 1 | 1. Data model | U0,U1 |
| 2 | 2.1 family core, 3.1 invite create (ownership: family.service vs invite.service) | 1.1 |
| 3 | 2.2 remove, 3.2 accept+PBT | wave 2 |
| 4 | 4.1 Onboarding/CreateFamily, 4.2 FamilyManagement (ownership แยกไฟล์) | wave 3 |

## Coverage
US-003(1.1,2.1,4.1), US-004(3.x,4.2), US-005(2.2,4.2). PBT: invite-email-match, child-single-family (3.2)
