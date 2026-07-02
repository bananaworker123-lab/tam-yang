# Implementation Plan: U1 Identity & Access

## Overview
Stories US-001, US-002. ต่อยอด auth foundation จาก U0
**Strategy**: vertical slice (login → profile); test-first สำหรับ upsert
**Estimates**: ชั่วโมง

---

## Tasks

- [ ] 1. User model + identity module
  - [ ] 1.1 Prisma User model + migration (schema identity)
    - **Deps**: U0 (2.1) | **Ref**: design — Data Model | **Est**: 2h
  - [ ] 1.2 UserService.upsertFromGoogle + getProfile (test-first)
    - **Deps**: 1.1 | **Ref**: design — Correctness (upsert-idempotent) | **Est**: 4h
    - เทสต์ก่อน: upsert ด้วย google_sub เดิมไม่สร้างซ้ำ
  - [ ] 1.3 เชื่อม OAuth callback → upsertFromGoogle; ขยาย `/me` (onboardingComplete, profile)
    - **Deps**: 1.2, U0(5.1) | **Ref**: design — API | **Est**: 4h

- [ ] 2. Web auth flow
  - [ ] 2.1 AuthProvider + useAuth (TanStack Query เรียก /me)
    - **Deps**: 1.3 | **Ref**: design — AuthProvider | **Est**: 3h
  - [ ] 2.2 LoginPage + routing (onboarding/home ตาม onboardingComplete)
    - **Deps**: 2.1 | **Ref**: design — LoginPage (US-001) | **Est**: 3h
    - component test: ปุ่ม Google → redirect; redirect ตามสถานะ
  - [ ] 2.3 ProfilePage + logout
    - **Deps**: 2.1 | **Ref**: design — ProfilePage (US-002) | **Est**: 3h

---

## Task Dependency Graph
```
U0 ─► 1.1 ─► 1.2 ─► 1.3 ─► 2.1 ─┬─► 2.2
                                 └─► 2.3
```
```json
{ "waves": [
  { "wave": 1, "tasks": ["1.1"] },
  { "wave": 2, "tasks": ["1.2"] },
  { "wave": 3, "tasks": ["1.3"] },
  { "wave": 4, "tasks": ["2.1"] },
  { "wave": 5, "tasks": ["2.2", "2.3"] }
] }
```

## Execution Waves
| Wave | Phases | Resolved |
|------|--------|----------|
| 1-3 | 1. User model + identity (sequential) | U0 |
| 4 | 2.1 AuthProvider | 1.3 |
| 5 | 2.2 LoginPage, 2.3 ProfilePage (file ownership แยก: Login.tsx vs Profile.tsx) | 2.1 |

## Coverage
US-001 (1.x, 2.1, 2.2), US-002 (2.3, 1.3). PBT: upsert-idempotent (1.2)
